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
            'consignees' => \App\Models\Consignee::active()->orderBy('name')->get(),
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
            // 1. Validação base
            $validated = $request->validate([
                'type' => 'required|in:import,export,transit,transport',
                'client_id' => 'required|exists:clients,id',
                'consignee_id' => 'nullable|exists:consignees,id',

                // Campos de Import/Export/Transit
                'shipping_line_id' => $request->type === 'transport' ? 'nullable|exists:shipping_lines,id' : 'required|exists:shipping_lines,id',
                'bl_number' => $request->type === 'import' ? 'required|string|max:255' : 'nullable|string|max:255',
                'bl_file' => $request->type === 'import' ? 'required|file|mimes:pdf,jpg,jpeg,png|max:10240' : 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
                'container_number' => 'nullable|string|max:255',
                'container_type' => [
                    $request->type === 'transport' ? 'nullable' : 'required',
                    'in:20DC,40DC,40HC,20RF,40RF,20OT,40OT'
                ],
                'vessel_name' => 'nullable|string|max:255',
                'arrival_date' => 'nullable|date',
                'origin_port' => $request->type === 'transport' ? 'nullable|string|max:255' : 'required|string|max:255',
                'destination_port' => $request->type === 'transport' ? 'nullable|string|max:255' : 'required|string|max:255',

                // Campos comuns de carga
                'cargo_description' => 'required|string',
                'cargo_type' => 'nullable|string|max:255',
                'cargo_weight' => 'nullable|numeric|min:0',
                'cargo_value' => 'nullable|numeric|min:0',
                'has_tax_exemption' => 'boolean',
                'is_reexport' => 'boolean',

                // Campos específicos de Transport
                'loading_location' => $request->type === 'transport' ? 'required|string|max:255' : 'nullable|string|max:255',
                'unloading_location' => $request->type === 'transport' ? 'required|string|max:255' : 'nullable|string|max:255',
                'distance_km' => $request->type === 'transport' ? 'required|numeric|min:0' : 'nullable|numeric|min:0',
                'empty_return_location' => $request->type === 'transport' ? 'required|string|max:255' : 'nullable|string|max:255',

                // Campos de cotação automática
                'regime' => 'nullable|string|max:255',
                'final_destination' => 'nullable|string|max:255',
                'additional_services' => 'nullable|array',
                'quotation_data' => 'nullable|array',
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

            // Gerar referência de cotação se houver dados
            $quotationReference = null;
            if ($request->has('quotation_data') && !empty($request->quotation_data)) {
                $quotationReference = 'COT-' . $year . '-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
            }

            Log::info('Número de referência gerado', ['reference' => $referenceNumber, 'quotation' => $quotationReference]);

            // 3. Criar shipment
            $shipmentData = [
                'reference_number' => $referenceNumber,
                'type' => $validated['type'],
                'client_id' => $validated['client_id'],
                'consignee_id' => $validated['consignee_id'] ?? null,
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
                // Campos de cotação
                'regime' => $validated['regime'] ?? null,
                'final_destination' => $validated['final_destination'] ?? null,
                'additional_services' => $validated['additional_services'] ?? null,
            ];

            // Adicionar dados de cotação se fornecidos
            if ($quotationReference && isset($validated['quotation_data'])) {
                $quotationData = $validated['quotation_data'];
                $shipmentData['quotation_reference'] = $quotationReference;
                $shipmentData['quotation_subtotal'] = $quotationData['subtotal'] ?? 0;
                $shipmentData['quotation_tax'] = $quotationData['tax'] ?? 0;
                $shipmentData['quotation_total'] = $quotationData['total'] ?? 0;
                $shipmentData['quotation_breakdown'] = $quotationData['breakdown'] ?? [];
                $shipmentData['quotation_status'] = 'pending';
            }

            // Adicionar campos específicos de Transport
            if ($validated['type'] === 'transport') {
                $shipmentData['loading_location'] = $validated['loading_location'] ?? null;
                $shipmentData['unloading_location'] = $validated['unloading_location'] ?? null;
                $shipmentData['distance_km'] = $validated['distance_km'] ?? null;
                $shipmentData['empty_return_location'] = $validated['empty_return_location'] ?? null;
            }

            $shipment = Shipment::create($shipmentData);

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

            // Redirecionar para a tela específica baseado no tipo
            switch ($shipment->type) {
                case 'export':
                    // Para exportação: ir para a tela de preparação de documentos
                    return redirect()
                        ->route('operations.export.preparacao', ['preparacao' => $shipment->id])
                        ->with('success', "Processo de Exportação {$referenceNumber} criado com sucesso!");

                case 'transit':
                    // Para trânsito: ir para a tela de recepção
                    return redirect()
                        ->route('operations.transit.recepcao')
                        ->with('success', "Processo de Trânsito {$referenceNumber} criado com sucesso!");

                case 'transport':
                    // Para transporte: ir para a primeira tela de transporte
                    return redirect()
                        ->route('operations.transport.coleta')
                        ->with('success', "Processo de Transporte {$referenceNumber} criado com sucesso!");

                case 'import':
                default:
                    // Para importação: ir para a tela de coleta dispersa (fase 1)
                    return redirect()
                        ->route('shipments.show', $shipment)
                        ->with('success', "Processo de Importação {$referenceNumber} criado com sucesso!");
            }
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
            ['id' => 1, 'title' => 'Coleta de Despesas', 'icon' => 'Ship'],
            ['id' => 2, 'title' => 'Legalização', 'icon' => 'FileCheck'],
            ['id' => 3, 'title' => 'Alfândegas', 'icon' => 'Building2'],
            ['id' => 4, 'title' => 'Cornelder', 'icon' => 'Container'],
            ['id' => 5, 'title' => 'Carregamentos', 'icon' => 'Calculator'],
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

        // Verificar se existe fatura de cotação
        $quotationInvoice = \App\Models\Invoice::where('shipment_id', $shipment->id)
            ->where('invoice_type', 'quotation')
            ->first();

        // dd($phaseProgress);
        return Inertia::render('Shipments/Show', [
            'shipment' => $shipment,
            'phases' => $phases,
            'phaseProgress' => $phaseProgress,
            'overallProgress' => $overallProgress,
            'activePhases' => $activePhases,
            'canForceAdvance' => auth()->user()->hasRole('manager'),
            'paymentRequests' => $paymentRequests,
            'hasQuotationInvoice' => $quotationInvoice !== null,
            'quotationInvoiceId' => $quotationInvoice?->id,
            'quotationInvoiceNumber' => $quotationInvoice?->invoice_number,
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
                ['type' => 'bl_legalizado', 'label' => 'BL Legalizado', 'required' => true],
                ['type' => 'delivery_order', 'label' => 'Delivery Order (DO)', 'required' => true],
                ['type' => 'outro', 'label' => 'Outro', 'required' => false],
            ],
            3 => [ // Alfândegas
                ['type' => 'aviso_taxacao', 'label' => 'AVISO', 'required' => true],
                ['type' => 'autorizacao_saida', 'label' => 'Autorização', 'required' => true],
                ['type' => 'sad', 'label' => 'SAD', 'required' => true],
                ['type' => 'packing_list', 'label' => 'Packing List', 'required' => false],
                ['type' => 'commercial_invoice', 'label' => 'Commercial Invoice', 'required' => false],
                ['type' => 'outro', 'label' => 'Outro', 'required' => false],
            ],
            4 => [ // Cornelder
                ['type' => 'recibo_cornelder', 'label' => 'RECIBO', 'required' => true],
                ['type' => 'ido', 'label' => 'IDO', 'required' => true],
                ['type' => 'processo_completo_cornelder', 'label' => 'PROCESSO COMPLETO', 'required' => true],
                ['type' => 'appointment', 'label' => 'APPOINTMENT', 'required' => true],
                ['type' => 'draft_cornelder', 'label' => 'Draft', 'required' => false],
                ['type' => 'storage', 'label' => 'Storage', 'required' => false],
                ['type' => 'termo_linha', 'label' => 'Termo', 'required' => false],
                ['type' => 'outro', 'label' => 'Outro', 'required' => false],
            ],
            5 => [ // Carregamentos/Taxação
                ['type' => 'sad', 'label' => 'SAD', 'required' => true],
                ['type' => 'processo_completo_taxacao', 'label' => 'Processos Completo', 'required' => true],
                ['type' => 'carta_porte', 'label' => 'Carta de Porte', 'required' => false],
                ['type' => 'outro', 'label' => 'Outro', 'required' => false],
            ],
            6 => [ // Facturação
                ['type' => 'factura_cliente', 'label' => 'Factura', 'required' => true],
                ['type' => 'pop_cliente', 'label' => 'POP do Cliente', 'required' => false],
                ['type' => 'outro', 'label' => 'Outro', 'required' => false],
            ],
            7 => [ // POD
                ['type' => 'pod', 'label' => 'POD', 'required' => true],
                ['type' => 'devolucao_vazio', 'label' => 'Devolução do Vazio', 'required' => false],
                ['type' => 'assinatura_cliente', 'label' => 'POP', 'required' => false],
                ['type' => 'outro', 'label' => 'Outro', 'required' => false],
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

            // Redirecionar para a página da próxima fase baseado no tipo
            switch ($shipment->type) {
                case 'export':
                    // Mapear fases de exportação para rotas
                    $exportRoutes = [
                        1 => 'operations.export.preparacao',
                        2 => 'operations.export.booking',
                        3 => 'operations.export.inspecao',
                        4 => 'operations.export.despacho',
                        5 => 'operations.export.transporte',
                        6 => 'operations.export.embarque',
                        7 => 'operations.export.acompanhamento',
                    ];

                    if (isset($exportRoutes[$phase])) {
                        return redirect()
                            ->route($exportRoutes[$phase], $phase == 1 ? ['preparacao' => $shipment->id] : [])
                            ->with('success', "Avançado para Fase {$phase}: " . $this->getPhaseName($phase));
                    }
                    break;

                case 'transit':
                    // Mapear fases de trânsito para rotas
                    $transitRoutes = [
                        1 => 'operations.transit.recepcao',
                        2 => 'operations.transit.documentacao',
                        3 => 'operations.transit.desembaraco',
                        4 => 'operations.transit.armazenamento',
                        5 => 'operations.transit.preparacao-partida',
                        6 => 'operations.transit.transporte-saida',
                        7 => 'operations.transit.acompanhamento',
                    ];

                    if (isset($transitRoutes[$phase])) {
                        return redirect()
                            ->route($transitRoutes[$phase])
                            ->with('success', "Avançado para Fase {$phase}: " . $this->getPhaseName($phase));
                    }
                    break;

                case 'transport':
                    // Mapear fases de transporte para rotas (simplificado - 2 fases)
                    $transportRoutes = [
                        1 => 'operations.transport.coleta',
                        2 => 'operations.transport.entrega',
                    ];

                    if (isset($transportRoutes[$phase])) {
                        return redirect()
                            ->route($transportRoutes[$phase])
                            ->with('success', "Avançado para Fase {$phase}: " . $this->getPhaseName($phase));
                    }
                    break;
            }

            // Para importação ou fallback
            return redirect()
                ->route('shipments.show', $shipment)
                ->with('success', "Fase {$phase} iniciada com sucesso!");
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
            1 => 'Coleta de despesas',
            2 => 'Legalização',
            3 => 'Alfândegas',
            4 => 'Cornelder',
            5 => 'Carregamentos',
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

    /**
     * Marcar cotação como paga
     */
    public function markQuotationAsPaid(Shipment $shipment)
    {
        // Verificar se tem cotação
        if (!$shipment->quotation_reference) {
            return back()->with('error', 'Este shipment não possui cotação.');
        }

        // Verificar se já não tem fatura gerada
        $hasInvoice = \DB::table('invoices')
            ->where('shipment_id', $shipment->id)
            ->where('type', 'quotation')
            ->exists();

        if ($hasInvoice) {
            return back()->with('error', 'Não é possível marcar como pago. Fatura já foi gerada.');
        }

        // Atualizar status da cotação
        $shipment->update([
            'quotation_status' => 'paid'
        ]);

        return back()->with('success', 'Cotação marcada como paga com sucesso!');
    }
}
