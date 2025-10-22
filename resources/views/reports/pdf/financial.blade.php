<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Financeiro</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 10px;
            color: #333;
            line-height: 1.4;
        }
        .header {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        .header h1 {
            font-size: 24px;
            margin-bottom: 5px;
        }
        .header p {
            font-size: 11px;
            opacity: 0.9;
        }
        .meta-info {
            display: table;
            width: 100%;
            margin-bottom: 20px;
            background: #f3f4f6;
            padding: 10px;
            border-radius: 5px;
        }
        .meta-info .row {
            display: table-row;
        }
        .meta-info .label {
            display: table-cell;
            font-weight: bold;
            padding: 5px;
            width: 30%;
        }
        .meta-info .value {
            display: table-cell;
            padding: 5px;
        }
        .summary-cards {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }
        .summary-card {
            display: table-cell;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 5px;
            padding: 10px;
            margin-right: 10px;
            text-align: center;
        }
        .summary-card .value {
            font-size: 18px;
            font-weight: bold;
            color: #059669;
            margin-bottom: 5px;
        }
        .summary-card .label {
            font-size: 9px;
            color: #6b7280;
            text-transform: uppercase;
        }
        .summary-card.warning .value {
            color: #d97706;
        }
        .summary-card.danger .value {
            color: #dc2626;
        }
        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #1f2937;
            margin: 20px 0 10px 0;
            padding-bottom: 5px;
            border-bottom: 2px solid #059669;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        table thead tr {
            background: #059669;
            color: white;
        }
        table th {
            padding: 8px;
            text-align: left;
            font-size: 9px;
            font-weight: bold;
            border: 1px solid #047857;
        }
        table td {
            padding: 6px;
            border: 1px solid #e5e7eb;
            font-size: 9px;
        }
        table tbody tr:nth-child(even) {
            background: #f9fafb;
        }
        .status-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: bold;
        }
        .status-paid {
            background: #dcfce7;
            color: #166534;
        }
        .status-pending {
            background: #fef3c7;
            color: #92400e;
        }
        .status-overdue {
            background: #fee2e2;
            color: #991b1b;
        }
        .text-right {
            text-align: right;
        }
        .footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            text-align: center;
            font-size: 8px;
            color: #6b7280;
            padding: 10px 0;
            border-top: 1px solid #e5e7eb;
        }
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <h1>💰 Relatório Financeiro</h1>
        <p>LogisticaPro - Gestão de Importação e Exportação</p>
    </div>

    <!-- Meta Information -->
    <div class="meta-info">
        <div class="row">
            <div class="label">Período:</div>
            <div class="value">{{ $startDate->format('d/m/Y') }} até {{ $endDate->format('d/m/Y') }}</div>
        </div>
        <div class="row">
            <div class="label">Gerado em:</div>
            <div class="value">{{ $generatedAt->format('d/m/Y H:i:s') }}</div>
        </div>
        <div class="row">
            <div class="label">Total de Faturas:</div>
            <div class="value">{{ count($data['invoices']) }}</div>
        </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards">
        <div class="summary-card">
            <div class="value">{{ number_format($data['summary']['total'], 2, ',', '.') }}</div>
            <div class="label">Receita Total</div>
        </div>
        <div class="summary-card">
            <div class="value">{{ number_format($data['summary']['paid'], 2, ',', '.') }}</div>
            <div class="label">Pago</div>
        </div>
        <div class="summary-card warning">
            <div class="value">{{ number_format($data['summary']['pending'], 2, ',', '.') }}</div>
            <div class="label">Pendente</div>
        </div>
        <div class="summary-card danger">
            <div class="value">{{ number_format($data['summary']['overdue'], 2, ',', '.') }}</div>
            <div class="label">Vencido</div>
        </div>
    </div>

    <!-- Invoices Summary -->
    <div class="section-title">📊 Resumo de Faturas</div>
    <table>
        <thead>
            <tr>
                <th>Status</th>
                <th class="text-right">Quantidade</th>
                <th class="text-right">Valor Total</th>
                <th class="text-right">Percentual</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><span class="status-badge status-paid">Pago</span></td>
                <td class="text-right">{{ $data['invoices_summary']['paid_count'] }}</td>
                <td class="text-right">{{ number_format($data['invoices_summary']['paid_amount'], 2, ',', '.') }}</td>
                <td class="text-right">
                    {{ $data['invoices_summary']['total_amount'] > 0 ? number_format(($data['invoices_summary']['paid_amount'] / $data['invoices_summary']['total_amount']) * 100, 1) : 0 }}%
                </td>
            </tr>
            <tr>
                <td><span class="status-badge status-pending">Pendente</span></td>
                <td class="text-right">{{ $data['invoices_summary']['pending_count'] }}</td>
                <td class="text-right">{{ number_format($data['invoices_summary']['pending_amount'], 2, ',', '.') }}</td>
                <td class="text-right">
                    {{ $data['invoices_summary']['total_amount'] > 0 ? number_format(($data['invoices_summary']['pending_amount'] / $data['invoices_summary']['total_amount']) * 100, 1) : 0 }}%
                </td>
            </tr>
            <tr>
                <td><span class="status-badge status-overdue">Vencido</span></td>
                <td class="text-right">{{ $data['invoices_summary']['overdue_count'] }}</td>
                <td class="text-right">{{ number_format($data['invoices_summary']['overdue_amount'], 2, ',', '.') }}</td>
                <td class="text-right">
                    {{ $data['invoices_summary']['total_amount'] > 0 ? number_format(($data['invoices_summary']['overdue_amount'] / $data['invoices_summary']['total_amount']) * 100, 1) : 0 }}%
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Revenue by Month -->
    @if(count($data['by_month']) > 0)
    <div class="section-title">📈 Receita por Mês</div>
    <table>
        <thead>
            <tr>
                <th>Mês</th>
                <th class="text-right">Quantidade de Faturas</th>
                <th class="text-right">Valor Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['by_month'] as $month)
            <tr>
                <td>{{ $month->month }}</td>
                <td class="text-right">{{ $month->count }}</td>
                <td class="text-right">{{ number_format($month->total, 2, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    <!-- Detailed Invoices List -->
    <div class="page-break"></div>
    <div class="section-title">📋 Lista Detalhada de Faturas</div>
    <table>
        <thead>
            <tr>
                <th>Nº Fatura</th>
                <th>Processo</th>
                <th>Emissor</th>
                <th class="text-right">Valor</th>
                <th>Status</th>
                <th>Vencimento</th>
                <th>Emissão</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['invoices'] as $invoice)
            <tr>
                <td><strong>{{ $invoice->invoice_number }}</strong></td>
                <td>{{ $invoice->shipment->reference_number ?? 'N/A' }}</td>
                <td>{{ $invoice->issuer ?? 'N/A' }}</td>
                <td class="text-right">{{ number_format($invoice->amount, 2, ',', '.') }} {{ $invoice->currency }}</td>
                <td>
                    <span class="status-badge status-{{ $invoice->status }}">
                        {{ ucfirst($invoice->status) }}
                    </span>
                </td>
                <td>{{ $invoice->due_date?->format('d/m/Y') ?? 'N/A' }}</td>
                <td>{{ $invoice->issue_date?->format('d/m/Y') ?? 'N/A' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Footer -->
    <div class="footer">
        <p>LogisticaPro © {{ date('Y') }} - Relatório gerado automaticamente</p>
        <p>Página <span class="pagenum"></span></p>
    </div>
</body>
</html>
