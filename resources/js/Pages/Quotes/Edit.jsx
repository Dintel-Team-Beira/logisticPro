import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ArrowLeft, Save, Plus, Trash2, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Edit({ quote, clients, shipments }) {
    const [services, setServices] = useState([]);
    const [items, setItems] = useState([]);

    const { data, setData, put, processing, errors } = useForm({
        client_id: quote.client_id || '',
        shipment_id: quote.shipment_id || '',
        title: quote.title || '',
        description: quote.description || '',
        quote_date: quote.quote_date || new Date().toISOString().split('T')[0],
        valid_until: quote.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        discount_percentage: quote.discount_percentage || 0,
        payment_terms: quote.payment_terms || '30 dias',
        currency: quote.currency || 'MZN',
        terms: quote.terms || '',
        customer_notes: quote.customer_notes || '',
        items: [],
    });

    // Fetch active services
    useEffect(() => {
        fetch('/services/active')
            .then(res => res.json())
            .then(data => setServices(data))
            .catch(err => console.error('Erro ao carregar serviços:', err));
    }, []);

    // Load existing items
    useEffect(() => {
        if (quote.items && quote.items.length > 0) {
            const loadedItems = quote.items.map(item => ({
                service_id: item.service_id,
                service_name: item.service_name,
                quantity: item.quantity,
                unit: item.unit,
                unit_price: item.unit_price,
                tax_type: item.tax_type,
                tax_rate: item.tax_rate,
                subtotal: parseFloat(item.subtotal),
                tax_amount: parseFloat(item.tax_amount),
                total: parseFloat(item.total),
            }));
            setItems(loadedItems);
        }
    }, [quote]);

    // Calculate totals
    const calculateTotals = (currentItems) => {
        const subtotal = currentItems.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0);
        const discountAmount = subtotal * (parseFloat(data.discount_percentage) || 0) / 100;
        const taxAmount = currentItems.reduce((sum, item) => sum + (parseFloat(item.tax_amount) || 0), 0);
        const total = subtotal - discountAmount + taxAmount;

        return { subtotal, discountAmount, taxAmount, total };
    };

    const addItem = () => {
        setItems([...items, {
            service_id: '',
            service_name: '',
            quantity: 1,
            unit: 'unit',
            unit_price: 0,
            tax_type: 'excluded',
            tax_rate: 17,
            subtotal: 0,
            tax_amount: 0,
            total: 0,
        }]);
    };

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        // If service selected, populate fields
        if (field === 'service_id') {
            const service = services.find(s => s.id === parseInt(value));
            if (service) {
                newItems[index].service_name = service.name;
                newItems[index].unit = service.unit;
                newItems[index].unit_price = service.unit_price;
                newItems[index].tax_type = service.tax_type;
                newItems[index].tax_rate = service.tax_rate;
            }
        }

        // Recalculate item totals
        const quantity = parseFloat(newItems[index].quantity) || 0;
        const unitPrice = parseFloat(newItems[index].unit_price) || 0;
        const taxRate = parseFloat(newItems[index].tax_rate) || 0;
        const taxType = newItems[index].tax_type;

        newItems[index].subtotal = quantity * unitPrice;

        if (taxType === 'exempt') {
            newItems[index].tax_amount = 0;
            newItems[index].total = newItems[index].subtotal;
        } else if (taxType === 'included') {
            newItems[index].tax_amount = newItems[index].subtotal - (newItems[index].subtotal / (1 + (taxRate / 100)));
            newItems[index].total = newItems[index].subtotal;
        } else {
            newItems[index].tax_amount = newItems[index].subtotal * (taxRate / 100);
            newItems[index].total = newItems[index].subtotal + newItems[index].tax_amount;
        }

        setItems(newItems);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (items.length === 0) {
            alert('Adicione pelo menos um item à cotação!');
            return;
        }

        const formData = {
            ...data,
            items: items.map(item => ({
                service_id: item.service_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
            })),
        };

        put(`/quotes/${quote.id}`, formData);
    };

    const totals = calculateTotals(items);

    return (
        <DashboardLayout>
            <Head title={`Editar ${quote.quote_number}`} />

            <div className="p-6 ml-5 -mt-3 space-y-6">
                {/* Header */}
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
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Editar Cotação
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {quote.quote_number}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-white border rounded-lg border-slate-200"
                    >
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">
                            Informações Básicas
                        </h3>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Cliente *
                                </label>
                                <select
                                    value={data.client_id}
                                    onChange={(e) => setData('client_id', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Selecione um cliente</option>
                                    {clients.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.client_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.client_id}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Processo (Opcional)
                                </label>
                                <select
                                    value={data.shipment_id}
                                    onChange={(e) => setData('shipment_id', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">Nenhum processo vinculado</option>
                                    {shipments.map((shipment) => (
                                        <option key={shipment.id} value={shipment.id}>
                                            {shipment.shipment_number} - {shipment.client?.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700">
                                    Título *
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Ex: Proposta Comercial - Frete Internacional"
                                    required
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700">
                                    Descrição
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows="3"
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Descrição detalhada da cotação..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Data da Cotação *
                                </label>
                                <input
                                    type="date"
                                    value={data.quote_date}
                                    onChange={(e) => setData('quote_date', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Válido Até *
                                </label>
                                <input
                                    type="date"
                                    value={data.valid_until}
                                    onChange={(e) => setData('valid_until', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Condições de Pagamento
                                </label>
                                <input
                                    type="text"
                                    value={data.payment_terms}
                                    onChange={(e) => setData('payment_terms', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Ex: 30 dias, À vista"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Moeda *
                                </label>
                                <select
                                    value={data.currency}
                                    onChange={(e) => setData('currency', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    <option value="MZN">MZN - Metical</option>
                                    <option value="USD">USD - Dólar</option>
                                    <option value="EUR">EUR - Euro</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>

                    {/* Items */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white border rounded-lg border-slate-200 overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900">
                                Itens da Cotação
                            </h3>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={addItem}
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Adicionar Item
                            </motion.button>
                        </div>

                        {items.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <Calculator className="w-12 h-12 mx-auto text-slate-300" />
                                <h3 className="mt-2 text-sm font-medium text-slate-900">
                                    Nenhum item adicionado
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Clique em "Adicionar Item" para começar
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-xs font-medium text-left text-slate-600 uppercase w-[30%]">Serviço</th>
                                            <th className="px-4 py-3 text-xs font-medium text-center text-slate-600 uppercase w-[12%]">Qtd</th>
                                            <th className="px-4 py-3 text-xs font-medium text-right text-slate-600 uppercase w-[15%]">Preço Unit.</th>
                                            <th className="px-4 py-3 text-xs font-medium text-right text-slate-600 uppercase w-[15%]">Subtotal</th>
                                            <th className="px-4 py-3 text-xs font-medium text-right text-slate-600 uppercase w-[13%]">IVA</th>
                                            <th className="px-4 py-3 text-xs font-medium text-right text-slate-600 uppercase w-[13%]">Total</th>
                                            <th className="px-4 py-3 text-xs font-medium text-center text-slate-600 uppercase w-[2%]"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={item.service_id}
                                                        onChange={(e) => updateItem(index, 'service_id', e.target.value)}
                                                        className="block w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                        required
                                                    >
                                                        <option value="">Selecione...</option>
                                                        {services.map((service) => (
                                                            <option key={service.id} value={service.id}>
                                                                {service.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0.01"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                        className="block w-full text-sm text-center rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                        required
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={item.unit_price}
                                                        onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                                                        className="block w-full text-sm text-right rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                        required
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right text-slate-900">
                                                    {item.subtotal.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right text-slate-600">
                                                    {item.tax_amount.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-semibold text-right text-slate-900">
                                                    {item.total.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Totals */}
                        {items.length > 0 && (
                            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
                                <div className="max-w-md ml-auto space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <dt className="text-slate-600">Subtotal</dt>
                                        <dd className="font-medium text-slate-900">
                                            {totals.subtotal.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} {data.currency}
                                        </dd>
                                    </div>

                                    <div className="flex justify-between items-center text-sm gap-4">
                                        <dt className="text-slate-600">Desconto</dt>
                                        <dd className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                value={data.discount_percentage}
                                                onChange={(e) => setData('discount_percentage', e.target.value)}
                                                className="w-20 text-sm text-right rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                            <span className="text-slate-600">%</span>
                                            <span className="font-medium text-red-600 min-w-[100px] text-right">
                                                - {totals.discountAmount.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} {data.currency}
                                            </span>
                                        </dd>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <dt className="text-slate-600">IVA Total</dt>
                                        <dd className="font-medium text-slate-900">
                                            {totals.taxAmount.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} {data.currency}
                                        </dd>
                                    </div>

                                    <div className="flex justify-between pt-3 text-base border-t border-slate-300">
                                        <dt className="font-semibold text-slate-900">Total</dt>
                                        <dd className="text-2xl font-bold text-slate-900">
                                            {totals.total.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} {data.currency}
                                        </dd>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Terms and Notes */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 bg-white border rounded-lg border-slate-200"
                    >
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">
                            Termos e Observações
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Termos e Condições
                                </label>
                                <textarea
                                    value={data.terms}
                                    onChange={(e) => setData('terms', e.target.value)}
                                    rows="4"
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Ex: Preços válidos conforme cotação. Sujeito a alteração sem aviso prévio..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Notas para o Cliente
                                </label>
                                <textarea
                                    value={data.customer_notes}
                                    onChange={(e) => setData('customer_notes', e.target.value)}
                                    rows="3"
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Observações adicionais visíveis ao cliente..."
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-6">
                        <Link href="/quotes">
                            <button
                                type="button"
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Cancelar
                            </button>
                        </Link>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={processing || items.length === 0}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            {processing ? 'Salvando...' : 'Salvar Alterações'}
                        </motion.button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
