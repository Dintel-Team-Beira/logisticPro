<!DOCTYPE html>

<html>

<head>

    <meta charset="utf-8">

    <title>Fatura {{ $invoice->invoice_number }}</title>

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



        /* 1. CABEÇALHO */

        .header {

            width: 100%;

            text-align: center;

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



        /* 2. SECÇÃO TOPO */

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

        .invoice-title {

            font-size: 16px;

            font-weight: bold;

            margin-top: 15px;

        }

        .status-badge {

            display: inline-block;

            padding: 3px 10px;

            border: 1px solid #000;

            margin-top: 5px;

            font-size: 9px;

            font-weight: bold;

        }

        .invoice-details {

            width: 100%;

            border-collapse: collapse;

            border: 1px solid #000;

        }

        .invoice-details td {

            border: 1px solid #000;

            padding: 3px 5px;

            font-size: 9px;

        }

        .invoice-details .label {

            font-weight: bold;

            width: 50%;

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

        .items-table .col-category {

            width: 200px;

        }

        .items-table .col-desc {

            width: 35%;

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



        /* 5. SECÇÃO INFERIOR */

        .footer-section {

            width: 50%;

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

            margin-top: 15px;

        }

        .payment-info {

            margin-top: 15px;

            padding: 10px;

            border: 2px solid #000;

            background-color: #e8f5e9;

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

            clear: both;

        }

    </style>

</head>

<body>



    <div class="header">

        <div style="font-size: 24px; font-weight: bold;">

            @if(file_exists(public_path('ft_logo.png')))

                <img src="{{ public_path('ft_logo.png') }}" alt="Company Logo" class="logo-img">

            @endif

        </div>



        <div class="company-name">{{ strtoupper($company['name']) }}</div>

        <div class="company-info">

            Endereço: {{ $company['address'] }}

            <br>

            Email: {{ $company['email'] }} | Tel: {{ $company['phone'] }}

            @if(isset($company['nuit']))

            <br>

            NUIT: {{ $company['nuit'] }}

            @endif

        </div>

    </div>



    <div class="content">



        <div class="clearfix section-top">



            <div class="top-left-col">

                <strong>Para: {{ $invoice->shipment->client->company_name ?? $invoice->shipment->client->name }}</strong>

                <div class="invoice-title">

                    Fatura #{{ $invoice->invoice_number }}

                </div>

                <div class="status-badge">

                    @if($invoice->status === 'paid')

                        ✓ PAGA

                    @elseif($invoice->status === 'pending' && $invoice->due_date < now())

                        ⚠ VENCIDA

                    @else

                        ⏳ PENDENTE

                    @endif

                </div>

            </div>



            <div class="top-right-col">

                <table class="invoice-details">

                    <tr>

                        <td class="label">Data de Emissão:</td>

                        <td>{{ $invoice->issue_date->format('d/m/Y') }}</td>

                    </tr>

                    <tr>

                        <td class="label">Data de Vencimento:</td>

                        <td>{{ $invoice->due_date->format('d/m/Y') }}</td>

                    </tr>

                    @if($invoice->payment_date)

                    <tr>

                        <td class="label">Data de Pagamento:</td>

                        <td>{{ $invoice->payment_date->format('d/m/Y') }}</td>

                    </tr>

                    @endif

                    <tr>

                        <td class="label">Processo:</td>

                        <td>{{ $invoice->shipment->reference_number }}</td>

                    </tr>

                    <tr>

                        <td class="label">Cotação:</td>

                        <td>{{ $invoice->metadata['quotation_reference'] ?? 'N/A' }}</td>

                    </tr>

                    <tr>

                        <td class="label">Cliente:</td>

                        <td>{{ $invoice->shipment->client->name }}</td>

                    </tr>

                    @if($invoice->shipment->client->tax_id)

                    <tr>

                        <td class="label">NUIT Cliente:</td>

                        <td>{{ $invoice->shipment->client->tax_id }}</td>

                    </tr>

                    @endif

                    @if($invoice->shipment->container_number)

                    <tr>

                        <td class="label">Container:</td>

                        <td>{{ $invoice->shipment->container_number }}</td>

                    </tr>

                    @endif

                    @if($invoice->shipment->bl_number)

                    <tr>

                        <td class="label">BL Nº:</td>

                        <td>{{ $invoice->shipment->bl_number }}</td>

                    </tr>

                    @endif

                </table>

            </div>

        </div>



        <div class="items-section">

            <table class="items-table">

                <thead>

                    <tr>

                        <th class="col-desc">CARGO HANDLING</th>

                        <th class="col-qty">Quantity</th>

                        <th class="col-price">Price ({{ $invoice->currency }})</th>

                        <th class="col-price">Total ({{ $invoice->currency }})</th>

                    </tr>

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

                 @foreach($invoice->shipment->quotation_breakdown as $item)
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

                    <td class="label">Subtotal</td>

                    <td class="value">{{ number_format($invoice->subtotal, 2, ',', '.') }} {{ $invoice->currency }}</td>

                </tr>

                <tr>

                    <td class="label">IVA (16%)</td>

                    <td class="value">{{ number_format($invoice->tax_amount, 2, ',', '.') }} {{ $invoice->currency }}</td>

                </tr>

                <tr style="background-color: #f0f0f0;">

                    <td class="label" style="font-size: 11px;">TOTAL</td>

                    <td class="value" style="font-size: 11px; font-weight: bold;">{{ number_format($invoice->amount, 2, ',', '.') }} {{ $invoice->currency }}</td>

                </tr>

            </table>

        </div>



        <div class="footer-section">

            @if($invoice->terms)

            <div class="notes">

                <h3>TERMOS DE PAGAMENTO:</h3>

                <p>{{ $invoice->terms }}</p>

            </div>

            @endif



            @if($invoice->notes)

            <div style="margin-top: 10px;">

                <h3>OBSERVAÇÕES:</h3>

                <p>{{ $invoice->notes }}</p>

            </div>

            @endif



            <div class="bank-details">

                <h3>DADOS BANCÁRIOS:</h3>

                <strong>Banco:</strong> Millennium

                <br>

                <strong>Nº Conta:</strong> 37348558410001

                <br>

                <strong>NIB:</strong> 000100000037348558415

                <br>

                <strong>Nome da Conta:</strong> {{ strtoupper($company['name']) }}

            </div>



            @if($invoice->payment_date && $invoice->payment_reference)

            <div class="payment-info">

                <strong>✓ PAGAMENTO CONFIRMADO</strong>

                <br>

                <strong>Referência:</strong> {{ $invoice->payment_reference }}

                <br>

                <strong>Data:</strong> {{ $invoice->payment_date->format('d/m/Y') }}

            </div>

            @endif

        </div>



        <div class="footer">

            Esta é uma fatura gerada automaticamente do sistema LogisticaPro.

            <br>

            Em caso de dúvidas, contacte-nos através de {{ $company['email'] }} ou {{ $company['phone'] }}.

        </div>



    </div>



</body>

</html>
