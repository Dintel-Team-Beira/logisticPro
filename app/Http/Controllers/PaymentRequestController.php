<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\PaymentRequest;
use App\Models\Shipment;
use App\Models\Document;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Notifications\Notification;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Controller para Gestão de Solicitações de Pagamento
 * Workflow: Operações → Gestor → Finanças → Operações
 *
 * @author Arnaldo Tomo
 */
class PaymentRequestController extends Controller
{
    // ========================================
    // DASHBOARDS
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
     * Dashboard de Aprovações (Para Gestores)
     */
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

        return Inertia::render('Approvals/Dashboard', [
            'pendingRequests' => $pendingRequests,
            'stats' => $stats,
        ]);
    }

    // ========================================
    // LISTAGENS
    // ========================================

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
     * Histórico de Pagamentos
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

    /**
     * Relatórios Financeiros
     */
    public function financialReports(Request $request)
    {

        // dd($request->all());
        // Filtros de data
        $startDate = $request->start_date ?? now()->startOfMonth()->toDateString();
        $endDate = $request->end_date ?? now()->endOfMonth()->toDateString();

        // Estatísticas gerais
        $stats = [
            'total_paid' => PaymentRequest::paid()
                ->whereBetween('paid_at', [$startDate, $endDate])
                ->sum('amount'),
            'total_pending' => PaymentRequest::pending()->sum('amount'),
            'total_approved' => PaymentRequest::approved()->sum('amount'),
            'count_pending' => PaymentRequest::pending()->count(),
            'count_approved' => PaymentRequest::approved()->count(),
            'count_paid' => PaymentRequest::paid()
                ->whereBetween('paid_at', [$startDate, $endDate])
                ->count(),
            'avg_approval_time' => PaymentRequest::whereNotNull('approved_at')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->get()
                ->avg(function ($req) {
                    return $req->created_at->diffInDays($req->approved_at);
                }) ?? 0,
            'avg_payment_time' => PaymentRequest::whereNotNull('paid_at')
                ->whereBetween('approved_at', [$startDate, $endDate])
                ->get()
                ->avg(function ($req) {
                    return $req->approved_at?->diffInDays($req->paid_at) ?? 0;
                }) ?? 0,
        ];

        // Pagamentos por fase
        $paymentsByPhase = PaymentRequest::paid()
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->selectRaw('phase, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('phase')
            ->get()
            ->map(function ($item) {
                $phaseNames = [
                    1 => 'Coleta Dispersa',
                    2 => 'Legalização',
                    3 => 'Alfândegas',
                    4 => 'Cornelder',
                    5 => 'Taxação',
                ];
                return [
                    'phase' => $phaseNames[$item->phase] ?? "Fase {$item->phase}",
                    'count' => $item->count,
                    'total' => $item->total,
                ];
            });

        // Pagamentos por tipo
        $paymentsByType = PaymentRequest::paid()
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->selectRaw('request_type, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('request_type')
            ->get()
            ->map(function ($item) {
                $typeLabels = [
                    'quotation_payment' => 'Pagamento de Cotação',
                    'customs_tax' => 'Taxas Alfandegárias',
                    'storage_fee' => 'Taxa de Armazenamento',
                    'cornelder_fee' => 'Despesas Cornelder',
                    'transport_fee' => 'Frete/Transporte',
                    'other' => 'Outros',
                ];
                return [
                    'type' => $typeLabels[$item->request_type] ?? $item->request_type,
                    'count' => $item->count,
                    'total' => $item->total,
                ];
            });

        // Evolução mensal
        $monthlyData = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthStart = now()->subMonths($i)->startOfMonth();
            $monthEnd = now()->subMonths($i)->endOfMonth();

            $monthlyData[] = [
                'month' => $monthStart->format('M Y'),
                'total' => PaymentRequest::paid()
                    ->whereBetween('paid_at', [$monthStart, $monthEnd])
                    ->sum('amount'),
                'count' => PaymentRequest::paid()
                    ->whereBetween('paid_at', [$monthStart, $monthEnd])
                    ->count(),
            ];
        }

        // Top 10 maiores pagamentos
        $topPayments = PaymentRequest::with(['shipment.client', 'payer'])
            ->paid()
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->orderByDesc('amount')
            ->take(10)
            ->get();

        return Inertia::render('Finance/Reports', [
            'stats' => $stats,
            'paymentsByPhase' => $paymentsByPhase,
            'paymentsByType' => $paymentsByType,
            'monthlyData' => $monthlyData,
            'topPayments' => $topPayments,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
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
            'phase' => 'required|integer|min:1|max:7',
            'request_type' => 'required|string',
            'payee' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|string|size:3',
            'description' => 'required|string',
            'quotation_document' => 'required|file|max:10240',
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
        // if (!auth()->user()->isGestor()) {
        //     abort(403, 'Sem permissão para rejeitar');
        // }


        // dd($paymentRequest);
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

            // 3. Atualizar o Shipment baseado na fase
            $this->updateShipmentPaymentStatus($paymentRequest);

            DB::commit();

            return back()->with('success', 'Pagamento confirmado! Operações foi notificado para anexar o recibo.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors([
                'error' => 'Erro ao confirmar pagamento: ' . $e->getMessage()
            ]);
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
    // HELPERS
    // ========================================

    /**
     * Atualizar status de pagamento no Shipment baseado na fase
     */
    protected function updateShipmentPaymentStatus(PaymentRequest $paymentRequest)
    {
        $shipment = $paymentRequest->shipment;
        $phase = $paymentRequest->phase;
        $requestType = $paymentRequest->request_type;

        switch ($phase) {
            case 1: // Coleta Dispersa
                if ($requestType === 'quotation_payment') {
                    $shipment->update([
                        'payment_status' => 'paid',
                        'quotation_status' => 'paid',
                    ]);
                }
                break;

            case 3: // Alfândegas
                if (in_array($requestType, ['customs_tax', 'other'])) {
                    $shipment->update([
                        'customs_payment_status' => 'paid',
                        'customs_status' => 'payment_completed',
                    ]);
                }
                break;

            case 4: // Cornelder
                if (in_array($requestType, ['cornelder_fee', 'storage_fee'])) {
                    $shipment->update([
                        'cornelder_payment_status' => 'paid',
                        'cornelder_status' => 'paid',
                    ]);
                }
                break;

            case 5: // Taxação
                if ($requestType === 'customs_tax') {
                    $shipment->update([
                        'taxation_status' => 'payment_completed',
                    ]);
                }
                break;
        }

        // Log da atividade
        $shipment->activities()->create([
            'user_id' => auth()->id(),
            'action' => 'payment_confirmed',
            'description' => "Pagamento confirmado na Fase {$phase}: {$requestType}",
        ]);
    }


    public function storeBulk(Request $request, Shipment $shipment)
{

    // dd($request->all());
    // Validação
    $validated = $request->validate([
        'phase' => 'required|integer|between:1,7',
        'requests' => 'required|array|min:1',
        'requests.*.expense_type' => 'required|string',
        'requests.*.payee' => 'required|string',
        'requests.*.amount' => 'required|numeric|min:0',
        'requests.*.currency' => 'required|in:MZN,USD,EUR',
        'requests.*.description' => 'nullable|string',
        'requests.*.quotation_document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
    ]);

    DB::beginTransaction();

    try {
        $createdRequests = [];

        foreach ($validated['requests'] as $index => $requestData) {
            // Upload do documento
            $documentPath = null;
            if ($request->hasFile("requests.{$index}.quotation_document")) {
                $file = $request->file("requests.{$index}.quotation_document");
                $documentPath = $file->store('payment-requests/' . $shipment->id, 'public');
            }

            // Criar a solicitação de pagamento
            $paymentRequest = PaymentRequest::create([
                'shipment_id' => $shipment->id,
                'phase' => $validated['phase'],
                'request_type' => $requestData['expense_type'],
                'payee' => $requestData['payee'],
                'amount' => $requestData['amount'],
                'currency' => $requestData['currency'],
                'description' => $requestData['description'] ?? null,
                'quotation_document' => $documentPath,
                'requested_by' => auth()->id(),
                'status' => 'pending', // Aguardando aprovação
                'created_at' => now(),
            ]);

            $createdRequests[] = $paymentRequest;

            // Registrar atividade
            Activity::create([
                'shipment_id' => $shipment->id,
                'user_id' => auth()->id(),
                'action' => 'payment_request_created',
                'description' => "Solicitação de pagamento criada: {$requestData['expense_type']} - {$requestData['payee']} ({$requestData['amount']} {$requestData['currency']})",
            ]);
        }

        DB::commit();

        // Notificar gestores financeiros
        // $this->notifyFinanceManagers($shipment, $createdRequests);

        return redirect()
            ->back()
            ->with('success', count($createdRequests) . ' solicitação(ões) de pagamento enviada(s) para aprovação!');

    } catch (\Exception $e) {
        DB::rollBack();

        Log::error('Erro ao criar solicitações múltiplas de pagamento', [
            'shipment_id' => $shipment->id,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        return redirect()
            ->back()
            ->withErrors(['error' => 'Erro ao criar solicitações. Por favor, tente novamente.']);
    }
}

/**
 * Notificar gestores financeiros sobre novas solicitações
 *
 * @param Shipment $shipment
 * @param array $requests
 * @return void
 */
private function notifyFinanceManagers(Shipment $shipment, array $requests)
{
    // Buscar usuários com papel de gestor financeiro
    $financeManagers = User::role('finance_manager')->get();

    $totalAmount = collect($requests)->sum('amount');
    $requestCount = count($requests);

    // foreach ($financeManagers as $manager) {
    //     Notification::create([
    //         'user_id' => $manager->id,
    //         'type' => 'payment_request',
    //         'title' => "Nova(s) Solicitação(ões) de Pagamento",
    //         'message' => "{$requestCount} solicitação(ões) de pagamento para o processo {$shipment->reference_number} aguardam aprovação.",
    //         'data' => json_encode([
    //             'shipment_id' => $shipment->id,
    //             'request_count' => $requestCount,
    //             'total_amount' => $totalAmount,
    //         ]),
    //     ]);
    // }
}

}
