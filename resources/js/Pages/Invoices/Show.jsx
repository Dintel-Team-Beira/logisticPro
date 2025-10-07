import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import StatusBadge from '@/Components/StatusBadge';
import Modal from '@/Components/Modal';
import Input from '@/Components/Forms/Input';
import {
    ArrowLeft,
    Edit,
    Trash2,
    DollarSign,
    Calendar,
    Building2,
    FileText,
    CheckCircle2,
    Download,
    Printer,
} from 'lucide-react';

export default function Show({ invoice }) {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentData, setPaymentData] = useState({
        payment_date: '',
        payment_reference: '',
    });

    const handleMarkAsPaid = () => {
        router.post(`/invoices/${invoice.id}/pay`, paymentData, {
            onSuccess: () => {
                setIsPaymentModalOpen(false);
            }
        });
    };

    const handleDelete = () => {
        if (confirm('Tem certeza que deseja excluir esta fatura?')) {
            router.delete(`/invoices/${invoice.id}`, {
                onSuccess: () => {
                    router.visit('/invoices');
                }
            });
        }
    };

    return (
        <DashboardLayout>
            <Head title={`Fatura ${invoice.invoice_number}`} />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div>
                    <Link
                        href="/invoices"
                        className="inline-flex items-center gap-2 mb-4 text-sm transition-colors text-slate-600 hover:text-slate-900"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para Faturas
                    </Link>

                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900">
                                {invoice.invoice_number}
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                {invoice.issuer}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <StatusBadge status={invoice.status} />
                            {invoice.status === 'pending' && (
                                <button
                                    onClick={() => setIsPaymentModalOpen(true)}
                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Marcar como Paga
                                </button>
                            )}
                            <button className="p-2 transition-colors rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                                <Printer className="w-5 h-5" />
                            </button>
                            <button className="p-2 transition-colors rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                                <Download className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleDelete}
                                className="p-2 text-red-600 transition-colors rounded-lg hover:text-red-700 hover:bg-red-50"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Invoice Details */}
                        <div className="p-6 bg-white border rounded-lg border-slate-200">
                            <h2 className="mb-4 text-lg font-semibold text-slate-900">
                                Detalhes da Fatura
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="mb-1 text-sm text-slate-500">Tipo</p>
                                    <p className="text-sm font-medium text-slate-900">
                                        {invoice.type === 'coleta_dispersa' && 'Coleta Dispersa'}
                                        {invoice.type === 'alfandegas' && 'Alfândegas'}
                                        {invoice.type === 'cornelder' && 'Cornelder'}
                                        {invoice.type === 'outros' && 'Outros'}
                                    </p>
                                </div>
                                <div>
                                    <p className="mb-1 text-sm text-slate-500">Emissor</p>
                                    <p className="text-sm font-medium text-slate-900">
                                        {invoice.issuer}
                                    </p>
                                </div>
                                <div>
                                    <p className="mb-1 text-sm text-slate-500">Valor</p>
                                    <p className="text-lg font-bold text-slate-900">
                                        {invoice.currency} {invoice.amount}
                                    </p>
                                </div>
                                <div>
                                    <p className="mb-1 text-sm text-slate-500">Moeda</p>
                                    <p className="text-sm font-medium text-slate-900">
                                        {invoice.currency}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="p-6 bg-white border rounded-lg border-slate-200">
                            <h2 className="mb-4 text-lg font-semibold text-slate-900">
                                Datas
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="mb-1 text-sm text-slate-500">Data de Emissão</p>
                                    <p className="text-sm font-medium text-slate-900">
                                        {invoice.issue_date || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="mb-1 text-sm text-slate-500">Data de Vencimento</p>
                                    <p className="text-sm font-medium text-slate-900">
                                        {invoice.due_date || 'N/A'}
                                    </p>
                                </div>
                                {invoice.payment_date && (
                                    <>
                                        <div>
                                            <p className="mb-1 text-sm text-slate-500">Data de Pagamento</p>
                                            <p className="text-sm font-medium text-emerald-600">
                                                {invoice.payment_date}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="mb-1 text-sm text-slate-500">Referência de Pagamento</p>
                                            <p className="text-sm font-medium text-slate-900">
                                                {invoice.payment_reference}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        {invoice.notes && (
                            <div className="p-6 bg-white border rounded-lg border-slate-200">
                                <h2 className="mb-4 text-lg font-semibold text-slate-900">
                                    Observações
                                </h2>
                                <p className="text-sm text-slate-700">
                                    {invoice.notes}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Shipment Info */}
                        <div className="p-6 bg-white border rounded-lg border-slate-200">
                            <h2 className="mb-4 text-lg font-semibold text-slate-900">
                                Shipment
                            </h2>
                            {invoice.shipment ? (
                                <Link
                                    href={`/shipments/${invoice.shipment.id}`}
                                    className="block p-4 transition-colors border rounded-lg border-slate-200 hover:bg-slate-50"
                                >
                                    <p className="mb-1 text-sm font-medium text-slate-900">
                                        {invoice.shipment.reference_number}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {invoice.shipment.shipping_line?.name}
                                    </p>
                                    <div className="mt-2">
                                        <StatusBadge status={invoice.shipment.status} />
                                    </div>
                                </Link>
                            ) : (
                                <p className="text-sm text-slate-500">
                                    Nenhum shipment associado
                                </p>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="p-6 bg-white border rounded-lg border-slate-200">
                            <h2 className="mb-4 text-lg font-semibold text-slate-900">
                                Ações Rápidas
                            </h2>
                            <div className="space-y-2">
                                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                    <Printer className="w-4 h-4" />
                                    Imprimir
                                </button>
                                <Link href={`/invoices/${invoice.id}/edit`}>
                                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                        <Edit className="w-4 h-4" />
                                        Editar
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title="Registrar Pagamento"
                footer={
                    <div className="flex items-center justify-end gap-3">
                        <button
                            onClick={() => setIsPaymentModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium transition-colors bg-white border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleMarkAsPaid}
                            className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-700"
                        >
                            Confirmar Pagamento
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <Input
                        type="date"
                        label="Data de Pagamento"
                        icon={Calendar}
                        value={paymentData.payment_date}
                        onChange={(e) => setPaymentData({...paymentData, payment_date: e.target.value})}
                        required
                    />
                    <Input
                        label="Referência de Pagamento"
                        icon={FileText}
                        placeholder="Ex: TRF123456"
                        value={paymentData.payment_reference}
                        onChange={(e) => setPaymentData({...paymentData, payment_reference: e.target.value})}
                        required
                    />
                </div>
            </Modal>
        </DashboardLayout>
    );
}
