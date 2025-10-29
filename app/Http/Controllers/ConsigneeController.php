<?php

namespace App\Http\Controllers;

use App\Models\Consignee;
use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConsigneeController extends Controller
{
    /**
     * Display a listing of consignees.
     */
    public function index(Request $request)
    {
        $query = Consignee::query()
            ->with(['client:id,name,company_name'])
            ->withCount('shipments');

        // Search
        if ($search = $request->input('search')) {
            $query->search($search);
        }

        // Filter by client
        if ($clientId = $request->input('client_id')) {
            $query->forClient($clientId);
        }

        // Filter by status
        if ($request->has('active')) {
            $query->where('active', $request->boolean('active'));
        }

        // Sorting
        $sortField = $request->input('sort_field', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        // Paginate
        $consignees = $query->paginate($request->input('per_page', 15))
                           ->withQueryString();

        // Statistics
        $stats = [
            'total' => Consignee::count(),
            'active' => Consignee::active()->count(),
            'inactive' => Consignee::where('active', false)->count(),
        ];

        return Inertia::render('Consignees/Index', [
            'consignees' => $consignees,
            'filters' => $request->only(['search', 'client_id', 'active']),
            'stats' => $stats,
            'clients' => Client::select('id', 'name', 'company_name')->orderBy('name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new consignee.
     */
    public function create()
    {
        return Inertia::render('Consignees/Create', [
            'clients' => Client::active()->select('id', 'name', 'company_name')->orderBy('name')->get(),
        ]);
    }

    /**
     * Store a newly created consignee in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'nullable|exists:clients,id',
            'name' => 'required|string|max:255',
            'tax_id' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:2',
            'contact_person' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'active' => 'boolean',
        ]);

        $consignee = Consignee::create($validated);

        return redirect()
            ->route('consignees.index')
            ->with('success', 'Consignatário criado com sucesso!');
    }

    /**
     * Display the specified consignee.
     */
    public function show(Consignee $consignee)
    {
        $consignee->load([
            'client:id,name,company_name,email,phone',
            'shipments' => function($query) {
                $query->with(['client:id,name', 'shippingLine:id,name'])
                      ->latest()
                      ->take(10);
            }
        ]);

        return Inertia::render('Consignees/Show', [
            'consignee' => $consignee,
        ]);
    }

    /**
     * Show the form for editing the specified consignee.
     */
    public function edit(Consignee $consignee)
    {
        return Inertia::render('Consignees/Edit', [
            'consignee' => $consignee,
            'clients' => Client::active()->select('id', 'name', 'company_name')->orderBy('name')->get(),
        ]);
    }

    /**
     * Update the specified consignee in storage.
     */
    public function update(Request $request, Consignee $consignee)
    {
        $validated = $request->validate([
            'client_id' => 'nullable|exists:clients,id',
            'name' => 'required|string|max:255',
            'tax_id' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:2',
            'contact_person' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'active' => 'boolean',
        ]);

        $consignee->update($validated);

        return redirect()
            ->route('consignees.index')
            ->with('success', 'Consignatário atualizado com sucesso!');
    }

    /**
     * Remove the specified consignee from storage.
     */
    public function destroy(Consignee $consignee)
    {
        // Check if consignee has shipments
        if ($consignee->shipments()->count() > 0) {
            return back()->with('error', 'Não é possível excluir consignatário com processos associados!');
        }

        $consignee->delete();

        return redirect()
            ->route('consignees.index')
            ->with('success', 'Consignatário excluído com sucesso!');
    }

    /**
     * Toggle consignee active status
     */
    public function toggleActive(Consignee $consignee)
    {
        if ($consignee->active) {
            $consignee->deactivate();
            $message = 'Consignatário desativado com sucesso!';
        } else {
            $consignee->activate();
            $message = 'Consignatário ativado com sucesso!';
        }

        return back()->with('success', $message);
    }

    /**
     * Get consignees for a specific client (API endpoint)
     */
    public function getByClient(Request $request, $clientId)
    {
        $consignees = Consignee::active()
            ->forClient($clientId)
            ->select('id', 'name', 'address', 'city', 'contact_person')
            ->orderBy('name')
            ->get();

        return response()->json($consignees);
    }
}
