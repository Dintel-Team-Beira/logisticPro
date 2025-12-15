import { useState } from 'react'
import { Head, useForm, Link, router } from '@inertiajs/react'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { ArrowLeft, Save, Calendar, DollarSign, FileText, User, Tag, AlertCircle, Trash2 } from 'lucide-react'

export default function Edit({ transaction, clients = [] }) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const { data, setData, put, processing, errors } = useForm({
        transaction_date: transaction.transaction_date,
        type: transaction.type,
        category: transaction.category || '',
        description: transaction.description,
        amount: transaction.amount,
        client_id: transaction.client_id || '',
        reference: transaction.reference || '',
        notes: transaction.notes || '',
    })

    const categories = [
        'Aluguel',
        'Salários',
        'Utilities (Luz/Água/Internet)',
        'Material de Escritório',
        'Manutenção',
        'Marketing',
        'Impostos',
        'Outros',
    ]

    const handleSubmit = (e) => {
        e.preventDefault()
        put(`/financial-transactions/${transaction.id}`)
    }

    const handleDelete = () => {
        if (confirm('Tem certeza que deseja excluir esta transação?')) {
            router.delete(`/financial-transactions/${transaction.id}`)
        }
    }

    return (
        <DashboardLayout>
            <Head title="Editar Transação" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Editar Transação</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Atualize os dados da transação
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleDelete}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
                        >
                            <Trash2 className="w-4 h-4" />
                            Excluir
                        </button>
                        <Link
                            href="/financial"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Voltar
                        </Link>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="p-6 bg-white border rounded-lg border-slate-200">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Data */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    Data da Transação *
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute w-5 h-5 transform -translate-y-1/2 pointer-events-none left-3 top-1/2 text-slate-400" />
                                    <input
                                        type="date"
                                        value={data.transaction_date}
                                        onChange={(e) => setData('transaction_date', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                {errors.transaction_date && (
                                    <p className="mt-1 text-sm text-red-600">{errors.transaction_date}</p>
                                )}
                            </div>

                            {/* Tipo */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    Tipo de Transação *
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setData('type', 'income')}
                                        className={`px-4 py-2.5 rounded-lg border-2 font-medium transition-all ${
                                            data.type === 'income'
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                    >
                                        Entrada
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setData('type', 'expense')}
                                        className={`px-4 py-2.5 rounded-lg border-2 font-medium transition-all ${
                                            data.type === 'expense'
                                                ? 'border-red-500 bg-red-50 text-red-700'
                                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                    >
                                        Saída
                                    </button>
                                </div>
                                {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
                            </div>

                            {/* Valor */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    Valor (MZN) *
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute w-5 h-5 transform -translate-y-1/2 pointer-events-none left-3 top-1/2 text-slate-400" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        placeholder="0.00"
                                        className="w-full pl-10 pr-4 py-2.5 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                            </div>

                            {/* Categoria */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    Categoria
                                </label>
                                <div className="relative">
                                    <Tag className="absolute w-5 h-5 transform -translate-y-1/2 pointer-events-none left-3 top-1/2 text-slate-400" />
                                    <select
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Selecione uma categoria</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                            </div>

                            {/* Cliente (opcional) */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    Cliente (opcional)
                                </label>
                                <div className="relative">
                                    <User className="absolute w-5 h-5 transform -translate-y-1/2 pointer-events-none left-3 top-1/2 text-slate-400" />
                                    <select
                                        value={data.client_id}
                                        onChange={(e) => setData('client_id', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Nenhum cliente</option>
                                        {clients.map((client) => (
                                            <option key={client.id} value={client.id}>
                                                {client.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.client_id && <p className="mt-1 text-sm text-red-600">{errors.client_id}</p>}
                            </div>

                            {/* Referência */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    Referência (opcional)
                                </label>
                                <div className="relative">
                                    <FileText className="absolute w-5 h-5 transform -translate-y-1/2 pointer-events-none left-3 top-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={data.reference}
                                        onChange={(e) => setData('reference', e.target.value)}
                                        placeholder="Ex: Fatura #123"
                                        className="w-full pl-10 pr-4 py-2.5 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                {errors.reference && <p className="mt-1 text-sm text-red-600">{errors.reference}</p>}
                            </div>

                            {/* Descrição */}
                            <div className="md:col-span-2">
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    Descrição *
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={3}
                                    placeholder="Descreva a transação..."
                                    className="w-full px-4 py-2.5 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                            </div>

                            {/* Observações */}
                            <div className="md:col-span-2">
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    Observações (opcional)
                                </label>
                                <textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={2}
                                    placeholder="Informações adicionais..."
                                    className="w-full px-4 py-2.5 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Link
                            href="/financial"
                            className="px-6 py-2.5 text-sm font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" />
                            {processing ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    )
}
