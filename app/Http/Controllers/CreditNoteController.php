<?php

namespace App\Http\Controllers;

use App\Models\CreditNote;
use App\Models\CreditNoteItem;
use App\Models\Invoice;
use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class CreditNoteController extends Controller
{
    public function index(Request $request)
    {
        $query = CreditNote::with(['invoice', 'client', 'createdBy']);

        // Filtros
        if ($request->filled('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('reason')) {
            $query->where('reason', $request->reason);
        }

        $creditNotes = $query->orderBy('issue_date', 'desc')->paginate(15);

        // Estatísticas
        $stats = [
            'total' => CreditNote::count(),
            'draft' => CreditNote::where('status', 'draft')->count(),
            'issued' => CreditNote::where('status', 'issued')->count(),
            'applied' => CreditNote::where('status', 'applied')->count(),
            'total_amount' => CreditNote::issued()->sum('total'),
        ];

        return Inertia::render('CreditNotes/Index', [
            'creditNotes' => $creditNotes,
            'stats' => $stats,
            'filters' => $request->only(['client_id', 'status', 'reason']),
        ]);
    }

    public function create()
    {
        $clients = Client::active()->orderBy('name')->get();
        $invoices = Invoice::with(['client', 'items'])->orderBy('issue_date', 'desc')->get();

        return Inertia::render('CreditNotes/Create', [
            'nextCreditNoteNumber' => CreditNote::generateCreditNoteNumber(),
            'clients' => $clients,
            'invoices' => $invoices,
            'reasons' => $this->getReasons(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'issue_date' => 'required|date',
            'reason' => 'required|in:product_return,service_cancellation,billing_error,discount,damage,other',
            'reason_description' => 'nullable|string',
            'currency' => 'required|in:MZN,USD,EUR',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.tax_rate' => 'required|numeric|min:0|max:100',
        ]);

        DB::beginTransaction();
        try {
            $invoice = Invoice::findOrFail($validated['invoice_id']);

            // Criar nota de crédito
            $creditNote = CreditNote::create([
                'credit_note_number' => CreditNote::generateCreditNoteNumber(),
                'invoice_id' => $invoice->id,
                'client_id' => $invoice->client_id,
                'issue_date' => $validated['issue_date'],
                'reason' => $validated['reason'],
                'reason_description' => $validated['reason_description'] ?? null,
                'currency' => $validated['currency'],
                'subtotal' => 0,
                'tax_amount' => 0,
                'total' => 0,
                'status' => 'draft',
                'notes' => $validated['notes'] ?? null,
                'created_by' => auth()->id(),
            ]);

            // Criar itens
            foreach ($validated['items'] as $index => $itemData) {
                $item = new CreditNoteItem([
                    'description' => $itemData['description'],
                    'quantity' => $itemData['quantity'],
                    'unit' => $itemData['unit'] ?? 'unit',
                    'unit_price' => $itemData['unit_price'],
                    'tax_rate' => $itemData['tax_rate'],
                    'sort_order' => $index,
                ]);

                $item->calculateTotals();
                $creditNote->items()->save($item);
            }

            // Calcular totais
            $creditNote->calculateTotals();

            DB::commit();

            return redirect()->route('credit-notes.show', $creditNote)
                ->with('success', 'Nota de crédito criada com sucesso!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()
                ->with('error', 'Erro ao criar nota de crédito: ' . $e->getMessage());
        }
    }

    public function show(CreditNote $creditNote)
    {
        $creditNote->load(['invoice', 'client', 'items', 'createdBy']);

        return Inertia::render('CreditNotes/Show', [
            'creditNote' => $creditNote,
        ]);
    }

    public function edit(CreditNote $creditNote)
    {
        if (!in_array($creditNote->status, ['draft'])) {
            return back()->with('error', 'Apenas notas de crédito em rascunho podem ser editadas.');
        }

        $creditNote->load('items');
        $clients = Client::active()->orderBy('name')->get();
        $invoices = Invoice::with(['client', 'items'])->orderBy('issue_date', 'desc')->get();

        return Inertia::render('CreditNotes/Edit', [
            'creditNote' => $creditNote,
            'clients' => $clients,
            'invoices' => $invoices,
            'reasons' => $this->getReasons(),
        ]);
    }

    public function update(Request $request, CreditNote $creditNote)
    {
        if (!in_array($creditNote->status, ['draft'])) {
            return back()->with('error', 'Apenas notas de crédito em rascunho podem ser editadas.');
        }

        $validated = $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'issue_date' => 'required|date',
            'reason' => 'required|in:product_return,service_cancellation,billing_error,discount,damage,other',
            'reason_description' => 'nullable|string',
            'currency' => 'required|in:MZN,USD,EUR',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.tax_rate' => 'required|numeric|min:0|max:100',
        ]);

        DB::beginTransaction();
        try {
            $invoice = Invoice::findOrFail($validated['invoice_id']);

            $creditNote->update([
                'invoice_id' => $invoice->id,
                'client_id' => $invoice->client_id,
                'issue_date' => $validated['issue_date'],
                'reason' => $validated['reason'],
                'reason_description' => $validated['reason_description'] ?? null,
                'currency' => $validated['currency'],
                'notes' => $validated['notes'] ?? null,
            ]);

            // Deletar itens antigos
            $creditNote->items()->delete();

            // Criar novos itens
            foreach ($validated['items'] as $index => $itemData) {
                $item = new CreditNoteItem([
                    'description' => $itemData['description'],
                    'quantity' => $itemData['quantity'],
                    'unit' => $itemData['unit'] ?? 'unit',
                    'unit_price' => $itemData['unit_price'],
                    'tax_rate' => $itemData['tax_rate'],
                    'sort_order' => $index,
                ]);

                $item->calculateTotals();
                $creditNote->items()->save($item);
            }

            // Recalcular totais
            $creditNote->calculateTotals();

            DB::commit();

            return redirect()->route('credit-notes.show', $creditNote)
                ->with('success', 'Nota de crédito atualizada com sucesso!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()
                ->with('error', 'Erro ao atualizar nota de crédito: ' . $e->getMessage());
        }
    }

    public function destroy(CreditNote $creditNote)
    {
        if ($creditNote->status === 'applied') {
            return back()->with('error', 'Notas de crédito aplicadas não podem ser excluídas.');
        }

        $creditNote->delete();

        return redirect()->route('credit-notes.index')
            ->with('success', 'Nota de crédito removida com sucesso!');
    }

    public function updateStatus(Request $request, CreditNote $creditNote)
    {
        $validated = $request->validate([
            'status' => 'required|in:draft,issued,applied,cancelled',
        ]);

        $creditNote->update(['status' => $validated['status']]);

        return back()->with('success', 'Status da nota de crédito atualizado!');
    }

    public function exportPdf(CreditNote $creditNote)
    {
        $creditNote->load(['invoice', 'client', 'items', 'createdBy']);

        $pdf = Pdf::loadView('pdfs.credit-note', compact('creditNote'));
        $pdf->setPaper('a4', 'portrait');

        return $pdf->download("{$creditNote->credit_note_number}.pdf");
    }

    private function getReasons(): array
    {
        return [
            ['value' => 'product_return', 'label' => 'Devolução de Produto'],
            ['value' => 'service_cancellation', 'label' => 'Cancelamento de Serviço'],
            ['value' => 'billing_error', 'label' => 'Erro de Faturação'],
            ['value' => 'discount', 'label' => 'Desconto Concedido'],
            ['value' => 'damage', 'label' => 'Produto Danificado'],
            ['value' => 'other', 'label' => 'Outro Motivo'],
        ];
    }
}
