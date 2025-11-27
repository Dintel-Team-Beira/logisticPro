<?php

namespace App\Http\Controllers;

use App\Models\DebitNote;
use App\Models\DebitNoteItem;
use App\Models\Invoice;
use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class DebitNoteController extends Controller
{
    public function index(Request $request)
    {
        $query = DebitNote::with(['invoice', 'client', 'createdBy']);

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

        $debitNotes = $query->orderBy('issue_date', 'desc')->paginate(15);

        // Estatísticas
        $stats = [
            'total' => DebitNote::count(),
            'draft' => DebitNote::where('status', 'draft')->count(),
            'issued' => DebitNote::where('status', 'issued')->count(),
            'applied' => DebitNote::where('status', 'applied')->count(),
            'total_amount' => DebitNote::issued()->sum('total'),
        ];

        return Inertia::render('DebitNotes/Index', [
            'debitNotes' => $debitNotes,
            'stats' => $stats,
            'filters' => $request->only(['client_id', 'status', 'reason']),
        ]);
    }

    public function create()
    {
        $clients = Client::active()->orderBy('name')->get();
        $invoices = Invoice::with('client')->orderBy('issue_date', 'desc')->get();

        return Inertia::render('DebitNotes/Create', [
            'nextDebitNoteNumber' => DebitNote::generateDebitNoteNumber(),
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
            'reason' => 'required|in:additional_charges,late_fees,penalties,billing_correction,exchange_difference,other',
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

            // Criar nota de débito
            $debitNote = DebitNote::create([
                'debit_note_number' => DebitNote::generateDebitNoteNumber(),
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
                $item = new DebitNoteItem([
                    'description' => $itemData['description'],
                    'quantity' => $itemData['quantity'],
                    'unit' => $itemData['unit'] ?? 'unit',
                    'unit_price' => $itemData['unit_price'],
                    'tax_rate' => $itemData['tax_rate'],
                    'sort_order' => $index,
                ]);

                $item->calculateTotals();
                $debitNote->items()->save($item);
            }

            // Calcular totais
            $debitNote->calculateTotals();

            DB::commit();

            return redirect()->route('debit-notes.show', $debitNote)
                ->with('success', 'Nota de débito criada com sucesso!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()
                ->with('error', 'Erro ao criar nota de débito: ' . $e->getMessage());
        }
    }

    public function show(DebitNote $debitNote)
    {
        $debitNote->load(['invoice', 'client', 'items', 'createdBy']);

        return Inertia::render('DebitNotes/Show', [
            'debitNote' => $debitNote,
        ]);
    }

    public function edit(DebitNote $debitNote)
    {
        if (!in_array($debitNote->status, ['draft'])) {
            return back()->with('error', 'Apenas notas de débito em rascunho podem ser editadas.');
        }

        $debitNote->load('items');
        $clients = Client::active()->orderBy('name')->get();
        $invoices = Invoice::with('client')->orderBy('issue_date', 'desc')->get();

        return Inertia::render('DebitNotes/Edit', [
            'debitNote' => $debitNote,
            'clients' => $clients,
            'invoices' => $invoices,
            'reasons' => $this->getReasons(),
        ]);
    }

    public function update(Request $request, DebitNote $debitNote)
    {
        if (!in_array($debitNote->status, ['draft'])) {
            return back()->with('error', 'Apenas notas de débito em rascunho podem ser editadas.');
        }

        $validated = $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'issue_date' => 'required|date',
            'reason' => 'required|in:additional_charges,late_fees,penalties,billing_correction,exchange_difference,other',
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

            $debitNote->update([
                'invoice_id' => $invoice->id,
                'client_id' => $invoice->client_id,
                'issue_date' => $validated['issue_date'],
                'reason' => $validated['reason'],
                'reason_description' => $validated['reason_description'] ?? null,
                'currency' => $validated['currency'],
                'notes' => $validated['notes'] ?? null,
            ]);

            // Deletar itens antigos
            $debitNote->items()->delete();

            // Criar novos itens
            foreach ($validated['items'] as $index => $itemData) {
                $item = new DebitNoteItem([
                    'description' => $itemData['description'],
                    'quantity' => $itemData['quantity'],
                    'unit' => $itemData['unit'] ?? 'unit',
                    'unit_price' => $itemData['unit_price'],
                    'tax_rate' => $itemData['tax_rate'],
                    'sort_order' => $index,
                ]);

                $item->calculateTotals();
                $debitNote->items()->save($item);
            }

            // Recalcular totais
            $debitNote->calculateTotals();

            DB::commit();

            return redirect()->route('debit-notes.show', $debitNote)
                ->with('success', 'Nota de débito atualizada com sucesso!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()
                ->with('error', 'Erro ao atualizar nota de débito: ' . $e->getMessage());
        }
    }

    public function destroy(DebitNote $debitNote)
    {
        if ($debitNote->status === 'applied') {
            return back()->with('error', 'Notas de débito aplicadas não podem ser excluídas.');
        }

        $debitNote->delete();

        return redirect()->route('debit-notes.index')
            ->with('success', 'Nota de débito removida com sucesso!');
    }

    public function updateStatus(Request $request, DebitNote $debitNote)
    {
        $validated = $request->validate([
            'status' => 'required|in:draft,issued,applied,cancelled',
        ]);

        $debitNote->update(['status' => $validated['status']]);

        return back()->with('success', 'Status da nota de débito atualizado!');
    }

    public function exportPdf(DebitNote $debitNote)
    {
        $debitNote->load(['invoice', 'client', 'items', 'createdBy']);

        $pdf = Pdf::loadView('pdfs.debit-note', compact('debitNote'));
        $pdf->setPaper('a4', 'portrait');

        return $pdf->download("{$debitNote->debit_note_number}.pdf");
    }

    private function getReasons(): array
    {
        return [
            ['value' => 'additional_charges', 'label' => 'Custos Adicionais'],
            ['value' => 'late_fees', 'label' => 'Juros de Mora'],
            ['value' => 'penalties', 'label' => 'Multas'],
            ['value' => 'billing_correction', 'label' => 'Correção de Faturação'],
            ['value' => 'exchange_difference', 'label' => 'Diferença Cambial'],
            ['value' => 'other', 'label' => 'Outro Motivo'],
        ];
    }
}
