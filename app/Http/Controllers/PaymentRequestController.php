<?php

namespace App\Http\Controllers;

use App\Models\PaymentRequest;
use App\Models\Shipment;
use App\Models\Document;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Controller para Gestão de Solicitações de Pagamento
 * Workflow: Operações → Finanças → Operações
 *
 * @author Arnaldo Tomo
 */
class PaymentRequestController extends Controller
{
    public function approvalsDashboard()
    {
        $pendingRequests = PaymentRequest::with([
            'shipment',
            'requester',
            'quotationDocument'
        ])
            ->where('status', 'pending')
            ->latest()
            ->get();

        $stats = [
            'pending_count' => $pendingRequests->count(),
            'total_pending_amount' => $pendingRequests->sum('amount'),
            'approved_today' => PaymentRequest::where('status', 'approved')
                ->whereDate('approved_at', today())
                ->count(),
            'average_amount' => $pendingRequests->avg('amount') ?? 0,
            'urgent_count' => $pendingRequests->filter(function ($req) {
                return $req->created_at->diffInDays(now()) > 2;
            })->count(),
        ];

        // Adicionar days_pending em cada request
        $pendingRequests->each(function ($request) {
            $request->days_pending = $request->created_at->diffInDays(now());
        });

        return inertia::render('Approvals/Dashboard', [
            'pendingRequests' => $pendingRequests,
            'stats' => $stats,
        ]);
    }
    // ========================================
    // VISUALIZAÇÕES
    // ========================================

    /**
     * Dashboard de Finanças - Visão geral
     */
    public function financeDashboard()
    {
        $stats = [
            'pending_approval' => PaymentRequest::pending()->count(),
            'approved' => PaymentRequest::approved()->count(),
            'in_payment' => PaymentRequest::inPayment()->count(),
            'paid_today' => PaymentRequest::paid()
                ->whereDate('paid_at', today())
                ->count(),
            'total_pending_amount' => PaymentRequest::pending()->sum('amount'),
            'total_approved_amount' => PaymentRequest::approved()->sum('amount'),
        ];

        $recentRequests = PaymentRequest::with([
            'shipment.client',
            'requester',
            'quotationDocument'
        ])
            ->awaitingFinance()
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('Finance/Dashboard', [
            'stats' => $stats,
            'recentRequests' => $recentRequests,
        ]);
    }

    /**
     * Lista de solicitações pendentes (Finanças)
     */
    public function pendingRequests(Request $request)
    {
        $query = PaymentRequest::with([
            'shipment.client',
            'shipment.shippingLine',
            'requester',
            'quotationDocument'
        ])
            ->whereIn('status', ['approved', 'in_payment']);

        // Filtros
        if ($request->has('phase')) {
            $query->forPhase($request->phase);
        }

        if ($request->has('search')) {
            $query->whereHas('shipment', function ($q) use ($request) {
                $q->where('reference_number', 'like', "%{$request->search}%")
                    ->orWhere('bl_number', 'like', "%{$request->search}%");
            });
        }

        $requests = $query->latest()->paginate(20);

        return Inertia::render('Finance/PendingRequests', [
            'requests' => $requests,
            'filters' => $request->only(['phase', 'search']),
        ]);
    }

