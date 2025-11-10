import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    ArrowLeft,
    Building2,
    Edit,
    Mail,
    Phone,
    MapPin,
    User,
    FileText,
    CheckCircle,
    XCircle,
    Ship,
    Package,
    Calendar,
    Eye,
    Hash,
    Globe,
    Trash2,
} from 'lucide-react';

export default function Show({ consignee }) {
    const handleDelete = () => {
        if (confirm(`Tem certeza que deseja excluir o consignatário "${consignee.name}"?`)) {
            router.delete(`/consignees/${consignee.id}`, {
                onSuccess: () => router.visit('/consignees'),
            });
        }
    };

    const getShipmentTypeIcon = (type) => {
        switch (type) {
            case 'import':
                return <Package className="w-4 h-4" />;
            case 'export':
                return <Ship className="w-4 h-4" />;
            case 'transit':
                return <Globe className="w-4 h-4" />;
            case 'transport':
                return <Package className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    const getShipmentTypeBadge = (type) => {
        const badges = {
            import: 'bg-blue-100 text-blue-800',
            export: 'bg-emerald-100 text-emerald-800',
            transit: 'bg-amber-100 text-amber-800',
            transport: 'bg-purple-100 text-purple-800',
        };

        const labels = {
            import: 'Importação',
            export: 'Exportação',
            transit: 'Trânsito',
            transport: 'Transporte',
        };

        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[type] || 'bg-slate-100 text-slate-800'}`}>
                {getShipmentTypeIcon(type)}
                {labels[type] || type}
            </span>
        );
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('pt-BR');
    };

    return (
        <DashboardLayout>
            <Head title={`Consignatário: ${consignee.name}`} />

            <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/consignees"
                        className="inline-flex items-center gap-2 mb-4 text-sm transition-colors text-slate-600 hover:text-slate-900"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para Consignatários
                    </Link>

                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                                <Building2 className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold text-slate-900">
                                    {consignee.name}
                                </h1>
                                <div className="flex items-center gap-3 mt-2">
                                    {consignee.tax_id && (
                                        <span className="text-sm text-slate-500">
                                            NIF: {consignee.tax_id}
                                        </span>
                                    )}
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        consignee.active
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-slate-100 text-slate-800'
                                    }`}>
                                        {consignee.active ? (
                                            <>
                                                <CheckCircle className="w-3 h-3" />
                                                Ativo
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-3 h-3" />
                                                Inativo
                                            </>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Link
                                href={`/consignees/${consignee.id}/edit`}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                            >
                                <Edit className="w-4 h-4" />
                                Editar
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
                            >
                                <Trash2 className="w-4 h-4" />
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column - Details */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Contact Information */}
                        <div className="p-6 bg-white border rounded-xl border-slate-200">
                            <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-slate-900">
                                <Mail className="w-5 h-5 text-slate-600" />
                                Informações de Contato
                            </h2>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {/* Email */}
                                {consignee.email && (
                                    <div>
                                        <label className="block mb-1 text-xs font-medium uppercase text-slate-500">
                                            Email
                                        </label>
                                        <div className="flex items-center gap-2 text-sm text-slate-900">
                                            <Mail className="w-4 h-4 text-slate-400" />
                                            <a href={`mailto:${consignee.email}`} className="hover:text-blue-600">
                                                {consignee.email}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Phone */}
                                {consignee.phone && (
                                    <div>
                                        <label className="block mb-1 text-xs font-medium uppercase text-slate-500">
                                            Telefone
                                        </label>
                                        <div className="flex items-center gap-2 text-sm text-slate-900">
                                            <Phone className="w-4 h-4 text-slate-400" />
                                            <a href={`tel:${consignee.phone}`} className="hover:text-blue-600">
                                                {consignee.phone}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Contact Person */}
                                {consignee.contact_person && (
                                    <div>
                                        <label className="block mb-1 text-xs font-medium uppercase text-slate-500">
                                            Pessoa de Contato
                                        </label>
                                        <div className="flex items-center gap-2 text-sm text-slate-900">
                                            <User className="w-4 h-4 text-slate-400" />
                                            {consignee.contact_person}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="p-6 bg-white border rounded-xl border-slate-200">
                            <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-slate-900">
                                <MapPin className="w-5 h-5 text-slate-600" />
                                Endereço
                            </h2>

                            <div className="space-y-3">
                                {consignee.address && (
                                    <div>
                                        <label className="block mb-1 text-xs font-medium uppercase text-slate-500">
                                            Endereço Completo
                                        </label>
                                        <p className="text-sm text-slate-900">{consignee.address}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    {consignee.city && (
                                        <div>
                                            <label className="block mb-1 text-xs font-medium uppercase text-slate-500">
                                                Cidade
                                            </label>
                                            <p className="text-sm text-slate-900">{consignee.city}</p>
                                        </div>
                                    )}

                                    {consignee.country && (
                                        <div>
                                            <label className="block mb-1 text-xs font-medium uppercase text-slate-500">
                                                País
                                            </label>
                                            <p className="text-sm text-slate-900">{consignee.country}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {consignee.notes && (
                            <div className="p-6 bg-white border rounded-xl border-slate-200">
                                <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-slate-900">
                                    <FileText className="w-5 h-5 text-slate-600" />
                                    Observações
                                </h2>
                                <p className="text-sm whitespace-pre-wrap text-slate-900">
                                    {consignee.notes}
                                </p>
                            </div>
                        )}

                        {/* Recent Shipments */}
                        <div className="p-6 bg-white border rounded-xl border-slate-200">
                            <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-slate-900">
                                <Ship className="w-5 h-5 text-slate-600" />
                                Processos Recentes
                            </h2>

                            {consignee.shipments && consignee.shipments.length > 0 ? (
                                <div className="space-y-3">
                                    {consignee.shipments.map((shipment) => (
                                        <Link
                                            key={shipment.id}
                                            href={`/shipments/${shipment.id}`}
                                            className="flex items-center justify-between p-4 transition-all border rounded-lg border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 rounded-lg bg-slate-100">
                                                    {getShipmentTypeIcon(shipment.type)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium text-slate-900">
                                                            {shipment.reference_number}
                                                        </span>
                                                        {getShipmentTypeBadge(shipment.type)}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                                        {shipment.container_number && (
                                                            <span className="flex items-center gap-1">
                                                                <Hash className="w-3 h-3" />
                                                                {shipment.container_number}
                                                            </span>
                                                        )}
                                                        {shipment.shipping_line && (
                                                            <span className="flex items-center gap-1">
                                                                <Ship className="w-3 h-3" />
                                                                {shipment.shipping_line.name}
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {formatDate(shipment.created_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Eye className="w-4 h-4 text-slate-400" />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <Ship className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                    <p className="text-sm font-medium text-slate-900">
                                        Nenhum processo registrado
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Este consignatário ainda não tem processos associados
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Client Info & Stats */}
                    <div className="space-y-6">
                        {/* Client Information */}
                        {consignee.client && (
                            <div className="p-6 bg-white border rounded-xl border-slate-200">
                                <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-slate-900">
                                    <User className="w-5 h-5 text-slate-600" />
                                    Cliente Associado
                                </h2>

                                <Link
                                    href={`/clients/${consignee.client.id}`}
                                    className="block p-4 transition-all border rounded-lg border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                                            <User className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-900">
                                                {consignee.client.company_name || consignee.client.name}
                                            </p>
                                        </div>
                                    </div>

                                    {consignee.client.email && (
                                        <div className="flex items-center gap-2 mb-2 text-xs text-slate-600">
                                            <Mail className="w-3 h-3" />
                                            {consignee.client.email}
                                        </div>
                                    )}

                                    {consignee.client.phone && (
                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                            <Phone className="w-3 h-3" />
                                            {consignee.client.phone}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1 mt-3 text-xs text-blue-600">
                                        Ver detalhes do cliente
                                        <Eye className="w-3 h-3" />
                                    </div>
                                </Link>
                            </div>
                        )}

                        {/* Statistics */}
                        <div className="p-6 bg-white border rounded-xl border-slate-200">
                            <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-slate-900">
                                <FileText className="w-5 h-5 text-slate-600" />
                                Estatísticas
                            </h2>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                                    <span className="text-sm font-medium text-slate-700">
                                        Total de Processos
                                    </span>
                                    <span className="text-lg font-bold text-blue-600">
                                        {consignee.shipments?.length || 0}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                                    <span className="text-sm font-medium text-slate-700">
                                        Criado em
                                    </span>
                                    <span className="text-sm font-semibold text-slate-900">
                                        {formatDate(consignee.created_at)}
                                    </span>
                                </div>

                                {consignee.updated_at && (
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                                        <span className="text-sm font-medium text-slate-700">
                                            Última atualização
                                        </span>
                                        <span className="text-sm font-semibold text-slate-900">
                                            {formatDate(consignee.updated_at)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
