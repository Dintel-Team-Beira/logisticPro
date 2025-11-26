import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { FileDown, ArrowLeft, Download, Trash2, Edit, FileText, User, Calendar, Tag, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Show({ creditNote }) {
    const handleDelete = () => {
        if (confirm('Deseja realmente excluir esta nota de crédito?')) {
            router.delete(`/credit-notes/${creditNote.id}`);
        }
    };

    const handleStatusChange = (newStatus) => {
        if (confirm(`Alterar status para "${getStatusLabel(newStatus)}"?`)) {
            router.post(`/credit-notes/${creditNote.id}/status`, {
                status: newStatus
            });
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
            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-lg ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const getStatusLabel = (status) => {
        const labels = {
            draft: 'Rascunho',
            issued: 'Emitida',
            applied: 'Aplicada',
            cancelled: 'Cancelada',
        };
        return labels[status] || status;
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

    const nextStatuses = {
        draft: ['issued', 'cancelled'],
        issued: ['applied', 'cancelled'],
        applied: [],
        cancelled: [],
    };

    return (
        <DashboardLayout>
            <Head title={`Nota de Crédito ${creditNote.credit_note_number}`} />

            <div className="p-6 ml-5 -mt-3 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/credit-notes">
                            <button className="p-2 transition-colors rounded-lg hover:bg-slate-100">
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900">{creditNote.credit_note_number}</h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Nota de crédito
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {creditNote.status === 'draft' && (
                            <Link href={`/credit-notes/${creditNote.id}/edit`}>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700"
                                >
                                    <Edit className="w-4 h-4" />
                                    Editar
                                </motion.button>
                            </Link>
                        )}
                        <a href={`/credit-notes/${creditNote.id}/pdf`} target="_blank">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                            >
                                <Download className="w-4 h-4" />
                                Baixar PDF
                            </motion.button>
                        </a>
                        {creditNote.status !== 'applied' && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleDelete}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                            >
                                <Trash2 className="w-4 h-4" />
                                Excluir
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column - Credit Note Details */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Credit Note Info Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 bg-white border rounded-lg border-slate-200"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">Informações da Nota</h2>
                                    <p className="text-sm text-slate-500">Detalhes da nota de crédito</p>
                                </div>
                                <FileDown className="w-12 h-12 text-blue-500" />
                            </div>

                            <div className="space-y-4">
                                {/* Status & Amount */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm font-medium text-slate-600">Status</div>
                                        <div className="mt-1">
                                            {getStatusBadge(creditNote.status)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-slate-600">Total</div>
                                        <div className="mt-1 text-2xl font-bold text-blue-600">
                                            {Number(creditNote.total).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} {creditNote.currency}
                                        </div>
                                    </div>
                                </div>

                                {/* Reason & Date */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm font-medium text-slate-600">Motivo</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Tag className="w-4 h-4 text-slate-400" />
                                            <span className="text-slate-900">{getReasonLabel(creditNote.reason)}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-slate-600">Data de Emissão</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span className="text-slate-900">
                                                {new Date(creditNote.issue_date).toLocaleDateString('pt-MZ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Reason Description */}
                                {creditNote.reason_description && (
                                    <div>
                                        <div className="text-sm font-medium text-slate-600">Descrição do Motivo</div>
                                        <div className="px-3 py-2 mt-1 text-sm border rounded-lg bg-slate-50 text-slate-700 border-slate-200">
                                            {creditNote.reason_description}
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                {creditNote.notes && (
                                    <div>
                                        <div className="text-sm font-medium text-slate-600">Notas / Observações</div>
                                        <div className="px-3 py-2 mt-1 text-sm border rounded-lg bg-slate-50 text-slate-700 border-slate-200">
                                            {creditNote.notes}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Items Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-6 bg-white border rounded-lg border-slate-200"
                        >
                            <h2 className="mb-4 text-lg font-semibold text-slate-900">Itens</h2>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3 text-xs font-medium text-left text-slate-600 uppercase">Descrição</th>
                                            <th className="px-4 py-3 text-xs font-medium text-right text-slate-600 uppercase">Qtd</th>
                                            <th className="px-4 py-3 text-xs font-medium text-right text-slate-600 uppercase">Preço Unit</th>
                                            <th className="px-4 py-3 text-xs font-medium text-right text-slate-600 uppercase">IVA %</th>
                                            <th className="px-4 py-3 text-xs font-medium text-right text-slate-600 uppercase">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {creditNote.items?.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-3 text-sm text-slate-900">{item.description}</td>
                                                <td className="px-4 py-3 text-sm text-right text-slate-600">{item.quantity}</td>
                                                <td className="px-4 py-3 text-sm text-right text-slate-600">
                                                    {Number(item.unit_price).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right text-slate-600">{item.tax_rate}%</td>
                                                <td className="px-4 py-3 text-sm font-semibold text-right text-slate-900">
                                                    {Number(item.total).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="mt-6 pt-4 border-t-2 border-slate-200">
                                <div className="grid grid-cols-2 gap-3 max-w-md ml-auto">
                                    <div className="text-sm font-medium text-slate-600">Subtotal:</div>
                                    <div className="text-sm font-semibold text-right text-slate-900">
                                        {Number(creditNote.subtotal).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} {creditNote.currency}
                                    </div>
                                    <div className="text-sm font-medium text-slate-600">IVA:</div>
                                    <div className="text-sm font-semibold text-right text-slate-900">
                                        {Number(creditNote.tax_amount).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} {creditNote.currency}
                                    </div>
                                    <div className="text-base font-bold text-slate-900">Total:</div>
                                    <div className="text-base font-bold text-right text-blue-600">
                                        {Number(creditNote.total).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} {creditNote.currency}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Invoice Reference Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-6 bg-white border rounded-lg border-slate-200"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">Fatura Relacionada</h2>
                                    <p className="text-sm text-slate-500">Fatura original</p>
                                </div>
                                <FileText className="w-8 h-8 text-blue-500" />
                            </div>

                            <div className="p-4 border rounded-lg bg-slate-50 border-slate-200">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs font-medium text-slate-500">Número da Fatura</div>
                                        <Link href={`/invoices/${creditNote.invoice?.id}`}>
                                            <div className="mt-1 text-sm font-semibold text-blue-600 hover:text-blue-700">
                                                {creditNote.invoice?.invoice_number}
                                            </div>
                                        </Link>
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium text-slate-500">Valor da Fatura</div>
                                        <div className="mt-1 text-sm font-semibold text-slate-900">
                                            {Number(creditNote.invoice?.amount).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} {creditNote.invoice?.currency}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Client & Actions */}
                    <div className="space-y-6">
                        {/* Client Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-6 bg-white border rounded-lg border-slate-200"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                                    <User className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-slate-600">Cliente</h3>
                                    <Link href={`/clients/${creditNote.client?.id}`}>
                                        <p className="text-lg font-semibold text-blue-600 hover:text-blue-700">
                                            {creditNote.client?.name}
                                        </p>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>

                        {/* Status Actions Card */}
                        {nextStatuses[creditNote.status]?.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="p-6 bg-white border rounded-lg border-slate-200"
                            >
                                <h3 className="mb-4 text-sm font-semibold text-slate-900 flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4" />
                                    Alterar Status
                                </h3>
                                <div className="space-y-2">
                                    {nextStatuses[creditNote.status].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusChange(status)}
                                            className="w-full px-4 py-2 text-sm font-medium text-left transition-colors border rounded-lg text-slate-700 bg-white border-slate-300 hover:bg-slate-50"
                                        >
                                            Marcar como "{getStatusLabel(status)}"
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Metadata Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="p-6 bg-white border rounded-lg border-slate-200"
                        >
                            <h3 className="mb-4 text-sm font-semibold text-slate-900">Informações do Sistema</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <div className="text-xs font-medium text-slate-500">Criado por</div>
                                    <div className="mt-1 text-slate-700">{creditNote.created_by_user?.name || 'Sistema'}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-slate-500">Data de Criação</div>
                                    <div className="mt-1 text-slate-700">
                                        {new Date(creditNote.created_at).toLocaleString('pt-MZ')}
                                    </div>
                                </div>
                                {creditNote.updated_at !== creditNote.created_at && (
                                    <div>
                                        <div className="text-xs font-medium text-slate-500">Última Atualização</div>
                                        <div className="mt-1 text-slate-700">
                                            {new Date(creditNote.updated_at).toLocaleString('pt-MZ')}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
