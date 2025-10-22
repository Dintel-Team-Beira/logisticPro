import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    Download,
    Calendar,
    TrendingUp,
    Package,
    DollarSign,
    Clock,
    BarChart3,
    PieChart,
    FileText,
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart as RechartsPie,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

export default function Index({ data, period, startDate, endDate }) {
    const [selectedPeriod, setSelectedPeriod] = useState(period || 'month');
    const [exportFormat, setExportFormat] = useState('pdf');
    const [exportType, setExportType] = useState('processes');

    const handlePeriodChange = (newPeriod) => {
        setSelectedPeriod(newPeriod);
        router.get('/reports', { period: newPeriod }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleExport = (format = 'pdf', type = 'processes') => {
        window.open(`/reports/export?period=${selectedPeriod}&format=${format}&type=${type}`, '_blank');
    };

    // Transform revenue by month data for chart
    const revenueData = data.revenue_by_month?.map(item => ({
        name: item.month,
        receita: parseFloat(item.total),
        count: item.count,
    })) || [];

    // Transform shipments by status for pie chart
    const statusData = data.shipments_by_status?.map((item, index) => ({
        name: item.label,
        value: item.total,
        color: ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444'][index % 5],
    })) || [];

    // Transform shipping lines data for bar chart
    const shippingLinesData = data.top_shipping_lines?.slice(0, 4).map(line => ({
        name: line.name,
        shipments: line.shipments_count,
    })) || [];

    return (
        <DashboardLayout>
            <Head title="Relatórios" />

                     <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Relatórios e Analytics
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Análise detalhada das operações
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={selectedPeriod}
                            onChange={(e) => handlePeriodChange(e.target.value)}
                            className="px-4 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                        >
                            <option value="today">Hoje</option>
                            <option value="week">Esta Semana</option>
                            <option value="month">Este Mês</option>
                            <option value="quarter">Este Trimestre</option>
                            <option value="year">Este Ano</option>
                            <option value="all">Todos</option>
                        </select>

                        {/* Export Dropdown */}
                        <div className="relative group">
                            <button
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-slate-900 hover:bg-slate-800"
                            >
                                <Download className="w-4 h-4" />
                                Exportar
                            </button>
                            <div className="absolute right-0 z-10 hidden mt-2 overflow-hidden bg-white border rounded-lg shadow-lg w-52 border-slate-200 group-hover:block">
                                <div className="px-3 py-2 text-xs font-semibold text-slate-500 bg-slate-50">
                                    PROCESSOS
                                </div>
                                <button
                                    onClick={() => handleExport('pdf', 'processes')}
                                    className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left transition-colors hover:bg-slate-50"
                                >
                                    <FileText className="w-4 h-4 text-red-500" />
                                    <span>Processos (PDF)</span>
                                </button>
                                <button
                                    onClick={() => handleExport('excel', 'processes')}
                                    className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left transition-colors hover:bg-slate-50"
                                >
                                    <FileText className="w-4 h-4 text-green-500" />
                                    <span>Processos (Excel)</span>
                                </button>

                                <div className="px-3 py-2 text-xs font-semibold text-slate-500 bg-slate-50">
                                    FINANCEIRO
                                </div>
                                <button
                                    onClick={() => handleExport('pdf', 'financial')}
                                    className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left transition-colors hover:bg-slate-50"
                                >
                                    <DollarSign className="w-4 h-4 text-red-500" />
                                    <span>Financeiro (PDF)</span>
                                </button>
                                <button
                                    onClick={() => handleExport('excel', 'financial')}
                                    className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left transition-colors hover:bg-slate-50"
                                >
                                    <DollarSign className="w-4 h-4 text-green-500" />
                                    <span>Financeiro (Excel)</span>
                                </button>

                                <div className="px-3 py-2 text-xs font-semibold text-slate-500 bg-slate-50">
                                    DESEMPENHO
                                </div>
                                <button
                                    onClick={() => handleExport('pdf', 'performance')}
                                    className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left transition-colors hover:bg-slate-50"
                                >
                                    <BarChart3 className="w-4 h-4 text-red-500" />
                                    <span>Desempenho (PDF)</span>
                                </button>
                                <button
                                    onClick={() => handleExport('excel', 'performance')}
                                    className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left transition-colors hover:bg-slate-50"
                                >
                                    <BarChart3 className="w-4 h-4 text-green-500" />
                                    <span>Desempenho (Excel)</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="p-4 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-slate-600">Receita Total</p>
                            <DollarSign className="w-5 h-5 text-emerald-500" />
                        </div>
                        <p className="text-2xl font-semibold text-slate-900">
                            {new Intl.NumberFormat('pt-MZ', {
                                style: 'currency',
                                currency: 'MZN',
                                minimumFractionDigits: 0,
                            }).format(data.summary?.total_revenue || 0)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            {data.summary?.pending_invoices || 0} faturas pendentes
                        </p>
                    </div>

                    <div className="p-4 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-slate-600">Total Processos</p>
                            <Package className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-2xl font-semibold text-slate-900">
                            {data.summary?.total_shipments || 0}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            {data.summary?.active_shipments || 0} em andamento
                        </p>
                    </div>

                    <div className="p-4 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-slate-600">Tempo Médio</p>
                            <Clock className="w-5 h-5 text-amber-500" />
                        </div>
                        <p className="text-2xl font-semibold text-slate-900">
                            {data.average_processing_time || 0} dias
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            Processos concluídos
                        </p>
                    </div>

                    <div className="p-4 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-slate-600">Taxa de Conclusão</p>
                            <BarChart3 className="w-5 h-5 text-purple-500" />
                        </div>
                        <p className="text-2xl font-semibold text-slate-900">
                            {data.summary?.total_shipments > 0
                                ? ((data.summary.completed_shipments / data.summary.total_shipments) * 100).toFixed(1)
                                : 0}%
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            {data.summary?.completed_shipments || 0} concluídos
                        </p>
                    </div>
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Revenue Chart */}
                    <div className="p-6 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">
                                    Receitas vs Despesas
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Últimos 6 meses
                                </p>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="name"
                                    stroke="#94A3B8"
                                    style={{ fontSize: '12px' }}
                                />
                                <YAxis
                                    stroke="#94A3B8"
                                    style={{ fontSize: '12px' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="receita"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    name="Receita"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="despesas"
                                    stroke="#EF4444"
                                    strokeWidth={2}
                                    name="Despesas"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Status Distribution */}
                    <div className="p-6 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">
                                    Distribuição por Status
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Status atual dos shipments
                                </p>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsPie>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </RechartsPie>
                        </ResponsiveContainer>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            {statusData.map((status) => (
                                <div key={status.name} className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: status.color }}
                                    />
                                    <div>
                                        <p className="text-xs text-slate-600">{status.name}</p>
                                        <p className="text-sm font-semibold text-slate-900">{status.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Shipping Lines Performance */}
                    <div className="p-6 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">
                                    Performance por Linha
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Top 4 linhas de navegação
                                </p>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={shippingLinesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="name"
                                    stroke="#94A3B8"
                                    style={{ fontSize: '12px' }}
                                />
                                <YAxis
                                    stroke="#94A3B8"
                                    style={{ fontSize: '12px' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                />
                                <Bar dataKey="shipments" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Financial Summary */}
                    <div className="p-6 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">
                                    Resumo Financeiro
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Consolidado do período
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                                <div>
                                    <p className="text-sm text-slate-600">Receita Total</p>
                                    <p className="text-lg font-semibold text-slate-900">
                                        {new Intl.NumberFormat('pt-MZ', {
                                            style: 'currency',
                                            currency: 'MZN',
                                            minimumFractionDigits: 0,
                                        }).format(data.revenue_summary?.total || 0)}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-emerald-100">
                                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                                <div>
                                    <p className="text-sm text-slate-600">Faturas Pagas</p>
                                    <p className="text-lg font-semibold text-emerald-600">
                                        {new Intl.NumberFormat('pt-MZ', {
                                            style: 'currency',
                                            currency: 'MZN',
                                            minimumFractionDigits: 0,
                                        }).format(data.revenue_summary?.paid || 0)}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-emerald-100">
                                    <DollarSign className="w-6 h-6 text-emerald-600" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                                <div>
                                    <p className="text-sm text-slate-600">Pendente</p>
                                    <p className="text-lg font-semibold text-amber-600">
                                        {new Intl.NumberFormat('pt-MZ', {
                                            style: 'currency',
                                            currency: 'MZN',
                                            minimumFractionDigits: 0,
                                        }).format(data.revenue_summary?.pending || 0)}
                                    </p>
                                </div>
                                <div className="p-3 bg-amber-100 rounded-lg">
                                    <Clock className="w-6 h-6 text-amber-600" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                                <div>
                                    <p className="text-sm text-slate-600">Vencido</p>
                                    <p className="text-lg font-semibold text-red-600">
                                        {new Intl.NumberFormat('pt-MZ', {
                                            style: 'currency',
                                            currency: 'MZN',
                                            minimumFractionDigits: 0,
                                        }).format(data.revenue_summary?.overdue || 0)}
                                    </p>
                                </div>
                                <div className="p-3 bg-red-100 rounded-lg">
                                    <Clock className="w-6 h-6 text-red-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Export Section */}
                <div className="p-6 rounded-lg bg-gradient-to-r from-slate-900 to-slate-800">
                    <div className="flex items-center justify-between">
                        <div className="text-white">
                            <h3 className="mb-1 text-lg font-semibold">
                                Exportar Relatório Completo
                            </h3>
                            <p className="text-sm text-slate-300">
                                Gere um PDF detalhado com todas as métricas e gráficos
                            </p>
                        </div>
                        <button
                            onClick={handleExport}
                            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors bg-white rounded-lg text-slate-900 hover:bg-slate-50"
                        >
                            <FileText className="w-4 h-4" />
                            Gerar Relatório PDF
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
