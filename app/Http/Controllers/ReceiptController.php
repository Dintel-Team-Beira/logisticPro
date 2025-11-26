<?php

namespace App\Http\Controllers;

use App\Models\Receipt;
use App\Models\Invoice;
use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class ReceiptController extends Controller
{
    public function index(Request $request)
    {
        $query = Receipt::with(['invoice', 'client', 'createdBy']);

        // Filtros
        if ($request->filled('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->filled('date_from')) {
            $query->where('payment_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('payment_date', '<=', $request->date_to);
        }

        $receipts = $query->orderBy('payment_date', 'desc')->paginate(15);

        // Estatísticas
        $stats = [
            'total' => Receipt::count(),
            'this_month' => Receipt::whereMonth('payment_date', date('m'))->count(),
            'total_amount' => Receipt::whereMonth('payment_date', date('m'))->sum('amount'),
            'by_method' => Receipt::select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total'))
                ->whereMonth('payment_date', date('m'))
                ->groupBy('payment_method')
                ->get(),
        ];

        return Inertia::render('Receipts/Index', [
            'receipts' => $receipts,
            'stats' => $stats,
            'filters' => $request->only(['client_id', 'payment_method', 'date_from', 'date_to']),
        ]);
    }

    public function create()
    {
        $clients = Client::active()->orderBy('name')->get();

        // Buscar faturas pendentes ou parcialmente pagas
        $invoices = Invoice::with('client')
            ->whereIn('status', ['pending', 'overdue'])
            ->orderBy('issue_date', 'desc')
            ->get();

        return Inertia::render('Receipts/Create', [
            'nextReceiptNumber' => Receipt::generateReceiptNumber(),
            'clients' => $clients,
            'invoices' => $invoices,
            'paymentMethods' => $this->getPaymentMethods(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'payment_date' => 'required|date',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:cash,bank_transfer,cheque,mpesa,emola,credit_card,debit_card,other',
            'payment_reference' => 'nullable|string|max:255',
            'currency' => 'required|in:MZN,USD,EUR',
            'notes' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Buscar a fatura
            $invoice = Invoice::findOrFail($validated['invoice_id']);

            // Criar o recibo
            $receipt = Receipt::create([
                'receipt_number' => Receipt::generateReceiptNumber(),
                'invoice_id' => $invoice->id,
                'client_id' => $invoice->client_id,
                'payment_date' => $validated['payment_date'],
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method'],
                'payment_reference' => $validated['payment_reference'] ?? null,
                'currency' => $validated['currency'],
                'notes' => $validated['notes'] ?? null,
                'created_by' => auth()->id(),
            ]);

            // Atualizar status da fatura se totalmente pago
            $totalPaid = $invoice->receipts()->sum('amount');
            if ($totalPaid >= $invoice->amount) {
                $invoice->update([
                    'status' => 'paid',
                    'payment_date' => $validated['payment_date'],
                ]);
            }

            DB::commit();

            return redirect()->route('receipts.show', $receipt)
                ->with('success', 'Recibo criado com sucesso!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()
                ->with('error', 'Erro ao criar recibo: ' . $e->getMessage());
        }
    }

    public function show(Receipt $receipt)
    {
        $receipt->load(['invoice.items', 'client', 'createdBy']);

        return Inertia::render('Receipts/Show', [
            'receipt' => $receipt,
        ]);
    }

    public function destroy(Receipt $receipt)
    {
        DB::beginTransaction();
        try {
            $invoice = $receipt->invoice;

            $receipt->delete();

            // Recalcular status da fatura
            $totalPaid = $invoice->receipts()->sum('amount');
            if ($totalPaid < $invoice->amount) {
                $invoice->update(['status' => 'pending']);
            }

            DB::commit();

            return redirect()->route('receipts.index')
                ->with('success', 'Recibo removido com sucesso!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Erro ao remover recibo: ' . $e->getMessage());
        }
    }

    public function exportPdf(Receipt $receipt)
    {
        $receipt->load(['invoice.items', 'client', 'createdBy']);

        $pdf = Pdf::loadView('pdfs.receipt', compact('receipt'));
        $pdf->setPaper('a4', 'portrait');

        return $pdf->download("{$receipt->receipt_number}.pdf");
    }

    private function getPaymentMethods(): array
    {
        return [
            ['value' => 'cash', 'label' => 'Dinheiro'],
            ['value' => 'bank_transfer', 'label' => 'Transferência Bancária'],
            ['value' => 'cheque', 'label' => 'Cheque'],
            ['value' => 'mpesa', 'label' => 'M-Pesa'],
            ['value' => 'emola', 'label' => 'E-Mola'],
            ['value' => 'credit_card', 'label' => 'Cartão de Crédito'],
            ['value' => 'debit_card', 'label' => 'Cartão de Débito'],
            ['value' => 'other', 'label' => 'Outro'],
        ];
    }
}
