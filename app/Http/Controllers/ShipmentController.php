<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\Client;
use App\Models\ShippingLine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
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

        Log::info('ShipmentController@store - Iniciando', [
            'data' => $request->except('bl_file')
            ]);

            DB::beginTransaction();

            try {
                // 1. Validação
                $validated = $request->validate([
                    'client_id' => 'required|exists:clients,id',
                    'shipping_line_id' => 'required|exists:shipping_lines,id',
                    'bl_number' => 'required|string|unique:shipments',
                    'bl_file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
                    'container_number' => 'required|string',
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

                // 2. Gerar número de referência
                $referenceNumber = 'ALEK-' . date('Y') . '-' . str_pad(
                    Shipment::whereYear('created_at', date('Y'))->count() + 1,
                    4,
                    '0',
                    STR_PAD_LEFT
                );

                Log::info('Número de referência gerado', ['reference' => $referenceNumber]);

                // dd($validated);
                // 3. Criar shipment
                $shipment = Shipment::create([
                'reference_number' => $referenceNumber,
                'client_id' => $validated['client_id'],
                'shipping_line_id' => $validated['shipping_line_id'],
                'bl_number' => $validated['bl_number'],
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
//    dd("sfklbsfkj");
            // 4. Upload BL
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
                    'bl_number' => $validated['bl_number'],
                    'uploaded_at_creation' => true,
                ]
            ]);

            Log::info('BL anexado', ['path' => $blPath]);

            // 5. Iniciar Fase 1 automaticamente
            $shipment->startPhase(1, true);

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
     * Visualizar detalhes do shipment - MELHORADO
     */
    public function show(Shipment $shipment)
    {
        $shipment->load([
            'client',
            'shippingLine',
            'documents',
            'stages' => function($q) {
                $q->orderBy('id', 'desc');
            },

              'paymentRequests' => function($q) {
            $q->with([
                'requester:id,name',
                'approver:id,name',
                'payer:id,name',
                'quotationDocument',      // 🆕 ADICIONAR
                'paymentProof',            // 🆕 ADICIONAR
                'receiptDocument'          // 🆕 ADICIONAR
            ])->latest();

        }
        ]);

        // Tentar carregar activities se existir
        try {
            $shipment->load(['activities' => function($q) {
                $q->latest()->limit(10);
            }]);
        } catch (\Exception $e) {
            Log::info('Activities não disponível');
        }

        // Progresso detalhado por fase
        $phaseProgress = [];
        for ($i = 1; $i <= 7; $i++) {
            $validation = $shipment->canAdvanceToPhase($i);
            $phaseProgress[$i] = [
                'phase' => $i,
                'name' => $this->getPhaseName($i),
                'progress' => $this->getPhaseProgress($shipment, $i),
                'status' => $this->getPhaseStatus($shipment, $i),
                'can_start' => $validation['can_advance'],
                'warnings' => $validation['warnings'],
                'risks' => $validation['risks'],
                'missing_items' => $validation['missing_items'],
                'checklist' => $shipment->getDynamicChecklist($i),
            ];
        }

        // Fases ativas
        $activePhases = $shipment->stages()
            ->where('status', 'in_progress')
            ->get()
            ->map(function($stage) {
                $phaseMap = [
                    'coleta_dispersa' => 1,
                    'legalizacao' => 2,
                    'alfandegas' => 3,
                    'cornelder' => 4,
                    'taxacao' => 5,
                    'faturacao' => 6,
                    'pod' => 7,
                ];
                return $phaseMap[$stage->stage] ?? 1;
            });

        // return Inertia::render('Shipments/Show', [
        //     'shipment' => $shipment,
        //     'phaseProgress' => $phaseProgress,
        //     'activePhases' => $activePhases,
        //     'overallProgress' => $shipment->real_progress,
        //     'canForceAdvance' => auth()->user()->role=='admin' ?? false,
        //      'paymentRequests' => $shipment->paymentRequests,
        // ]);


        return Inertia::render('Shipments/Show', [
        'shipment' => $shipment->load([
            'client',
            'shippingLine',
            'documents',
            'stages',
        ]),
        'phaseProgress' => $phaseProgress, // se você tiver
            'activePhases' => $activePhases,
            'overallProgress' => $shipment->real_progress,
            'canForceAdvance' => auth()->user()->role=='admin' ?? false,
             'paymentRequests' => $shipment->paymentRequests,

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
}
