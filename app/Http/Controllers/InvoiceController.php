<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Shipment;
use App\Models\Activity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Invoice::with(['shipment.shippingLine'])
            ->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $invoices = $query->paginate(15);

        return Inertia::render('Invoices/Index', [
            'invoices' => $invoices,
            'filters' => $request->only(['status', 'type'])
        ]);
    }

    public function create()
    {
        $shipments = Shipment::with('shippingLine')
            ->where('status', '!=', 'completed')
            ->get();

        return Inertia::render('Invoices/Create', [
            'shipments' => $shipments
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'shipment_id' => 'required|exists:shipments,id',
            'type' => 'required|in:coleta_dispersa,alfandegas,cornelder,outros',
            'issuer' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|string|size:3',
            'issue_date' => 'required|date',
            'due_date' => 'nullable|date|after:issue_date',
            'notes' => 'nullable|string'
        ]);

        $invoice = Invoice::create([
            ...$validated,
            'invoice_number' => 'INV-' . date('Y') . '-' . str_pad(Invoice::max('id') + 1, 5, '0', STR_PAD_LEFT),
            'status' => 'pending'
        ]);

        Activity::create([
            'shipment_id' => $invoice->shipment_id,
            'user_id' => auth()->id(),
            'action' => 'invoice_created',
            'description' => "Fatura {$invoice->invoice_number} criada",
            'metadata' => [
                'invoice_type' => $validated['type'],
                'amount' => $validated['amount']
            ]
        ]);

        return redirect()->route('invoices.show', $invoice)
            ->with('success', 'Fatura criada com sucesso!');
    }

    public function show(Invoice $invoice)
    {
        $invoice->load(['shipment.shippingLine']);

        return Inertia::render('Invoices/Show', [
            'invoice' => $invoice
        ]);
    }

    public function update(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'amount' => 'sometimes|numeric|min:0',
            'due_date' => 'sometimes|nullable|date',
            'notes' => 'nullable|string'
        ]);

        $invoice->update($validated);

        return back()->with('success', 'Fatura atualizada com sucesso!');
    }

    public function markAsPaid(Request $request, Invoice $invoice)
    {
        $request->validate([
            'payment_reference' => 'required|string',
            'payment_date' => 'required|date'
        ]);

        $invoice->update([
            'status' => 'paid',
            'payment_date' => $request->payment_date,
            'payment_reference' => $request->payment_reference
        ]);

        Activity::create([
            'shipment_id' => $invoice->shipment_id,
            'user_id' => auth()->id(),
            'action' => 'invoice_paid',
            'description' => "Fatura {$invoice->invoice_number} foi paga",
            'metadata' => [
                'payment_reference' => $request->payment_reference
            ]
        ]);

        return back()->with('success', 'Pagamento registrado com sucesso!');
    }

    public function destroy(Invoice $invoice)
    {
        $invoice->delete();
        return redirect()->route('invoices.index')
            ->with('success', 'Fatura removida com sucesso!');
    }
}
