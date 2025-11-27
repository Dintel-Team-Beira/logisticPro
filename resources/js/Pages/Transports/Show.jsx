import React from 'react'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { Head, Link } from '@inertiajs/react'
import {
    Truck,
    ArrowLeft,
    Edit,
    Package,
    User,
    Phone,
    FileText,
    MapPin,
    CheckCircle,
    AlertCircle,
    Calendar,
    Weight,
    TrendingUp
} from 'lucide-react'

export default function Show({ auth, transport, stats, shipmentsByStatus }) {
    // Função para formatar peso
    const formatWeight = (value) => {
        if (!value) return 'N/A'
        return `${parseFloat(value).toLocaleString('pt-MZ')} kg`
    }

    // Status badge
    const StatusBadge = ({ active }) => {
        if (active) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-emerald-100 text-emerald-800">
                    <CheckCircle className="w-3 h-3" />
                    Ativo
                </span>
            )
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded">
                <AlertCircle className="w-3 h-3" />
                Inativo
            </span>
        )
    }

    // Card de estatística
    const StatCard = ({ icon: Icon, label, value, iconColor = 'text-blue-600' }) => {
        return (
            <div className="p-4 bg-white border rounded-lg border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100">
                        <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500">{label}</p>
                        <p className="text-lg font-bold text-slate-900">{value}</p>
                    </div>
                </div>
            </div>
        )
    }

    // Card de informação
    const InfoItem = ({ label, value }) => (
        <div>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="text-sm font-medium text-slate-900">{value || 'N/A'}</p>
        </div>
    )

    return (
        <DashboardLayout user={auth.user}>
            <Head title={`Transporte - ${transport.matricula}`} />

            <div className="py-6">
                <div className="mx-auto space-y-6 max-w-7xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/transports"
                                className="p-2 transition-colors rounded-lg hover:bg-slate-100"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">
                                    {transport.marca} {transport.modelo}
                                </h1>
                                <p className="text-sm text-slate-500">
                                    {transport.tipo_veiculo.toUpperCase()} - {transport.matricula}
                                </p>
                            </div>
                            <StatusBadge active={transport.ativo} />
                        </div>
                        <Link
                            href={`/transports/${transport.id}/edit`}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            <Edit className="w-4 h-4" />
                            Editar
                        </Link>
                    </div>

                    {/* Estatísticas */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            icon={Package}
                            label="Total de Processos"
                            value={stats.total_shipments || 0}
                            iconColor="text-blue-600"
                        />
                        <StatCard
                            icon={CheckCircle}
                            label="Processos Concluídos"
                            value={stats.completed_shipments || 0}
                            iconColor="text-emerald-600"
                        />
                        <StatCard
                            icon={TrendingUp}
                            label="Processos Ativos"
                            value={stats.active_shipments || 0}
                            iconColor="text-amber-600"
                        />
                        <StatCard
                            icon={Weight}
                            label="Peso Total"
                            value={formatWeight(stats.total_weight)}
                            iconColor="text-purple-600"
                        />
                    </div>

                    {/* Informações do Veículo */}
                    <div className="p-6 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center gap-2 mb-4">
                            <Truck className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-bold text-slate-900">Informações do Veículo</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <InfoItem label="Matrícula" value={transport.matricula} />
                            <InfoItem label="Tipo" value={transport.tipo_veiculo.toUpperCase()} />
                            <InfoItem label="Marca/Modelo" value={`${transport.marca} ${transport.modelo}`} />
                            <InfoItem label="Ano" value={transport.ano} />
                            <InfoItem
                                label="Capacidade Peso"
                                value={transport.capacidade_peso ? `${transport.capacidade_peso} ton` : 'N/A'}
                            />
                            <InfoItem
                                label="Capacidade Volume"
                                value={transport.capacidade_volume ? `${transport.capacidade_volume} m³` : 'N/A'}
                            />
                        </div>
                    </div>

                    {/* Informações do Motorista */}
                    {transport.motorista_nome && (
                        <div className="p-6 bg-white border rounded-lg border-slate-200">
                            <div className="flex items-center gap-2 mb-4">
                                <User className="w-5 h-5 text-emerald-600" />
                                <h2 className="text-lg font-bold text-slate-900">Informações do Motorista</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="flex items-center gap-3">
                                    <User className="w-4 h-4 text-slate-400" />
                                    <InfoItem label="Nome" value={transport.motorista_nome} />
                                </div>
                                {transport.motorista_telefone && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        <InfoItem label="Telefone" value={transport.motorista_telefone} />
                                    </div>
                                )}
                                {transport.motorista_documento && (
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-4 h-4 text-slate-400" />
                                        <InfoItem label="Documento" value={transport.motorista_documento} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Destinos Atendidos */}
                    {transport.destinos && transport.destinos.length > 0 && (
                        <div className="p-6 bg-white border rounded-lg border-slate-200">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin className="w-5 h-5 text-purple-600" />
                                <h2 className="text-lg font-bold text-slate-900">Destinos Atendidos</h2>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {transport.destinos.map((destino, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-lg bg-purple-50 text-purple-700"
                                    >
                                        <MapPin className="w-3 h-3" />
                                        {destino}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Observações */}
                    {transport.observacoes && (
                        <div className="p-6 bg-white border rounded-lg border-slate-200">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="w-5 h-5 text-amber-600" />
                                <h2 className="text-lg font-bold text-slate-900">Observações</h2>
                            </div>
                            <p className="text-sm text-slate-600">{transport.observacoes}</p>
                        </div>
                    )}

                    {/* Histórico de Processos */}
                    <div className="p-6 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center gap-2 mb-4">
                            <Package className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-bold text-slate-900">
                                Histórico de Processos ({transport.shipments?.length || 0})
                            </h2>
                        </div>

                        {transport.shipments && transport.shipments.length > 0 ? (
                            <div className="space-y-3">
                                {transport.shipments.map((shipment) => {
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
                                            key={shipment.id}
                                            href={`/shipments/${shipment.id}`}
                                            className="block p-4 transition-all border rounded-lg border-slate-200 hover:shadow-md hover:border-blue-300"
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
                                                            <span className="ml-1 text-slate-700">
                                                                {shipment.client?.name || 'N/A'}
                                                            </span>
                                                        </div>
                                                        {shipment.cargo_weight && (
                                                            <div>
                                                                <span className="font-medium text-slate-500">Peso:</span>
                                                                <span className="ml-1 text-slate-700">
                                                                    {formatWeight(shipment.cargo_weight)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <span
                                                    className={`px-2 py-1 text-xs font-medium rounded ${
                                                        statusColors[shipment.status] || 'bg-slate-100 text-slate-800'
                                                    }`}
                                                >
                                                    {statusLabels[shipment.status] || shipment.status}
                                                </span>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <p className="text-sm font-medium text-slate-600">
                                    Nenhum processo vinculado a este transporte
                                </p>
                                <p className="text-xs text-slate-500">Os processos vinculados aparecerão aqui</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
