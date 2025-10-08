<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\Client;
use App\Models\ShippingLine;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

/**
 * OperationsController
 *
 * Controller principal para as 7 fases de operações de importação
 * Gerencia as views de cada fase do processo
 *
 * @author Arnaldo Tomo
 * @package LogisticaPro
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
        // Query base de shipments na fase 1
        $query = Shipment::with(['client', 'shipping_line', 'documents', 'stages'])
            ->where('current_phase', 1);

        // Filtros
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                  ->orWhere('bl_number', 'like', "%{$search}%")
                  ->orWhere('container_number', 'like', "%{$search}%");
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Paginação
        $shipments = $query->latest()->paginate(15);

        // Estatísticas da fase
        $stats = [
            'total' => Shipment::where('current_phase', 1)->count(),

            'awaiting_quotation' => Shipment::where('current_phase', 1)
                ->where('quotation_status', 'pending')
                ->count(),

            'quotation_received' => Shipment::where('current_phase', 1)
                ->where('quotation_status', 'received')
                ->count(),

            'ready_to_advance' => Shipment::where('current_phase', 1)
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
        $shipments = Shipment::with(['client', 'shipping_line', 'documents'])
            ->where('current_phase', 2)
            ->latest()
            ->paginate(15);

        $stats = [
            'total' => Shipment::where('current_phase', 2)->count(),

            'awaiting_stamp' => Shipment::where('current_phase', 2)
                ->whereDoesntHave('documents', function($q) {
                    $q->where('type', 'bl')
                      ->where('metadata->stamped', true);
                })
                ->count(),

            'bl_stamped' => Shipment::where('current_phase', 2)
                ->whereHas('documents', function($q) {
                    $q->where('type', 'bl')
                      ->where('metadata->stamped', true);
                })
                ->count(),

            'do_issued' => Shipment::where('current_phase', 2)
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
        $shipments = Shipment::with(['client', 'shipping_line', 'documents'])
            ->where('current_phase', 3)
            ->latest()
            ->paginate(15);

        $stats = [
            'total' => Shipment::where('current_phase', 3)->count(),

            'submitted' => Shipment::where('current_phase', 3)
                ->where('customs_status', 'submitted')
                ->count(),

            'awaiting_tax' => Shipment::where('current_phase', 3)
                ->where('customs_status', 'submitted')
                ->whereDoesntHave('documents', function($q) {
                    $q->where('type', 'aviso');
                })
                ->count(),

            'authorized' => Shipment::where('current_phase', 3)
                ->where('customs_status', 'authorized')
                ->count(),

            // Processos com prazo vencendo
            'overdue' => Shipment::where('current_phase', 3)
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
     * ⚠️ ATENÇÃO: Esta fase possui monitor de storage crítico!
     *
     * @return \Inertia\Response
     */
    public function cornelder(Request $request)
    {
        $shipments = Shipment::with(['client', 'shipping_line', 'documents'])
            ->where('current_phase', 4)
            ->latest()
            ->paginate(15);

        // Calcular dias de storage para cada shipment
        $shipments->getCollection()->transform(function ($shipment) {
            // Calcular dias desde a chegada
            if ($shipment->arrival_date) {
                $arrivalDate = \Carbon\Carbon::parse($shipment->arrival_date);
                $shipment->storage_days = $arrivalDate->diffInDays(now());

                // Dias FREE padrão ou da linha
                $freeDays = $shipment->shipping_line->free_storage_days ?? 7;
                $shipment->days_to_storage_deadline = $freeDays - $shipment->storage_days;

                // Alerta se faltam 2 dias ou menos
                $shipment->storage_alert = $shipment->days_to_storage_deadline <= 2;
            }

            return $shipment;
        });

        $stats = [
            'total' => Shipment::where('current_phase', 4)->count(),

            // Containers com storage crítico (≤ 2 dias restantes)
            'critical_storage' => Shipment::where('current_phase', 4)
                ->whereNotNull('arrival_date')
                ->get()
                ->filter(function($shipment) {
                    $freeDays = $shipment->shipping_line->free_storage_days ?? 7;
                    $storageDays = \Carbon\Carbon::parse($shipment->arrival_date)->diffInDays(now());
                    return ($freeDays - $storageDays) <= 2;
                })
                ->count(),

            'awaiting_payment' => Shipment::where('current_phase', 4)
                ->where('cornelder_payment_status', 'pending')
                ->count(),

            'ready' => Shipment::where('current_phase', 4)
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
        $shipments = Shipment::with(['client', 'shipping_line', 'documents'])
            ->where('current_phase', 5)
            ->latest()
            ->paginate(15);

        $stats = [
            'total' => Shipment::where('current_phase', 5)->count(),

            'awaiting_sad' => Shipment::where('current_phase', 5)
                ->whereDoesntHave('documents', function($q) {
                    $q->where('type', 'sad');
                })
                ->count(),

            'sad_issued' => Shipment::where('current_phase', 5)
                ->whereHas('documents', function($q) {
                    $q->where('type', 'sad');
                })
                ->count(),

            'released' => Shipment::where('current_phase', 5)
                ->whereHas('documents', function($q) {
                    $q->where('type', 'sad');
                })
                ->whereHas('documents', function($q) {
                    $q->where('type', 'delivery_order')
                      ->where('metadata->type', 'ido');
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
     * @return \Inertia\Response
     */
    public function faturacao(Request $request)
    {
        $shipments = Shipment::with([
            'client',
            'shipping_line',
            'documents',
            'clientInvoice'
        ])
            ->where('current_phase', 6)
            ->latest()
            ->paginate(15);

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

            return $shipment;
        });

        $stats = [
            'total' => Shipment::where('current_phase', 6)->count(),

            'awaiting_calc' => Shipment::where('current_phase', 6)
                ->whereNull('total_cost')
                ->count(),

            'invoice_generated' => Shipment::where('current_phase', 6)
                ->whereNotNull('client_invoice_id')
                ->count(),

            'paid' => Shipment::where('current_phase', 6)
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
        $shipments = Shipment::with(['client', 'shipping_line', 'documents'])
            ->where('current_phase', 7)
            ->latest()
            ->paginate(15);

        // Calcular tempo total para cada processo
        $shipments->getCollection()->transform(function ($shipment) {
            $startDate = \Carbon\Carbon::parse($shipment->created_at);
            $endDate = $shipment->completed_at
                ? \Carbon\Carbon::parse($shipment->completed_at)
                : now();

            $shipment->days_elapsed = $startDate->diffInDays($endDate);

            return $shipment;
        });

        $stats = [
            'total' => Shipment::where('current_phase', 7)->count(),

            'awaiting_return' => Shipment::where('current_phase', 7)
                ->where('status', 'active')
                ->whereDoesntHave('documents', function($q) {
                    $q->where('type', 'receipt')
                      ->where('stage', 'pod');
                })
                ->count(),

            'returned' => Shipment::where('current_phase', 7)
                ->whereHas('documents', function($q) {
                    $q->where('type', 'receipt')
                      ->where('stage', 'pod');
                })
                ->count(),

            'completed' => Shipment::where('current_phase', 7)
                ->where('status', 'completed')
                ->count(),
        ];

        return Inertia::render('Operations/POD', [
            'shipments' => $shipments,
            'stats' => $stats
        ]);
    }
}
