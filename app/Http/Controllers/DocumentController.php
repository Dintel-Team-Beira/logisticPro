<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Shipment;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function store(Request $request, Shipment $shipment)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'type' => 'required|in:invoice,bl,packing_list,receipt,pop,carta_endosso,delivery_order,aviso,autorizacao,draft,storage,sad,termo',
            'stage' => 'required|in:coleta_dispersa,legalizacao,alfandegas,cornelder,taxacao,financas'
        ]);

        $file = $request->file('file');
        $path = $file->store('documents/' . $shipment->id, 'public');

        $document = Document::create([
            'shipment_id' => $shipment->id,
            'type' => $request->type,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'stage' => $request->stage,
            'uploaded_by' => auth()->id()
        ]);

        Activity::create([
            'shipment_id' => $shipment->id,
            'user_id' => auth()->id(),
            'action' => 'document_uploaded',
            'description' => "Documento '{$document->file_name}' foi enviado",
            'metadata' => [
                'document_type' => $request->type,
                'stage' => $request->stage
            ]
        ]);

        return back()->with('success', 'Documento enviado com sucesso!');
    }

    public function destroy(Document $document)
    {
        Storage::disk('public')->delete($document->file_path);

        Activity::create([
            'shipment_id' => $document->shipment_id,
            'user_id' => auth()->id(),
            'action' => 'document_deleted',
            'description' => "Documento '{$document->file_name}' foi removido"
        ]);

        $document->delete();

        return back()->with('success', 'Documento removido com sucesso!');
    }

    public function download(Document $document)
    {
        return Storage::disk('public')->download($document->file_path, $document->file_name);
    }
}
