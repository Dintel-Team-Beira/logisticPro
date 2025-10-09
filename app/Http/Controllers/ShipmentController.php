<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\ShippingLine;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ShipmentController extends Controller
{
    /**
     * Listar todos os shipments
     */
    public function index(Request $request)
    {
        $query = Shipment::with(['shippingLine', 'client', 'stages'])
            ->orderBy('created_at', 'desc');

        // Filtro por status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filtro por busca
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                  ->orWhere('bl_number', 'like', "%{$search}%")
                  ->orWhere('container_number', 'like', "%{$search}%");
            });
        }

        $shipments = $query->paginate(15)->through(function($shipment) {
            return [
                'id' => $shipment->id,
                'reference_number' => $shipment->reference_number,
                'bl_number' => $shipment->bl_number,
                'container_number' => $shipment->container_number,
                'status' => $shipment->status,
                'current_phase' => $shipment->current_phase,
                'created_at' => $shipment->created_at->format('d/m/Y'),
                'client' => [
                    'id' => $shipment->client->id,
                    'name' => $shipment->client->name,
                ],
                'shipping_line' => [
                    'id' => $shipment->shippingLine->id,
                    'name' => $shipment->shippingLine->name,
                ],
            ];
        });

        return Inertia::render('Shipments/Index', [
            'shipments' => $shipments,
            'filters' => $request->only(['status', 'search'])
        ]);
    }

    /**
     * Mostrar formulário de criação
     */
    public function create()
    {
        return Inertia::render('Shipments/Create', [
            'shippingLines' => ShippingLine::where('active', true)->get(),
            'clients' => Client::orderBy('name')->get(),
        ]);
    }

    /**
     * Criar novo shipment
     */
    public function store(Request $request)
    {
        Log::info('ShipmentController@store - Iniciando', [
            'data' => $request->except('bl_file')
        ]);

        $validated = $request->validate([
            // Cliente
            'client_id' => 'required_without:new_client_name|nullable|exists:clients,id',
            'new_client_name' => 'required_without:client_id|nullable|string|max:255',
            'new_client_email' => 'required_with:new_client_name|nullable|email',
            'new_client_phone' => 'nullable|string|max:50',

            // Shipping Line
            'shipping_line_id' => 'required|exists:shipping_lines,id',

            // Documentação
            'bl_number' => 'required|string|max:100',
            'bl_file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',

            // Container
            'container_number' => 'required|string|max:50',
            'container_type' => 'required|in:20ST,40ST,40HC,20RF,40RF,20OT,40OT',

            // Rota
            'origin_port' => 'nullable|string|max:100',
            'destination_port' => 'required|string|max:100',
            'vessel_name' => 'nullable|string|max:100',
            'arrival_date' => 'nullable|date',

            // Carga
            'cargo_description' => 'required|string',
            'cargo_weight' => 'nullable|numeric|min:0',
            'cargo_value' => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            // 1. Criar ou buscar cliente
            if ($request->filled('new_client_name')) {
                $client = Client::create([
                    'name' => $validated['new_client_name'],
                    'email' => $validated['new_client_email'],
                    'phone' => $validated['new_client_phone'] ?? null,
                    'active' => true,
                ]);
            } else {
                $client = Client::findOrFail($validated['client_id']);
            }

            // 2. Gerar reference number
            $year = date('Y');
            $lastShipment = Shipment::whereYear('created_at', $year)->latest()->first();
            $sequence = $lastShipment ? intval(substr($lastShipment->reference_number, -4)) + 1 : 1;
            $referenceNumber = "SHP-{$year}-" . str_pad($sequence, 4, '0', STR_PAD_LEFT);

            // 3. Criar shipment
            $shipment = Shipment::create([
                'reference_number' => $referenceNumber,
                'client_id' => $client->id,
                'shipping_line_id' => $validated['shipping_line_id'],
                'bl_number' => $validated['bl_number'],
                'container_number' => $validated['container_number'],
                'container_type' => $validated['container_type'],
                'vessel_name' => $validated['vessel_name'] ?? null,
                'arrival_date' => $validated['arrival_date'] ?? null,
                'origin_port' => $validated['origin_port'] ?? null,
                'destination_port' => $validated['destination_port'],
                'cargo_description' => $validated['cargo_description'],
                'cargo_weight' => $validated['cargo_weight'] ?? null,
                'cargo_value' => $validated['cargo_value'] ?? null,
                'status' => 'pending',
                'created_by' => auth()->id(),
            ]);

            Log::info('Shipment criado', ['id' => $shipment->id]);

            // 4. Upload BL
            $blFile = $request->file('bl_file');
            $blPath = $blFile->store("documents/shipments/{$shipment->id}/bl", 'public');

            $shipment->documents()->create([
                'type' => 'bl',
                'name' => $blFile->getClientOriginalName(),
                'path' => $blPath,
                'size' => $blFile->getSize(),
                'uploaded_by' => auth()->id(),
                'metadata' => [
                    'bl_number' => $validated['bl_number'],
                    'uploaded_at_creation' => true,
                ]
            ]);

            Log::info('BL anexado', ['path' => $blPath]);

            // 5. Observer vai criar a primeira fase automaticamente

            DB::commit();

            Log::info('Shipment criado com sucesso', [
                'id' => $shipment->id,
                'reference' => $referenceNumber
            ]);

            return redirect()
                ->route('shipments.show', $shipment)
                ->with('success', "Shipment {$referenceNumber} criado! Fase 1 iniciada.");

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Erro ao criar shipment', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            if (isset($blPath)) {
                Storage::disk('public')->delete($blPath);
            }

            return back()
                ->withErrors(['error' => 'Erro: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Exibir detalhes do shipment
     */
    public function show(Shipment $shipment)
    {
        // Carregar relacionamentos
        $shipment->load([
            'client',
            'shippingLine',
            'documents.uploader',
            'stages' => function($query) {
                $query->orderBy('id', 'asc');
            }
        ]);

        // Tentar carregar activities
        try {
            $shipment->load(['activities' => function($query) {
                $query->latest()->limit(10);
            }]);
        } catch (\Exception $e) {
            Log::info('Activities não disponível');
        }

        // Calcular progresso
        $currentPhase = $shipment->current_phase;
        $progress = ($currentPhase / 7) * 100;

        // Preparar checklist de documentos por fase
        $checklist = $this->getChecklistForPhase($shipment, $currentPhase);

        // Verificar se pode avançar
        $canAdvance = $this->canAdvanceToNextPhase($shipment);

        return Inertia::render('Shipments/Show', [
            'shipment' => $shipment,
            'progress' => [
                'progress' => round($progress, 2),
                'current_phase' => $currentPhase,
                'current_stage' => $shipment->currentStage()?->stage,
            ],
            'checklist' => $checklist,
            'canAdvance' => $canAdvance,
        ]);
    }

    /**
     * Formulário de edição
     */
    public function edit(Shipment $shipment)
    {
        return Inertia::render('Shipments/Edit', [
            'shipment' => $shipment->load(['client', 'shippingLine']),
            'shippingLines' => ShippingLine::where('active', true)->get(),
            'clients' => Client::orderBy('name')->get(),
        ]);
    }

    /**
     * Atualizar shipment
     */
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
            'cargo_weight' => 'nullable|numeric',
            'cargo_value' => 'nullable|numeric',
        ]);

        $shipment->update($validated);

        return back()->with('success', 'Shipment atualizado!');
    }

    /**
     * Deletar shipment
     */
    public function destroy(Shipment $shipment)
    {
        // Deletar documentos físicos
        foreach ($shipment->documents as $doc) {
            if (Storage::disk('public')->exists($doc->path)) {
                Storage::disk('public')->delete($doc->path);
            }
        }

        $shipment->delete();

        return redirect()
            ->route('shipments.index')
            ->with('success', 'Shipment removido!');
    }

  /**
 * Avançar para próxima fase
 * CORREÇÃO: Validação melhorada e verificação de duplicatas
 */
public function advance(Shipment $shipment)
{
    try {
        DB::beginTransaction();

        // Verificar se pode avançar
        if (!$this->canAdvanceToNextPhase($shipment)) {
            return back()->withErrors([
                'error' => 'Não é possível avançar. Complete os requisitos da fase atual.'
            ]);
        }

        // Obter o stage atual
        $currentStage = $shipment->currentStage();

        if (!$currentStage) {
            DB::rollBack();
            return back()->withErrors([
                'error' => 'Nenhum stage ativo encontrado.'
            ]);
        }

        // Verificar se o stage atual já está completado
        if ($currentStage->status === 'completed') {
            // Verificar se já existe um próximo stage em progresso
            $inProgressStage = $shipment->stages()
                ->where('status', 'in_progress')
                ->where('id', '>', $currentStage->id)
                ->first();

            if ($inProgressStage) {
                DB::rollBack();
                return back()->with('info', 'Este processo já está na próxima fase!');
            }
        }

        // Mapear fase atual para próxima
        $nextStages = [
            'coleta_dispersa' => 'legalizacao',
            'legalizacao' => 'alfandegas',
            'alfandegas' => 'cornelder',
            'cornelder' => 'taxacao',
            'taxacao' => 'faturacao',
            'faturacao' => 'pod',
            'pod' => null,
        ];

        $nextStageName = $nextStages[$currentStage->stage] ?? null;

        // Se não houver próximo stage, processo está completo
        if (!$nextStageName) {
            $shipment->update(['status' => 'completed']);
            DB::commit();
            return back()->with('success', 'Processo completado com sucesso!');
        }

        // Verificar se o próximo stage já existe
        $existingNextStage = $shipment->stages()
            ->where('stage', $nextStageName)
            ->first();

        if ($existingNextStage) {
            // Se já existe mas não está em progresso, ativar
            if ($existingNextStage->status !== 'in_progress') {
                $existingNextStage->update([
                    'status' => 'in_progress',
                    'started_at' => now(),
                    'updated_by' => auth()->id(),
                ]);
            }

            // Completar o stage atual se ainda não foi
            if ($currentStage->status !== 'completed') {
                $currentStage->update([
                    'status' => 'completed',
                    'completed_at' => now(),
                    'updated_by' => auth()->id(),
                ]);
            }

            $nextStage = $existingNextStage;
        } else {
            // Avançar usando o método do Model
            $nextStage = $shipment->advanceToNextStage();
        }

        if ($nextStage) {
            // Registrar activity
            try {
                $shipment->activities()->create([
                    'user_id' => auth()->id(),
                    'action' => 'phase_advanced',
                    'description' => "Avançado para Fase {$shipment->current_phase}: " .
                                   ucfirst(str_replace('_', ' ', $nextStage->stage)),
                ]);
            } catch (\Exception $e) {
                Log::warning('Activity não registrada: ' . $e->getMessage());
            }

            DB::commit();

            return back()->with('success',
                "Avançado para Fase {$shipment->current_phase}: " .
                ucfirst(str_replace('_', ' ', $nextStage->stage)) . "!"
            );
        }

        DB::rollBack();
        return back()->withErrors(['error' => 'Erro ao criar próximo stage.']);

    } catch (\Exception $e) {
        DB::rollBack();

        Log::error('Erro ao avançar fase', [
            'shipment_id' => $shipment->id,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        return back()->withErrors([
            'error' => 'Erro ao avançar: ' . $e->getMessage()
        ]);
    }
}

    /**
     * Obter checklist de documentos para uma fase
     */
    private function getChecklistForPhase(Shipment $shipment, int $phase): array
    {
        $documentsByPhase = [
            1 => ['invoice', 'receipt', 'pop'],
            2 => ['bl', 'carta_endosso', 'delivery_order'],
            3 => ['packing_list', 'invoice', 'autorizacao'],
            4 => ['draft', 'storage', 'receipt'],
            5 => ['sad', 'termo'],
            6 => ['client_invoice'],
            7 => ['pod', 'delivery_confirmation'],
        ];

        $requiredDocs = $documentsByPhase[$phase] ?? [];
        $attachedDocs = $shipment->documents()->pluck('type')->toArray();

        $checklist = [];
        foreach ($requiredDocs as $type) {
            $checklist[] = [
                'type' => $type,
                'label' => ucfirst(str_replace('_', ' ', $type)),
                'attached' => in_array($type, $attachedDocs),
                'required' => true,
            ];
        }

        return $checklist;
    }

    /**
     * Verificar se pode avançar para próxima fase
     */
    private function canAdvanceToNextPhase(Shipment $shipment): bool
    {
        $currentPhase = $shipment->current_phase;

        // Regras específicas por fase
        switch ($currentPhase) {
            case 1: // Coleta Dispersa
                return $shipment->quotation_status === 'received' &&
                       $shipment->payment_status === 'paid' &&
                       $shipment->documents()->where('type', 'bl')->exists();

            case 2: // Legalização
                return $shipment->documents()->where('type', 'bl')->exists() &&
                       $shipment->documents()->where('type', 'carta_endosso')->exists();

            case 3: // Alfândegas
                return $shipment->customs_payment_status === 'paid';

            case 4: // Cornelder
                return $shipment->cornelder_payment_status === 'paid';

            case 5: // Taxação
                return $shipment->client_invoice_id &&
                       $shipment->client_payment_status === 'paid';

            default:
                return true;
        }
    }

    /**
     * API: Obter progresso
     */
    public function getProgress(Shipment $shipment)
    {
        $currentPhase = $shipment->current_phase;
        $progress = ($currentPhase / 7) * 100;

        return response()->json([
            'progress' => round($progress, 2),
            'current_phase' => $currentPhase,
            'current_stage' => $shipment->currentStage()?->stage,
            'can_advance' => $this->canAdvanceToNextPhase($shipment),
        ]);
    }

    /**
     * API: Obter checklist
     */
    public function getChecklist(Shipment $shipment)
    {
        $checklist = $this->getChecklistForPhase($shipment, $shipment->current_phase);

        return response()->json([
            'checklist' => $checklist,
            'can_advance' => $this->canAdvanceToNextPhase($shipment),
        ]);
    }
}
