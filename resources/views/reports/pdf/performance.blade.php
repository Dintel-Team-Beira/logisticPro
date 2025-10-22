<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Desempenho</title>
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
            background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
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
        .highlight-card {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        .highlight-card .title {
            font-size: 12px;
            font-weight: bold;
            color: #92400e;
            margin-bottom: 5px;
        }
        .highlight-card .value {
            font-size: 20px;
            font-weight: bold;
            color: #b45309;
        }
        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #1f2937;
            margin: 20px 0 10px 0;
            padding-bottom: 5px;
            border-bottom: 2px solid #7c3aed;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        table thead tr {
            background: #7c3aed;
            color: white;
        }
        table th {
            padding: 8px;
            text-align: left;
            font-size: 9px;
            font-weight: bold;
            border: 1px solid #6d28d9;
        }
        table td {
            padding: 6px;
            border: 1px solid #e5e7eb;
            font-size: 9px;
        }
        table tbody tr:nth-child(even) {
            background: #f9fafb;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .progress-bar {
            width: 100%;
            height: 12px;
            background: #e5e7eb;
            border-radius: 6px;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #7c3aed 0%, #a78bfa 100%);
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
        <h1>📊 Relatório de Desempenho</h1>
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
    </div>

    <!-- Average Processing Time Highlight -->
    <div class="highlight-card">
        <div class="title">⏱️ Tempo Médio de Processamento</div>
        <div class="value">{{ $data['avg_processing_time'] }} dias</div>
    </div>

    <!-- Stage Completion Rates -->
    <div class="section-title">📈 Taxa de Conclusão por Etapa</div>
    <table>
        <thead>
            <tr>
                <th>Etapa</th>
                <th class="text-right">Total Processos</th>
                <th class="text-right">Concluídos</th>
                <th class="text-right">Pendentes</th>
                <th class="text-center">Taxa de Conclusão</th>
                <th>Progresso</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['stage_completion'] as $stage)
            <tr>
                <td><strong>{{ $stage['stage'] }}</strong></td>
                <td class="text-right">{{ $stage['total'] }}</td>
                <td class="text-right">{{ $stage['completed'] }}</td>
                <td class="text-right">{{ $stage['total'] - $stage['completed'] }}</td>
                <td class="text-center"><strong>{{ $stage['rate'] }}%</strong></td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: {{ $stage['rate'] }}%"></div>
                    </div>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Shipping Lines Performance -->
    <div class="page-break"></div>
    <div class="section-title">🚢 Desempenho por Linha de Navegação</div>
    <table>
        <thead>
            <tr>
                <th>Linha de Navegação</th>
                <th class="text-right">Total Processos</th>
                <th class="text-right">Concluídos</th>
                <th class="text-right">Em Andamento</th>
                <th class="text-right">Tempo Médio (dias)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['shipping_lines'] as $line)
            <tr>
                <td><strong>{{ $line['name'] }}</strong></td>
                <td class="text-right">{{ $line['total_shipments'] }}</td>
                <td class="text-right">{{ $line['completed'] }}</td>
                <td class="text-right">{{ $line['in_progress'] }}</td>
                <td class="text-right">{{ $line['avg_processing_time'] ?? 'N/A' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Documents Statistics -->
    @if(isset($data['documents_stats']))
    <div class="section-title">📄 Estatísticas de Documentos</div>
    <table>
        <thead>
            <tr>
                <th>Métrica</th>
                <th class="text-right">Valor</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Total de Documentos</td>
                <td class="text-right">{{ $data['documents_stats']['total'] }}</td>
            </tr>
            <tr>
                <td>Tamanho Total</td>
                <td class="text-right">{{ number_format($data['documents_stats']['total_size'] / 1024 / 1024, 2) }} MB</td>
            </tr>
        </tbody>
    </table>

    @if(count($data['documents_stats']['by_type']) > 0)
    <div class="section-title">📑 Documentos por Tipo</div>
    <table>
        <thead>
            <tr>
                <th>Tipo</th>
                <th class="text-right">Quantidade</th>
                <th class="text-right">Percentual</th>
            </tr>
        </thead>
        <tbody>
            @php
                $totalDocs = collect($data['documents_stats']['by_type'])->sum('count');
            @endphp
            @foreach($data['documents_stats']['by_type'] as $docType)
            <tr>
                <td>{{ strtoupper(str_replace('_', ' ', $docType->type)) }}</td>
                <td class="text-right">{{ $docType->count }}</td>
                <td class="text-right">{{ $totalDocs > 0 ? number_format(($docType->count / $totalDocs) * 100, 1) : 0 }}%</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif
    @endif

    <!-- Footer -->
    <div class="footer">
        <p>LogisticaPro © {{ date('Y') }} - Relatório gerado automaticamente</p>
        <p>Página <span class="pagenum"></span></p>
    </div>
</body>
</html>
