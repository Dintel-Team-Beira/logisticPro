import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import StatusBadge from '@/Components/StatusBadge';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Ship,
    Package,
    CheckCircle2,
    Clock,
    Mail,
    Phone,
    MapPin,
    User,
    Calendar,
    TrendingUp,
    Eye,
} from 'lucide-react';

export default function Show({ shippingLine, stats }) {
    const handleDelete = () => {
        if (confirm('Tem certeza que deseja remover esta linha de navegação?')) {
            router.delete(`/shipping-lines/${shippingLine.id}`, {
                onSuccess: () => router.visit('/shipping-lines'),
            });
        }
    };

    return (
        <DashboardLayout>
            <Head title={shippingLine.name} />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div>
                    <Link
                        href="/shipping-lines"
                        className="inline-flex items-center gap-2 mb-4 text-sm transition-colors text-slate-600 hover:text-slate-900"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para Linhas
                    </Link>

                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-blue-50">
                                <Ship className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-2xl font-semibold text-slate-900">
                                        {shippingLine.name}
                                    </h1>
                                    <span className={`
                                        px-3 py-1 text-xs font-medium rounded-full
                                        ${shippingLine.active
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-slate-100 text-slate-600'
                                        }
                                    `}>
                                        {shippingLine.active ? 'Ativa' : 'Inativa'}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500">
                                    Código SCAC: <span className="font-medium">{shippingLine.code}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Link href={`/shipping-lines/${shippingLine.id}/edit`}>
                                <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700">
                                    <Edit className="w-4 h-4" />
                                    Editar
                                </button>
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 transition-colors border border-red-300 rounded-lg hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4" />
                                Remover
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="p-6 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                            <Package className="w-8 h-8 text-blue-500" />
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                        </div>
                        <p className="text-sm font-medium text-slate-600">Total Shipments</p>
                        <p className="mt-1 text-3xl font-bold text-slate-900">
                            {stats.total_shipments || 0}
                        </p>
                    </div>

                    <div className="p-6 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                            <Clock className="w-8 h-8 text-amber-500" />
                        </div>
                        <p className="text-sm font-medium text-slate-600">Em Progresso</p>
                        <p className="mt-1 text-3xl font-bold text-amber-600">
                            {stats.active_shipments || 0}
                        </p>
                    </div>

                    <div className="p-6 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>
                        <p className="text-sm font-medium text-slate-600">Concluídos</p>
                        <p className="mt-1 text-3xl font-bold text-emerald-600">
                            {stats.completed_shipments || 0}
                        </p>
                    </div>

                    <div className="p-6 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                            <Calendar className="w-8 h-8 text-purple-500" />
                        </div>
                        <p className="text-sm font-medium text-slate-600">Tempo Médio</p>
                        <p className="mt-1 text-3xl font-bold text-purple-600">
                            {stats.avg_processing_time ? `${stats.avg_processing_time}d` : 'N/A'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Coluna Esquerda: Informações */}
                    <div className="space-y-6">
                        {/* Informações de Contato */}
                        <div className="p-6 bg-white border rounded-lg border-slate-200">
                            <h3 className="mb-4 text-lg font-semibold text-slate-900">
                                Informações de Contato
                            </h3>
                            <div className="space-y-3">
                                {shippingLine.email ? (
                                    <div className="flex items-start gap-3">
                                        <Mail className="w-5 h-5 mt-0.5 text-slate-400" />
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-slate-500">Email</p>
                                            <a
                                                href={`mailto:${shippingLine.email}`}
                                                className="text-sm text-blue-600 hover:underline"
                                            >
                                                {shippingLine.email}
                                            </a>
                                        </div>
                                    </div>
                                ) : null}

                                {shippingLine.phone ? (
                                    <div className="flex items-start gap-3">
                                        <Phone className="w-5 h-5 mt-0.5 text-slate-400" />
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-slate-500">Telefone</p>
                                            <a
                                                href={`tel:${shippingLine.phone}`}
                                                className="text-sm text-slate-900"
                                            >
                                                {shippingLine.phone}
                                            </a>
                                        </div>
                                    </div>
                                ) : null}

                                {shippingLine.contact_person ? (
                                    <div className="flex items-start gap-3">
                                        <User className="w-5 h-5 mt-0.5 text-slate-400" />
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-slate-500">Pessoa de Contato</p>
                                            <p className="text-sm text-slate-900">
                                                {shippingLine.contact_person}
                                            </p>
                                        </div>
                                    </div>
                                ) : null}

                                {shippingLine.address ? (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 mt-0.5 text-slate-400" />
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-slate-500">Endereço</p>
                                            <p className="text-sm text-slate-900">
                                                {shippingLine.address}
                                            </p>
                                        </div>
                                    </div>
                                ) : null}

                                {!shippingLine.email && !shippingLine.phone && !shippingLine.contact_person && !shippingLine.address ? (
                                    <div className="py-4 text-center text-slate-400">
                                        <p className="text-sm">Nenhuma informação de contato disponível</p>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        {/* Taxa de Conclusão */}
                        {stats.total_shipments > 0 && (
                            <div className="p-6 bg-white border rounded-lg border-slate-200">
                                <h3 className="mb-4 text-lg font-semibold text-slate-900">
                                    Taxa de Conclusão
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">Concluídos</span>
                                        <span className="text-sm font-medium text-slate-900">
                                            {stats.completed_shipments} / {stats.total_shipments}
                                        </span>
                                    </div>
                                    <div className="w-full h-2 overflow-hidden rounded-full bg-slate-200">
                                        <div
                                            className="h-full transition-all duration-500 bg-emerald-500"
                                            style={{
                                                width: `${(stats.completed_shipments / stats.total_shipments) * 100}%`
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-center text-slate-500">
                                        {Math.round((stats.completed_shipments / stats.total_shipments) * 100)}% concluídos
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Coluna Direita: Shipments Recentes */}
                    <div className="lg:col-span-2">
                        <div className="p-6 bg-white border rounded-lg border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-900">
                                    Shipments Recentes
                                </h3>
                                <Link href={`/shipments?shipping_line=${shippingLine.id}`}>
                                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                        Ver todos →
                                    </button>
                                </Link>
                            </div>

                            {shippingLine.shipments && shippingLine.shipments.length > 0 ? (
                                <div className="space-y-3">
                                    {shippingLine.shipments.map((shipment) => (
                                        <Link
                                            key={shipment.id}
                                            href={`/shipments/${shipment.id}`}
                                            className="block p-4 transition-colors border rounded-lg border-slate-200 hover:bg-slate-50"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-medium text-slate-900">
                                                            {shipment.reference_number}
                                                        </p>
                                                        <StatusBadge status={shipment.status} />
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                                        {shipment.bl_number && (
                                                            <span>BL: {shipment.bl_number}</span>
                                                        )}
                                                        {shipment.container_number && (
                                                            <span>Container: {shipment.container_number}</span>
                                                        )}
                                                        {shipment.vessel_name && (
                                                            <span>Navio: {shipment.vessel_name}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <Eye className="w-5 h-5 text-slate-400" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                    <p className="text-sm font-medium text-slate-900">
                                        Nenhum shipment encontrado
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Esta linha ainda não tem shipments registrados
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
