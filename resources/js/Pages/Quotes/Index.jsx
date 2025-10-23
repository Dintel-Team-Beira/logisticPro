import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Plus, Eye, Edit, Trash2, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Index({ quotes, stats }) {
    const handleDelete = (quoteId) => {
        if (confirm('Tem certeza que deseja excluir esta cotação?')) {
            router.delete(`/quotes/${quoteId}`);
        }
    };

    const getStatusBadge = (status) => {
        const statuses = {
            draft: { label: 'Rascunho', color: 'bg-gray-100 text-gray-700', icon: FileText },
            sent: { label: 'Enviada', color: 'bg-blue-100 text-blue-700', icon: Clock },
            viewed: { label: 'Visualizada', color: 'bg-indigo-100 text-indigo-700', icon: Eye },
            accepted: { label: 'Aceita', color: 'bg-green-100 text-green-700', icon: CheckCircle },
            rejected: { label: 'Rejeitada', color: 'bg-red-100 text-red-700', icon: XCircle },
            expired: { label: 'Expirada', color: 'bg-orange-100 text-orange-700', icon: Clock },
            converted: { label: 'Convertida', color: 'bg-purple-100 text-purple-700', icon: CheckCircle },
        };
        const config = statuses[status] || statuses.draft;
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md ${config.color}`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </span>
        );
    };

    return (
        <DashboardLayout>
            <Head title="Cotações" />

            <div className="p-6 ml-5 -mt-3 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Cotações
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Gerencie orçamentos e propostas comerciais
                        </p>
                    </div>
                    <Link href="/quotes/create">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors duration-200"
                        >
                            <Plus className="w-4 h-4" />
                            Nova Cotação
                        </motion.button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-white border rounded-lg border-slate-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Total</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-900">
                                    {stats?.total || 0}
                                </p>
                            </div>
                            <FileText className="w-8 h-8 text-slate-400" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-4 bg-white border rounded-lg border-slate-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Rascunho</p>
                                <p className="mt-1 text-2xl font-semibold text-gray-600">
                                    {stats?.draft || 0}
                                </p>
                            </div>
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-4 bg-white border rounded-lg border-slate-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Enviadas</p>
                                <p className="mt-1 text-2xl font-semibold text-blue-600">
                                    {stats?.sent || 0}
                                </p>
                            </div>
                            <Clock className="w-8 h-8 text-blue-400" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-4 bg-white border rounded-lg border-slate-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Aceitas</p>
                                <p className="mt-1 text-2xl font-semibold text-green-600">
                                    {stats?.accepted || 0}
                                </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="p-4 bg-white border rounded-lg border-slate-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Convertidas</p>
                                <p className="mt-1 text-2xl font-semibold text-purple-600">
                                    {stats?.converted || 0}
                                </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-purple-400" />
                        </div>
                    </motion.div>
                </div>

                {/* Table */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="overflow-hidden bg-white border rounded-lg border-slate-200"
                >
                    <table className="w-full">
                        <thead className="border-b bg-slate-50 border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600">
                                    Número
                                </th>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600">
                                    Cliente
                                </th>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600">
                                    Título
                                </th>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600">
                                    Data
                                </th>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-right uppercase text-slate-600">
                                    Valor
                                </th>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-center uppercase text-slate-600">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-right uppercase text-slate-600">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {quotes.data && quotes.data.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-12 text-center">
                                        <FileText className="w-12 h-12 mx-auto text-slate-300" />
                                        <h3 className="mt-2 text-sm font-medium text-slate-900">
                                            Nenhuma cotação encontrada
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Comece criando uma nova cotação
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                quotes.data?.map((quote) => (
                                    <tr key={quote.id} className="transition-colors hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm font-mono font-medium text-slate-900">
                                            {quote.quote_number}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-slate-900">
                                                {quote.client?.name || 'N/A'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-slate-900">{quote.title}</p>
                                            {quote.shipment && (
                                                <p className="text-xs text-slate-500">
                                                    Processo: {quote.shipment.shipment_number}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {new Date(quote.quote_date).toLocaleDateString('pt-MZ')}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right">
                                            <span className="font-semibold text-slate-900">
                                                {Number(quote.total).toLocaleString('pt-MZ', {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </span>
                                            <span className="text-slate-500"> {quote.currency}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {getStatusBadge(quote.status)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/quotes/${quote.id}`}>
                                                    <button
                                                        className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                                                        title="Visualizar"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                                {['draft', 'sent'].includes(quote.status) && (
                                                    <Link href={`/quotes/${quote.id}/edit`}>
                                                        <button
                                                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                                                            title="Editar"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    </Link>
                                                )}
                                                {quote.status !== 'converted' && (
                                                    <button
                                                        onClick={() => handleDelete(quote.id)}
                                                        className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {quotes.links && quotes.data?.length > 0 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
                            <p className="text-sm text-slate-600">
                                Mostrando {quotes.from || 0} a {quotes.to || 0} de {quotes.total || 0} cotações
                            </p>
                            <div className="flex gap-2">
                                {quotes.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                            link.active
                                                ? 'bg-slate-900 text-white'
                                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
