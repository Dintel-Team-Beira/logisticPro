<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Services\ShipmentWorkflowService;
use App\Enums\DocumentType;
use App\Enums\ShipmentStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Controller para gestão de fases do Shipment
 * Implementa RF-004 até RF-025 do SRS
 */
class ShipmentPhaseController extends Controller
{
    protected ShipmentWorkflowService $workflow;

    public function __construct(ShipmentWorkflowService $workflow)
    {
        $this->workflow = $workflow;
    }

    /**
     * RF-004: Solicitar Cotações (Fase 1)
     */
    public function requestQuotation(Request $request, Shipment $shipment)
    {
        $validated = $request->validate([
            'shipping_lines' => 'required|array',
            'shipping_lines.*' => 'required|exists:shipping_lines,id',
            'message' => 'nullable|string',
        ]);

        // Verificar se BL foi anexado
        if (!$shipment->documents()->where('type', DocumentType::BL_ORIGINAL)->exists()) {
            return back()->withErrors(['document' => 'BL Original deve ser anexado antes de solicitar cotações.']);
        }

        // Transicionar para status de cotação solicitada
        try {
            $this->workflow->transition(
                $shipment,
                ShipmentStatus::COLETA_COTACAO_SOLICITADA,
                auth()->id(),
                'Cotação solicitada para ' . count($validated['shipping_lines']) . ' linhas'
            );

            // Enviar emails para linhas de navegação
            // QuotationRequestJob::dispatch($shipment, $validated['shipping_lines'], $validated['message']);

            return back()->with('success', 'Cotações solicitadas com sucesso!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * RF-005: Registrar Cotação Recebida (Fase 1)
     */
    public function registerQuotation(Request $request, Shipment $shipment)
    {
        $validated = $request->validate([
            'document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'shipping_line_id' => 'required|exists:shipping_lines,id',
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|in:USD,MZN,EUR',
        ]);

        // Upload do documento
        $path = $request->file('document')->store('documents/quotations', 'public');

        // Criar documento
        $shipment->documents()->create([
            'type' => DocumentType::COTACAO_LINHA,
            'name' => 'Cotação - ' . now()->format('d-m-Y'),
            'path' => $path,
            'size' => $request->file('document')->getSize(),
            'uploaded_by' => auth()->id(),
            'metadata' => [
                'shipping_line_id' => $validated['shipping_line_id'],
                'amount' => $validated['amount'],
                'currency' => $validated['currency'],
            ]
        ]);

        // Transicionar status
        try {
            $this->workflow->transition(
                $shipment,
                ShipmentStatus::COLETA_COTACAO_RECEBIDA,
                auth()->id(),
                'Cotação recebida e anexada'
            );

            return back()->with('success', 'Cotação registrada com sucesso!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * RF-006: Registrar Pagamento (Fase 1)
     */
    public function registerPayment(Request $request, Shipment $shipment)
    {
        $validated = $request->validate([
            'proof_of_payment' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'payment_date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'reference' => 'nullable|string',
        ]);

        // Upload do comprovativo
        $path = $request->file('proof_of_payment')->store('documents/payments', 'public');

        $shipment->documents()->create([
            'type' => DocumentType::POP_COLETA,
            'name' => 'Comprovativo de Pagamento - ' . $validated['payment_date'],
            'path' => $path,
            'size' => $request->file('proof_of_payment')->getSize(),
            'uploaded_by' => auth()->id(),
            'metadata' => [
                'payment_date' => $validated['payment_date'],
                'amount' => $validated['amount'],
                'reference' => $validated['reference'],
            ]
        ]);

        // Transicionar
        try {
            $this->workflow->transition(
                $shipment,
                ShipmentStatus::COLETA_PAGAMENTO_ENVIADO,
                auth()->id(),
                'Comprovativo de pagamento anexado'
            );

            return back()->with('success', 'Pagamento registrado com sucesso!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * RF-007: Registrar Recibo (Fase 1)
     */
    public function registerReceipt(Request $request, Shipment $shipment)
    {
        $validated = $request->validate([
            'receipt' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'receipt_date' => 'required|date',
        ]);

        // Upload
        $path = $request->file('receipt')->store('documents/receipts', 'public');

        $shipment->documents()->create([
            'type' => DocumentType::RECIBO_LINHA,
            'name' => 'Recibo - ' . $validated['receipt_date'],
            'path' => $path,
            'size' => $request->file('receipt')->getSize(),
            'uploaded_by' => auth()->id(),
            'metadata' => [
                'receipt_date' => $validated['receipt_date'],
            ]
        ]);

        // Transicionar e concluir Fase 1
        try {
            $this->workflow->transition(
                $shipment,
                ShipmentStatus::COLETA_RECIBO_RECEBIDO,
                auth()->id()
            );

            // Automaticamente concluir fase 1
            $this->workflow->transition(
                $shipment,
                ShipmentStatus::COLETA_CONCLUIDA,
                auth()->id(),
                'Fase 1 (Coleta de Dispersa) concluída automaticamente'
            );

            return back()->with('success', 'Fase 1 concluída! Fase 2 (Legalização) habilitada.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * RF-008: Iniciar Legalização (Fase 2)
     */
    public function startLegalization(Request $request, Shipment $shipment)
    {
        // Validar checklist (RF-008 do SRS)
        $requiredDocs = [
            DocumentType::FATURA_LINHA,
            DocumentType::RECIBO_LINHA,
            DocumentType::BL_ORIGINAL,
            DocumentType::CARTA_ENDOSSO,
        ];

        $attachedDocs = $shipment->documents()->pluck('type')->toArray();

        foreach ($requiredDocs as $docType) {
            if (!in_array($docType, $attachedDocs)) {
                return back()->withErrors([
                    'document' => 'Documento faltando: ' . DocumentType::labels()[$docType]
                ]);
            }
        }

        // Transicionar
        try {
            $this->workflow->transition(
                $shipment,
                ShipmentStatus::LEGALIZACAO_INICIADA,
                auth()->id(),
                'Checklist de legalização completo'
            );

            return back()->with('success', 'Legalização iniciada! Aguardando BL carimbado.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * RF-009: Registrar BL Carimbado (Fase 2)
     */
    public function registerStampedBL(Request $request, Shipment $shipment)
    {
        $validated = $request->validate([
            'stamped_bl' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'observations' => 'nullable|string',
        ]);

        $path = $request->file('stamped_bl')->store('documents/bl', 'public');

        $shipment->documents()->create([
            'type' => DocumentType::BL_CARIMBADO,
            'name' => 'BL Carimbado - ' . now()->format('d-m-Y'),
            'path' => $path,
            'size' => $request->file('stamped_bl')->getSize(),
            'uploaded_by' => auth()->id(),
            'metadata' => [
                'observations' => $validated['observations'],
            ]
        ]);

        try {
            $this->workflow->transition(
                $shipment,
                ShipmentStatus::LEGALIZACAO_BL_CARIMBADO,
                auth()->id(),
                'BL carimbado anexado'
            );

            return back()->with('success', 'BL carimbado registrado! Aguardando Delivery Order.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * RF-010: Registrar Delivery Order (Fase 2)
     */
    public function registerDeliveryOrder(Request $request, Shipment $shipment)
    {
        $validated = $request->validate([
            'delivery_order' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'do_number' => 'required|string',
            'received_date' => 'required|date',
        ]);

        $path = $request->file('delivery_order')->store('documents/do', 'public');

        $shipment->documents()->create([
            'type' => DocumentType::DELIVERY_ORDER,
            'name' => 'DO - ' . $validated['do_number'],
            'path' => $path,
            'size' => $request->file('delivery_order')->getSize(),
            'uploaded_by' => auth()->id(),
            'metadata' => [
                'do_number' => $validated['do_number'],
                'received_date' => $validated['received_date'],
            ]
        ]);

        try {
            $this->workflow->transition(
                $shipment,
                ShipmentStatus::LEGALIZACAO_DO_RECEBIDA,
                auth()->id()
            );

            // Concluir fase 2 automaticamente
            $this->workflow->transition(
                $shipment,
                ShipmentStatus::LEGALIZACAO_CONCLUIDA,
                auth()->id(),
                'Fase 2 (Legalização) concluída'
            );

            return back()->with('success', 'Fase 2 concluída! Fase 3 (Alfândegas) habilitada.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Retorna checklist de documentos
     */
    public function getChecklist(Shipment $shipment)
    {
        $checklist = $this->workflow->getDocumentChecklist($shipment);
        $nextStatus = $this->workflow->getNextStatus($shipment);

        return response()->json([
            'checklist' => $checklist,
            'next_status' => $nextStatus,
            'next_status_label' => ShipmentStatus::labels()[$nextStatus] ?? null,
            'can_proceed' => empty(array_filter($checklist, fn($item) => !$item['attached']))
        ]);
    }

    /**
     * Retorna progresso do shipment
     */
    public function getProgress(Shipment $shipment)
    {
        return response()->json([
            'progress' => $this->workflow->getProgress($shipment),
            'current_phase' => ShipmentStatus::getPhase($shipment->status),
            'current_status' => $shipment->status,
            'current_status_label' => ShipmentStatus::labels()[$shipment->status] ?? null,
        ]);
    }
}
