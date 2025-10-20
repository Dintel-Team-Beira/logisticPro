import { useState } from 'react';
import {
    DollarSign,
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle,
    FileText,
    Download,
    Eye,
    ChevronDown,
    ChevronUp,
    User,
    Calendar,
    Building2,
    Receipt,
    CircleDashed,
} from 'lucide-react';

/**
 * 🎨 COMPONENTE VISUAL COMPLETO: Payment Requests Visualizer
 * Mostra todas as solicitações de pagamento de uma fase com detalhes
 *
 * @author Arnaldo Tomo
 */
export function PaymentRequestsVisualizer({ shipment, phase, paymentRequests = [] }) {
    const [expandedRequests, setExpandedRequests] = useState({});
// console.log("paymentRequests visluazer",paymentRequests);
    // Filtrar requests desta fase
const phaseRequests = paymentRequests.filter(req => String(req.phase) === String(phase));

    // Se não há requests, mostrar mensagem
    if (phaseRequests.length === 0) {
        return (
            <div className="p-6 text-center border-2 border-dashed rounded-xl border-slate-200 bg-slate-50">
                <DollarSign className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                <p className="text-sm font-medium text-slate-600">
                    Nenhuma solicitação de pagamento ainda
                </p>
                <p className="text-xs text-slate-500">
                    Clique em "Solicitar Orçamento" para criar uma solicitação
                </p>
            </div>
        );
    }

    const toggleExpanded = (requestId) => {
        setExpandedRequests(prev => ({
            ...prev,
            [requestId]: !prev[requestId]
        }));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="flex text-lg font-semibold text-center text-slate-900">
                   Solicitações de Pagamento
                </h3>
                <span className="px-3 py-1 text-sm font-medium text-blue-700 rounded-full bg-blue-50">
                    {phaseRequests.length} {phaseRequests.length === 1 ? 'solicitação' : 'solicitações'}
                </span>
            </div>

            {/* Lista de Payment Requests */}
            <div className="space-y-3">
                {phaseRequests.map((request) => (
                    <PaymentRequestCard
                        key={request.id}
                        request={request}
                        expanded={expandedRequests[request.id]}
                        onToggle={() => toggleExpanded(request.id)}
                    />
                ))}
            </div>
        </div>
    );
}

/**
 * 🎴 CARD INDIVIDUAL DE PAYMENT REQUEST
 */
