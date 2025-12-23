<?php

namespace App\Http\Controllers;

use App\Models\FinancialTransaction;
use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FinancialTransactionController extends Controller
{
    public function index()
    {
        $transactions = FinancialTransaction::with('client')
            ->orderBy('transaction_date', 'desc')
            ->paginate(50);

        return Inertia::render('FinancialTransactions/Index', [
            'transactions' => $transactions,
        ]);
    }

    public function create()
    {
        $clients = Client::orderBy('name')->get();

        return Inertia::render('FinancialTransactions/Create', [
            'clients' => $clients,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'transaction_date' => 'required|date',
            'type' => 'required|in:income,expense',
            'category' => 'nullable|string|max:255',
            'description' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'client_id' => 'nullable|exists:clients,id',
            'reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        FinancialTransaction::create($validated);

        return redirect()->route('financial-transactions.index')
            ->with('success', 'Transação financeira criada com sucesso!');
    }

    public function edit(FinancialTransaction $financialTransaction)
    {
        $clients = Client::orderBy('name')->get();

        return Inertia::render('FinancialTransactions/Edit', [
            'transaction' => $financialTransaction->load('client'),
            'clients' => $clients,
        ]);
    }

    public function update(Request $request, FinancialTransaction $financialTransaction)
    {
        $validated = $request->validate([
            'transaction_date' => 'required|date',
            'type' => 'required|in:income,expense',
            'category' => 'nullable|string|max:255',
            'description' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'client_id' => 'nullable|exists:clients,id',
            'reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $financialTransaction->update($validated);

        return redirect()->route('financial-transactions.index')
            ->with('success', 'Transação financeira atualizada com sucesso!');
    }

    public function destroy(FinancialTransaction $financialTransaction)
    {
        $financialTransaction->delete();

        return redirect()->route('financial-transactions.index')
            ->with('success', 'Transação financeira excluída com sucesso!');
    }
}
