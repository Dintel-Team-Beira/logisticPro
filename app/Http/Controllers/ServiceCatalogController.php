<?php

namespace App\Http\Controllers;

use App\Models\ServiceCatalog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceCatalogController extends Controller
{
    public function index()
    {
        $services = ServiceCatalog::orderBy('category')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(20);

        // Estatísticas
        $stats = [
            'total' => ServiceCatalog::count(),
            'active' => ServiceCatalog::active()->count(),
            'by_category' => ServiceCatalog::selectRaw('category, COUNT(*) as count')
                ->groupBy('category')
                ->pluck('count', 'category')
                ->toArray(),
        ];

        return Inertia::render('Services/Index', [
            'services' => $services,
            'stats' => $stats,
        ]);
    }

    public function create()
    {
        return Inertia::render('Services/Create', [
            'nextCode' => ServiceCatalog::generateCode(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:service_catalog,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|in:freight,customs,warehousing,handling,transport,insurance,documentation,inspection,consulting,other',
            'unit_price' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'tax_type' => 'required|in:included,excluded,exempt',
            'tax_rate' => 'required|numeric|min:0|max:100',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        ServiceCatalog::create($validated);

        return redirect()->route('services.index')
            ->with('success', 'Serviço criado com sucesso!');
    }

    public function edit(ServiceCatalog $service)
    {
        return Inertia::render('Services/Edit', [
            'service' => $service,
        ]);
    }

    public function update(Request $request, ServiceCatalog $service)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:service_catalog,code,' . $service->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|in:freight,customs,warehousing,handling,transport,insurance,documentation,inspection,consulting,other',
            'unit_price' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'tax_type' => 'required|in:included,excluded,exempt',
            'tax_rate' => 'required|numeric|min:0|max:100',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $service->update($validated);

        return redirect()->route('services.index')
            ->with('success', 'Serviço atualizado com sucesso!');
    }

    public function destroy(ServiceCatalog $service)
    {
        // Check if service is being used
        $quoteItemsCount = $service->quoteItems()->count();
        $invoiceItemsCount = $service->invoiceItems()->count();

        if ($quoteItemsCount > 0 || $invoiceItemsCount > 0) {
            return back()->with('error', 'Este serviço não pode ser excluído pois está sendo usado em cotações ou faturas.');
        }

        $service->delete();

        return redirect()->route('services.index')
            ->with('success', 'Serviço removido com sucesso!');
    }

    public function toggle(ServiceCatalog $service)
    {
        $service->update(['is_active' => !$service->is_active]);

        $status = $service->is_active ? 'ativado' : 'desativado';

        return back()->with('success', "Serviço {$status} com sucesso!");
    }

    /**
     * API: Get active services for selection
     */
    public function getActive(Request $request)
    {
        $category = $request->get('category');

        $query = ServiceCatalog::active();

        if ($category) {
            $query->category($category);
        }

        $services = $query->orderBy('name')
            ->get()
            ->map(function ($service) {
                return [
                    'id' => $service->id,
                    'code' => $service->code,
                    'name' => $service->name,
                    'description' => $service->description,
                    'category' => $service->category,
                    'category_name' => $service->category_name,
                    'unit_price' => $service->unit_price,
                    'unit' => $service->unit,
                    'tax_type' => $service->tax_type,
                    'tax_rate' => $service->tax_rate,
                    'price_with_tax' => $service->price_with_tax,
                ];
            });

        return response()->json($services);
    }
}
