<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Fatura {{ $invoice->invoice_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 10pt;
            color: #333;
            line-height: 1.6;
        }

        .container {
            padding: 30px;
        }

        /* Header */
        .header {
            display: table;
            width: 100%;
            margin-bottom: 30px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
        }

        .header-left {
            display: table-cell;
            width: 60%;
            vertical-align: middle;
        }

        .header-right {
            display: table-cell;
            width: 40%;
            text-align: right;
            vertical-align: middle;
        }

        .logo {
            max-width: 180px;
            height: auto;
            margin-bottom: 10px;
        }

        .company-name {
            font-size: 20pt;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
        }

        .company-info {
            font-size: 9pt;
            color: #666;
            line-height: 1.5;
        }

        .invoice-title {
            font-size: 28pt;
            font-weight: bold;
            color: #1e40af;
            text-align: right;
        }

        .invoice-number {
            font-size: 12pt;
            color: #666;
            text-align: right;
            margin-top: 5px;
        }

        /* Info Section */
        .info-section {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }

        .info-left, .info-right {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }

        .info-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin-right: 10px;
        }

        .info-right .info-box {
            margin-right: 0;
            margin-left: 10px;
        }

        .info-title {
            font-size: 10pt;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
            text-transform: uppercase;
        }

        .info-content {
            font-size: 9pt;
            line-height: 1.8;
        }

        .info-label {
            font-weight: bold;
            color: #666;
        }

        /* Table */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .items-table thead {
            background-color: #1e40af;
            color: white;
        }

        .items-table th {
            padding: 12px;
            text-align: left;
            font-weight: bold;
            font-size: 9pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .items-table th.text-right {
            text-align: right;
        }

        .items-table th.text-center {
            text-align: center;
        }

        .items-table tbody tr {
            border-bottom: 1px solid #e2e8f0;
        }

        .items-table tbody tr:nth-child(even) {
            background-color: #f8fafc;
        }

        .items-table td {
            padding: 10px 12px;
            font-size: 9pt;
        }

        .items-table td.text-right {
            text-align: right;
        }

        .items-table td.text-center {
            text-align: center;
        }

        .category-badge {
            display: inline-block;
            background-color: #e0e7ff;
            color: #3730a3;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 8pt;
            font-weight: 600;
        }

        /* Totals */
        .totals-section {
            display: table;
            width: 100%;
            margin-top: 20px;
        }

        .totals-left {
            display: table-cell;
            width: 60%;
            vertical-align: top;
        }

        .totals-right {
            display: table-cell;
            width: 40%;
            vertical-align: top;
        }

        .totals-box {
            background-color: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
        }

        .total-row {
            display: table;
            width: 100%;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }

        .total-row:last-child {
            border-bottom: none;
        }

        .total-label {
            display: table-cell;
            font-size: 10pt;
            color: #666;
            text-align: left;
        }

        .total-value {
            display: table-cell;
            font-size: 11pt;
            font-weight: bold;
            color: #333;
            text-align: right;
        }

        .grand-total {
            background-color: #1e40af;
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-top: 10px;
        }

        .grand-total .total-label,
        .grand-total .total-value {
            color: white;
            font-size: 14pt;
            font-weight: bold;
        }

        /* Payment Terms */
        .payment-terms {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin-top: 20px;
            border-radius: 4px;
        }

        .payment-terms-title {
            font-weight: bold;
            color: #92400e;
            margin-bottom: 8px;
            font-size: 10pt;
        }

        .payment-terms-content {
            font-size: 9pt;
            color: #78350f;
        }

        /* Status Badge */
        .status-badge {
            display: inline-block;
            padding: 6px 15px;
            border-radius: 20px;
            font-size: 9pt;
            font-weight: bold;
            margin-top: 5px;
        }

        .status-pending {
            background-color: #fef3c7;
            color: #92400e;
        }

        .status-paid {
            background-color: #d1fae5;
            color: #065f46;
        }

        .status-overdue {
            background-color: #fee2e2;
            color: #991b1b;
        }

        /* Footer */
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            font-size: 8pt;
            color: #666;
        }

        .footer-note {
            margin-bottom: 10px;
            font-style: italic;
        }

        /* Page Break */
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="header-left">
                @if(file_exists($company['logo_path']))
                    <img src="{{ $company['logo_path'] }}" alt="Logo" class="logo">
                @endif
                <div class="company-name">{{ $company['name'] }}</div>
                <div class="company-info">
                    {{ $company['address'] }}<br>
                    Telefone: {{ $company['phone'] }}<br>
                    Email: {{ $company['email'] }}<br>
                    NUIT: {{ $company['nuit'] }}
                </div>
            </div>
            <div class="header-right">
                <div class="invoice-title">FATURA</div>
                <div class="invoice-number">{{ $invoice->invoice_number }}</div>
                <div class="status-badge status-{{ $invoice->status }}">
                    @if($invoice->status === 'paid')
                        ✓ PAGA
                    @elseif($invoice->status === 'pending' && $invoice->due_date < now())
                        ⚠ VENCIDA
                    @else
                        ⏳ PENDENTE
                    @endif
                </div>
            </div>
        </div>

        <!-- Info Section -->
        <div class="info-section">
            <div class="info-left">
                <div class="info-box">
                    <div class="info-title">Faturado Para:</div>
                    <div class="info-content">
                        <strong>{{ $invoice->shipment->client->company_name ?? $invoice->shipment->client->name }}</strong><br>
                        @if($invoice->shipment->client->tax_id)
                            <span class="info-label">NUIT:</span> {{ $invoice->shipment->client->tax_id }}<br>
                        @endif
                        @if($invoice->shipment->client->address)
                            <span class="info-label">Endereço:</span> {{ $invoice->shipment->client->address }}<br>
                        @endif
                        @if($invoice->shipment->client->email)
                            <span class="info-label">Email:</span> {{ $invoice->shipment->client->email }}<br>
                        @endif
                        @if($invoice->shipment->client->phone)
                            <span class="info-label">Telefone:</span> {{ $invoice->shipment->client->phone }}
                        @endif
                    </div>
                </div>
            </div>
            <div class="info-right">
                <div class="info-box">
                    <div class="info-title">Detalhes da Fatura:</div>
                    <div class="info-content">
                        <span class="info-label">Data de Emissão:</span> {{ $invoice->issue_date->format('d/m/Y') }}<br>
                        <span class="info-label">Data de Vencimento:</span> {{ $invoice->due_date->format('d/m/Y') }}<br>
                        @if($invoice->payment_date)
                            <span class="info-label">Data de Pagamento:</span> {{ $invoice->payment_date->format('d/m/Y') }}<br>
                        @endif
                        <span class="info-label">Processo:</span> {{ $invoice->shipment->reference_number }}<br>
                        <span class="info-label">Cotação:</span> {{ $invoice->metadata['quotation_reference'] ?? 'N/A' }}<br>
                        <span class="info-label">Moeda:</span> {{ $invoice->currency }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th class="text-center">Qtd</th>
                    <th class="text-right">Preço Unit.</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($invoice->items as $item)
                <tr>
                    <td>{{ $item->description }}</td>
                    <td>
                        <span class="category-badge">
                            {{ $item->metadata['category'] ?? 'Geral' }}
                        </span>
                    </td>
                    <td class="text-center">{{ $item->quantity }}</td>
                    <td class="text-right">{{ number_format($item->unit_price, 2, ',', '.') }}</td>
                    <td class="text-right">{{ number_format($item->amount, 2, ',', '.') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Totals -->
        <div class="totals-section">
            <div class="totals-left">
                @if($invoice->terms)
                <div class="payment-terms">
                    <div class="payment-terms-title">Termos de Pagamento:</div>
                    <div class="payment-terms-content">{{ $invoice->terms }}</div>
                </div>
                @endif

                @if($invoice->notes)
                <div class="payment-terms" style="background-color: #dbeafe; border-left-color: #2563eb; margin-top: 15px;">
                    <div class="payment-terms-title" style="color: #1e40af;">Observações:</div>
                    <div class="payment-terms-content" style="color: #1e3a8a;">{{ $invoice->notes }}</div>
                </div>
                @endif
            </div>
            <div class="totals-right">
                <div class="totals-box">
                    <div class="total-row">
                        <div class="total-label">Subtotal:</div>
                        <div class="total-value">{{ number_format($invoice->subtotal, 2, ',', '.') }} MZN</div>
                    </div>
                    <div class="total-row">
                        <div class="total-label">IVA (16%):</div>
                        <div class="total-value">{{ number_format($invoice->tax_amount, 2, ',', '.') }} MZN</div>
                    </div>
                    <div class="grand-total">
                        <div class="total-row">
                            <div class="total-label">TOTAL:</div>
                            <div class="total-value">{{ number_format($invoice->amount, 2, ',', '.') }} MZN</div>
                        </div>
                    </div>
                </div>

                @if($invoice->payment_date && $invoice->payment_reference)
                <div style="background-color: #d1fae5; border: 2px solid: #10b981; border-radius: 8px; padding: 15px; margin-top: 15px;">
                    <div style="font-weight: bold; color: #065f46; margin-bottom: 5px;">✓ Pagamento Confirmado</div>
                    <div style="font-size: 9pt; color: #047857;">
                        <strong>Referência:</strong> {{ $invoice->payment_reference }}
                    </div>
                </div>
                @endif
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-note">
                Obrigado pela sua preferência!
            </div>
            <div>
                Esta é uma fatura gerada automaticamente do sistema LogisticaPro.<br>
                Em caso de dúvidas, contacte-nos através de {{ $company['email'] }} ou {{ $company['phone'] }}.
            </div>
        </div>
    </div>
</body>
</html>
