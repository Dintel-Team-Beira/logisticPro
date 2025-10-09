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

export default function Index({ data, period }) {
    const [selectedPeriod, setSelectedPeriod] = useState(period || 'month');

    const handlePeriodChange = (newPeriod) => {
        setSelectedPeriod(newPeriod);
        router.get('/reports', { period: newPeriod }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleExport = () => {
        window.open(`/reports/export?period=${selectedPeriod}&format=pdf`, '_blank');
    };

    // Mock data - substituir por dados reais
    const revenueData = [
        { name: 'Jan', receita: 45000, despesas: 32000 },
        { name: 'Fev', receita: 52000, despesas: 35000 },
        { name: 'Mar', receita: 48000, despesas: 33000 },
        { name: 'Abr', receita: 61000, despesas: 38000 },
        { name: 'Mai', receita: 55000, despesas: 36000 },
        { name: 'Jun', receita: 67000, despesas: 41000 },
    ];

    const statusData = [
        { name: 'Coleta', value: 12, color: '#3B82F6' },
        { name: 'Legalização', value: 8, color: '#8B5CF6' },
        { name: 'Alfândegas', value: 5, color: '#F59E0B' },
        { name: 'Concluído', value: 45, color: '#10B981' },
    ];

    const shippingLinesData = [
        { name: 'MAERSK', shipments: 25 },
        { name: 'CMA CGM', shipments: 18 },
        { name: 'MSC', shipments: 15 },
        { name: 'ONE', shipments: 12 },
    ];

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
                            <option value="week">Esta Semana</option>
                            <option value="month">Este Mês</option>
                            <option value="quarter">Este Trimestre</option>
                            <option value="year">Este Ano</option>
                        </select>
                        <button
                            onClick={handleExport}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-slate-900 hover:bg-slate-800"
                        >
                            <Download className="w-4 h-4" />
                            Exportar PDF
                        </button>
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
                            MZN 328,000
                        </p>
                        <p className="flex items-center gap-1 mt-1 text-xs text-emerald-600">
                            <TrendingUp className="w-3 h-3" />
                            +12.5% vs período anterior
                        </p>
                    </div>

                    <div className="p-4 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-slate-600">Total Shipments</p>
                            <Package className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-2xl font-semibold text-slate-900">70</p>
                        <p className="flex items-center gap-1 mt-1 text-xs text-blue-600">
                            <TrendingUp className="w-3 h-3" />
                            +8.2% vs período anterior
                        </p>
                    </div>

                    <div className="p-4 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-slate-600">Tempo Médio</p>
                            <Clock className="w-5 h-5 text-amber-500" />
                        </div>
                        <p className="text-2xl font-semibold text-slate-900">14.5 dias</p>
                        <p className="flex items-center gap-1 mt-1 text-xs text-emerald-600">
                            <TrendingUp className="w-3 h-3" />
                            -3.2% vs período anterior
                        </p>
                    </div>

                    <div className="p-4 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-slate-600">Taxa de Sucesso</p>
                            <BarChart3 className="w-5 h-5 text-purple-500" />
                        </div>
                        <p className="text-2xl font-semibold text-slate-900">94.2%</p>
                        <p className="flex items-center gap-1 mt-1 text-xs text-emerald-600">
                            <TrendingUp className="w-3 h-3" />
                            +2.1% vs período anterior
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

                    {/* Recent Activities */}
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
                                    <p className="text-lg font-semibold text-slate-900">MZN 328,000</p>
                                </div>
                                <div className="p-3 rounded-lg bg-emerald-100">
                                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                                <div>
                                    <p className="text-sm text-slate-600">Despesas Totais</p>
                                    <p className="text-lg font-semibold text-slate-900">MZN 215,000</p>
                                </div>
                                <div className="p-3 bg-red-100 rounded-lg">
                                    <DollarSign className="w-6 h-6 text-red-600" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                                <div>
                                    <p className="text-sm text-slate-600">Lucro Líquido</p>
                                    <p className="text-lg font-semibold text-emerald-600">MZN 113,000</p>
                                </div>
                                <div className="p-3 rounded-lg bg-emerald-100">
                                    <BarChart3 className="w-6 h-6 text-emerald-600" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                                <div>
                                    <p className="text-sm text-slate-600">Margem de Lucro</p>
                                    <p className="text-lg font-semibold text-slate-900">34.5%</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <PieChart className="w-6 h-6 text-blue-600" />
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
