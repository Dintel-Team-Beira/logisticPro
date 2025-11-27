import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { FileUp, ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Create({ invoices, clients, nextDebitNoteNumber, reasons }) {
    const { data, setData, post, processing, errors } = useForm({
        invoice_id: '',
        issue_date: new Date().toISOString().split('T')[0],
        reason: 'additional_charges',
        reason_description: '',
        currency: 'MZN',
        notes: '',
        items: [
            { description: '', quantity: 1, unit: 'unit', unit_price: 0, tax_rate: 17 }
        ],
    });

    const [selectedInvoice, setSelectedInvoice] = useState(null);

    useEffect(() => {
        if (data.invoice_id) {
            const invoice = invoices.find(inv => inv.id == data.invoice_id);
            setSelectedInvoice(invoice);
            if (invoice) {
                setData(prev => ({
                    ...prev,
                    currency: invoice.currency,
                }));
            }
        }
    }, [data.invoice_id]);

    const currencies = [
        { value: 'MZN', label: 'MZN - Metical' },
        { value: 'USD', label: 'USD - Dólar' },
        { value: 'EUR', label: 'EUR - Euro' },
    ];

    const addItem = () => {
        setData('items', [...data.items, { description: '', quantity: 1, unit: 'unit', unit_price: 0, tax_rate: 17 }]);
    };

    const removeItem = (index) => {
        const newItems = data.items.filter((_, i) => i !== index);
        setData('items', newItems.length > 0 ? newItems : [{ description: '', quantity: 1, unit: 'unit', unit_price: 0, tax_rate: 17 }]);
    };

    const updateItem = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;
        setData('items', newItems);
    };

    const calculateItemTotal = (item) => {
        const subtotal = item.quantity * item.unit_price;
        const tax = subtotal * (item.tax_rate / 100);
        return subtotal + tax;
    };

    const calculateTotals = () => {
        let subtotal = 0;
        let taxAmount = 0;

        data.items.forEach(item => {
            const itemSubtotal = item.quantity * item.unit_price;
            subtotal += itemSubtotal;
            taxAmount += itemSubtotal * (item.tax_rate / 100);
        });

        return {
            subtotal,
            taxAmount,
            total: subtotal + taxAmount,
        };
    };

    const totals = calculateTotals();

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/debit-notes');
    };

    return (
        <DashboardLayout>
            <Head title="Nova Nota de Débito" />

            <div className="p-6 ml-5 -mt-3 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <Link href="/debit-notes">
                                <button className="p-2 transition-colors rounded-lg hover:bg-slate-100">
                                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                                </button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-semibold text-slate-900">Nova Nota de Débito</h1>
                                <p className="mt-1 text-sm text-slate-500">
                                    Criar nota de débito para devolução ou ajuste
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="px-4 py-2 font-mono text-sm rounded-lg text-slate-600 bg-slate-100">
                        {nextDebitNoteNumber}
                    </div>
                </div>

                {/* Form */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {/* Main Info Card */}
                    <div className="p-6 bg-white border rounded-lg border-slate-200">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900">Informações Gerais</h2>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Fatura */}
                            <div className="md:col-span-2">
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    Fatura *
                                </label>
                                <select
                                    value={data.invoice_id}
                                    onChange={e => setData('invoice_id', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                            </div>

                            {/* Data de Emissão */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    Data de Emissão *
                                </label>
                                <input
                                    type="date"
                                    value={data.issue_date}
                                    onChange={e => setData('issue_date', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    required
                                />
                                {errors.issue_date && (
                                    <p className="mt-1 text-sm text-red-600">{errors.issue_date}</p>
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
                                    className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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

                            {/* Motivo */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    Motivo *
                                </label>
                                <select
                                    value={data.reason}
                                    onChange={e => setData('reason', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    required
                                >
                                    {reasons.map(reason => (
                                        <option key={reason.value} value={reason.value}>
                                            {reason.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.reason && (
                                    <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
                                )}
                            </div>

                            {/* Descrição do Motivo */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    Descrição do Motivo
                                </label>
                                <input
                                    type="text"
                                    value={data.reason_description}
                                    onChange={e => setData('reason_description', e.target.value)}
                                    placeholder="Detalhe o motivo..."
                                    className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                                {errors.reason_description && (
                                    <p className="mt-1 text-sm text-red-600">{errors.reason_description}</p>
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
                                    placeholder="Informações adicionais..."
                                    className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                                {errors.notes && (
                                    <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Items Card */}
                    <div className="p-6 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-slate-900">Itens</h2>
                            <button
                                type="button"
                                onClick={addItem}
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-orange-600 rounded-lg bg-orange-50 hover:bg-orange-100"
                            >
                                <Plus className="w-4 h-4" />
                                Adicionar Item
                            </button>
                        </div>

                        <div className="space-y-4">
                            {data.items.map((item, index) => (
                                <div key={index} className="p-4 border rounded-lg border-slate-200 bg-slate-50">
                                    <div className="grid grid-cols-12 gap-4">
                                        {/* Descrição */}
                                        <div className="col-span-12 md:col-span-4">
                                            <label className="block mb-1 text-xs font-medium text-slate-600">Descrição *</label>
                                            <input
                                                type="text"
                                                value={item.description}
                                                onChange={e => updateItem(index, 'description', e.target.value)}
                                                placeholder="Descrição do item"
                                                className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-500"
                                                required
                                            />
                                        </div>

                                        {/* Quantidade */}
                                        <div className="col-span-6 md:col-span-2">
                                            <label className="block mb-1 text-xs font-medium text-slate-600">Qtd *</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={item.quantity}
                                                onChange={e => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-500"
                                                required
                                            />
                                        </div>

                                        {/* Preço Unitário */}
                                        <div className="col-span-6 md:col-span-2">
                                            <label className="block mb-1 text-xs font-medium text-slate-600">Preço Unit *</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={item.unit_price}
                                                onChange={e => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-500"
                                                required
                                            />
                                        </div>

                                        {/* Taxa IVA */}
                                        <div className="col-span-6 md:col-span-2">
                                            <label className="block mb-1 text-xs font-medium text-slate-600">IVA % *</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={item.tax_rate}
                                                onChange={e => updateItem(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                                                className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-500"
                                                required
                                            />
                                        </div>

                                        {/* Total */}
                                        <div className="flex items-end col-span-6 gap-2 md:col-span-2">
                                            <div className="flex-1">
                                                <label className="block mb-1 text-xs font-medium text-slate-600">Total</label>
                                                <div className="px-3 py-2 text-sm font-semibold border rounded-lg bg-slate-100 text-slate-900 border-slate-300">
                                                    {calculateItemTotal(item).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                            {data.items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="p-2 text-red-600 rounded-lg hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals Summary */}
                        <div className="p-4 mt-6 border-t-2 border-slate-200">
                            <div className="grid max-w-md grid-cols-2 gap-3 ml-auto">
                                <div className="text-sm font-medium text-slate-600">Subtotal:</div>
                                <div className="text-sm font-semibold text-right text-slate-900">
                                    {totals.subtotal.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} {data.currency}
                                </div>
                                <div className="text-sm font-medium text-slate-600">IVA:</div>
                                <div className="text-sm font-semibold text-right text-slate-900">
                                    {totals.taxAmount.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} {data.currency}
                                </div>
                                <div className="text-base font-bold text-slate-900">Total:</div>
                                <div className="text-base font-bold text-right text-orange-600">
                                    {totals.total.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} {data.currency}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Link href="/debit-notes">
                            <button
                                type="button"
                                className="px-6 py-2 text-sm font-medium transition-colors bg-white border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
                            >
                                Cancelar
                            </button>
                        </Link>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white transition-colors bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {processing ? 'Salvando...' : 'Criar Nota de Débito'}
                        </motion.button>
                    </div>
                </motion.form>
            </div>
        </DashboardLayout>
    );
}
