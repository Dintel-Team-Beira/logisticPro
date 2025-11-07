import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    ArrowLeft,
    Download,
    Printer,
    MoreVertical,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Building2,
    Mail,
    Phone,
    MapPin
} from 'lucide-react';

/**
 * Página de Visualização de Fatura
 * Layout profissional com todos os detalhes da fatura
 */
export default function InvoiceShow({ invoice }) {
    const [showStatusMenu, setShowStatusMenu] = useState(false);

    const formatCurrency = (amount, currency = 'USD') => {
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const handleStatusChange = (newStatus) => {
        if (confirm(`Tem certeza que deseja mudar o status para "${getStatusLabel(newStatus)}"?`)) {
            router.post(`/invoices/${invoice.id}/update-status`, {
                status: newStatus,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setShowStatusMenu(false);
                }
            });
        }
    };

    const handleDownload = () => {
        window.location.href = `/invoices/${invoice.shipment_id}/download`;
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <DashboardLayout>
            <Head title={`Fatura ${invoice.invoice_number}`} />

            <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">
                {/* Header Actions - Não imprime */}
                <div className="flex items-center justify-between print:hidden">
                    <Link
                        href="/invoices"
                        className="inline-flex items-center gap-2 text-sm transition-colors text-slate-600 hover:text-slate-900"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para Faturas
                    </Link>

                    <div className="flex items-center gap-2">
                        {/* Menu de Status */}
                        <div className="relative">
                            <button
                                onClick={() => setShowStatusMenu(!showStatusMenu)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
                            >
                                <MoreVertical className="w-4 h-4" />
                                Mudar Status
                            </button>

                            {showStatusMenu && (
                                <div className="absolute right-0 z-10 w-56 mt-2 bg-white border rounded-lg shadow-lg border-slate-200">
                                    <div className="py-1">
                                        <button
                                            onClick={() => handleStatusChange('pending')}
                                            disabled={invoice.status === 'pending'}
                                            className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Clock className="w-4 h-4 text-yellow-600" />
                                            Marcar como Pendente
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange('paid')}
                                            disabled={invoice.status === 'paid'}
                                            className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            Marcar como Pago
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange('cancelled')}
                                            disabled={invoice.status === 'cancelled'}
                                            className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <XCircle className="w-4 h-4 text-gray-600" />
                                            Marcar como Cancelado
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange('rejected')}
                                            disabled={invoice.status === 'rejected'}
                                            className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <AlertCircle className="w-4 h-4 text-red-600" />
                                            Marcar como Rejeitado
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            <Download className="w-4 h-4" />
                            Download PDF
                        </button>

                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
                        >
                            <Printer className="w-4 h-4" />
                            Imprimir
                        </button>
                    </div>
                </div>

                {/* Invoice Document - Layout Profissional */}
                <div className="bg-white border rounded-xl border-slate-200">
                    <div className="p-8 space-y-8 md:p-12">
                        {/* Header da Fatura */}
                        <div className="flex items-start justify-between pb-8 border-b-2 border-slate-200">
                            {/* Logo e Nome da Empresa */}
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">LogisticPro</h1>
                                <p className="mt-2 text-sm text-slate-600">Soluções em Logística</p>
                                <div className="mt-4 space-y-1 text-sm text-slate-600">
                                    <p className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Beira, Moçambique
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        contato@logisticpro.co.mz
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        +258 XX XXX XXXX
                                    </p>
                                </div>
                            </div>

                            {/* Detalhes da Fatura */}
                            <div className="text-right">
                                <div className="inline-block px-4 py-2 mb-4 rounded-lg bg-slate-100">
                                    <StatusBadge status={invoice.status} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">FATURA</h2>
                                <p className="mt-2 text-lg font-medium text-slate-700">
                                    {invoice.invoice_number}
                                </p>
                                <div className="mt-4 space-y-1 text-sm">
                                    <div className="flex justify-end gap-2">
                                        <span className="font-medium text-slate-600">Data Emissão:</span>
                                        <span className="text-slate-900">{formatDate(invoice.issue_date)}</span>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <span className="font-medium text-slate-600">Vencimento:</span>
                                        <span className="text-slate-900">{formatDate(invoice.due_date)}</span>
                                    </div>
                                    {invoice.payment_date && (
                                        <div className="flex justify-end gap-2">
                                            <span className="font-medium text-slate-600">Pago em:</span>
                                            <span className="font-medium text-green-600">{formatDate(invoice.payment_date)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Informações do Cliente e Processo */}
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            {/* Cliente */}
                            <div>
                                <h3 className="mb-3 text-sm font-bold uppercase text-slate-900">Faturado Para:</h3>
                                <div className="p-4 rounded-lg bg-slate-50">
                                    <p className="text-lg font-semibold text-slate-900">
                                        {invoice.client?.name || invoice.shipment?.client?.name || 'N/A'}
                                    </p>
                                    {(invoice.client?.email || invoice.shipment?.client?.email) && (
                                        <p className="mt-2 text-sm text-slate-600">
                                            <Mail className="inline w-3 h-3 mr-1" />
                                            {invoice.client?.email || invoice.shipment?.client?.email}
                                        </p>
                                    )}
                                    {(invoice.client?.phone || invoice.shipment?.client?.phone) && (
                                        <p className="text-sm text-slate-600">
                                            <Phone className="inline w-3 h-3 mr-1" />
                                            {invoice.client?.phone || invoice.shipment?.client?.phone}
                                        </p>
                                    )}
                                    {(invoice.client?.address || invoice.shipment?.client?.address) && (
                                        <p className="mt-2 text-sm text-slate-600">
                                            <MapPin className="inline w-3 h-3 mr-1" />
                                            {invoice.client?.address || invoice.shipment?.client?.address}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Informações do Processo */}
                            <div>
                                <h3 className="mb-3 text-sm font-bold uppercase text-slate-900">Processo:</h3>
                                <div className="p-4 rounded-lg bg-slate-50">
                                    <p className="text-lg font-semibold text-slate-900">
                                        {invoice.shipment?.reference_number || 'N/A'}
                                    </p>
                                    {invoice.shipment?.bl_number && (
                                        <p className="mt-2 text-sm text-slate-600">
                                            <span className="font-medium">BL Number:</span> {invoice.shipment.bl_number}
                                        </p>
                                    )}
                                    {invoice.shipment?.type && (
                                        <p className="text-sm text-slate-600">
                                            <span className="font-medium">Tipo:</span>{' '}
                                            {invoice.shipment.type === 'import' ? 'Importação' :
                                             invoice.shipment.type === 'export' ? 'Exportação' : 'Trânsito'}
                                        </p>
                                    )}
                                    {invoice.shipment && (
                                        <Link
                                            href={`/shipments/${invoice.shipment.id}`}
                                            className="inline-block mt-2 text-sm font-medium text-blue-600 hover:text-blue-800 print:hidden"
                                        >
                                            Ver Processo Completo →
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Tabela de Itens */}
                        <div>
                            <h3 className="mb-4 text-sm font-bold uppercase text-slate-900">Descrição dos Serviços:</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-100">
                                        <tr>
                                            <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-700">
                                                Descrição
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold text-center uppercase text-slate-700">
                                                Qtd
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold text-right uppercase text-slate-700">
                                                Preço Unit.
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold text-right uppercase text-slate-700">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {invoice.items && invoice.items.length > 0 ? (
                                            invoice.items.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-3 text-sm text-slate-900">
                                                        <p className="font-medium">{item.description}</p>
                                                        {item.notes && (
                                                            <p className="mt-1 text-xs text-slate-600">{item.notes}</p>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-center text-slate-900">
                                                        {item.quantity || 1}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-right text-slate-900">
                                                        {formatCurrency(item.unit_price || item.amount, invoice.currency)}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-medium text-right text-slate-900">
                                                        {formatCurrency(item.total || item.amount, invoice.currency)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-4 py-8 text-center">
                                                    <div className="text-slate-500">
                                                        <p className="font-medium">Serviços de Logística</p>
                                                        <p className="mt-1 text-sm">
                                                            Processo: {invoice.shipment?.reference_number}
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Totais */}
                        <div className="flex justify-end">
                            <div className="w-full max-w-md space-y-3">
                                {invoice.subtotal && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Subtotal:</span>
                                        <span className="font-medium text-slate-900">
                                            {formatCurrency(invoice.subtotal, invoice.currency)}
                                        </span>
                                    </div>
                                )}
                                {invoice.discount_amount && invoice.discount_amount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">
                                            Desconto {invoice.discount_percentage && `(${invoice.discount_percentage}%)`}:
                                        </span>
                                        <span className="font-medium text-red-600">
                                            -{formatCurrency(invoice.discount_amount, invoice.currency)}
                                        </span>
                                    </div>
                                )}
                                {invoice.tax_amount && invoice.tax_amount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Impostos:</span>
                                        <span className="font-medium text-slate-900">
                                            {formatCurrency(invoice.tax_amount, invoice.currency)}
                                        </span>
                                    </div>
                                )}
                                <div className="pt-3 border-t-2 border-slate-300">
                                    <div className="flex justify-between">
                                        <span className="text-lg font-bold text-slate-900">TOTAL:</span>
                                        <span className="text-2xl font-bold text-slate-900">
                                            {formatCurrency(invoice.amount, invoice.currency)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notas e Observações */}
                        {(invoice.notes || invoice.payment_terms || invoice.customer_notes) && (
                            <div className="pt-8 space-y-4 border-t border-slate-200">
                                {invoice.notes && (
                                    <div>
                                        <h4 className="mb-2 text-sm font-semibold text-slate-900">Notas:</h4>
                                        <p className="text-sm text-slate-700">{invoice.notes}</p>
                                    </div>
                                )}
                                {invoice.payment_terms && (
                                    <div>
                                        <h4 className="mb-2 text-sm font-semibold text-slate-900">Termos de Pagamento:</h4>
                                        <p className="text-sm text-slate-700">{invoice.payment_terms}</p>
                                    </div>
                                )}
                                {invoice.customer_notes && (
                                    <div>
                                        <h4 className="mb-2 text-sm font-semibold text-slate-900">Observações ao Cliente:</h4>
                                        <p className="text-sm text-slate-700">{invoice.customer_notes}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Footer */}
                        <div className="pt-8 text-center border-t border-slate-200">
                            <p className="text-xs text-slate-500">
                                Obrigado pelo seu negócio!
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                LogisticPro - Soluções em Logística | contato@logisticpro.co.mz
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

// Componente de Badge de Status
function StatusBadge({ status }) {
    const configs = {
        pending: {
            label: 'Pendente',
            icon: Clock,
            className: 'bg-yellow-100 text-yellow-700',
        },
        paid: {
            label: 'Pago',
            icon: CheckCircle2,
            className: 'bg-green-100 text-green-700',
        },
        cancelled: {
            label: 'Cancelado',
            icon: XCircle,
            className: 'bg-gray-100 text-gray-700',
        },
        rejected: {
            label: 'Rejeitado',
            icon: AlertCircle,
            className: 'bg-red-100 text-red-700',
        },
    };

    const config = configs[status] || configs.pending;
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${config.className}`}>
            <Icon className="w-3 h-3" />
            {config.label}
        </span>
    );
}

// Helper para obter label do status
function getStatusLabel(status) {
    const labels = {
        pending: 'Pendente',
        paid: 'Pago',
        cancelled: 'Cancelado',
        rejected: 'Rejeitado',
    };
    return labels[status] || status;
}
