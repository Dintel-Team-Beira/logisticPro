<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\ShipmentStage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

/**
 * OperationsController
 *
 * Controller para as 7 fases de operações usando shipment_stages
 * SEM necessidade de coluna current_phase
 *
 * @author Arnaldo Tomo
 */
class OperationsController extends Controller
{
    /**
     * FASE 1: Coleta de Dispersa
     * RF-004, RF-005, RF-006
     *
     * @return \Inertia\Response
     */
    public function coletaDispersa(Request $request)
    {
        // Query usando scope inStage
        $query = Shipment::with([
                'client',
                'shipping_line',
                'documents',
                'stages' => function($q) {
                    $q->where('stage', 'coleta_dispersa');
                }
            ])
            ->inStage('coleta_dispersa'); // Usa o scope!

        // Aplicar filtros
        if ($request->has('search')) {
            $query->search($request->search);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Paginação
        $shipments = $query->latest()->paginate(15);

        // Adicionar current_phase para cada shipment (via accessor)
        $shipments->getCollection()->transform(function ($shipment) {
            $shipment->current_phase = $shipment->current_phase;
            return $shipment;
        });

        // Estatísticas da fase
        $stats = [
            'total' => Shipment::inStage('coleta_dispersa')->count(),

            'awaiting_quotation' => Shipment::inStage('coleta_dispersa')
                ->where('quotation_status', 'pending')
                ->count(),

            'quotation_received' => Shipment::inStage('coleta_dispersa')
                ->where('quotation_status', 'received')
                ->count(),

            'ready_to_advance' => Shipment::inStage('coleta_dispersa')
                ->where('payment_status', 'paid')
                ->whereHas('documents', function($q) {
                    $q->where('type', 'bl');
                })
                ->count(),
        ];

        return Inertia::render('Operations/ColetaDispersa', [
            'shipments' => $shipments,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    /**
     * FASE 2: Legalização
     * RF-007, RF-008
     *
     * @return \Inertia\Response
     */
    public function legalizacao(Request $request)
    {
        $query = Shipment::with([
                'client',
                'shipping_line',
                'documents',
                'stages' => function($q) {
                    $q->where('stage', 'legalizacao');
                }
            ])
            ->inStage('legalizacao');

        if ($request->has('search')) {
            $query->search($request->search);
        }

        $shipments = $query->latest()->paginate(15);

        // Adicionar current_phase
        $shipments->getCollection()->transform(function ($shipment) {
            $shipment->current_phase = $shipment->current_phase;
            return $shipment;
        });

        $stats = [
            'total' => Shipment::inStage('legalizacao')->count(),

            'awaiting_stamp' => Shipment::inStage('legalizacao')
                ->whereDoesntHave('documents', function($q) {
                    $q->where('type', 'bl')
                      ->whereJsonContains('metadata->stamped', true);
                })
                ->count(),

            'bl_stamped' => Shipment::inStage('legalizacao')
                ->whereHas('documents', function($q) {
                    $q->where('type', 'bl')
                      ->whereJsonContains('metadata->stamped', true);
                })
                ->count(),

            'do_issued' => Shipment::inStage('legalizacao')
                ->whereHas('documents', function($q) {
                    $q->where('type', 'delivery_order');
                })
                ->count(),
        ];

        return Inertia::render('Operations/Legalizacao', [
            'shipments' => $shipments,
            'stats' => $stats
        ]);
    }

    /**
     * FASE 3: Alfândegas
     * RF-009, RF-010, RF-011, RF-012
     *
     * @return \Inertia\Response
     */
    public function alfandegas(Request $request)
    {
        $query = Shipment::with([
                'client',
                'shipping_line',
                'documents',
                'stages' => function($q) {
                    $q->where('stage', 'alfandegas');
                }
            ])
            ->inStage('alfandegas');

        if ($request->has('search')) {
            $query->search($request->search);
        }

        $shipments = $query->latest()->paginate(15);

        // Adicionar current_phase
        $shipments->getCollection()->transform(function ($shipment) {
            $shipment->current_phase = $shipment->current_phase;
            return $shipment;
        });

        $stats = [
            'total' => Shipment::inStage('alfandegas')->count(),

            'submitted' => Shipment::inStage('alfandegas')
                ->where('customs_status', 'submitted')
                ->count(),

            'awaiting_tax' => Shipment::inStage('alfandegas')
                ->where('customs_status', 'submitted')
                ->whereDoesntHave('documents', function($q) {
                    $q->where('type', 'aviso');
                })
                ->count(),

            'authorized' => Shipment::inStage('alfandegas')
                ->where('customs_status', 'authorized')
                ->count(),

            // Processos com prazo vencendo
            'overdue' => Shipment::inStage('alfandegas')
                ->whereNotNull('customs_deadline')
                ->where('customs_deadline', '<=', now()->addDays(3))
                ->count(),
        ];

        return Inertia::render('Operations/Alfandegas', [
            'shipments' => $shipments,
            'stats' => $stats
        ]);
    }

    /**
     * FASE 4: Cornelder
     * RF-013, RF-014, RF-015
     *
     * ⚠️ ATENÇÃO: Monitor de storage crítico ativo!
     *
     * @return \Inertia\Response
     */
    public function cornelder(Request $request)
    {
        $query = Shipment::with([
                'client',
                'shipping_line',
                'documents',
                'stages' => function($q) {
                    $q->where('stage', 'cornelder');
                }
            ])
            ->inStage('cornelder');

        if ($request->has('search')) {
            $query->search($request->search);
        }

        $shipments = $query->latest()->paginate(15);

        // Calcular storage para cada shipment
        $shipments->getCollection()->transform(function ($shipment) {
            // Usar accessors do Model
            $shipment->current_phase = $shipment->current_phase;
            $shipment->storage_days = $shipment->storage_days;
            $shipment->days_to_storage_deadline = $shipment->days_to_storage_deadline;
            $shipment->storage_alert = $shipment->is_storage_critical;

            return $shipment;
        });

        // Calcular containers com storage crítico
        $criticalShipments = Shipment::inStage('cornelder')
            ->whereNotNull('arrival_date')
            ->with('shippingLine')
            ->get()
            ->filter(function($shipment) {
                return $shipment->is_storage_critical;
            });

        $stats = [
            'total' => Shipment::inStage('cornelder')->count(),

            'critical_storage' => $criticalShipments->count(),

            'awaiting_payment' => Shipment::inStage('cornelder')
                ->where('cornelder_payment_status', 'pending')
                ->count(),

            'ready' => Shipment::inStage('cornelder')
                ->where('cornelder_payment_status', 'paid')
                ->whereHas('documents', function($q) {
                    $q->where('type', 'termo');
                })
                ->count(),
        ];

        return Inertia::render('Operations/Cornelder', [
            'shipments' => $shipments,
            'stats' => $stats
        ]);
    }

    /**
     * FASE 5: Taxação
     * RF-016, RF-017
     *
     * @return \Inertia\Response
     */
    public function taxacao(Request $request)
    {
        $query = Shipment::with([
                'client',
                'shipping_line',
                'documents',
                'stages' => function($q) {
                    $q->where('stage', 'taxacao');
                }
            ])
            ->inStage('taxacao');

        if ($request->has('search')) {
            $query->search($request->search);
        }

        $shipments = $query->latest()->paginate(15);

        // Adicionar current_phase
        $shipments->getCollection()->transform(function ($shipment) {
            $shipment->current_phase = $shipment->current_phase;
            return $shipment;
        });

        $stats = [
            'total' => Shipment::inStage('taxacao')->count(),

            'awaiting_sad' => Shipment::inStage('taxacao')
                ->whereDoesntHave('documents', function($q) {
                    $q->where('type', 'sad');
                })
                ->count(),

            'sad_issued' => Shipment::inStage('taxacao')
                ->whereHas('documents', function($q) {
                    $q->where('type', 'sad');
                })
                ->count(),

            'released' => Shipment::inStage('taxacao')
                ->whereHas('documents', function($q) {
                    $q->where('type', 'sad');
                })
                ->whereHas('documents', function($q) {
                    $q->where('type', 'delivery_order');
                })
                ->count(),
        ];

        return Inertia::render('Operations/Taxacao', [
            'shipments' => $shipments,
            'stats' => $stats
        ]);
    }

    /**
     * FASE 6: Faturação
     * RF-020, RF-021, RF-022, RF-023, RF-024
     *
     * Nota: Faturação não usa shipment_stages, usa status do shipment
     *
     * @return \Inertia\Response
     */
    public function faturacao(Request $request)
    {
        // Faturação é identificada por ter completado taxação
        // e estar em processo de faturação
        $query = Shipment::with([
                'client',
                'shipping_line',
                'documents',
                'clientInvoice'
            ])
            ->completedStage('taxacao') // Completou taxação
            ->where(function($q) {
                $q->whereNull('client_invoice_id') // Ainda não faturado
                  ->orWhere('client_payment_status', '!=', 'paid'); // Ou não pago
            });

        if ($request->has('search')) {
            $query->search($request->search);
        }

        $shipments = $query->latest()->paginate(15);

        // Calcular custos para cada shipment
        $shipments->getCollection()->transform(function ($shipment) {
            $shipment->freight_cost = $shipment->freight_cost ?? 0;
            $shipment->customs_cost = $shipment->customs_cost ?? 0;
            $shipment->cornelder_cost = $shipment->cornelder_cost ?? 0;
            $shipment->other_costs = $shipment->other_costs ?? 0;

            $shipment->total_cost = $shipment->freight_cost +
                                   $shipment->customs_cost +
                                   $shipment->cornelder_cost +
                                   $shipment->other_costs;

            $shipment->profit_margin = $shipment->profit_margin ?? 15;
            $shipment->total_revenue = $shipment->total_cost * (1 + $shipment->profit_margin / 100);

            $shipment->current_phase = 6;

            return $shipment;
        });

        $baseQuery = Shipment::completedStage('taxacao');

        $stats = [
            'total' => $baseQuery->count(),

            'awaiting_calc' => $baseQuery
                ->whereNull('total_cost')
                ->count(),

            'invoice_generated' => $baseQuery
                ->whereNotNull('client_invoice_id')
                ->count(),

            'paid' => $baseQuery
                ->where('client_payment_status', 'paid')
                ->count(),
        ];

        return Inertia::render('Operations/Faturacao', [
            'shipments' => $shipments,
            'stats' => $stats
        ]);
    }

    /**
     * FASE 7: POD (Proof of Delivery)
     * RF-025
     *
     * @return \Inertia\Response
     */
    public function pod(Request $request)
    {
        // POD é identificado por ter invoice paga e aguardar devolução
        $query = Shipment::with([
                'client',
                'shipping_line',
                'documents'
            ])
            ->where('client_payment_status', 'paid')
            ->where('status', '!=', 'completed');

        if ($request->has('search')) {
            $query->search($request->search);
        }

        $shipments = $query->latest()->paginate(15);

        // Calcular tempo total
        $shipments->getCollection()->transform(function ($shipment) {
            $shipment->days_elapsed = $shipment->days_elapsed;
            $shipment->current_phase = 7;
            return $shipment;
        });

        $baseQuery = Shipment::where('client_payment_status', 'paid');

        $stats = [
            'total' => $baseQuery->count(),

            'awaiting_return' => $baseQuery
                ->where('status', 'active')
                ->whereDoesntHave('documents', function($q) {
                    $q->where('type', 'receipt')
                      ->where('stage', 'pod');
                })
                ->count(),

            'returned' => $baseQuery
                ->whereHas('documents', function($q) {
                    $q->where('type', 'receipt')
                      ->where('stage', 'pod');
                })
                ->count(),

            'completed' => $baseQuery
                ->where('status', 'completed')
                ->count(),
        ];

        return Inertia::render('Operations/POD', [
            'shipments' => $shipments,
            'stats' => $stats
        ]);
    }

    // ========================================
    // OPERAÇÕES DE EXPORTAÇÃO (7 FASES)
    // ========================================

    /**
     * EXPORTAÇÃO - FASE 1: Preparação de Documentos
     */
    public function exportPreparacao(Request $request)
    {
        $query = Shipment::with(['client', 'shippingLine', 'documents', 'stages'])
            ->where('type', 'export')
            ->inStage('preparacao_documentos');

        if ($request->has('search')) {
            $query->search($request->search);
        }

        $shipments = $query->latest()->paginate(15);

        $stats = [
            'total' => Shipment::where('type', 'export')->inStage('preparacao_documentos')->count(),
            'awaiting_documents' => Shipment::where('type', 'export')
                ->inStage('preparacao_documentos')
                ->where('exp_document_prep_status', 'pending')->count(),
            'documents_ready' => Shipment::where('type', 'export')
                ->inStage('preparacao_documentos')
                ->where('exp_document_prep_status', 'completed')->count(),
            'ready_to_advance' => Shipment::where('type', 'export')
                ->inStage('preparacao_documentos')
                ->where('exp_document_prep_status', 'completed')->count(),
        ];

        return Inertia::render('Operations/Export/PreparacaoDocumentos', [
            'shipments' => $shipments,
            'stats' => $stats,
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * EXPORTAÇÃO - FASE 2: Booking
     */
    public function exportBooking(Request $request)
    {
        $query = Shipment::with(['client', 'shippingLine', 'stages'])
            ->where('type', 'export')
            ->inStage('booking');

        $shipments = $query->latest()->paginate(15);

        $stats = [
            'total' => Shipment::where('type', 'export')->inStage('booking')->count(),
            'requested' => Shipment::where('type', 'export')->where('exp_booking_status', 'requested')->count(),
            'confirmed' => Shipment::where('type', 'export')->where('exp_booking_status', 'confirmed')->count(),
            'ready' => Shipment::where('type', 'export')->where('exp_booking_status', 'paid')->count(),
        ];

        return Inertia::render('Operations/Export/Booking', [
            'shipments' => $shipments,
            'stats' => $stats
        ]);
    }

    /**
     * EXPORTAÇÃO - FASE 3: Inspeção e Certificação
     */
    public function exportInspecao(Request $request)
    {
        $query = Shipment::with(['client', 'shippingLine', 'stages'])
            ->where('type', 'export')
            ->inStage('inspecao_certificacao');

        $shipments = $query->latest()->paginate(15);

        $stats = [
            'total' => Shipment::where('type', 'export')->inStage('inspecao_certificacao')->count(),
            'scheduled' => Shipment::where('type', 'export')->where('exp_inspection_status', 'scheduled')->count(),
            'completed' => Shipment::where('type', 'export')->where('exp_inspection_status', 'completed')->count(),
        ];

        return Inertia::render('Operations/Export/InspecaoCertificacao', [
            'shipments' => $shipments,
            'stats' => $stats
        ]);
    }

    /**
     * EXPORTAÇÃO - FASE 4: Despacho Aduaneiro
     */
    public function exportDespacho(Request $request)
    {
        $query = Shipment::with(['client', 'shippingLine', 'stages'])
            ->where('type', 'export')
            ->inStage('despacho_aduaneiro');

        $shipments = $query->latest()->paginate(15);

        $stats = [
            'total' => Shipment::where('type', 'export')->inStage('despacho_aduaneiro')->count(),
            'submitted' => Shipment::where('type', 'export')->where('exp_customs_status', 'submitted')->count(),
            'cleared' => Shipment::where('type', 'export')->where('exp_customs_status', 'cleared')->count(),
        ];

        return Inertia::render('Operations/Export/DespachoAduaneiro', [
            'shipments' => $shipments,
            'stats' => $stats
        ]);
    }

    /**
     * EXPORTAÇÃO - FASE 5: Transporte ao Porto
     */
    public function exportTransporte(Request $request)
    {
        $query = Shipment::with(['client', 'shippingLine', 'stages'])
            ->where('type', 'export')
            ->inStage('transporte_porto');

        $shipments = $query->latest()->paginate(15);

        $stats = [
            'total' => Shipment::where('type', 'export')->inStage('transporte_porto')->count(),
            'in_transit' => Shipment::where('type', 'export')->where('exp_transport_status', 'in_transit')->count(),
            'delivered' => Shipment::where('type', 'export')->where('exp_transport_status', 'delivered')->count(),
        ];

        return Inertia::render('Operations/Export/TransportePorto', [
            'shipments' => $shipments,
            'stats' => $stats
        ]);
    }

    /**
     * EXPORTAÇÃO - FASE 6: Embarque
     */
    public function exportEmbarque(Request $request)
    {
        $query = Shipment::with(['client', 'shippingLine', 'stages'])
            ->where('type', 'export')
            ->inStage('embarque');

        $shipments = $query->latest()->paginate(15);

        $stats = [
            'total' => Shipment::where('type', 'export')->inStage('embarque')->count(),
            'loading' => Shipment::where('type', 'export')->where('exp_loading_status', 'loading')->count(),
            'loaded' => Shipment::where('type', 'export')->where('exp_loading_status', 'loaded')->count(),
        ];

        return Inertia::render('Operations/Export/Embarque', [
            'shipments' => $shipments,
            'stats' => $stats
        ]);
    }

    /**
     * EXPORTAÇÃO - FASE 7: Acompanhamento
     */
    public function exportAcompanhamento(Request $request)
    {
        $query = Shipment::with(['client', 'shippingLine', 'stages'])
            ->where('type', 'export')
            ->inStage('acompanhamento');

        $shipments = $query->latest()->paginate(15);

        $stats = [
            'total' => Shipment::where('type', 'export')->inStage('acompanhamento')->count(),
            'in_transit' => Shipment::where('type', 'export')->where('exp_tracking_status', 'in_transit')->count(),
            'delivered' => Shipment::where('type', 'export')->where('exp_tracking_status', 'delivered')->count(),
        ];

        return Inertia::render('Operations/Export/Acompanhamento', [
            'shipments' => $shipments,
            'stats' => $stats
        ]);
    }

    /**
     * Atualizar status de campo de exportação
     */
    public function updateExportStatus(Request $request, Shipment $shipment)
    {
        $validated = $request->validate([
            'field' => 'required|string',
            'value' => 'nullable',
        ]);

        $shipment->update([
            $validated['field'] => $validated['value']
        ]);

        return back()->with('success', 'Status atualizado!');
    }
}
