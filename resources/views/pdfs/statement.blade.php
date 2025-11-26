<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>Extrato - {{ $client->name }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            font-size: 11px;
            line-height: 1.6;
            color: #333;
        }

        .container {
            padding: 20px;
        }

        /* Header */
        .header {
            display: table;
            width: 100%;
            margin-bottom: 30px;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
        }

        .header-left {
            display: table-cell;
            width: 60%;
            vertical-align: top;
        }

        .header-right {
            display: table-cell;
            width: 40%;
            text-align: right;
            vertical-align: top;
        }

        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 5px;
        }

        .company-details {
            font-size: 10px;
            color: #666;
            line-height: 1.4;
        }

        .doc-title {
            font-size: 28px;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 5px;
        }

        .period {
            font-size: 12px;
            color: #666;
        }

        /* Client Info */
        .client-section {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 30px;
        }

        .client-title {
            font-size: 11px;
            font-weight: bold;
            color: #1e40af;
            text-transform: uppercase;
            margin-bottom: 10px;
        }

        .client-name {
            font-size: 16px;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 5px;
        }

        .client-details {
            font-size: 10px;
            color: #666;
        }

        /* Summary Cards */
        .summary-section {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }

        .summary-card {
            display: table-cell;
            width: 24%;
            padding: 15px;
            text-align: center;
            border-radius: 8px;
            margin-right: 1%;
        }

        .summary-card-initial {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
        }

        .summary-card-debits {
            background: #fef2f2;
            border: 1px solid #fecaca;
        }

        .summary-card-credits {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
        }

        .summary-card-final {
            background: #dbeafe;
            border: 1px solid #93c5fd;
        }

        .summary-label {
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 8px;
        }

        .summary-value {
            font-size: 18px;
            font-weight: bold;
        }

        .value-initial { color: #475569; }
        .value-debit { color: #dc2626; }
        .value-credit { color: #16a34a; }
        .value-final { color: #2563eb; }

        /* Transactions Table */
        .transactions-title {
            font-size: 14px;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
        }

        .transactions-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .transactions-table thead {
            background: #3b82f6;
            color: white;
        }

        .transactions-table th {
            padding: 10px 6px;
            text-align: left;
            font-size: 9px;
            font-weight: bold;
        }

        .transactions-table th.text-right {
            text-align: right;
        }

        .transactions-table th.text-center {
            text-align: center;
        }

        .transactions-table td {
            padding: 8px 6px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 10px;
        }

        .transactions-table td.text-right {
            text-align: right;
        }

        .transactions-table td.text-center {
            text-align: center;
        }

        .transactions-table tbody tr:nth-child(even) {
            background: #f9fafb;
        }

        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 8px;
            font-weight: bold;
        }

        .badge-invoice { background: #dbeafe; color: #1e40af; }
        .badge-receipt { background: #d1fae5; color: #065f46; }
        .badge-credit { background: #e9d5ff; color: #6b21a8; }
        .badge-debit { background: #fed7aa; color: #9a3412; }

        .amount-debit {
            color: #dc2626;
            font-weight: 600;
        }

        .amount-credit {
            color: #16a34a;
            font-weight: 600;
        }

        .balance {
            font-weight: 700;
            color: #1e293b;
        }

        .balance-negative {
            color: #dc2626;
        }

        /* Totals Footer */
        .totals-footer {
            background: #f1f5f9;
            border-top: 3px solid #3b82f6;
            padding: 15px;
            margin-top: 20px;
        }

        .totals-row {
            display: table;
            width: 100%;
            padding: 5px 0;
        }

        .totals-label {
            display: table-cell;
            text-align: left;
            font-size: 11px;
            font-weight: 600;
            color: #64748b;
            width: 70%;
        }

        .totals-value {
            display: table-cell;
            text-align: right;
            font-size: 11px;
            font-weight: 700;
        }

        .totals-final {
            border-top: 2px solid #cbd5e1;
            padding-top: 10px;
            margin-top: 10px;
        }

        .totals-final .totals-label {
            font-size: 14px;
            color: #1e293b;
        }

        .totals-final .totals-value {
            font-size: 16px;
            color: #2563eb;
        }

        /* Footer */
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
        }

        .footer-text {
            font-size: 9px;
            color: #9ca3af;
            line-height: 1.4;
        }

        .warning-box {
            background: #fef3c7;
            border: 1px solid #fde68a;
            border-radius: 8px;
            padding: 12px;
            margin-top: 20px;
            font-size: 10px;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="header-left">
                <div class="company-name">LogisticaPro</div>
                <div class="company-details">
                    Rua Exemplo, 123, Maputo - Moçambique<br>
                    Tel: +258 XX XXX XXXX | Email: info@logisticapro.co.mz<br>
                    NUIT: XXXXXXXXXX
                </div>
            </div>
            <div class="header-right">
                <div class="doc-title">EXTRATO DE CONTA</div>
                <div class="period">
                    Período: {{ $startDate }} a {{ $endDate }}
                </div>
            </div>
        </div>

        <!-- Client Info -->
        <div class="client-section">
            <div class="client-title">Cliente</div>
            <div class="client-name">{{ $client->name }}</div>
            <div class="client-details">
                @if($client->email)Email: {{ $client->email }} | @endif
                @if($client->phone)Tel: {{ $client->phone }}@endif
            </div>
        </div>

        <!-- Summary Cards -->
        <div class="summary-section">
            <div class="summary-card summary-card-initial">
                <div class="summary-label">Saldo Inicial</div>
                <div class="summary-value value-initial">{{ number_format($summary['initial_balance'], 2, ',', '.') }}</div>
            </div>
            <div class="summary-card summary-card-debits">
                <div class="summary-label">Total Débitos</div>
                <div class="summary-value value-debit">+{{ number_format($summary['total_debits'], 2, ',', '.') }}</div>
            </div>
            <div class="summary-card summary-card-credits">
                <div class="summary-label">Total Créditos</div>
                <div class="summary-value value-credit">-{{ number_format($summary['total_credits'], 2, ',', '.') }}</div>
            </div>
            <div class="summary-card summary-card-final">
                <div class="summary-label">Saldo Final</div>
                <div class="summary-value value-final">{{ number_format($summary['final_balance'], 2, ',', '.') }}</div>
            </div>
        </div>

        <!-- Transactions Title -->
        <div class="transactions-title">Movimentos do Período</div>

        <!-- Transactions Table -->
        <table class="transactions-table">
            <thead>
                <tr>
                    <th style="width: 10%;">Data</th>
                    <th style="width: 12%;" class="text-center">Tipo</th>
                    <th style="width: 15%;">Documento</th>
                    <th style="width: 30%;">Descrição</th>
                    <th style="width: 11%;" class="text-right">Débito</th>
                    <th style="width: 11%;" class="text-right">Crédito</th>
                    <th style="width: 11%;" class="text-right">Saldo</th>
                </tr>
            </thead>
            <tbody>
                @forelse($transactions as $transaction)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($transaction['date'])->format('d/m/Y') }}</td>
                    <td class="text-center">
                        <span class="badge badge-{{ $transaction['type'] }}">
                            {{ strtoupper($transaction['type_label']) }}
                        </span>
                    </td>
                    <td style="font-family: monospace; font-size: 9px;">{{ $transaction['document_number'] }}</td>
                    <td style="font-size: 9px;">{{ $transaction['description'] }}</td>
                    <td class="text-right">
                        @if($transaction['debit'] > 0)
                            <span class="amount-debit">{{ number_format($transaction['debit'], 2, ',', '.') }}</span>
                        @else
                            <span style="color: #cbd5e1;">-</span>
                        @endif
                    </td>
                    <td class="text-right">
                        @if($transaction['credit'] > 0)
                            <span class="amount-credit">{{ number_format($transaction['credit'], 2, ',', '.') }}</span>
                        @else
                            <span style="color: #cbd5e1;">-</span>
                        @endif
                    </td>
                    <td class="text-right">
                        <span class="balance {{ $transaction['balance'] < 0 ? 'balance-negative' : '' }}">
                            {{ number_format($transaction['balance'], 2, ',', '.') }}
                        </span>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="7" style="text-align: center; padding: 30px; color: #9ca3af;">
                        Nenhuma transação encontrada para o período selecionado
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>

        <!-- Totals Footer -->
        @if(count($transactions) > 0)
        <div class="totals-footer">
            <div class="totals-row">
                <div class="totals-label">Saldo Inicial:</div>
                <div class="totals-value">{{ number_format($summary['initial_balance'], 2, ',', '.') }} MZN</div>
            </div>
            <div class="totals-row">
                <div class="totals-label">Total de Débitos (Faturas + Notas de Débito):</div>
                <div class="totals-value value-debit">+{{ number_format($summary['total_debits'], 2, ',', '.') }} MZN</div>
            </div>
            <div class="totals-row">
                <div class="totals-label">Total de Créditos (Recibos + Notas de Crédito):</div>
                <div class="totals-value value-credit">-{{ number_format($summary['total_credits'], 2, ',', '.') }} MZN</div>
            </div>
            <div class="totals-row totals-final">
                <div class="totals-label">Saldo Final do Período:</div>
                <div class="totals-value">{{ number_format($summary['final_balance'], 2, ',', '.') }} MZN</div>
            </div>
        </div>
        @endif

        <!-- Pending Warning -->
        @if($summary['pending_invoices'] > 0)
        <div class="warning-box">
            <strong>⚠ Atenção:</strong> O cliente possui {{ number_format($summary['pending_invoices'], 2, ',', '.') }} MZN em faturas pendentes de pagamento.
        </div>
        @endif

        <!-- Footer -->
        <div class="footer">
            <div class="footer-text">
                Este documento é um extrato oficial de conta.<br>
                Emitido eletronicamente por LogisticaPro - Sistema de Gestão Logística<br>
                Data de emissão: {{ $generatedAt }}<br>
                Página 1 de 1
            </div>
        </div>
    </div>
</body>
</html>
