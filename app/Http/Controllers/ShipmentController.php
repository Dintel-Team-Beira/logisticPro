<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\ShippingLine;
use App\Models\ShipmentStage;
use App\Models\Activity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShipmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Shipment::with(['shippingLine', 'stages'])
            ->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                  ->orWhere('bl_number', 'like', "%{$search}%")
                  ->orWhere('container_number', 'like', "%{$search}%");
            });
        }

        $shipments = $query->paginate(15);

        return Inertia::render('Shipments/Index', [
            'shipments' => $shipments,
            'filters' => $request->only(['status', 'search'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Shipments/Create', [
            'shippingLines' => ShippingLine::where('active', true)->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'shipping_line_id' => 'required|exists:shipping_lines,id',
            'bl_number' => 'nullable|string',
            'container_number' => 'nullable|string',
            'vessel_name' => 'nullable|string',
            'arrival_date' => 'nullable|date',
            'origin_port' => 'nullable|string',
            'destination_port' => 'nullable|string',
            'cargo_description' => 'nullable|string',
        ]);

        $shipment = Shipment::create([
            ...$validated,
            'created_by' => auth()->id(),
            'status' => 'coleta_dispersa'
        ]);

        // Criar stages iniciais
        $stages = [
            'coleta_dispersa',
            'legalizacao',
            'alfandegas',
            'cornelder',
            'taxacao'
        ];

        foreach ($stages as $index => $stage) {
            ShipmentStage::create([
                'shipment_id' => $shipment->id,
                'stage' => $stage,
                'status' => $index === 0 ? 'in_progress' : 'pending'
            ]);
        }

        // Registrar atividade
        Activity::create([
            'shipment_id' => $shipment->id,
            'user_id' => auth()->id(),
            'action' => 'created',
            'description' => 'Shipment criado'
        ]);

        return redirect()->route('shipments.show', $shipment)
            ->with('success', 'Shipment criado com sucesso!');
    }

    public function show(Shipment $shipment)
    {
        $shipment->load([
            'shippingLine',
            'documents.uploader',
            'invoices',
            'stages.updater',
            'activities.user'
        ]);

        return Inertia::render('Shipments/Show', [
            'shipment' => $shipment
        ]);
    }

    public function update(Request $request, Shipment $shipment)
    {
        $validated = $request->validate([
            'shipping_line_id' => 'sometimes|exists:shipping_lines,id',
            'bl_number' => 'nullable|string',
            'container_number' => 'nullable|string',
            'vessel_name' => 'nullable|string',
            'arrival_date' => 'nullable|date',
            'origin_port' => 'nullable|string',
            'destination_port' => 'nullable|string',
            'cargo_description' => 'nullable|string',
        ]);

        $shipment->update($validated);

        Activity::create([
            'shipment_id' => $shipment->id,
            'user_id' => auth()->id(),
            'action' => 'updated',
            'description' => 'Informações do shipment atualizadas'
        ]);

        return back()->with('success', 'Shipment atualizado com sucesso!');
    }

    public function destroy(Shipment $shipment)
    {
        $shipment->delete();

        return redirect()->route('shipments.index')
            ->with('success', 'Shipment removido com sucesso!');
    }
}
