<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>Nota de Crédito {{ $creditNote->credit_note_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            font-size: 12px;
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
            border-bottom: 3px solid #8b5cf6;
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
            color: #8b5cf6;
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
            margin-bottom: 10px;
        }

        .doc-number {
            font-size: 14px;
            color: #666;
        }

        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 10px;
            font-weight: bold;
            margin-top: 5px;
        }

        .status-issued {
            background: #dbeafe;
            color: #1e40af;
        }

        .status-applied {
            background: #d1fae5;
            color: #065f46;
        }

        /* Info Section */
        .info-section {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }

        .info-left, .info-right {
            display: table-cell;
            width: 48%;
            vertical-align: top;
        }

        .info-right {
            padding-left: 4%;
        }

        .info-box {
            background: #f5f3ff;
            border: 1px solid #ddd6fe;
            border-radius: 8px;
            padding: 15px;
        }

        .info-title {
            font-size: 11px;
            font-weight: bold;
            color: #7c3aed;
            text-transform: uppercase;
            margin-bottom: 10px;
        }

        .info-row {
            margin-bottom: 8px;
        }

        .info-label {
            font-size: 10px;
            color: #666;
            display: inline-block;
            width: 100px;
        }

        .info-value {
            font-size: 11px;
            font-weight: 600;
            color: #333;
        }

        /* Invoice Reference */
        .invoice-ref {
            background: #eff6ff;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin-bottom: 30px;
        }

        .invoice-ref-title {
            font-size: 11px;
            color: #64748b;
            margin-bottom: 5px;
        }

        .invoice-ref-value {
            font-size: 14px;
            font-weight: bold;
            color: #2563eb;
        }

        /* Items Table */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .items-table thead {
            background: #8b5cf6;
            color: white;
        }

        .items-table th {
            padding: 12px 8px;
            text-align: left;
            font-size: 11px;
            font-weight: bold;
        }

        .items-table th.text-right {
            text-align: right;
        }

        .items-table td {
            padding: 10px 8px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 11px;
        }

        .items-table td.text-right {
            text-align: right;
        }

        .items-table tbody tr:hover {
            background: #faf5ff;
        }

        /* Totals */
        .totals-section {
            float: right;
            width: 300px;
            margin-top: 20px;
        }

        .totals-row {
            display: table;
            width: 100%;
            padding: 8px 0;
        }

        .totals-label {
            display: table-cell;
            text-align: left;
            font-size: 12px;
            color: #666;
        }

        .totals-value {
            display: table-cell;
            text-align: right;
            font-size: 12px;
            font-weight: 600;
        }

        .totals-final {
            border-top: 2px solid #8b5cf6;
            padding-top: 12px;
            margin-top: 8px;
        }

        .totals-final .totals-label {
            font-size: 14px;
            font-weight: bold;
            color: #333;
        }

        .totals-final .totals-value {
            font-size: 18px;
            font-weight: bold;
            color: #8b5cf6;
        }

        .clear {
            clear: both;
        }

        /* Notes */
        .notes-section {
            background: #fef3c7;
            border: 1px solid #fde68a;
            border-radius: 8px;
            padding: 15px;
            margin-top: 30px;
        }

        .notes-title {
            font-size: 11px;
            font-weight: bold;
            color: #d97706;
            margin-bottom: 10px;
        }

        .notes-text {
            font-size: 11px;
            color: #92400e;
            line-height: 1.6;
        }

        /* Footer */
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
        }

        .footer-text {
            font-size: 10px;
            color: #9ca3af;
            line-height: 1.4;
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
                <div class="doc-title">NOTA DE CRÉDITO</div>
                <div class="doc-number">{{ $creditNote->credit_note_number }}</div>
                <div class="status-badge status-{{ $creditNote->status }}">
                    {{ strtoupper($creditNote->status) }}
                </div>
            </div>
        </div>

        <!-- Client & Document Info -->
        <div class="info-section">
            <div class="info-left">
                <div class="info-box">
                    <div class="info-title">Cliente</div>
                    <div class="info-row">
                        <span class="info-label">Nome:</span>
                        <span class="info-value">{{ $creditNote->client->name }}</span>
                    </div>
                    @if($creditNote->client->email)
                    <div class="info-row">
                        <span class="info-label">Email:</span>
                        <span class="info-value">{{ $creditNote->client->email }}</span>
                    </div>
                    @endif
                    @if($creditNote->client->phone)
                    <div class="info-row">
                        <span class="info-label">Telefone:</span>
                        <span class="info-value">{{ $creditNote->client->phone }}</span>
                    </div>
                    @endif
                </div>
            </div>
            <div class="info-right">
                <div class="info-box">
                    <div class="info-title">Informações do Documento</div>
                    <div class="info-row">
                        <span class="info-label">Data Emissão:</span>
                        <span class="info-value">{{ \Carbon\Carbon::parse($creditNote->issue_date)->format('d/m/Y') }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Motivo:</span>
                        <span class="info-value">{{ $creditNote->reason_label }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Moeda:</span>
                        <span class="info-value">{{ $creditNote->currency }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Invoice Reference -->
        <div class="invoice-ref">
            <div class="invoice-ref-title">Referente à Fatura:</div>
            <div class="invoice-ref-value">{{ $creditNote->invoice->invoice_number }}</div>
        </div>

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 45%">Descrição</th>
                    <th style="width: 10%;" class="text-right">Qtd</th>
                    <th style="width: 15%;" class="text-right">Preço Unit.</th>
                    <th style="width: 10%;" class="text-right">IVA %</th>
                    <th style="width: 20%;" class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($creditNote->items as $item)
                <tr>
                    <td>{{ $item->description }}</td>
                    <td class="text-right">{{ number_format($item->quantity, 2, ',', '.') }}</td>
                    <td class="text-right">{{ number_format($item->unit_price, 2, ',', '.') }}</td>
                    <td class="text-right">{{ number_format($item->tax_rate, 0) }}%</td>
                    <td class="text-right">{{ number_format($item->total, 2, ',', '.') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Totals -->
        <div class="totals-section">
            <div class="totals-row">
                <div class="totals-label">Subtotal:</div>
                <div class="totals-value">{{ number_format($creditNote->subtotal, 2, ',', '.') }} {{ $creditNote->currency }}</div>
            </div>
            <div class="totals-row">
                <div class="totals-label">IVA:</div>
                <div class="totals-value">{{ number_format($creditNote->tax_amount, 2, ',', '.') }} {{ $creditNote->currency }}</div>
            </div>
            <div class="totals-row totals-final">
                <div class="totals-label">Total:</div>
                <div class="totals-value">{{ number_format($creditNote->total, 2, ',', '.') }} {{ $creditNote->currency }}</div>
            </div>
        </div>
        <div class="clear"></div>

        <!-- Notes -->
        @if($creditNote->notes || $creditNote->reason_description)
        <div class="notes-section">
            <div class="notes-title">Observações:</div>
            <div class="notes-text">
                @if($creditNote->reason_description)
                <strong>Motivo:</strong> {{ $creditNote->reason_description }}<br><br>
                @endif
                @if($creditNote->notes)
                {{ $creditNote->notes }}
                @endif
            </div>
        </div>
        @endif

        <!-- Footer -->
        <div class="footer">
            <div class="footer-text">
                Este documento é uma nota de crédito oficial.<br>
                Emitido eletronicamente por LogisticaPro - Sistema de Gestão Logística<br>
                Data de emissão: {{ \Carbon\Carbon::now()->format('d/m/Y H:i:s') }}
            </div>
        </div>
    </div>
</body>
</html>
