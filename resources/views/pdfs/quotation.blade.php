<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Cotação {{ $shipment->quotation_reference }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            color: #333;
            padding: 30px;
        }
        .header {
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 5px;
        }
        .document-title {
            font-size: 18px;
            color: #64748b;
            margin-top: 10px;
        }
        .reference {
            font-size: 14px;
            font-weight: bold;
            color: #2563eb;
            margin-top: 5px;
        }
        .info-section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #e2e8f0;
        }
        .info-grid {
            display: table;
            width: 100%;
            margin-bottom: 15px;
        }
        .info-row {
            display: table-row;
        }
        .info-label {
            display: table-cell;
            font-weight: bold;
            color: #64748b;
            padding: 5px 10px 5px 0;
            width: 30%;
        }
        .info-value {
            display: table-cell;
            padding: 5px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        th {
            background-color: #2563eb;
            color: white;
            padding: 10px;
            text-align: left;
            font-weight: bold;
        }
        td {
            padding: 10px;
            border-bottom: 1px solid #e2e8f0;
        }
        .text-right {
            text-align: right;
        }
        .totals-table {
            margin-top: 30px;
            width: 50%;
            float: right;
        }
        .totals-table td {
            padding: 8px 10px;
        }
        .subtotal-row td {
            font-weight: bold;
        }
        .tax-row td {
            color: #64748b;
        }
        .total-row {
            background-color: #2563eb;
            color: white;
            font-size: 16px;
            font-weight: bold;
        }
        .footer {
            clear: both;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 10px;
        }
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 15px;
            font-size: 11px;
            font-weight: bold;
        }
        .status-pending {
            background-color: #fef3c7;
            color: #92400e;
        }
        .status-approved {
            background-color: #d1fae5;
            color: #065f46;
        }
        .clearfix::after {
            content: "";
            display: table;
            clear: both;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <div class="company-name">ALEK LOGÍSTICA & TRADING LDA</div>
        <div style="color: #64748b; font-size: 11px;">
            Rua da Manga, Nr 517 - Beira, Moçambique<br>
            Tel: +258 84 123 4567 | Email: geral@alek.co.mz
        </div>
        <div class="document-title">COTAÇÃO DE SERVIÇOS</div>
        <div class="reference">{{ $shipment->quotation_reference }}</div>
        <div style="margin-top: 10px;">
            <span class="status-badge {{ $shipment->quotation_status === 'approved' ? 'status-approved' : 'status-pending' }}">
                {{ $shipment->quotation_status === 'approved' ? 'APROVADA' : 'PENDENTE' }}
            </span>
        </div>
    </div>

    <!-- Client Information -->
    <div class="info-section">
        <div class="section-title">DADOS DO CLIENTE</div>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Cliente:</div>
                <div class="info-value">{{ $shipment->client->name }}</div>
            </div>
            @if($shipment->client->company_name)
            <div class="info-row">
                <div class="info-label">Empresa:</div>
                <div class="info-value">{{ $shipment->client->company_name }}</div>
            </div>
            @endif
            @if($shipment->client->tax_id)
            <div class="info-row">
                <div class="info-label">NIF:</div>
                <div class="info-value">{{ $shipment->client->tax_id }}</div>
            </div>
            @endif
            <div class="info-row">
                <div class="info-label">Email:</div>
                <div class="info-value">{{ $shipment->client->email }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Telefone:</div>
                <div class="info-value">{{ $shipment->client->phone }}</div>
            </div>
        </div>
    </div>

    <!-- Shipment Information -->
    <div class="info-section">
        <div class="section-title">INFORMAÇÕES DO PROCESSO</div>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Referência:</div>
                <div class="info-value">{{ $shipment->reference_number }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Tipo:</div>
                <div class="info-value">{{ strtoupper($shipment->type) }}</div>
            </div>
            @if($shipment->container_type)
            <div class="info-row">
                <div class="info-label">Container:</div>
                <div class="info-value">{{ $shipment->container_type }}</div>
            </div>
            @endif
            @if($shipment->regime)
            <div class="info-row">
                <div class="info-label">Regime:</div>
                <div class="info-value">{{ ucfirst($shipment->regime) }}</div>
            </div>
            @endif
            @if($shipment->final_destination)
            <div class="info-row">
                <div class="info-label">Destino:</div>
                <div class="info-value">{{ $shipment->final_destination }}</div>
            </div>
            @endif
            <div class="info-row">
                <div class="info-label">Data:</div>
                <div class="info-value">{{ $shipment->created_at->format('d/m/Y H:i') }}</div>
            </div>
        </div>
    </div>

    <!-- Breakdown Table -->
    <div class="info-section">
        <div class="section-title">DETALHAMENTO DOS CUSTOS</div>
        <table>
            <thead>
                <tr>
                    <th>Categoria</th>
                    <th>Descrição</th>
                    <th class="text-right">Valor (MZN)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($shipment->quotation_breakdown as $item)
                <tr>
                    <td>{{ $item['category'] }}</td>
                    <td>{{ $item['name'] }}</td>
                    <td class="text-right">{{ number_format($item['price'], 2, ',', '.') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <!-- Totals -->
    <div class="clearfix">
        <table class="totals-table">
            <tr class="subtotal-row">
                <td>Subtotal:</td>
                <td class="text-right">{{ number_format($shipment->quotation_subtotal, 2, ',', '.') }} MZN</td>
            </tr>
            <tr class="tax-row">
                <td>IVA (16%):</td>
                <td class="text-right">{{ number_format($shipment->quotation_tax, 2, ',', '.') }} MZN</td>
            </tr>
            <tr class="total-row">
                <td>TOTAL:</td>
                <td class="text-right">{{ number_format($shipment->quotation_total, 2, ',', '.') }} MZN</td>
            </tr>
        </table>
    </div>

    <!-- Footer -->
    <div class="footer">
        <p><strong>Validade:</strong> 15 dias a partir da data de emissão</p>
        <p style="margin-top: 10px;">
            Este documento é uma cotação e não constitui fatura. Os valores apresentados são estimativas<br>
            e podem sofrer alterações conforme especificações finais do serviço.
        </p>
        <p style="margin-top: 15px;">
            Documento gerado automaticamente em {{ now()->format('d/m/Y às H:i') }}
        </p>
    </div>
</body>
</html>
