import { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import DashboardLayout from '@/Layouts/DashboardLayout'
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Plus,
    Edit2,
    Trash2,
    Calendar,
    User,
    FileText,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react'

export default function Index({ transactions }) {
    const formatCurrency = (value) => {
        if (!value) return 'MZN 0,00'
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: 'MZN'
        }).format(value)
    }

    const formatDate = (date) => {
        if (!date) return 'N/A'
        return new Date(date).toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    const handleDelete = (id) => {
        if (confirm('Tem certeza que deseja excluir esta transação?')) {
            router.delete(`/financial-transactions/${id}`, {
                preserveScroll: true,
            })
        }
    }

    // Calcular totais
    const totalIncome = transactions.data?.reduce((sum, t) => {
        return sum + (t.type === 'income' ? parseFloat(t.amount) : 0)
    }, 0) || 0

    const totalExpense = transactions.data?.reduce((sum, t) => {
        return sum + (t.type === 'expense' ? parseFloat(t.amount) : 0)
    }, 0) || 0

    const balance = totalIncome - totalExpense

    return (
        <DashboardLayout>
            <Head title="Transações Financeiras" />

            <div className="p-6 ml-5 -mt-3 space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Transações Financeiras</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Gerencie entradas e saídas avulsas
                        </p>
                    </div>

                    <Link
                        href="/financial-transactions/create"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4" />
                        Nova Transação
                    </Link>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-xs font-medium text-green-600 uppercase">Total Entradas</p>
                                <p className="mt-2 text-2xl font-bold text-green-900">
                                    {formatCurrency(totalIncome)}
                                </p>
                            </div>
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                                <ArrowUpRight className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-xs font-medium text-red-600 uppercase">Total Saídas</p>
                                <p className="mt-2 text-2xl font-bold text-red-900">
                                    {formatCurrency(totalExpense)}
                                </p>
                            </div>
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                                <ArrowDownRight className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>

                    <div className={`p-6 bg-gradient-to-br border rounded-xl ${
                        balance >= 0
                            ? 'from-blue-50 to-blue-100 border-blue-200'
                            : 'from-orange-50 to-orange-100 border-orange-200'
                    }`}>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className={`text-xs font-medium uppercase ${
                                    balance >= 0 ? 'text-blue-600' : 'text-orange-600'
                                }`}>
                                    Saldo
                                </p>
                                <p className={`mt-2 text-2xl font-bold ${
                                    balance >= 0 ? 'text-blue-900' : 'text-orange-900'
                                }`}>
                                    {formatCurrency(balance)}
                                </p>
                            </div>
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                                <DollarSign className={`w-6 h-6 ${
                                    balance >= 0 ? 'text-blue-600' : 'text-orange-600'
                                }`} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="overflow-hidden bg-white border rounded-lg border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                                        Data
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                                        Categoria
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                                        Descrição
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                                        Cliente
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase text-slate-500">
                                        Valor
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase text-slate-500">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {transactions.data && transactions.data.length > 0 ? (
                                    transactions.data.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                    {formatDate(transaction.transaction_date)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {transaction.type === 'income' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                                                        <ArrowUpRight className="w-3 h-3" />
                                                        Entrada
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
                                                        <ArrowDownRight className="w-3 h-3" />
                                                        Saída
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {transaction.category || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-900">
                                                {transaction.description}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {transaction.client ? (
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-slate-400" />
                                                        {transaction.client.name}
                                                    </div>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                            <td className={`px-6 py-4 text-sm font-bold text-right whitespace-nowrap ${
                                                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/financial-transactions/${transaction.id}/edit`}
                                                        className="p-2 text-blue-600 transition-colors rounded hover:bg-blue-50"
                                                        title="Editar"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(transaction.id)}
                                                        className="p-2 text-red-600 transition-colors rounded hover:bg-red-50"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <FileText className="w-12 h-12 text-slate-300" />
                                                <p className="text-sm font-medium text-slate-600">
                                                    Nenhuma transação encontrada
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Clique em "Nova Transação" para adicionar
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {transactions.links && transactions.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-slate-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-slate-600">
                                    Mostrando {transactions.from || 0} a {transactions.to || 0} de {transactions.total || 0} transações
                                </div>
                                <div className="flex gap-2">
                                    {transactions.links.map((link, index) => (
                                        link.url ? (
                                            <Link
                                                key={index}
                                                href={link.url}
                                                className={`px-3 py-1 text-sm rounded ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <span
                                                key={index}
                                                className="px-3 py-1 text-sm text-slate-400 bg-white border border-slate-200 rounded"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        )
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
