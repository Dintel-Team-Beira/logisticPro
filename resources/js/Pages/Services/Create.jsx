import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ArrowLeft, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Create({ nextCode }) {
    const { data, setData, post, processing, errors } = useForm({
        code: nextCode,
        name: '',
        description: '',
        category: 'other',
        unit_price: '',
        unit: 'unit',
        tax_type: 'excluded',
        tax_rate: 17.00,
        is_active: true,
        sort_order: 0,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/services');
    };

    const categories = [
        { value: 'freight', label: 'Frete' },
        { value: 'customs', label: 'Desembaraço Aduaneiro' },
        { value: 'warehousing', label: 'Armazenagem' },
        { value: 'handling', label: 'Manuseio' },
        { value: 'transport', label: 'Transporte' },
        { value: 'insurance', label: 'Seguro' },
        { value: 'documentation', label: 'Documentação' },
        { value: 'inspection', label: 'Inspeção' },
        { value: 'consulting', label: 'Consultoria' },
        { value: 'other', label: 'Outros' },
    ];

    const units = [
        { value: 'unit', label: 'Unidade' },
        { value: 'container', label: 'Container' },
        { value: 'kg', label: 'Quilograma (kg)' },
        { value: 'm3', label: 'Metro Cúbico (m³)' },
        { value: 'hour', label: 'Hora' },
        { value: 'day', label: 'Dia' },
        { value: 'month', label: 'Mês' },
        { value: 'document', label: 'Documento' },
    ];

    return (
        <DashboardLayout>
            <Head title="Criar Serviço" />

            <div className="p-6 ml-5 -mt-3 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/services">
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
                            Criar Novo Serviço
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Adicione um novo serviço ao catálogo
                        </p>
                    </div>
                </div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border rounded-lg border-slate-200"
                >
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Código e Nome */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Código *
                                </label>
                                <input
                                    type="text"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono"
                                    required
                                />
                                {errors.code && (
                                    <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700">
                                    Nome do Serviço *
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Ex: Frete Marítimo Internacional"
                                    required
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>
                        </div>

                        {/* Descrição */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700">
                                Descrição
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows="3"
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Descrição detalhada do serviço..."
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        {/* Categoria e Preço */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Categoria *
                                </label>
                                <select
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.category && (
                                    <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Preço Unitário * (MZN)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.unit_price}
                                    onChange={(e) => setData('unit_price', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="0.00"
                                    required
                                />
                                {errors.unit_price && (
                                    <p className="mt-1 text-sm text-red-600">{errors.unit_price}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Unidade *
                                </label>
                                <select
                                    value={data.unit}
                                    onChange={(e) => setData('unit', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    {units.map((unit) => (
                                        <option key={unit.value} value={unit.value}>
                                            {unit.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.unit && (
                                    <p className="mt-1 text-sm text-red-600">{errors.unit}</p>
                                )}
                            </div>
                        </div>

                        {/* Impostos */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Tipo de Imposto *
                                </label>
                                <select
                                    value={data.tax_type}
                                    onChange={(e) => setData('tax_type', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    <option value="excluded">IVA Excluído (adicionar ao preço)</option>
                                    <option value="included">IVA Incluído (já incluso no preço)</option>
                                    <option value="exempt">Isento de IVA</option>
                                </select>
                                {errors.tax_type && (
                                    <p className="mt-1 text-sm text-red-600">{errors.tax_type}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Taxa de IVA (%) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={data.tax_rate}
                                    onChange={(e) => setData('tax_rate', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                    disabled={data.tax_type === 'exempt'}
                                />
                                {errors.tax_rate && (
                                    <p className="mt-1 text-sm text-red-600">{errors.tax_rate}</p>
                                )}
                                <p className="mt-1 text-xs text-slate-500">
                                    Taxa padrão em Moçambique: 17%
                                </p>
                            </div>
                        </div>

                        {/* Status e Ordem */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                />
                                <label className="ml-2 text-sm font-medium text-slate-700">
                                    Serviço Ativo
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Ordem de Exibição
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <p className="mt-1 text-xs text-slate-500">
                                    Menor número aparece primeiro na lista
                                </p>
                            </div>
                        </div>

                        {/* Botões */}
                        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
                            <Link href="/services">
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
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                {processing ? 'Criando...' : 'Criar Serviço'}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
