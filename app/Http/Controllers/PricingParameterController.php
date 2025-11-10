<?php

namespace App\Http\Controllers;

use App\Models\PricingParameter;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PricingParameterController extends Controller
{
    /**
     * Display pricing parameters configuration page
     */
    public function index(Request $request)
    {
        $category = $request->input('category', 'container_type');

        $parameters = PricingParameter::byCategory($category)
            ->ordered()
            ->get();

        $stats = [
            'total' => PricingParameter::count(),
            'active' => PricingParameter::active()->count(),
            'inactive' => PricingParameter::where('active', false)->count(),
        ];

        return Inertia::render('Settings/PricingParameters', [
            'parameters' => $parameters,
            'currentCategory' => $category,
            'categories' => PricingParameter::getCategories(),
            'stats' => $stats,
        ]);
    }

    /**
     * Store a new pricing parameter
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|in:container_type,cargo_type,regime,destination,additional_service',
            'code' => 'required|string|max:100',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'price' => 'required|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'order' => 'nullable|integer',
            'active' => 'boolean',
        ]);

        // Verificar se já existe um parâmetro com mesmo category e code
        $exists = PricingParameter::where('category', $validated['category'])
            ->where('code', $validated['code'])
            ->exists();

        if ($exists) {
            return back()->with('error', 'Já existe um parâmetro com este código nesta categoria!');
        }

        PricingParameter::create($validated);

        return back()->with('success', 'Parâmetro de precificação criado com sucesso!');
    }

    /**
     * Update a pricing parameter
     */
    public function update(Request $request, PricingParameter $pricingParameter)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'price' => 'required|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'order' => 'nullable|integer',
            'active' => 'boolean',
        ]);

        $pricingParameter->update($validated);

        return back()->with('success', 'Parâmetro atualizado com sucesso!');
    }

    /**
     * Delete a pricing parameter
     */
    public function destroy(PricingParameter $pricingParameter)
    {
        $pricingParameter->delete();

        return back()->with('success', 'Parâmetro excluído com sucesso!');
    }

    /**
     * Toggle parameter active status
     */
    public function toggleActive(PricingParameter $pricingParameter)
    {
        if ($pricingParameter->active) {
            $pricingParameter->deactivate();
            $message = 'Parâmetro desativado com sucesso!';
        } else {
            $pricingParameter->activate();
            $message = 'Parâmetro ativado com sucesso!';
        }

        return back()->with('success', $message);
    }

    /**
     * Get parameters for a specific category (API)
     */
    public function getByCategory($category)
    {
        $parameters = PricingParameter::active()
            ->byCategory($category)
            ->ordered()
            ->get()
            ->map(function ($param) {
                return [
                    'id' => $param->id,
                    'code' => $param->code,
                    'name' => $param->name,
                    'description' => $param->description,
                    'price' => $param->price,
                    'formatted_price' => $param->formatted_price,
                ];
            });

        return response()->json($parameters);
    }

    /**
     * Get all parameters grouped by category (API)
     */
    public function getAllGrouped()
    {
        $grouped = PricingParameter::getGroupedParameters();

        return response()->json($grouped);
    }

    /**
     * Calculate quotation based on selections (API)
     */
    public function calculateQuotation(Request $request)
    {
        $validated = $request->validate([
            'container_type' => 'nullable|string',
            'cargo_type' => 'nullable|string',
            'regime' => 'nullable|string',
            'destination' => 'nullable|string',
            'additional_services' => 'nullable|array',
            'additional_services.*' => 'string',
        ]);

        $selections = [];

        if (isset($validated['container_type'])) {
            $selections['container_type'] = $validated['container_type'];
        }

        if (isset($validated['cargo_type'])) {
            $selections['cargo_type'] = $validated['cargo_type'];
        }

        if (isset($validated['regime'])) {
            $selections['regime'] = $validated['regime'];
        }

        if (isset($validated['destination'])) {
            $selections['destination'] = $validated['destination'];
        }

        if (isset($validated['additional_services'])) {
            $selections['additional_service'] = $validated['additional_services'];
        }

        $quotation = PricingParameter::calculateQuotation($selections);

        return response()->json($quotation);
    }
}
