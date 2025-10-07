import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import StatusBadge from '@/Components/StatusBadge';
import Modal from '@/Components/Modal';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Ship,
    Package,
    Calendar,
    MapPin,
    FileText,
    Upload,
    Download,
    CheckCircle2,
    Clock,
    AlertCircle,
    DollarSign,
    User,
} from 'lucide-react';

export default function Show({ shipment }) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleDelete = () => {
        router.delete(`/shipments/${shipment.id}`, {
            onSuccess: () => {
                router.visit('/shipments');
            }
        });
    };

    const stages = [
        { key: 'coleta_dispersa', label: 'Coleta Dispersa', icon: Package },
        { key: 'legalizacao', label: 'Legalização', icon: FileText },
        { key: 'alfandegas', label: 'Alfândegas', icon: CheckCircle2 },
        { key: 'cornelder', label: 'Cornelder', icon: Ship },
        { key: 'taxacao', label: 'Taxação', icon: DollarSign },
    ];

    const getStageStatus = (stageKey) => {
        const stage = shipment.stages?.find(s => s.stage === stageKey);
        return stage?.status || 'pending';
    };

    const getStageIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
            case 'in_progress':
                return <Clock className="w-5 h-5 text-blue-600" />;
            case 'blocked':
                return <AlertCircle className="w-5 h-5 text-red-600" />;
            default:
                return <Clock className="w-5 h-5 text-slate-400" />;
        }
    };

    return (
        <DashboardLayout>
            <Head title={`Shipment ${shipment.reference_number}`} />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div>
                    <Link
                        href="/shipments"
                        className="inline-flex items-center gap-2 mb-4 text-sm transition-colors text-slate-600 hover:text-slate-900"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para Shipments
                    </Link>

                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900">
                                {shipment.reference_number}
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                {shipment.shipping_line?.name}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <StatusBadge status={shipment.status} />
                            <Link href={`/shipments/${shipment.id}/edit`}>
                                <button className="p-2 transition-colors rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                                    <Edit className="w-5 h-5" />
                                </button>
                            </Link>
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="p-2 text-red-600 transition-colors rounded-lg hover:text-red-700 hover:bg-red-50"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Informações do Shipment */}
                        <div className="p-6 bg-white border rounded-lg border-slate-200">
                            <h2 className="mb-4 text-lg font-semibold text-slate-900">
                                Informações do Shipment
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="mb-1 text-sm text-slate-500">Número BL</p>
                                    <p className="text-sm font-medium text-slate-900">
                                        {shipment.bl_number || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="mb-1 text-sm text-slate-500">Container</p>
                                    <p className="text-sm font-medium text-slate-900">
                                        {shipment.container_number || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="mb-1 text-sm text-slate-500">Navio</p>
                                    <p className="text-sm font-medium text-slate-900">
                                        {shipment.vessel_name || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="mb-1 text-sm text-slate-500">ETA</p>
                                    <p className="text-sm font-medium text-slate-900">
                                        {shipment.arrival_date || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="mb-1 text-sm text-slate-500">Origem</p>
                                    <p className="text-sm font-medium text-slate-900">
                                        {shipment.origin_port || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="mb-1 text-sm text-slate-500">Destino</p>
                                    <p className="text-sm font-medium text-slate-900">
                                        {shipment.destination_port || 'N/A'}
                                    </p>
                                </div>
                            </div>
                            {shipment.cargo_description && (
                                <div className="pt-4 mt-4 border-t border-slate-200">
                                    <p className="mb-1 text-sm text-slate-500">Descrição da Carga</p>
                                    <p className="text-sm text-slate-700">
                                        {shipment.cargo_description}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Progress / Stages */}
                        <div className="p-6 bg-white border rounded-lg border-slate-200">
                            <h2 className="mb-4 text-lg font-semibold text-slate-900">
                                Progresso do Shipment
                            </h2>
                            <div className="space-y-3">
                                {stages.map((stage, index) => {
                                    const status = getStageStatus(stage.key);
                                    return (
                                        <div key={stage.key} className="flex items-center gap-4">
                                            <div className={`
                                                flex items-center justify-center w-10 h-10 rounded-lg
                                                ${status === 'completed' ? 'bg-emerald-50' : ''}
                                                ${status === 'in_progress' ? 'bg-blue-50' : ''}
                                                ${status === 'pending' ? 'bg-slate-50' : ''}
                                                ${status === 'blocked' ? 'bg-red-50' : ''}
                                            `}>
                                                {getStageIcon(status)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-900">
                                                    {stage.label}
                                                </p>
                                                <p className={`
                                                    text-xs
                                                    ${status === 'completed' ? 'text-emerald-600' : ''}
                                                    ${status === 'in_progress' ? 'text-blue-600' : ''}
                                                    ${status === 'pending' ? 'text-slate-500' : ''}
                                                    ${status === 'blocked' ? 'text-red-600' : ''}
                                                `}>
                                                    {status === 'completed' ? 'Concluído' : ''}
                                                    {status === 'in_progress' ? 'Em andamento' : ''}
                                                    {status === 'pending' ? 'Pendente' : ''}
                                                    {status === 'blocked' ? 'Bloqueado' : ''}
                                                </p>
                                            </div>
                                            {status === 'completed' && (
                                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Documentos */}
                        <div className="p-6 bg-white border rounded-lg border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Documentos
                                </h2>
                                <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                    <Upload className="w-4 h-4" />
                                    Upload
                                </button>
                            </div>

                            {shipment.documents && shipment.documents.length > 0 ? (
                                <div className="space-y-2">
                                    {shipment.documents.map((doc) => (
                                        <div key={doc.id} className="flex items-center justify-between p-3 transition-colors border rounded-lg border-slate-200 hover:bg-slate-50">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-slate-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">
                                                        {doc.file_name}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {doc.type} • {doc.formatted_size}
                                                    </p>
                                                </div>
                                            </div>
                                            <button className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <FileText className="w-12 h-12 mx-auto text-slate-300" />
                                    <p className="mt-2 text-sm text-slate-500">
                                        Nenhum documento enviado
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Timeline */}
                        <div className="p-6 bg-white border rounded-lg border-slate-200">
                            <h2 className="mb-4 text-lg font-semibold text-slate-900">
                                Atividades Recentes
                            </h2>
                            <div className="space-y-4">
                                {shipment.activities && shipment.activities.length > 0 ? (
                                    shipment.activities.slice(0, 5).map((activity, index) => (
                                        <div key={activity.id} className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100">
                                                    <User className="w-4 h-4 text-slate-600" />
                                                </div>
                                                {index < 4 && (
                                                    <div className="w-px h-6 bg-slate-200"></div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-900">
                                                    {activity.description}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    {activity.user?.name} • {activity.created_at}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="py-4 text-sm text-center text-slate-500">
                                        Nenhuma atividade registrada
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Faturas */}
                        <div className="p-6 bg-white border rounded-lg border-slate-200">
                            <h2 className="mb-4 text-lg font-semibold text-slate-900">
                                Faturas
                            </h2>
                            {shipment.invoices && shipment.invoices.length > 0 ? (
                                <div className="space-y-2">
                                    {shipment.invoices.map((invoice) => (
                                        <Link
                                            key={invoice.id}
                                            href={`/invoices/${invoice.id}`}
                                            className="block p-3 transition-colors border rounded-lg border-slate-200 hover:bg-slate-50"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">
                                                        {invoice.invoice_number}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {invoice.issuer}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {invoice.currency} {invoice.amount}
                                                    </p>
                                                    <StatusBadge status={invoice.status} />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="py-4 text-sm text-center text-slate-500">
                                    Nenhuma fatura registrada
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Excluir Shipment"
                footer={
                    <div className="flex items-center justify-end gap-3">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium transition-colors bg-white border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
                        >
                            Excluir
                        </button>
                    </div>
                }
            >
                <p className="text-sm text-slate-600">
                    Tem certeza que deseja excluir este shipment? Esta ação não pode ser desfeita.
                </p>
            </Modal>
        </DashboardLayout>
    );
}
