import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    Calendar,
    PieChart,
    BarChart3,
    Plus,
    Edit2,
    Trash2,
    X,
    Save,
    Target,
    Activity,
} from 'lucide-react';

export default function Budgets({ budgets, currentYear, yearlyStats }) {
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);

    // Mudar ano
    const handleYearChange = (year) => {
        setSelectedYear(year);
        router.get('/finance/budgets', { year }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Calcular percentual usado
    const calculatePercentage = (spent, budget) => {
        if (!budget || budget === 0) return 0;
        return Math.round((spent / budget) * 100);
    };

    // Determinar cor baseado no uso
    const getUsageColor = (percentage) => {
        if (percentage >= 90) return 'red';
        if (percentage >= 75) return 'amber';
        return 'green';
    };

    // Formatar moeda
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: 'MZN',
        }).format(amount);
    };

    return (
        <DashboardLayout>
            <Head title="Controle Orçamental - Finanças" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Controle Orçamental
                        </h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Gerencie orçamentos por categoria e monitore gastos
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {/* Seletor de Ano */}
                        <select
                            value={selectedYear}
                            onChange={(e) => handleYearChange(e.target.value)}
                            className="px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
                        >
                            {[2023, 2024, 2025, 2026].map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4" />
                            Novo Orçamento
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    <StatCard
                        title="Orçamento Total"
                        value={formatCurrency(yearlyStats.total_budget)}
                        icon={Target}
                        color="blue"
                    />
                    <StatCard
                        title="Total Gasto"
                        value={formatCurrency(yearlyStats.total_spent)}
                        icon={DollarSign}
                        percentage={calculatePercentage(yearlyStats.total_spent, yearlyStats.total_budget)}
                        color={getUsageColor(calculatePercentage(yearlyStats.total_spent, yearlyStats.total_budget))}
                    />
                    <StatCard
                        title="Disponível"
                        value={formatCurrency(yearlyStats.total_budget - yearlyStats.total_spent)}
                        icon={CheckCircle2}
                        color="green"
                    />
                    <StatCard
                        title="Taxa de Uso"
                        value={`${calculatePercentage(yearlyStats.total_spent, yearlyStats.total_budget)}%`}
                        icon={Activity}
                        color={getUsageColor(calculatePercentage(yearlyStats.total_spent, yearlyStats.total_budget))}
                    />
                </div>

                {/* Overview Gráfico */}
                <div className="p-6 bg-white border rounded-xl border-slate-200">
                    <h3 className="mb-4 text-lg font-semibold text-slate-900">
                        Visão Geral {selectedYear}
                    </h3>
                    <div className="space-y-4">
                        <OverviewBar
                            label="Orçamento Anual"
                            current={yearlyStats.total_spent}
                            total={yearlyStats.total_budget}
                            color="blue"
                        />
                    </div>
                </div>

                {/* Categorias de Orçamento */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Orçamentos por Categoria
                    </h2>

                    {budgets.length === 0 ? (
                        <div className="py-12 text-center bg-white border rounded-xl border-slate-200">
                            <PieChart className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                            <h3 className="mb-2 text-lg font-semibold text-slate-900">
                                Nenhum orçamento definido
                            </h3>
                            <p className="mb-6 text-sm text-slate-600">
                                Crie orçamentos por categoria para controlar melhor os gastos
                            </p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4" />
                                Criar Primeiro Orçamento
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {budgets.map((budget) => (
                                <BudgetCard
                                    key={budget.id}
                                    budget={budget}
                                    onEdit={setEditingBudget}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Alertas */}
                {budgets.some(b => calculatePercentage(b.spent, b.amount) >= 90) && (
                    <div className="p-4 border-l-4 border-red-500 rounded-lg bg-red-50">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 mt-0.5 text-red-600" />
                            <div>
                                <h4 className="font-semibold text-red-900">Atenção: Orçamento Crítico</h4>
                                <p className="mt-1 text-sm text-red-700">
                                    Algumas categorias atingiram 90% ou mais do orçamento. Revise os gastos.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Criar/Editar */}
            {(showCreateModal || editingBudget) && (
                <BudgetModal
                    budget={editingBudget}
                    year={selectedYear}
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingBudget(null);
                    }}
                />
            )}
        </DashboardLayout>
    );
}

// Componente de Card de Orçamento
function BudgetCard({ budget, onEdit }) {
    const percentage = Math.round((budget.spent / budget.amount) * 100);
    const remaining = budget.amount - budget.spent;
    const isWarning = percentage >= 75;
    const isCritical = percentage >= 90;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: 'MZN',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleDelete = () => {
        if (confirm(`Tem certeza que deseja excluir o orçamento de "${budget.category}"?`)) {
            router.delete(`/finance/budgets/${budget.id}`);
        }
    };

    return (
        <div className={`p-6 bg-white border rounded-xl transition-all ${
            isCritical ? 'border-red-300 bg-red-50' :
            isWarning ? 'border-amber-300 bg-amber-50' :
            'border-slate-200'
        }`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                        {budget.category}
                    </h3>
                    <p className="text-sm text-slate-600">
                        {budget.description || 'Sem descrição'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(budget)}
                        className="p-2 transition-colors rounded-lg hover:bg-blue-50"
                        title="Editar"
                    >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-2 transition-colors rounded-lg hover:bg-red-50"
                        title="Excluir"
                    >
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                </div>
            </div>

            {/* Valores */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                    <p className="text-xs font-medium text-slate-600">Orçamento</p>
                    <p className="text-lg font-bold text-slate-900">
                        {formatCurrency(budget.amount)}
                    </p>
                </div>
                <div>
                    <p className="text-xs font-medium text-slate-600">Gasto</p>
                    <p className="text-lg font-bold text-slate-900">
                        {formatCurrency(budget.spent)}
                    </p>
                </div>
                <div>
                    <p className="text-xs font-medium text-slate-600">Restante</p>
                    <p className={`text-lg font-bold ${
                        remaining < 0 ? 'text-red-600' :
                        isWarning ? 'text-amber-600' :
                        'text-green-600'
                    }`}>
                        {formatCurrency(remaining)}
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">Uso do Orçamento</span>
                    <span className={`font-bold ${
                        isCritical ? 'text-red-600' :
                        isWarning ? 'text-amber-600' :
                        'text-green-600'
                    }`}>
                        {percentage}%
                    </span>
                </div>
                <div className="w-full h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                        className={`h-full transition-all duration-500 ${
                            isCritical ? 'bg-red-500' :
                            isWarning ? 'bg-amber-500' :
                            'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                </div>
            </div>

            {/* Alertas */}
            {isCritical && (
                <div className="flex items-center gap-2 p-3 mt-4 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">
                        Orçamento crítico! Revise os gastos.
                    </span>
                </div>
            )}
            {isWarning && !isCritical && (
                <div className="flex items-center gap-2 p-3 mt-4 rounded-lg bg-amber-100">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">
                        Atenção: {100 - percentage}% restante
                    </span>
                </div>
            )}
        </div>
    );
}

// Componente de Modal
function BudgetModal({ budget, year, onClose }) {
    const { data, setData, post, put, processing, errors } = useForm({
        category: budget?.category || '',
        description: budget?.description || '',
        amount: budget?.amount || '',
        year: year,
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (budget) {
            put(`/finance/budgets/${budget.id}`, {
                onSuccess: () => onClose(),
            });
        } else {
            post('/finance/budgets', {
                onSuccess: () => onClose(),
            });
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg p-6 bg-white shadow-2xl rounded-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-900">
                        {budget ? 'Editar Orçamento' : 'Novo Orçamento'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 transition-colors rounded-lg hover:bg-slate-100"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Categoria */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            Categoria *
                        </label>
                        <select
                            value={data.category}
                            onChange={(e) => setData('category', e.target.value)}
                            required
                            className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Selecione...</option>
                            <option value="Coleta Dispersa">Coleta Dispersa</option>
                            <option value="Legalização">Legalização</option>
                            <option value="Alfândegas">Alfândegas</option>
                            <option value="Cornelder">Cornelder</option>
                            <option value="Transporte">Transporte</option>
                            <option value="Despesas Operacionais">Despesas Operacionais</option>
                            <option value="Outros">Outros</option>
                        </select>
                        {errors.category && (
                            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                        )}
                    </div>

                    {/* Descrição */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            Descrição
                        </label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
                            placeholder="Descreva o objetivo deste orçamento..."
                        />
                    </div>

                    {/* Valor */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            Valor do Orçamento (MZN) *
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                            <input
                                type="number"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                required
                                min="0"
                                step="0.01"
                                className="w-full py-2 pl-10 pr-4 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                            />
                        </div>
                        {errors.amount && (
                            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                        )}
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center justify-center flex-1 gap-2 px-4 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {budget ? 'Atualizar' : 'Criar'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Componente de Barra de Overview
function OverviewBar({ label, current, total, color = 'blue' }) {
    const percentage = Math.round((current / total) * 100);

    const colorClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        amber: 'bg-amber-500',
        red: 'bg-red-500',
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: 'MZN',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">{label}</span>
                <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(current)} / {formatCurrency(total)}
                </span>
            </div>
            <div className="w-full h-4 overflow-hidden rounded-full bg-slate-200">
                <div
                    className={`h-full transition-all duration-500 ${colorClasses[color]}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
            <div className="mt-1 text-xs text-right text-slate-600">
                {percentage}% utilizado
            </div>
        </div>
    );
}

// Componente de Card de Estatística
function StatCard({ title, value, icon: Icon, percentage, color = 'blue' }) {
    const colorClasses = {
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        amber: 'bg-amber-100 text-amber-600',
        red: 'bg-red-100 text-red-600',
    };

    return (
        <div className="p-6 bg-white border rounded-xl border-slate-200">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <h3 className="text-sm font-medium text-slate-600">{title}</h3>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
            {percentage !== undefined && (
                <div className="mt-2">
                    <div className="w-full h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                            className={`h-full transition-all ${
                                percentage >= 90 ? 'bg-red-500' :
                                percentage >= 75 ? 'bg-amber-500' :
                                'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
