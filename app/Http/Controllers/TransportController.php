<?php

namespace App\Http\Controllers;

use App\Models\Transport;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransportController extends Controller
{
    /**
     * Display a listing of transports.
     */
    public function index(Request $request)
    {
        $query = Transport::query()
            ->withCount('shipments');

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('matricula', 'like', "%{$search}%")
                  ->orWhere('marca', 'like', "%{$search}%")
                  ->orWhere('modelo', 'like', "%{$search}%")
                  ->orWhere('motorista_nome', 'like', "%{$search}%");
            });
        }

        // Filter by tipo_veiculo
        if ($tipo = $request->input('tipo_veiculo')) {
            $query->byType($tipo);
        }

        // Filter by destino
        if ($destino = $request->input('destino')) {
            $query->byDestino($destino);
        }

        // Filter by status
        if ($request->has('ativo')) {
            $query->where('ativo', $request->boolean('ativo'));
        }

        // Sorting
        $sortField = $request->input('sort_field', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        // Paginate
        $transports = $query->paginate($request->input('per_page', 15))
                           ->withQueryString();

        // Statistics
        $stats = [
            'total' => Transport::count(),
            'ativos' => Transport::active()->count(),
            'inativos' => Transport::where('ativo', false)->count(),
        ];

        return Inertia::render('Transports/Index', [
            'transports' => $transports,
            'filters' => $request->only(['search', 'tipo_veiculo', 'destino', 'ativo']),
            'stats' => $stats,
            'tiposVeiculo' => Transport::getTiposVeiculo(),
            'destinosComuns' => Transport::getDestinosComuns(),
        ]);
    }

    /**
     * Show the form for creating a new transport.
     */
    public function create()
    {
        return Inertia::render('Transports/Create', [
            'tiposVeiculo' => Transport::getTiposVeiculo(),
            'destinosComuns' => Transport::getDestinosComuns(),
        ]);
    }

    /**
     * Store a newly created transport in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tipo_veiculo' => 'required|string|max:50',
            'matricula' => 'required|string|max:20|unique:transports,matricula',
            'marca' => 'nullable|string|max:50',
            'modelo' => 'nullable|string|max:50',
            'ano' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'capacidade_peso' => 'nullable|numeric|min:0',
            'capacidade_volume' => 'nullable|numeric|min:0',
            'motorista_nome' => 'nullable|string|max:255',
            'motorista_telefone' => 'nullable|string|max:50',
            'motorista_documento' => 'nullable|string|max:50',
            'destinos' => 'nullable|array',
            'destinos.*' => 'string|max:100',
            'observacoes' => 'nullable|string|max:1000',
            'ativo' => 'boolean',
        ]);

        $transport = Transport::create($validated);

        return redirect()
            ->route('transports.index')
            ->with('success', 'Transporte criado com sucesso!');
    }

    /**
     * Display the specified transport.
     */
    public function show(Transport $transport)
    {
        $transport->load([
            'shipments' => function($query) {
                $query->with(['client:id,name', 'shippingLine:id,name'])
                      ->latest()
                      ->take(10);
            }
        ]);

        return Inertia::render('Transports/Show', [
            'transport' => $transport,
        ]);
    }

    /**
     * Show the form for editing the specified transport.
     */
    public function edit(Transport $transport)
    {
        return Inertia::render('Transports/Edit', [
            'transport' => $transport,
            'tiposVeiculo' => Transport::getTiposVeiculo(),
            'destinosComuns' => Transport::getDestinosComuns(),
        ]);
    }

    /**
     * Update the specified transport in storage.
     */
    public function update(Request $request, Transport $transport)
    {
        $validated = $request->validate([
            'tipo_veiculo' => 'required|string|max:50',
            'matricula' => 'required|string|max:20|unique:transports,matricula,' . $transport->id,
            'marca' => 'nullable|string|max:50',
            'modelo' => 'nullable|string|max:50',
            'ano' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'capacidade_peso' => 'nullable|numeric|min:0',
            'capacidade_volume' => 'nullable|numeric|min:0',
            'motorista_nome' => 'nullable|string|max:255',
            'motorista_telefone' => 'nullable|string|max:50',
            'motorista_documento' => 'nullable|string|max:50',
            'destinos' => 'nullable|array',
            'destinos.*' => 'string|max:100',
            'observacoes' => 'nullable|string|max:1000',
            'ativo' => 'boolean',
        ]);

        $transport->update($validated);

        return redirect()
            ->route('transports.index')
            ->with('success', 'Transporte atualizado com sucesso!');
    }

    /**
     * Remove the specified transport from storage.
     */
    public function destroy(Transport $transport)
    {
        // Check if transport has shipments
        if ($transport->shipments()->count() > 0) {
            return back()->with('error', 'Não é possível excluir transporte com processos associados!');
        }

        $transport->delete();

        return redirect()
            ->route('transports.index')
            ->with('success', 'Transporte excluído com sucesso!');
    }

    /**
     * Toggle transport active status
     */
    public function toggleActive(Transport $transport)
    {
        $transport->update(['ativo' => !$transport->ativo]);

        $message = $transport->ativo
            ? 'Transporte ativado com sucesso!'
            : 'Transporte desativado com sucesso!';

        return back()->with('success', $message);
    }

    /**
     * Get transports by destination (API endpoint)
     */
    public function getByDestino(Request $request, string $destino)
    {
        $transports = Transport::active()
            ->byDestino($destino)
            ->select('id', 'tipo_veiculo', 'matricula', 'marca', 'modelo', 'motorista_nome', 'capacidade_peso', 'capacidade_volume')
            ->orderBy('tipo_veiculo')
            ->get();

        return response()->json($transports);
    }

    /**
     * Get available transports (API endpoint)
     */
    public function getAvailable(Request $request)
    {
        $transports = Transport::active()
            ->select('id', 'tipo_veiculo', 'matricula', 'marca', 'modelo', 'motorista_nome', 'destinos')
            ->orderBy('tipo_veiculo')
            ->get();

        return response()->json($transports);
    }
}
