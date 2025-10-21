<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fatura {{ $invoice['invoice_number'] }}</title>
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
            border-bottom: 3px solid #2563eb;
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
            color: #2563eb;
            margin-bottom: 5px;
        }

        .company-details {
            font-size: 10px;
            color: #666;
            line-height: 1.4;
        }

        .invoice-title {
            font-size: 32px;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 10px;
        }

        .invoice-number {
            font-size: 14px;
            color: #666;
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

        /* Detalhes do Shipment */
        .shipment-details {
            background: #eff6ff;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin-bottom: 30px;
        }

        .shipment-details h3 {
            font-size: 13px;
            color: #1e40af;
            margin-bottom: 10px;
        }

        .shipment-details table {
            width: 100%;
            font-size: 11px;
        }

        .shipment-details td {
            padding: 4px 0;
        }

        .shipment-details td:first-child {
            color: #64748b;
            width: 40%;
        }

        .shipment-details td:last-child {
            font-weight: 600;
            color: #1e293b;
        }

        /* Tabela de Custos */
        .costs-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .costs-table thead {
            background: #1e293b;
            color: white;
        }

        .costs-table th {
            padding: 12px;
            text-align: left;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .costs-table tbody tr {
            border-bottom: 1px solid #e2e8f0;
        }

        .costs-table tbody tr:hover {
            background: #f8fafc;
        }

        .costs-table td {
            padding: 10px 12px;
            font-size: 11px;
        }

        .costs-table .section-header {
            background: #f1f5f9;
            font-weight: bold;
            color: #475569;
        }

        .costs-table .text-right {
            text-align: right;
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

        .totals .margin-row {
            color: #10b981;
            font-weight: 600;
        }

        .totals .total-row {
            background: #10b981;
            color: white;
            font-size: 16px;
            font-weight: bold;
            border-radius: 8px;
        }

        .totals .total-row td {
            padding: 15px 12px;
        }

        /* Notas */
        .notes {
            clear: both;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
        }

        .notes h3 {
            font-size: 12px;
            color: #475569;
            margin-bottom: 10px;
        }

        .notes p {
            font-size: 11px;
            color: #64748b;
            line-height: 1.6;
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

        /* Page break */
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- HEADER -->
        <div class="header">
            <div class="header-left">
                <div class="company-name">{{ $company['name'] }}</div>
                <div class="company-details">
                    {{ $company['address'] }}<br>
                    Tel: {{ $company['phone'] }} | Email: {{ $company['email'] }}<br>
                    NUIT: {{ $company['nuit'] }}
                </div>
            </div>
            <div class="header-right">
                <div class="invoice-title">FATURA</div>
                <div class="invoice-number">{{ $invoice['invoice_number'] }}</div>
            </div>
        </div>

        <!-- INFORMAÇÕES -->
        <div class="info-section">
            <div class="info-left">
                <div class="info-box">
                    <div class="info-title">Faturado Para</div>
                    <div class="info-content">
                        <strong>{{ $invoice['client']['name'] }}</strong><br>
                        @if(!empty($invoice['client']['address']))
                            {{ $invoice['client']['address'] }}<br>
                        @endif
                        @if(!empty($invoice['client']['phone']))
                            Tel: {{ $invoice['client']['phone'] }}<br>
                        @endif
                        Email: {{ $invoice['client']['email'] }}
                    </div>
                </div>
            </div>
            <div class="info-right">
                <div class="info-box">
                    <div class="info-title">Detalhes da Fatura</div>
                    <div class="info-content">
                        <strong>Data de Emissão:</strong> {{ date('d/m/Y', strtotime($invoice['issue_date'])) }}<br>
                        <strong>Data de Vencimento:</strong> {{ date('d/m/Y', strtotime($invoice['due_date'])) }}<br>
                        <strong>Moeda:</strong> USD
                    </div>
                </div>
            </div>
        </div>

        <!-- DETALHES DO SHIPMENT -->
        <div class="shipment-details">
            <h3>📦 Informações do Shipment</h3>
            <table>
                <tr>
                    <td>Referência:</td>
                    <td>{{ $invoice['shipment']['reference'] }}</td>
                    <td>BL Number:</td>
                    <td>{{ $invoice['shipment']['bl_number'] }}</td>
                </tr>
                <tr>
                    <td>Porto de Origem:</td>
                    <td>{{ $invoice['shipment']['origin'] }}</td>
                    <td>Porto de Destino:</td>
                    <td>{{ $invoice['shipment']['destination'] }}</td>
                </tr>
                <tr>
                    <td>Número de Containers:</td>
                    <td colspan="3">{{ $invoice['container_count'] }}</td>
                </tr>
            </table>
        </div>

        <!-- TABELA DE CUSTOS -->
        <table class="costs-table">
            <thead>
                <tr>
                    <th style="width: 60%;">Descrição</th>
                    <th style="width: 20%;">Destinatário</th>
                    <th style="width: 20%;" class="text-right">Valor (USD)</th>
                </tr>
            </thead>
            <tbody>
                <!-- COLETA DISPERSA -->
                @if(count($invoice['costs_by_phase']['coleta_dispersa']) > 0)
                    <tr class="section-header">
                        <td colspan="3">🚢 FASE 1: COLETA DISPERSA</td>
                    </tr>
                    @foreach($invoice['costs_by_phase']['coleta_dispersa'] as $cost)
                        <tr>
                            <td>{{ $cost['description'] }}</td>
                            <td>{{ $cost['payee'] }}</td>
                            <td class="text-right">${{ number_format($cost['amount'], 2) }}</td>
                        </tr>
                    @endforeach
                @endif

                <!-- ALFÂNDEGAS -->
                @if(count($invoice['costs_by_phase']['alfandegas']) > 0)
                    <tr class="section-header">
                        <td colspan="3">🏛️ FASE 3: ALFÂNDEGAS</td>
                    </tr>
                    @foreach($invoice['costs_by_phase']['alfandegas'] as $cost)
                        <tr>
                            <td>{{ $cost['description'] }}</td>
                            <td>{{ $cost['payee'] }}</td>
                            <td class="text-right">${{ number_format($cost['amount'], 2) }}</td>
                        </tr>
                    @endforeach
                @endif

                <!-- CORNELDER -->
                @if(count($invoice['costs_by_phase']['cornelder']) > 0)
                    <tr class="section-header">
                        <td colspan="3">📦 FASE 4: CORNELDER</td>
                    </tr>
                    @foreach($invoice['costs_by_phase']['cornelder'] as $cost)
                        <tr>
                            <td>{{ $cost['description'] }}</td>
                            <td>{{ $cost['payee'] }}</td>
                            <td class="text-right">${{ number_format($cost['amount'], 2) }}</td>
                        </tr>
                    @endforeach
                @endif

                <!-- OUTROS -->
                @if(count($invoice['costs_by_phase']['outros']) > 0)
                    <tr class="section-header">
                        <td colspan="3">📋 OUTROS CUSTOS</td>
                    </tr>
                    @foreach($invoice['costs_by_phase']['outros'] as $cost)
                        <tr>
                            <td>{{ $cost['description'] }}</td>
                            <td>{{ $cost['payee'] }}</td>
                            <td class="text-right">${{ number_format($cost['amount'], 2) }}</td>
                        </tr>
                    @endforeach
                @endif

                <!-- CUSTOS PADRÕES (BASE RATES) -->
                <tr class="section-header">
                    <td colspan="3">⭐ CUSTOS PADRÕES - LOGÍSTICA PRO</td>
                </tr>
                @foreach($invoice['base_rates'] as $rate)
                    <tr>
                        <td>{{ $rate['description'] }}</td>
                        <td>{{ $rate['payee'] }}</td>
                        <td class="text-right">${{ number_format($rate['amount'], 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <!-- TOTAIS -->
        <div class="totals">
            <table>
                <tr class="subtotal-row">
                    <td><strong>Subtotal:</strong></td>
                    <td class="text-right">${{ number_format($invoice['subtotal'], 2) }}</td>
                </tr>
                <tr class="margin-row">
                    <td><strong>Margem de Lucro ({{ $invoice['margin_percent'] }}%):</strong></td>
                    <td class="text-right">+${{ number_format($invoice['margin_amount'], 2) }}</td>
                </tr>
                <tr class="total-row">
                    <td><strong>TOTAL:</strong></td>
                    <td class="text-right"><strong>${{ number_format($invoice['total_invoice'], 2) }}</strong></td>
                </tr>
            </table>
        </div>

        <!-- NOTAS -->
        @if(!empty($invoice['notes']))
            <div class="notes">
                <h3>📝 Observações</h3>
                <p>{{ $invoice['notes'] }}</p>
            </div>
        @endif

        <!-- FOOTER -->
        <div class="footer">
            <p>
                <strong>Obrigado pelo seu negócio!</strong><br>
                Esta é uma fatura gerada eletronicamente. Para questões ou esclarecimentos, contacte-nos através de {{ $company['email'] }}<br>
                <br>
                <em>{{ $company['name'] }} - Facilitando sua logística com excelência</em>
            </p>
        </div>
    </div>
</body>
</html>
