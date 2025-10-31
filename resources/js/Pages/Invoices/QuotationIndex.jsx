import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    FileText,
    Clock,
    CheckCircle,
    AlertCircle,
    DollarSign,
    Download,
    Eye,
    Mail,
    Search,
    Filter,
    TrendingUp,
    Calendar,
    User,
    Package
} from 'lucide-react';

export default function QuotationIndex({ invoices, stats, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/invoices/quotations', { search, status: statusFilter }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: 'MZN'
        }).format(amount || 0);
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status, dueDate) => {
        // Verificar se está vencida
        const isOverdue = status === 'pending' && new Date(dueDate) < new Date();

        if (isOverdue) {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    <AlertCircle className="w-3 h-3" />
                    Vencida
                </span>
            );
        }

        const badges = {
            pending: {
                label: 'Pendente',
                class: 'bg-yellow-100 text-yellow-800',
                icon: Clock
            },
            paid: {
                label: 'Paga',
                class: 'bg-green-100 text-green-800',
                icon: CheckCircle
            },
            cancelled: {
                label: 'Cancelada',
                class: 'bg-slate-100 text-slate-800',
                icon: AlertCircle
            }
        };

        const badge = badges[status] || badges.pending;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${badge.class}`}>
                <Icon className="w-3 h-3" />
                {badge.label}
            </span>
        );
    };

    const handleSendEmail = (invoiceId) => {
        if (confirm('Enviar fatura por email ao cliente?')) {
            router.post(`/invoices/quotations/${invoiceId}/send-email`, {}, {
                preserveScroll: true,
            });
        }
    };

    return (
        <DashboardLayout>
            <Head title="Faturas de Cotações" />

            <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Faturas de Cotações
                    </h1>
                    <p className="mt-1 text-slate-600">
                        Gestão de faturas geradas automaticamente das cotações
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="p-6 bg-white border rounded-xl border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-lg bg-blue-100">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <h3 className="text-sm font-medium text-slate-600">Total de Faturas</h3>
                        <p className="mt-1 text-3xl font-bold text-slate-900">{stats.total}</p>
                    </div>

                    <div className="p-6 bg-white border rounded-xl border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-lg bg-yellow-100">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                        <h3 className="text-sm font-medium text-slate-600">Pendentes</h3>
                        <p className="mt-1 text-3xl font-bold text-slate-900">{stats.pending}</p>
                    </div>

                    <div className="p-6 bg-white border rounded-xl border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-lg bg-green-100">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <h3 className="text-sm font-medium text-slate-600">Pagas</h3>
                        <p className="mt-1 text-3xl font-bold text-slate-900">{stats.paid}</p>
                    </div>

                    <div className="p-6 bg-white border rounded-xl border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-lg bg-red-100">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                        <h3 className="text-sm font-medium text-slate-600">Vencidas</h3>
                        <p className="mt-1 text-3xl font-bold text-slate-900">{stats.overdue}</p>
                    </div>
                </div>

                {/* Amount Cards */}
                <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
                    <div className="p-6 border border-yellow-200 rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100">
                        <div className="flex items-center gap-3 mb-2">
                            <DollarSign className="w-5 h-5 text-yellow-700" />
                            <h3 className="text-sm font-semibold text-yellow-900">Valor Pendente</h3>
                        </div>
                        <p className="text-3xl font-bold text-yellow-900">
                            {formatCurrency(stats.total_pending_amount)}
                        </p>
                        <p className="mt-1 text-xs text-yellow-700">
                            Aguardando pagamento dos clientes
                        </p>
                    </div>

                    <div className="p-6 border border-green-200 rounded-xl bg-gradient-to-br from-green-50 to-green-100">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-5 h-5 text-green-700" />
                            <h3 className="text-sm font-semibold text-green-900">Valor Pago</h3>
                        </div>
                        <p className="text-3xl font-bold text-green-900">
                            {formatCurrency(stats.total_paid_amount)}
                        </p>
                        <p className="mt-1 text-xs text-green-700">
                            Total recebido de faturas pagas
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="p-4 bg-white border rounded-lg border-slate-200">
                    <form onSubmit={handleSearch} className="flex flex-col gap-4 md:flex-row">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar por nº fatura, processo ou cliente..."
                                    className="w-full py-2 pl-10 pr-4 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="w-full md:w-48">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                            >
                                <option value="">Todos os Status</option>
                                <option value="pending">Pendentes</option>
                                <option value="paid">Pagas</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="px-6 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            <Filter className="inline w-4 h-4 mr-2" />
                            Filtrar
                        </button>

                        {(search || statusFilter) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    setStatusFilter('');
                                    router.get('/invoices/quotations');
                                }}
                                className="px-4 py-2 text-sm font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
                            >
                                Limpar
                            </button>
                        )}
                    </form>
                </div>

                {/* Table */}
                <div className="overflow-hidden bg-white border rounded-lg border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-700">
                                        Fatura
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-700">
                                        Cliente
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-700">
                                        Processo
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold tracking-wider text-right uppercase text-slate-700">
                                        Valor
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-700">
                                        Datas
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-700">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold tracking-wider text-right uppercase text-slate-700">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {invoices.data && invoices.data.length > 0 ? (
                                    invoices.data.map((invoice) => (
                                        <tr key={invoice.id} className="transition-colors hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-5 h-5 text-blue-600" />
                                                    <div>
                                                        <Link
                                                            href={`/invoices/quotations/${invoice.id}`}
                                                            className="font-semibold text-blue-600 hover:text-blue-700"
                                                        >
                                                            {invoice.invoice_number}
                                                        </Link>
                                                        <p className="text-xs text-slate-500">
                                                            {invoice.metadata?.quotation_reference}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-slate-400" />
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">
                                                            {invoice.shipment?.client?.name || 'N/A'}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {invoice.shipment?.client?.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Package className="w-4 h-4 text-slate-400" />
                                                    <Link
                                                        href={`/shipments/${invoice.shipment?.id}`}
                                                        className="text-sm text-blue-600 hover:text-blue-700"
                                                    >
                                                        {invoice.shipment?.reference_number}
                                                    </Link>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="text-sm font-bold text-slate-900">
                                                    {formatCurrency(invoice.amount)}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {invoice.currency}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <div className="flex items-center gap-1 text-slate-600">
                                                        <Calendar className="w-3 h-3" />
                                                        <span className="text-xs">Emissão:</span>
                                                        <span className="font-medium">{formatDate(invoice.issue_date)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-1 text-slate-600">
                                                        <Clock className="w-3 h-3" />
                                                        <span className="text-xs">Vencimento:</span>
                                                        <span className="font-medium">{formatDate(invoice.due_date)}</span>
                                                    </div>
                                                    {invoice.payment_date && (
                                                        <div className="flex items-center gap-1 mt-1 text-green-600">
                                                            <CheckCircle className="w-3 h-3" />
                                                            <span className="text-xs">Pago:</span>
                                                            <span className="font-medium">{formatDate(invoice.payment_date)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(invoice.status, invoice.due_date)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/invoices/quotations/${invoice.id}`}
                                                        className="p-2 transition-colors rounded-lg hover:bg-blue-50"
                                                        title="Ver detalhes"
                                                    >
                                                        <Eye className="w-4 h-4 text-blue-600" />
                                                    </Link>

                                                    <a
                                                        href={`/invoices/quotations/${invoice.id}/pdf`}
                                                        target="_blank"
                                                        className="p-2 transition-colors rounded-lg hover:bg-emerald-50"
                                                        title="Baixar PDF"
                                                    >
                                                        <Download className="w-4 h-4 text-emerald-600" />
                                                    </a>

                                                    <button
                                                        onClick={() => handleSendEmail(invoice.id)}
                                                        className="p-2 transition-colors rounded-lg hover:bg-purple-50"
                                                        title="Enviar por email"
                                                    >
                                                        <Mail className="w-4 h-4 text-purple-600" />
                                                    </button>

                                                    {invoice.status === 'pending' && (
                                                        <Link
                                                            href={`/invoices/quotations/${invoice.id}`}
                                                            className="px-3 py-1 text-xs font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                                                        >
                                                            Marcar Paga
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center">
                                            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                            <p className="text-sm font-medium text-slate-900">
                                                Nenhuma fatura encontrada
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                As faturas geradas das cotações aparecerão aqui
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {invoices.links && invoices.links.length > 3 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                            <div className="text-sm text-slate-600">
                                Mostrando {invoices.from} a {invoices.to} de {invoices.total} faturas
                            </div>
                            <div className="flex gap-2">
                                {invoices.links.map((link, index) => (
                                    link.url ? (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            className={`px-3 py-1 text-sm border rounded ${
                                                link.active
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : null
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
