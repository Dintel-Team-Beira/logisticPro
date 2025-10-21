import { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import DashboardLayout from '@/Layouts/DashboardLayout'
import {
    CheckCircle2,
    XCircle,
    Clock,
    DollarSign,
    Building2,
    Package,
    Calendar,
    User,
    FileText,
    Download,
    AlertCircle,
    TrendingUp,
    X
} from 'lucide-react'

export default function ApprovalsDashboard ({ pendingRequests, stats }) {
    const [selectedRequest, setSelectedRequest] = useState(null)
    const [showApproveModal, setShowApproveModal] = useState(false)
    const [showRejectModal, setShowRejectModal] = useState(false)

    // Formatar moeda
    const formatCurrency = (amount, currency = 'MZN') => {
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: currency
        }).format(amount)
    }

    // Formatar data
    const formatDate = date => {
        if (!date) return 'N/A'
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Aprovar solicitação
    const handleApprove = request => {
        setSelectedRequest(request)
        setShowApproveModal(true)
    }

    // Rejeitar solicitação
    const handleReject = request => {
        setSelectedRequest(request)
        setShowRejectModal(true)
    }

    return (
        <DashboardLayout>
            <Head title='Aprovações Pendentes' />

 <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">
                {/* Header */}
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='text-2xl font-bold text-slate-900'>
                            Centro de Aprovações
                        </h1>
                        <p className='mt-1 text-sm text-slate-600'>
                            Gerencie solicitações de pagamento pendentes
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
                    <StatCard
                        title='Pendentes'
                        value={stats.pending_count}
                        icon={Clock}
                        subtitle='aguardando aprovação'
                        color='amber'
                    />
                    <StatCard
                        title='Total Pendente'
                        value={formatCurrency(stats.total_pending_amount)}
                        icon={DollarSign}
                        color='blue'
                    />
                    <StatCard
                        title='Aprovadas Hoje'
                        value={stats.approved_today}
                        icon={CheckCircle2}
                        color='green'
                    />
                    <StatCard
                        title='Média por Solicitação'
                        value={formatCurrency(stats.average_amount)}
                        icon={TrendingUp}
                        color='purple'
                    />
                </div>

                {/* Alertas */}
                {stats.urgent_count > 0 && (
                    <div className='flex gap-3 p-4 border-l-4 rounded-lg bg-amber-50 border-amber-500'>
                        <AlertCircle className='flex-shrink-0 w-5 h-5 mt-0.5 text-amber-600' />
                        <div>
                            <h4 className='font-semibold text-amber-900'>
                                {stats.urgent_count} Solicitação(ões) Urgente(s)
                            </h4>
                            <p className='mt-1 text-sm text-amber-700'>
                                Existem solicitações com mais de 48 horas
                                pendentes que requerem atenção imediata.
                            </p>
                        </div>
                    </div>
                )}

                {/* Lista de Solicitações Pendentes */}
                <div className='space-y-4'>
                    <h2 className='text-lg font-semibold text-slate-900'>
                        Solicitações Aguardando Aprovação (
                        {pendingRequests.length})
                    </h2>

                    {pendingRequests.length === 0 ? (
                        <div className='py-16 text-center bg-white border rounded-xl border-slate-200'>
                            <CheckCircle2 className='w-16 h-16 mx-auto mb-4 text-green-300' />
                            <h3 className='mb-2 text-lg font-semibold text-slate-900'>
                                Tudo em Dia! 🎉
                            </h3>
                            <p className='text-sm text-slate-600'>
                                Não há solicitações pendentes de aprovação no
                                momento.
                            </p>
                        </div>
                    ) : (
                        pendingRequests.map(request => (
                            <RequestCard
                                key={request.id}
                                request={request}
                                onApprove={() => handleApprove(request)}
                                onReject={() => handleReject(request)}
                                formatCurrency={formatCurrency}
                                formatDate={formatDate}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Modal de Aprovação */}
            {showApproveModal && selectedRequest && (
                <ApproveModal
                    request={selectedRequest}
                    onClose={() => {
                        setShowApproveModal(false)
                        setSelectedRequest(null)
                    }}
                    formatCurrency={formatCurrency}
                />
            )}

            {/* Modal de Rejeição */}
            {showRejectModal && selectedRequest && (
                <RejectModal
                    request={selectedRequest}
                    onClose={() => {
                        setShowRejectModal(false)
                        setSelectedRequest(null)
                    }}
                    formatCurrency={formatCurrency}
                />
            )}
        </DashboardLayout>
    )
}

// Componente de Card de Solicitação
function RequestCard ({
    request,
    onApprove,
    onReject,
    formatCurrency,
    formatDate
}) {
    const isUrgent = request.days_pending > 2

    return (
        <div
            className={`p-6 transition-all bg-white border rounded-xl ${
                isUrgent ? 'border-amber-300 bg-amber-50' : 'border-slate-200'
            } hover:shadow-lg`}
        >
            {/* Header */}
            <div className='flex items-start justify-between mb-4'>
                <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-2'>
                        {isUrgent && (
                            <span className='inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full text-amber-800 bg-amber-200'>
                                <AlertCircle className='w-3 h-3' />
                                URGENTE
                            </span>
                        )}
                        <h3 className='text-lg font-semibold text-slate-900'>
                            {request.request_type_label}
                        </h3>
                    </div>
                    <p className='text-sm text-slate-600'>
                        {request.description}
                    </p>
                </div>
                <div className='text-right'>
                    <p className='text-2xl font-bold text-slate-900'>
                        {formatCurrency(request.amount, request.currency)}
                    </p>
                    <p className='text-xs text-slate-500'>
                        Solicitação #{request.id}
                    </p>
                </div>
            </div>

            {/* Informações */}
            <div className='grid grid-cols-2 gap-4 pb-4 mb-4 border-b md:grid-cols-4 border-slate-200'>
                <InfoItem
                    icon={Package}
                    label='Processo'
                    value={
                        <Link
                            href={`/shipments/${request.shipment.id}`}
                            className='font-medium text-blue-600 transition-colors hover:text-blue-800'
                        >
                            {request.shipment.reference_number}
                        </Link>
                    }
                />
                <InfoItem
                    icon={Building2}
                    label='Beneficiário'
                    value={request.payee}
                />
                <InfoItem
                    icon={User}
                    label='Solicitado por'
                    value={request.requester.name}
                />
                <InfoItem
                    icon={Calendar}
                    label='Data'
                    value={formatDate(request.created_at)}
                />
            </div>

            {/* Documentos */}
            <div className='mb-4'>
                <h4 className='mb-2 text-sm font-semibold text-slate-700'>
                    Documentos Anexados:
                </h4>
                <div className='flex flex-wrap gap-2'>
                    {request.quotation_document && (
                        <a
                            href={`/documents/${request.quotation_document.id}/download`}
                            className='flex items-center gap-2 px-3 py-2 text-sm transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50'
                        >
                            <FileText className='w-4 h-4' />
                            Cotação
                            <Download className='w-3 h-3' />
                        </a>
                    )}
                </div>
            </div>

            {/* 🆕 SEÇÃO DE UPLOAD (quando aprovado) */}
            {request.status === 'approved' && (
                <div className='p-4 mt-4 space-y-3 border-t border-slate-200'>
                    <h4 className='text-sm font-semibold text-slate-900'>
                        Anexar Documentos
                    </h4>

                    <DocumentUploadItemFinance
                        label='Comprovativo de Pagamento'
                        document={request.payment_proof}
                        requestId={request.id}
                        type='payment_proof'
                    />

                    <DocumentUploadItemFinance
                        label='Recibo'
                        document={request.receipt_document}
                        requestId={request.id}
                        type='receipt'
                    />
                </div>
            )}

            {/* Ações */}
            <div className='flex gap-3'>
                <button
                    onClick={onApprove}
                    className='flex items-center justify-center flex-1 gap-2 px-4 py-3 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700'
                >
                    <CheckCircle2 className='w-4 h-4' />
                    Aprovar
                </button>
                <button
                    onClick={onReject}
                    className='flex items-center justify-center flex-1 gap-2 px-4 py-3 text-sm font-medium text-red-600 transition-colors border border-red-600 rounded-lg hover:bg-red-50'
                >
                    <XCircle className='w-4 h-4' />
                    Rejeitar
                </button>
                <Link
                    href={`/shipments/${request.shipment.id}`}
                    className='flex items-center justify-center px-4 py-3 text-sm font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50'
                >
                    Ver Processo
                </Link>
            </div>
        </div>
    )
}

// Modal de Aprovação
function ApproveModal ({ request, onClose, formatCurrency }) {
    const [notes, setNotes] = useState('')
    const [processing, setProcessing] = useState(false)

    const handleSubmit = e => {
        e.preventDefault()
        setProcessing(true)

        router.post(
            `/payment-requests/${request.id}/approve`,
            {
                notes: notes
            },
            {
                preserveScroll: true,
                onSuccess: () => onClose(),
                onFinish: () => setProcessing(false)
            }
        )
    }

    return (
        <div
            className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'
            onClick={onClose}
        >
            <div
                className='w-full max-w-lg p-6 bg-white shadow-2xl rounded-xl'
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className='flex items-center justify-between mb-6'>
                    <div className='flex items-center gap-3'>
                        <div className='p-3 bg-green-100 rounded-full'>
                            <CheckCircle2 className='w-6 h-6 text-green-600' />
                        </div>
                        <div>
                            <h3 className='text-xl font-bold text-slate-900'>
                                Aprovar Solicitação
                            </h3>
                            <p className='text-sm text-slate-600'>
                                #{request.id} - {request.request_type_label}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className='p-2 transition-colors rounded-lg hover:bg-slate-100'
                    >
                        <X className='w-5 h-5 text-slate-600' />
                    </button>
                </div>

                {/* Resumo */}
                <div className='p-4 mb-6 rounded-lg bg-slate-50'>
                    <div className='flex items-center justify-between mb-2'>
                        <span className='text-sm font-medium text-slate-700'>
                            Valor:
                        </span>
                        <span className='text-lg font-bold text-slate-900'>
                            {formatCurrency(request.amount, request.currency)}
                        </span>
                    </div>
                    <div className='flex items-center justify-between mb-2'>
                        <span className='text-sm font-medium text-slate-700'>
                            Beneficiário:
                        </span>
                        <span className='text-sm text-slate-900'>
                            {request.payee}
                        </span>
                    </div>
                    <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium text-slate-700'>
                            Processo:
                        </span>
                        <span className='text-sm text-slate-900'>
                            {request.shipment.reference_number}
                        </span>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div>
                        <label className='block mb-2 text-sm font-medium text-slate-700'>
                            Observações (opcional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={3}
                            className='w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-green-500'
                            placeholder='Adicione observações sobre esta aprovação...'
                        />
                    </div>

                    <div className='flex gap-3'>
                        <button
                            type='button'
                            onClick={onClose}
                            disabled={processing}
                            className='flex-1 px-4 py-3 font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50 disabled:opacity-50'
                        >
                            Cancelar
                        </button>
                        <button
                            type='submit'
                            disabled={processing}
                            className='flex items-center justify-center flex-1 gap-2 px-4 py-3 font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50'
                        >
                            {processing ? (
                                <>
                                    <div className='w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin' />
                                    Aprovando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className='w-5 h-5' />
                                    Aprovar Solicitação
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Modal de Rejeição
function RejectModal ({ request, onClose, formatCurrency }) {
    const [reason, setReason] = useState('')
    const [processing, setProcessing] = useState(false)

    const handleSubmit = e => {
        e.preventDefault()

        if (!reason.trim()) {
            alert('Por favor, informe o motivo da rejeição')
            return
        }

        setProcessing(true)
        // console.log("equest.id",request.id,"reason",reason);
        router.post(
            `/payment-requests/${request.id}/reject`,
            {
                rejection_reason: reason
            },
            {
                preserveScroll: true,
                onSuccess: () => onClose(),
                onFinish: () => setProcessing(false)
            }
        )
    }

    return (
        <div
            className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'
            onClick={onClose}
        >
            <div
                className='w-full max-w-lg p-6 bg-white shadow-2xl rounded-xl'
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className='flex items-center justify-between mb-6'>
                    <div className='flex items-center gap-3'>
                        <div className='p-3 bg-red-100 rounded-full'>
                            <XCircle className='w-6 h-6 text-red-600' />
                        </div>
                        <div>
                            <h3 className='text-xl font-bold text-slate-900'>
                                Rejeitar Solicitação
                            </h3>
                            <p className='text-sm text-slate-600'>
                                #{request.id} - {request.request_type_label}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className='p-2 transition-colors rounded-lg hover:bg-slate-100'
                    >
                        <X className='w-5 h-5 text-slate-600' />
                    </button>
                </div>

                {/* Alerta */}
                <div className='flex gap-3 p-4 mb-6 border-l-4 border-red-500 rounded-lg bg-red-50'>
                    <AlertCircle className='flex-shrink-0 w-5 h-5 mt-0.5 text-red-600' />
                    <div className='text-sm text-red-900'>
                        <p className='font-semibold'>Atenção!</p>
                        <p className='mt-1'>
                            Esta ação rejeitará a solicitação de{' '}
                            <strong>
                                {formatCurrency(
                                    request.amount,
                                    request.currency
                                )}
                            </strong>
                            . O departamento de operações será notificado.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div>
                        <label className='block mb-2 text-sm font-medium text-slate-700'>
                            Motivo da Rejeição *
                        </label>
                        <textarea
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            required
                            rows={4}
                            className='w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-red-500'
                            placeholder='Explique o motivo da rejeição para que o solicitante possa corrigir...'
                        />
                    </div>

                    <div className='flex gap-3'>
                        <button
                            type='button'
                            onClick={onClose}
                            disabled={processing}
                            className='flex-1 px-4 py-3 font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50 disabled:opacity-50'
                        >
                            Cancelar
                        </button>
                        <button
                            type='submit'
                            disabled={processing}
                            className='flex items-center justify-center flex-1 gap-2 px-4 py-3 font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50'
                        >
                            {processing ? (
                                <>
                                    <div className='w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin' />
                                    Rejeitando...
                                </>
                            ) : (
                                <>
                                    <XCircle className='w-5 h-5' />
                                    Rejeitar Solicitação
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Componente de Info Item
function InfoItem ({ icon: Icon, label, value }) {
    return (
        <div>
            <div className='flex items-center gap-2 mb-1 text-xs font-medium text-slate-500'>
                <Icon className='w-4 h-4' />
                {label}
            </div>
            <div className='text-sm font-medium text-slate-900'>{value}</div>
        </div>
    )
}

// Componente de Stat Card
function StatCard ({ title, value, icon: Icon, subtitle, color = 'blue' }) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        amber: 'bg-amber-100 text-amber-600',
        purple: 'bg-purple-100 text-purple-600'
    }

    return (
        <div className='p-6 bg-white border rounded-xl border-slate-200'>
            <div className='flex items-center justify-between mb-4'>
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon className='w-6 h-6' />
                </div>
            </div>
            <h3 className='text-sm font-medium text-slate-600'>{title}</h3>
            <p className='mt-1 text-2xl font-bold text-slate-900'>{value}</p>
            {subtitle && (
                <p className='mt-1 text-xs text-slate-500'>{subtitle}</p>
            )}
        </div>
    )
}
