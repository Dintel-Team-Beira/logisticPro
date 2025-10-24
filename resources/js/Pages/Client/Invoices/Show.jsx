import { Head, Link } from '@inertiajs/react';
import ClientPortalLayout from '@/Layouts/ClientPortalLayout';
import { ArrowLeft, DollarSign, Download, Package, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InvoiceShow({ invoice }) {
    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        paid: 'bg-green-100 text-green-800 border-green-300',
        overdue: 'bg-red-100 text-red-800 border-red-300',
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: 'MZN'
        }).format(value);
    };

    return (
        <ClientPortalLayout>
            <Head title={`Fatura ${invoice.invoice_number}`} />

            {/* Back Button */}
            <Link
                href="/client/invoices"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-[#358c9c] mb-6 font-medium"
            >
                <ArrowLeft className="h-4 w-4" />
                Voltar para faturas
            </Link>

            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{invoice.invoice_number}</h1>
                        {invoice.shipment && (
                            <Link
                                href={`/client/shipments/${invoice.shipment.id}`}
                                className="text-gray-600 hover:text-[#358c9c] flex items-center gap-2"
                            >
                                <Package className="h-4 w-4" />
                                <span>{invoice.shipment.reference_number}</span>
                            </Link>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-4 py-2 rounded-lg text-sm font-medium border-2 ${statusColors[invoice.status]}`}>
                            {invoice.status === 'paid' ? 'Paga' : 'Pendente'}
                        </span>
                        <button className="px-4 py-2 bg-[#358c9c] text-white rounded-lg hover:bg-[#246a77] transition-colors flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Download PDF
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Detalhes da Fatura</h2>

                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Data de Emissão</p>
                                <p className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    {invoice.issue_date}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Data de Vencimento</p>
                                <p className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    {invoice.due_date}
                                </p>
                            </div>
                            {invoice.paid_date && (
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500 mb-1">Data de Pagamento</p>
                                    <p className="font-semibold text-green-600 flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        {invoice.paid_date}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Items */}
                        {invoice.items && invoice.items.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-4">Itens da Fatura</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="text-left p-3 text-sm font-semibold text-gray-700">Descrição</th>
                                                <th className="text-right p-3 text-sm font-semibold text-gray-700">Qtd</th>
                                                <th className="text-right p-3 text-sm font-semibold text-gray-700">Preço Unit.</th>
                                                <th className="text-right p-3 text-sm font-semibold text-gray-700">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {invoice.items.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="p-3 text-sm text-gray-900">{item.description}</td>
                                                    <td className="p-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                                                    <td className="p-3 text-sm text-gray-900 text-right">
                                                        {formatCurrency(item.unit_price)}
                                                    </td>
                                                    <td className="p-3 text-sm font-medium text-gray-900 text-right">
                                                        {formatCurrency(item.quantity * item.unit_price)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    {invoice.notes && (
                        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-2">Observações</h3>
                            <p className="text-sm text-gray-700">{invoice.notes}</p>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Totals */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Resumo Financeiro</h3>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium text-gray-900">
                                    {formatCurrency(invoice.amount)}
                                </span>
                            </div>

                            {invoice.tax_amount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">IVA/Impostos</span>
                                    <span className="font-medium text-gray-900">
                                        {formatCurrency(invoice.tax_amount)}
                                    </span>
                                </div>
                            )}

                            <div className="border-t border-gray-200 pt-3">
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-900">Total</span>
                                    <span className="text-2xl font-bold text-[#358c9c]">
                                        {formatCurrency(invoice.total_amount || invoice.amount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    {invoice.status === 'pending' && (
                        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border border-orange-200 p-6">
                            <div className="flex items-start gap-3 mb-4">
                                <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Pagamento Pendente</h3>
                                    <p className="text-sm text-gray-700">
                                        Vence em: <strong>{invoice.due_date}</strong>
                                    </p>
                                </div>
                            </div>
                            <a
                                href="mailto:financeiro@logisticapro.com"
                                className="block w-full text-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                            >
                                Solicitar Informações de Pagamento
                            </a>
                        </div>
                    )}

                    {invoice.status === 'paid' && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Pagamento Confirmado</h3>
                                    <p className="text-sm text-gray-700">
                                        Esta fatura foi paga em {invoice.paid_date}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Support */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-3">Precisa de Ajuda?</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Entre em contato com nosso departamento financeiro para esclarecer dúvidas sobre esta fatura.
                        </p>
                        <a
                            href="mailto:financeiro@logisticapro.com"
                            className="block w-full text-center px-4 py-2 border-2 border-[#358c9c] text-[#358c9c] rounded-lg hover:bg-[#358c9c] hover:text-white transition-all font-medium"
                        >
                            Entrar em Contato
                        </a>
                    </div>
                </div>
            </div>
        </ClientPortalLayout>
    );
}
