<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Shipment;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DocumentController extends Controller
{
    /**
     * INDEX: Repositório de Documentos
     */
    public function index(Request $request)
    {
        $query = Shipment::with(['client:id,name', 'shippingLine:id,name'])
            ->withCount('documents')
            ->latest();

        // Filtro de busca
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                  ->orWhere('bl_number', 'like', "%{$search}%")
                  ->orWhere('container_number', 'like', "%{$search}%")
                  ->orWhereHas('client', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $shipments = $query->paginate(24)->through(function($shipment) {
            return [
                'id' => $shipment->id,
                'reference_number' => $shipment->reference_number,
                'bl_number' => $shipment->bl_number,
                'container_number' => $shipment->container_number,
                'current_phase' => $shipment->current_phase ?? 'phase_1',
                'phase_label' => $this->getPhaseLabelPortuguese($shipment->current_phase),
                'documents_count' => $shipment->documents_count,
                'created_at' => $shipment->created_at->toISOString(),
                'client' => $shipment->client ? [
                    'id' => $shipment->client->id,
                    'name' => $shipment->client->name,
                ] : null,
                'shipping_line' => $shipment->shippingLine ? [
                    'id' => $shipment->shippingLine->id,
                    'name' => $shipment->shippingLine->name,
                ] : null,
            ];
        });

        $stats = [
            'total_shipments' => Shipment::count(),
            'total_documents' => Document::count(),
            'recent_uploads' => Document::where('created_at', '>=', now()->subDays(7))->count(),
        ];

        return Inertia::render('Documents/Index', [
            'shipments' => $shipments,
            'stats' => $stats,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * SHOW: Documentos de um Shipment específico
     * 🔧 VERSÃO CORRIGIDA E OTIMIZADA
     */
    public function show($shipmentId)
    {
        // Log para debug
        Log::info('DocumentController@show', [
            'shipment_id' => $shipmentId
        ]);

        // Buscar o shipment com todos os relacionamentos necessários
        $shipment = Shipment::with([
            'client:id,name,email',
            'shippingLine:id,name',
            'documents' => function($query) {
                $query->with('uploader:id,name')
                      ->latest('created_at');
            }
        ])->findOrFail($shipmentId);

        // Log dos documentos encontrados
        Log::info('Documentos encontrados', [
            'count' => $shipment->documents->count(),
            'shipment_id' => $shipment->id
        ]);

        // Organizar documentos por tipo
        $documentsByType = $shipment->documents->groupBy('type');

        // Preparar dados do shipment para o frontend
        $shipmentData = [
            'id' => $shipment->id,
            'reference_number' => $shipment->reference_number,
            'bl_number' => $shipment->bl_number,
            'container_number' => $shipment->container_number,
            'current_phase' => $shipment->current_phase ?? 'phase_1',
            'phase_label' => $this->getPhaseLabelPortuguese($shipment->current_phase),
            'client' => $shipment->client ? [
                'id' => $shipment->client->id,
                'name' => $shipment->client->name,
                'email' => $shipment->client->email,
            ] : null,
            'shipping_line' => $shipment->shippingLine ? [
                'id' => $shipment->shippingLine->id,
                'name' => $shipment->shippingLine->name,
            ] : null,
        ];

        // Preparar documentos para o frontend
        $documents = $shipment->documents->map(function($doc) {
            return [
                'id' => $doc->id,
                'shipment_id' => $doc->shipment_id,
                'type' => $doc->type,
                'name' => $doc->name,
                'path' => $doc->path,
                'size' => $doc->size,
                'uploader' => $doc->uploader ? [
                    'id' => $doc->uploader->id,
                    'name' => $doc->uploader->name,
                ] : null,
                'created_at' => $doc->created_at->toISOString(),
                'updated_at' => $doc->updated_at->toISOString(),
            ];
        });

        return Inertia::render('Documents/Show', [
            'shipment' => $shipmentData,
            'documents' => $documents,
            'documentsByType' => $documentsByType,
        ]);
    }

    /**
     * UPLOAD de documento
     */
    public function store(Request $request, Shipment $shipment)
    {
        // Validação
        $validated = $request->validate([
            'file' => 'required|file|max:10240', // 10MB
            'type' => 'required|string|max:50',
            'notes' => 'nullable|string|max:500',
        ]);

        try {
            $file = $request->file('file');

            // Armazenar arquivo
            $path = $file->store('documents/shipments/' . $shipment->id, 'public');

            // Criar registro do documento
            $document = Document::create([
                'shipment_id' => $shipment->id,
                'type' => $validated['type'],
                'name' => $file->getClientOriginalName(),
                'path' => $path,
                'size' => $file->getSize(),
                'uploaded_by' => auth()->id(),
                'metadata' => [
                    'mime_type' => $file->getMimeType(),
                    'original_name' => $file->getClientOriginalName(),
                    'notes' => $validated['notes'] ?? null,
                ],
            ]);

            // Registrar atividade
            Activity::create([
                'shipment_id' => $shipment->id,
                'user_id' => auth()->id(),
                'action' => 'document_uploaded',
                'description' => "Documento '{$document->name}' foi enviado",
            ]);

            Log::info('Documento enviado com sucesso', [
                'document_id' => $document->id,
                'shipment_id' => $shipment->id,
            ]);

            return back()->with('success', 'Documento enviado com sucesso!');

        } catch (\Exception $e) {
            Log::error('Erro ao enviar documento', [
                'error' => $e->getMessage(),
                'shipment_id' => $shipment->id,
            ]);

            return back()->with('error', 'Erro ao enviar documento: ' . $e->getMessage());
        }
    }

    /**
     * DOWNLOAD de documento
     */
    public function download(Document $document)
    {
        try {
            if (!Storage::disk('public')->exists($document->path)) {
                abort(404, 'Arquivo não encontrado');
            }

            // Registrar atividade
            Activity::create([
                'shipment_id' => $document->shipment_id,
                'user_id' => auth()->id(),
                'action' => 'document_downloaded',
                'description' => "Documento '{$document->name}' foi baixado",
            ]);

            return Storage::disk('public')->download($document->path, $document->name);

        } catch (\Exception $e) {
            Log::error('Erro ao baixar documento', [
                'error' => $e->getMessage(),
                'document_id' => $document->id,
            ]);

            abort(404, 'Erro ao baixar arquivo');
        }
    }

    /**
     * DELETE de documento
     */
    public function destroy(Document $document)
    {
        try {
            $shipmentId = $document->shipment_id;
            $documentName = $document->name;

            // Deletar arquivo físico
            if (Storage::disk('public')->exists($document->path)) {
                Storage::disk('public')->delete($document->path);
            }

            // Registrar atividade antes de deletar
            Activity::create([
                'shipment_id' => $shipmentId,
                'user_id' => auth()->id(),
                'action' => 'document_deleted',
                'description' => "Documento '{$documentName}' foi removido",
            ]);

            // Deletar registro
            $document->delete();

            Log::info('Documento removido com sucesso', [
                'document_id' => $document->id,
                'shipment_id' => $shipmentId,
            ]);

            return back()->with('success', 'Documento removido com sucesso!');

        } catch (\Exception $e) {
            Log::error('Erro ao remover documento', [
                'error' => $e->getMessage(),
                'document_id' => $document->id,
            ]);

            return back()->with('error', 'Erro ao remover documento: ' . $e->getMessage());
        }
    }

    /**
     * Helper: Traduzir fases para português
     */
    private function getPhaseLabelPortuguese($phase)
    {
        $labels = [
            'phase_1' => 'Coleta de Dispersa',
            'phase_2' => 'Legalização',
            'phase_3' => 'Alfândegas',
            'phase_4' => 'Cornelder',
            'phase_5' => 'Taxação',
            'phase_6' => 'Carregamento',
            'phase_7' => 'POD',
            'completed' => 'Concluído',
        ];

        return $labels[$phase] ?? 'Em Processo';
    }
}
