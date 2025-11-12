import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    ArrowLeft,
    FileText,
    Download,
    Mail,
    DollarSign,
    User,
    Package,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
    Building2,
    Phone,
    MapPin,
    Ship,
    X
} from 'lucide-react';

export default function QuotationShow({ invoice }) {
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentData, setPaymentData] = useState({
        payment_date: new Date().toISOString().split('T')[0],
        payment_reference: '',
        notes: ''
    });



    // Mapeamento de categorias

    const categoryMap = {

        'Tipo de Container': 'Shipping Line Charges',

        'Tipo de Mercadoria': 'Port Charges',

        'Regime': 'Customs Charges',

        'Destino': 'Transport',

        'Serviço Adicional': 'Agency Services and Extra Charges'

    };



    const getMappedCategory = (category) => {

        return categoryMap[category] || category || 'Geral';

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
            month: 'long',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status, dueDate) => {
        const isOverdue = status === 'pending' && new Date(dueDate) < new Date();

        if (isOverdue) {
            return (
                <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-800 bg-red-100 rounded-full">
                    <AlertCircle className="w-5 h-5" />
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
            }
        };

        const badge = badges[status] || badges.pending;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full ${badge.class}`}>
                <Icon className="w-5 h-5" />
                {badge.label}
            </span>
        );
    };

    const handleSendEmail = () => {
        if (confirm(`Enviar fatura ${invoice.invoice_number} por email para ${invoice.shipment?.client?.email}?`)) {
            router.post(`/invoices/quotations/${invoice.id}/send-email`, {}, {
                preserveScroll: true,
            });
        }
    };

    const handleMarkAsPaid = (e) => {
        e.preventDefault();

        router.post(`/invoices/quotations/${invoice.id}/mark-paid`, paymentData, {
            onSuccess: () => {
                setPaymentModalOpen(false);
                setPaymentData({
                    payment_date: new Date().toISOString().split('T')[0],
                    payment_reference: '',
                    notes: ''
                });
            },
            preserveScroll: true,
        });
    };

    return (
        <DashboardLayout>
            <Head title={`Fatura ${invoice.invoice_number}`} />

            <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/invoices/quotations"
                        className="inline-flex items-center gap-2 mb-4 text-sm transition-colors text-slate-600 hover:text-slate-900"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para Faturas
                    </Link>

                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <h1 className="text-3xl font-bold text-slate-900">
                                    {invoice.invoice_number}
                                </h1>
                                {getStatusBadge(invoice.status, invoice.due_date)}
                            </div>
                            <p className="text-slate-600">
                                Fatura gerada da cotação {invoice.metadata?.quotation_reference}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <a
                                href={`/invoices/quotations/${invoice.id}/pdf`}
                                target="_blank"
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                            >
                                <Download className="w-4 h-4" />
                                Baixar PDF
                            </a>

                            <button
                                onClick={handleSendEmail}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700"
                            >
                                <Mail className="w-4 h-4" />
                                Enviar Email
                            </button>

                            {invoice.status === 'pending' && (
                                <button
                                    onClick={() => setPaymentModalOpen(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                                >
                                    <DollarSign className="w-4 h-4" />
                                    Marcar Como Paga
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column - Details */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Client Information */}
                        <div className="p-6 bg-white border rounded-xl border-slate-200">
                            <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-slate-900">
                                <User className="w-5 h-5 text-slate-600" />
                                Informações do Cliente
                            </h2>

                            <div className="space-y-3">
                                <div>
                                    <label className="block mb-1 text-xs font-medium uppercase text-slate-500">
                                        Nome/Empresa
                                    </label>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {invoice.shipment?.client?.company_name || invoice.shipment?.client?.name}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {invoice.shipment?.client?.email && (
                                        <div>
                                            <label className="block mb-1 text-xs font-medium uppercase text-slate-500">
                                                Email
                                            </label>
                                            <div className="flex items-center gap-2 text-sm text-slate-900">
                                                <Mail className="w-4 h-4 text-slate-400" />
                                                <a href={`mailto:${invoice.shipment.client.email}`} className="hover:text-blue-600">
                                                    {invoice.shipment.client.email}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {invoice.shipment?.client?.phone && (
                                        <div>
                                            <label className="block mb-1 text-xs font-medium uppercase text-slate-500">
                                                Telefone
                                            </label>
                                            <div className="flex items-center gap-2 text-sm text-slate-900">
                                                <Phone className="w-4 h-4 text-slate-400" />
                                                {invoice.shipment.client.phone}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {invoice.shipment?.client?.address && (
                                    <div>
                                        <label className="block mb-1 text-xs font-medium uppercase text-slate-500">
                                            Endereço
                                        </label>
                                        <div className="flex items-start gap-2 text-sm text-slate-900">
                                            <MapPin className="w-4 h-4 mt-0.5 text-slate-400" />
                                            {invoice.shipment.client.address}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Invoice Items */}
                        <div className="p-6 bg-white border rounded-xl border-slate-200">
                            <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-slate-900">
                                <FileText className="w-5 h-5 text-slate-600" />
                                Detalhes da Cotação
                            </h2>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-700">
                                                Descrição
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-700">
                                                Categoria
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-center uppercase text-slate-700">
                                                Qtd
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold tracking-wider text-right uppercase text-slate-700">
                                                Valor
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {invoice.items && invoice.items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3 text-sm text-slate-900">
                                                    {item.description}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                                                       {getMappedCategory(item.metadata?.category)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-center text-slate-900">
                                                    {item.quantity}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-semibold text-right text-slate-900">
                                                    {formatCurrency(item.amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="pt-4 mt-4 space-y-2 border-t border-slate-200">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Subtotal:</span>
                                    <span className="font-semibold text-slate-900">
                                        {formatCurrency(invoice.subtotal)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">IVA (16%):</span>
                                    <span className="font-semibold text-slate-900">
                                        {formatCurrency(invoice.tax_amount)}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-slate-200">
                                    <span className="text-base font-bold text-slate-900">TOTAL:</span>
                                    <span className="text-2xl font-bold text-blue-600">
                                        {formatCurrency(invoice.amount)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Terms */}
                        {invoice.terms && (
                            <div className="p-6 bg-white border rounded-xl border-slate-200">
                                <h3 className="mb-2 text-sm font-semibold text-slate-900">Termos de Pagamento</h3>
                                <p className="text-sm text-slate-600">{invoice.terms}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Process Info */}
                        <div className="p-6 bg-white border rounded-xl border-slate-200">
                            <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-slate-900">
                                <Package className="w-5 h-5 text-slate-600" />
                                Processo
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="block mb-1 text-xs font-medium uppercase text-slate-500">
                                        Número de Referência
                                    </label>
                                    <Link
                                        href={`/shipments/${invoice.shipment?.id}`}
                                        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                                    >
                                        {invoice.shipment?.reference_number}
                                    </Link>
                                </div>

                                {invoice.shipment?.shipping_line && (
                                    <div>
                                        <label className="block mb-1 text-xs font-medium uppercase text-slate-500">
                                            Linha de Navegação
                                        </label>
                                        <div className="flex items-center gap-2 text-sm text-slate-900">
                                            <Ship className="w-4 h-4 text-slate-400" />
                                            {invoice.shipment.shipping_line.name}
                                        </div>
                                    </div>
                                )}

                                {invoice.shipment?.container_number && (
                                    <div>
                                        <label className="block mb-1 text-xs font-medium uppercase text-slate-500">
                                            Container
                                        </label>
                                        <p className="font-mono text-sm text-slate-900">
                                            {invoice.shipment.container_number}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="p-6 bg-white border rounded-xl border-slate-200">
                            <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-slate-900">
                                <Calendar className="w-5 h-5 text-slate-600" />
                                Datas
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="block mb-1 text-xs font-medium uppercase text-slate-500">
                                        Data de Emissão
                                    </label>
                                    <p className="text-sm text-slate-900">{formatDate(invoice.issue_date)}</p>
                                </div>

                                <div>
                                    <label className="block mb-1 text-xs font-medium uppercase text-slate-500">
                                        Data de Vencimento
                                    </label>
                                    <p className="text-sm text-slate-900">{formatDate(invoice.due_date)}</p>
                                </div>

                                {invoice.payment_date && (
                                    <div>
                                        <label className="block mb-1 text-xs font-medium uppercase text-slate-500">
                                            Data de Pagamento
                                        </label>
                                        <p className="text-sm font-semibold text-green-600">{formatDate(invoice.payment_date)}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Information */}
                        {invoice.status === 'paid' && (
                            <div className="p-6 border border-green-200 rounded-xl bg-gradient-to-br from-green-50 to-green-100">
                                <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-green-900">
                                    <CheckCircle className="w-5 h-5 text-green-700" />
                                    Pagamento Confirmado
                                </h3>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block mb-1 text-xs font-medium text-green-700 uppercase">
                                            Data do Pagamento
                                        </label>
                                        <p className="text-sm font-semibold text-green-900">
                                            {formatDate(invoice.payment_date)}
                                        </p>
                                    </div>

                                    {invoice.payment_reference && (
                                        <div>
                                            <label className="block mb-1 text-xs font-medium text-green-700 uppercase">
                                                Referência
                                            </label>
                                            <p className="font-mono text-sm font-semibold text-green-900">
                                                {invoice.payment_reference}
                                            </p>
                                        </div>
                                    )}

                                    {invoice.notes && (
                                        <div>
                                            <label className="block mb-1 text-xs font-medium text-green-700 uppercase">
                                                Observações
                                            </label>
                                            <p className="text-sm text-green-900">
                                                {invoice.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Created By */}
                        {invoice.created_by && (
                            <div className="p-4 rounded-lg bg-slate-50">
                                <p className="text-xs text-slate-500">
                                    Fatura criada por <span className="font-semibold">{invoice.created_by.name}</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {paymentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-md p-6 bg-white rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-900">Marcar Fatura Como Paga</h2>
                            <button
                                onClick={() => setPaymentModalOpen(false)}
                                className="p-1 transition-colors rounded-lg hover:bg-slate-100"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleMarkAsPaid} className="space-y-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    Data do Pagamento *
                                </label>
                                <input
                                    type="date"
                                    value={paymentData.payment_date}
                                    onChange={(e) => setPaymentData({ ...paymentData, payment_date: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    Referência do Pagamento
                                </label>
                                <input
                                    type="text"
                                    value={paymentData.payment_reference}
                                    onChange={(e) => setPaymentData({ ...paymentData, payment_reference: e.target.value })}
                                    placeholder="Ex: TRANSF-123456, MPESA-789"
                                    className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    Observações
                                </label>
                                <textarea
                                    value={paymentData.notes}
                                    onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                                    rows="3"
                                    placeholder="Notas adicionais sobre o pagamento..."
                                    className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                />
                            </div>

                            <div className="p-4 rounded-lg bg-slate-50">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-slate-600">Valor da Fatura:</span>
                                    <span className="text-lg font-bold text-slate-900">
                                        {formatCurrency(invoice.amount)}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500">
                                    Esta fatura será marcada como paga e o cliente receberá uma confirmação por email.
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPaymentModalOpen(false)}
                                    className="flex-1 px-4 py-2 font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                                >
                                    Confirmar Pagamento
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
