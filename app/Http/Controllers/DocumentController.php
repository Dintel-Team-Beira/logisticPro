<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Shipment;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DocumentController extends Controller
{
    /**
     * INDEX: Mostrar todos os processos (como pastas)
     * Interface de File Manager
     */
    public function index(Request $request)
    {
        // Buscar todos os shipments com contagem de documentos
        $query = Shipment::with(['client', 'documents'])
            ->withCount('documents')
            ->latest();

        // Filtro de busca
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                  ->orWhere('bl_number', 'like', "%{$search}%")
                  ->orWhereHas('client', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $shipments = $query->paginate(24)->withQueryString();

        // Estatísticas gerais
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
     * SHOW: Mostrar documentos de um processo específico
     * Interface de visualização de arquivos
     */
    public function show(Shipment $shipment)
    {
        $shipment->load(['client', 'documents' => function($query) {
            $query->latest();
        }, 'documents.uploader']);

        // Organizar documentos por tipo
        $documentsByType = $shipment->documents->groupBy('type');

        return Inertia::render('Documents/Show', [
            'shipment' => $shipment,
            'documents' => $shipment->documents,
            'documentsByType' => $documentsByType,
        ]);
    }

    /**
     * Upload de documento (mantendo campos atuais)
     */
    public function store(Request $request, Shipment $shipment)
    {
        $request->validate([
            'file' => 'required|file|max:10240',
            'type' => 'required|string',
        ]);

        $file = $request->file('file');
        $path = $file->store('documents/' . $shipment->id, 'public');

        $document = Document::create([
            'shipment_id' => $shipment->id,
            'type' => $request->type,
            'name' => $file->getClientOriginalName(),
            'path' => $path,
            'size' => $file->getSize(),
            'uploaded_by' => auth()->id(),
            'metadata' => [
                'mime_type' => $file->getMimeType(),
                'original_name' => $file->getClientOriginalName(),
            ]
        ]);

        Activity::create([
            'shipment_id' => $shipment->id,
            'user_id' => auth()->id(),
            'action' => 'document_uploaded',
            'description' => "Documento '{$document->name}' foi enviado"
        ]);

        return back()->with('success', 'Documento enviado com sucesso!');
    }

    /**
     * Download de documento
     */
    public function download(Document $document)
    {
        if (!Storage::disk('public')->exists($document->path)) {
            abort(404, 'Arquivo não encontrado');
        }

        Activity::create([
            'shipment_id' => $document->shipment_id,
            'user_id' => auth()->id(),
            'action' => 'document_downloaded',
            'description' => "Documento '{$document->name}' foi baixado"
        ]);

        return Storage::disk('public')->download($document->path, $document->name);
    }

    /**
     * Deletar documento
     */
    public function destroy(Document $document)
    {
        Storage::disk('public')->delete($document->path);

        Activity::create([
            'shipment_id' => $document->shipment_id,
            'user_id' => auth()->id(),
            'action' => 'document_deleted',
            'description' => "Documento '{$document->name}' foi removido"
        ]);

        $document->delete();

        return back()->with('success', 'Documento removido com sucesso!');
    }
}
