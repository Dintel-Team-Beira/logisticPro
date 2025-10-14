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
 * ShipmentController - VERSÃO MELHORADA
 *
 * Melhorias implementadas:
 * - Validação flexível com warnings
 * - Suporte a fases paralelas
 * - Override para casos urgentes
 * - Checklist dinâmico
 * - Status intermediários
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
        $query = Shipment::with(['client', 'shippingLine', 'stages'])
            ->latest();

        // Filtros
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('phase')) {
            $query->whereHas('stages', function($q) use ($request) {
                $stageName = Shipment::getStageNameFromPhase($request->phase);
                $q->where('stage', $stageName)
                  ->where('status', 'in_progress');
            });
        }

        $shipments = $query->paginate(15);

        // Estatísticas
        $stats = [
            'total' => Shipment::count(),
            'active' => Shipment::where('status', 'active')->count(),
            'completed' => Shipment::where('status', 'completed')->count(),
            'delayed' => Shipment::where('storage_alert', true)->count(),
        ];

        return Inertia::render('Shipments/Index', [
            'shipments' => $shipments,
            'stats' => $stats,
            'filters' => $request->only(['search', 'client_id', 'status', 'phase']),
        ]);
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
            'activities' => function($q) {
                $q->latest()->limit(10);
            }
        ]);

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

        return Inertia::render('Shipments/Show', [
            'shipment' => $shipment,
            'phaseProgress' => $phaseProgress,
            'activePhases' => $activePhases,
            'overallProgress' => $shipment->real_progress,
            'canForceAdvance' => auth()->user()->can('force_advance_shipments'),
        ]);
    }

    /**
     * Avançar para próxima fase - MELHORADO COM WARNINGS
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
            if ($force && !auth()->user()->can('force_advance_shipments')) {
                DB::rollBack();
                return back()->withErrors([
                    'error' => 'Você não tem permissão para forçar o avanço.'
                ]);
            }

            // Registrar override se forçado
            if ($force && !empty($validation['warnings'])) {
                $shipment->activities()->create([
                    'user_id' => auth()->id(),
                    'action' => 'forced_advance',
                    'description' => "Avançado com pendências: {$reason}",
                    'metadata' => [
                        'warnings' => $validation['warnings'],
                        'phase' => $phase,
                    ],
                ]);
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
            $shipment->activities()->create([
                'user_id' => auth()->id(),
                'action' => 'phase_started',
                'description' => "Iniciada Fase {$phase}: " . $this->getPhaseName($phase),
            ]);

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

            // Registrar atividade
            $shipment->activities()->create([
                'user_id' => auth()->id(),
                'action' => 'phase_completed',
                'description' => "Concluída Fase {$phase}: " . $this->getPhaseName($phase),
                'metadata' => [
                    'notes' => $request->notes,
                ],
            ]);

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

            $shipment->activities()->create([
                'user_id' => auth()->id(),
                'action' => 'phase_paused',
                'description' => "Pausada Fase {$request->phase}: {$request->reason}",
            ]);

            return back()->with('success', 'Fase pausada com sucesso!');

        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Erro ao pausar fase: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Upload de documento - MELHORADO
     */
    public function uploadDocument(Request $request, Shipment $shipment)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB
            'type' => 'required|string',
            'phase' => 'required|integer|min:1|max:7',
            'notes' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            // Upload do arquivo
            $file = $request->file('file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('documents/' . $shipment->id, $filename, 'public');

            // Criar documento
            $document = $shipment->documents()->create([
                'type' => $request->type,
                'name' => $file->getClientOriginalName(),
                'path' => $path,
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'uploaded_by' => auth()->id(),
                'metadata' => [
                    'phase' => $request->phase,
                    'notes' => $request->notes,
                ],
            ]);

            // Registrar atividade
            $shipment->activities()->create([
                'user_id' => auth()->id(),
                'action' => 'document_uploaded',
                'description' => "Documento anexado: {$request->type}",
                'metadata' => [
                    'document_id' => $document->id,
                    'phase' => $request->phase,
                ],
            ]);

            DB::commit();

            return back()->with('success', 'Documento enviado com sucesso!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors([
                'error' => 'Erro ao enviar documento: ' . $e->getMessage()
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

        return $stage->status; // in_progress, completed, paused, blocked
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

    // ========================================
    // CRUD BÁSICO
    // ========================================

    public function create()
    {
        return Inertia::render('Shipments/Create', [
            'clients' => Client::where('active', true)->get(),
            'shippingLines' => ShippingLine::where('active', true)->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'shipping_line_id' => 'required|exists:shipping_lines,id',
            'bl_number' => 'required|string|unique:shipments',
            'container_number' => 'required|string',
            'arrival_date' => 'required|date',
            'cargo_description' => 'required|string',
            'cargo_type' => 'nullable|in:normal,perishable,hazardous,oversized',
            'has_tax_exemption' => 'boolean',
            'is_reexport' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            // Gerar número de referência
            $validated['reference_number'] = 'ALEK-' . date('Y') . '-' . str_pad(
                Shipment::whereYear('created_at', date('Y'))->count() + 1,
                4,
                '0',
                STR_PAD_LEFT
            );

            $validated['created_by'] = auth()->id();
            $validated['status'] = 'active';

            $shipment = Shipment::create($validated);

            // Iniciar Fase 1 automaticamente
            $shipment->startPhase(1, true);

            $shipment->activities()->create([
                'user_id' => auth()->id(),
                'action' => 'shipment_created',
                'description' => 'Processo criado',
            ]);

            DB::commit();

            return redirect()
                ->route('shipments.show', $shipment)
                ->with('success', 'Processo criado com sucesso!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()
                ->withInput()
                ->withErrors(['error' => 'Erro ao criar: ' . $e->getMessage()]);
        }
    }

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
}
