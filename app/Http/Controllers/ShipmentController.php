<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\Client;
use App\Models\PaymentRequest;
use App\Models\ShippingLine;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Notification;
use App\Notifications\ShipmentCreatedNotification;
use App\Notifications\ShipmentStageChangedNotification;
use Inertia\Inertia;

/**
 * ShipmentController - HÍBRIDO
 * Mantém funcionalidade original + adiciona melhorias
 *
 * @author Arnaldo Tomo
 */
class ShipmentController extends Controller
{
    /**
     * Listar shipments
     */
    public function index(Request $request)
    {
        $query = Shipment::with(['shippingLine', 'client', 'stages'])
            ->orderBy('created_at', 'desc');

        // Filtros
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
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
     * Criar novo shipment (MANTIDO DO ORIGINAL)
     */
    public function store(Request $request)
    {


        // dd($request->all());
        Log::info('ShipmentController@store - Iniciando', ['data' => $request->except('bl_file')]);

        DB::beginTransaction();

        try {
            // 1. Validação
            $validated = $request->validate([
                'type' => 'required|in:import,export,transit',
                'client_id' => 'required|exists:clients,id',
                'shipping_line_id' => 'required|exists:shipping_lines,id',
                'bl_number' => 'nullable|string', // Removido unique: um BL pode ter múltiplos containers
                'bl_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
                'container_number' => 'nullable|string',
                'container_type' => 'nullable|string',
                'vessel_name' => 'nullable|string',
                'arrival_date' => 'nullable|date',
                'origin_port' => 'nullable|string',
                'destination_port' => 'nullable|string',
                'cargo_description' => 'nullable|string',
                'cargo_type' => 'nullable|in:normal,perishable,hazardous,oversized',
                'cargo_weight' => 'nullable|numeric',
                'cargo_value' => 'nullable|numeric',
                'has_tax_exemption' => 'boolean',
                'is_reexport' => 'boolean',
            ]);

            Log::info('Validação passou');

            // 2. Gerar número de referência único
            // Buscar o último shipment do ano para garantir sequência correta
            $year = date('Y');

            // Usar lockForUpdate no nível da transação para evitar race conditions
            $lastShipment = Shipment::whereYear('created_at', $year)
                ->where('reference_number', 'like', "ALEK-{$year}-%")
                ->orderBy('id', 'desc') // Usar id ao invés de reference_number para melhor performance
                ->lockForUpdate()
                ->first();

            if ($lastShipment && preg_match('/ALEK-\d{4}-(\d{4})/', $lastShipment->reference_number, $matches)) {
                $nextNumber = intval($matches[1]) + 1;
            } else {
                $nextNumber = 1;
            }

            $referenceNumber = 'ALEK-' . $year . '-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

            Log::info('Número de referência gerado', ['reference' => $referenceNumber]);

            // 3. Criar shipment
            $shipment = Shipment::create([
                'reference_number' => $referenceNumber,
                'type' => $validated['type'],
                'client_id' => $validated['client_id'],
                'shipping_line_id' => $validated['shipping_line_id'],
                'bl_number' => $validated['bl_number'] ?? null,
                'container_number' => $validated['container_number'],
                'container_type' => $validated['container_type'] ?? null,
                'vessel_name' => $validated['vessel_name'] ?? null,
                'arrival_date' => $validated['arrival_date'] ?? null,
                'origin_port' => $validated['origin_port'] ?? null,
                'destination_port' => $validated['destination_port'] ?? null,
                'cargo_description' => $validated['cargo_description'] ?? null,
                'cargo_type' => $validated['cargo_type'] ?? 'normal',
                'cargo_weight' => $validated['cargo_weight'] ?? null,
                'cargo_value' => $validated['cargo_value'] ?? null,
                'has_tax_exemption' => $validated['has_tax_exemption'] ?? false,
                'is_reexport' => $validated['is_reexport'] ?? false,
                'status' => 'active',
                'created_by' => auth()->id(),
            ]);

            Log::info('Shipment criado', ['id' => $shipment->id]);

            // 4. Upload BL (se fornecido)
            if ($request->hasFile('bl_file')) {
                $blFile = $request->file('bl_file');
                $blPath = $blFile->store("documents/shipments/{$shipment->id}/bl", 'public');

                $shipment->documents()->create([
                    'type' => 'bl',
                    'name' => $blFile->getClientOriginalName(),
                    'path' => $blPath,
                    'size' => $blFile->getSize(),
                    'mime_type' => $blFile->getMimeType(),
                    'uploaded_by' => auth()->id(),
                    'metadata' => [
                        'bl_number' => $validated['bl_number'] ?? null,
                        'uploaded_at_creation' => true,
                    ]
                ]);

                Log::info('BL anexado', ['path' => $blPath]);
            }

            // 5. Iniciar Fase 1 automaticamente
            $shipment->startPhase(1, true);

            DB::commit();

            Log::info('Shipment criado com sucesso', [
                'id' => $shipment->id,
                'reference' => $referenceNumber
            ]);

            // Enviar notificações para admins e managers
            $adminsAndManagers = User::whereIn('role', ['admin', 'manager'])->get();
            Notification::send($adminsAndManagers, new ShipmentCreatedNotification($shipment));

            // Redirecionar para a página de detalhes do processo criado...
            return redirect()
                ->route('shipments.show', $shipment)
                ->with('success', $shipment->type === 'export'
                    ? "Processo de Exportação {$referenceNumber} criado com sucesso!"
                    : "Processo de Importação {$referenceNumber} criado com sucesso!"
                );
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
     * Visualizar detalhes do shipment - MELHORADO
     */
    public function show(Shipment $shipment)
    {
        $shipment->load([
            'client',
            'shippingLine',
            'documents',
            'stages',
            'activities.user',
            'paymentRequests' => function ($query) {
                $query->with([
                    'quotationDocument',
                    'paymentProof',
                    'receiptDocument',
                    'requester',
                    'approver',
                ])->orderBy('created_at', 'desc');
            },
        ]);

        // Preparar dados das fases
        $phases = [
            ['id' => 1, 'title' => 'Coleta Dispersa', 'icon' => 'Ship'],
            ['id' => 2, 'title' => 'Legalização', 'icon' => 'FileCheck'],
            ['id' => 3, 'title' => 'Alfândegas', 'icon' => 'Building2'],
            ['id' => 4, 'title' => 'Cornelder', 'icon' => 'Container'],
            ['id' => 5, 'title' => 'Taxação', 'icon' => 'Calculator'],
            ['id' => 6, 'title' => 'Faturação', 'icon' => 'FileText'],
            ['id' => 7, 'title' => 'POD', 'icon' => 'PackageCheck'],
        ];

        // Calcular progresso e status de cada fase
        $phaseProgress = [];
        foreach ($phases as $phase) {
            $phaseId = $phase['id'];
            $stageName = Shipment::getStageNameFromPhase($phaseId);
            $stage = $shipment->stages()->where('stage', $stageName)->first();

        $phaseData = [
    'status' => $stage ? $stage->status : 'pending',
    'progress' => round($shipment->getPhaseProgress($phaseId), 2), // Arredondar para 2 casas decimais
    'can_start' => false,
    'warnings' => [],
    'missing_items' => [],
    'show_payment_request' => false,
];

            // Verificar requisitos para avançar
            $validation = $shipment->canAdvanceToPhase($phaseId);
            $phaseData = array_merge($phaseData, $validation);

            // 🆕 ADICIONAR: Checklist de documentos tradicionais
            $phaseData['checklist'] = $this->getDocumentChecklistForPhase($shipment, $phaseId);

            $phaseProgress[$phaseId] = $phaseData;
        }

        // Calcular progresso geral
        $completedPhases = collect($phaseProgress)->where('status', 'completed')->count();
        $overallProgress = ($completedPhases / 7) * 100;

        // Fases ativas
        $activePhases = $shipment->stages()
            ->where('status', 'in_progress')
            ->pluck('stage')
            ->map(function ($stageName) {
                $map = [
                    'coleta_dispersa' => 1,
                    'legalizacao' => 2,
                    'alfandegas' => 3,
                    'cornelder' => 4,
                    'taxacao' => 5,
                    'faturacao' => 6,
                    'pod' => 7,
                ];
                return $map[$stageName] ?? null;
            })
            ->filter()
            ->values()
            ->toArray();

        // Carregar solicitações de pagamento do shipment
        $paymentRequests = PaymentRequest::where('shipment_id', $shipment->id)
            ->with(['requester', 'approver', 'quotationDocument', 'paymentProof', 'receiptDocument', 'shipment', 'payer'])
            ->orderBy('phase')
            ->orderBy('created_at')
            ->get();

        // dd($phaseProgress);
        return Inertia::render('Shipments/Show', [
            'shipment' => $shipment,
            'phases' => $phases,
            'phaseProgress' => $phaseProgress,
            'overallProgress' => $overallProgress,
            'activePhases' => $activePhases,
            'canForceAdvance' => auth()->user()->hasRole('manager'),
            'paymentRequests' => $paymentRequests
        ]);
    }

    /**
     * Obter checklist de documentos necessários para uma fase
     *
     * @param Shipment $shipment
     * @param int $phase
     * @return array
     */
    private function getDocumentChecklistForPhase(Shipment $shipment, int $phase): array
    {
        // Definir documentos necessários por fase
        $requiredDocsByPhase = [
            1 => [ // Coleta Dispersa
                ['type' => 'bl', 'label' => 'BL Original', 'required' => true],
                ['type' => 'carta_endosso', 'label' => 'Carta de Endosso', 'required' => false],
                ['type' => 'receipt', 'label' => 'Recibo de pagamento', 'required' => false],
            ],
            2 => [ // Legalização
                ['type' => 'bl_carimbado', 'label' => 'BL Carimbado', 'required' => true],
                ['type' => 'delivery_order', 'label' => 'Delivery Order', 'required' => true],
            ],
            3 => [ // Alfândegas
                ['type' => 'packing_list', 'label' => 'Packing List', 'required' => true],
                ['type' => 'commercial_invoice', 'label' => 'Commercial Invoice', 'required' => true],
                ['type' => 'aviso', 'label' => 'Aviso de Taxação', 'required' => false],
                ['type' => 'autorizacao', 'label' => 'Autorização de Saída', 'required' => false],
            ],
            4 => [ // Cornelder
                ['type' => 'draft', 'label' => 'Draft Cornelder', 'required' => true],
                ['type' => 'storage', 'label' => 'Storage', 'required' => false],
                ['type' => 'termo', 'label' => 'Termo da Linha', 'required' => true],
            ],
            5 => [ // Taxação
                ['type' => 'sad', 'label' => 'SAD (Documento Trânsito)', 'required' => true],
                ['type' => 'delivery_order', 'label' => 'Delivery Order', 'required' => true]
                // ['type' => 'bl_carimbado', 'label' => 'BL Carimbado', 'required' => true],
                // ['type' => 'autorizacao', 'label' => 'Autorização de Saída', 'required' => false],
                // / $docs = ['sad', 'termo', 'bl_carimbado', 'autorizacao'];
            ],
            6 => [ // Faturação
                ['type' => 'invoice', 'label' => 'Fatura ao Cliente', 'required' => false],
            ],
            7 => [ // POD
                ['type' => 'pod', 'label' => 'POD (Proof of Delivery)', 'required' => true],
                ['type' => 'signature', 'label' => 'Assinatura do Cliente', 'required' => false],
            ],
        ];

        $requiredDocs = $requiredDocsByPhase[$phase] ?? [];
        $checklist = [];

        // Buscar documentos anexados
        $attachedDocs = $shipment->documents()
            ->get()
            ->groupBy('type');

        foreach ($requiredDocs as $docConfig) {
            $type = $docConfig['type'];
            $docs = $attachedDocs->get($type, collect());
            $isAttached = $docs->isNotEmpty();
            $document = $docs->first();

            $checklist[] = [
                'type' => $type,
                'label' => $docConfig['label'],
                'required' => $docConfig['required'],
                'attached' => $isAttached,
                'document_id' => $document ? $document->id : null,
                'uploaded_at' => $document ? $document->created_at : null,
                'file_name' => $document ? $document->name : null,
            ];
        }

        return $checklist;
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
        try {
            // Deletar documentos físicos
            foreach ($shipment->documents as $doc) {
                if (Storage::disk('public')->exists($doc->path)) {
                    Storage::disk('public')->delete($doc->path);
                }
            }

            $shipment->delete();

            return redirect()
                ->route('shipments.index')
                ->with('success', 'Processo removido com sucesso!');
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Erro ao remover: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Avançar fase - NOVO COM VALIDAÇÃO FLEXÍVEL
     */
    public function advance(Request $request, Shipment $shipment)
    {
        try {
            DB::beginTransaction();

            $phase = $request->input('phase', $shipment->current_phase);
            $force = $request->boolean('force', false);
            $reason = $request->input('reason');

            // Validação flexível
            $validation = $shipment->canAdvanceToPhase($phase);

            // Se não pode avançar e não é forçado
            if (!$validation['can_advance'] && !$force) {
                return back()->with([
                    'warning' => 'Há pendências nesta fase. Deseja continuar mesmo assim?',
                    'validation' => $validation,
                ]);
            }

            // Se é forçado, verificar permissão
            if ($force) {
                $isAdmin = auth()->user()->hasRole('admin') || auth()->user()->role === 'admin';
                if (!$isAdmin) {
                    DB::rollBack();
                    return back()->withErrors([
                        'error' => 'Você não tem permissão para forçar o avanço.'
                    ]);
                }
            }

            // Registrar override se forçado
            if ($force && !empty($validation['warnings'])) {
                try {
                    $shipment->activities()->create([
                        'user_id' => auth()->id(),
                        'action' => 'forced_advance',
                        'description' => "Avançado com pendências: {$reason}",
                        'metadata' => [
                            'warnings' => $validation['warnings'],
                            'phase' => $phase,
                        ],
                    ]);
                } catch (\Exception $e) {
                    Log::warning('Não foi possível registrar activity');
                }
            }

            // Iniciar a fase
            $newStage = $shipment->startPhase($phase, $force);

            if (!$newStage) {
                DB::rollBack();
                return back()->withErrors([
                    'error' => 'Não foi possível iniciar a fase.',
                    'details' => $validation['warnings'],
                ]);
            }

            // Registrar atividade
            try {
                $shipment->activities()->create([
                    'user_id' => auth()->id(),
                    'action' => 'phase_started',
                    'description' => "Iniciada Fase {$phase}: " . $this->getPhaseName($phase),
                ]);
            } catch (\Exception $e) {
                Log::warning('Não foi possível registrar activity');
            }

            DB::commit();

            return back()->with('success', "Fase {$phase} iniciada com sucesso!");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro ao avançar fase', [
                'shipment_id' => $shipment->id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'error' => 'Erro ao avançar: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Completar uma fase - NOVO
     */
    public function completePhase(Request $request, Shipment $shipment)
    {


        $request->validate([
            'phase' => 'required|integer|min:1|max:7',
            'notes' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $phase = $request->phase;
            $success = $shipment->completePhase($phase);
//   dd($request->all());
            if (!$success) {
                DB::rollBack();
                return back()->withErrors([
                    'error' => 'Fase não encontrada ou já completada.'
                ]);
            }

            if ($phase === 5) {
                $shipment->update([
                    'taxation_status' => 'completed'
                ]);
            }

            // Registrar atividade
            try {
                $shipment->activities()->create([
                    'user_id' => auth()->id(),
                    'action' => 'phase_completed',
                    'description' => "Concluída Fase {$phase}: " . $this->getPhaseName($phase),
                    'metadata' => [
                        'notes' => $request->notes,
                    ],
                ]);
            } catch (\Exception $e) {
                Log::warning('Não foi possível registrar activity');
            }

            DB::commit();

            return back()->with('success', "Fase {$phase} completada com sucesso!");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors([
                'error' => 'Erro ao completar fase: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Pausar uma fase - NOVO
     */
    public function pausePhase(Request $request, Shipment $shipment)
    {
        $request->validate([
            'phase' => 'required|integer|min:1|max:7',
            'reason' => 'required|string',
        ]);

        try {
            $stageName = Shipment::getStageNameFromPhase($request->phase);
            $stage = $shipment->stages()->where('stage', $stageName)->first();

            if (!$stage || $stage->status !== 'in_progress') {
                return back()->withErrors([
                    'error' => 'Fase não está em progresso.'
                ]);
            }

            $stage->update([
                'status' => 'paused',
                'updated_by' => auth()->id(),
            ]);

            try {
                $shipment->activities()->create([
                    'user_id' => auth()->id(),
                    'action' => 'phase_paused',
                    'description' => "Pausada Fase {$request->phase}: {$request->reason}",
                ]);
            } catch (\Exception $e) {
                Log::warning('Não foi possível registrar activity');
            }

            return back()->with('success', 'Fase pausada com sucesso!');
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Erro ao pausar fase: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Obter validação de fase - API
     */
    public function getPhaseValidation(Shipment $shipment, int $phase)
    {
        $validation = $shipment->canAdvanceToPhase($phase);
        $checklist = $shipment->getDynamicChecklist($phase);

        return response()->json([
            'phase' => $phase,
            'validation' => $validation,
            'checklist' => $checklist,
            'progress' => $this->getPhaseProgress($shipment, $phase),
        ]);
    }

    // ========================================
    // HELPER METHODS
    // ========================================

    private function getPhaseName(int $phase): string
    {
        $names = [
            1 => 'Coleta Dispersa',
            2 => 'Legalização',
            3 => 'Alfândegas',
            4 => 'Cornelder',
            5 => 'Taxação',
            6 => 'Faturação',
            7 => 'POD',
        ];

        return $names[$phase] ?? 'Desconhecida';
    }

    private function getPhaseStatus(Shipment $shipment, int $phase): string
    {
        $stageName = Shipment::getStageNameFromPhase($phase);
        $stage = $shipment->stages()->where('stage', $stageName)->first();

        if (!$stage) {
            return 'pending';
        }

        return $stage->status;
    }

    private function getPhaseProgress(Shipment $shipment, int $phase): float
    {
        $methods = [
            1 => 'getPhase1Progress',
            2 => 'getPhase2Progress',
            3 => 'getPhase3Progress',
            4 => 'getPhase4Progress',
            5 => 'getPhase5Progress',
            6 => 'getPhase6Progress',
            7 => 'getPhase7Progress',
        ];

        $method = $methods[$phase] ?? null;

        if (!$method || !method_exists($shipment, $method)) {
            return 0;
        }

        return $shipment->$method();
    }


    public function getPaymentRequests(Shipment $shipment)
    {
        // Buscar todas as solicitações de pagamento do shipment
        $paymentRequests = PaymentRequest::where('shipment_id', $shipment->id)
            ->with([
                'requester',
                'approver',
                'payer',
                'quotationDocument',
                'paymentProof',
                'receiptDocument'
            ])
            ->orderBy('phase')
            ->orderBy('created_at')
            ->get()
            ->map(function ($request) {
                return [
                    'id' => $request->id,
                    'shipment_id' => $request->shipment_id,
                    'phase' => $request->phase,
                    'request_type' => $request->request_type,
                    'payee' => $request->payee,
                    'amount' => $request->amount,
                    'currency' => $request->currency,
                    'status' => $request->status,
                    'description' => $request->description,
                    'created_at' => $request->created_at,
                    'updated_at' => $request->updated_at,
                    // Incluir informações adicionais conforme necessário
                    'requester' => $request->requester ? $request->requester->name : null,
                    'approver' => $request->approver ? $request->approver->name : null,
                    'payer' => $request->payer ? $request->payer->name : null,
                ];
            });

        return response()->json($paymentRequests);
    }
}
