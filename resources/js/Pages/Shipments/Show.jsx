

import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    ArrowLeft, Ship, Package, FileText, DollarSign,
    CheckCircle2, Clock, AlertCircle, Upload, Download,
    Eye, Send, Truck, Edit2, Trash2
} from 'lucide-react';

// ========================================
// HELPER: Mapear fase para stage
// ========================================
const getStageFromPhase = (phaseId) => {
    const stageMap = {
        1: 'coleta_dispersa',
        2: 'legalizacao',
        3: 'alfandegas',
        4: 'cornelder',
        5: 'taxacao',
        6: 'financas',
        7: 'pod',
    };
    return stageMap[phaseId] || 'coleta_dispersa';
};

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
export default function Show({ shipment, progress, checklist, canAdvance }) {
    const [activePhase, setActivePhase] = useState(progress.current_phase || 1);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [selectedDocType, setSelectedDocType] = useState(null);
    const [currentStage, setCurrentStage] = useState(
        getStageFromPhase(progress.current_phase)
    );

    // Configuração das 7 Fases
    const phases = [
        { id: 1, key: 'coleta', title: 'Coleta Dispersa', icon: Send, color: 'blue' },
        { id: 2, key: 'legalizacao', title: 'Legalização', icon: FileText, color: 'purple' },
        { id: 3, key: 'alfandegas', title: 'Alfândegas', icon: CheckCircle2, color: 'amber' },
        { id: 4, key: 'cornelder', title: 'Cornelder', icon: Ship, color: 'cyan' },
        { id: 5, key: 'taxacao', title: 'Taxação', icon: FileText, color: 'indigo' },
        { id: 6, key: 'faturacao', title: 'Faturação', icon: DollarSign, color: 'green' },
        { id: 7, key: 'pod', title: 'POD', icon: Truck, color: 'emerald' },
    ];

    const getPhaseStatus = (phaseId) => {
        if (phaseId < progress.current_phase) return 'completed';
        if (phaseId === progress.current_phase) return 'in_progress';
        return 'pending';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
            case 'in_progress':
                return <Clock className="w-6 h-6 text-blue-600 animate-pulse" />;
            default:
                return <Clock className="w-6 h-6 text-slate-300" />;
        }
    };

    const handleDocumentUpload = (docType) => {
        setSelectedDocType(docType);
        setUploadModalOpen(true);
    };

    const handleAdvance = () => {
        if (confirm('Deseja avançar para a próxima fase?')) {
            router.post(`/shipments/${shipment.id}/advance`, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    alert('Fase avançada com sucesso!');
                },
                onError: (errors) => {
                    alert(errors.error || 'Erro ao avançar fase');
                }
            });
        }
    };

    return (
        <DashboardLayout>
            <Head title={`Shipment ${shipment.reference_number}`} />

            <div className="p-6 ml-5 -mt-3 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/shipments"
                            className="p-2 transition-colors rounded-lg hover:bg-slate-100"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                {shipment.reference_number}
                            </h1>
                            <p className="text-sm text-slate-500">
                                BL: {shipment.bl_number} • Container: {shipment.container_number}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={`/shipments/${shipment.id}/edit`}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
                        >
                            <Edit2 className="w-4 h-4" />
                            Editar
                        </Link>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="p-6 bg-white border rounded-xl border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Progresso do Processo
                        </h2>
                        <span className="text-2xl font-bold text-blue-600">
                            {progress.progress}%
                        </span>
                    </div>
                    <div className="w-full h-3 mb-6 overflow-hidden rounded-full bg-slate-200">
                        <div
                            className="h-full transition-all duration-500 bg-blue-600 rounded-full"
                            style={{ width: `${progress.progress}%` }}
                        />
                    </div>

                    {/* Fases */}
                    <div className="grid grid-cols-7 gap-2">
                        {phases.map((phase) => {
                            const status = getPhaseStatus(phase.id);
                            const Icon = phase.icon;
                            const isActive = phase.id === progress.current_phase;

                            return (
                                <button
                                    key={phase.id}
                                    onClick={() => setActivePhase(phase.id)}
                                    className={`
                                        p-4 rounded-lg border-2 transition-all
                                        ${isActive ? `border-${phase.color}-500 bg-${phase.color}-50` : 'border-slate-200 bg-white'}
                                        ${status === 'completed' ? 'opacity-75' : ''}
                                        hover:shadow-md
                                    `}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        {getStatusIcon(status)}
                                        <span className="text-xs font-medium text-center text-slate-700">
                                            {phase.title}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            Fase {phase.id}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Grid Principal */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Informações do Shipment */}
                    <div className="col-span-2 space-y-6">
                        {/* Card Info */}
                        <div className="p-6 bg-white border rounded-xl border-slate-200">
                            <h3 className="mb-4 text-lg font-semibold text-slate-900">
                                Informações do Shipment
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <InfoItem label="Cliente" value={shipment.client?.name} />
                                <InfoItem label="Linha de Navegação" value={shipment.shipping_line?.name} />
                                <InfoItem label="BL Number" value={shipment.bl_number} />
                                <InfoItem label="Container" value={shipment.container_number} />
                                <InfoItem label="Tipo Container" value={shipment.container_type} />
                                <InfoItem label="Navio" value={shipment.vessel_name} />
                                <InfoItem label="Porto Origem" value={shipment.origin_port} />
                                <InfoItem label="Porto Destino" value={shipment.destination_port} />
                                <InfoItem label="Data Chegada" value={shipment.arrival_date} />
                                <InfoItem label="Descrição Carga" value={shipment.cargo_description} />
                            </div>
                        </div>

                        {/* Checklist de Documentos */}
                        <div className="p-6 bg-white border rounded-xl border-slate-200">
                            <h3 className="mb-4 text-lg font-semibold text-slate-900">
                                Documentos - Fase {progress.current_phase}
                            </h3>

                            {checklist && checklist.length > 0 ? (
                                <div className="space-y-3">
                                    {checklist.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 border rounded-lg border-slate-200 hover:bg-slate-50"
                                        >
                                            <div className="flex items-center gap-3">
                                                {item.attached ? (
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                                ) : (
                                                    <Clock className="w-5 h-5 text-slate-400" />
                                                )}
                                                <div>
                                                    <p className="font-medium text-slate-900">
                                                        {item.label}
                                                    </p>
                                                    {item.required && (
                                                        <span className="text-xs text-red-600">Obrigatório</span>
                                                    )}
                                                </div>
                                            </div>

                                            {!item.attached ? (
                                                <button
                                                    onClick={() => handleDocumentUpload(item.type)}
                                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                                                >
                                                    <Upload className="w-4 h-4" />
                                                    Upload
                                                </button>
                                            ) : (
                                                <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200">
                                                    <Eye className="w-4 h-4" />
                                                    Ver
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                    <p className="text-sm text-slate-500">
                                        Nenhum documento pendente nesta fase
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Botão Avançar */}
                        <div className="p-6 bg-white border rounded-xl border-slate-200">
                            <h3 className="mb-4 text-lg font-semibold text-slate-900">
                                Ações Disponíveis
                            </h3>

                            {canAdvance ? (
                                <button
                                    onClick={handleAdvance}
                                    className="w-full px-4 py-3 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    Avançar para Fase {progress.current_phase + 1}
                                </button>
                            ) : (
                                <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
                                    <div className="flex gap-3">
                                        <AlertCircle className="flex-shrink-0 w-5 h-5 text-amber-600" />
                                        <div>
                                            <p className="text-sm font-medium text-amber-900">
                                                Documentos Pendentes
                                            </p>
                                            <p className="mt-1 text-xs text-amber-700">
                                                Complete o checklist para avançar.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Atividades Recentes */}
                        <div className="p-6 bg-white border rounded-xl border-slate-200">
                            <h3 className="mb-4 text-lg font-semibold text-slate-900">
                                Atividades Recentes
                            </h3>
                            <div className="space-y-3">
                                {shipment.activities && shipment.activities.length > 0 ? (
                                    shipment.activities.map((activity) => (
                                        <div key={activity.id} className="flex gap-3">
                                            <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-600 rounded-full" />
                                            <div>
                                                <p className="text-sm text-slate-900">
                                                    {activity.description}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {activity.created_at}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-center text-slate-500">
                                        Nenhuma atividade registrada
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Documentos Anexados */}
                        <div className="p-6 bg-white border rounded-xl border-slate-200">
                            <h3 className="mb-4 text-lg font-semibold text-slate-900">
                                Documentos Anexados
                            </h3>
                            <div className="space-y-2">
                                {shipment.documents && shipment.documents.length > 0 ? (
                                    shipment.documents.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="flex items-center justify-between p-3 border rounded-lg border-slate-200"
                                        >
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-slate-500" />
                                                <span className="text-sm truncate text-slate-700">
                                                    {doc.name}
                                                </span>
                                            </div>
                                            <a
                                                href={`/documents/${doc.id}/download`}
                                                className="p-1 transition-colors rounded hover:bg-slate-100"
                                            >
                                                <Download className="w-4 h-4 text-slate-600" />
                                            </a>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-center text-slate-500">
                                        Nenhum documento anexado
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            {uploadModalOpen && selectedDocType && (
                <UploadModal
                    shipment={shipment}
                    docType={selectedDocType}
                    currentStage={currentStage}
                    onClose={() => {
                        setUploadModalOpen(false);
                        setSelectedDocType(null);
                        router.reload({ only: ['shipment', 'checklist'] });
                    }}
                />
            )}
        </DashboardLayout>
    );
}

// ========================================
// COMPONENTE: InfoItem
// ========================================
function InfoItem({ label, value }) {
    return (
        <div>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="text-sm font-medium text-slate-900">{value || 'N/A'}</p>
        </div>
    );
}

// ========================================
// COMPONENTE: UploadModal
// ========================================
function UploadModal({ shipment, docType, currentStage, onClose }) {
    const [file, setFile] = useState(null);
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!file) {
            alert('Selecione um arquivo');
            return;
        }

        setProcessing(true);
        setErrors({});

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', docType);
        formData.append('stage', currentStage);
        formData.append('notes', notes);

        router.post(`/shipments/${shipment.id}/documents`, formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setProcessing(false);
                onClose();
            },
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            }
        });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                        Upload de Documento
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            Arquivo *
                        </label>
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="w-full px-3 py-2 text-sm border rounded-lg"
                            accept=".pdf,.jpg,.jpeg,.png"
                            required
                        />
                        {errors.file && <p className="mt-1 text-xs text-red-600">{errors.file}</p>}
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            Observações
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-3 py-2 text-sm border rounded-lg"
                            rows="3"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="flex-1 px-4 py-2 text-sm font-medium border rounded-lg text-slate-700"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={processing || !file}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? 'Enviando...' : 'Upload'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
