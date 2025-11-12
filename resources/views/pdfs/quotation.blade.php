<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Proforma Invoice {{ $shipment->reference_number }}</title>
    <style>
        /* Reset e Configuração Base */
        body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            color: #000;
            margin: 20px;
        }
        /* Para limpar floats */
        .clearfix::after {
            content: "";
            clear: both;
            display: table;
        }

        /* 1. CABEÇALHO (Corrigido) */
        .header {
            width: 100%;
            text-align: center; /* Centralizado como na imagem */
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        .header .logo-img {
            max-width: 250px;
        }
        .header .company-name {
            font-size: 16px;
            font-weight: bold;
        }
        .header .company-info {
            font-size: 11px;
        }

        /* 2. SECÇÃO TOPO (Cliente e Detalhes) */
        .section-top {
            width: 100%;
            margin-top: 15px;
        }
        .top-left-col {
            width: 48%;
            float: left;
        }
        .top-right-col {
            width: 48%;
            float: right;
        }
        .proforma-title {
            font-size: 16px;
            font-weight: bold;
            margin-top: 15px;
        }
        .shipment-details {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;
        }
        .shipment-details td {
            border: 1px solid #000;
            padding: 3px 5px;
            font-size: 9px;
        }
        .shipment-details .label {
            font-weight: bold;
            width: 40%;
            background-color: #f0f0f0;
        }

        /* 3. TABELA DE ITENS */
        .items-section {
            width: 100%;
            margin-top: 15px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9px;
        }
        .items-table th, .items-table td {
            border: 1px solid #000;
            padding: 4px 5px;
            text-align: left;
        }
        .items-table th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        .items-table .col-qty, .items-table .col-price {
            text-align: right;
            width: 100px;
        }
        .items-table .col-desc {
            width: 45%;
        }

        /* 4. TOTAIS */
        .totals-section {
            width: 40%;
            float: right;
            margin-top: 10px;
            font-size: 10px;
        }
        .totals-table {
            width: 100%;
            border-collapse: collapse;
        }
        .totals-table td {
            padding: 4px 5px;
            border: 1px solid #000;
        }
        .totals-table .label {
            font-weight: bold;
            background-color: #f0f0f0;
        }
        .totals-table .value {
            text-align: right;
        }

        /* 5. SECÇÃO INFERIOR (Notas e Banco) (Corrigido) */
        .footer-section {
            width: 50%; /* Ocupa a metade esquerda */
            float: left;
            margin-top: 10px;
            font-size: 9px;
            line-height: 1.4;
        }
        .footer-section h3 {
            font-size: 10px;
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 5px;
        }
        .footer-section ul {
            margin-left: 15px;
            padding-left: 5px;
        }
        .bank-details {
            margin-top: 15px; /* Adiciona espaço entre Notes e Bank */
        }

        /* 6. RODAPÉ FINAL */
        .footer {
            width: 100%;
            text-align: center;
            font-style: italic;
            font-size: 10px;
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #000;
            clear: both; /* Limpa os floats anteriores */
        }
    </style>
</head>
<body>

    <div class="header">
        <div style="font-size: 24px; font-weight: bold;">
            <img src="{{ public_path('ft_logo.png') }}" alt="Company Logo" class="logo-img">
        </div>

        <div class="company-name">ALEK LOGISTIC & TRANSPORT, LDA</div>
        <div class="company-info">
            Endereço: Rua António Enes, Q.09, B.Ponta-Gêa, Beira
            <br>
            Email: info@alek-lda.com
        </div>
    </div>

    <div class="content">

        <div class="clearfix section-top">

            <div class="top-left-col">
                <strong>To: {{ $shipment->client->name }}</strong>
                <div class="proforma-title">
                    Proforma Invoice #{{ $shipment->reference_number }}
                </div>
            </div>

            <div class="top-right-col">
                <table class="shipment-details">
                    <tr><td class="label">POL:</td><td>{{ $shipment->pol ?? 'QINGDAO' }}</td></tr>
                    <tr><td class="label">POD:</td><td>{{ $shipment->pod ?? 'BEIRA' }}</td></tr>
                    <tr><td class="label">FINAL DESTINATION:</td><td>{{ $shipment->final_destination }}</td></tr>
                    <tr><td class="label">CNEE:</td><td>{{ $shipment->client->name }}</td></tr>
                    <tr><td class="label">VESSEL NAME:</td><td>{{ $shipment->vessel_name ?? 'SAN FRANCISCO BRIDGE' }}</td></tr>
                    <tr><td class="label">VOYAGE Nº:</td><td>{{ $shipment->voyage_no ?? '012E' }}</td></tr>
                    <tr><td class="label">BL Nº:</td><td>{{ $shipment->bl_no ?? 'COSU6180794100' }}</td></tr>
                    <tr><td class="label">CNT:</td><td>{{ $shipment->container_type }} ({{ $shipment->container_no ?? 'TRHU4073724' }})</td></tr>
                    <tr><td class="label">EMPTY OFF-LOADING:</td><td>{{ $shipment->empty_offloading ?? 'CORRIDOR' }}</td></tr>
                </table>
            </div>
        </div>

        <div class="items-section">
            <table class="items-table">
                <thead>
                    <tr>
                        <th class="col-desc">CARGO HANDLING</th>
                        <th class="col-qty">Quantity</th>
                        <th class="col-price">Price (USD)</th>
                        <th class="col-price">Price (USD)</th>
                    </tr>
                </thead>
                <tbody>

                    @php
                $map = [
                    'Tipo de Container' => 'Shipping Line Charges',
                    'Tipo de Mercadoria' => 'Port Charges',
                    'Regime' => 'Customs Charges',
                    'Destino' => 'Transport',
                    'Serviço Adicional' => 'Agency Services and Extra Charges'
                ];
            @endphp
            @foreach($shipment->quotation_breakdown as $item)
            <tr>
                <td>{{ $map[$item['category']] ?? $item['category'] }}</td>
                       <td class="col-qty">{{ number_format($item['quantity'] ?? 1, 2) }}</td>
                        <td class="col-price">{{ number_format($item['unit_price'] ?? $item['price'], 2) }}</td>
                        <td class="col-price">{{ number_format(($item['quantity'] ?? 1) * ($item['unit_price'] ?? $item['price']), 2) }}</td>
            </tr>

                    @endforeach

                </tbody>
            </table>
        </div>

        <div class="totals-section">
            <table class="totals-table">
                <tr>
                    <td class="label">Sub Total (L/C, Port & Clearance Charges)</td>
                    <td class="value">{{ number_format($shipment->quotation_subtotal, 2) }}</td>
                </tr>
                <tr>
                    <td class="label">TOTAL (USD)</td>
                    <td class="value">{{ number_format($shipment->quotation_subtotal, 2) }}</td>
                </tr>
                <tr>
                    <td class="label">TOTAL (MZN)</td>
                    <td class="value">{{ number_format($shipment->quotation_total, 2) }}</td>
                </tr>
            </table>
        </div>

        <div class="footer-section">
            <div class="notes">
                <h3>NOTES:</h3>
                <ul>
                    <li>All costs must provider Export Commercial Invoice, Bank Details for T&C, Valid Company Documents.</li>
                    <li>This is not a Tax Invoice, this is a Proforma for Shipping Line.</li>
                    <li>Validity of Quotation - 30 days from this date.</li>
                    <li>All charges are subject to statutory and 3rd party rate increases, without prior notice.</li>
                </ul>
                <br>
                <h3>Standard Free Time:</h3>
                <ul>
                    <li>12 - Free Period Storage grant by port.</li>
                    <li>14 - Free Days as per Shipping Line ZIM - 18 Days</li>
                </ul>
            </div>

            <div class="bank-details">
                <h3>BANK DETAILS:</h3>
                <strong>Bank:</strong> Millennium
                <br>
                <strong>Acc Number:</strong> 37348558410001
                <br>
                <strong>NIB:</strong> 000100000037348558415
                <br>
                <strong>Account Name:</strong> ALEK LOGISTIC & TRANSPORT, LDA
            </div>
        </div>

        <div class="footer">
            Handling and Transporting your cargo efficiently and safely.
        </div>

    </div> </body>
</html>
