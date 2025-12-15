import { useState } from 'react'
import { Head, Link } from '@inertiajs/react'
import DashboardLayout from '@/Layouts/DashboardLayout'
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Users,
    Ship,
    Receipt,
    FileText,
    Calendar,
    BarChart3,
    PieChart,
    CheckCircle2,
    Plus,
} from 'lucide-react'

export default function Index({
    costsByClient = [],
    costsByShippingLine = [],
    costsByExpenseType = [],
    statement = [],
    summary = {},
    filters = {}
}) {
    const [activeTab, setActiveTab] = useState('summary')

    // Formatar moeda
    const formatCurrency = (value) => {
        if (!value) return 'MZN 0,00'
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: 'MZN'
        }).format(value)
    }

    // Tabs
    const tabs = [
        { id: 'summary', label: 'Resumo Financeiro', icon: BarChart3 },
        { id: 'clients', label: 'Custos por Cliente', icon: Users },
        { id: 'shipping', label: 'Custos por Linha', icon: Ship },
        { id: 'expenses', label: 'Tipos de Despesa', icon: Receipt },
        { id: 'statement', label: 'Extrato Geral', icon: FileText },
    ]

    return (
        <DashboardLayout>
            <Head title="Relatórios Financeiros" />

            <div className="p-6 ml-5 -mt-3 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Relatórios Financeiros</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Análise completa de custos e receitas
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 text-sm bg-white border rounded-lg border-slate-200">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">Últimos 12 meses</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white border-b border-slate-200">
                    <div className="flex gap-2 px-4 overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                    {/* Resumo Financeiro */}
                    {activeTab === 'summary' && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="p-6 bg-white border rounded-lg border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">Total de Custos</p>
                                        <p className="mt-2 text-2xl font-bold text-red-600">
                                            {formatCurrency(summary.total_costs)}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-red-50">
                                        <TrendingDown className="w-6 h-6 text-red-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-white border rounded-lg border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">Total Faturado</p>
                                        <p className="mt-2 text-2xl font-bold text-emerald-600">
                                            {formatCurrency(summary.total_invoiced)}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-emerald-50">
                                        <TrendingUp className="w-6 h-6 text-emerald-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-white border rounded-lg border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">Total Recebido</p>
                                        <p className="mt-2 text-2xl font-bold text-blue-600">
                                            {formatCurrency(summary.total_received)}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-blue-50">
                                        <DollarSign className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-white border rounded-lg border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">Em Aberto</p>
                                        <p className="mt-2 text-2xl font-bold text-amber-600">
                                            {formatCurrency(summary.outstanding)}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-amber-50">
                                        <Receipt className="w-6 h-6 text-amber-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-white border rounded-lg border-slate-200 md:col-span-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">Margem de Lucro</p>
                                        <p className="mt-2 text-2xl font-bold text-purple-600">
                                            {summary.profit_margin ? summary.profit_margin.toFixed(2) : '0.00'}%
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-purple-50">
                                        <PieChart className="w-6 h-6 text-purple-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-white border rounded-lg border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">Processos Ativos</p>
                                        <p className="mt-2 text-2xl font-bold text-blue-600">
                                            {summary.active_processes || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-white border rounded-lg border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">Processos Concluídos</p>
                                        <p className="mt-2 text-2xl font-bold text-emerald-600">
                                            {summary.completed_processes || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Custos por Cliente */}
                    {activeTab === 'clients' && (
                        <div className="bg-white border rounded-lg border-slate-200">
                            <div className="p-6 border-b border-slate-200">
                                <h2 className="text-lg font-bold text-slate-900">Custos por Cliente</h2>
                                <p className="text-sm text-slate-500">Análise de custos e receitas por cliente</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                                                Cliente
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                                                Processos
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                                                Total Custos
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                                                Total Faturado
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                                                Total Pago
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                                                Em Aberto
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {costsByClient.length > 0 ? (
                                            costsByClient.map((client) => (
                                                <tr key={client.id} className="hover:bg-slate-50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-lg bg-blue-50">
                                                                <Users className="w-4 h-4 text-blue-600" />
                                                            </div>
                                                            <span className="font-medium text-slate-900">{client.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">
                                                        {client.shipments_count}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-red-600">
                                                        {formatCurrency(client.total_costs)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-emerald-600">
                                                        {formatCurrency(client.total_invoiced)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-blue-600">
                                                        {formatCurrency(client.total_paid)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-amber-600">
                                                        {formatCurrency(client.outstanding)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <Users className="w-12 h-12 text-slate-300" />
                                                        <p className="text-sm font-medium text-slate-600">Nenhum cliente encontrado</p>
                                                        <p className="text-xs text-slate-500">Adicione clientes e processos para ver os dados aqui</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Custos por Linha de Navegação */}
                    {activeTab === 'shipping' && (
                        <div className="bg-white border rounded-lg border-slate-200">
                            <div className="p-6 border-b border-slate-200">
                                <h2 className="text-lg font-bold text-slate-900">Custos por Linha de Navegação</h2>
                                <p className="text-sm text-slate-500">Análise de custos por companhia marítima</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                                                Linha de Navegação
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                                                Código
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                                                Processos
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                                                Total Custos
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                                                Custo Médio
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                                                Serviços
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {costsByShippingLine.length > 0 ? (
                                            costsByShippingLine.map((line) => (
                                                <tr key={line.id} className="hover:bg-slate-50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-lg bg-blue-50">
                                                                <Ship className="w-4 h-4 text-blue-600" />
                                                            </div>
                                                            <span className="font-medium text-slate-900">{line.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">
                                                        {line.code}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">
                                                        {line.shipments_count}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-red-600">
                                                        {formatCurrency(line.total_costs)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">
                                                        {formatCurrency(line.average_cost)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            {line.services && line.services.slice(0, 3).map((service, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-blue-50 text-blue-700"
                                                                >
                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                    {service}
                                                                </span>
                                                            ))}
                                                            {line.services && line.services.length > 3 && (
                                                                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-slate-100 text-slate-600">
                                                                    +{line.services.length - 3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <Ship className="w-12 h-12 text-slate-300" />
                                                        <p className="text-sm font-medium text-slate-600">Nenhuma linha de navegação encontrada</p>
                                                        <p className="text-xs text-slate-500">Adicione linhas de navegação para ver os custos aqui</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Custos por Tipo de Despesa */}
                    {activeTab === 'expenses' && (
                        <div>
                            {costsByExpenseType.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {costsByExpenseType.map((expense) => (
                                        <div key={expense.type} className="p-6 bg-white border rounded-lg border-slate-200">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="p-2 rounded-lg bg-purple-50">
                                                            <Receipt className="w-5 h-5 text-purple-600" />
                                                        </div>
                                                        <h3 className="text-sm font-bold text-slate-900">{expense.label}</h3>
                                                    </div>
                                                    <p className="text-2xl font-bold text-purple-600">
                                                        {formatCurrency(expense.total_amount)}
                                                    </p>
                                                    <div className="mt-4 space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-600">Quantidade:</span>
                                                            <span className="font-medium text-slate-900">{expense.count}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-600">Média:</span>
                                                            <span className="font-medium text-slate-900">
                                                                {formatCurrency(expense.average)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center bg-white border rounded-lg border-slate-200">
                                    <div className="flex flex-col items-center gap-3">
                                        <Receipt className="w-12 h-12 text-slate-300" />
                                        <p className="text-sm font-medium text-slate-600">Nenhuma despesa encontrada</p>
                                        <p className="text-xs text-slate-500">Registre despesas em processos para ver a análise aqui</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Extrato Geral */}
                    {activeTab === 'statement' && (
                        <div className="bg-white border rounded-lg border-slate-200">
                            <div className="flex items-center justify-between p-6 border-b border-slate-200">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Extrato Geral</h2>
                                    <p className="text-sm text-slate-500">Todas as transações financeiras</p>
                                </div>
                                <Link
                                    href="/financial-transactions/create"
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    <Plus className="w-4 h-4" />
                                    Adicionar Transação
                                </Link>
                            </div>
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
                                                Descrição
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                                                Cliente
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                                                Referência
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase text-slate-500">
                                                Débito
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase text-slate-500">
                                                Crédito
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {statement.length > 0 ? (
                                            statement.map((transaction, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50">
                                                    <td className="px-6 py-4 text-sm text-slate-600">
                                                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
                                                            transaction.type === 'payment_request'
                                                                ? 'bg-red-100 text-red-700'
                                                                : transaction.type === 'invoice'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : transaction.type === 'receipt'
                                                                ? 'bg-emerald-100 text-emerald-700'
                                                                : transaction.type === 'credit_note'
                                                                ? 'bg-orange-100 text-orange-700'
                                                                : transaction.type === 'debit_note'
                                                                ? 'bg-purple-100 text-purple-700'
                                                                : 'bg-indigo-100 text-indigo-700'
                                                        }`}>
                                                            {transaction.type === 'payment_request' ? 'Despesa' :
                                                             transaction.type === 'invoice' ? 'Fatura' :
                                                             transaction.type === 'receipt' ? 'Recibo' :
                                                             transaction.type === 'credit_note' ? 'Nota Crédito' :
                                                             transaction.type === 'debit_note' ? 'Nota Débito' : 'Transação Avulsa'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-900">
                                                        {transaction.description}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">
                                                        {transaction.client}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-blue-600">
                                                        {transaction.reference}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-right text-red-600">
                                                        {transaction.debit > 0 ? formatCurrency(transaction.debit) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-right text-emerald-600">
                                                        {transaction.credit > 0 ? formatCurrency(transaction.credit) : '-'}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <FileText className="w-12 h-12 text-slate-300" />
                                                        <p className="text-sm font-medium text-slate-600">Nenhuma transação encontrada</p>
                                                        <p className="text-xs text-slate-500">Registre despesas, faturas e recibos para ver o extrato aqui</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
