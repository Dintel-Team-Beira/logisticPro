<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\ShippingLine;
use App\Models\Client;
use App\Services\ShipmentWorkflowService;
use App\Enums\DocumentType;
use App\Enums\ShipmentStatus;
use App\Models\Activity;
use App\Models\Document;
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
    public function store(Request $request, Shipment $shipment)
    {
        // Log para debug
        Log::info('DocumentController@store - Upload iniciado', [
            'shipment_id' => $shipment->id,
            'type' => $request->type,
            'stage' => $request->stage,
            'has_file' => $request->hasFile('file'),
        ]);

        // ✅ Validação completa
        $validated = $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240', // 10MB
            'type' => 'required|string|max:50',
            'stage' => 'required|in:coleta_dispersa,legalizacao,alfandegas,cornelder,taxacao,financas,pod',
            'notes' => 'nullable|string|max:500',
        ]);

        try {
            // Upload do arquivo
            $file = $request->file('file');
            $path = $file->store("documents/shipments/{$shipment->id}/{$validated['stage']}", 'public');

            // Criar registro no banco
            $document = Document::create([
                'shipment_id' => $shipment->id,
                'type' => $validated['type'],
                'name' => $file->getClientOriginalName(),
                'path' => $path,
                'size' => $file->getSize(),
                'uploaded_by' => auth()->id(),
                'metadata' => [
                    'stage' => $validated['stage'],
                    'notes' => $validated['notes'] ?? null,
                    'mime_type' => $file->getMimeType(),
                    'uploaded_at' => now()->toDateTimeString(),
                ]
            ]);

            Log::info('Documento criado com sucesso', [
                'document_id' => $document->id,
                'path' => $path
            ]);

            // Registrar atividade
            try {
                Activity::create([
                    'shipment_id' => $shipment->id,
                    'user_id' => auth()->id(),
                    'action' => 'document_uploaded',
                    'description' => "Documento anexado: {$file->getClientOriginalName()}",
                    'metadata' => [
                        'document_id' => $document->id,
                        'document_type' => $validated['type'],
                        'stage' => $validated['stage']
                    ]
                ]);
            } catch (\Exception $e) {
                Log::warning('Activity não registrada', ['error' => $e->getMessage()]);
            }

            // ✅ Verificar se deve atualizar status do shipment
            $this->checkAndUpdateShipmentStatus($shipment, $validated['type'], $validated['stage']);

            return back()->with('success', 'Documento enviado com sucesso!');

        } catch (\Exception $e) {
            Log::error('Erro ao fazer upload de documento', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withErrors([
                'error' => 'Erro ao fazer upload: ' . $e->getMessage()
            ]);
        }
    }


        /**
     * Verificar e atualizar status do shipment baseado no documento anexado
     */
    private function checkAndUpdateShipmentStatus(Shipment $shipment, string $docType, string $stage)
    {
        try {
            // Exemplo: Se anexou invoice na fase coleta, atualizar quotation_status
            if ($stage === 'coleta_dispersa' && $docType === 'invoice') {
                $shipment->update(['quotation_status' => 'received']);
            }

            // Exemplo: Se anexou receipt na fase coleta, pode marcar pagamento
            if ($stage === 'coleta_dispersa' && $docType === 'receipt') {
                $shipment->update(['payment_status' => 'paid']);
            }

            // Adicione mais regras conforme necessário
        } catch (\Exception $e) {
            Log::warning('Erro ao atualizar status do shipment', [
                'error' => $e->getMessage()
            ]);
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

 /**
     * Download de documento
     */
    public function download(Document $document)
    {
        try {
            if (!Storage::disk('public')->exists($document->path)) {
                return back()->withErrors(['error' => 'Arquivo não encontrado']);
            }

            return Storage::disk('public')->download($document->path, $document->name);
        } catch (\Exception $e) {
            Log::error('Erro ao fazer download', [
                'document_id' => $document->id,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['error' => 'Erro ao baixar arquivo']);
        }
    }

    /**
     * Deletar documento
     */
    public function destroy(Document $document)
    {
        try {
            // Deletar arquivo do storage
            if (Storage::disk('public')->exists($document->path)) {
                Storage::disk('public')->delete($document->path);
            }

            // Registrar atividade
            try {
                Activity::create([
                    'shipment_id' => $document->shipment_id,
                    'user_id' => auth()->id(),
                    'action' => 'document_deleted',
                    'description' => "Documento removido: {$document->name}",
                    'metadata' => [
                        'document_id' => $document->id,
                        'document_type' => $document->type
                    ]
                ]);
            } catch (\Exception $e) {
                Log::warning('Activity não registrada', ['error' => $e->getMessage()]);
            }

            // Deletar registro
            $document->delete();

            return back()->with('success', 'Documento removido com sucesso!');

        } catch (\Exception $e) {
            Log::error('Erro ao deletar documento', [
                'document_id' => $document->id,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['error' => 'Erro ao remover documento']);
        }
    }


   /**
 * Avançar para a próxima fase
 *
 * Este método permite avançar manualmente para a próxima fase do processo
 * Baseado no sistema de stages
 */
public function advance(Request $request, Shipment $shipment)
{
    try {
        DB::beginTransaction();

        // Obter stage atual
        $currentStage = $shipment->currentStage();

        if (!$currentStage) {
            return back()->withErrors(['error' => 'Nenhuma fase ativa encontrada.']);
        }

        // Validar se pode avançar (verificar documentos necessários, pagamentos, etc)
        $validationErrors = $this->validatePhaseCompletion($shipment, $currentStage);

        if (!empty($validationErrors)) {
            return back()->withErrors(['error' => implode(', ', $validationErrors)]);
        }

        // Completar stage atual e avançar
        $nextStage = $shipment->advanceToNextStage();

        if ($nextStage) {
            // Registrar atividade
            try {
                $shipment->activities()->create([
                    'user_id' => auth()->id(),
                    'action' => 'phase_advanced',
                    'description' => "Avançado de '{$currentStage->stage}' para '{$nextStage->stage}'",
                    'metadata' => [
                        'from_stage' => $currentStage->stage,
                        'to_stage' => $nextStage->stage,
                        'from_phase' => $shipment->current_phase - 1,
                        'to_phase' => $shipment->current_phase,
                    ]
                ]);
            } catch (\Exception $e) {
                Log::warning('Activity não registrada', ['error' => $e->getMessage()]);
            }

            DB::commit();

            Log::info('Shipment avançou de fase', [
                'shipment_id' => $shipment->id,
                'from' => $currentStage->stage,
                'to' => $nextStage->stage
            ]);

            return redirect()
                ->route('shipments.show', $shipment)
                ->with('success', "Processo avançou para Fase {$shipment->current_phase}: " . ucfirst(str_replace('_', ' ', $nextStage->stage)));
        } else {
            // Última fase completada
            $shipment->update(['status' => 'completed']);

            DB::commit();

            return redirect()
                ->route('shipments.show', $shipment)
                ->with('success', 'Todas as fases completadas! Processo finalizado.');
        }

    } catch (\Exception $e) {
        DB::rollBack();

        Log::error('Erro ao avançar fase', [
            'shipment_id' => $shipment->id,
            'error' => $e->getMessage()
        ]);

        return back()->withErrors(['error' => 'Erro ao avançar fase: ' . $e->getMessage()]);
    }
}


/**
 * Validar se a fase atual pode ser completada
 *
 * @param Shipment $shipment
 * @param ShipmentStage $currentStage
 * @return array Array de erros (vazio se pode avançar)
 */
private function validatePhaseCompletion(Shipment $shipment, $currentStage): array
{
    $errors = [];

    switch ($currentStage->stage) {
        case 'coleta_dispersa':
            // Fase 1: Verificar se tem cotação recebida e pagamento feito
            if ($shipment->quotation_status !== 'received') {
                $errors[] = 'Aguardando recebimento da cotação';
            }
            if ($shipment->payment_status !== 'paid') {
                $errors[] = 'Pagamento à linha de navegação pendente';
            }
            // Verificar se tem BL anexado
            if (!$shipment->documents()->where('type', 'bl')->exists()) {
                $errors[] = 'BL Original deve ser anexado';
            }
            break;

        case 'legalizacao':
            // Fase 2: Verificar documentos de legalização
            $requiredDocs = ['rascunho_du', 'draft_du'];
            foreach ($requiredDocs as $docType) {
                if (!$shipment->documents()->where('type', $docType)->exists()) {
                    $errors[] = "Documento '{$docType}' não anexado";
                }
            }
            break;

        case 'alfandegas':
            // Fase 3: Verificar pagamentos alfandegários
            if ($shipment->customs_payment_status !== 'paid') {
                $errors[] = 'Pagamento das taxas alfandegárias pendente';
            }
            break;

        case 'cornelder':
            // Fase 4: Verificar pagamento cornelder
            if ($shipment->cornelder_payment_status !== 'paid') {
                $errors[] = 'Pagamento da Cornelder pendente';
            }
            break;

        case 'taxacao':
            // Fase 5: Verificar se cliente foi faturado e pagou
            if (!$shipment->client_invoice_id) {
                $errors[] = 'Fatura do cliente não emitida';
            }
            if ($shipment->client_payment_status !== 'paid') {
                $errors[] = 'Pagamento do cliente pendente';
            }
            break;
    }

    return $errors;
}

/**
 * Obter progresso atual do shipment
 * Endpoint para AJAX
 */
public function getProgress(Shipment $shipment)
{
    try {
        $progressValue = $this->workflow->getProgress($shipment);
        $currentPhase = $shipment->current_phase;

        return response()->json([
            'success' => true,
            'progress' => $progressValue,
            'current_phase' => $currentPhase,
            'current_stage' => $shipment->currentStage()?->stage,
            'can_advance' => empty($this->validatePhaseCompletion($shipment, $shipment->currentStage())),
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Obter checklist de documentos
 * Endpoint para AJAX
 */
public function getChecklist(Shipment $shipment)
{
    try {
        $checklist = $this->workflow->getDocumentChecklist($shipment);

        return response()->json([
            'success' => true,
            'checklist' => $checklist
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
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
