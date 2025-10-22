<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Processos</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 10px;
            color: #333;
            line-height: 1.4;
        }
        .header {
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            color: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        .header h1 {
            font-size: 24px;
            margin-bottom: 5px;
        }
        .header p {
            font-size: 11px;
            opacity: 0.9;
        }
        .meta-info {
            display: table;
            width: 100%;
            margin-bottom: 20px;
            background: #f3f4f6;
            padding: 10px;
            border-radius: 5px;
        }
        .meta-info .row {
            display: table-row;
        }
        .meta-info .label {
            display: table-cell;
            font-weight: bold;
            padding: 5px;
            width: 30%;
        }
        .meta-info .value {
            display: table-cell;
            padding: 5px;
        }
        .summary-cards {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }
        .summary-card {
            display: table-cell;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 5px;
            padding: 10px;
            margin-right: 10px;
            text-align: center;
        }
        .summary-card .value {
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 5px;
        }
        .summary-card .label {
            font-size: 9px;
            color: #6b7280;
            text-transform: uppercase;
        }
        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #1f2937;
            margin: 20px 0 10px 0;
            padding-bottom: 5px;
            border-bottom: 2px solid #2563eb;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        table thead tr {
            background: #2563eb;
            color: white;
        }
        table th {
            padding: 8px;
            text-align: left;
            font-size: 9px;
            font-weight: bold;
            border: 1px solid #1e40af;
        }
        table td {
            padding: 6px;
            border: 1px solid #e5e7eb;
            font-size: 9px;
        }
        table tbody tr:nth-child(even) {
            background: #f9fafb;
        }
        table tbody tr:hover {
            background: #f3f4f6;
        }
        .status-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: bold;
        }
        .status-completed {
            background: #dcfce7;
            color: #166534;
        }
        .status-pending {
            background: #fef3c7;
            color: #92400e;
        }
        .footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            text-align: center;
            font-size: 8px;
            color: #6b7280;
            padding: 10px 0;
            border-top: 1px solid #e5e7eb;
        }
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <h1>📦 Relatório de Processos</h1>
        <p>LogisticaPro - Gestão de Importação e Exportação</p>
    </div>

    <!-- Meta Information -->
    <div class="meta-info">
        <div class="row">
            <div class="label">Período:</div>
            <div class="value">{{ $startDate->format('d/m/Y') }} até {{ $endDate->format('d/m/Y') }}</div>
        </div>
        <div class="row">
            <div class="label">Gerado em:</div>
            <div class="value">{{ $generatedAt->format('d/m/Y H:i:s') }}</div>
        </div>
        <div class="row">
            <div class="label">Total de Processos:</div>
            <div class="value">{{ count($data['shipments']) }}</div>
        </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards">
        <div class="summary-card">
            <div class="value">{{ $data['summary']['total_shipments'] }}</div>
            <div class="label">Total Processos</div>
        </div>
        <div class="summary-card">
            <div class="value">{{ $data['summary']['active_shipments'] }}</div>
            <div class="label">Em Andamento</div>
        </div>
        <div class="summary-card">
            <div class="value">{{ $data['summary']['completed_shipments'] }}</div>
            <div class="label">Concluídos</div>
        </div>
        <div class="summary-card">
            <div class="value">{{ number_format($data['summary']['total_revenue'], 2, ',', '.') }}</div>
            <div class="label">Receita Total</div>
        </div>
    </div>

    <!-- Processes by Status -->
    @if(count($data['by_status']) > 0)
    <div class="section-title">📊 Processos por Status</div>
    <table>
        <thead>
            <tr>
                <th>Status</th>
                <th style="text-align: right;">Quantidade</th>
                <th style="text-align: right;">Percentual</th>
            </tr>
        </thead>
        <tbody>
            @php
                $total = collect($data['by_status'])->sum('total');
            @endphp
            @foreach($data['by_status'] as $status)
            <tr>
                <td>{{ $status['label'] }}</td>
                <td style="text-align: right;">{{ $status['total'] }}</td>
                <td style="text-align: right;">{{ $total > 0 ? number_format(($status['total'] / $total) * 100, 1) : 0 }}%</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    <!-- Detailed Shipments List -->
    <div class="page-break"></div>
    <div class="section-title">📋 Lista Detalhada de Processos</div>
    <table>
        <thead>
            <tr>
                <th>Referência</th>
                <th>Cliente</th>
                <th>BL Number</th>
                <th>Container</th>
                <th>Navio</th>
                <th>Status</th>
                <th>Data Criação</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['shipments'] as $shipment)
            <tr>
                <td><strong>{{ $shipment->reference_number }}</strong></td>
                <td>{{ $shipment->client->name ?? 'N/A' }}</td>
                <td>{{ $shipment->bl_number ?? 'N/A' }}</td>
                <td>{{ $shipment->container_number ?? 'N/A' }}</td>
                <td>{{ $shipment->vessel_name ?? 'N/A' }}</td>
                <td>
                    <span class="status-badge {{ $shipment->status === 'completed' ? 'status-completed' : 'status-pending' }}">
                        {{ ucfirst($shipment->status) }}
                    </span>
                </td>
                <td>{{ $shipment->created_at->format('d/m/Y') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Footer -->
    <div class="footer">
        <p>LogisticaPro © {{ date('Y') }} - Relatório gerado automaticamente</p>
        <p>Página <span class="pagenum"></span></p>
    </div>
</body>
</html>
