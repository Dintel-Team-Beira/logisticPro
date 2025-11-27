import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { FileDown, ArrowLeft, Save, Plus, Trash2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Create({ invoices, clients, nextCreditNoteNumber, reasons }) {
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [items, setItems] = useState([
        { description: '', quantity: 1, unit: 'unit', unit_price: 0, tax_rate: 17 }
    ]);

    const { data, setData, post, processing, errors } = useForm({
        invoice_id: '',
        issue_date: new Date().toISOString().split('T')[0],
        reason: 'product_return',
        reason_description: '',
        currency: 'MZN',
        notes: '',
        items: [],
    });

    // Quando a fatura for selecionada, carregar seus itens
    useEffect(() => {
        if (data.invoice_id) {
            const invoice = invoices.find(inv => inv.id == data.invoice_id);
            setSelectedInvoice(invoice);

            if (invoice) {
                setData(prev => ({
                    ...prev,
                    currency: invoice.currency,
                }));

                // Se a fatura tem itens, carregar automaticamente
                if (invoice.items && invoice.items.length > 0) {
                    const invoiceItems = invoice.items.map(item => ({
                        description: item.description || item.service?.name || '',
                        quantity: item.quantity || 1,
                        unit: item.unit || 'unit',
                        unit_price: parseFloat(item.unit_price) || 0,
                        tax_rate: parseFloat(item.tax_rate) || 17,
                        invoice_item_id: item.id,
                    }));
                    setItems(invoiceItems);
                }
            }
        }
    }, [data.invoice_id]);

    // Sincronizar items com data.items sempre que items mudar
    useEffect(() => {
        setData('items', items.map(item => ({
            description: item.description,
            quantity: parseFloat(item.quantity) || 0,
            unit: item.unit || 'unit',
            unit_price: parseFloat(item.unit_price) || 0,
            tax_rate: parseFloat(item.tax_rate) || 0,
            invoice_item_id: item.invoice_item_id || null,
        })));
    }, [items]);

    const addItem = () => {
        setItems([...items, {
            description: '',
            quantity: 1,
            unit: 'unit',
            unit_price: 0,
            tax_rate: 17
        }]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const calculateItemTotal = (item) => {
        const subtotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
        const tax = subtotal * ((parseFloat(item.tax_rate) || 0) / 100);
        return {
            subtotal,
            tax,
            total: subtotal + tax
        };
    };

    const calculateTotals = () => {
        let subtotal = 0;
        let taxAmount = 0;

        items.forEach(item => {
            const itemTotals = calculateItemTotal(item);
            subtotal += itemTotals.subtotal;
            taxAmount += itemTotals.tax;
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
        post('/credit-notes');
    };

    const currencies = [
        { value: 'MZN', label: 'MZN - Metical' },
        { value: 'USD', label: 'USD - Dólar' },
        { value: 'EUR', label: 'EUR - Euro' },
    ];

    return (
        <DashboardLayout>
            <Head title="Nova Nota de Crédito" />

            <div className="p-6 ml-5 -mt-3 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <Link href="/credit-notes">
                                <button className="p-2 transition-colors rounded-lg hover:bg-slate-100">
                                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                                </button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-semibold text-slate-900">Nova Nota de Crédito</h1>
                                <p className="mt-1 text-sm text-slate-500">
                                    Criar nota de crédito para devolução ou ajuste
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="px-4 py-2 text-sm font-mono text-slate-600 bg-slate-100 rounded-lg">
                        {nextCreditNoteNumber}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Main Info Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-white border rounded-lg border-slate-200"
                    >
                        <h2 className="mb-4 text-lg font-semibold text-slate-900">Informações Gerais</h2>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Fatura */}
                            <div className="md:col-span-2">
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    Fatura * <span className="text-xs text-slate-500">(Selecione a fatura para carregar os itens automaticamente)</span>
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
                            </div>

                            {/* Invoice Details */}
                            {selectedInvoice && (
                                <div className="p-4 border rounded-lg md:col-span-2 bg-blue-50 border-blue-200">
                                    <div className="flex items-start gap-2 mb-3">
                                        <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-semibold text-blue-900">Fatura Selecionada</h4>
                                            <p className="text-xs text-blue-700">Os itens da fatura foram carregados abaixo. Ajuste as quantidades conforme necessário.</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                                        <div>
                                            <span className="text-blue-600">Cliente:</span>
                                            <span className="ml-2 font-medium text-blue-900">
                                                {selectedInvoice.client?.name}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-blue-600">Valor Total:</span>
                                            <span className="ml-2 font-medium text-blue-900">
                                                {Number(selectedInvoice.amount).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} {selectedInvoice.currency}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-blue-600">Status:</span>
                                            <span className="ml-2 font-medium text-blue-900 capitalize">
                                                {selectedInvoice.status}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-blue-600">Data:</span>
                                            <span className="ml-2 font-medium text-blue-900">
                                                {new Date(selectedInvoice.issue_date).toLocaleDateString('pt-MZ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Data de Emissão */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    Data de Emissão *
                                </label>
                                <input
                                    type="date"
                                    value={data.issue_date}
                                    onChange={e => setData('issue_date', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                            {/* Motivo */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    Motivo *
                                </label>
                                <select
                                    value={data.reason}
                                    onChange={e => setData('reason', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {errors.notes && (
                                    <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Items Card - Formato Tabela como Quotes */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="overflow-hidden bg-white border rounded-lg border-slate-200"
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-900">Itens da Nota de Crédito</h3>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={addItem}
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4" />
                                Adicionar Item
                            </motion.button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-xs font-medium text-left text-slate-600 uppercase w-[35%]">Descrição</th>
                                        <th className="px-4 py-3 text-xs font-medium text-center text-slate-600 uppercase w-[12%]">Qtd</th>
                                        <th className="px-4 py-3 text-xs font-medium text-right text-slate-600 uppercase w-[15%]">Preço Unit.</th>
                                        <th className="px-4 py-3 text-xs font-medium text-right text-slate-600 uppercase w-[10%]">IVA %</th>
                                        <th className="px-4 py-3 text-xs font-medium text-right text-slate-600 uppercase w-[13%]">Subtotal</th>
                                        <th className="px-4 py-3 text-xs font-medium text-right text-slate-600 uppercase w-[13%]">Total</th>
                                        <th className="px-4 py-3 text-xs font-medium text-center text-slate-600 uppercase w-[2%]"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {items.map((item, index) => {
                                        const itemTotals = calculateItemTotal(item);
                                        return (
                                            <tr key={index}>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="text"
                                                        value={item.description}
                                                        onChange={e => updateItem(index, 'description', e.target.value)}
                                                        placeholder="Descrição do item"
                                                        className="block w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
                                                        required
                                                    />
                                                </td>

                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0.01"
                                                        value={item.quantity}
                                                        onChange={e => updateItem(index, 'quantity', e.target.value)}
                                                        className="block w-full px-3 py-2 text-sm text-center border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
                                                        required
                                                    />
                                                </td>

                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={item.unit_price}
                                                        onChange={e => updateItem(index, 'unit_price', e.target.value)}
                                                        className="block w-full px-3 py-2 text-sm text-right border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
                                                        required
                                                    />
                                                </td>

                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max="100"
                                                        value={item.tax_rate}
                                                        onChange={e => updateItem(index, 'tax_rate', e.target.value)}
                                                        className="block w-full px-3 py-2 text-sm text-center border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
                                                        required
                                                    />
                                                </td>

                                                <td className="px-4 py-3 text-sm text-right text-slate-900">
                                                    {itemTotals.subtotal.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                                                </td>

                                                <td className="px-4 py-3 text-sm font-semibold text-right text-slate-900">
                                                    {itemTotals.total.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                                                </td>

                                                <td className="px-4 py-3 text-center">
                                                    {items.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(index)}
                                                            className="p-1 text-red-600 transition-colors rounded hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals Summary */}
                        <div className="px-6 py-4 border-t-2 border-slate-200 bg-slate-50">
                            <div className="grid grid-cols-2 gap-3 max-w-md ml-auto">
                                <div className="text-sm font-medium text-slate-600">Subtotal:</div>
                                <div className="text-sm font-semibold text-right text-slate-900">
                                    {totals.subtotal.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} {data.currency}
                                </div>
                                <div className="text-sm font-medium text-slate-600">IVA:</div>
                                <div className="text-sm font-semibold text-right text-slate-900">
                                    {totals.taxAmount.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} {data.currency}
                                </div>
                                <div className="text-base font-bold text-slate-900">Total:</div>
                                <div className="text-base font-bold text-right text-blue-600">
                                    {totals.total.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} {data.currency}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Link href="/credit-notes">
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
                            {processing ? 'Salvando...' : 'Criar Nota de Crédito'}
                        </motion.button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
