import { useState, useMemo } from 'react'
import { Head, Link } from '@inertiajs/react'
import DashboardLayout from '@/Layouts/DashboardLayout'
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Users,
    Ship,
    Receipt,
    BarChart3,
    FileText,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Download,
    ArrowUpDown,
    ChevronUp,
    ChevronDown,
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
    const [dateRange, setDateRange] = useState('12months')
    const [searchTerm, setSearchTerm] = useState('')
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

    // Formatar moeda
    const formatCurrency = (value) => {
        if (!value) return 'MZN 0,00'
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: 'MZN'
        }).format(value)
    }

    // Formatar data
    const formatDate = (date) => {
        if (!date) return 'N/A'
        return new Date(date).toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    // Badge de tipo de transação
    const getTypeBadge = (type) => {
        const badges = {
            'payment_request': { label: 'Despesa', color: 'bg-red-100 text-red-700' },
            'invoice': { label: 'Fatura', color: 'bg-blue-100 text-blue-700' },
            'receipt': { label: 'Recibo', color: 'bg-green-100 text-green-700' },
            'credit_note': { label: 'Nota Crédito', color: 'bg-orange-100 text-orange-700' },
            'debit_note': { label: 'Nota Débito', color: 'bg-purple-100 text-purple-700' },
            'financial_transaction': { label: 'Transação', color: 'bg-indigo-100 text-indigo-700' },
        }
        const badge = badges[type] || { label: type, color: 'bg-gray-100 text-gray-700' }
        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badge.color}`}>
                {badge.label}
            </span>
        )
    }

    // Função de ordenação
    const handleSort = (key) => {
        let direction = 'asc'
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        setSortConfig({ key, direction })
    }

    // Ícone de ordenação
    const getSortIcon = (key) => {
        if (sortConfig.key !== key) {
            return <ArrowUpDown className="w-4 h-4 ml-1 text-slate-400" />
        }
        return sortConfig.direction === 'asc'
            ? <ChevronUp className="w-4 h-4 ml-1 text-blue-600" />
            : <ChevronDown className="w-4 h-4 ml-1 text-blue-600" />
    }

    // Função para exportar para CSV
    const exportToCSV = (data, filename) => {
        if (!data || data.length === 0) {
            alert('Sem dados para exportar')
            return
        }

        const headers = Object.keys(data[0])
        const csvContent = [
            headers.join(','),
            ...data.map(row =>
                headers.map(header => {
                    const value = row[header]
                    return typeof value === 'string' && value.includes(',')
                        ? `"${value}"`
                        : value
                }).join(',')
            )
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
    }

    // Dados filtrados e ordenados do extrato
    const filteredStatement = useMemo(() => {
        let filtered = [...statement]

        // Filtrar por busca
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.reference?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Ordenar
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                const aVal = a[sortConfig.key]
                const bVal = b[sortConfig.key]

                if (aVal === bVal) return 0

                const comparison = aVal < bVal ? -1 : 1
                return sortConfig.direction === 'asc' ? comparison : -comparison
            })
        }

        return filtered
    }, [statement, searchTerm, sortConfig])

    // Dados filtrados por cliente
    const filteredClients = useMemo(() => {
        let filtered = [...costsByClient]

        if (searchTerm) {
            filtered = filtered.filter(client =>
                client.name?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                const aVal = a[sortConfig.key]
                const bVal = b[sortConfig.key]

                if (aVal === bVal) return 0

                const comparison = aVal < bVal ? -1 : 1
                return sortConfig.direction === 'asc' ? comparison : -comparison
            })
        }

        return filtered
    }, [costsByClient, searchTerm, sortConfig])

    // Tabs
    const tabs = [
        { id: 'summary', label: 'Dashboard', icon: BarChart3 },
        { id: 'statement', label: 'Extrato Geral', icon: FileText },
        { id: 'clients', label: 'Por Cliente', icon: Users },
        { id: 'shipping', label: 'Por Linha', icon: Ship },
        { id: 'expenses', label: 'Por Despesa', icon: Receipt },
        { id: 'cashflow', label: 'Fluxo de Caixa', icon: TrendingUp },
    ]

    // Calcular estatísticas do extrato (usando dados filtrados)
    const statementStats = useMemo(() => ({
        total_debit: filteredStatement.reduce((sum, item) => sum + (parseFloat(item.debit) || 0), 0),
        total_credit: filteredStatement.reduce((sum, item) => sum + (parseFloat(item.credit) || 0), 0),
        balance: filteredStatement.reduce((sum, item) => {
            return sum + (parseFloat(item.credit) || 0) - (parseFloat(item.debit) || 0)
        }, 0),
        transactions_count: filteredStatement.length
    }), [filteredStatement])

    return (
        <DashboardLayout>
            <Head title="Análise Financeira" />

            <div className="p-6 ml-5 -mt-3 space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Análise Financeira</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Visão completa de custos, receitas e fluxo de caixa
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="px-4 py-2 text-sm bg-white border rounded-lg border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="1month">Último Mês</option>
                            <option value="3months">Últimos 3 Meses</option>
                            <option value="6months">Últimos 6 Meses</option>
                            <option value="12months">Últimos 12 Meses</option>
                            <option value="all">Todo Período</option>
                        </select>

                        <Link
                            href="/financial-transactions/create"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            <DollarSign className="w-4 h-4" />
                            Nova Transação
                        </Link>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white border-b rounded-t-lg border-slate-200">
                    <div className="flex gap-1 px-2 overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap rounded-t-lg ${
                                    activeTab === tab.id
                                        ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Barra de Ferramentas (mostrar apenas nas tabs com tabelas) */}
                {['statement', 'clients', 'shipping', 'expenses'].includes(activeTab) && (
                    <div className="flex flex-col gap-3 p-4 bg-white border rounded-lg sm:flex-row sm:items-center sm:justify-between border-slate-200">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full py-2 pl-10 pr-4 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    const data = activeTab === 'statement' ? filteredStatement :
                                                 activeTab === 'clients' ? filteredClients :
                                                 activeTab === 'shipping' ? costsByShippingLine :
                                                 costsByExpenseType
                                    exportToCSV(data, `financial_${activeTab}`)
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
                            >
                                <Download className="w-4 h-4" />
                                Exportar CSV
                            </button>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    Limpar Busca
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab Content */}
                <div className="space-y-6">
                    {/* Dashboard Tab */}
                    {activeTab === 'summary' && (
                        <div className="space-y-6">
                            {/* Cards de Resumo */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-red-600 uppercase">Total de Custos</p>
                                            <p className="mt-2 text-2xl font-bold text-red-900">
                                                {formatCurrency(summary.total_costs)}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-white rounded-lg shadow-sm">
                                            <TrendingDown className="w-6 h-6 text-red-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-xs font-medium uppercase text-emerald-600">Total Faturado</p>
                                            <p className="mt-2 text-2xl font-bold text-emerald-900">
                                                {formatCurrency(summary.total_invoiced)}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-white rounded-lg shadow-sm">
                                            <TrendingUp className="w-6 h-6 text-emerald-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-blue-600 uppercase">Total Recebido</p>
                                            <p className="mt-2 text-2xl font-bold text-blue-900">
                                                {formatCurrency(summary.total_received)}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-white rounded-lg shadow-sm">
                                            <DollarSign className="w-6 h-6 text-blue-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-amber-600 uppercase">Em Aberto</p>
                                            <p className="mt-2 text-2xl font-bold text-amber-900">
                                                {formatCurrency(summary.outstanding)}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-white rounded-lg shadow-sm">
                                            <Clock className="w-6 h-6 text-amber-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cards de Estatísticas Adicionais */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="p-6 bg-white border rounded-lg border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-600">Margem de Lucro</p>
                                            <p className="mt-2 text-3xl font-bold text-purple-600">
                                                {summary.profit_margin ? summary.profit_margin.toFixed(1) : '0.0'}%
                                            </p>
                                        </div>
                                        <PieChart className="w-8 h-8 text-purple-600" />
                                    </div>
                                </div>

                                <div className="p-6 bg-white border rounded-lg border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-600">Processos Ativos</p>
                                            <p className="mt-2 text-3xl font-bold text-blue-600">
                                                {summary.active_processes || 0}
                                            </p>
                                        </div>
                                        <FileText className="w-8 h-8 text-blue-600" />
                                    </div>
                                </div>

                                <div className="p-6 bg-white border rounded-lg border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-600">Processos Concluídos</p>
                                            <p className="mt-2 text-3xl font-bold text-emerald-600">
                                                {summary.completed_processes || 0}
                                            </p>
                                        </div>
                                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                                    </div>
                                </div>

                                <div className="p-6 bg-white border rounded-lg border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-600">Notas de Crédito</p>
                                            <p className="mt-2 text-3xl font-bold text-orange-600">
                                                {formatCurrency(summary.total_credit_notes)}
                                            </p>
                                        </div>
                                        <ArrowDownRight className="w-8 h-8 text-orange-600" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Extrato Geral Tab */}
                    {activeTab === 'statement' && (
                        <div className="space-y-4">
                            {/* Estatísticas do Extrato */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                                <div className="p-4 bg-white border rounded-lg border-slate-200">
                                    <p className="text-xs font-medium text-slate-600">Total Débitos</p>
                                    <p className="mt-2 text-xl font-bold text-red-600">
                                        {formatCurrency(statementStats.total_debit)}
                                    </p>
                                </div>
                                <div className="p-4 bg-white border rounded-lg border-slate-200">
                                    <p className="text-xs font-medium text-slate-600">Total Créditos</p>
                                    <p className="mt-2 text-xl font-bold text-green-600">
                                        {formatCurrency(statementStats.total_credit)}
                                    </p>
                                </div>
                                <div className="p-4 bg-white border rounded-lg border-slate-200">
                                    <p className="text-xs font-medium text-slate-600">Saldo</p>
                                    <p className={`mt-2 text-xl font-bold ${statementStats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(statementStats.balance)}
                                    </p>
                                </div>
                                <div className="p-4 bg-white border rounded-lg border-slate-200">
                                    <p className="text-xs font-medium text-slate-600">Transações</p>
                                    <p className="mt-2 text-xl font-bold text-blue-600">
                                        {statementStats.transactions_count}
                                    </p>
                                </div>
                            </div>

                            {/* Tabela do Extrato */}
                            <div className="overflow-hidden bg-white border rounded-lg border-slate-200">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th
                                                    className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase cursor-pointer text-slate-500 hover:text-slate-700"
                                                    onClick={() => handleSort('date')}
                                                >
                                                    <div className="flex items-center">
                                                        Data
                                                        {getSortIcon('date')}
                                                    </div>
                                                </th>
                                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">Tipo</th>
                                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">Descrição</th>
                                                <th
                                                    className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase cursor-pointer text-slate-500 hover:text-slate-700"
                                                    onClick={() => handleSort('client')}
                                                >
                                                    <div className="flex items-center">
                                                        Cliente
                                                        {getSortIcon('client')}
                                                    </div>
                                                </th>
                                                <th
                                                    className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase cursor-pointer text-slate-500 hover:text-slate-700"
                                                    onClick={() => handleSort('debit')}
                                                >
                                                    <div className="flex items-center justify-end">
                                                        Débito
                                                        {getSortIcon('debit')}
                                                    </div>
                                                </th>
                                                <th
                                                    className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase cursor-pointer text-slate-500 hover:text-slate-700"
                                                    onClick={() => handleSort('credit')}
                                                >
                                                    <div className="flex items-center justify-end">
                                                        Crédito
                                                        {getSortIcon('credit')}
                                                    </div>
                                                </th>
                                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase text-slate-500">Referência</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-200">
                                            {filteredStatement.length > 0 ? (
                                                filteredStatement.map((item, index) => (
                                                    <tr key={index} className="hover:bg-slate-50">
                                                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                                                            {formatDate(item.date)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {getTypeBadge(item.type)}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-slate-900">
                                                            {item.description}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-slate-600">
                                                            {item.client || 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-medium text-right text-red-600 whitespace-nowrap">
                                                            {item.debit > 0 ? formatCurrency(item.debit) : '-'}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-medium text-right text-green-600 whitespace-nowrap">
                                                            {item.credit > 0 ? formatCurrency(item.credit) : '-'}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-right text-slate-500 whitespace-nowrap">
                                                            {item.reference || '-'}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className="px-6 py-12 text-center">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <FileText className="w-12 h-12 text-slate-300" />
                                                            <p className="text-sm font-medium text-slate-600">Nenhuma transação encontrada</p>
                                                            <p className="text-xs text-slate-500">Adicione transações para ver o extrato</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Custos por Cliente Tab */}
                    {activeTab === 'clients' && (
                        <div className="bg-white border rounded-lg border-slate-200">
                            <div className="p-6 border-b border-slate-200">
                                <h2 className="text-lg font-bold text-slate-900">Análise por Cliente</h2>
                                <p className="text-sm text-slate-500">Custos, receitas e saldo por cliente</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th
                                                className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase cursor-pointer text-slate-500 hover:text-slate-700"
                                                onClick={() => handleSort('name')}
                                            >
                                                <div className="flex items-center">
                                                    Cliente
                                                    {getSortIcon('name')}
                                                </div>
                                            </th>
                                            <th
                                                className="px-6 py-3 text-xs font-medium tracking-wider text-center uppercase cursor-pointer text-slate-500 hover:text-slate-700"
                                                onClick={() => handleSort('shipments_count')}
                                            >
                                                <div className="flex items-center justify-center">
                                                    Processos
                                                    {getSortIcon('shipments_count')}
                                                </div>
                                            </th>
                                            <th
                                                className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase cursor-pointer text-slate-500 hover:text-slate-700"
                                                onClick={() => handleSort('total_costs')}
                                            >
                                                <div className="flex items-center justify-end">
                                                    Custos
                                                    {getSortIcon('total_costs')}
                                                </div>
                                            </th>
                                            <th
                                                className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase cursor-pointer text-slate-500 hover:text-slate-700"
                                                onClick={() => handleSort('total_invoiced')}
                                            >
                                                <div className="flex items-center justify-end">
                                                    Faturado
                                                    {getSortIcon('total_invoiced')}
                                                </div>
                                            </th>
                                            <th
                                                className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase cursor-pointer text-slate-500 hover:text-slate-700"
                                                onClick={() => handleSort('total_paid')}
                                            >
                                                <div className="flex items-center justify-end">
                                                    Pago
                                                    {getSortIcon('total_paid')}
                                                </div>
                                            </th>
                                            <th
                                                className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase cursor-pointer text-slate-500 hover:text-slate-700"
                                                onClick={() => handleSort('outstanding')}
                                            >
                                                <div className="flex items-center justify-end">
                                                    Em Aberto
                                                    {getSortIcon('outstanding')}
                                                </div>
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase text-slate-500">Lucro</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {filteredClients.length > 0 ? (
                                            filteredClients.map((client) => {
                                                const profit = (client.total_invoiced || 0) - (client.total_costs || 0)
                                                return (
                                                    <tr key={client.id} className="hover:bg-slate-50">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 rounded-lg bg-blue-50">
                                                                    <Users className="w-4 h-4 text-blue-600" />
                                                                </div>
                                                                <span className="font-medium text-slate-900">{client.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-center text-slate-600">
                                                            {client.shipments_count || 0}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-medium text-right text-red-600 whitespace-nowrap">
                                                            {formatCurrency(client.total_costs)}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-medium text-right text-emerald-600 whitespace-nowrap">
                                                            {formatCurrency(client.total_invoiced)}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-medium text-right text-blue-600 whitespace-nowrap">
                                                            {formatCurrency(client.total_paid)}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-medium text-right text-amber-600 whitespace-nowrap">
                                                            {formatCurrency(client.outstanding)}
                                                        </td>
                                                        <td className={`px-6 py-4 text-sm font-bold text-right whitespace-nowrap ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {formatCurrency(profit)}
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <Users className="w-12 h-12 text-slate-300" />
                                                        <p className="text-sm font-medium text-slate-600">Nenhum cliente encontrado</p>
                                                        <p className="text-xs text-slate-500">Adicione clientes e processos para ver os dados</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Custos por Linha de Navegação Tab */}
                    {activeTab === 'shipping' && (
                        <div className="bg-white border rounded-lg border-slate-200">
                            <div className="p-6 border-b border-slate-200">
                                <h2 className="text-lg font-bold text-slate-900">Análise por Linha de Navegação</h2>
                                <p className="text-sm text-slate-500">Custos e estatísticas por companhia marítima</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">Linha</th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">Código</th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-center uppercase text-slate-500">Processos</th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase text-slate-500">Total Custos</th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase text-slate-500">Custo Médio</th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">Serviços</th>
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
                                                        {line.code || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-center text-slate-600">
                                                        {line.shipments_count || 0}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-right text-red-600 whitespace-nowrap">
                                                        {formatCurrency(line.total_costs)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-right text-blue-600 whitespace-nowrap">
                                                        {formatCurrency(line.average_cost)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">
                                                        {line.services_count || 0} serviços
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <Ship className="w-12 h-12 text-slate-300" />
                                                        <p className="text-sm font-medium text-slate-600">Nenhuma linha encontrada</p>
                                                        <p className="text-xs text-slate-500">Adicione linhas de navegação para ver os dados</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Custos por Tipo de Despesa Tab */}
                    {activeTab === 'expenses' && (
                        <div className="bg-white border rounded-lg border-slate-200">
                            <div className="p-6 border-b border-slate-200">
                                <h2 className="text-lg font-bold text-slate-900">Análise por Tipo de Despesa</h2>
                                <p className="text-sm text-slate-500">Distribuição de custos por categoria</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">Tipo de Despesa</th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-center uppercase text-slate-500">Quantidade</th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase text-slate-500">Total</th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase text-slate-500">Percentual</th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase text-slate-500">Média</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {costsByExpenseType.length > 0 ? (
                                            costsByExpenseType.map((expense, index) => (
                                                <tr key={index} className="hover:bg-slate-50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-lg bg-purple-50">
                                                                <Receipt className="w-4 h-4 text-purple-600" />
                                                            </div>
                                                            <span className="font-medium text-slate-900">{expense.label || expense.type}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-center text-slate-600">
                                                        {expense.count || 0}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-right text-red-600 whitespace-nowrap">
                                                        {formatCurrency(expense.total_amount || expense.total)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-right text-slate-600 whitespace-nowrap">
                                                        {expense.percentage ? expense.percentage.toFixed(1) : '0.0'}%
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-right text-blue-600 whitespace-nowrap">
                                                        {formatCurrency(expense.average)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <Receipt className="w-12 h-12 text-slate-300" />
                                                        <p className="text-sm font-medium text-slate-600">Nenhuma despesa encontrada</p>
                                                        <p className="text-xs text-slate-500">Adicione despesas para ver a análise</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Fluxo de Caixa Tab */}
                    {activeTab === 'cashflow' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Entradas */}
                                <div className="bg-white border rounded-lg border-slate-200">
                                    <div className="p-6 border-b bg-green-50 border-slate-200">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-white rounded-lg shadow-sm">
                                                <ArrowUpRight className="w-6 h-6 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900">Entradas</h3>
                                                <p className="text-sm text-slate-600">Receitas e recebimentos</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                                            <span className="text-sm font-medium text-slate-600">Faturas Pagas</span>
                                            <span className="text-lg font-bold text-green-600">
                                                {formatCurrency(summary.total_received)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                                            <span className="text-sm font-medium text-slate-600">Notas de Débito</span>
                                            <span className="text-lg font-bold text-green-600">
                                                {formatCurrency(summary.total_debit_notes)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-green-100 border-2 border-green-300 rounded-lg">
                                            <span className="font-bold text-green-800">Total de Entradas</span>
                                            <span className="text-xl font-bold text-green-800">
                                                {formatCurrency((summary.total_received || 0) + (summary.total_debit_notes || 0))}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Saídas */}
                                <div className="bg-white border rounded-lg border-slate-200">
                                    <div className="p-6 border-b bg-red-50 border-slate-200">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-white rounded-lg shadow-sm">
                                                <ArrowDownRight className="w-6 h-6 text-red-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900">Saídas</h3>
                                                <p className="text-sm text-slate-600">Custos e despesas</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                                            <span className="text-sm font-medium text-slate-600">Total de Custos</span>
                                            <span className="text-lg font-bold text-red-600">
                                                {formatCurrency(summary.total_costs)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                                            <span className="text-sm font-medium text-slate-600">Notas de Crédito</span>
                                            <span className="text-lg font-bold text-red-600">
                                                {formatCurrency(summary.total_credit_notes)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-red-100 border-2 border-red-300 rounded-lg">
                                            <span className="font-bold text-red-800">Total de Saídas</span>
                                            <span className="text-xl font-bold text-red-800">
                                                {formatCurrency((summary.total_costs || 0) + (summary.total_credit_notes || 0))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Resultado Final */}
                            <div className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">Fluxo de Caixa Líquido</p>
                                        <p className="mt-1 text-xs text-slate-500">Entradas - Saídas</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-4xl font-bold ${
                                            ((summary.total_received || 0) + (summary.total_debit_notes || 0)) -
                                            ((summary.total_costs || 0) + (summary.total_credit_notes || 0)) >= 0
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                        }`}>
                                            {formatCurrency(
                                                ((summary.total_received || 0) + (summary.total_debit_notes || 0)) -
                                                ((summary.total_costs || 0) + (summary.total_credit_notes || 0))
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