function PaymentRequestCard({ request, expanded, onToggle }) {
    const statusConfig = getStatusConfig(request.status);
    const progress = calculateRequestProgress(request);

    {console.log("request",request)}
    return (
        <div className="overflow-hidden transition-all border-2 rounded-xl border-slate-200 hover:shadow-lg">
            {/* Header do Card */}
            <div
                className="p-4 cursor-pointer bg-gradient-to-r from-slate-50 to-white hover:from-slate-100"
                onClick={onToggle}
            >
                <div className="flex items-start justify-between">
                    {/* Título e Info Principal */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
                                <statusConfig.icon className={`w-5 h-5 ${statusConfig.textColor}`} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900">
                                    {request.request_type_label || request.request_type}
                                </h4>
                                <p className="text-sm text-slate-600">
                                    Para: <span className="font-medium">{request.payee}</span>
                                </p>
                            </div>
                        </div>

                        {/* Valor */}
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-blue-600">
                                {formatCurrency(request.amount, request.currency)}
                            </span>
                            <StatusBadge status={request.status} />
                        </div>
                    </div>

                    {/* Progress Circle & Toggle */}
                    <div className="flex flex-col items-end gap-2">
                        <ProgressCircle progress={progress} />
                        <button className="p-1 transition-colors rounded-lg hover:bg-slate-200">
                            {expanded ? (
                                <ChevronUp className="w-5 h-5 text-slate-600" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-slate-600" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Detalhes Expandidos */}
            {expanded && (
                <div className="p-4 space-y-4 border-t bg-slate-50 border-slate-200">
                    {/* Informações Básicas */}
                    <div className="grid grid-cols-2 gap-4">
                        <InfoItem
                            icon={User}
                            label="Solicitado por"
                            value={request.requester?.name || 'N/A'}
                        />
                        <InfoItem
                            icon={Calendar}
                            label="Data da Solicitação"
                            value={formatDate(request.created_at)}
                        />
                        {request.approved_at && (
                            <InfoItem
                                icon={CheckCircle2}
                                label={`${request.status === 'rejected'? 'Rejeiado Por' : 'Aprovado por' }`}
                                value={request.approver?.name || 'N/A'}
                            />
                        )}
                        {request.approved_at && (
                            <InfoItem
                                icon={Calendar}
                                label="Data de Aprovação"
                                value={formatDate(request.approved_at)}
                            />
                        )}
                    </div>

                    {/* Descrição */}
                    {request.description && (
                        <div className="p-3 bg-white rounded-lg">
                            <p className="mb-1 text-xs font-medium text-slate-500">DESCRIÇÃO</p>
                            <p className="text-sm text-slate-700">{request.description}</p>
                        </div>
                    )}

                    {/* Status de Rejeição */}
                    {request.status === 'rejected' && request.rejection_reason && (
                        <div className="p-4 border-l-4 border-red-500 rounded-lg bg-red-50">
                            <div className="flex gap-3">
                                <XCircle className="flex-shrink-0 w-5 h-5 text-red-600" />
                                <div>
                                    <p className="mb-1 text-sm font-semibold text-red-900">
                                        Motivo da Rejeição
                                    </p>
                                    <p className="text-sm text-red-700">
                                        {request.rejection_reason}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Checklist de Documentos */}
                    <div className="p-4 space-y-3 bg-white rounded-lg">
                        <h5 className="flex text-sm font-semibold text-center ">
                                  <FileText color='#64748b ' size={15} />  Checklist de Documentos
                        </h5>

                        {/* 1. Cotação */}
                        <DocumentCheckItem
                            label="Cotação Anexada"
                            completed={!!request.quotation_document}
                            document={request.quotation_document}
                            icon={FileText}
                        />

                        {/* 2. Aprovação */}
                        <StatusCheckItem
                            label="Aprovação Recebida"
                            completed={['approved', 'paid'].includes(request.status)}
                            info={request.approved_at ? `Aprovado em ${formatDate(request.approved_at)}` : null}
                            icon={CheckCircle2}
                        />

                        {/* 3. Comprovativo de Pagamento payment_proof: */}
                        <DocumentCheckItem
                            label="Comprovativo de Pagamento1"
                            completed={!!request.payment_proof}
                            document={request.payment_proof}
                            icon={DollarSign}
                        />

                        {/* 4. Recibo receipt_document
 */}
                        <DocumentCheckItem
                            label="Recibo Anexado."
                            completed={!!request.receipt_document
}
                            document={request.receipt_document}
                            icon={Receipt}
                        />
                    </div>

                    {/* Timeline Visual */}
                    <TimelineVisual request={request} />
                </div>
            )}
        </div>
    );
}

/**
 * 📊 PROGRESS CIRCLE
 */
function ProgressCircle({ progress }) {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative w-12 h-12">
            <svg className="w-full h-full transform -rotate-90">
                {/* Background Circle */}
                <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-slate-200"
                />
                {/* Progress Circle */}
                <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className={`${
                        progress === 100
                            ? 'text-emerald-500'
                            : progress >= 50
                            ? 'text-blue-500'
                            : 'text-amber-500'
                    } transition-all duration-500`}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-slate-700">
                    {Math.round(progress)}%
                </span>
            </div>
        </div>
    );
}

/**
 * 🏷️ STATUS BADGE
 */
function StatusBadge({ status }) {
    const config = getStatusConfig(status);

    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${config.bgColor} ${config.textColor}`}>
            {config.label}
        </span>
    );
}

/**
 * ✅ DOCUMENT CHECK ITEM
 */
function DocumentCheckItem({ label, completed, document, icon: Icon }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${completed ? 'bg-emerald-100' : 'bg-slate-200'}`}>
                    {completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                        <Icon className="w-4 h-4 text-slate-400" />
                    )}
                </div>
                <div>
                    <p className={`text-sm font-medium ${completed ? 'text-slate-900' : 'text-slate-600'}`}>
                        {label}
                    </p>
                    {document && (
                        <p className="text-xs text-slate-500">
                            {document.name || 'Documento anexado'}
                        </p>
                    )}
                </div>
            </div>

            {document && (
                <div className="flex gap-2">
                    <button
                        onClick={() => window.open(`/documents/${document.id}/view`, '_blank')}
                        className="p-2 transition-colors rounded-lg hover:bg-slate-200"
                        title="Visualizar"
                    >
                        <Eye className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                        onClick={() => window.open(`/documents/${document.id}/download`, '_blank')}
                        className="p-2 transition-colors rounded-lg hover:bg-slate-200"
                        title="Download"
                    >
                        <Download className="w-4 h-4 text-slate-600" />
                    </button>
                </div>
            )}
        </div>
    );
}

