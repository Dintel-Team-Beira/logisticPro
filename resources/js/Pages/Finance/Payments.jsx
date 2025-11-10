import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    DollarSign,
    Search,
    Filter,
    Download,
    Eye,
    Calendar,
    Building2,
    CreditCard,
    TrendingUp,
    TrendingDown,
    CheckCircle2,
    Clock,
    XCircle,
    FileText,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

export default function Payments({ payments, stats, filters }) {

    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [dateFilter, setDateFilter] = useState(filters?.date || 'all');
    // const [sortBy, setSortBy] = useState(filters?.sort || 'desc');

    // console.log("hello word",filters);
    // Aplicar filtros
    const handleFilter = () => {
        router.get('/finance/payments', {
            search: searchTerm,
            status: statusFilter,
            date: dateFilter,
            // sort: sortBy,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Limpar filtros
    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setDateFilter('all');
        // setSortBy('date_desc');
        router.get('/finance/payments', {}, { preserveState: true });
    };

    // Export para Excel
    const handleExport = () => {
        window.location.href = '/finance/payments/export?' + new URLSearchParams({
            search: searchTerm,
            status: statusFilter,
            date: dateFilter,
        }).toString();
    };

    // Formatar moeda
    const formatCurrency = (amount, currency = 'MZN') => {
        // Validar valor antes de formatar para evitar NaN
        const value = amount ?? 0;

        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: currency,
        }).format(value);
    };

    // Formatar data
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    // Status badge
    const StatusBadge = ({ status }) => {
        const configs = {
            paid: {
                bg: 'bg-green-100',
                text: 'text-green-800',
                icon: CheckCircle2,
                label: 'Pago',
            },
            in_payment: {
                bg: 'bg-blue-100',
                text: 'text-blue-800',
                icon: Clock,
                label: 'Processando',
            },
            pending: {
                bg: 'bg-amber-100',
                text: 'text-amber-800',
                icon: Clock,
                label: 'Pendente',
            },
            rejected: {
                bg: 'bg-red-100',
                text: 'text-red-800',
                icon: XCircle,
                label: 'Rejeitado',
            },
        };

        const config = configs[status] || configs.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
                <Icon className="w-3.5 h-3.5" />
                {config.label}
            </span>
        );
    };

    return (
        <DashboardLayout>
            <Head title="Histórico de Pagamentos - Finanças" />

    <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Histórico de Pagamentos
                        </h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Visualize todos os pagamentos processados
                        </p>
                    </div>
                    <button
                        // onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                    >
                        <Download className="w-4 h-4" />
                        Exportar Excel
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    <StatCard
                        title="Total Pago"
                        value={formatCurrency(stats?.total_paid)}
                        icon={DollarSign}
                        trend="+12.5%"
                        trendUp={true}
                        color="green"
                    />
                    <StatCard
                        title="Este Mês"
                        value={formatCurrency(stats?.this_month)}
                        icon={Calendar}
                        trend="+8.2%"
                        trendUp={true}
                        color="blue"
                    />
                    <StatCard
                        title="Pagamentos"
                        value={stats?.total_payments}
                        icon={CheckCircle2}
                        subtitle="transações"
                        color="purple"
                    />
                    <StatCard
                        title="Média/Pagamento"
                        value={formatCurrency(stats?.average_payment)}
                        icon={TrendingUp}
                        color="amber"
                    />
                </div>

                {/* Filtros */}
                <div className="p-6 bg-white border rounded-xl border-slate-200">
                    <div className="grid grid-cols-1 gap-1 md:grid-cols-4">

                        <div className="md:col-span-2">
                            <label className="block mb-2 text-sm font-medium text-slate-700">
                                Buscar
                            </label>
                            <div className="relative">
                                <Search className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Processo, cliente, referência..."
                                    className="w-full py-2 pl-10 pr-4 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>


                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-700">
                                Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Todos</option>
                                <option value="paid">Pagos</option>
                                <option value="in_payment">Processando</option>
                                <option value="pending">Pendentes</option>
                                <option value="rejected">Rejeitados</option>
                            </select>
                        </div>


                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-700">
                                Período
                            </label>
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Todos</option>
                                <option value="today">Hoje</option>
                                <option value="week">Esta Semana</option>
                                <option value="month">Este Mês</option>
                                <option value="quarter">Trimestre</option>
                                <option value="year">Este Ano</option>
                            </select>
                        </div>

                    </div>


                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={handleFilter}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            <Filter className="w-4 h-4" />
                            Aplicar Filtros
                        </button>
                        <button
                            onClick={handleClearFilters}
                            className="px-4 py-2 text-sm font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
                        >
                            Limpar
                        </button>
                    </div>
                </div>

                {/* Tabela de Pagamentos */}
                <div className="overflow-hidden bg-white border rounded-xl border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-700">
                                        Data
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-700">
                                        Processo
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-700">
                                        Beneficiário
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-700">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-right uppercase text-slate-700">
                                        Valor
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-center uppercase text-slate-700">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-center uppercase text-slate-700">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {payments.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center">
                                            <DollarSign className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                            <p className="text-sm font-medium text-slate-600">
                                                Nenhum pagamento encontrado
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Tente ajustar os filtros
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    payments.data.map((payment) => (
                                        <tr key={payment.id} className="transition-colors hover:bg-slate-50">
                                            <td className="px-6 py-4 text-sm text-slate-900">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                    {formatDate(payment.paid_at || payment.created_at)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/shipments/${payment.shipment.id}`}
                                                    className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
                                                >
                                                    {payment.shipment.reference_number}
                                                </Link>
                                                <p className="text-xs text-slate-500">
                                                    {payment.shipment.client_name}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-900">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-slate-400" />
                                                    {payment.payee}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {payment.request_type_label}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-right text-slate-900">
                                                {formatCurrency(payment.amount, payment.currency)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <StatusBadge status={payment.status} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link
                                                        href={`/payment-requests/${payment.id}`}
                                                        className="p-2 transition-colors rounded-lg hover:bg-blue-50"
                                                        title="Ver Detalhes"
                                                    >
                                                        <Eye className="w-4 h-4 text-blue-600" />
                                                    </Link>
                                                    {payment.payment_proof && (
                                                        <a
                                                            href={`/documents/${payment.payment_proof.id}/download`}
                                                            className="p-2 transition-colors rounded-lg hover:bg-green-50"
                                                            title="Download Comprovativo"
                                                        >
                                                            <Download className="w-4 h-4 text-green-600" />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>


                    {payments.last_page > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                            <div className="text-sm text-slate-600">
                                Mostrando {payments.from} a {payments.to} de {payments.total} pagamentos
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    href={payments.prev_page_url}
                                    disabled={!payments.prev_page_url}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Anterior
                                </Link>
                                <Link
                                    href={payments.next_page_url}
                                    disabled={!payments.next_page_url}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Próxima
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

// Componente de Card de Estatística
function StatCard({ title, value, icon: Icon, trend, trendUp, subtitle, color = 'blue' }) {
    const colorClasses = {
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        purple: 'bg-purple-100 text-purple-600',
        amber: 'bg-amber-100 text-amber-600',
    };

    return (
        <div className="p-6 bg-white border rounded-xl border-slate-200">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                        {trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {trend}
                    </div>
                )}
            </div>
            <h3 className="text-sm font-medium text-slate-600">{title}</h3>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
            {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
    );
}
