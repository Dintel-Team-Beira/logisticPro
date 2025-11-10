<?php

namespace App\Http\Controllers\Operations;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransportOperationsController extends Controller
{
    /**
     * FASE 1: Coleta
     * Exibe processos de transporte na fase de coleta
     */
    public function coleta(Request $request)
    {
        $query = Shipment::with(['client', 'shippingLine', 'documents', 'stages'])
            ->where('type', 'transport')
            ->where(function ($q) {
                $q->whereNull('trp_coleta_status')
                  ->orWhere('trp_coleta_status', 'pending')
                  ->orWhere('trp_coleta_status', 'in_transit');
            });

        if ($request->has('search')) {
            $query->search($request->search);
        }

        $shipments = $query->latest()->paginate(15);

        $stats = [
            'total' => Shipment::where('type', 'transport')->count(),
            'pending_coleta' => Shipment::where('type', 'transport')
                ->where('trp_coleta_status', 'pending')->count(),
            'in_transit' => Shipment::where('type', 'transport')
                ->where('trp_coleta_status', 'in_transit')->count(),
            'collected' => Shipment::where('type', 'transport')
                ->where('trp_coleta_status', 'collected')->count(),
        ];

        return Inertia::render('Operations/Transport/Coleta', [
            'shipments' => $shipments,
            'stats' => $stats,
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Atualizar status da coleta
     */
    public function updateColetaStatus(Request $request, Shipment $shipment)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,in_transit,collected',
            'coleta_date' => 'nullable|date',
            'origin_address' => 'nullable|string',
        ]);

        $shipment->update([
            'trp_coleta_status' => $validated['status'],
            'trp_coleta_date' => $validated['coleta_date'] ?? null,
            'trp_origin_address' => $validated['origin_address'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Status de coleta atualizado com sucesso!');
    }

    /**
     * FASE 2: Entrega
     * Exibe processos de transporte na fase de entrega
     */
    public function entrega(Request $request)
    {
        $query = Shipment::with(['client', 'shippingLine', 'documents', 'stages'])
            ->where('type', 'transport')
            ->where('trp_coleta_status', 'collected')
            ->where(function ($q) {
                $q->whereNull('trp_entrega_status')
                  ->orWhere('trp_entrega_status', '!=', 'delivered');
            });

        if ($request->has('search')) {
            $query->search($request->search);
        }

        $shipments = $query->latest()->paginate(15);

        $stats = [
            'total' => Shipment::where('type', 'transport')
                ->where('trp_coleta_status', 'collected')->count(),
            'pending_entrega' => Shipment::where('type', 'transport')
                ->where('trp_coleta_status', 'collected')
                ->where('trp_entrega_status', 'pending')->count(),
            'in_transit' => Shipment::where('type', 'transport')
                ->where('trp_coleta_status', 'collected')
                ->where('trp_entrega_status', 'in_transit')->count(),
            'delivered' => Shipment::where('type', 'transport')
                ->where('trp_entrega_status', 'delivered')->count(),
        ];

        return Inertia::render('Operations/Transport/Entrega', [
            'shipments' => $shipments,
            'stats' => $stats,
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Atualizar status da entrega
     */
    public function updateEntregaStatus(Request $request, Shipment $shipment)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,in_transit,delivered',
            'entrega_date' => 'nullable|date',
            'destination_address' => 'nullable|string',
            'receiver_name' => 'nullable|string',
            'delivery_notes' => 'nullable|string',
        ]);

        $shipment->update([
            'trp_entrega_status' => $validated['status'],
            'trp_entrega_date' => $validated['entrega_date'] ?? null,
            'trp_destination_address' => $validated['destination_address'] ?? null,
            'trp_receiver_name' => $validated['receiver_name'] ?? null,
            'trp_delivery_notes' => $validated['delivery_notes'] ?? null,
        ]);

        // Se foi entregue, marcar processo como completado
        if ($validated['status'] === 'delivered') {
            $shipment->update(['status' => 'completed']);
        }

        return redirect()->back()->with('success', 'Status de entrega atualizado com sucesso!');
    }
}
