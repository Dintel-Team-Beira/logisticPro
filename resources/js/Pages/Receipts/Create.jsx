import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Receipt, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Create({ invoices, clients, nextReceiptNumber }) {
    const { data, setData, post, processing, errors } = useForm({
        invoice_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        amount: '',
        payment_method: 'bank_transfer',
        payment_reference: '',
        currency: 'MZN',
        notes: '',
    });

    const [selectedInvoice, setSelectedInvoice] = useState(null);

    useEffect(() => {
        if (data.invoice_id) {
            const invoice = invoices.find(inv => inv.id == data.invoice_id);
            setSelectedInvoice(invoice);
            if (invoice) {
                setData(prev => ({
                    ...prev,
                    amount: invoice.amount,
                    currency: invoice.currency,
                }));
            }
        }
    }, [data.invoice_id]);

    const paymentMethods = [
        { value: 'cash', label: 'Dinheiro' },
        { value: 'bank_transfer', label: 'Transferência Bancária' },
        { value: 'cheque', label: 'Cheque' },
        { value: 'mpesa', label: 'M-Pesa' },
        { value: 'emola', label: 'E-Mola' },
        { value: 'credit_card', label: 'Cartão de Crédito' },
        { value: 'debit_card', label: 'Cartão de Débito' },
        { value: 'other', label: 'Outro' },
    ];

    const currencies = [
        { value: 'MZN', label: 'MZN - Metical' },
        { value: 'USD', label: 'USD - Dólar' },
        { value: 'EUR', label: 'EUR - Euro' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/receipts');
    };

    return (
        <DashboardLayout>
            <Head title="Novo Recibo" />

            <div className="p-6 ml-5 -mt-3 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <Link href="/receipts">
                                <button className="p-2 transition-colors rounded-lg hover:bg-slate-100">
                                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                                </button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-semibold text-slate-900">Novo Recibo</h1>
                                <p className="mt-1 text-sm text-slate-500">
                                    Criar comprovante de pagamento
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="px-4 py-2 text-sm font-mono text-slate-600 bg-slate-100 rounded-lg">
                        {nextReceiptNumber}
                    </div>
                </div>

                {/* Form */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {/* Main Card */}
                    <div className="p-6 bg-white border rounded-lg border-slate-200">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Fatura */}
                            <div className="md:col-span-2">
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    Fatura *
                                </label>
                                <select
                                    value={data.invoice_id}
                                    onChange={e => setData('invoice_id', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Selecione uma fatura</option>
                                    {invoices.map(invoice => (
                                        <option key={invoice.id} value={invoice.id}>
                                            {invoice.invoice_number} - {invoice.client?.name} - {Number(invoice.amount).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} {invoice.currency}
                                        </option>
                                    ))}
                                </select>
                                {errors.invoice_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.invoice_id}</p>
                                )}

                                {/* Invoice Details */}
                                {selectedInvoice && (
                                    <div className="p-4 mt-3 border rounded-lg bg-blue-50 border-blue-200">
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-slate-600">Cliente:</span>
                                                <span className="ml-2 font-medium text-slate-900">
                                                    {selectedInvoice.client?.name}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-600">Valor:</span>
                                                <span className="ml-2 font-medium text-slate-900">
                                                    {Number(selectedInvoice.amount).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} {selectedInvoice.currency}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-600">Status:</span>
                                                <span className="ml-2 font-medium text-slate-900 capitalize">
                                                    {selectedInvoice.status}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-600">Data Emissão:</span>
                                                <span className="ml-2 font-medium text-slate-900">
                                                    {new Date(selectedInvoice.issue_date).toLocaleDateString('pt-MZ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Data do Pagamento */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    Data do Pagamento *
                                </label>
                                <input
                                    type="date"
                                    value={data.payment_date}
                                    onChange={e => setData('payment_date', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                                {errors.payment_date && (
                                    <p className="mt-1 text-sm text-red-600">{errors.payment_date}</p>
                                )}
                            </div>

                            {/* Método de Pagamento */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    Método de Pagamento *
                                </label>
                                <select
                                    value={data.payment_method}
                                    onChange={e => setData('payment_method', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    {paymentMethods.map(method => (
                                        <option key={method.value} value={method.value}>
                                            {method.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.payment_method && (
                                    <p className="mt-1 text-sm text-red-600">{errors.payment_method}</p>
                                )}
                            </div>

                            {/* Valor */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    Valor *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.amount}
                                    onChange={e => setData('amount', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                                {errors.amount && (
                                    <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                                )}
                            </div>

                            {/* Moeda */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    Moeda *
                                </label>
                                <select
                                    value={data.currency}
                                    onChange={e => setData('currency', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    {currencies.map(currency => (
                                        <option key={currency.value} value={currency.value}>
                                            {currency.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.currency && (
                                    <p className="mt-1 text-sm text-red-600">{errors.currency}</p>
                                )}
                            </div>

                            {/* Referência de Pagamento */}
                            <div className="md:col-span-2">
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    Referência de Pagamento
                                </label>
                                <input
                                    type="text"
                                    value={data.payment_reference}
                                    onChange={e => setData('payment_reference', e.target.value)}
                                    placeholder="Ex: TRF123456, CHQ789, Ref. Transação..."
                                    className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {errors.payment_reference && (
                                    <p className="mt-1 text-sm text-red-600">{errors.payment_reference}</p>
                                )}
                            </div>

                            {/* Notas */}
                            <div className="md:col-span-2">
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    Notas / Observações
                                </label>
                                <textarea
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    rows={3}
                                    placeholder="Informações adicionais sobre o pagamento..."
                                    className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {errors.notes && (
                                    <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Link href="/receipts">
                            <button
                                type="button"
                                className="px-6 py-2 text-sm font-medium transition-colors border rounded-lg text-slate-700 bg-white border-slate-300 hover:bg-slate-50"
                            >
                                Cancelar
                            </button>
                        </Link>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {processing ? 'Salvando...' : 'Criar Recibo'}
                        </motion.button>
                    </div>
                </motion.form>
            </div>
        </DashboardLayout>
    );
}
