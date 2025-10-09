import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import StatusBadge from '@/Components/StatusBadge';
import {
    Plus,
    Search,
    DollarSign,
    Calendar,
    Eye,
    CheckCircle2,
    Clock,
    AlertTriangle,
} from 'lucide-react';

export default function Index({ invoices, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/invoices', { search, status: selectedStatus }, {
            preserveState: true,
            replace: true,
        });
    };

    const getTotalByStatus = (status) => {
        return invoices.data?.filter(inv => inv.status === status).length || 0;
    };

    const getTotalAmount = (status) => {
        return invoices.data
            ?.filter(inv => inv.status === status)
            .reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
            .toFixed(2) || '0.00';
    };

    return (
        <DashboardLayout>
            <Head title="Faturas" />

                  <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Faturas
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Gerencie todas as faturas
                        </p>
                    </div>
                    <Link href="/invoices/create">
                        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors duration-200">
                            <Plus className="w-4 h-4" />
                            Nova Fatura
                        </button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="p-4 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-slate-600">Total</p>
                            <DollarSign className="w-5 h-5 text-slate-400" />
                        </div>
                        <p className="text-2xl font-semibold text-slate-900">
                            {invoices.total || 0}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            MZN {getTotalAmount()}
                        </p>
                    </div>

                    <div className="p-4 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-slate-600">Pendentes</p>
                            <Clock className="w-5 h-5 text-amber-500" />
                        </div>
                        <p className="text-2xl font-semibold text-slate-900">
                            {getTotalByStatus('pending')}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            MZN {getTotalAmount('pending')}
                        </p>
                    </div>

                    <div className="p-4 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-slate-600">Pagas</p>
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                        <p className="text-2xl font-semibold text-slate-900">
                            {getTotalByStatus('paid')}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            MZN {getTotalAmount('paid')}
                        </p>
                    </div>

                    <div className="p-4 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-slate-600">Vencidas</p>
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                        <p className="text-2xl font-semibold text-slate-900">
                            {getTotalByStatus('overdue')}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            MZN {getTotalAmount('overdue')}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="p-4 bg-white border rounded-lg border-slate-200">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute w-4 h-4 -translate-y-1/2 text-slate-400 left-3 top-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar por número, emissor..."
                                className="w-full py-2.5 pl-10 pr-4 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                        >
                            <option value="">Todos os Status</option>
                            <option value="pending">Pendente</option>
                            <option value="paid">Paga</option>
                            <option value="overdue">Vencida</option>
                        </select>
                        <button
                            type="submit"
                            className="px-5 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            Filtrar
                        </button>
                    </form>
                </div>

                {/* Table */}
                <div className="overflow-hidden bg-white border rounded-lg border-slate-200">
                    <table className="w-full">
                        <thead className="border-b bg-slate-50 border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600">
                                    Número
                                </th>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600">
                                    Shipment
                                </th>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600">
                                    Emissor
                                </th>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600">
                                    Valor
                                </th>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600">
                                    Vencimento
                                </th>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-right uppercase text-slate-600">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {invoices.data && invoices.data.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-12 text-center">
                                        <DollarSign className="w-12 h-12 mx-auto text-slate-300" />
                                        <h3 className="mt-2 text-sm font-medium text-slate-900">
                                            Nenhuma fatura encontrada
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Comece criando uma nova fatura
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                invoices.data.map((invoice) => (
                                    <tr key={invoice.id} className="transition-colors hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                            {invoice.invoice_number}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            <Link
                                                href={`/shipments/${invoice.shipment_id}`}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                {invoice.shipment?.reference_number || 'N/A'}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {invoice.issuer}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                                            {invoice.currency} {invoice.amount}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {invoice.due_date || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={invoice.status} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/invoices/${invoice.id}`}>
                                                    <button className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {invoices.links && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600">
                            Mostrando {invoices.from || 0} a {invoices.to || 0} de {invoices.total || 0} resultados
                        </p>
                        <div className="flex gap-1">
                            {invoices.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`
                                        px-3 py-1.5 text-sm rounded-md transition-colors
                                        ${link.active
                                            ? 'bg-slate-900 text-white'
                                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                                        }
                                        ${!link.url && 'opacity-50 cursor-not-allowed'}
                                    `}
                                    preserveState
                                    disabled={!link.url}
                                >
                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
