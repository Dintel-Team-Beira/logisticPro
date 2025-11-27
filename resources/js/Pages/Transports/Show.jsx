import React, { useState } from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, Link, router } from '@inertiajs/react'
import { motion } from 'framer-motion'
import {
    Truck,
    ArrowLeft,
    Edit,
    Package,
    TrendingUp,
    Calendar,
    User,
    Phone,
    FileText,
    MapPin,
    Activity,
    DollarSign,
    Weight,
    CheckCircle,
    Clock,
    AlertCircle,
    Navigation
} from 'lucide-react'

export default function Show({ auth, transport, stats, shipmentsByStatus }) {
    const [activeTab, setActiveTab] = useState('overview')

    // Função para formatar moeda
    const formatCurrency = (value) => {
        if (!value) return 'N/A'
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: 'MZN'
        }).format(value)
    }

    // Função para formatar peso
    const formatWeight = (value) => {
        if (!value) return 'N/A'
        return `${parseFloat(value).toLocaleString('pt-MZ')} kg`
    }

    // Status badge
    const StatusBadge = ({ active }) => {
        if (active) {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                    <CheckCircle className="w-3 h-3" />
                    Ativo
                </span>
            )
        }
        return (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
                <AlertCircle className="w-3 h-3" />
                Inativo
            </span>
        )
    }

    // Card de estatística
    const StatCard = ({ icon: Icon, label, value, color = 'blue' }) => {
        const colorClasses = {
            blue: 'bg-blue-50 text-blue-600 border-blue-200',
            emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
            amber: 'bg-amber-50 text-amber-600 border-amber-200',
            purple: 'bg-purple-50 text-purple-600 border-purple-200',
        }

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-white border rounded-lg border-slate-200"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500">{label}</p>
                        <p className="text-lg font-bold text-slate-900">{value}</p>
                    </div>
                </div>
            </motion.div>
        )
    }

    // Card de processo
    const ShipmentCard = ({ shipment }) => {
        const statusColors = {
            pending: 'bg-amber-100 text-amber-800',
            in_progress: 'bg-blue-100 text-blue-800',
            completed: 'bg-emerald-100 text-emerald-800',
            cancelled: 'bg-red-100 text-red-800',
        }

        const statusLabels = {
            pending: 'Pendente',
            in_progress: 'Em Progresso',
            completed: 'Concluído',
            cancelled: 'Cancelado',
        }

        return (
            <Link
                href={`/shipments/${shipment.id}`}
                className="block p-4 transition-all bg-white border rounded-lg border-slate-200 hover:shadow-md hover:border-blue-300"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Package className="w-4 h-4 text-blue-600" />
                            <h3 className="text-sm font-bold text-slate-900">
                                {shipment.reference_number}
                            </h3>
                        </div>
                        <p className="mb-2 text-xs text-slate-600">
                            {shipment.cargo_description || 'Sem descrição'}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <span className="font-medium text-slate-500">Cliente:</span>
                                <span className="ml-1 text-slate-700">{shipment.client?.name || 'N/A'}</span>
                            </div>
                            {shipment.cargo_weight && (
                                <div>
                                    <span className="font-medium text-slate-500">Peso:</span>
                                    <span className="ml-1 text-slate-700">{formatWeight(shipment.cargo_weight)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${statusColors[shipment.status] || 'bg-slate-100 text-slate-800'}`}>
                        {statusLabels[shipment.status] || shipment.status}
                    </span>
                </div>
            </Link>
        )
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/transports"
                            className="p-2 transition-colors rounded-lg hover:bg-slate-100"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-800">
                                Detalhes do Transporte
                            </h2>
                            <p className="text-sm text-slate-500">
                                {transport.tipo_veiculo.toUpperCase()} - {transport.matricula}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={`/transports/${transport.id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <Edit className="w-4 h-4" />
                        Editar
                    </Link>
                </div>
            }
        >
            <Head title={`Transporte - ${transport.matricula}`} />

            <div className="py-6">
                <div className="mx-auto space-y-6 max-w-7xl sm:px-6 lg:px-8">
                    {/* Header Card - Informações do Veículo */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <div className="p-4 bg-white rounded-xl bg-opacity-20">
                                    <Truck className="w-10 h-10 text-white" />
                                </div>
                                <div className="text-white">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-2xl font-bold">
                                            {transport.marca} {transport.modelo}
                                        </h1>
                                        <StatusBadge active={transport.ativo} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm md:grid-cols-4">
                                        <div>
                                            <p className="text-blue-200">Matrícula</p>
                                            <p className="font-bold">{transport.matricula}</p>
                                        </div>
                                        <div>
                                            <p className="text-blue-200">Tipo</p>
                                            <p className="font-bold">{transport.tipo_veiculo.toUpperCase()}</p>
                                        </div>
                                        <div>
                                            <p className="text-blue-200">Ano</p>
                                            <p className="font-bold">{transport.ano || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-blue-200">Capacidade</p>
                                            <p className="font-bold">
                                                {transport.capacidade_peso ? `${transport.capacidade_peso} ton` : 'N/A'}
                                                {transport.capacidade_volume && ` | ${transport.capacidade_volume} m³`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Estatísticas */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            icon={Package}
                            label="Total de Processos"
                            value={stats.total_shipments || 0}
                            color="blue"
                        />
                        <StatCard
                            icon={CheckCircle}
                            label="Processos Concluídos"
                            value={stats.completed_shipments || 0}
                            color="emerald"
                        />
                        <StatCard
                            icon={Activity}
                            label="Processos Ativos"
                            value={stats.active_shipments || 0}
                            color="amber"
                        />
                        <StatCard
                            icon={Weight}
                            label="Peso Total Transportado"
                            value={formatWeight(stats.total_weight)}
                            color="purple"
                        />
                    </div>

                    {/* Tabs Navigation */}
                    <div className="bg-white border-b border-slate-200">
                        <div className="flex gap-4 px-6">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                                    activeTab === 'overview'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Visão Geral
                            </button>
                            <button
                                onClick={() => setActiveTab('shipments')}
                                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                                    activeTab === 'shipments'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Processos ({transport.shipments?.length || 0})
                            </button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Informações do Motorista */}
                            {transport.motorista_nome && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-6 bg-white border rounded-lg border-slate-200"
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <User className="w-5 h-5 text-blue-600" />
                                        <h3 className="text-lg font-bold text-slate-900">Informações do Motorista</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <User className="w-4 h-4 text-slate-400" />
                                            <div>
                                                <p className="text-xs text-slate-500">Nome</p>
                                                <p className="text-sm font-medium text-slate-900">{transport.motorista_nome}</p>
                                            </div>
                                        </div>
                                        {transport.motorista_telefone && (
                                            <div className="flex items-center gap-3">
                                                <Phone className="w-4 h-4 text-slate-400" />
                                                <div>
                                                    <p className="text-xs text-slate-500">Telefone</p>
                                                    <p className="text-sm font-medium text-slate-900">{transport.motorista_telefone}</p>
                                                </div>
                                            </div>
                                        )}
                                        {transport.motorista_documento && (
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-4 h-4 text-slate-400" />
                                                <div>
                                                    <p className="text-xs text-slate-500">Documento</p>
                                                    <p className="text-sm font-medium text-slate-900">{transport.motorista_documento}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Destinos Atendidos */}
                            {transport.destinos && transport.destinos.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-6 bg-white border rounded-lg border-slate-200"
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <MapPin className="w-5 h-5 text-emerald-600" />
                                        <h3 className="text-lg font-bold text-slate-900">Destinos Atendidos</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {transport.destinos.map((destino, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700"
                                            >
                                                <Navigation className="w-3 h-3" />
                                                {destino}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Observações */}
                            {transport.observacoes && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-6 bg-white border rounded-lg border-slate-200 lg:col-span-2"
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <FileText className="w-5 h-5 text-amber-600" />
                                        <h3 className="text-lg font-bold text-slate-900">Observações</h3>
                                    </div>
                                    <p className="text-sm text-slate-600">{transport.observacoes}</p>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {activeTab === 'shipments' && (
                        <div className="p-6 bg-white border rounded-lg border-slate-200">
                            <div className="flex items-center gap-2 mb-6">
                                <Package className="w-5 h-5 text-blue-600" />
                                <h3 className="text-lg font-bold text-slate-900">
                                    Histórico de Processos
                                </h3>
                            </div>

                            {transport.shipments && transport.shipments.length > 0 ? (
                                <div className="space-y-3">
                                    {transport.shipments.map((shipment) => (
                                        <ShipmentCard key={shipment.id} shipment={shipment} />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                    <p className="text-sm font-medium text-slate-600">
                                        Nenhum processo vinculado a este transporte
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Os processos vinculados aparecerão aqui
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    )
}
