import React, { useState } from 'react';
import { Link, Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    Package, Ship, DollarSign, TrendingUp, TrendingDown, Clock,
    CheckCircle2, AlertCircle, FileText, Calendar, ArrowUpRight,
    MapPin, Users, Building2, Layers, XCircle, AlertTriangle
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function Dashboard({ auth, stats, recentShipments, financialSummary, stageStats, recentActivities, alerts }) {
    const [period, setPeriod] = useState('month');

    // Verific permissões baseadas em role
    const canViewFinances = ['admin', 'manager'].includes(auth.user?.role);
    const canViewDetailed = ['admin'].includes(auth.user?.role);
    const canManage = ['admin', 'manager', 'operator'].includes(auth.user?.role);

    // Formatar moeda
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: 'MZN',
            minimumFractionDigits: 0
        }).format(value || 0);
    };

    // Cores para gráficos
    const COLORS = {
        coleta: '#3B82F6',
        legalizacao: '#8B5CF6',
        alfandegas: '#F59E0B',
        cornelder: '#10B981',
        taxacao: '#EC4899',
        concluido: '#6366F1'
    };

    // Status badge
    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
            'in_progress': { color: 'bg-blue-100 text-blue-800', icon: Clock },
            'completed': { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
            'blocked': { color: 'bg-red-100 text-red-800', icon: XCircle },
            'paid': { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
            'overdue': { color: 'bg-red-100 text-red-800', icon: AlertTriangle }
        };

        const config = statusConfig[status] || statusConfig['pending'];
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="w-3 h-3" />
                {status}
            </span>
        );
    };

    return (
        <DashboardLayout>
            <Head title="Dashboard" />

            <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 to-slate-100">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Dashboard Operacional</h1>
                            <p className="mt-1 text-slate-600">Bem-vindo de volta, {auth.user.name}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <select
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                                className="px-4 py-2 bg-white border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="week">Esta Semana</option>
                                <option value="month">Este Mês</option>
                                <option value="quarter">Este Trimestre</option>
                                <option value="year">Este Ano</option>
                            </select>
                            <div className="flex items-center gap-2 px-4 py-2 border border-blue-200 rounded-lg bg-blue-50">
                                <Users className="w-5 h-5 text-blue-600" />
                                <span className="text-sm font-medium capitalize text-slate-700">{auth.user.role}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alertas Urgentes */}
                {alerts && alerts.length > 0 && (
                    <div className="p-4 mb-6 border-l-4 border-orange-500 rounded-lg bg-gradient-to-r from-orange-50 to-red-50">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-900">Alertas Urgentes ({alerts.length})</h3>
                                <ul className="mt-2 space-y-1">
                                    {alerts.slice(0, 3).map((alert, index) => (
                                        <li key={index} className="text-sm text-slate-700">• {alert.message}</li>
                                    ))}
                                </ul>
                            </div>
                            <Link href="/alerts" className="text-sm font-medium text-orange-600 hover:text-orange-700">
                                Ver todos
                            </Link>
                        </div>
                    </div>
                )}

                {/* Cards de Estatísticas Principais */}
                <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
                    {/* Total Shipments Ativos */}
                    <div className="p-6 transition-shadow bg-white border shadow-sm rounded-xl border-slate-100 hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-lg bg-blue-50">
                                <Package className="w-6 h-6 text-blue-600" />
                            </div>
                            <span className="flex items-center gap-1 text-xs font-medium text-blue-600">
                                <TrendingUp className="w-4 h-4" />
                                +{stats?.shipmentsGrowth || 0}%
                            </span>
                        </div>
                        <h3 className="mb-1 text-sm font-medium text-slate-600">Processos Ativos</h3>
                        <p className="text-3xl font-bold text-slate-900">{stats?.activeShipments || 0}</p>
                        <p className="mt-2 text-xs text-slate-500">
                            {stats?.newThisWeek || 0} novos esta semana
                        </p>
                    </div>

                    {/* Receita Total (Admin/Manager) */}
                    {canViewFinances && (
                        <div className="p-6 transition-shadow bg-white border shadow-sm rounded-xl border-slate-100 hover:shadow-md">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-lg bg-green-50">
                                    <DollarSign className="w-6 h-6 text-green-600" />
                                </div>
                                <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                                    <TrendingUp className="w-4 h-4" />
                                    +{financialSummary?.revenueGrowth || 0}%
                                </span>
                            </div>
                            <h3 className="mb-1 text-sm font-medium text-slate-600">Receita Total</h3>
                            <p className="text-3xl font-bold text-slate-900">
                                {formatCurrency(financialSummary?.totalRevenue || 0)}
                            </p>
                            <p className="mt-2 text-xs text-slate-500">
                                Este {period === 'month' ? 'mês' : 'período'}
                            </p>
                        </div>
                    )}

                    {/* Documentos Pendentes */}
                    <div className="p-6 transition-shadow bg-white border shadow-sm rounded-xl border-slate-100 hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-lg bg-purple-50">
                                <FileText className="w-6 h-6 text-purple-600" />
                            </div>
                            <span className="text-xs font-medium text-purple-600">
                                {stats?.documentsUrgent || 0} urgentes
                            </span>
                        </div>
                        <h3 className="mb-1 text-sm font-medium text-slate-600">Documentos Pendentes</h3>
                        <p className="text-3xl font-bold text-slate-900">{stats?.pendingDocuments || 0}</p>
                        <Link href="/documents" className="inline-block mt-2 text-xs text-purple-600 hover:text-purple-700">
                            Ver todos →
                        </Link>
                    </div>

                    {/* Faturas Pendentes (Admin/Manager) */}
                    {canViewFinances && (
                        <div className="p-6 transition-shadow bg-white border shadow-sm rounded-xl border-slate-100 hover:shadow-md">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-lg bg-orange-50">
                                    <AlertCircle className="w-6 h-6 text-orange-600" />
                                </div>
                                <span className="text-xs font-medium text-orange-600">
                                    {stats?.overdueInvoices || 0} vencidas
                                </span>
                            </div>
                            <h3 className="mb-1 text-sm font-medium text-slate-600">Faturas Pendentes</h3>
                            <p className="text-3xl font-bold text-slate-900">{stats?.pendingInvoices || 0}</p>
                            <p className="mt-2 text-xs text-slate-500">
                                Valor: {formatCurrency(stats?.pendingAmount || 0)}
                            </p>
                        </div>
                    )}
                </div>

                {/* Gráficos e Detalhes */}
                <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-3">
                    {/* Distribuição por Fase (Pizza) */}
                    <div className="p-6 bg-white border shadow-sm lg:col-span-1 rounded-xl border-slate-100">
                        <h2 className="mb-4 text-xl font-bold text-slate-900">Processos por Fase</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={stageStats?.distribution || []}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label
                                >
                                    {(stageStats?.distribution || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 space-y-2">
                            {(stageStats?.distribution || []).map((stage, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded"
                                            style={{ backgroundColor: Object.values(COLORS)[index % Object.values(COLORS).length] }}
                                        />
                                        <span className="text-slate-700">{stage.name}</span>
                                    </div>
                                    <span className="font-semibold text-slate-900">{stage.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Evolução Financeira (Admin/Manager) */}
                    {canViewFinances && (
                        <div className="p-6 bg-white border shadow-sm lg:col-span-2 rounded-xl border-slate-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-slate-900">Evolução Financeira</h2>
                                <div className="flex gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded" />
                                        <span className="text-slate-600">Receita</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded" />
                                        <span className="text-slate-600">Despesas</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded" />
                                        <span className="text-slate-600">Lucro</span>
                                    </div>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={financialSummary?.monthlyData || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" stroke="#64748b" />
                                    <YAxis stroke="#64748b" />
                                    <Tooltip
                                        formatter={(value) => formatCurrency(value)}
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}
                                    />
                                    <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
                                    <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} />
                                    <Line type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Evolução de Processos (Viewer/Operator) */}
                    {!canViewFinances && (
                        <div className="p-6 bg-white border shadow-sm lg:col-span-2 rounded-xl border-slate-100">
                            <h2 className="mb-4 text-xl font-bold text-slate-900">Evolução de Processos</h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={stats?.monthlyShipments || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" stroke="#64748b" />
                                    <YAxis stroke="#64748b" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}
                                    />
                                    <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Shipments Recentes e Atividades */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Processos Recentes */}
                    <div className="p-6 bg-white border shadow-sm rounded-xl border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-900">Processos Recentes</h2>
                            <Link href="/shipments" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                Ver todos →
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {(recentShipments || []).map((shipment) => (
                                <Link
                                    key={shipment.id}
                                    href={`/shipments/${shipment.id}`}
                                    className="flex items-center justify-between p-4 transition-colors rounded-lg bg-slate-50 hover:bg-slate-100 group"
                                >
                                    <div className="flex items-center flex-1 gap-4">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Ship className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate transition-colors text-slate-900 group-hover:text-blue-600">
                                                {shipment.reference_number}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-600">
                                                {shipment.client?.name} • {shipment.shipping_line?.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        {getStatusBadge(shipment.stages?.[0]?.status || 'pending')}
                                        <span className="text-xs text-slate-500">
                                            Fase {shipment.current_phase || 1}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Atividades Recentes */}
                    <div className="p-6 bg-white border shadow-sm rounded-xl border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-900">Atividades Recentes</h2>
                            {canViewDetailed && (
                                <Link href="/audit" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                    Ver histórico →
                                </Link>
                            )}
                        </div>
                        <div className="space-y-3">
                            {(recentActivities || []).map((activity, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                                    <div className="p-2 rounded-lg bg-slate-200">
                                        {activity.action === 'created' && <Package className="w-4 h-4 text-slate-600" />}
                                        {activity.action === 'updated' && <Clock className="w-4 h-4 text-blue-600" />}
                                        {activity.action === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                                        {activity.action === 'document_uploaded' && <FileText className="w-4 h-4 text-purple-600" />}
                                        {activity.action === 'invoice_paid' && <DollarSign className="w-4 h-4 text-green-600" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-900">{activity.description}</p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {activity.user?.name} • {new Date(activity.created_at).toLocaleString('pt-MZ')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
