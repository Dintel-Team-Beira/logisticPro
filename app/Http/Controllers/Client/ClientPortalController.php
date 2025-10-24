<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Shipment;
use App\Models\Invoice;
use App\Models\Quote;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ClientPortalController extends Controller
{
    /**
     * Show client dashboard
     */
    public function dashboard()
    {
        $client = Auth::guard('client')->user();

        // Get statistics
        $stats = [
            'active_shipments' => $client->shipments()
                ->whereNotIn('status', ['completed', 'cancelled'])
                ->count(),
            'completed_shipments' => $client->shipments()
                ->where('status', 'completed')
                ->count(),
            'pending_invoices' => $client->invoices()
                ->where('status', 'pending')
                ->count(),
            'pending_quotes' => $client->quotes()
                ->whereIn('status', ['sent', 'viewed'])
                ->count(),
            'total_paid' => $client->invoices()
                ->where('status', 'paid')
                ->sum('amount'),
        ];

        // Get recent shipments
        $recentShipments = $client->shipments()
            ->with(['shippingLine'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($shipment) {
                return [
                    'id' => $shipment->id,
                    'reference_number' => $shipment->reference_number,
                    'type' => $shipment->type,
                    'status' => $shipment->status,
                    'origin_port' => $shipment->origin_port,
                    'destination_port' => $shipment->destination_port,
                    'estimated_arrival' => $shipment->estimated_arrival_date?->format('d/m/Y'),
                    'progress' => $shipment->progress_percentage ?? 0,
                    'shipping_line' => $shipment->shippingLine?->name,
                ];
            });

        // Get recent invoices
        $recentInvoices = $client->invoices()
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                    'amount' => $invoice->amount,
                    'status' => $invoice->status,
                    'due_date' => $invoice->due_date?->format('d/m/Y'),
                    'is_overdue' => $invoice->due_date && $invoice->due_date->isPast() && $invoice->status !== 'paid',
                ];
            });

        // Get pending quotes
        $pendingQuotes = $client->quotes()
            ->whereIn('status', ['sent', 'viewed'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($quote) {
                return [
                    'id' => $quote->id,
                    'quote_number' => $quote->quote_number,
                    'title' => $quote->title,
                    'total_amount' => $quote->total_amount,
                    'status' => $quote->status,
                    'valid_until' => $quote->valid_until?->format('d/m/Y'),
                    'is_expired' => $quote->valid_until && $quote->valid_until->isPast(),
                ];
            });

        return Inertia::render('Client/Dashboard', [
            'client' => $client->only(['id', 'name', 'company_name', 'email', 'phone']),
            'stats' => $stats,
            'recentShipments' => $recentShipments,
            'recentInvoices' => $recentInvoices,
            'pendingQuotes' => $pendingQuotes,
        ]);
    }

    /**
     * Show all shipments
     */
    public function shipments(Request $request)
    {
        $client = Auth::guard('client')->user();

        $query = $client->shipments()->with(['shippingLine']);

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search')) {
            $query->where('reference_number', 'like', '%' . $request->search . '%');
        }

        $shipments = $query->latest()
            ->paginate(15)
            ->through(function ($shipment) {
                return [
                    'id' => $shipment->id,
                    'reference_number' => $shipment->reference_number,
                    'type' => $shipment->type,
                    'status' => $shipment->status,
                    'origin_port' => $shipment->origin_port,
                    'destination_port' => $shipment->destination_port,
                    'container_number' => $shipment->container_number,
                    'container_type' => $shipment->container_type,
                    'estimated_arrival' => $shipment->estimated_arrival_date?->format('d/m/Y'),
                    'actual_arrival' => $shipment->actual_arrival_date?->format('d/m/Y'),
                    'progress' => $shipment->progress_percentage ?? 0,
                    'shipping_line' => $shipment->shippingLine?->name,
                    'created_at' => $shipment->created_at->format('d/m/Y'),
                ];
            });

        return Inertia::render('Client/Shipments/Index', [
            'shipments' => $shipments,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Show single shipment
     */
    public function shipmentShow($id)
    {
        $client = Auth::guard('client')->user();

        $shipment = $client->shipments()
            ->with(['shippingLine', 'documents', 'activities'])
            ->findOrFail($id);

        return Inertia::render('Client/Shipments/Show', [
            'shipment' => [
                'id' => $shipment->id,
                'reference_number' => $shipment->reference_number,
                'type' => $shipment->type,
                'status' => $shipment->status,
                'origin_port' => $shipment->origin_port,
                'destination_port' => $shipment->destination_port,
                'container_number' => $shipment->container_number,
                'container_type' => $shipment->container_type,
                'commodity' => $shipment->commodity,
                'weight' => $shipment->weight,
                'estimated_arrival' => $shipment->estimated_arrival_date?->format('d/m/Y H:i'),
                'actual_arrival' => $shipment->actual_arrival_date?->format('d/m/Y H:i'),
                'estimated_departure' => $shipment->estimated_departure_date?->format('d/m/Y H:i'),
                'actual_departure' => $shipment->actual_departure_date?->format('d/m/Y H:i'),
                'progress' => $shipment->progress_percentage ?? 0,
                'current_phase' => $shipment->current_phase,
                'shipping_line' => $shipment->shippingLine,
                'documents' => $shipment->documents->map(function ($doc) {
                    return [
                        'id' => $doc->id,
                        'name' => $doc->name,
                        'type' => $doc->type,
                        'file_path' => $doc->file_path,
                        'uploaded_at' => $doc->created_at->format('d/m/Y H:i'),
                    ];
                }),
                'activities' => $shipment->activities->map(function ($activity) {
                    return [
                        'description' => $activity->description,
                        'date' => $activity->created_at->format('d/m/Y H:i'),
                    ];
                }),
                'created_at' => $shipment->created_at->format('d/m/Y H:i'),
            ],
        ]);
    }

    /**
     * Show all documents
     */
    public function documents(Request $request)
    {
        $client = Auth::guard('client')->user();

        $shipmentIds = $client->shipments()->pluck('id');

        $query = Document::whereIn('shipment_id', $shipmentIds)
            ->with('shipment:id,reference_number');

        // Filter by type
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        // Search
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $documents = $query->latest()
            ->paginate(20)
            ->through(function ($doc) {
                return [
                    'id' => $doc->id,
                    'name' => $doc->name,
                    'type' => $doc->type,
                    'shipment_reference' => $doc->shipment?->reference_number,
                    'shipment_id' => $doc->shipment_id,
                    'uploaded_at' => $doc->created_at->format('d/m/Y H:i'),
                ];
            });

        return Inertia::render('Client/Documents/Index', [
            'documents' => $documents,
            'filters' => $request->only(['type', 'search']),
        ]);
    }

    /**
     * Download document
     */
    public function documentDownload($id)
    {
        $client = Auth::guard('client')->user();
        $shipmentIds = $client->shipments()->pluck('id');

        $document = Document::whereIn('shipment_id', $shipmentIds)
            ->findOrFail($id);

        return response()->download(storage_path('app/' . $document->file_path), $document->name);
    }

    /**
     * Show all invoices
     */
    public function invoices(Request $request)
    {
        $client = Auth::guard('client')->user();

        $query = $client->invoices()->with('shipment:id,reference_number');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $invoices = $query->latest()
            ->paginate(15)
            ->through(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                    'shipment_reference' => $invoice->shipment?->reference_number,
                    'amount' => $invoice->amount,
                    'status' => $invoice->status,
                    'issue_date' => $invoice->issue_date?->format('d/m/Y'),
                    'due_date' => $invoice->due_date?->format('d/m/Y'),
                    'paid_date' => $invoice->paid_date?->format('d/m/Y'),
                    'is_overdue' => $invoice->due_date && $invoice->due_date->isPast() && $invoice->status !== 'paid',
                ];
            });

        return Inertia::render('Client/Invoices/Index', [
            'invoices' => $invoices,
            'filters' => $request->only(['status']),
        ]);
    }

    /**
     * Show single invoice
     */
    public function invoiceShow($id)
    {
        $client = Auth::guard('client')->user();

        $invoice = $client->invoices()
            ->with(['shipment', 'items'])
            ->findOrFail($id);

        return Inertia::render('Client/Invoices/Show', [
            'invoice' => [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'shipment' => $invoice->shipment,
                'amount' => $invoice->amount,
                'tax_amount' => $invoice->tax_amount,
                'total_amount' => $invoice->total_amount,
                'status' => $invoice->status,
                'issue_date' => $invoice->issue_date?->format('d/m/Y'),
                'due_date' => $invoice->due_date?->format('d/m/Y'),
                'paid_date' => $invoice->paid_date?->format('d/m/Y'),
                'items' => $invoice->items,
                'notes' => $invoice->notes,
            ],
        ]);
    }

    /**
     * Show all quotes
     */
    public function quotes(Request $request)
    {
        $client = Auth::guard('client')->user();

        $query = $client->quotes()->with('createdBy:id,name');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $quotes = $query->latest()
            ->paginate(15)
            ->through(function ($quote) {
                return [
                    'id' => $quote->id,
                    'quote_number' => $quote->quote_number,
                    'title' => $quote->title,
                    'total_amount' => $quote->total_amount,
                    'status' => $quote->status,
                    'created_at' => $quote->created_at->format('d/m/Y'),
                    'valid_until' => $quote->valid_until?->format('d/m/Y'),
                    'is_expired' => $quote->valid_until && $quote->valid_until->isPast(),
                ];
            });

        return Inertia::render('Client/Quotes/Index', [
            'quotes' => $quotes,
            'filters' => $request->only(['status']),
        ]);
    }

    /**
     * Show single quote
     */
    public function quoteShow($id)
    {
        $client = Auth::guard('client')->user();

        $quote = $client->quotes()
            ->with(['items', 'createdBy:id,name'])
            ->findOrFail($id);

        // Mark as viewed if not already
        if ($quote->status === 'sent') {
            $quote->update(['status' => 'viewed']);
        }

        return Inertia::render('Client/Quotes/Show', [
            'quote' => [
                'id' => $quote->id,
                'quote_number' => $quote->quote_number,
                'title' => $quote->title,
                'description' => $quote->description,
                'total_amount' => $quote->total_amount,
                'tax_amount' => $quote->tax_amount,
                'grand_total' => $quote->grand_total,
                'status' => $quote->status,
                'created_at' => $quote->created_at->format('d/m/Y'),
                'valid_until' => $quote->valid_until?->format('d/m/Y'),
                'is_expired' => $quote->valid_until && $quote->valid_until->isPast(),
                'items' => $quote->items,
                'notes' => $quote->notes,
                'terms_conditions' => $quote->terms_conditions,
                'created_by' => $quote->createdBy,
            ],
        ]);
    }

    /**
     * Accept quote
     */
    public function quoteAccept($id)
    {
        $client = Auth::guard('client')->user();

        $quote = $client->quotes()->findOrFail($id);

        if ($quote->status !== 'sent' && $quote->status !== 'viewed') {
            return back()->with('error', 'Esta cotação não pode ser aceita.');
        }

        if ($quote->valid_until && $quote->valid_until->isPast()) {
            return back()->with('error', 'Esta cotação já expirou.');
        }

        $quote->update(['status' => 'accepted']);

        return back()->with('success', 'Cotação aceita com sucesso! Nossa equipe entrará em contato em breve.');
    }

    /**
     * Reject quote
     */
    public function quoteReject($id, Request $request)
    {
        $client = Auth::guard('client')->user();

        $quote = $client->quotes()->findOrFail($id);

        if ($quote->status !== 'sent' && $quote->status !== 'viewed') {
            return back()->with('error', 'Esta cotação não pode ser rejeitada.');
        }

        $quote->update([
            'status' => 'rejected',
            'rejection_reason' => $request->input('reason'),
        ]);

        return back()->with('success', 'Cotação rejeitada.');
    }
}
