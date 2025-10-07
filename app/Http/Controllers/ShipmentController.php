<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\ShippingLine;
use App\Services\ShipmentWorkflowService;
use Illuminate\Http\Request;
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
        $query = Shipment::with(['shippingLine', 'stages'])
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
            'shippingLines' => ShippingLine::where('active', true)->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'shipping_line_id' => 'required|exists:shipping_lines,id',
            'bl_number' => 'nullable|string',
            'container_number' => 'nullable|string',
            'vessel_name' => 'nullable|string',
            'arrival_date' => 'nullable|date',
            'origin_port' => 'nullable|string',
            'destination_port' => 'nullable|string',
            'cargo_description' => 'nullable|string',
        ]);

        // Gerar número de referência automático (ALEK-YYYY-XXX)
        $year = date('Y');
        $lastShipment = Shipment::whereYear('created_at', $year)->count();
        $referenceNumber = sprintf('ALEK-%s-%03d', $year, $lastShipment + 1);

        $shipment = Shipment::create([
            ...$validated,
            'reference_number' => $referenceNumber,
            'created_by' => auth()->id(),
            'status' => 'draft'
        ]);

        return redirect()->route('shipments.show', $shipment)
            ->with('success', 'Shipment criado com sucesso!');
    }

    /**
     * Exibir detalhes do Shipment com todas as 7 fases
     * Baseado no SRS - UC-003
     */
    public function show(Shipment $shipment)
    {
        // Carregar relacionamentos
        $shipment->load([
            'shippingLine',
            'documents.uploader',
            'activities.user' => function($query) {
                $query->latest()->limit(10);
            }
        ]);

        // Obter checklist de documentos da fase atual
        $checklist = $this->workflow->getDocumentChecklist($shipment);

        // Obter progresso
        $progress = [
            'progress' => $this->workflow->getProgress($shipment),
            'current_phase' => \App\Enums\ShipmentStatus::getPhase($shipment->status),
            'current_status' => $shipment->status,
            'current_status_label' => \App\Enums\ShipmentStatus::labels()[$shipment->status] ?? null,
        ];

        // Próximo status permitido
        $nextStatus = $this->workflow->getNextStatus($shipment);

        // Verificar se pode avançar
        $canAdvance = $nextStatus && $this->workflow->hasRequiredDocuments($shipment, $nextStatus);

        return Inertia::render('Shipments/Show', [
            'shipment' => $shipment,
            'checklist' => $checklist,
            'progress' => $progress,
            'nextStatus' => $nextStatus,
            'canAdvance' => $canAdvance,
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
        $shipment->activities()->create([
            'user_id' => auth()->id(),
            'action' => 'document_uploaded',
            'description' => "Documento anexado: " . \App\Enums\DocumentType::labels()[$docType],
        ]);

        return back()->with('success', 'Documento anexado com sucesso!');
    }
}
