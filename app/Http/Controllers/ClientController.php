<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\User;
use App\Http\Requests\ClientRequest;
use App\Http\Resources\ClientResource;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    /**
     * Display a listing of clients.
     */
    public function index(Request $request)
    {
        $query = Client::query()
            ->with(['assignedUser:id,name'])
            ->withCount(['shipments', 'activeShipments']);

        // Search
        if ($search = $request->input('search')) {
            $query->search($search);
        }

        // Filter by type
        if ($type = $request->input('type')) {
            $query->ofType($type);
        }

        // Filter by priority
        if ($priority = $request->input('priority')) {
            $query->byPriority($priority);
        }

        // Filter by status
        if ($request->has('active')) {
            $query->where('active', $request->boolean('active'));
        }

        if ($request->has('blocked')) {
            $query->where('blocked', $request->boolean('blocked'));
        }

        // Filter by assigned user
        if ($assignedTo = $request->input('assigned_to')) {
            $query->assignedTo($assignedTo);
        }

        // Sorting
        $sortField = $request->input('sort_field', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        // Paginate - using standard Laravel pagination for Inertia
        $clients = $query->paginate($request->input('per_page', 15))
                        ->withQueryString();

        // Statistics
        $stats = [
            'total' => Client::count(),
            'active' => Client::active()->count(),
            'blocked' => Client::blocked()->count(),
            'vip' => Client::vip()->count(),
            'with_active_shipments' => Client::withActiveShipments()->count(),
        ];

        return Inertia::render('Clients/Index', [
            'clients' => $clients,
            'filters' => $request->only(['search', 'type', 'priority', 'active', 'blocked', 'assigned_to']),
            'stats' => $stats,
            'types' => Client::getAvailableTypes(),
            'priorities' => Client::getAvailablePriorities(),
            'users' => User::select('id', 'name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new client.
     */
    public function create()
    {
        return Inertia::render('Clients/Form', [
            'types' => Client::getAvailableTypes(),
            'priorities' => Client::getAvailablePriorities(),
            'paymentTerms' => Client::getAvailablePaymentTerms(),
            'users' => User::select('id', 'name')->get(),
        ]);
    }

    /**
     * Store a newly created client in storage.
     */
    public function store(ClientRequest $request)
    {
        $client = Client::create($request->validated());

        return redirect()
            ->route('clients.show', $client)
            ->with('success', 'Cliente criado com sucesso!');
    }

    /**
     * Display the specified client.
     */
    public function show(Client $client)
    {


        $client->load([
            'assignedUser:id,name,email',
            'shipments' => function($query) {
                $query->with(['shippingLine:id,name'])
                      ->latest()
                      ->take(10);
            },
            'invoices' => function($query) {
                $query->latest()->take(10);
            }
        ]);

        // dd($client);
        $stats = $client->getStats();

        return Inertia::render('Clients/Show', [
            'client' => $client,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for editing the specified client.
     */
    public function edit(Client $client)
    {
        return Inertia::render('Clients/Form', [
            'client' => $client,
            'types' => Client::getAvailableTypes(),
            'priorities' => Client::getAvailablePriorities(),
            'paymentTerms' => Client::getAvailablePaymentTerms(),
            'users' => User::select('id', 'name')->get(),
        ]);
    }

    /**
     * Update the specified client in storage.
     */
    public function update(ClientRequest $request, Client $client)
    {
        $client->update($request->validated());

        return redirect()
            ->route('clients.show', $client)
            ->with('success', 'Cliente atualizado com sucesso!');
    }

    /**
     * Remove the specified client from storage.
     */
    public function destroy(Client $client)
    {
        if ($client->hasActiveShipments()) {
            return back()->with('error', 'Não é possível excluir cliente com shipments ativos!');
        }

        $client->delete();

        return redirect()
            ->route('clients.index')
            ->with('success', 'Cliente excluído com sucesso!');
    }

    /**
     * Toggle client active status
     */
    public function toggleActive(Client $client)
    {
        if ($client->active) {
            $client->deactivate();
            $message = 'Cliente desativado com sucesso!';
        } else {
            $client->activate();
            $message = 'Cliente ativado com sucesso!';
        }

        return back()->with('success', $message);
    }

    /**
     * Block client
     */
    public function block(Request $request, Client $client)
    {
        // dd($client);
        $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        $client->block($request->reason);

        return back()->with('success', 'Cliente bloqueado com sucesso!');
    }

    /**
     * Unblock client
     */
    public function unblock(Client $client)
    {
        $client->unblock();

        return back()->with('success', 'Cliente desbloqueado com sucesso!');
    }

    /**
     * Export clients to CSV
     */
    public function export(Request $request)
    {
        $query = Client::query();

        // Apply same filters as index
        if ($search = $request->input('search')) {
            $query->search($search);
        }

        if ($type = $request->input('type')) {
            $query->ofType($type);
        }

        $clients = $query->get();

        $filename = 'clients_' . date('Y-m-d_His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function() use ($clients) {
            $file = fopen('php://output', 'w');

            // Headers
            fputcsv($file, [
                'ID', 'Tipo', 'Nome', 'Email', 'Telefone',
                'NIF/NUIT', 'Cidade', 'Prioridade', 'Status',
                'Data Criação'
            ]);

            // Data
            foreach ($clients as $client) {
                fputcsv($file, [
                    $client->id,
                    $client->type_label,
                    $client->display_name,
                    $client->email,
                    $client->phone,
                    $client->tax_id,
                    $client->city,
                    $client->priority,
                    $client->active ? 'Ativo' : 'Inativo',
                    $client->created_at->format('d/m/Y H:i'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Get client shipments for AJAX
     */
    public function getShipments(Client $client, Request $request)
    {
        $shipments = $client->shipments()
            ->with(['shippingLine:id,name'])
            ->when($request->input('status'), function($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate(10);

        return response()->json($shipments);
    }

    /**
     * Get client statistics for AJAX
     */
    public function getStats(Client $client)
    {
        return response()->json($client->getStats());
    }
}
