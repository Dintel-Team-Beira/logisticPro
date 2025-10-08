import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';

import {
    ArrowLeft,
    Ship,
    Package,
    FileText,
    DollarSign,
    CheckCircle2,
    Clock,
    AlertCircle,
    Upload,
    Download,
    Eye,
    Send,
    Truck,
} from 'lucide-react';


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
export default function Show({ shipment, checklist, progress }) {
    const [activePhase, setActivePhase] = useState(progress.current_phase || 1);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [selectedDocType, setSelectedDocType] = useState(null);



// Adicionar esta função helper no início do arquivo (fora do componente)

// E atualizar o useState do currentStage:
const [currentStage, setCurrentStage] = useState(
    getStageFromPhase(progress.current_phase)
);
    // Configuração das 7 Fases baseado no SRS
    const phases = [
        {
            id: 1,
            key: 'coleta',
            title: 'Coleta de Dispersa',
            icon: Send,
            color: 'blue',
            description: 'Solicitação de cotações e pagamento',
        },
        {
            id: 2,
            key: 'legalizacao',
            title: 'Legalização',
            icon: FileText,
            color: 'purple',
            description: 'BL carimbado e Delivery Order',
        },
        {
            id: 3,
            key: 'alfandegas',
            title: 'Alfândegas',
            icon: CheckCircle2,
            color: 'amber',
            description: 'Declaração aduaneira e autorização',
        },
        {
            id: 4,
            key: 'cornelder',
            title: 'Cornelder',
            icon: Ship,
            color: 'cyan',
            description: 'Despesas de manuseamento',
        },
        {
            id: 5,
            key: 'taxacao',
            title: 'Taxação',
            icon: FileText,
            color: 'indigo',
            description: 'Documentos finais',
        },
        {
            id: 6,
            key: 'faturacao',
            title: 'Faturação',
            icon: DollarSign,
            color: 'green',
            description: 'Geração de fatura ao cliente',
        },
        {
            id: 7,
            key: 'pod',
            title: 'POD',
            icon: Truck,
            color: 'emerald',
            description: 'Proof of Delivery',
        },
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
        console.log('Upload iniciado para:', docType); // Debug
        setSelectedDocType(docType);
        setUploadModalOpen(true);
    };

    return (
        <DashboardLayout>
            <Head title={`Shipment ${shipment.reference_number}`} />

            <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/shipments"
                            className="flex items-center gap-2 text-sm transition-colors text-slate-600 hover:text-slate-900"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Voltar
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900">
                                {shipment.reference_number}
                            </h1>
                            <p className="text-sm text-slate-500">
                                {shipment.shipping_line?.name} • {shipment.bl_number}
                            </p>
                        </div>
                    </div>

                    {/* Progress Badge */}
                    <div className="px-4 py-2 rounded-lg bg-blue-50">
                        <p className="text-xs font-medium text-blue-600">Progresso</p>
                        <p className="text-2xl font-bold text-blue-900">{progress.progress}%</p>
                    </div>
                </div>

                {/* Timeline Visual - 7 Fases */}
                <div className="p-6 bg-white border rounded-lg border-slate-200">
                    <h2 className="mb-6 text-lg font-semibold text-slate-900">
                        Timeline do Processo
                    </h2>

                    {/* Desktop Timeline */}
                    <div className="hidden md:block">
                        <div className="relative">
                            {/* Linha de progresso */}
                            <div className="absolute left-0 right-0 h-1 top-8 bg-slate-200">
                                <div
                                    className="h-full transition-all duration-500 bg-blue-600"
                                    style={{ width: `${progress.progress}%` }}
                                />
                            </div>

                            {/* Fases */}
                            <div className="relative flex justify-between">
                                {phases.map((phase) => {
                                    const status = getPhaseStatus(phase.id);
                                    const Icon = phase.icon;
                                    const isActive = phase.id === activePhase;

                                    return (
                                        <div
                                            key={phase.id}
                                            onClick={() => setActivePhase(phase.id)}
                                            className={`
                                                flex flex-col items-center cursor-pointer group
                                                ${isActive ? 'scale-110' : 'scale-100'}
                                                transition-transform duration-200
                                            `}
                                        >
                                            {/* Círculo do ícone */}
                                            <div className={`
                                                relative z-10 flex items-center justify-center w-16 h-16 rounded-full
                                                ${status === 'completed' ? 'bg-emerald-100' : ''}
                                                ${status === 'in_progress' ? 'bg-blue-100' : ''}
                                                ${status === 'pending' ? 'bg-slate-100' : ''}
                                                ${isActive ? 'ring-4 ring-blue-200' : ''}
                                                transition-all duration-200
                                            `}>
                                                {getStatusIcon(status)}
                                            </div>

                                            {/* Label */}
                                            <div className="mt-3 text-center">
                                                <p className={`
                                                    text-xs font-medium
                                                    ${status === 'completed' ? 'text-emerald-600' : ''}
                                                    ${status === 'in_progress' ? 'text-blue-600' : ''}
                                                    ${status === 'pending' ? 'text-slate-400' : ''}
                                                `}>
                                                    Fase {phase.id}
                                                </p>
                                                <p className={`
                                                    text-sm font-semibold mt-1
                                                    ${isActive ? 'text-slate-900' : 'text-slate-600'}
                                                `}>
                                                    {phase.title}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Timeline */}
                    <div className="space-y-3 md:hidden">
                        {phases.map((phase) => {
                            const status = getPhaseStatus(phase.id);
                            const Icon = phase.icon;

                            return (
                                <div
                                    key={phase.id}
                                    onClick={() => setActivePhase(phase.id)}
                                    className={`
                                        flex items-center gap-4 p-4 rounded-lg cursor-pointer
                                        ${activePhase === phase.id ? 'bg-blue-50 border-2 border-blue-500' : 'bg-slate-50'}
                                    `}
                                >
                                    <div className={`
                                        flex items-center justify-center w-12 h-12 rounded-full
                                        ${status === 'completed' ? 'bg-emerald-100' : ''}
                                        ${status === 'in_progress' ? 'bg-blue-100' : ''}
                                        ${status === 'pending' ? 'bg-slate-100' : ''}
                                    `}>
                                        {getStatusIcon(status)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-slate-900">
                                            {phase.title}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {phase.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Conteúdo da Fase Ativa */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Coluna Principal - Checklist e Ações */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Checklist de Documentos */}
                        <div className="p-6 bg-white border rounded-lg border-slate-200">
                            <h3 className="mb-4 text-lg font-semibold text-slate-900">
                                Checklist - {phases[activePhase - 1]?.title}
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
                                                    <Clock className="w-5 h-5 text-amber-500" />
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">
                                                        {item.label}
                                                    </p>
                                                    {item.required && (
                                                        <p className="text-xs text-slate-500">
                                                            Obrigatório
                                                        </p>
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
                                                <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors bg-slate-100 rounded-lg hover:bg-slate-200">
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

                        {/* Ações da Fase */}
                        <PhaseActions
                            shipment={shipment}
                            phase={phases[activePhase - 1]}
                            canProceed={checklist?.every(item => item.attached)}
                        />
                    </div>

                    {/* Coluna Lateral - Informações e Histórico */}
                    <div className="space-y-6">
                        {/* Informações do Shipment */}
                        <div className="p-6 bg-white border rounded-lg border-slate-200">
                            <h3 className="mb-4 text-lg font-semibold text-slate-900">
                                Informações
                            </h3>
                            <div className="space-y-3">
                                <InfoItem label="BL Number" value={shipment.bl_number} />
                                <InfoItem label="Container" value={shipment.container_number} />
                                <InfoItem label="Navio" value={shipment.vessel_name} />
                                <InfoItem label="ETA" value={shipment.arrival_date} />
                                <InfoItem label="Origem" value={shipment.origin_port} />
                                <InfoItem label="Destino" value={shipment.destination_port} />
                            </div>
                        </div>

                        {/* Histórico de Atividades */}
                        <div className="p-6 bg-white border rounded-lg border-slate-200">
                            <h3 className="mb-4 text-lg font-semibold text-slate-900">
                                Atividades Recentes
                            </h3>
                            <div className="space-y-3">
                                {shipment.activities?.slice(0, 5).map((activity) => (
                                    <div key={activity.id} className="flex gap-3">
                                        <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-600 rounded-full" />
                                        <div>
                                            <p className="text-sm text-slate-900">
                                                {activity.description}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {activity.created_at} • {activity.user?.name}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            {uploadModalOpen && (
 <UploadModal
        shipment={shipment}
        docType={selectedDocType}
        currentStage={currentStage}  // ✅ VERIFICAR se está aqui
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

// Componente de Ações por Fase
function PhaseActions({ shipment, phase, canProceed }) {
    const [loading, setLoading] = useState(false);

    const handleAction = (action) => {
        setLoading(true);
        router.post(`/shipments/${shipment.id}/${action}`, {}, {
            onFinish: () => setLoading(false)
        });
    };

    return (
        <div className="p-6 bg-white border rounded-lg border-slate-200">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
                Ações Disponíveis
            </h3>

            {canProceed ? (
                <button
                    onClick={() => handleAction('advance')}
                    disabled={loading}
                    className="w-full px-4 py-3 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Processando...' : `Avançar para Próxima Etapa`}
                </button>
            ) : (
                <div className="p-4 rounded-lg bg-amber-50">
                    <div className="flex gap-3">
                        <AlertCircle className="flex-shrink-0 w-5 h-5 text-amber-600" />
                        <div>
                            <p className="text-sm font-medium text-amber-900">
                                Documentos Pendentes
                            </p>
                            <p className="mt-1 text-xs text-amber-700">
                                Complete o checklist para avançar para a próxima fase.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Componente de Item de Informação
function InfoItem({ label, value }) {
    return (
        <div>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="text-sm font-medium text-slate-900">{value || 'N/A'}</p>
        </div>
    );
}

// Modal de Upload
function UploadModal({ shipment, docType, currentStage, onClose }) {
    const [file, setFile] = useState(null);
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!file) {
            alert('Por favor, selecione um arquivo');
            return;
        }

        setProcessing(true);
        setErrors({});

        // ✅ CRIAR FormData MANUALMENTE
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', docType);
        formData.append('stage', currentStage);
        formData.append('notes', notes);

        // Debug - Ver o que está sendo enviado
        console.log('📦 FormData manual criado:');
        console.log('  - file:', file.name);
        console.log('  - type:', docType);
        console.log('  - stage:', currentStage);
        console.log('  - notes:', notes);

        // Verificar se FormData está correto
        for (let [key, value] of formData.entries()) {
            console.log(`  FormData[${key}]:`, value);
        }

        // ✅ ENVIAR COM router.post
        router.post(`/shipments/${shipment.id}/documents`, formData, {
            forceFormData: true,
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                console.log('✅ Upload bem-sucedido!');
                setProcessing(false);
                onClose();
            },
            onError: (errors) => {
                console.error('❌ Erro no upload:', errors);
                setErrors(errors);
                setProcessing(false);
            },
            onFinish: () => {
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
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                        Upload de Documento
                    </h3>
                    <button
                        onClick={onClose}
                        className="transition-colors text-slate-400 hover:text-slate-600"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Campo Arquivo */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            Arquivo *
                        </label>
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            accept=".pdf,.jpg,.jpeg,.png"
                            required
                        />
                        {errors.file && (
                            <p className="mt-1 text-xs text-red-600">{errors.file}</p>
                        )}
                        <p className="mt-1 text-xs text-slate-500">
                            PDF, JPG, PNG (máx. 10MB)
                        </p>
                    </div>

                    {/* Preview dos dados */}
                    <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                        <p className="mb-2 text-xs font-medium text-blue-900">
                            📋 Dados que serão enviados:
                        </p>
                        <div className="space-y-1 text-xs text-blue-700">
                            <div className="flex justify-between">
                                <span>Tipo:</span>
                                <strong>{docType}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span>Fase:</span>
                                <strong>{currentStage}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span>Arquivo:</span>
                                <strong className="truncate max-w-[200px]">
                                    {file ? file.name : 'Nenhum selecionado'}
                                </strong>
                            </div>
                        </div>
                    </div>

                    {/* Campo Observações */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            Observações <span className="text-slate-400">(opcional)</span>
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="3"
                            placeholder="Adicione observações sobre o documento..."
                        />
                    </div>

                    {/* Mostrar Erros */}
                    {Object.keys(errors).length > 0 && (
                        <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                            <p className="mb-2 text-sm font-medium text-red-800">
                                ⚠️ Erros encontrados:
                            </p>
                            <ul className="space-y-1 text-xs text-red-600">
                                {Object.entries(errors).map(([key, message]) => (
                                    <li key={key}>• {key}: {message}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Botões */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="flex-1 px-4 py-2 text-sm font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={processing || !file}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Enviando...
                                </span>
                            ) : (
                                '📤 Fazer Upload'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
