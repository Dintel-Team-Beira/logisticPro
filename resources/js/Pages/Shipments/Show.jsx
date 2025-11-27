import { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import DashboardLayout from '@/Layouts/DashboardLayout'
import {
    ArrowLeft,
    Ship,
    FileText,
    CheckCircle2,
    Clock,
    Upload,
    X,
    Check,
    AlertCircle,
    Eye,
    Download,
    Trash2,
    Play,
    Pause,
    AlertTriangle,
    Info,
    ChevronDown,
    ChevronUp,
    DollarSign,
    XCircle,
    DockIcon,
    CheckLine,
    File,
    Edit,
    Save,
    Calendar
} from 'lucide-react'
import { PaymentRequestModal } from './PaymentRequestModal'
import { BulkPaymentRequestModal } from './BulkPaymentRequestModal'
import { PaymentRequestsVisualizer } from './PaymentRequestsVisualizer'
export default function Show ({
    // paymentRequests = [],
     shipment,
    phaseProgress,
    activePhases,
    overallProgress,
    canForceAdvance,
    paymentRequests,
    auth,
    hasQuotationInvoice = false,
    quotationInvoiceId = null,
    quotationInvoiceNumber = null
}) {
    // console.log("paymentRequests",paymentRequests);
    const [selectedPhase, setSelectedPhase] = useState(activePhases[0] || 1)
    const [uploadModalOpen, setUploadModalOpen] = useState(false)
    const [selectedDocType, setSelectedDocType] = useState(null)
    const [forceModalOpen, setForceModalOpen] = useState(false)
    const [expandedWarnings, setExpandedWarnings] = useState({})
    const phasesRequiringPayment = [1, 2, 3, 4, 5]
    const [paymentRequestModalOpen, setPaymentRequestModalOpen] =
        useState(false)
    //  const [activeTab, setActiveTab] = useState('payment_requests');
    const [bulkPaymentModalOpen, setBulkPaymentModalOpen] = useState(false)

    // Estados para edição inline
    const [editingArrivalDate, setEditingArrivalDate] = useState(false)
    const [newArrivalDate, setNewArrivalDate] = useState(shipment.arrival_date || '')

    const currentPhaseRequest = paymentRequests?.find(
        pr => pr.phase === getPhaseKey(selectedPhase)
    )

    function getPhaseKey (phaseNumber) {
        const phases = {
            1: 'coleta_dispersa',
            2: 'legalizacao',
            3: 'alfandegas',
            4: 'cornelder',
            5: 'taxacao',
            6: 'faturacao',
            7: 'pod'
        }
        return phases[phaseNumber]
    }
    const phases = [
        { id: 1, title: 'Coleta de Despesas', icon: Ship, color: 'blue' },
        { id: 2, title: 'Legalização', icon: FileText, color: 'purple' },
        { id: 3, title: 'Alfândegas', icon: CheckCircle2, color: 'amber' },
        { id: 4, title: 'Cornelder', icon: Ship, color: 'cyan' },
        { id: 5, title: 'Carregamentos', icon: FileText, color: 'indigo' },
        { id: 6, title: 'Faturação', icon: FileText, color: 'green' },
        { id: 7, title: 'POD', icon: Ship, color: 'emerald' }
    ]

    const currentPhaseData = phaseProgress[selectedPhase]
    const activePhasesList =
        activePhases.length > 0 ? activePhases : [selectedPhase]

    const handleStartPhase = (phase, force = false, reason = null) => {
        router.post(
            `/shipments/${shipment.id}/advance`,
            {
                phase: phase,
                force: force,
                reason: reason
            },
            {
                preserveScroll: true,
                onSuccess: () => setForceModalOpen(false)
            }
        )
    }

    const handleCompletePhase = phase => {
        if (confirm(`Tem certeza que deseja completar a Fase ${phase}?`)) {
            router.post(
                `/shipments/${shipment.id}/complete-phase`,
                {
                    phase: phase
                },
                {
                    preserveScroll: true
                }
            )
        }
    }

    const handlePausePhase = phase => {
        const reason = prompt('Por que está pausando esta fase?')
        if (reason) {
            router.post(
                `/shipments/${shipment.id}/pause-phase`,
                {
                    phase: phase,
                    reason: reason
                },
                {
                    preserveScroll: true
                }
            )
        }
    }

    const handleViewDocument = (documentId) => {
        if (!documentId) {
            console.error('Document ID not provided')
            return
        }
        // Abrir documento em nova aba
        window.open(`/documents/${documentId}`, '_blank')
    }

    const handleDownloadDocument = (documentId) => {
        if (!documentId) {
            console.error('Document ID not provided')
            return
        }
        // Iniciar download do documento
        window.location.href = `/documents/${documentId}/download`
    }

    const handleUpdateArrivalDate = () => {
        if (!newArrivalDate) {
            alert('Por favor, selecione uma data válida')
            return
        }

        router.put(
            `/shipments/${shipment.id}`,
            { arrival_date: newArrivalDate },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingArrivalDate(false)
                },
                onError: () => {
                    alert('Erro ao atualizar data de chegada')
                }
            }
        )
    }

    const handleMarkQuotationAsPaid = () => {
        if (confirm('Confirma marcar a cotação como paga?')) {
            router.post(
                `/shipments/${shipment.id}/mark-quotation-paid`,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        alert('Cotação marcada como paga!')
                    },
                    onError: () => {
                        alert('Erro ao marcar cotação como paga')
                    }
                }
            )
        }
    }

    return (
        <DashboardLayout>
            <Head title={`Processo ${shipment.reference_number}`} />

            <div className='p-6 space-y-6'>
                {/* Header */}
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                        <Link
                            href='/shipments'
                            className='flex items-center gap-2 text-sm transition-colors text-slate-600 hover:text-slate-900'
                        >
                            <ArrowLeft className='w-4 h-4' />
                            Voltar
                        </Link>
                        <div>
                            <h1 className='text-2xl font-bold text-slate-900'>
                                Processo #{shipment.reference_number}
                            </h1>
                            <p className='text-sm text-slate-600'>
                                BL: {shipment.bl_number} | Cliente:{' '}
                                {shipment.client?.name}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress Global */}
                <div className='p-6 bg-white border rounded-lg border-slate-200'>
                    <div className='flex items-center justify-between mb-4'>
                        <h2 className='text-lg font-semibold text-slate-900'>
                            Progresso Geral do Processo
                        </h2>
                        <div className='flex items-center gap-4'>
                            <span className='text-2xl font-bold text-slate-900'>
                                {Math.round(overallProgress)}%
                            </span>
                            {activePhases.length > 1 && (
                                <span className='px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full'>
                                    {activePhases.length} fases simultâneas
                                </span>
                            )}
                        </div>
                    </div>

                    <div className='w-full h-3 mb-6 overflow-hidden rounded-full bg-slate-200'>
                        <div
                            className='h-full transition-all duration-500 bg-blue-600 rounded-full'
                            style={{ width: `${overallProgress}%` }}
                        />
                    </div>

                    {/* Timeline de Fases */}
                    <div className='grid grid-cols-7 gap-2'>
                        {phases.map(phase => {
                            const phaseData = phaseProgress[phase.id]
                            const isActive = activePhases.includes(phase.id)
                            const isSelected = selectedPhase === phase.id
                            const Icon = phase.icon

                            return (
                                <button
                                    key={phase.id}
                                    onClick={() => setSelectedPhase(phase.id)}
                                    className={`
                                        p-4 rounded-lg border-2 transition-all text-center relative
                                        ${
                                            isSelected
                                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                                : phaseData.status ===
                                                  'completed'
                                                ? 'border-emerald-500 bg-emerald-50'
                                                : isActive
                                                ? 'border-blue-400 bg-blue-50'
                                                : 'border-slate-200 bg-white hover:border-slate-300'
                                        }
                                    `}
                                >
                                    {/* Badge de ativo */}
                                    {isActive && (
                                        <span className='absolute w-4 h-4 bg-blue-600 border-2 border-white rounded-full -top-2 -right-2 animate-pulse' />
                                    )}

                                    <div
                                        className={`
                                        mx-auto mb-2 w-10 h-10 rounded-full flex items-center justify-center
                                        ${
                                            phaseData.status === 'completed'
                                                ? 'bg-emerald-600'
                                                : isActive
                                                ? 'bg-blue-600'
                                                : phaseData.status === 'paused'
                                                ? 'bg-amber-600'
                                                : 'bg-slate-300'
                                        }
                                    `}
                                    >
                                        {phaseData.status === 'completed' ? (
                                            <CheckCircle2 className='w-6 h-6 text-white' />
                                        ) : isActive ? (
                                            <Clock className='w-5 h-5 text-white animate-pulse' />
                                        ) : phaseData.status === 'paused' ? (
                                            <Pause className='w-5 h-5 text-white' />
                                        ) : (
                                            <Icon className='w-5 h-5 text-white opacity-50' />
                                        )}
                                    </div>

                                    <p className='mb-1 text-xs font-medium text-slate-900'>
                                        {phase.title}
                                    </p>

                                    <p className='text-xs text-slate-600'>
                                        {Math.round(phaseData.progress)}%
 {console.log('Phase Progress Details:', phases.map(phase => {
    const phaseData = phaseProgress[phase.id];
    return {
        id: phase.id,
        title: phase.title,
        progress: phaseData?.progress,
        status: phaseData?.status,
        details: phaseData
    };
}))}
                                    </p>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Conteúdo da Fase Selecionada */}
                <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                    {/* Detalhes da Fase */}
                    <div className='space-y-6 lg:col-span-2'>
                        {/* Card Principal */}
                        <div className='p-6 bg-white border rounded-lg border-slate-200'>
                            <div className='flex items-start justify-between mb-6'>
                                <div>
                                    <h3 className='text-xl font-bold text-slate-900'>
                                        {
                                            phases.find(
                                                p => p.id === selectedPhase
                                            )?.title
                                        }
                                    </h3>
                                    <p className='mt-1 text-sm text-slate-600'>
                                        Status:{' '}
                                        <span className='font-medium capitalize'>
                                            {currentPhaseData.status}
                                        </span>
                                    </p>
                                </div>
                                <div className='text-right'>
                                    <div className='text-3xl font-bold text-blue-600'>
                                        {Math.round(currentPhaseData.progress)}%
                                    </div>
                                    <div className='text-xs text-slate-500'>
                                        Progresso
                                    </div>
                                </div>
                            </div>

                            {/* Barra de Progresso */}
                            <div className='h-2 mb-6 overflow-hidden rounded-full bg-slate-200'>
                                <div
                                    className='h-full transition-all duration-500 bg-blue-600'
                                    style={{
                                        width: `${currentPhaseData.progress}%`
                                    }}
                                />
                            </div>

                            {/* Avisos e Riscos */}
                            {(currentPhaseData.warnings.length > 0 ||
                                currentPhaseData.risks.length > 0) && (
                                <div className='mb-6 space-y-3'>
                                    {currentPhaseData.warnings.length > 0 && (
                                        <div className='p-4 border rounded-lg bg-amber-50 border-amber-200'>
                                            <div className='flex items-start gap-3'>
                                                <AlertTriangle className='w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5' />
                                                <div className='flex-1'>
                                                    <p className='mb-2 text-sm font-medium text-amber-900'>
                                                        Avisos Importantes
                                                    </p>
                                                    <ul className='space-y-1'>
                                                        {currentPhaseData.warnings.map(
                                                            (warning, idx) => (
                                                                <li
                                                                    key={idx}
                                                                    className='text-xs text-amber-800'
                                                                >
                                                                    • {warning}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {currentPhaseData.risks.length > 0 && (
                                        <div className='p-4 border border-red-200 rounded-lg bg-red-50'>
                                            <div className='flex items-start gap-3'>
                                                <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
                                                <div className='flex-1'>
                                                    <p className='mb-2 text-sm font-medium text-red-900'>
                                                        Riscos Identificados
                                                    </p>
                                                    <ul className='space-y-1'>
                                                        {currentPhaseData.risks.map(
                                                            (risk, idx) => (
                                                                <li
                                                                    key={idx}
                                                                    className='text-xs text-red-800 capitalize'
                                                                >
                                                                    •{' '}
                                                                    {risk.replace(
                                                                        '_',
                                                                        ' '
                                                                    )}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Ações da Fase */}
                            <div className='flex gap-3'>
                                {/* BOTÃO SEMPRE VISÍVEL NA FASE 1 - TESTE */}
                                {selectedPhase === 1 && (
                                    <button
                                        onClick={() => {
                                            // alert(
                                            //     'Botão clicado! Modal abrindo...'
                                            // )
                                            setBulkPaymentModalOpen(true)
                                        }}
                                        className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg'
                                    >
                                        <DollarSign className='w-4 h-4' />
                                        Solicitar Múltiplos Orçamentos
                                    </button>
                                )}

                                {currentPhaseData.show_payment_request && (
                                    <button
                                        onClick={() =>
                                            setPaymentRequestModalOpen(true)
                                        }
                                        className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700'
                                    >
                                        <DollarSign className='w-4 h-4' />
                                        Solicitar Orçamento
                                    </button>
                                )}

                                {(currentPhaseData.status === 'pending' ||
                                    currentPhaseData.status === 'active') &&
                                    phasesRequiringPayment.includes(
                                        selectedPhase
                                    ) && (
                                        <button
                                            onClick={() =>
                                                setPaymentRequestModalOpen(true)
                                            }
                                            className='flex items-center gap-2 px-4 py-2 font-medium text-blue-700 transition-colors bg-blue-100 rounded-lg hover:bg-blue-200'
                                        >
                                            <DollarSign className='w-4 h-4' />
                                            Solicitar Orçamento
                                        </button>
                                    )}

                                {currentPhaseData.status === 'pending' && (
                                    <>
                                        {currentPhaseData.can_start ? (
                                            <button
                                                onClick={() =>
                                                    handleStartPhase(
                                                        selectedPhase
                                                    )
                                                }
                                                className='flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700'
                                            >
                                                <Play className='w-4 h-4' />
                                                Iniciar Fase
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    disabled
                                                    className='flex items-center gap-2 px-4 py-2 font-medium rounded-lg cursor-not-allowed bg-slate-300 text-slate-600'
                                                >
                                                    <AlertCircle className='w-4 h-4' />
                                                    Aguardando Requisitos
                                                </button>
                                                {canForceAdvance && (
                                                    <button
                                                        onClick={() =>
                                                            setForceModalOpen(
                                                                true
                                                            )
                                                        }
                                                        className='flex items-center gap-2 px-4 py-2 font-medium transition-colors border rounded-lg border-amber-500 text-amber-700 hover:bg-amber-50'
                                                    >
                                                        <AlertTriangle className='w-4 h-4' />
                                                        Forçar Início
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}

                                {currentPhaseData.status === 'in_progress' && (
                                    <>
                                        <button
                                            onClick={() =>
                                                handleCompletePhase(
                                                    selectedPhase
                                                )
                                            }
                                            className='flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-700'
                                        >
                                            <Check className='w-4 h-4' />
                                            Completar Fase
                                        </button>
                                        <button
                                            onClick={() =>
                                                handlePausePhase(selectedPhase)
                                            }
                                            className='flex items-center gap-2 px-4 py-2 font-medium transition-colors border rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50'
                                        >
                                            <Pause className='w-4 h-4' />
                                            Pausar
                                        </button>
                                    </>
                                )}

                                {currentPhaseData.status === 'paused' && (
                                    <button
                                        onClick={() =>
                                            handleStartPhase(
                                                selectedPhase,
                                                true,
                                                'Retomando fase pausada'
                                            )
                                        }
                                        className='flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700'
                                    >
                                        <Play className='w-4 h-4' />
                                        Retomar
                                    </button>
                                )}

                                {currentPhaseData.status === 'completed' && (
                                    <div className='flex items-center gap-2 px-4 py-2 font-medium rounded-lg bg-emerald-100 text-emerald-700'>
                                        <CheckCircle2 className='w-4 h-4' />
                                        Fase Concluída
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Informações do Processo */}
                        <div className='p-6 bg-white border rounded-lg border-slate-200'>
                            <h3 className='mb-4 text-lg font-semibold text-slate-900'>
                                Informações do Processo
                            </h3>
                            <div className='grid grid-cols-2 gap-4'>
                                <InfoItem
                                    label='Número do BL'
                                    value={shipment.bl_number}
                                />
                                <InfoItem
                                    label='Container'
                                    value={shipment.container_number}
                                />
                                <InfoItem
                                    label='Cliente'
                                    value={shipment.client?.name}
                                />
                                <InfoItem
                                    label='Linha de Navegação'
                                    value={shipment.shipping_line?.name}
                                />
                                <InfoItem
                                    label='Tipo de Carga'
                                    value={shipment.cargo_type || 'Normal'}
                                />

                                {/* Data de Chegada Editável */}
                                <div>
                                    <p className='text-xs font-medium text-slate-500 mb-1'>Data de Chegada</p>
                                    {!editingArrivalDate ? (
                                        <div className='flex items-center gap-2'>
                                            <p className='text-sm font-medium text-slate-900'>
                                                {shipment.arrival_date ? new Date(shipment.arrival_date).toLocaleDateString('pt-BR') : 'N/A'}
                                            </p>
                                            <button
                                                onClick={() => setEditingArrivalDate(true)}
                                                className='p-1 transition-colors rounded hover:bg-slate-100'
                                                title='Editar data de chegada'
                                            >
                                                <Edit className='w-4 h-4 text-blue-600' />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className='flex items-center gap-2'>
                                            <input
                                                type='date'
                                                value={newArrivalDate}
                                                onChange={(e) => setNewArrivalDate(e.target.value)}
                                                className='px-3 py-1.5 text-sm border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                            />
                                            <button
                                                onClick={handleUpdateArrivalDate}
                                                className='p-1.5 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700'
                                                title='Salvar'
                                            >
                                                <Save className='w-4 h-4' />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingArrivalDate(false)
                                                    setNewArrivalDate(shipment.arrival_date || '')
                                                }}
                                                className='p-1.5 text-slate-600 transition-colors rounded-lg hover:bg-slate-100'
                                                title='Cancelar'
                                            >
                                                <X className='w-4 h-4' />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {shipment.has_tax_exemption && (
                                    <div className='col-span-2 p-3 border border-green-200 rounded-lg bg-green-50'>
                                        <p className='text-sm font-medium text-green-800'>
                                            ✓ Isenção Fiscal Aplicável
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cotação Automática - Só para Admin e Finance */}
                        {shipment.quotation_reference && (auth.user.role === 'admin' || auth.user.role === 'finance') && (
                            <div className='p-6 bg-white border rounded-lg border-slate-200'>
                                <div className='flex items-center justify-between mb-4'>
                                    <h3 className='flex items-center gap-2 text-lg font-semibold text-slate-900'>
                                        <DollarSign className='w-5 h-5 text-blue-600' />
                                        Cotação Automática
                                    </h3>
                                    <div className='flex items-center gap-2 flex-wrap'>
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                            shipment.quotation_status === 'approved'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : shipment.quotation_status === 'rejected'
                                                ? 'bg-red-100 text-red-800'
                                                : shipment.quotation_status === 'revised'
                                                ? 'bg-amber-100 text-amber-800'
                                                : shipment.quotation_status === 'paid'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {shipment.quotation_status === 'approved' ? 'Aprovada' :
                                             shipment.quotation_status === 'rejected' ? 'Rejeitada' :
                                             shipment.quotation_status === 'revised' ? 'Revisada' :
                                             shipment.quotation_status === 'paid' ? 'Paga' : 'Pendente'}
                                        </span>

                                        {/* Botão Editar - Antes de gerar fatura */}
                                        {!hasQuotationInvoice && (
                                            <Link
                                                href={`/shipments/${shipment.id}/edit`}
                                                className='flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-amber-700 transition-colors bg-amber-100 rounded-lg hover:bg-amber-200'
                                            >
                                                <Edit className='w-4 h-4' />
                                                Editar
                                            </Link>
                                        )}

                                        <a
                                            href={`/quotations/${shipment.id}/pdf`}
                                            target='_blank'
                                            className='flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700'
                                        >
                                            <Download className='w-4 h-4' />
                                            Baixar PDF
                                        </a>

                                        {/* Botão Marcar como Pago - Antes de gerar fatura */}
                                        {!hasQuotationInvoice && shipment.quotation_status !== 'paid' && (
                                            <button
                                                onClick={handleMarkQuotationAsPaid}
                                                className='flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700'
                                            >
                                                <CheckCircle2 className='w-4 h-4' />
                                                Marcar como Pago
                                            </button>
                                        )}

                                        {/* Botão Gerar Fatura - Se ainda não existe fatura */}
                                        {!hasQuotationInvoice && (
                                            <button
                                                onClick={() => router.post(`/invoices/quotations/generate/${shipment.id}`)}
                                                className='flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white transition-colors bg-emerald-600 rounded-lg hover:bg-emerald-700'
                                            >
                                                <FileText className='w-4 h-4' />
                                                Gerar Fatura
                                            </button>
                                        )}

                                        {/* Link Ver Fatura - Se já existe fatura */}
                                        {hasQuotationInvoice && (
                                            <Link
                                                href={`/invoices/quotations/${quotationInvoiceId}`}
                                                className='flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white transition-colors bg-emerald-600 rounded-lg hover:bg-emerald-700'
                                            >
                                                <CheckCircle2 className='w-4 h-4' />
                                                Ver Fatura {quotationInvoiceNumber}
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                <div className='p-4 mb-4 border rounded-lg bg-slate-50 border-slate-200'>
                                    <div className='flex items-center justify-between'>
                                        <div>
                                            <p className='text-xs font-medium uppercase text-slate-500'>Referência</p>
                                            <p className='text-lg font-bold text-slate-900'>{shipment.quotation_reference}</p>
                                        </div>
                                        {shipment.quotation_approved_at && (
                                            <div className='text-right'>
                                                <p className='text-xs font-medium uppercase text-slate-500'>Aprovado em</p>
                                                <p className='text-sm font-semibold text-emerald-600'>
                                                    {new Date(shipment.quotation_approved_at).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Breakdown dos Valores */}
                                {shipment.quotation_breakdown && shipment.quotation_breakdown.length > 0 && (
                                    <div className='mb-4'>
                                        <p className='mb-3 text-sm font-medium text-slate-700'>Composição da Cotação:</p>
                                        <div className='space-y-2'>
                                            {shipment.quotation_breakdown.map((item, idx) => (
                                                <div key={idx} className='flex items-center justify-between p-2 rounded bg-slate-50'>
                                                    <div>
                                                        <p className='text-xs font-medium uppercase text-slate-500'>{item.category}</p>
                                                        <p className='text-sm text-slate-900'>{item.name}</p>
                                                    </div>
                                                    <p className='text-sm font-semibold text-slate-900'>
                                                        {new Intl.NumberFormat('pt-BR', {
                                                            style: 'currency',
                                                            currency: 'MZN'
                                                        }).format(item.price)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Totais */}
                                <div className='pt-4 border-t border-slate-200'>
                                    <div className='space-y-2'>
                                        <div className='flex items-center justify-between text-sm'>
                                            <span className='text-slate-600'>Subtotal:</span>
                                            <span className='font-semibold text-slate-900'>
                                                {new Intl.NumberFormat('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'MZN'
                                                }).format(shipment.quotation_subtotal)}
                                            </span>
                                        </div>
                                        <div className='flex items-center justify-between text-sm'>
                                            <span className='text-slate-600'>IVA (16%):</span>
                                            <span className='font-semibold text-slate-900'>
                                                {new Intl.NumberFormat('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'MZN'
                                                }).format(shipment.quotation_tax)}
                                            </span>
                                        </div>
                                        <div className='flex items-center justify-between pt-2 border-t border-slate-200'>
                                            <span className='text-base font-bold text-slate-900'>Total:</span>
                                            <span className='text-xl font-bold text-blue-600'>
                                                {new Intl.NumberFormat('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'MZN'
                                                }).format(shipment.quotation_total)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Checklist */}
                    <div className='space-y-6'>
                        {/* Checklist de Documentos */}
                        {/* Documentos e Pagamentos */}
                        <div className='p-6 bg-white border rounded-lg border-slate-200'>
                            <div className='flex items-center justify-between mb-4'>
                                <h3 className='flex text-lg font-semibold text-slate-900'>
                                    <FileText color='#64748b ' /> Requisitos e Pagamentos
                                </h3>
                                <span className='text-sm text-slate-500'>
                                    Fase {selectedPhase}
                                </span>
                            </div>

                            {/* 🆕 PAYMENT REQUESTS VISUALIZER */}
                            <PaymentRequestsVisualizer
                                shipment={shipment}
                                phase={selectedPhase}
                                paymentRequests={paymentRequests || [] }
                            />

                            {/* Divisor */}
                            {currentPhaseData.checklist &&
                                currentPhaseData.checklist.length > 0 && (
                                    <div className='my-6 border-t border-slate-200' />
                                )}

                            {/* Checklist de Documentos Tradicionais (se houver) */}
                            {currentPhaseData.checklist &&
                                currentPhaseData.checklist.length > 0 && (
                                    <div>
                                        <h4 className='flex mb-4 text-base font-semibold text-center text-slate-900'>
                                               <FileText color='#64748b ' /> Outros Documentos
                                        </h4>
                                        {/* { console.log("currentPhaseData",currentPhaseData)} */}
                                        <div className='space-y-3'>
                                            {currentPhaseData.checklist.map(
                                                (item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className='flex items-center justify-between p-3 border rounded-lg border-slate-200'
                                                    >
                                                        {/* {item} */}
                                                        <div className='flex items-center gap-3'>
                                                            {item.attached ? (
                                                                <CheckCircle2 className='w-5 h-5 text-emerald-600' />
                                                            ) : (
                                                                <Clock className='w-5 h-5 text-slate-400' />
                                                            )}
                                                            <div>
                                                                <p className='text-sm font-medium text-slate-900'>
                                                                    {item.label}
                                                                </p>
                                                                {item.attached && (
                                                                    <p className='text-xs text-slate-500'>
                                                                        Anexado
                                                                        em{' '}
                                                                        {new Date(
                                                                            item.uploaded_at
                                                                        ).toLocaleDateString()}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className='flex gap-2'>
                                                            {item.attached ? (
                                                                <>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleViewDocument(
                                                                                item.document_id
                                                                            )
                                                                        }
                                                                        className='p-2 transition-colors rounded-lg hover:bg-slate-100'
                                                                        title='Visualizar documento'
                                                                    >
                                                                        <Eye className='w-4 h-4 text-slate-600' />
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleDownloadDocument(
                                                                                item.document_id
                                                                            )
                                                                        }
                                                                        className='p-2 transition-colors rounded-lg hover:bg-slate-100'
                                                                        title='Baixar documento'
                                                                    >
                                                                        <Download className='w-4 h-4 text-slate-600' />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedDocType(
                                                                            item.type
                                                                        )
                                                                        setUploadModalOpen(
                                                                            true
                                                                        )
                                                                    }}
                                                                    className='flex items-center gap-2 px-3 py-1 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700'
                                                                >
                                                                    <Upload className='w-4 h-4' />
                                                                    Anexar
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                        </div>

                        {/* Fases Ativas */}
                        {activePhasesList.length > 1 && (
                            <div className='p-6 border border-blue-200 rounded-lg bg-blue-50'>
                                <div className='flex items-center gap-2 mb-3'>
                                    <Info className='w-5 h-5 text-blue-600' />
                                    <h3 className='text-sm font-semibold text-blue-900'>
                                        Fases em Paralelo
                                    </h3>
                                </div>
                                <div className='space-y-2'>
                                    {activePhasesList.map(phaseId => (
                                        <button
                                            key={phaseId}
                                            onClick={() =>
                                                setSelectedPhase(phaseId)
                                            }
                                            className={`
                                                w-full p-3 rounded-lg text-left transition-colors
                                                ${
                                                    selectedPhase === phaseId
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white text-slate-900 hover:bg-blue-100'
                                                }
                                            `}
                                        >
                                            <div className='flex items-center justify-between'>
                                                <span className='text-sm font-medium'>
                                                    Fase {phaseId}:{' '}
                                                    {
                                                        phases.find(
                                                            p =>
                                                                p.id === phaseId
                                                        )?.title
                                                    }
                                                </span>
                                                <span className='text-xs'>
                                                    {Math.round(
                                                        phaseProgress[phaseId]
                                                            .progress
                                                    )}
                                                    %
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Upload */}
            {uploadModalOpen && (
                <UploadModal
                   paymentRequests={paymentRequests || []}
                    shipment={shipment}
                    docType={selectedDocType}
                    phase={selectedPhase}
                    onClose={() => {
                        setUploadModalOpen(false)
                        setSelectedDocType(null)
                    }}
                />
            )}

            {/* Modal de Força */}
            {forceModalOpen && (
                <ForceAdvanceModal
                    phase={selectedPhase}
                    phaseName={phases.find(p => p.id === selectedPhase)?.title}
                    warnings={currentPhaseData.warnings}
                    onConfirm={reason =>
                        handleStartPhase(selectedPhase, true, reason)
                    }
                    onClose={() => setForceModalOpen(false)}
                />
            )}

            {/* MODAL DE SOLICITAÇÃO DE ORÇAMENTO */}
            {paymentRequestModalOpen && (
                <PaymentRequestModal
                    shipment={shipment}
                    phase={selectedPhase}
                    phaseName={phases.find(p => p.id === selectedPhase)?.title}
                    onClose={() => setPaymentRequestModalOpen(false)}
                />
            )}

            {/* MODAL DE SOLICITAÇÃO MÚLTIPLA */}
            {bulkPaymentModalOpen && (
                <BulkPaymentRequestModal
                    shipment={shipment}
                    phase={selectedPhase}
                    phaseName={phases.find(p => p.id === selectedPhase)?.title}
                    onClose={() => setBulkPaymentModalOpen(false)}
                />
            )}
        </DashboardLayout>
    )
}

// ========================================
// COMPONENTE: InfoItem
// ========================================
function InfoItem ({ label, value }) {
    return (
        <div>
            <p className='text-xs font-medium text-slate-500'>{label}</p>
            <p className='text-sm font-medium text-slate-900'>
                {value || 'N/A'}
            </p>
        </div>
    )
}

// ========================================
// COMPONENTE: Upload Modal
// ========================================
function UploadModal ({ shipment, docType, phase, onClose,paymentRequests }) {
    const [file, setFile] = useState(null)
    const [notes, setNotes] = useState('')
    const [uploading, setUploading] = useState(false)

    const handleSubmit = () => {

        if (!file) {
            alert('Selecione um arquivo')
            return
        }

        setUploading(true)

        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', docType)
        formData.append('phase', phase)
        formData.append('notes', notes)


        // ✅ ROTA CORRIGIDA
       // Se for um recibo e tiver uma solicitação de pagamento, adicionar ID
        if (docType === 'receipt' && paymentRequest) {
            formData.append('payment_request_id', paymentRequest.id)
        }

        // ✅ ROTA CORRIGIDA
        router.post(`/shipments/${shipment.id}/documents`, formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: (response) => {
                // Se for um recibo, registrar no backend
                if (docType === 'receipt' && paymentRequest && response.document) {
                    router.post(route('payment-requests.register-receipt'), {
                        payment_request_id: paymentRequest.id,
                        document_id: response.document.id
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            onClose()
                            setUploading(false)
                        }
                    })
                } else {
                    onClose()
                    setUploading(false)
                }
            },
            onError: errors => {
                console.error('Erro no upload:', errors)
                setUploading(false)
            },
            onFinish: () => setUploading(false)
        })

    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'
            onClick={onClose}   >
            <div  className='w-full max-w-lg bg-white rounded-lg shadow-2xl' onClick={e => e.stopPropagation()} >
                <div className='flex items-center justify-between p-6 border-b border-slate-200'>
                    <div>
                        <h2 className='text-xl font-bold text-slate-900'>
                            Upload de Documento
                        </h2>
                        <p className='mt-1 text-sm text-slate-600'>
                            Tipo: {docType}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className='p-2 rounded-lg hover:bg-slate-100'
                    >
                        <X className='w-5 h-5' />
                    </button>
                </div>

                <div className='p-6 space-y-4'>
                    <div>
                        <label className='block mb-2 text-sm font-medium text-slate-900'>
                            Selecionar Arquivo
                        </label>
                        <input
                            type='file'
                            onChange={e => setFile(e.target.files[0])}
                            className='w-full px-4 py-2 border rounded-lg border-slate-300'
                            accept='.pdf,.jpg,.jpeg,.png,.doc,.docx'
                        />
                    </div>

                    <div>
                        <label className='block mb-2 text-sm font-medium text-slate-900'>
                            Observações
                        </label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={3}
                            className='w-full px-4 py-2 border rounded-lg border-slate-300'
                            placeholder='Adicione observações...'
                        />
                    </div>
                </div>

                <div className='flex gap-3 p-6 border-t border-slate-200'>
                    <button
                        onClick={onClose}
                        disabled={uploading}
                        className='flex-1 px-4 py-2 border rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50'
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!file || uploading}
                        className='flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50'
                    >
                        {uploading ? 'Enviando...' : 'Enviar'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ====================================
// COMPONETE: UPOAD ANEXO
// ==================================
 function ReciboAnexo ({ shipment, docType, phase, onClose,paymentRequests }) {
    const [file, setFile] = useState(null)
    const [notes, setNotes] = useState('')
    const [uploading, setUploading] = useState(false)

    const handleSubmit = () => {

        if (!file) {
            alert('Selecione um arquivo')
            return
        }

        setUploading(true)

        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', docType)
        formData.append('phase', phase)
        formData.append('notes', notes)


        // ✅ ROTA CORRIGIDA
       // Se for um recibo e tiver uma solicitação de pagamento, adicionar ID
        if (docType === 'receipt' && paymentRequest) {
            formData.append('payment_request_id', paymentRequest.id)
        }

        // ✅ ROTA CORRIGIDA
        router.post(`/shipments/${shipment.id}/documents`, formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: (response) => {
                // Se for um recibo, registrar no backend
                if (docType === 'receipt' && paymentRequest && response.document) {
                    router.post(route('payment-requests.register-receipt'), {
                        payment_request_id: paymentRequest.id,
                        document_id: response.document.id
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            onClose()
                            setUploading(false)
                        }
                    })
                } else {
                    onClose()
                    setUploading(false)
                }
            },
            onError: errors => {
                console.error('Erro no upload:', errors)
                setUploading(false)
            },
            onFinish: () => setUploading(false)
        })

    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'
            onClick={onClose}   >
            <div  className='w-full max-w-lg bg-white rounded-lg shadow-2xl' onClick={e => e.stopPropagation()} >
                <div className='flex items-center justify-between p-6 border-b border-slate-200'>
                    <div>
                        <h2 className='text-xl font-bold text-slate-900'>
                           Recibo
                        </h2>
                        <p className='mt-1 text-sm text-slate-600'>
                            Tipo: {docType}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className='p-2 rounded-lg hover:bg-slate-100'
                    >
                        <X className='w-5 h-5' />
                    </button>
                </div>

                <div className='p-6 space-y-4'>
                    <div>
                        <label className='block mb-2 text-sm font-medium text-slate-900'>
                            Selecionar Arquivo
                        </label>
                        <input
                            type='file'
                            onChange={e => setFile(e.target.files[0])}
                            className='w-full px-4 py-2 border rounded-lg border-slate-300'
                            accept='.pdf,.jpg,.jpeg,.png,.doc,.docx'
                        />
                    </div>

                    <div>
                        <label className='block mb-2 text-sm font-medium text-slate-900'>
                            Observações
                        </label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={3}
                            className='w-full px-4 py-2 border rounded-lg border-slate-300'
                            placeholder='Adicione observações...'
                        />
                    </div>
                </div>

                <div className='flex gap-3 p-6 border-t border-slate-200'>
                    <button
                        onClick={onClose}
                        disabled={uploading}
                        className='flex-1 px-4 py-2 border rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50'
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!file || uploading}
                        className='flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50'
                    >
                        {uploading ? 'Enviando...' : 'Enviar'}
                    </button>
                </div>
            </div>
        </div>
    )
}
// ========================================
// COMPONENTE: Force Advance Modal
// ========================================
function ForceAdvanceModal ({ phase, phaseName, warnings, onConfirm, onClose }) {
    const [reason, setReason] = useState('')

    return (
        <div
            className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'
            onClick={onClose}
        >
            <div
                className='w-full max-w-lg bg-white rounded-lg shadow-2xl'
                onClick={e => e.stopPropagation()}
            >
                <div className='flex items-center justify-between p-6 border-b border-slate-200'>
                    <div className='flex items-center gap-3'>
                        <AlertTriangle className='w-6 h-6 text-amber-600' />
                        <h2 className='text-xl font-bold text-slate-900'>
                            Forçar Início de Fase
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className='p-2 rounded-lg hover:bg-slate-100'
                    >
                        <X className='w-5 h-5' />
                    </button>
                </div>

                <div className='p-6 space-y-4'>
                    <div className='p-4 border rounded-lg bg-amber-50 border-amber-200'>
                        <p className='mb-2 text-sm font-medium text-amber-900'>
                            Avisos que serão ignorados:
                        </p>
                        <ul className='space-y-1'>
                            {warnings.map((warning, idx) => (
                                <li
                                    key={idx}
                                    className='text-xs text-amber-800'
                                >
                                    • {warning}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <label className='block mb-2 text-sm font-medium text-slate-900'>
                            Justificativa (obrigatória)
                        </label>
                        <textarea
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            rows={4}
                            className='w-full px-4 py-2 border rounded-lg border-slate-300'
                            placeholder='Por que você está forçando o avanço desta fase?'
                        />
                    </div>
                </div>

                <div className='flex gap-3 p-6 border-t border-slate-200'>
                    <button
                        onClick={onClose}
                        className='flex-1 px-4 py-2 border rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50'
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onConfirm(reason)}
                        disabled={!reason.trim()}
                        className='flex-1 px-4 py-2 text-white rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50'
                    >
                        Confirmar e Iniciar
                    </button>
                </div>
            </div>
        </div>
    )
}

// ========================================
// COMPONENTE: StatusBadge
// ========================================
function StatusBadge ({ status }) {
    const config = {
        pending: { label: 'Aguardando Aprovação', color: 'amber', icon: Clock },
        approved: { label: 'Aprovado', color: 'emerald', icon: CheckCircle2 },
        rejected: { label: 'Rejeitado', color: 'red', icon: XCircle },
        paid: { label: 'Pago', color: 'blue', icon: CheckCircle2 }
    }

    const { label, color, icon: Icon } = config[status] || config.pending

    return (
        <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-${color}-50 border border-${color}-200`}
        >
            <Icon className={`w-4 h-4 text-${color}-600`} />
            <span className={`text-sm font-medium text-${color}-700`}>
                {label}
            </span>
        </div>
    )
}

// ========================================
// COMPONENTE: DocumentItem
// ========================================
function DocumentItem ({ label, document, requestId, type }) {
    const [uploading, setUploading] = useState(false)

    const handleUpload = e => {
        const file = e.target.files[0]
        if (!file) return

        setUploading(true)

        const formData = new FormData()
        formData.append(type, file)

        router.post(
            `/payment-requests/${requestId}/upload-${type.replace('_', '-')}`,
            formData,
            {
                preserveScroll: true,
                onFinish: () => setUploading(false)
            }
        )
    }

    if (document) {
        return (
            <div className='flex items-center justify-between p-3 border rounded-lg bg-emerald-50 border-emerald-200'>
                <div className='flex items-center gap-2'>
                    <CheckCircle2 className='w-5 h-5 text-emerald-600' />
                    <span className='text-sm font-medium text-emerald-900'>
                        {label}
                    </span>
                </div>
                <a
                    href={`/payment-requests/${requestId}/download/${type}`}
                    className='flex items-center gap-1 px-3 py-1 text-sm transition-colors bg-white border rounded-lg border-emerald-300 hover:bg-emerald-50'
                >
                    <Download className='w-4 h-4' />
                    Baixar
                </a>
            </div>
        )
    }

    return (
        <div className='flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50'>
            <span className='text-sm text-gray-700'>{label}</span>
            <label
                className={`flex items-center gap-2 px-3 py-1.5 text-sm text-white transition-colors bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
                <Upload className='w-4 h-4' />
                {uploading ? 'Enviando...' : 'Anexar'}
                <input
                    type='file'
                    className='hidden'
                    accept='.pdf,.jpg,.jpeg,.png'
                    onChange={handleUpload}
                    disabled={uploading}
                />
            </label>
        </div>
    )
}
