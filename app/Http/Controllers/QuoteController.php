<?php

namespace App\Http\Controllers;

use App\Models\Quote;
use App\Models\QuoteItem;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Client;
use App\Models\Shipment;
use App\Models\ServiceCatalog;
use App\Mail\QuoteMail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Barryvdh\DomPDF\Facade\Pdf;

class QuoteController extends Controller
{
    public function index()
    {
        $quotes = Quote::with(['client', 'shipment', 'createdBy'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        // Estatísticas
        $stats = [
            'total' => Quote::count(),
            'draft' => Quote::where('status', 'draft')->count(),
            'sent' => Quote::whereIn('status', ['sent', 'viewed'])->count(),
            'accepted' => Quote::where('status', 'accepted')->count(),
            'converted' => Quote::where('status', 'converted')->count(),
        ];

        return Inertia::render('Quotes/Index', [
            'quotes' => $quotes,
            'stats' => $stats,
        ]);
    }

    public function create()
    {
        $clients = Client::active()->orderBy('name')->get();
        $shipments = Shipment::with('client')->whereNotIn('status', ['completed', 'cancelled'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Quotes/Create', [
            'nextQuoteNumber' => Quote::generateQuoteNumber(),
            'clients' => $clients,
            'shipments' => $shipments,
        ]);
    }

    public function store(Request $request)
    {

        // dd($request->all());
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'shipment_id' => 'nullable|exists:shipments,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'quote_date' => 'required|date',
            'valid_until' => 'required|date|after:quote_date',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'terms' => 'nullable|string',
            'notes' => 'nullable|string',
            'customer_notes' => 'nullable|string',
            'payment_terms' => 'nullable|string',
            'currency' => 'required|in:MZN,USD,EUR',
            'items' => 'required|array|min:1',
            'items.*.service_id' => 'required|exists:service_catalog,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            // Create quote
            $quote = Quote::create([
                'quote_number' => Quote::generateQuoteNumber(),
                'client_id' => $validated['client_id'],
                'shipment_id' => $validated['shipment_id'] ?? null,
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'quote_date' => $validated['quote_date'],
                'valid_until' => $validated['valid_until'],
                'status' => 'draft',
                'discount_percentage' => $validated['discount_percentage'] ?? 0,
                'terms' => $validated['terms'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'customer_notes' => $validated['customer_notes'] ?? null,
                'payment_terms' => $validated['payment_terms'] ?? null,
                'currency' => $validated['currency'],
                'created_by' => auth()->id(),
            ]);

            // Create items
            foreach ($validated['items'] as $index => $itemData) {
                $service = ServiceCatalog::find($itemData['service_id']);

                $item = new QuoteItem([
                    'quote_id' => $quote->id,
                    'service_id' => $service->id,
                    'service_code' => $service->code,
                    'service_name' => $service->name,
                    'description' => $service->description,
                    'category' => $service->category,
                    'quantity' => $itemData['quantity'],
                    'unit' => $service->unit,
                    'unit_price' => $itemData['unit_price'] ?? $service->unit_price,
                    'tax_type' => $service->tax_type,
                    'tax_rate' => $service->tax_rate,
                    'sort_order' => $index,
                ]);

                $item->calculateTotals();
                $quote->items()->save($item);
            }

            // Calculate quote totals
            $quote->calculateTotals();

            DB::commit();

            return redirect()->route('quotes.show', $quote)
                ->with('success', 'Cotação criada com sucesso!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()
                ->with('error', 'Erro ao criar cotação: ' . $e->getMessage());
        }
    }

    public function show(Quote $quote)
    {
        $quote->load(['client', 'shipment', 'items.service', 'createdBy', 'invoice']);

        return Inertia::render('Quotes/Show', [
            'quote' => $quote,
        ]);
    }

    public function edit(Quote $quote)
    {
        if (!in_array($quote->status, ['draft', 'sent'])) {
            return back()->with('error', 'Apenas cotações em rascunho ou enviadas podem ser editadas.');
        }

        $quote->load(['items.service']);
        $clients = Client::active()->orderBy('name')->get();
        $shipments = Shipment::whereNotIn('status', ['completed', 'cancelled'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Quotes/Edit', [
            'quote' => $quote,
            'clients' => $clients,
            'shipments' => $shipments,
        ]);
    }

    public function update(Request $request, Quote $quote)
    {
        if (!in_array($quote->status, ['draft', 'sent'])) {
            return back()->with('error', 'Apenas cotações em rascunho ou enviadas podem ser editadas.');
        }

        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'shipment_id' => 'nullable|exists:shipments,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'quote_date' => 'required|date',
            'valid_until' => 'required|date|after:quote_date',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'terms' => 'nullable|string',
            'notes' => 'nullable|string',
            'customer_notes' => 'nullable|string',
            'payment_terms' => 'nullable|string',
            'currency' => 'required|in:MZN,USD,EUR',
            'items' => 'required|array|min:1',
            'items.*.service_id' => 'required|exists:service_catalog,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            // Update quote
            $quote->update([
                'client_id' => $validated['client_id'],
                'shipment_id' => $validated['shipment_id'] ?? null,
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'quote_date' => $validated['quote_date'],
                'valid_until' => $validated['valid_until'],
                'discount_percentage' => $validated['discount_percentage'] ?? 0,
                'terms' => $validated['terms'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'customer_notes' => $validated['customer_notes'] ?? null,
                'payment_terms' => $validated['payment_terms'] ?? null,
                'currency' => $validated['currency'],
                'updated_by' => auth()->id(),
            ]);

            // Delete old items
            $quote->items()->delete();

            // Create new items
            foreach ($validated['items'] as $index => $itemData) {
                $service = ServiceCatalog::find($itemData['service_id']);

                $item = new QuoteItem([
                    'service_id' => $service->id,
                    'service_code' => $service->code,
                    'service_name' => $service->name,
                    'description' => $service->description,
                    'category' => $service->category,
                    'quantity' => $itemData['quantity'],
                    'unit' => $service->unit,
                    'unit_price' => $itemData['unit_price'] ?? $service->unit_price,
                    'tax_type' => $service->tax_type,
                    'tax_rate' => $service->tax_rate,
                    'sort_order' => $index,
                ]);

                $item->calculateTotals();
                $quote->items()->save($item);
            }

            // Recalculate totals
            $quote->calculateTotals();

            DB::commit();

            return redirect()->route('quotes.show', $quote)
                ->with('success', 'Cotação atualizada com sucesso!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()
                ->with('error', 'Erro ao atualizar cotação: ' . $e->getMessage());
        }
    }

    public function destroy(Quote $quote)
    {
        if ($quote->status === 'converted') {
            return back()->with('error', 'Cotações convertidas não podem ser excluídas.');
        }

        $quote->delete();

        return redirect()->route('quotes.index')
            ->with('success', 'Cotação removida com sucesso!');
    }

    /**
     * Update quote status
     */
    public function updateStatus(Request $request, Quote $quote)
    {
        $validated = $request->validate([
            'status' => 'required|in:draft,sent,viewed,accepted,rejected,expired',
        ]);

        $quote->update([
            'status' => $validated['status'],
            'updated_by' => auth()->id(),
        ]);

        return back()->with('success', 'Status da cotação atualizado!');
    }

    /**
     * Convert quote to invoice
     */
    public function convertToInvoice(Quote $quote)
    {
        if (!$quote->canConvertToInvoice()) {
            return back()->with('error', 'Esta cotação não pode ser convertida em fatura.');
        }

        DB::beginTransaction();
        try {
            // Create invoice with all fields from quote
            $invoice = Invoice::create([
                'invoice_number' => Invoice::generateInvoiceNumber(),
                'invoice_type' => 'quotation',
                'quote_id' => $quote->id,
                'client_id' => $quote->client_id,
                'shipment_id' => $quote->shipment_id,
                'type' => 'client_invoice',
                'description' => $quote->description,
                'subtotal' => $quote->subtotal,
                'discount_percentage' => $quote->discount_percentage,
                'discount_amount' => $quote->discount_amount,
                'tax_amount' => $quote->tax_amount,
                'amount' => $quote->total,
                'currency' => $quote->currency,
                'issue_date' => now(),
                'due_date' => now()->addDays(30),
                'status' => 'pending',
                'notes' => $quote->notes,
                'terms' => $quote->terms,
                'customer_notes' => $quote->customer_notes,
                'payment_terms' => $quote->payment_terms,
                'metadata' => $quote->metadata,
                'created_by' => auth()->id(),
            ]);

            // Create invoice items from quote items
            foreach ($quote->items as $quoteItem) {
                $invoiceItem = InvoiceItem::createFromQuoteItem($quoteItem);
                $invoice->items()->save($invoiceItem);
            }

            // Update quote status
            $quote->update([
                'status' => 'converted',
                'invoice_id' => $invoice->id,
                'converted_at' => now(),
                'updated_by' => auth()->id(),
            ]);

            DB::commit();

            return redirect()->route('invoices.show', $invoice)
                ->with('success', 'Cotação convertida em fatura com sucesso!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Erro ao converter cotação: ' . $e->getMessage());
        }
    }

    /**
     * Export quote to PDF
     */
    public function exportPdf(Quote $quote)
    {
        $quote->load(['client', 'items', 'createdBy']);

        $pdf = Pdf::loadView('pdfs.quote', compact('quote'));
        $pdf->setPaper('a4', 'portrait');

        return $pdf->download("{$quote->quote_number}.pdf");
    }

    /**
     * Send quote by email
     */
    public function sendEmail(Quote $quote)
    {
        $quote->load(['client', 'items']);

        if (!$quote->client->email) {
            return back()->with('error', 'Cliente não possui email cadastrado.');
        }

        try {
            Mail::to($quote->client->email)->send(new QuoteMail($quote));

            // Update status if it's a draft
            if ($quote->status === 'draft') {
                $quote->update([
                    'status' => 'sent',
                    'updated_by' => auth()->id(),
                ]);
            }

            return back()->with('success', "Cotação enviada para {$quote->client->email} com sucesso!");
        } catch (\Exception $e) {
            return back()->with('error', 'Erro ao enviar email: ' . $e->getMessage());
        }
    }
}
