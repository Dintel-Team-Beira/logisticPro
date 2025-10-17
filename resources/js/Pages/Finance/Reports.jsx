import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    FileText,
    Calendar,
    Download,
    Filter,
    PieChart,
    BarChart3,
    Clock
} from 'lucide-react';

export default function Reports({
    stats,
    paymentsByPhase,
    paymentsByType,
    monthlyData,
    topPayments,
    filters
}) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    // Formatar moeda
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: 'MZN',
            minimumFractionDigits: 2,
        }).format(value || 0);
    };

    // Formatar data
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('pt-BR');
    };

    // Calcular percentagem
    const calculatePercentage = (part, total) => {
        if (!total) return 0;
        return ((part / total) * 100).toFixed(1);
    };

    // Stats Cards
    const statCards = [
        {
            title: 'Total Pago',
            value: formatCurrency(stats.total_paid),
            icon: DollarSign,
            color: 'green',
            bgColor: 'bg-green-100',
            textColor: 'text-green-600',
        },
        {
            title: 'Total Pendente',
            value: formatCurrency(stats.total_pending),
            icon: Clock,
            color: 'yellow',
            bgColor: 'bg-yellow-100',
            textColor: 'text-yellow-600',
        },
        {
            title: 'Total Aprovado',
            value: formatCurrency(stats.total_approved),
            icon: FileText,
            color: 'blue',
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-600',
        },
        {
            title: 'Pagamentos Realizados',
            value: stats.count_paid,
            icon: TrendingUp,
            color: 'purple',
            bgColor: 'bg-purple-100',
            textColor: 'text-purple-600',
        },
    ];

    // Submeter filtros
    const handleFilter = () => {
        const url = new URL(window.location.href);
        url.searchParams.set('start_date', startDate);
        url.searchParams.set('end_date', endDate);
        window.location.href = url.toString();
    };

    return (
        <DashboardLayout>
            <Head title="Relatórios Financeiros" />
 <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">
                            Relatórios Financeiros
                        </h1>
                        <p className="mt-1 text-slate-600">
                            Análise completa de pagamentos e solicitações
                        </p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700">
                        <Download className="w-4 h-4" />
                        Exportar Relatório
                    </button>
                </div>
            </div>

            {/* Filtros de Data */}
            <div className="p-6 mb-6 bg-white border rounded-xl border-slate-200">
                <div className="flex items-end gap-4">
                    <div className="flex-1">
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            Data Inicial
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            Data Final
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <button
                        onClick={handleFilter}
                        className="flex items-center gap-2 px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <Filter className="w-4 h-4" />
                        Filtrar
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="p-6 bg-white border rounded-xl border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                            </div>
                        </div>
                        <h3 className="text-sm font-medium text-slate-600">{stat.title}</h3>
                        <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
                <div className="p-6 border border-blue-200 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
                    <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-blue-900">
                        <Clock className="w-5 h-5" />
                        Tempo Médio de Aprovação
                    </h3>
                    <p className="text-4xl font-bold text-blue-900">
                        {stats.avg_approval_time.toFixed(1)} dias
                    </p>
                    <p className="mt-2 text-sm text-blue-700">
                        Tempo desde a criação até aprovação
                    </p>
                </div>

                <div className="p-6 border border-green-200 rounded-xl bg-gradient-to-br from-green-50 to-green-100">
                    <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-green-900">
                        <TrendingUp className="w-5 h-5" />
                        Tempo Médio de Pagamento
                    </h3>
                    <p className="text-4xl font-bold text-green-900">
                        {stats.avg_payment_time.toFixed(1)} dias
                    </p>
                    <p className="mt-2 text-sm text-green-700">
                        Tempo desde aprovação até pagamento
                    </p>
                </div>
            </div>

            {/* Pagamentos por Fase */}
            <div className="p-6 mb-6 bg-white border rounded-xl border-slate-200">
                <h2 className="flex items-center gap-2 mb-6 text-xl font-bold text-slate-900">
                    <PieChart className="w-6 h-6" />
                    Pagamentos por Fase
                </h2>
                <div className="space-y-4">
                    {paymentsByPhase.map((item, idx) => {
                        const percentage = calculatePercentage(item.total, stats.total_paid);
                        return (
                            <div key={idx} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-slate-700">{item.phase}</span>
                                    <div className="text-right">
                                        <span className="font-bold text-slate-900">
                                            {formatCurrency(item.total)}
                                        </span>
                                        <span className="ml-2 text-sm text-slate-600">
                                            ({item.count} pagamentos)
                                        </span>
                                    </div>
                                </div>
                                <div className="relative w-full h-3 overflow-hidden rounded-full bg-slate-200">
                                    <div
                                        className="h-full transition-all duration-500 bg-blue-600"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <span className="text-sm text-slate-600">{percentage}% do total</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Pagamentos por Tipo */}
            <div className="p-6 mb-6 bg-white border rounded-xl border-slate-200">
                <h2 className="flex items-center gap-2 mb-6 text-xl font-bold text-slate-900">
                    <BarChart3 className="w-6 h-6" />
                    Pagamentos por Tipo
                </h2>
                <div className="space-y-4">
                    {paymentsByType.map((item, idx) => {
                        const percentage = calculatePercentage(item.total, stats.total_paid);
                        return (
                            <div key={idx} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-slate-700">{item.type}</span>
                                    <div className="text-right">
                                        <span className="font-bold text-slate-900">
                                            {formatCurrency(item.total)}
                                        </span>
                                        <span className="ml-2 text-sm text-slate-600">
                                            ({item.count})
                                        </span>
                                    </div>
                                </div>
                                <div className="relative w-full h-3 overflow-hidden rounded-full bg-slate-200">
                                    <div
                                        className="h-full transition-all duration-500 bg-green-600"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Evolução Mensal */}
            <div className="p-6 mb-6 bg-white border rounded-xl border-slate-200">
                <h2 className="flex items-center gap-2 mb-6 text-xl font-bold text-slate-900">
                    <Calendar className="w-6 h-6" />
                    Evolução Mensal
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="px-4 py-3 text-sm font-semibold text-left text-slate-700">Mês</th>
                                <th className="px-4 py-3 text-sm font-semibold text-right text-slate-700">Total Pago</th>
                                <th className="px-4 py-3 text-sm font-semibold text-right text-slate-700">Nº Pagamentos</th>
                                <th className="px-4 py-3 text-sm font-semibold text-right text-slate-700">Média</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthlyData.map((month, idx) => (
                                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="px-4 py-3 text-slate-900">{month.month}</td>
                                    <td className="px-4 py-3 font-semibold text-right text-slate-900">
                                        {formatCurrency(month.total)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600">{month.count}</td>
                                    <td className="px-4 py-3 text-right text-slate-600">
                                        {formatCurrency(month.count > 0 ? month.total / month.count : 0)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Top 10 Maiores Pagamentos */}
            <div className="p-6 bg-white border rounded-xl border-slate-200">
                <h2 className="flex items-center gap-2 mb-6 text-xl font-bold text-slate-900">
                    <TrendingUp className="w-6 h-6" />
                    Top 10 Maiores Pagamentos
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="px-4 py-3 text-sm font-semibold text-left text-slate-700">#</th>
                                <th className="px-4 py-3 text-sm font-semibold text-left text-slate-700">Processo</th>
                                <th className="px-4 py-3 text-sm font-semibold text-left text-slate-700">Cliente</th>
                                <th className="px-4 py-3 text-sm font-semibold text-left text-slate-700">Beneficiário</th>
                                <th className="px-4 py-3 text-sm font-semibold text-right text-slate-700">Valor</th>
                                <th className="px-4 py-3 text-sm font-semibold text-left text-slate-700">Data</th>
                                <th className="px-4 py-3 text-sm font-semibold text-left text-slate-700">Processado por</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topPayments.map((payment, idx) => (
                                <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="px-4 py-3 text-slate-600">{idx + 1}</td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/shipments/${payment.shipment.id}`}
                                            className="font-medium text-blue-600 hover:text-blue-800"
                                        >
                                            {payment.shipment.reference_number}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-slate-900">
                                        {payment.shipment.client?.name || 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-slate-900">{payment.payee}</td>
                                    <td className="px-4 py-3 font-bold text-right text-slate-900">
                                        {formatCurrency(payment.amount)}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">
                                        {formatDate(payment.paid_at)}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">
                                        {payment.payer?.name || 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            </div>
        </DashboardLayout>
    );
}
