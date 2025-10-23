<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $quote->quote_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #333;
            padding: 20mm;
        }
        .header {
            border-bottom: 3px solid #1e293b;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .company-name {
            font-size: 24pt;
            font-weight: bold;
            color: #1e293b;
        }
        .document-title {
            font-size: 18pt;
            font-weight: bold;
            color: #0ea5e9;
            margin-top: 5px;
        }
        .info-grid {
            display: table;
            width: 100%;
            margin: 20px 0;
        }
        .info-row {
            display: table-row;
        }
        .info-label {
            display: table-cell;
            font-weight: bold;
            padding: 5px 10px 5px 0;
            width: 30%;
        }
        .info-value {
            display: table-cell;
            padding: 5px;
        }
        .section-title {
            font-size: 14pt;
            font-weight: bold;
            color: #1e293b;
            margin: 20px 0 10px 0;
            padding-bottom: 5px;
            border-bottom: 2px solid #e2e8f0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        table thead {
            background: #1e293b;
            color: white;
        }
        table th {
            padding: 10px;
            text-align: left;
            font-weight: bold;
        }
        table td {
            padding: 8px 10px;
            border-bottom: 1px solid #e2e8f0;
        }
        table tbody tr:nth-child(even) {
            background: #f8fafc;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .totals {
            width: 50%;
            margin-left: auto;
            margin-top: 20px;
        }
        .totals-row {
            display: table;
            width: 100%;
            padding: 5px 0;
        }
        .totals-label {
            display: table-cell;
            text-align: right;
            padding-right: 20px;
        }
        .totals-value {
            display: table-cell;
            text-align: right;
            font-weight: bold;
        }
        .grand-total {
            border-top: 2px solid #1e293b;
            margin-top: 10px;
            padding-top: 10px;
            font-size: 14pt;
        }
        .notes-box {
            background: #f8fafc;
            padding: 15px;
            margin: 20px 0;
            border-left: 4px solid #0ea5e9;
        }
        .footer {
            position: fixed;
            bottom: 10mm;
            left: 20mm;
            right: 20mm;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
            font-size: 9pt;
            color: #64748b;
            text-align: center;
        }
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 10pt;
            font-weight: bold;
        }
        .status-draft {
            background: #f1f5f9;
            color: #475569;
        }
        .status-sent {
            background: #dbeafe;
            color: #1e40af;
        }
        .status-accepted {
            background: #dcfce7;
            color: #166534;
        }
        .page-number:after {
            content: counter(page);
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">LogisticaPro</div>
        <div class="document-title">COTAÇÃO</div>
        <div style="margin-top: 10px;">
            <strong>{{ $quote->quote_number }}</strong>
            <span class="status-badge status-{{ $quote->status }}">
                {{ strtoupper($quote->status) }}
            </span>
        </div>
    </div>

    <div class="info-grid">
        <div class="info-row">
            <div class="info-label">Cliente:</div>
            <div class="info-value">{{ $quote->client->name }}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Data da Cotação:</div>
            <div class="info-value">{{ \Carbon\Carbon::parse($quote->quote_date)->format('d/m/Y') }}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Válido Até:</div>
            <div class="info-value">{{ \Carbon\Carbon::parse($quote->valid_until)->format('d/m/Y') }}</div>
        </div>
        @if($quote->payment_terms)
        <div class="info-row">
            <div class="info-label">Condições de Pagamento:</div>
            <div class="info-value">{{ $quote->payment_terms }}</div>
        </div>
        @endif
        <div class="info-row">
            <div class="info-label">Moeda:</div>
            <div class="info-value">{{ $quote->currency }}</div>
        </div>
    </div>

    <div class="section-title">{{ $quote->title }}</div>

    @if($quote->description)
    <div class="notes-box">
        <strong>Descrição:</strong><br>
        {{ $quote->description }}
    </div>
    @endif

    <div class="section-title">Itens da Cotação</div>
    <table>
        <thead>
            <tr>
                <th style="width: 40%;">Serviço</th>
                <th style="width: 10%;" class="text-center">Qtd</th>
                <th style="width: 15%;" class="text-right">Preço Unit.</th>
                <th style="width: 15%;" class="text-right">Subtotal</th>
                <th style="width: 10%;" class="text-right">IVA</th>
                <th style="width: 10%;" class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($quote->items as $item)
            <tr>
                <td>
                    <strong>{{ $item->service_name }}</strong>
                    @if($item->description)
                        <br><small style="color: #64748b;">{{ $item->description }}</small>
                    @endif
                </td>
                <td class="text-center">{{ number_format($item->quantity, 2) }} {{ $item->unit }}</td>
                <td class="text-right">{{ number_format($item->unit_price, 2) }}</td>
                <td class="text-right">{{ number_format($item->subtotal, 2) }}</td>
                <td class="text-right">{{ number_format($item->tax_amount, 2) }}</td>
                <td class="text-right">{{ number_format($item->total, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals">
        <div class="totals-row">
            <div class="totals-label">Subtotal:</div>
            <div class="totals-value">{{ number_format($quote->subtotal, 2) }} {{ $quote->currency }}</div>
        </div>
        @if($quote->discount_amount > 0)
        <div class="totals-row">
            <div class="totals-label">Desconto ({{ $quote->discount_percentage }}%):</div>
            <div class="totals-value" style="color: #dc2626;">- {{ number_format($quote->discount_amount, 2) }} {{ $quote->currency }}</div>
        </div>
        @endif
        <div class="totals-row">
            <div class="totals-label">IVA Total:</div>
            <div class="totals-value">{{ number_format($quote->tax_amount, 2) }} {{ $quote->currency }}</div>
        </div>
        <div class="totals-row grand-total">
            <div class="totals-label">TOTAL:</div>
            <div class="totals-value">{{ number_format($quote->total, 2) }} {{ $quote->currency }}</div>
        </div>
    </div>

    @if($quote->terms || $quote->customer_notes)
    <div class="section-title">Termos e Observações</div>

    @if($quote->terms)
    <div class="notes-box">
        <strong>Termos e Condições:</strong><br>
        <div style="white-space: pre-wrap;">{{ $quote->terms }}</div>
    </div>
    @endif

    @if($quote->customer_notes)
    <div class="notes-box">
        <strong>Observações:</strong><br>
        <div style="white-space: pre-wrap;">{{ $quote->customer_notes }}</div>
    </div>
    @endif
    @endif

    <div class="footer">
        <p>LogisticaPro - Sistema de Gestão Logística | Gerado em {{ now()->format('d/m/Y H:i') }}</p>
        <p>Página <span class="page-number"></span></p>
    </div>
</body>
</html>
