<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cotação {{ $quote->quote_number }}</title>
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
            border-bottom: 3px solid #0ea5e9;
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
            color: #0ea5e9;
            margin-bottom: 5px;
        }

        .company-details {
            font-size: 10px;
            color: #666;
            line-height: 1.4;
        }

        .quote-title {
            font-size: 32px;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 10px;
        }

        .quote-number {
            font-size: 14px;
            color: #666;
        }

        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            margin-top: 5px;
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

        .status-viewed {
            background: #e0e7ff;
            color: #4338ca;
        }

        /* Informações */
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
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
        }

        .info-title {
            font-size: 11px;
            font-weight: bold;
            color: #64748b;
            text-transform: uppercase;
            margin-bottom: 10px;
            letter-spacing: 0.5px;
        }

        .info-content {
            font-size: 12px;
            line-height: 1.8;
        }

        .info-content strong {
            color: #1e293b;
        }

        /* Description box */
        .description-box {
            background: #eff6ff;
            border-left: 4px solid #0ea5e9;
            padding: 15px;
            margin-bottom: 30px;
        }

        .description-box h3 {
            font-size: 13px;
            color: #0284c7;
            margin-bottom: 10px;
        }

        .description-box p {
            font-size: 11px;
            color: #1e293b;
            line-height: 1.6;
        }

        /* Tabela de Itens */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .items-table thead {
            background: #1e293b;
            color: white;
        }

        .items-table th {
            padding: 12px;
            text-align: left;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .items-table tbody tr {
            border-bottom: 1px solid #e2e8f0;
        }

        .items-table tbody tr:hover {
            background: #f8fafc;
        }

        .items-table td {
            padding: 10px 12px;
            font-size: 11px;
        }

        .items-table .text-right {
            text-align: right;
        }

        .items-table .text-center {
            text-align: center;
        }

        .items-table td small {
            color: #64748b;
            display: block;
            margin-top: 2px;
        }

        /* Totais */
        .totals {
            margin-top: 30px;
            float: right;
            width: 45%;
        }

        .totals table {
            width: 100%;
            border-collapse: collapse;
        }

        .totals td {
            padding: 8px 12px;
            font-size: 12px;
        }

        .totals .subtotal-row {
            border-top: 1px solid #e2e8f0;
        }

        .totals .discount-row {
            color: #dc2626;
            font-weight: 600;
        }

        .totals .total-row {
            background: #0ea5e9;
            color: white;
            font-size: 16px;
            font-weight: bold;
            border-radius: 8px;
        }

        .totals .total-row td {
            padding: 15px 12px;
        }

        /* Terms and Notes */
        .terms-section {
            clear: both;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
        }

        .terms-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
        }

        .terms-box h4 {
            font-size: 12px;
            color: #475569;
            margin-bottom: 8px;
        }

        .terms-box p {
            font-size: 11px;
            color: #64748b;
            line-height: 1.6;
            white-space: pre-wrap;
        }

        /* Footer */
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
        }

        .footer strong {
            color: #475569;
        }

        /* Validity notice */
        .validity-notice {
            background: #fef3c7;
            border: 1px solid #fde047;
            border-radius: 6px;
            padding: 10px 15px;
            margin: 20px 0;
            font-size: 11px;
            color: #854d0e;
        }

        .validity-notice strong {
            color: #713f12;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- HEADER -->
        <div class="header">
            <div class="header-left">
                <div class="company-name">LogisticaPro</div>
                <div class="company-details">
                    Beira, Moçambique<br>
                    Tel: +258 84 123 4567 | Email: info@logisticapro.co.mz<br>
                    NUIT: 123456789
                </div>
            </div>
            <div class="header-right">
                <div class="quote-title">COTAÇÃO</div>
                <div class="quote-number">{{ $quote->quote_number }}</div>
                <div>
                    <span class="status-badge status-{{ $quote->status }}">
                        @switch($quote->status)
                            @case('draft') RASCUNHO @break
                            @case('sent') ENVIADA @break
                            @case('viewed') VISUALIZADA @break
                            @case('accepted') ACEITA @break
                            @case('rejected') REJEITADA @break
                            @case('expired') EXPIRADA @break
                            @case('converted') CONVERTIDA @break
                            @default {{ strtoupper($quote->status) }}
                        @endswitch
                    </span>
                </div>
            </div>
        </div>

        <!-- INFORMAÇÕES -->
        <div class="info-section">
            <div class="info-left">
                <div class="info-box">
                    <div class="info-title">Cliente</div>
                    <div class="info-content">
                        <strong>{{ $quote->client->name }}</strong><br>
                        @if(!empty($quote->client->address))
                            {{ $quote->client->address }}<br>
                        @endif
                        @if(!empty($quote->client->phone))
                            Tel: {{ $quote->client->phone }}<br>
                        @endif
                        @if(!empty($quote->client->email))
                            Email: {{ $quote->client->email }}
                        @endif
                    </div>
                </div>
            </div>
            <div class="info-right">
                <div class="info-box">
                    <div class="info-title">Detalhes da Cotação</div>
                    <div class="info-content">
                        <strong>Data da Cotação:</strong> {{ \Carbon\Carbon::parse($quote->quote_date)->format('d/m/Y') }}<br>
                        <strong>Válido Até:</strong> {{ \Carbon\Carbon::parse($quote->valid_until)->format('d/m/Y') }}<br>
                        <strong>Moeda:</strong> {{ $quote->currency }}<br>
                        @if($quote->payment_terms)
                            <strong>Condições de Pagamento:</strong> {{ $quote->payment_terms }}
                        @endif
                    </div>
                </div>
            </div>
        </div>

        <!-- VALIDITY NOTICE -->
        @php
            $validUntil = \Carbon\Carbon::parse($quote->valid_until);
            $now = \Carbon\Carbon::now();
            $daysLeft = $now->diffInDays($validUntil, false);
        @endphp

        @if($daysLeft >= 0 && $daysLeft <= 7)
            <div class="validity-notice">
                <strong>⚠️ Atenção:</strong> Esta cotação é válida por mais {{ $daysLeft }} {{ $daysLeft === 1 ? 'dia' : 'dias' }}.
            </div>
        @elseif($daysLeft < 0)
            <div class="validity-notice" style="background: #fee2e2; border-color: #fca5a5; color: #991b1b;">
                <strong>❌ Expirada:</strong> Esta cotação expirou em {{ $validUntil->format('d/m/Y') }}.
            </div>
        @endif

        <!-- TÍTULO E DESCRIÇÃO -->
        @if($quote->title)
            <div class="description-box">
                <h3>{{ $quote->title }}</h3>
                @if($quote->description)
                    <p>{{ $quote->description }}</p>
                @endif
            </div>
        @endif

        <!-- TABELA DE ITENS -->
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 40%;">Serviço</th>
                    <th style="width: 10%;" class="text-center">Qtd</th>
                    <th style="width: 15%;" class="text-right">Preço Unit.</th>
                    <th style="width: 13%;" class="text-right">Subtotal</th>
                    <th style="width: 10%;" class="text-right">IVA</th>
                    <th style="width: 12%;" class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($quote->items as $item)
                <tr>
                    <td>
                        <strong>{{ $item->service_name }}</strong>
                        @if($item->description)
                            <small>{{ $item->description }}</small>
                        @endif
                    </td>
                    <td class="text-center">{{ number_format($item->quantity, 2) }} {{ $item->unit }}</td>
                    <td class="text-right">{{ number_format($item->unit_price, 2) }}</td>
                    <td class="text-right">{{ number_format($item->subtotal, 2) }}</td>
                    <td class="text-right">{{ number_format($item->tax_amount, 2) }}</td>
                    <td class="text-right"><strong>{{ number_format($item->total, 2) }}</strong></td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- TOTAIS -->
        <div class="totals">
            <table>
                <tr class="subtotal-row">
                    <td><strong>Subtotal:</strong></td>
                    <td class="text-right">{{ number_format($quote->subtotal, 2) }} {{ $quote->currency }}</td>
                </tr>
                @if($quote->discount_amount > 0)
                <tr class="discount-row">
                    <td><strong>Desconto ({{ $quote->discount_percentage }}%):</strong></td>
                    <td class="text-right">-{{ number_format($quote->discount_amount, 2) }} {{ $quote->currency }}</td>
                </tr>
                @endif
                <tr>
                    <td><strong>IVA Total:</strong></td>
                    <td class="text-right">{{ number_format($quote->tax_amount, 2) }} {{ $quote->currency }}</td>
                </tr>
                <tr class="total-row">
                    <td><strong>TOTAL:</strong></td>
                    <td class="text-right"><strong>{{ number_format($quote->total, 2) }} {{ $quote->currency }}</strong></td>
                </tr>
            </table>
        </div>

        <!-- TERMOS E OBSERVAÇÕES -->
        @if($quote->terms || $quote->customer_notes)
            <div class="terms-section">
                @if($quote->terms)
                    <div class="terms-box">
                        <h4>📋 Termos e Condições</h4>
                        <p>{{ $quote->terms }}</p>
                    </div>
                @endif

                @if($quote->customer_notes)
                    <div class="terms-box">
                        <h4>📝 Observações</h4>
                        <p>{{ $quote->customer_notes }}</p>
                    </div>
                @endif
            </div>
        @endif

        <!-- FOOTER -->
        <div class="footer">
            <p>
                <strong>Obrigado pelo seu interesse!</strong><br>
                Esta cotação foi gerada eletronicamente. Para questões ou esclarecimentos, contacte-nos através de info@logisticapro.co.mz<br>
                <br>
                <em>LogisticaPro - Facilitando sua logística com excelência</em><br>
                Gerado em {{ now()->format('d/m/Y H:i') }}
            </p>
        </div>
    </div>
</body>
</html>
