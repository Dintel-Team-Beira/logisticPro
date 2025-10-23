<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $quote->quote_number }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: #1e293b;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background: #f8fafc;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }
        .quote-info {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }
        th {
            background: #f1f5f9;
            font-weight: 600;
        }
        .total-row {
            font-weight: bold;
            font-size: 1.2em;
            background: #f8fafc;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 14px;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: #0ea5e9;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $quote->quote_number }}</h1>
        <p>{{ $quote->title }}</p>
    </div>

    <div class="content">
        <p>Prezado(a) <strong>{{ $quote->client->name }}</strong>,</p>

        <p>Segue em anexo nossa cotação para os serviços solicitados.</p>

        <div class="quote-info">
            <h3 style="margin-top: 0;">Informações da Cotação</h3>
            <p><strong>Número:</strong> {{ $quote->quote_number }}</p>
            <p><strong>Data:</strong> {{ \Carbon\Carbon::parse($quote->quote_date)->format('d/m/Y') }}</p>
            <p><strong>Válido Até:</strong> {{ \Carbon\Carbon::parse($quote->valid_until)->format('d/m/Y') }}</p>
            @if($quote->payment_terms)
                <p><strong>Condições de Pagamento:</strong> {{ $quote->payment_terms }}</p>
            @endif
        </div>

        @if($quote->description)
            <div class="quote-info">
                <h3 style="margin-top: 0;">Descrição</h3>
                <p>{{ $quote->description }}</p>
            </div>
        @endif

        <h3>Itens da Cotação</h3>
        <table>
            <thead>
                <tr>
                    <th>Serviço</th>
                    <th style="text-align: center;">Qtd</th>
                    <th style="text-align: right;">Preço Unit.</th>
                    <th style="text-align: right;">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($quote->items as $item)
                <tr>
                    <td>{{ $item->service_name }}</td>
                    <td style="text-align: center;">{{ number_format($item->quantity, 2) }} {{ $item->unit }}</td>
                    <td style="text-align: right;">{{ number_format($item->unit_price, 2) }} {{ $quote->currency }}</td>
                    <td style="text-align: right;">{{ number_format($item->total, 2) }} {{ $quote->currency }}</td>
                </tr>
                @endforeach
                <tr class="total-row">
                    <td colspan="3" style="text-align: right;">Total:</td>
                    <td style="text-align: right;">{{ number_format($quote->total, 2) }} {{ $quote->currency }}</td>
                </tr>
            </tbody>
        </table>

        @if($quote->terms || $quote->customer_notes)
            <div class="quote-info">
                @if($quote->terms)
                    <h4>Termos e Condições</h4>
                    <p style="white-space: pre-wrap;">{{ $quote->terms }}</p>
                @endif

                @if($quote->customer_notes)
                    <h4>Observações</h4>
                    <p style="white-space: pre-wrap;">{{ $quote->customer_notes }}</p>
                @endif
            </div>
        @endif

        <p style="margin-top: 30px;">Para qualquer dúvida ou esclarecimento, estamos à disposição.</p>

        <p>Atenciosamente,<br>
        <strong>Equipe LogisticaPro</strong></p>
    </div>

    <div class="footer">
        <p>Este email foi gerado automaticamente. Por favor, não responda.</p>
        <p>&copy; {{ date('Y') }} LogisticaPro - Todos os direitos reservados</p>
    </div>
</body>
</html>
