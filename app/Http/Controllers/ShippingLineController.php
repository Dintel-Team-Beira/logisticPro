<?php

namespace App\Http\Controllers;

use App\Models\ShippingLine;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShippingLineController extends Controller
{
    /**
     * Display a listing of shipping lines.
     */
    public function index()
    {
        $shippingLines = ShippingLine::withCount('shipments')
            ->orderBy('name')
            ->get();

        return Inertia::render('ShippingLines/Index', [
            'shippingLines' => $shippingLines
        ]);
    }

    /**
     * Show the form for creating a new shipping line.
     */
    public function create()
    {
        return Inertia::render('ShippingLines/Create');
    }

    /**
     * Store a newly created shipping line in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:shipping_lines,code',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'contact_person' => 'nullable|string|max:255',
            'active' => 'boolean'
        ]);

        $shippingLine = ShippingLine::create($validated);

        return redirect()->route('shipping-lines.index')
            ->with('success', 'Linha de navegação criada com sucesso!');
    }

    /**
     * Display the specified shipping line.
     */
    public function show(ShippingLine $shippingLine)
    {
        $shippingLine->load(['shipments' => function ($query) {
            $query->latest()->take(10);
        }]);

        $stats = [
            'total_shipments' => $shippingLine->shipments()->count(),
            'active_shipments' => $shippingLine->shipments()->where('status', '!=', 'completed')->count(),
            'completed_shipments' => $shippingLine->shipments()->where('status', 'completed')->count(),
            'avg_processing_time' => $this->getAverageProcessingTime($shippingLine),
        ];

        return Inertia::render('ShippingLines/Show', [
            'shippingLine' => $shippingLine,
            'stats' => $stats
        ]);
    }

    /**
     * Show the form for editing the specified shipping line.
     */
    public function edit(ShippingLine $shippingLine)
    {
        return Inertia::render('ShippingLines/Edit', [
            'shippingLine' => $shippingLine
        ]);
    }

    /**
     * Update the specified shipping line in storage.
     */
    public function update(Request $request, ShippingLine $shippingLine)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:shipping_lines,code,' . $shippingLine->id,
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'contact_person' => 'nullable|string|max:255',
            'active' => 'boolean'
        ]);

        $shippingLine->update($validated);

        return redirect()->route('shipping-lines.index')
            ->with('success', 'Linha de navegação atualizada com sucesso!');
    }

    /**
     * Remove the specified shipping line from storage.
     */
    public function destroy(ShippingLine $shippingLine)
    {
        // Verificar se há shipments associados
        if ($shippingLine->shipments()->count() > 0) {
            return back()->with('error', 'Não é possível remover uma linha de navegação com shipments associados.');
        }

        $shippingLine->delete();

        return redirect()->route('shipping-lines.index')
            ->with('success', 'Linha de navegação removida com sucesso!');
    }

    /**
     * Toggle the active status of a shipping line.
     */
    public function toggleStatus(ShippingLine $shippingLine)
    {
        $shippingLine->update([
            'active' => !$shippingLine->active
        ]);

        $status = $shippingLine->active ? 'ativada' : 'desativada';

        return back()->with('success', "Linha de navegação {$status} com sucesso!");
    }

    /**
     * Calculate average processing time for shipments.
     */
    private function getAverageProcessingTime(ShippingLine $shippingLine)
    {
        $completedShipments = $shippingLine->shipments()
            ->where('status', 'completed')
            ->get();

        if ($completedShipments->isEmpty()) {
            return null;
        }

        $totalDays = $completedShipments->sum(function ($shipment) {
            return $shipment->created_at->diffInDays($shipment->updated_at);
        });

        return round($totalDays / $completedShipments->count(), 1);
    }
}
