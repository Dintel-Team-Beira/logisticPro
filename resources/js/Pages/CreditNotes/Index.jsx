import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { FileDown, Plus, Search, Download, Eye, Trash2, Edit, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Index({ creditNotes = { data: [] }, stats = {}, filters = {} }) {
    // Garantir valores padrão para stats
    const safeStats = {
        total: stats?.total || 0,
        draft: stats?.draft || 0,
        issued: stats?.issued || 0,
        total_amount: stats?.total_amount || 0
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState(filters?.status || '');

    const handleSearch = () => {
        router.get('/credit-notes', {
            search: searchTerm,
            status: filterStatus,
        }, {
            preserveState: true,
        });
    };

    const handleDelete = (creditNoteId) => {
        if (confirm('Deseja realmente excluir esta nota de crédito?')) {
            router.delete(`/credit-notes/${creditNoteId}`);
        }
    };

    const getStatusBadge = (status) => {
        const statuses = {
            draft: { label: 'Rascunho', color: 'bg-gray-100 text-gray-700' },
            issued: { label: 'Emitida', color: 'bg-blue-100 text-blue-700' },
            applied: { label: 'Aplicada', color: 'bg-green-100 text-green-700' },
            cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-700' },
        };
        const config = statuses[status] || statuses.draft;
        return (
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const getReasonLabel = (reason) => {
        const reasons = {
            product_return: 'Devolução de Produto',
            service_cancellation: 'Cancelamento de Serviço',
            billing_error: 'Erro de Faturação',
            discount: 'Desconto',
            damage: 'Dano/Avaria',
            other: 'Outro Motivo',
        };
        return reasons[reason] || reason;
    };

    return (
        <DashboardLayout>
            <Head title="Notas de Crédito" />

            <div className="p-6 ml-5 -mt-3 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Notas de Crédito</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Gestão de devoluções e créditos
                        </p>
                    </div>
                    <Link href="/credit-notes/create">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4" />
                            Nova Nota de Crédito
                        </motion.button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-white border rounded-lg border-slate-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Total</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-900">{safeStats.total}</p>
                            </div>
                            <FileDown className="w-12 h-12 text-blue-500" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-6 bg-white border rounded-lg border-slate-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Rascunho</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-900">{safeStats.draft}</p>
                            </div>
                            <FileDown className="w-12 h-12 text-gray-500" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 bg-white border rounded-lg border-slate-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Emitidas</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-900">{safeStats.issued}</p>
                            </div>
                            <FileDown className="w-12 h-12 text-blue-500" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-6 bg-white border rounded-lg border-slate-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Total Valor</p>
                                <p className="mt-2 text-2xl font-semibold text-slate-900">
                                    {Number(safeStats.total_amount).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MZN
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Filters and Search */}
                <div className="flex gap-4 p-4 bg-white border rounded-lg border-slate-200">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Buscar notas de crédito..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Todos os Status</option>
                        <option value="draft">Rascunho</option>
                        <option value="issued">Emitida</option>
                        <option value="applied">Aplicada</option>
                        <option value="cancelled">Cancelada</option>
                    </select>
                    <button
                        onClick={handleSearch}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <Search className="w-4 h-4" />
                        Buscar
                    </button>
                </div>

                {/* Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="overflow-hidden bg-white border rounded-lg border-slate-200"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b bg-slate-50 border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-xs font-medium text-left uppercase text-slate-600">Nº Nota</th>
                                    <th className="px-4 py-3 text-xs font-medium text-left uppercase text-slate-600">Cliente</th>
                                    <th className="px-4 py-3 text-xs font-medium text-left uppercase text-slate-600">Fatura</th>
                                    <th className="px-4 py-3 text-xs font-medium text-left uppercase text-slate-600">Data</th>
                                    <th className="px-4 py-3 text-xs font-medium text-left uppercase text-slate-600">Motivo</th>
                                    <th className="px-4 py-3 text-xs font-medium text-left uppercase text-slate-600">Status</th>
                                    <th className="px-4 py-3 text-xs font-medium text-right uppercase text-slate-600">Total</th>
                                    <th className="px-4 py-3 text-xs font-medium text-center uppercase text-slate-600">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {creditNotes.data?.map((creditNote) => (
                                    <tr key={creditNote.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-medium text-slate-900">{creditNote.credit_note_number}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-slate-900">{creditNote.client?.name}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-sm text-slate-600">{creditNote.invoice?.invoice_number}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-slate-600">
                                                {new Date(creditNote.issue_date).toLocaleDateString('pt-MZ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-slate-600">
                                                {getReasonLabel(creditNote.reason)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {getStatusBadge(creditNote.status)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-sm font-semibold text-slate-900">
                                                {Number(creditNote.total).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} {creditNote.currency}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link href={`/credit-notes/${creditNote.id}`}>
                                                    <button className="p-1 text-blue-600 rounded hover:bg-blue-50">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                                {creditNote.status === 'draft' && (
                                                    <Link href={`/credit-notes/${creditNote.id}/edit`}>
                                                        <button className="p-1 text-yellow-600 rounded hover:bg-yellow-50">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    </Link>
                                                )}
                                                <a href={`/credit-notes/${creditNote.id}/pdf`} target="_blank">
                                                    <button className="p-1 text-green-600 rounded hover:bg-green-50">
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </a>
                                                {creditNote.status !== 'applied' && (
                                                    <button
                                                        onClick={() => handleDelete(creditNote.id)}
                                                        className="p-1 text-red-600 rounded hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {/* {creditNotes.links && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
                            <div className="text-sm text-slate-600">
                                Mostrando {creditNotes.from} a {creditNotes.to} de {creditNotes.total} notas de crédito
                            </div>
                            <div className="flex gap-2">
                                {creditNotes.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`px-3 py-1 text-sm rounded ${
                                            link.active
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-slate-600 hover:bg-slate-100'
                                        } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )} */}
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
