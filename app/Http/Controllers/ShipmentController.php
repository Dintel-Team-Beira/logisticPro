<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\ShippingLine;
use App\Models\Client;
use App\Services\ShipmentWorkflowService;
use App\Enums\DocumentType;
use App\Enums\ShipmentStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ShipmentController extends Controller
{
    protected ShipmentWorkflowService $workflow;

    public function __construct(ShipmentWorkflowService $workflow)
    {
        $this->workflow = $workflow;
    }

    public function index(Request $request)
    {
        $query = Shipment::with(['shippingLine', 'client'])
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
            'shippingLines' => ShippingLine::where('active', true)->get(),
            'clients' => Client::orderBy('name')->get(),
        ]);
    }

    /**
     * Store - Baseado no SRS UC-001: Criar Novo Processo
     */
    public function store(Request $request)
    {
        // Log para debug
        Log::info('ShipmentController@store - Iniciando criação', [
            'data' => $request->except('bl_file')
        ]);

        $validated = $request->validate([
            // Cliente
            'client_id' => 'required_without:new_client_name|nullable|exists:clients,id',
            'new_client_name' => 'required_without:client_id|nullable|string|max:255',
            'new_client_email' => 'required_with:new_client_name|nullable|email|max:255',
            'new_client_phone' => 'nullable|string|max:50',
            'new_client_address' => 'nullable|string|max:500',

            // Linha e BL
            'shipping_line_id' => 'required|exists:shipping_lines,id',
            'bl_number' => 'required|string|max:100',
            'bl_file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',

            // Container
            'container_number' => 'nullable|string|max:50',
            'container_type' => 'required|in:20DC,40DC,40HC,20RF,40RF,20OT,40OT',
            'vessel_name' => 'nullable|string|max:100',
            'arrival_date' => 'nullable|date',

            // Rota
            'origin_port' => 'nullable|string|max:100',
            'destination_port' => 'required|string|max:100',

            // Carga
            'cargo_description' => 'required|string',
            'cargo_weight' => 'nullable|numeric|min:0',
            'cargo_value' => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            // 1. Criar ou obter cliente (UC-001 - 3a)
            if ($request->filled('new_client_name')) {
                $client = Client::create([
                    'name' => $validated['new_client_name'],
                    'email' => $validated['new_client_email'],
                    'phone' => $validated['new_client_phone'] ?? null,
                    'address' => $validated['new_client_address'] ?? null,
                ]);
                $clientId = $client->id;

                Log::info('Novo cliente criado', ['client_id' => $clientId]);
            } else {
                $clientId = $validated['client_id'];
                $client = Client::find($clientId);
            }

            // 2. Gerar número de referência (UC-001 - Passo 6)
            // Formato: ALEK-YYYY-XXX
            $year = date('Y');
            $lastShipment = Shipment::whereYear('created_at', $year)->count();
            $referenceNumber = sprintf('ALEK-%s-%03d', $year, $lastShipment + 1);

            Log::info('Número de referência gerado', ['reference' => $referenceNumber]);

            // 3. Criar Shipment (UC-001 - Passo 7)
            $shipment = Shipment::create([
                'reference_number' => $referenceNumber,
                'client_id' => $clientId,
                'shipping_line_id' => $validated['shipping_line_id'],
                'bl_number' => $validated['bl_number'],
                'container_number' => $validated['container_number'] ?? null,
                'container_type' => $validated['container_type'],
                'vessel_name' => $validated['vessel_name'] ?? null,
                'arrival_date' => $validated['arrival_date'] ?? null,
                'origin_port' => $validated['origin_port'] ?? null,
                'destination_port' => $validated['destination_port'],
                'cargo_description' => $validated['cargo_description'],
                'cargo_weight' => $validated['cargo_weight'] ?? null,
                'cargo_value' => $validated['cargo_value'] ?? null,
                'created_by' => auth()->id(),
                'status' => ShipmentStatus::COLETA_COTACAO_SOLICITADA->value, // Status inicial correto
            ]);

            Log::info('Shipment criado', ['shipment_id' => $shipment->id]);

            // 4. Upload do BL Original (UC-001 - Passo 4)
            $blPath = $request->file('bl_file')->store("shipments/{$shipment->id}/bl", 'public');

            $shipment->documents()->create([
                'type' => DocumentType::BL_ORIGINAL->value, // ✅ CORREÇÃO: Usar ->value
                'name' => 'BL Original - ' . $validated['bl_number'],
                'path' => $blPath,
                'size' => $request->file('bl_file')->getSize(),
                'uploaded_by' => auth()->id(),
                'metadata' => [
                    'bl_number' => $validated['bl_number'],
                    'uploaded_at_creation' => true,
                ]
            ]);

            Log::info('BL anexado', ['path' => $blPath]);

            // 5. Registrar atividade (UC-001 - Passo 8)
            // VERIFICAR SE A TABELA 'activities' EXISTE
            try {
                $shipment->activities()->create([
                    'user_id' => auth()->id(),
                    'action' => 'created',
                    'description' => 'Shipment criado com BL anexado',
                    'metadata' => [
                        'reference_number' => $referenceNumber,
                        'client_name' => $client->name,
                    ]
                ]);
            } catch (\Exception $e) {
                // Se a tabela activities não existir, apenas loga
                Log::warning('Não foi possível criar activity', ['error' => $e->getMessage()]);
            }

            DB::commit();

            Log::info('Shipment criado com sucesso', [
                'shipment_id' => $shipment->id,
                'reference' => $referenceNumber
            ]);

            // 6. Enviar notificação (UC-001 - Passo 8)
            // NotificationJob::dispatch($shipment, 'shipment_created');

            // 7. Redirecionar com link (UC-001 - Passo 9)
            return redirect()
                ->route('shipments.show', $shipment)
                ->with('success', "Shipment {$referenceNumber} criado com sucesso! Processo iniciado na Fase 1.");

        } catch (\Exception $e) {
            DB::rollBack();

            // Log do erro completo
            Log::error('Erro ao criar shipment', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $request->except('bl_file')
            ]);

            // Deletar arquivo se upload foi bem-sucedido mas processo falhou
            if (isset($blPath)) {
                Storage::disk('public')->delete($blPath);
            }

            return back()
                ->withErrors(['error' => 'Erro ao criar shipment: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Exibir detalhes do Shipment com todas as 7 fases
     * Baseado no SRS - UC-003
     */
   /**
 * Exibir detalhes do Shipment - VERSÃO SEGURA
 * Substituir no ShipmentController.php
 */
public function show(Shipment $shipment)
{
    try {
        // Carregar relacionamentos básicos
        $shipment->load([
            'shippingLine',
            'client',
            'documents.uploader',
        ]);

        // Tentar carregar activities (pode não existir)
        try {
            $shipment->load(['activities' => function($query) {
                $query->latest()->limit(10);
            }]);
        } catch (\Exception $e) {
            Log::info('Activities não disponível', ['error' => $e->getMessage()]);
        }

        // Tentar obter checklist (pode falhar se Enum não existir)
        try {
            $checklist = $this->workflow->getDocumentChecklist($shipment);
        } catch (\Exception $e) {
            Log::warning('Erro ao obter checklist', ['error' => $e->getMessage()]);
            $checklist = [];
        }

        // Tentar obter progresso
        try {
            $progressValue = $this->workflow->getProgress($shipment);
            $currentPhase = ShipmentStatus::getPhase($shipment->status);
            $currentStatusLabel = ShipmentStatus::labels()[$shipment->status] ?? 'Desconhecido';
        } catch (\Exception $e) {
            Log::warning('Erro ao calcular progresso', ['error' => $e->getMessage()]);
            $progressValue = 0;
            $currentPhase = 1;
            $currentStatusLabel = $shipment->status;
        }

        $progress = [
            'progress' => $progressValue,
            'current_phase' => $currentPhase,
            'current_status' => $shipment->status,
            'current_status_label' => $currentStatusLabel,
        ];

        // Tentar obter próximo status
        try {
            $nextStatus = $this->workflow->getNextStatus($shipment);
            $canAdvance = $nextStatus && $this->workflow->hasRequiredDocuments($shipment, $nextStatus);
        } catch (\Exception $e) {
            Log::warning('Erro ao obter próximo status', ['error' => $e->getMessage()]);
            $nextStatus = null;
            $canAdvance = false;
        }

        return Inertia::render('Shipments/Show', [
            'shipment' => $shipment,
            'checklist' => $checklist,
            'progress' => $progress,
            'nextStatus' => $nextStatus,
            'canAdvance' => $canAdvance,
        ]);

    } catch (\Exception $e) {
        Log::error('Erro ao exibir shipment', [
            'shipment_id' => $shipment->id,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        // Se tudo falhar, mostrar versão minimalista
        return Inertia::render('Shipments/Show', [
            'shipment' => $shipment,
            'checklist' => [],
            'progress' => [
                'progress' => 0,
                'current_phase' => 1,
                'current_status' => $shipment->status,
                'current_status_label' => $shipment->status,
            ],
            'nextStatus' => null,
            'canAdvance' => false,
            'error' => 'Alguns recursos não estão disponíveis. Verifique os logs.',
        ]);
    }
}

public function edit(Shipment $shipment)
{
    return Inertia::render('Shipments/Edit', [
        'shipment' => $shipment,
        'shippingLines' => ShippingLine::where('active', true)->get(),
        'clients' => Client::orderBy('name')->get(),
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

        return back()->with('success', 'Shipment atualizado com sucesso!');
    }

    public function destroy(Shipment $shipment)
    {
        $shipment->delete();

        return redirect()->route('shipments.index')
            ->with('success', 'Shipment removido com sucesso!');
    }

    /**
     * Avançar para próxima etapa
     */
    public function advance(Shipment $shipment)
    {
        $nextStatus = $this->workflow->getNextStatus($shipment);

        if (!$nextStatus) {
            return back()->withErrors(['error' => 'Não há próxima etapa disponível.']);
        }

        try {
            $this->workflow->transition(
                $shipment,
                $nextStatus,
                auth()->id(),
                'Avançado automaticamente via interface'
            );

            return back()->with('success', 'Etapa avançada com sucesso!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Upload de documento específico
     */
    public function uploadDocument(Request $request, Shipment $shipment, string $docType)
    {
        $validated = $request->validate([
            'document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'notes' => 'nullable|string',
        ]);

        // Upload do arquivo
        $path = $request->file('document')->store("documents/{$docType}", 'public');

        // Criar documento
        $shipment->documents()->create([
            'type' => $docType,
            'name' => $request->file('document')->getClientOriginalName(),
            'path' => $path,
            'size' => $request->file('document')->getSize(),
            'uploaded_by' => auth()->id(),
            'metadata' => [
                'notes' => $validated['notes'],
                'uploaded_at' => now(),
            ]
        ]);

        // Registrar atividade
        try {
            $shipment->activities()->create([
                'user_id' => auth()->id(),
                'action' => 'document_uploaded',
                'description' => "Documento anexado: " . DocumentType::labels()[$docType],
            ]);
        } catch (\Exception $e) {
            // Ignora se tabela activities não existir
        }

        return back()->with('success', 'Documento anexado com sucesso!');
    }
}