/**
 * ✔️ STATUS CHECK ITEM (sem documento)
 */
function StatusCheckItem({ label, completed, info, icon: Icon }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            <div className={`p-2 rounded-lg ${completed ? 'bg-emerald-100' : 'bg-slate-200'}`}>
                {completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                    <Icon className="w-4 h-4 text-slate-400" />
                )}
            </div>
            <div>
                <p className={`text-sm font-medium ${completed ? 'text-slate-900' : 'text-slate-600'}`}>
                    {label}
                </p>
                {info && <p className="text-xs text-slate-500">{info}</p>}
            </div>
        </div>
    );
}

/**
 * 📝 INFO ITEM
 */
function InfoItem({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
            <Icon className="w-5 h-5 mt-0.5 text-slate-400" />
            <div>
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="text-sm font-semibold text-slate-900">{value}</p>
            </div>
        </div>
    );
}

/**
 * 📅 TIMELINE VISUAL
 */
function TimelineVisual({ request }) {
    const events = [
        {
            label: 'Solicitação Criada',
            date: request.created_at,
            completed: true,
            icon: FileText,
        },
        {
            label: 'Aprovação',
            date: request.approved_at,
            completed: !!request.approved_at,
            icon: CheckCircle2,
        },
        {
            label: 'Pagamento Efetuado',
            date: request.paid_at,
            completed: !!request.paymentProof_id,
            icon: DollarSign,
        },
        {
            label: 'Recibo Anexado',
            date: null, // Não tem data específica
            completed: !!request.receiptDocument_id,
            icon: Receipt,
        },
    ];

    return (
        <div className="p-4 bg-white rounded-lg">
            <h5 className="mb-4 text-sm font-semibold text-slate-900">
                📅 Timeline do Processo
            </h5>
            <div className="relative">
                {/* Linha vertical */}
                <div className="absolute left-5 top-3 bottom-3 w-0.5 bg-slate-200" />

                {/* Eventos */}
                <div className="space-y-4">
                    {events.map((event, index) => (
                        <div key={index} className="relative flex items-start gap-4">
                            {/* Ícone */}
                            <div
                                className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full ${
                                    event.completed
                                        ? 'bg-emerald-500'
                                        : 'bg-slate-300'
                                }`}
                            >
                                <event.icon className="w-5 h-5 text-white" />
                            </div>

                            {/* Conteúdo */}
                            <div className="flex-1 pt-1.5">
                                <p className={`text-sm font-medium ${
                                    event.completed ? 'text-slate-900' : 'text-slate-500'
                                }`}>
                                    {event.label}
                                </p>
                                {event.date && (
                                    <p className="text-xs text-slate-500">
                                        {formatDate(event.date)}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function getStatusConfig(status) {
    const configs = {
        pending: {
            label: 'Pendente',
            icon: Clock,
            bgColor: 'bg-amber-100',
            textColor: 'text-amber-700',
        },
        approved: {
            label: 'Aprovado',
            icon: CheckCircle2,
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-700',
        },
        paid: {
            label: 'Pago',
            icon: CheckCircle2,
            bgColor: 'bg-emerald-100',
            textColor: 'text-emerald-700',
        },
        rejected: {
            label: 'Rejeitado',
            icon: XCircle,
            bgColor: 'bg-red-100',
            textColor: 'text-red-700',
        },
    };

    return configs[status] || configs.pending;
}

function calculateRequestProgress(request) {
    let progress = 0;

    // 25%: Aprovado
    if (['approved', 'paid'].includes(request.status)) {
        progress += 33;
    }

    // 33%: Comprovativo
    if (request.paymentProof_id) {
        progress += 34;
    }

    // 33%: Recibo
    if (request.receiptDocument_id) {
        progress += 33;
    }

    return progress;
}

function formatCurrency(amount, currency = 'MZN') {
    return new Intl.NumberFormat('pt-MZ', {
        style: 'currency',
        currency: currency,
    }).format(amount);
}

function formatDate(date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('pt-MZ', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}
