import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ArrowLeft, Edit, FileText, Download, Send, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Show({ quote }) {
    const handleConvertToInvoice = () => {
        if (confirm('Deseja converter esta cotação em fatura?')) {
            router.post(`/quotes/${quote.id}/convert-to-invoice`);
        }
    };

    const handleDownloadPdf = () => {
        window.open(`/quotes/${quote.id}/pdf`, '_blank');
    };

    const handleSendEmail = () => {
        if (confirm(`Deseja enviar esta cotação para ${quote.client?.email || 'o cliente'}?`)) {
            router.post(`/quotes/${quote.id}/send-email`);
        }
    };

    const handleUpdateStatus = (newStatus) => {
        const statusLabels = {
            sent: 'Enviada',
            accepted: 'Aceita',
            rejected: 'Rejeitada',
            expired: 'Expirada',
        };

        if (confirm(`Deseja marcar esta cotação como ${statusLabels[newStatus]}?`)) {
            router.post(`/quotes/${quote.id}/update-status`, { status: newStatus });
        }
    };

    const getStatusBadge = (status) => {
        const statuses = {
            draft: { label: 'Rascunho', color: 'bg-gray-100 text-gray-700' },
            sent: { label: 'Enviada', color: 'bg-blue-100 text-blue-700' },
            viewed: { label: 'Visualizada', color: 'bg-indigo-100 text-indigo-700' },
            accepted: { label: 'Aceita', color: 'bg-green-100 text-green-700' },
            rejected: { label: 'Rejeitada', color: 'bg-red-100 text-red-700' },
            expired: { label: 'Expirada', color: 'bg-orange-100 text-orange-700' },
            converted: { label: 'Convertida', color: 'bg-purple-100 text-purple-700' },
        };
        const config = statuses[status] || statuses.draft;
        return (
            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-md ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const canConvert = quote.status === 'accepted' && !quote.invoice_id;
    const isExpired = new Date(quote.valid_until) < new Date() && !['accepted', 'rejected', 'converted'].includes(quote.status);

    return (
        <DashboardLayout>
            <Head title={`Cotação ${quote.quote_number}`} />

            <div className="p-6 ml-5 -mt-3 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/quotes">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </motion.button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-semibold text-slate-900">
                                    {quote.quote_number}
                                </h1>
                                {getStatusBadge(quote.status)}
                                {isExpired && (
                                    <span className="inline-flex px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-md">
                                        Expirada
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-sm text-slate-500">
                                {quote.title}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Botão Baixar PDF */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleDownloadPdf}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            PDF
                        </motion.button>

                        {/* Botão Enviar Email */}
                        {!['converted'].includes(quote.status) && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSendEmail}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                <Send className="w-4 h-4" />
                                Enviar Email
                            </motion.button>
                        )}

                        {/* Botão Editar */}
                        {['draft', 'sent'].includes(quote.status) && (
                            <Link href={`/quotes/${quote.id}/edit`}>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    Editar
                                </motion.button>
                            </Link>
                        )}

                        {/* Botão Aceitar (antes de enviar email) */}
                        {['draft', 'sent', 'viewed'].includes(quote.status) && !isExpired && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleUpdateStatus('accepted')}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Aceitar
                            </motion.button>
                        )}

                        {/* Botão Rejeitar (antes de enviar email) */}
                        {['draft', 'sent', 'viewed'].includes(quote.status) && !isExpired && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleUpdateStatus('rejected')}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <XCircle className="w-4 h-4" />
                                Rejeitar
                            </motion.button>
                        )}

                        {/* Botão Converter em Fatura (antes de enviar email) */}
                        {!quote.invoice_id && ['draft', 'sent', 'viewed', 'accepted'].includes(quote.status) && !isExpired && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleConvertToInvoice}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Converter em Fatura
                            </motion.button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Info Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 bg-white border rounded-lg border-slate-200"
                        >
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                Informações Gerais
                            </h3>
                            <dl className="grid grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm font-medium text-slate-600">Cliente</dt>
                                    <dd className="mt-1 text-sm text-slate-900">{quote.client?.name}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-slate-600">Data da Cotação</dt>
                                    <dd className="mt-1 text-sm text-slate-900">
                                        {new Date(quote.quote_date).toLocaleDateString('pt-MZ')}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-slate-600">Válido Até</dt>
                                    <dd className={`mt-1 text-sm ${isExpired ? 'text-red-600 font-medium' : 'text-slate-900'}`}>
                                        {new Date(quote.valid_until).toLocaleDateString('pt-MZ')}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-slate-600">Moeda</dt>
                                    <dd className="mt-1 text-sm text-slate-900">{quote.currency}</dd>
                                </div>
                                {quote.payment_terms && (
                                    <div className="col-span-2">
                                        <dt className="text-sm font-medium text-slate-600">Condições de Pagamento</dt>
                                        <dd className="mt-1 text-sm text-slate-900">{quote.payment_terms}</dd>
                                    </div>
                                )}
                                {quote.description && (
                                    <div className="col-span-2">
                                        <dt className="text-sm font-medium text-slate-600">Descrição</dt>
                                        <dd className="mt-1 text-sm text-slate-900">{quote.description}</dd>
                                    </div>
                                )}
                            </dl>
                        </motion.div>

                        {/* Items */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white border rounded-lg border-slate-200 overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-900">
                                    Itens da Cotação
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-xs font-medium text-left text-slate-600 uppercase">Serviço</th>
                                            <th className="px-4 py-3 text-xs font-medium text-center text-slate-600 uppercase">Qtd</th>
                                            <th className="px-4 py-3 text-xs font-medium text-right text-slate-600 uppercase">Preço Unit.</th>
                                            <th className="px-4 py-3 text-xs font-medium text-right text-slate-600 uppercase">Subtotal</th>
                                            <th className="px-4 py-3 text-xs font-medium text-right text-slate-600 uppercase">IVA</th>
                                            <th className="px-4 py-3 text-xs font-medium text-right text-slate-600 uppercase">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {quote.items?.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3">
                                                    <p className="text-sm font-medium text-slate-900">{item.service_name}</p>
                                                    {item.description && (
                                                        <p className="text-xs text-slate-500">{item.description}</p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-center text-slate-900">
                                                    {Number(item.quantity).toFixed(2)} {item.unit}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right text-slate-900">
                                                    {Number(item.unit_price).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right text-slate-900">
                                                    {Number(item.subtotal).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right text-slate-600">
                                                    {Number(item.tax_amount).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-semibold text-right text-slate-900">
                                                    {Number(item.total).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
                                <dl className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <dt className="text-slate-600">Subtotal</dt>
                                        <dd className="font-medium text-slate-900">
                                            {Number(quote.subtotal).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} {quote.currency}
                                        </dd>
                                    </div>
                                    {quote.discount_amount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <dt className="text-slate-600">
                                                Desconto ({quote.discount_percentage}%)
                                            </dt>
                                            <dd className="font-medium text-red-600">
                                                - {Number(quote.discount_amount).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} {quote.currency}
                                            </dd>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <dt className="text-slate-600">IVA Total</dt>
                                        <dd className="font-medium text-slate-900">
                                            {Number(quote.tax_amount).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} {quote.currency}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between pt-2 text-base border-t border-slate-300">
                                        <dt className="font-semibold text-slate-900">Total</dt>
                                        <dd className="text-2xl font-bold text-slate-900">
                                            {Number(quote.total).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} {quote.currency}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </motion.div>

                        {/* Terms and Notes */}
                        {(quote.terms || quote.customer_notes) && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="p-6 bg-white border rounded-lg border-slate-200 space-y-4"
                            >
                                {quote.terms && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-900 mb-2">Termos e Condições</h4>
                                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{quote.terms}</p>
                                    </div>
                                )}
                                {quote.customer_notes && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-900 mb-2">Notas para o Cliente</h4>
                                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{quote.customer_notes}</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Converted Invoice */}
                        {quote.invoice_id && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="w-5 h-5 text-purple-600" />
                                    <h3 className="font-semibold text-purple-900">Convertida em Fatura</h3>
                                </div>
                                <p className="text-sm text-purple-700 mb-3">
                                    Esta cotação foi convertida em fatura em {new Date(quote.converted_at).toLocaleDateString('pt-MZ')}
                                </p>
                                <Link href={`/invoices/${quote.invoice_id}`}>
                                    <button className="w-full px-3 py-2 text-sm font-medium text-purple-700 bg-white border border-purple-200 rounded-md hover:bg-purple-100 transition-colors">
                                        Ver Fatura
                                    </button>
                                </Link>
                            </motion.div>
                        )}

                        {/* Created by */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-4 bg-white border rounded-lg border-slate-200"
                        >
                            <h3 className="text-sm font-semibold text-slate-900 mb-3">Informações Adicionais</h3>
                            <dl className="space-y-2">
                                <div>
                                    <dt className="text-xs text-slate-600">Criado por</dt>
                                    <dd className="text-sm font-medium text-slate-900">{quote.created_by?.name || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-slate-600">Criado em</dt>
                                    <dd className="text-sm text-slate-900">
                                        {new Date(quote.created_at).toLocaleDateString('pt-MZ')}
                                    </dd>
                                </div>
                                {quote.shipment && (
                                    <div>
                                        <dt className="text-xs text-slate-600">Processo</dt>
                                        <dd className="text-sm font-mono text-slate-900">{quote.shipment.shipment_number}</dd>
                                    </div>
                                )}
                            </dl>
                        </motion.div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