    /**
     * Lista de pagamentos realizados (Histórico)
     */
    public function paymentsHistory(Request $request)
    {
        $query = PaymentRequest::with([
            'shipment.client',
            'requester',
            'payer',
            'paymentProof',
            'receiptDocument'
        ])
            ->paid();

        if ($request->has('date_from')) {
            $query->whereDate('paid_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('paid_at', '<=', $request->date_to);
        }

        $payments = $query->latest('paid_at')->paginate(20);

        $totalPaid = $query->sum('amount');

        return Inertia::render('Finance/Payments', [
            'payments' => $payments,
            'totalPaid' => $totalPaid,
            'filters' => $request->only(['date_from', 'date_to']),
        ]);
    }

    // ========================================
    // OPERAÇÕES - CRIAR SOLICITAÇÃO
    // ========================================

    /**
     * Criar nova solicitação de pagamento (Operações)
     */
    public function store(Request $request, Shipment $shipment)
    {
        $validated = $request->validate([
            'phase' => 'required|string',
            'request_type' => 'required|string',
            'payee' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|string|size:3',
            'description' => 'required|string',
            'quotation_document' => 'required|file|max:10240', // Cotação obrigatória
        ]);

        try {
            DB::beginTransaction();

            // 1. Upload da cotação
            $quotationPath = $request->file('quotation_document')
                ->store("documents/quotations/{$shipment->id}", 'public');

            $quotationDoc = Document::create([
                'shipment_id' => $shipment->id,
                'type' => 'quotation',
                'name' => $request->file('quotation_document')->getClientOriginalName(),
                'path' => $quotationPath,
                'size' => $request->file('quotation_document')->getSize(),
                'uploaded_by' => auth()->id(),
            ]);

            // 2. Criar solicitação
            $paymentRequest = PaymentRequest::create([
                'shipment_id' => $shipment->id,
                'phase' => $validated['phase'],
                'request_type' => $validated['request_type'],
                'payee' => $validated['payee'],
                'amount' => $validated['amount'],
                'currency' => $validated['currency'],
                'description' => $validated['description'],
                'status' => 'pending',
                'requested_by' => auth()->id(),
                'quotation_document_id' => $quotationDoc->id,
            ]);

            DB::commit();

            // 3. Notificar gestores para aprovação
            // TODO: Implementar notificação

            return back()->with('success', 'Solicitação de pagamento enviada para aprovação!');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro ao criar solicitação de pagamento', [
                'error' => $e->getMessage(),
                'shipment_id' => $shipment->id,
            ]);

            return back()->withErrors([
                'error' => 'Erro ao criar solicitação: ' . $e->getMessage()
            ]);
        }
    }

    // ========================================
    // GESTOR - APROVAR/REJEITAR
    // ========================================

    /**
     * Aprovar solicitação (Gestor/Admin)
     */
    public function approve(Request $request, PaymentRequest $paymentRequest)
    {
        if (!auth()->user()->isGestor()) {
            abort(403, 'Sem permissão para aprovar');
        }

        $validated = $request->validate([
            'notes' => 'nullable|string|max:500',
        ]);

        if ($paymentRequest->approve(auth()->id(), $validated['notes'] ?? null)) {
            return back()->with('success', 'Solicitação aprovada! Finanças foi notificado.');
        }

        return back()->withErrors(['error' => 'Não foi possível aprovar']);
    }

    /**
     * Rejeitar solicitação
     */
    public function reject(Request $request, PaymentRequest $paymentRequest)
    {
        if (!auth()->user()->isGestor()) {
            abort(403, 'Sem permissão para rejeitar');
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        if ($paymentRequest->reject(auth()->id(), $validated['reason'])) {
            return back()->with('success', 'Solicitação rejeitada.');
        }

        return back()->withErrors(['error' => 'Não foi possível rejeitar']);
    }

    // ========================================
    // FINANÇAS - PROCESSAR PAGAMENTO
    // ========================================

    /**
     * Iniciar processo de pagamento (Finanças)
     */
    public function startPayment(PaymentRequest $paymentRequest)
    {
        if (!auth()->user()->isFinance()) {
            abort(403, 'Apenas departamento financeiro');
        }

        if ($paymentRequest->startPayment(auth()->id())) {
            return back()->with('success', 'Pagamento em processamento.');
        }

        return back()->withErrors(['error' => 'Não foi possível iniciar pagamento']);
    }

    /**
     * Confirmar pagamento com comprovativo (Finanças)
     */
    public function confirmPayment(Request $request, PaymentRequest $paymentRequest)
    {
        if (!auth()->user()->isFinance()) {
            abort(403, 'Apenas departamento financeiro');
        }

        $validated = $request->validate([
            'payment_proof' => 'required|file|max:10240',
            'payment_date' => 'required|date',
            'reference' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            // 1. Upload do comprovativo
            $proofPath = $request->file('payment_proof')
                ->store("documents/payments/{$paymentRequest->shipment_id}", 'public');

            $proofDoc = Document::create([
                'shipment_id' => $paymentRequest->shipment_id,
                'type' => 'payment_proof',
                'name' => 'Comprovativo - ' . $validated['payment_date'],
                'path' => $proofPath,
                'size' => $request->file('payment_proof')->getSize(),
                'uploaded_by' => auth()->id(),
                'metadata' => [
                    'payment_date' => $validated['payment_date'],
                    'reference' => $validated['reference'] ?? null,
                ],
            ]);

            // 2. Confirmar pagamento
            $paymentRequest->confirmPayment($proofDoc->id);


            // 🆕 3. ATUALIZAR O SHIPMENT (NOVO!)
            $this->updateShipmentAfterPayment($paymentRequest);

            DB::commit();

            return back()->with('success', 'Pagamento confirmado! Operações foi notificado.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors([
                'error' => 'Erro ao confirmar pagamento: ' . $e->getMessage()
            ]);
        }
    }


    /**
 * 🆕 Atualizar shipment após confirmação de pagamento
 */
protected function updateShipmentAfterPayment(PaymentRequest $paymentRequest)
{
    $shipment = $paymentRequest->shipment;
    $phase = $paymentRequest->phase;

    // Mapear fase → status do shipment
    $statusMap = [
        1 => 'shipping_paid',           // Coleta Dispersa
        2 => 'legalization_paid',       // Legalização
        3 => 'customs_paid',            // Alfândegas
        4 => 'cornelder_paid',          // Cornelder
        5 => 'taxation_paid',           // Taxação
    ];

    if (isset($statusMap[$phase])) {
        $shipment->update([
            'status' => $statusMap[$phase],
        ]);

        // Opcionalmente, completar a fase automaticamente
        // $this->completePhaseIfReady($shipment, $phase);
    }
}
    /**
     * Anexar recibo do fornecedor (Operações)
     */
    public function attachReceipt(Request $request, PaymentRequest $paymentRequest)
    {
        $validated = $request->validate([
            'receipt' => 'required|file|max:10240',
            'receipt_date' => 'required|date',
        ]);

        try {
            DB::beginTransaction();

            // Upload do recibo
            $receiptPath = $request->file('receipt')
                ->store("documents/receipts/{$paymentRequest->shipment_id}", 'public');

            $receiptDoc = Document::create([
                'shipment_id' => $paymentRequest->shipment_id,
                'type' => 'receipt',
                'name' => 'Recibo - ' . $validated['receipt_date'],
                'path' => $receiptPath,
                'size' => $request->file('receipt')->getSize(),
                'uploaded_by' => auth()->id(),
                'metadata' => [
                    'receipt_date' => $validated['receipt_date'],
                ],
            ]);

            $paymentRequest->attachReceipt($receiptDoc->id);

            DB::commit();

            return back()->with('success', 'Recibo anexado! Ciclo de pagamento completo.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors([
                'error' => 'Erro ao anexar recibo: ' . $e->getMessage()
            ]);
        }
    }

    // ========================================
    // CANCELAR SOLICITAÇÃO
    // ========================================

    /**
     * Cancelar solicitação (apenas quem criou)
     */
    public function cancel(PaymentRequest $paymentRequest)
    {
        if ($paymentRequest->requested_by !== auth()->id()) {
            abort(403, 'Apenas quem criou pode cancelar');
        }

        if ($paymentRequest->status !== 'pending') {
            return back()->withErrors(['error' => 'Apenas solicitações pendentes podem ser canceladas']);
        }

        $paymentRequest->update(['status' => 'cancelled']);

        return back()->with('success', 'Solicitação cancelada.');
    }
}
