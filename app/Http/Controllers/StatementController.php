<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\Receipt;
use App\Models\CreditNote;
use App\Models\DebitNote;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class StatementController extends Controller
{
    public function show(Request $request, Client $client)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));

        // Buscar todas as transações do cliente no período
        $transactions = $this->getClientTransactions($client->id, $startDate, $endDate);

        // Calcular saldos
        $summary = $this->calculateSummary($client->id, $startDate, $endDate);

        return Inertia::render('Statements/Show', [
            'client' => $client,
            'transactions' => $transactions,
            'summary' => $summary,
            'startDate' => $startDate,
            'endDate' => $endDate,
        ]);
    }

    public function exportPdf(Request $request, Client $client)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));

        $transactions = $this->getClientTransactions($client->id, $startDate, $endDate);
        $summary = $this->calculateSummary($client->id, $startDate, $endDate);

        $data = [
            'client' => $client,
            'transactions' => $transactions,
            'summary' => $summary,
            'startDate' => Carbon::parse($startDate)->format('d/m/Y'),
            'endDate' => Carbon::parse($endDate)->format('d/m/Y'),
            'generatedAt' => now()->format('d/m/Y H:i'),
        ];

        $pdf = Pdf::loadView('pdfs.statement', $data);
        $pdf->setPaper('a4', 'portrait');

        return $pdf->download("extrato-{$client->name}-{$startDate}-{$endDate}.pdf");
    }

    /**
     * Buscar todas as transações do cliente no período
     */
    private function getClientTransactions($clientId, $startDate, $endDate)
    {
        $transactions = collect();

        // 1. Faturas
        $invoices = Invoice::where('client_id', $clientId)
            ->whereBetween('issue_date', [$startDate, $endDate])
            ->get()
            ->map(function ($invoice) {
                return [
                    'date' => $invoice->issue_date,
                    'type' => 'invoice',
                    'type_label' => 'Fatura',
                    'document_number' => $invoice->invoice_number,
                    'description' => $invoice->description ?? 'Fatura de serviços',
                    'debit' => $invoice->amount,
                    'credit' => 0,
                    'balance' => 0, // será calculado depois
                    'currency' => $invoice->currency,
                    'status' => $invoice->status,
                ];
            });

        // 2. Recibos (Pagamentos)
        $receipts = Receipt::where('client_id', $clientId)
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->with('invoice')
            ->get()
            ->map(function ($receipt) {
                return [
                    'date' => $receipt->payment_date,
                    'type' => 'receipt',
                    'type_label' => 'Recibo',
                    'document_number' => $receipt->receipt_number,
                    'description' => "Pagamento - {$receipt->payment_method_label} - Fatura {$receipt->invoice->invoice_number}",
                    'debit' => 0,
                    'credit' => $receipt->amount,
                    'balance' => 0,
                    'currency' => $receipt->currency,
                    'status' => 'paid',
                ];
            });

        // 3. Notas de Crédito
        $creditNotes = CreditNote::where('client_id', $clientId)
            ->whereBetween('issue_date', [$startDate, $endDate])
            ->whereIn('status', ['issued', 'applied'])
            ->with('invoice')
            ->get()
            ->map(function ($creditNote) {
                return [
                    'date' => $creditNote->issue_date,
                    'type' => 'credit_note',
                    'type_label' => 'Nota de Crédito',
                    'document_number' => $creditNote->credit_note_number,
                    'description' => "{$creditNote->reason_label} - Fatura {$creditNote->invoice->invoice_number}",
                    'debit' => 0,
                    'credit' => $creditNote->total,
                    'balance' => 0,
                    'currency' => $creditNote->currency,
                    'status' => $creditNote->status,
                ];
            });

        // 4. Notas de Débito
        $debitNotes = DebitNote::where('client_id', $clientId)
            ->whereBetween('issue_date', [$startDate, $endDate])
            ->whereIn('status', ['issued', 'applied'])
            ->with('invoice')
            ->get()
            ->map(function ($debitNote) {
                return [
                    'date' => $debitNote->issue_date,
                    'type' => 'debit_note',
                    'type_label' => 'Nota de Débito',
                    'document_number' => $debitNote->debit_note_number,
                    'description' => "{$debitNote->reason_label} - Fatura {$debitNote->invoice->invoice_number}",
                    'debit' => $debitNote->total,
                    'credit' => 0,
                    'balance' => 0,
                    'currency' => $debitNote->currency,
                    'status' => $debitNote->status,
                ];
            });

        // Juntar todas as transações
        $transactions = $transactions
            ->concat($invoices)
            ->concat($receipts)
            ->concat($creditNotes)
            ->concat($debitNotes)
            ->sortBy('date')
            ->values();

        // Calcular saldo acumulado
        $runningBalance = 0;
        $transactions = $transactions->map(function ($transaction) use (&$runningBalance) {
            $runningBalance += ($transaction['debit'] - $transaction['credit']);
            $transaction['balance'] = $runningBalance;
            return $transaction;
        });

        return $transactions;
    }

    /**
     * Calcular resumo do extrato
     */
    private function calculateSummary($clientId, $startDate, $endDate)
    {
        // Saldo inicial (antes do período)
        $initialBalance = $this->calculateInitialBalance($clientId, $startDate);

        // Totais do período
        $totalInvoices = Invoice::where('client_id', $clientId)
            ->whereBetween('issue_date', [$startDate, $endDate])
            ->sum('amount');

        $totalReceipts = Receipt::where('client_id', $clientId)
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->sum('amount');

        $totalCreditNotes = CreditNote::where('client_id', $clientId)
            ->whereBetween('issue_date', [$startDate, $endDate])
            ->whereIn('status', ['issued', 'applied'])
            ->sum('total');

        $totalDebitNotes = DebitNote::where('client_id', $clientId)
            ->whereBetween('issue_date', [$startDate, $endDate])
            ->whereIn('status', ['issued', 'applied'])
            ->sum('total');

        // Saldo final
        $finalBalance = $initialBalance + $totalInvoices + $totalDebitNotes - $totalReceipts - $totalCreditNotes;

        // Faturas pendentes
        $pendingInvoices = Invoice::where('client_id', $clientId)
            ->whereIn('status', ['pending', 'overdue'])
            ->sum('amount');

        return [
            'initial_balance' => $initialBalance,
            'total_invoices' => $totalInvoices,
            'total_debit_notes' => $totalDebitNotes,
            'total_credit_notes' => $totalCreditNotes,
            'total_receipts' => $totalReceipts,
            'final_balance' => $finalBalance,
            'pending_invoices' => $pendingInvoices,
            'total_debits' => $totalInvoices + $totalDebitNotes,
            'total_credits' => $totalReceipts + $totalCreditNotes,
        ];
    }

    /**
     * Calcular saldo inicial (antes do período)
     */
    private function calculateInitialBalance($clientId, $beforeDate)
    {
        $totalInvoices = Invoice::where('client_id', $clientId)
            ->where('issue_date', '<', $beforeDate)
            ->sum('amount');

        $totalReceipts = Receipt::where('client_id', $clientId)
            ->where('payment_date', '<', $beforeDate)
            ->sum('amount');

        $totalCreditNotes = CreditNote::where('client_id', $clientId)
            ->where('issue_date', '<', $beforeDate)
            ->whereIn('status', ['issued', 'applied'])
            ->sum('total');

        $totalDebitNotes = DebitNote::where('client_id', $clientId)
            ->where('issue_date', '<', $beforeDate)
            ->whereIn('status', ['issued', 'applied'])
            ->sum('total');

        return $totalInvoices + $totalDebitNotes - $totalReceipts - $totalCreditNotes;
    }
}
