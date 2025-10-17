<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\Client;
use App\Models\Document;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * SearchController - Pesquisa Global do Sistema
 *
 * @author Arnaldo Tomo
 */
class SearchController extends Controller
{
    /**
     * Pesquisa global em múltiplas entidades
     *
     * GET /api/search?q=termo
     */
    public function search(Request $request)
    {
        $query = $request->input('q', '');

        // Validação
        if (strlen($query) < 2) {
            return response()->json([
                'results' => [],
                'message' => 'Digite pelo menos 2 caracteres'
            ]);
        }

        $results = [
            'shipments' => $this->searchShipments($query),
            'clients' => $this->searchClients($query),
            'documents' => $this->searchDocuments($query),
            'invoices' => $this->searchInvoices($query),
        ];

        // Estatísticas
        $totalResults = collect($results)->sum(fn($items) => count($items));

        return response()->json([
            'results' => $results,
            'total' => $totalResults,
            'query' => $query
        ]);
    }

    /**
     * Pesquisar Shipments
     */
    private function searchShipments($query)
    {
        return Shipment::with(['client', 'shippingLine'])
            ->where(function($q) use ($query) {
                $q->where('reference_number', 'LIKE', "%{$query}%")
                  ->orWhere('bl_number', 'LIKE', "%{$query}%")
                  ->orWhere('container_number', 'LIKE', "%{$query}%")
                  ->orWhere('vessel_name', 'LIKE', "%{$query}%")
                  ->orWhere('cargo_description', 'LIKE', "%{$query}%");
            })
            ->limit(5)
            ->get()
            ->map(function($shipment) {
                return [
                    'id' => $shipment->id,
                    'type' => 'shipment',
                    'title' => $shipment->reference_number,
                    'subtitle' => $shipment->client->name ?? 'Sem cliente',
                    'description' => "BL: {$shipment->bl_number} • Container: {$shipment->container_number}",
                    'status' => $shipment->status,
                    'url' => "/shipments/{$shipment->id}",
                    'meta' => [
                        'shipping_line' => $shipment->shippingLine->name ?? null,
                        'vessel' => $shipment->vessel_name,
                        'arrival_date' => $shipment->arrival_date?->format('d/m/Y'),
                    ]
                ];
            });
    }

    /**
     * Pesquisar Clientes
     */
    private function searchClients($query)
    {
        return Client::where(function($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%")
                  ->orWhere('company_name', 'LIKE', "%{$query}%")
                  ->orWhere('email', 'LIKE', "%{$query}%")
                  ->orWhere('phone', 'LIKE', "%{$query}%")
                  ->orWhere('tax_id', 'LIKE', "%{$query}%");
            })
            ->limit(5)
            ->get()
            ->map(function($client) {
                return [
                    'id' => $client->id,
                    'type' => 'client',
                    'title' => $client->name,
                    'subtitle' => $client->company_name ?? $client->email,
                    'description' => "{$client->phone} • {$client->city}",
                    'status' => $client->active ? 'active' : 'inactive',
                    'url' => "/clients/{$client->id}",
                    'meta' => [
                        'client_type' => $client->client_type,
                        'priority' => $client->priority,
                        'total_shipments' => $client->shipments()->count(),
                    ]
                ];
            });
    }

    /**
     * Pesquisar Documentos
     */
    private function searchDocuments($query)
    {
        return Document::with(['shipment', 'uploader'])
            ->where(function($q) use ($query) {
                $q->where('file_name', 'LIKE', "%{$query}%")
                  ->orWhere('type', 'LIKE', "%{$query}%");
            })
            ->limit(5)
            ->get()
            ->map(function($document) {
                return [
                    'id' => $document->id,
                    'type' => 'document',
                    'title' => $document->file_name,
                    'subtitle' => "Tipo: " . strtoupper($document->type),
                    'description' => "Shipment: {$document->shipment->reference_number} • {$document->formatted_size}",
                    'status' => null,
                    'url' => "/shipments/{$document->shipment_id}#documents",
                    'meta' => [
                        'stage' => $document->stage,
                        'uploaded_by' => $document->uploader->name ?? null,
                        'uploaded_at' => $document->created_at->format('d/m/Y H:i'),
                        'file_url' => $document->url,
                    ]
                ];
            });
    }

    /**
     * Pesquisar Faturas
     */
    private function searchInvoices($query)
    {
        return Invoice::with(['shipment'])
            ->where(function($q) use ($query) {
                $q->where('invoice_number', 'LIKE', "%{$query}%")
                  ->orWhere('issuer', 'LIKE', "%{$query}%");
            })
            ->limit(5)
            ->get()
            ->map(function($invoice) {
                return [
                    'id' => $invoice->id,
                    'type' => 'invoice',
                    'title' => $invoice->invoice_number,
                    'subtitle' => "Emissor: {$invoice->issuer}",
                    'description' => "Valor: {$invoice->amount} {$invoice->currency} • Vencimento: {$invoice->due_date?->format('d/m/Y')}",
                    'status' => $invoice->status,
                    'url' => "/finances/invoices/{$invoice->id}",
                    'meta' => [
                        'shipment' => $invoice->shipment->reference_number ?? null,
                        'type' => $invoice->type,
                        'issue_date' => $invoice->issue_date->format('d/m/Y'),
                    ]
                ];
            });
    }

    /**
     * Pesquisa Rápida (autocomplete)
     * Para uso no header
     */
    public function quickSearch(Request $request)
    {
        $query = $request->input('q', '');

        if (strlen($query) < 2) {
            return response()->json(['results' => []]);
        }

        // Retorna apenas top 3 de cada categoria
        $shipments = $this->searchShipments($query)->take(3);
        $clients = $this->searchClients($query)->take(3);

        return response()->json([
            'results' => [
                'shipments' => $shipments,
                'clients' => $clients,
            ],
            'total' => $shipments->count() + $clients->count()
        ]);
    }
}
