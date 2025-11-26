import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { FileUp, Plus, Search, Download, Eye, Trash2, Edit } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Index({ debitNotes = { data: [] }, stats = {}, filters = {} }) {
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
        router.get('/debit-notes', {
            search: searchTerm,
            status: filterStatus,
        }, {
            preserveState: true,
        });
    };

    const handleDelete = (debitNoteId) => {
        if (confirm('Deseja realmente excluir esta nota de débito?')) {
            router.delete(`/debit-notes/${debitNoteId}`);
        }
    };

    const getStatusBadge = (status) => {
        const statuses = {
            draft: { label: 'Rascunho', color: 'bg-gray-100 text-gray-700' },
            issued: { label: 'Emitida', color: 'bg-orange-100 text-orange-700' },
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
            additional_charges: 'Custos Adicionais',
            late_fees: 'Juros de Mora',
            penalties: 'Multas',
            billing_correction: 'Correção de Faturação',
            exchange_difference: 'Diferença Cambial',
            other: 'Outro Motivo',
        };
        return reasons[reason] || reason;
    };

    return (
        <DashboardLayout>
            <Head title="Notas de Débito" />

            <div className="p-6 ml-5 -mt-3 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Notas de Débito</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Gestão de cobranças adicionais e ajustes
                        </p>
                    </div>
                    <Link href="/debit-notes/create">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Nova Nota de Débito
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
                            <FileUp className="w-12 h-12 text-orange-500" />
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
                            <FileUp className="w-12 h-12 text-gray-500" />
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
                            <FileUp className="w-12 h-12 text-orange-500" />
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
                            placeholder="Buscar notas de débito..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                        <option value="">Todos os Status</option>
                        <option value="draft">Rascunho</option>
                        <option value="issued">Emitida</option>
                        <option value="applied">Aplicada</option>
                        <option value="cancelled">Cancelada</option>
                    </select>
                    <button
                        onClick={handleSearch}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700"
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
                    className="bg-white border rounded-lg border-slate-200 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-xs font-medium text-left text-slate-600 uppercase">Nº Nota</th>
                                    <th className="px-4 py-3 text-xs font-medium text-left text-slate-600 uppercase">Cliente</th>
                                    <th className="px-4 py-3 text-xs font-medium text-left text-slate-600 uppercase">Fatura</th>
                                    <th className="px-4 py-3 text-xs font-medium text-left text-slate-600 uppercase">Data</th>
                                    <th className="px-4 py-3 text-xs font-medium text-left text-slate-600 uppercase">Motivo</th>
                                    <th className="px-4 py-3 text-xs font-medium text-left text-slate-600 uppercase">Status</th>
                                    <th className="px-4 py-3 text-xs font-medium text-right text-slate-600 uppercase">Total</th>
                                    <th className="px-4 py-3 text-xs font-medium text-center text-slate-600 uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {debitNotes.data?.map((debitNote) => (
                                    <tr key={debitNote.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-medium text-slate-900">{debitNote.debit_note_number}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-slate-900">{debitNote.client?.name}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-mono text-slate-600">{debitNote.invoice?.invoice_number}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-slate-600">
                                                {new Date(debitNote.issue_date).toLocaleDateString('pt-MZ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-slate-600">
                                                {getReasonLabel(debitNote.reason)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {getStatusBadge(debitNote.status)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-sm font-semibold text-slate-900">
                                                {Number(debitNote.total).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} {debitNote.currency}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link href={`/debit-notes/${debitNote.id}`}>
                                                    <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                                {debitNote.status === 'draft' && (
                                                    <Link href={`/debit-notes/${debitNote.id}/edit`}>
                                                        <button className="p-1 text-yellow-600 hover:bg-yellow-50 rounded">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    </Link>
                                                )}
                                                <a href={`/debit-notes/${debitNote.id}/pdf`} target="_blank">
                                                    <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </a>
                                                {debitNote.status !== 'applied' && (
                                                    <button
                                                        onClick={() => handleDelete(debitNote.id)}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
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
                    {debitNotes.links && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
                            <div className="text-sm text-slate-600">
                                Mostrando {debitNotes.from} a {debitNotes.to} de {debitNotes.total} notas de débito
                            </div>
                            <div className="flex gap-2">
                                {debitNotes.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`px-3 py-1 text-sm rounded ${
                                            link.active
                                                ? 'bg-orange-600 text-white'
                                                : 'bg-white text-slate-600 hover:bg-slate-100'
                                        } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
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
