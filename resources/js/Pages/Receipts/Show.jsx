import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Receipt, ArrowLeft, Download, Trash2, FileText, User, Calendar, CreditCard, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Show({ receipt }) {
    const handleDelete = () => {
        if (confirm('Deseja realmente excluir este recibo?')) {
            router.delete(`/receipts/${receipt.id}`);
        }
    };

    const getPaymentMethodInfo = (method) => {
        const methods = {
            cash: { label: 'Dinheiro', color: 'bg-green-100 text-green-700', icon: DollarSign },
            bank_transfer: { label: 'Transferência Bancária', color: 'bg-blue-100 text-blue-700', icon: CreditCard },
            cheque: { label: 'Cheque', color: 'bg-purple-100 text-purple-700', icon: FileText },
            mpesa: { label: 'M-Pesa', color: 'bg-red-100 text-red-700', icon: CreditCard },
            emola: { label: 'E-Mola', color: 'bg-orange-100 text-orange-700', icon: CreditCard },
            credit_card: { label: 'Cartão de Crédito', color: 'bg-indigo-100 text-indigo-700', icon: CreditCard },
            debit_card: { label: 'Cartão de Débito', color: 'bg-cyan-100 text-cyan-700', icon: CreditCard },
            other: { label: 'Outro', color: 'bg-gray-100 text-gray-700', icon: DollarSign },
        };
        return methods[method] || methods.other;
    };

    const methodInfo = getPaymentMethodInfo(receipt.payment_method);
    const MethodIcon = methodInfo.icon;

    return (
        <DashboardLayout>
            <Head title={`Recibo ${receipt.receipt_number}`} />

            <div className="p-6 ml-5 -mt-3 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/receipts">
                            <button className="p-2 transition-colors rounded-lg hover:bg-slate-100">
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900">{receipt.receipt_number}</h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Comprovante de pagamento
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <a href={`/receipts/${receipt.id}/pdf`} target="_blank">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                            >
                                <Download className="w-4 h-4" />
                                Baixar PDF
                            </motion.button>
                        </a>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleDelete}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                        >
                            <Trash2 className="w-4 h-4" />
                            Excluir
                        </motion.button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column - Receipt Details */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Receipt Info Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 bg-white border rounded-lg border-slate-200"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">Informações do Recibo</h2>
                                    <p className="text-sm text-slate-500">Detalhes do pagamento recebido</p>
                                </div>
                                <Receipt className="w-12 h-12 text-blue-500" />
                            </div>

                            <div className="space-y-4">
                                {/* Payment Amount */}
                                <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                                    <div className="text-sm font-medium text-blue-600">Valor Pago</div>
                                    <div className="text-3xl font-bold text-blue-900">
                                        {Number(receipt.amount).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} {receipt.currency}
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm font-medium text-slate-600">Método de Pagamento</div>
                                        <div className="mt-1">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-lg ${methodInfo.color}`}>
                                                <MethodIcon className="w-4 h-4" />
                                                {methodInfo.label}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-slate-600">Data do Pagamento</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span className="text-slate-900">
                                                {new Date(receipt.payment_date).toLocaleDateString('pt-MZ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Reference */}
                                {receipt.payment_reference && (
                                    <div>
                                        <div className="text-sm font-medium text-slate-600">Referência de Pagamento</div>
                                        <div className="px-3 py-2 mt-1 font-mono text-sm border rounded-lg bg-slate-50 text-slate-900 border-slate-200">
                                            {receipt.payment_reference}
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                {receipt.notes && (
                                    <div>
                                        <div className="text-sm font-medium text-slate-600">Notas / Observações</div>
                                        <div className="px-3 py-2 mt-1 text-sm border rounded-lg bg-slate-50 text-slate-700 border-slate-200">
                                            {receipt.notes}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Invoice Reference Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-6 bg-white border rounded-lg border-slate-200"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">Fatura Relacionada</h2>
                                    <p className="text-sm text-slate-500">Fatura paga com este recibo</p>
                                </div>
                                <FileText className="w-8 h-8 text-blue-500" />
                            </div>

                            <div className="p-4 border rounded-lg bg-slate-50 border-slate-200">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs font-medium text-slate-500">Número da Fatura</div>
                                        <Link href={`/invoices/${receipt.invoice?.id}`}>
                                            <div className="mt-1 text-sm font-semibold text-blue-600 hover:text-blue-700">
                                                {receipt.invoice?.invoice_number}
                                            </div>
                                        </Link>
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium text-slate-500">Valor da Fatura</div>
                                        <div className="mt-1 text-sm font-semibold text-slate-900">
                                            {Number(receipt.invoice?.amount).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} {receipt.invoice?.currency}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium text-slate-500">Status</div>
                                        <div className="mt-1">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded capitalize ${
                                                receipt.invoice?.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                receipt.invoice?.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-slate-100 text-slate-700'
                                            }`}>
                                                {receipt.invoice?.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium text-slate-500">Data de Emissão</div>
                                        <div className="mt-1 text-sm text-slate-700">
                                            {new Date(receipt.invoice?.issue_date).toLocaleDateString('pt-MZ')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Client & Metadata */}
                    <div className="space-y-6">
                        {/* Client Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-6 bg-white border rounded-lg border-slate-200"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                                    <User className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-slate-600">Cliente</h3>
                                    <Link href={`/clients/${receipt.client?.id}`}>
                                        <p className="text-lg font-semibold text-blue-600 hover:text-blue-700">
                                            {receipt.client?.name}
                                        </p>
                                    </Link>
                                </div>
                            </div>

                            {receipt.client?.email && (
                                <div className="pt-3 mt-3 border-t border-slate-200">
                                    <div className="text-xs font-medium text-slate-500">Email</div>
                                    <div className="mt-1 text-sm text-slate-700">{receipt.client.email}</div>
                                </div>
                            )}

                            {receipt.client?.phone && (
                                <div className="pt-3 mt-3 border-t border-slate-200">
                                    <div className="text-xs font-medium text-slate-500">Telefone</div>
                                    <div className="mt-1 text-sm text-slate-700">{receipt.client.phone}</div>
                                </div>
                            )}
                        </motion.div>

                        {/* Metadata Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-6 bg-white border rounded-lg border-slate-200"
                        >
                            <h3 className="mb-4 text-sm font-semibold text-slate-900">Informações do Sistema</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <div className="text-xs font-medium text-slate-500">Criado por</div>
                                    <div className="mt-1 text-slate-700">{receipt.created_by_user?.name || 'Sistema'}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-slate-500">Data de Criação</div>
                                    <div className="mt-1 text-slate-700">
                                        {new Date(receipt.created_at).toLocaleString('pt-MZ')}
                                    </div>
                                </div>
                                {receipt.updated_at !== receipt.created_at && (
                                    <div>
                                        <div className="text-xs font-medium text-slate-500">Última Atualização</div>
                                        <div className="mt-1 text-slate-700">
                                            {new Date(receipt.updated_at).toLocaleString('pt-MZ')}
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
