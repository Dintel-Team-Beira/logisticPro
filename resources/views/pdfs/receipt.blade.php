<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>Recibo {{ $receipt->receipt_number }}</title>
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
            border-bottom: 3px solid #10b981;
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
            color: #10b981;
            margin-bottom: 5px;
        }

        .company-details {
            font-size: 10px;
            color: #666;
            line-height: 1.4;
        }

        .receipt-title {
            font-size: 32px;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 10px;
        }

        .receipt-number {
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
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 15px;
        }

        .info-title {
            font-size: 11px;
            font-weight: bold;
            color: #16a34a;
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

        /* Payment Details */
        .payment-box {
            background: #ecfdf5;
            border: 2px solid #10b981;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
            text-align: center;
        }

        .payment-label {
            font-size: 12px;
            color: #047857;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .payment-amount {
            font-size: 36px;
            font-weight: bold;
            color: #047857;
            margin-bottom: 10px;
        }

        .payment-method {
            font-size: 14px;
            color: #059669;
            background: #d1fae5;
            padding: 5px 15px;
            border-radius: 20px;
            display: inline-block;
        }

        /* Invoice Reference */
        .invoice-ref {
            background: #f1f5f9;
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

        /* Notes */
        .notes-section {
            background: #fef3c7;
            border: 1px solid #fde68a;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 30px;
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

        .signature-section {
            margin-top: 50px;
            text-align: center;
        }

        .signature-line {
            width: 300px;
            border-top: 1px solid #333;
            margin: 0 auto 5px;
        }

        .signature-label {
            font-size: 10px;
            color: #666;
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
                <div class="receipt-title">RECIBO</div>
                <div class="receipt-number">{{ $receipt->receipt_number }}</div>
            </div>
        </div>

        <!-- Client & Payment Date Info -->
        <div class="info-section">
            <div class="info-left">
                <div class="info-box">
                    <div class="info-title">Cliente</div>
                    <div class="info-row">
                        <span class="info-label">Nome:</span>
                        <span class="info-value">{{ $receipt->client->name }}</span>
                    </div>
                    @if($receipt->client->email)
                    <div class="info-row">
                        <span class="info-label">Email:</span>
                        <span class="info-value">{{ $receipt->client->email }}</span>
                    </div>
                    @endif
                    @if($receipt->client->phone)
                    <div class="info-row">
                        <span class="info-label">Telefone:</span>
                        <span class="info-value">{{ $receipt->client->phone }}</span>
                    </div>
                    @endif
                </div>
            </div>
            <div class="info-right">
                <div class="info-box">
                    <div class="info-title">Informações do Pagamento</div>
                    <div class="info-row">
                        <span class="info-label">Data:</span>
                        <span class="info-value">{{ \Carbon\Carbon::parse($receipt->payment_date)->format('d/m/Y') }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Emitido em:</span>
                        <span class="info-value">{{ \Carbon\Carbon::parse($receipt->created_at)->format('d/m/Y H:i') }}</span>
                    </div>
                    @if($receipt->payment_reference)
                    <div class="info-row">
                        <span class="info-label">Referência:</span>
                        <span class="info-value">{{ $receipt->payment_reference }}</span>
                    </div>
                    @endif
                </div>
            </div>
        </div>

        <!-- Payment Amount -->
        <div class="payment-box">
            <div class="payment-label">VALOR RECEBIDO</div>
            <div class="payment-amount">{{ number_format($receipt->amount, 2, ',', '.') }} {{ $receipt->currency }}</div>
            <div class="payment-method">{{ $receipt->payment_method_label }}</div>
        </div>

        <!-- Invoice Reference -->
        <div class="invoice-ref">
            <div class="invoice-ref-title">Referente à Fatura:</div>
            <div class="invoice-ref-value">{{ $receipt->invoice->invoice_number }}</div>
        </div>

        <!-- Notes -->
        @if($receipt->notes)
        <div class="notes-section">
            <div class="notes-title">Observações:</div>
            <div class="notes-text">{{ $receipt->notes }}</div>
        </div>
        @endif

        <!-- Signature -->
        <div class="signature-section">
            <div class="signature-line"></div>
            <div class="signature-label">Assinatura e Carimbo</div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-text">
                Este documento é um comprovante de pagamento.<br>
                Emitido eletronicamente por LogisticaPro - Sistema de Gestão Logística<br>
                Data de emissão: {{ \Carbon\Carbon::now()->format('d/m/Y H:i:s') }}
            </div>
        </div>
    </div>
</body>
</html>
