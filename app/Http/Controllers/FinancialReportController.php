<?php

namespace App\Http\Controllers;

use App\Models\PaymentRequest;
use App\Models\Invoice;
use App\Models\Receipt;
use App\Models\CreditNote;
use App\Models\DebitNote;
use App\Models\Client;
use App\Models\ShippingLine;
use App\Models\Shipment;
use App\Models\FinancialTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class FinancialReportController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Período de análise (padrão: últimos 12 meses)
            $startDate = $request->input('start_date', now()->subMonths(12)->startOfMonth());
            $endDate = $request->input('end_date', now()->endOfMonth());

            // Custos por Cliente
            $costsByClient = $this->getCostsByClient($startDate, $endDate);

            // Custos por Linha de Navegação
            $costsByShippingLine = $this->getCostsByShippingLine($startDate, $endDate);

            // Custos por Tipo de Despesa
            $costsByExpenseType = $this->getCostsByExpenseType($startDate, $endDate);

            // Extrato Geral
            $statement = $this->getGeneralStatement($startDate, $endDate);

            // Resumo Financeiro
            $summary = $this->getFinancialSummary($startDate, $endDate);

            return Inertia::render('Financial/Index', [
                'costsByClient' => $costsByClient,
                'costsByShippingLine' => $costsByShippingLine,
                'costsByExpenseType' => $costsByExpenseType,
                'statement' => $statement,
                'summary' => $summary,
                'filters' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ]
            ]);
        } catch (\Exception $e) {
            // Log do erro para debug
            \Log::error('Financial Report Error: ' . $e->getMessage());

            // Retornar página com dados vazios
            return Inertia::render('Financial/Index', [
                'costsByClient' => [],
                'costsByShippingLine' => [],
                'costsByExpenseType' => [],
                'statement' => [],
                'summary' => [
                    'total_costs' => 0,
                    'total_invoiced' => 0,
                    'total_received' => 0,
                    'total_credit_notes' => 0,
                    'total_debit_notes' => 0,
                    'total_financial_income' => 0,
                    'total_financial_expense' => 0,
                    'outstanding' => 0,
                    'profit_margin' => 0,
                    'active_processes' => 0,
                    'completed_processes' => 0,
                ],
                'filters' => [
                    'start_date' => now()->subMonths(12)->startOfMonth(),
                    'end_date' => now()->endOfMonth(),
                ],
                'error' => 'Erro ao carregar dados financeiros. Verifique se todas as tabelas existem.'
            ]);
        }
    }

    /**
     * Custos por Cliente
     */
    private function getCostsByClient($startDate, $endDate)
    {
        return Client::withCount('shipments')
            ->with(['shipments' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }])
            ->get()
            ->map(function ($client) {
                $totalPaymentRequests = PaymentRequest::whereHas('shipment', function ($q) use ($client) {
                    $q->where('client_id', $client->id);
                })->sum('amount');

                $totalInvoices = Invoice::whereHas('shipment', function ($q) use ($client) {
                    $q->where('client_id', $client->id);
                })->sum('total');

                $paidAmount = Receipt::whereHas('invoice.shipment', function ($q) use ($client) {
                    $q->where('client_id', $client->id);
                })->sum('amount');

                return [
                    'id' => $client->id,
                    'name' => $client->name,
                    'shipments_count' => $client->shipments_count,
                    'total_costs' => $totalPaymentRequests,
                    'total_invoiced' => $totalInvoices,
                    'total_paid' => $paidAmount,
                    'outstanding' => $totalInvoices - $paidAmount,
                ];
            })
            ->sortByDesc('total_costs')
            ->values();
    }

    /**
     * Custos por Linha de Navegação
     */
    private function getCostsByShippingLine($startDate, $endDate)
    {
        return ShippingLine::withCount('shipments')
            ->with(['shipments' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }])
            ->get()
            ->map(function ($line) {
                $totalCosts = PaymentRequest::whereHas('shipment', function ($q) use ($line) {
                    $q->where('shipping_line_id', $line->id);
                })
                ->where('expense_type', 'shipping_line_quotation')
                ->sum('amount');

                $shipmentIds = $line->shipments->pluck('id');
                $processCount = $line->shipments->count();

                return [
                    'id' => $line->id,
                    'name' => $line->name,
                    'code' => $line->code,
                    'shipments_count' => $processCount,
                    'total_costs' => $totalCosts,
                    'average_cost' => $processCount > 0 ? $totalCosts / $processCount : 0,
                    'services' => $line->services ?? [],
                ];
            })
            ->sortByDesc('total_costs')
            ->values();
    }

    /**
     * Custos por Tipo de Despesa
     */
    private function getCostsByExpenseType($startDate, $endDate)
    {
        $expenseTypes = [
            'shipping_line_quotation' => 'Linha de Navegação',
            'cdm_fee' => 'Despesas CDM',
            'customs_preliminary' => 'Alfândega Preliminar',
            'legalization_advance' => 'Adiantamento Legalização',
            'transport_fee' => 'Taxa de Transporte',
            'other_coleta' => 'Outras Despesas',
        ];

        return collect($expenseTypes)->map(function ($label, $type) use ($startDate, $endDate) {
            $totalAmount = PaymentRequest::where('expense_type', $type)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum('amount');

            $count = PaymentRequest::where('expense_type', $type)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count();

            return [
                'type' => $type,
                'label' => $label,
                'total_amount' => $totalAmount,
                'count' => $count,
                'average' => $count > 0 ? $totalAmount / $count : 0,
            ];
        })
        ->sortByDesc('total_amount')
        ->values();
    }

    /**
     * Extrato Geral
     */
    private function getGeneralStatement($startDate, $endDate)
    {
        $transactions = collect();

        // Payment Requests
        $paymentRequests = PaymentRequest::with(['shipment.client'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get()
            ->map(function ($pr) {
                return [
                    'date' => $pr->created_at,
                    'type' => 'payment_request',
                    'description' => $pr->description,
                    'client' => optional(optional($pr->shipment)->client)->name ?? 'N/A',
                    'reference' => optional($pr->shipment)->reference_number ?? 'N/A',
                    'debit' => $pr->amount,
                    'credit' => 0,
                    'status' => $pr->status,
                ];
            });

        // Invoices
        $invoices = Invoice::with(['shipment.client'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get()
            ->map(function ($inv) {
                return [
                    'date' => $inv->created_at,
                    'type' => 'invoice',
                    'description' => 'Fatura ' . $inv->invoice_number,
                    'client' => optional(optional($inv->shipment)->client)->name ?? 'N/A',
                    'reference' => optional($inv->shipment)->reference_number ?? 'N/A',
                    'debit' => 0,
                    'credit' => $inv->total,
                    'status' => $inv->status,
                ];
            });

        // Receipts
        $receipts = Receipt::with(['invoice.shipment.client'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get()
            ->map(function ($rec) {
                return [
                    'date' => $rec->created_at,
                    'type' => 'receipt',
                    'description' => 'Recibo de Pagamento',
                    'client' => optional(optional(optional($rec->invoice)->shipment)->client)->name ?? 'N/A',
                    'reference' => optional(optional($rec->invoice)->shipment)->reference_number ?? 'N/A',
                    'debit' => 0,
                    'credit' => $rec->amount,
                    'status' => 'paid',
                ];
            });

        // Credit Notes
        $creditNotes = CreditNote::with(['shipment.client'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get()
            ->map(function ($cn) {
                return [
                    'date' => $cn->created_at,
                    'type' => 'credit_note',
                    'description' => 'Nota de Crédito ' . $cn->credit_note_number,
                    'client' => optional(optional($cn->shipment)->client)->name ?? 'N/A',
                    'reference' => optional($cn->shipment)->reference_number ?? 'N/A',
                    'debit' => $cn->total,
                    'credit' => 0,
                    'status' => $cn->status,
                ];
            });

        // Debit Notes
        $debitNotes = DebitNote::with(['shipment.client'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get()
            ->map(function ($dn) {
                return [
                    'date' => $dn->created_at,
                    'type' => 'debit_note',
                    'description' => 'Nota de Débito ' . $dn->debit_note_number,
                    'client' => optional(optional($dn->shipment)->client)->name ?? 'N/A',
                    'reference' => optional($dn->shipment)->reference_number ?? 'N/A',
                    'debit' => 0,
                    'credit' => $dn->total,
                    'status' => $dn->status,
                ];
            });

        // Financial Transactions (Avulsas) - Handle gracefully if table doesn't exist
        try {
            $financialTransactions = FinancialTransaction::with('client')
                ->whereBetween('transaction_date', [$startDate, $endDate])
                ->get()
                ->map(function ($ft) {
                    return [
                        'date' => $ft->transaction_date,
                        'type' => 'financial_transaction',
                        'description' => $ft->description . ($ft->category ? ' (' . $ft->category . ')' : ''),
                        'client' => optional($ft->client)->name ?? 'N/A',
                        'reference' => $ft->reference ?? 'Transação Avulsa',
                        'debit' => $ft->type === 'expense' ? $ft->amount : 0,
                        'credit' => $ft->type === 'income' ? $ft->amount : 0,
                        'status' => 'completed',
                    ];
                });
        } catch (\Exception $e) {
            \Log::warning('Financial transactions table not available: ' . $e->getMessage());
            $financialTransactions = collect();
        }

        return $transactions
            ->merge($paymentRequests)
            ->merge($invoices)
            ->merge($receipts)
            ->merge($creditNotes)
            ->merge($debitNotes)
            ->merge($financialTransactions)
            ->sortByDesc('date')
            ->values();
    }

    /**
     * Resumo Financeiro
     */
    private function getFinancialSummary($startDate, $endDate)
    {
        $totalCosts = PaymentRequest::whereBetween('created_at', [$startDate, $endDate])
            ->sum('amount');

        $totalInvoiced = Invoice::whereBetween('created_at', [$startDate, $endDate])
            ->sum('total');

        $totalReceived = Receipt::whereBetween('created_at', [$startDate, $endDate])
            ->sum('amount');

        $totalCreditNotes = CreditNote::whereBetween('created_at', [$startDate, $endDate])
            ->sum('total');

        $totalDebitNotes = DebitNote::whereBetween('created_at', [$startDate, $endDate])
            ->sum('total');

        // Transações Financeiras Avulsas (Entradas e Saídas)
        $totalFinancialIncome = 0;
        $totalFinancialExpense = 0;

        try {
            $totalFinancialIncome = FinancialTransaction::where('type', 'income')
                ->whereBetween('transaction_date', [$startDate, $endDate])
                ->sum('amount');

            $totalFinancialExpense = FinancialTransaction::where('type', 'expense')
                ->whereBetween('transaction_date', [$startDate, $endDate])
                ->sum('amount');
        } catch (\Exception $e) {
            \Log::warning('Financial transactions table not available in summary: ' . $e->getMessage());
        }

        $activeProcesses = Shipment::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', '!=', 'completed')
            ->count();

        $completedProcesses = Shipment::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->count();

        return [
            'total_costs' => $totalCosts,
            'total_invoiced' => $totalInvoiced,
            'total_received' => $totalReceived,
            'total_credit_notes' => $totalCreditNotes,
            'total_debit_notes' => $totalDebitNotes,
            'total_financial_income' => $totalFinancialIncome,
            'total_financial_expense' => $totalFinancialExpense,
            'outstanding' => $totalInvoiced - $totalReceived,
            'profit_margin' => $totalInvoiced > 0 ? (($totalInvoiced - $totalCosts) / $totalInvoiced) * 100 : 0,
            'active_processes' => $activeProcesses,
            'completed_processes' => $completedProcesses,
        ];
    }
}
