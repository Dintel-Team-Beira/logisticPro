import { Head, Link, router } from '@inertiajs/react';
import ClientPortalLayout from '@/Layouts/ClientPortalLayout';
import { ArrowLeft, FileText, Calendar, Download, CheckCircle, XCircle, AlertCircle, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function QuoteShow({ quote }) {
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const statusColors = {
        sent: 'bg-blue-100 text-blue-800 border-blue-300',
        viewed: 'bg-purple-100 text-purple-800 border-purple-300',
        accepted: 'bg-green-100 text-green-800 border-green-300',
        rejected: 'bg-red-100 text-red-800 border-red-300',
        expired: 'bg-gray-100 text-gray-800 border-gray-300',
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: 'MZN'
        }).format(value);
    };

    const handleAccept = () => {
        if (confirm('Tem certeza que deseja aceitar esta cotação? Nossa equipe entrará em contato em breve.')) {
            router.post(`/client/quotes/${quote.id}/accept`);
        }
    };

    const handleReject = () => {
        if (!rejectReason.trim()) {
            alert('Por favor, informe o motivo da rejeição.');
            return;
        }

        router.post(`/client/quotes/${quote.id}/reject`, {
            reason: rejectReason,
        });
        setShowRejectModal(false);
    };

    const canRespond = (quote.status === 'sent' || quote.status === 'viewed') && !quote.is_expired;

    return (
        <ClientPortalLayout>
            <Head title={`Cotação ${quote.quote_number}`} />

            {/* Back Button */}
            <Link
                href="/client/quotes"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-[#358c9c] mb-6 font-medium"
            >
                <ArrowLeft className="h-4 w-4" />
                Voltar para cotações
            </Link>

            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{quote.quote_number}</h1>
                        <p className="text-lg text-gray-600">{quote.title}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-4 py-2 rounded-lg text-sm font-medium border-2 ${
                            quote.is_expired ? statusColors.expired : statusColors[quote.status]
                        }`}>
                            {quote.is_expired ? 'Expirada' :
                             quote.status === 'sent' ? 'Pendente' :
                             quote.status === 'viewed' ? 'Visualizada' :
                             quote.status === 'accepted' ? 'Aceita' :
                             quote.status === 'rejected' ? 'Rejeitada' :
                             quote.status}
                        </span>
                        <button className="px-4 py-2 bg-[#358c9c] text-white rounded-lg hover:bg-[#246a77] transition-colors flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Download PDF
                        </button>
                    </div>
                </div>

                {quote.description && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700">{quote.description}</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Items */}
                    {quote.items && quote.items.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Itens da Cotação</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left p-3 text-sm font-semibold text-gray-700">Descrição</th>
                                            <th className="text-right p-3 text-sm font-semibold text-gray-700">Qtd</th>
                                            <th className="text-right p-3 text-sm font-semibold text-gray-700">Preço Unit.</th>
                                            <th className="text-right p-3 text-sm font-semibold text-gray-700">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {quote.items.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="p-3 text-sm text-gray-900">{item.description}</td>
                                                <td className="p-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                                                <td className="p-3 text-sm text-gray-900 text-right">
                                                    {formatCurrency(item.unit_price)}
                                                </td>
                                                <td className="p-3 text-sm font-medium text-gray-900 text-right">
                                                    {formatCurrency(item.quantity * item.unit_price)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Terms and Conditions */}
                    {quote.terms_conditions && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-3">Termos e Condições</h3>
                            <div className="prose prose-sm max-w-none text-gray-700">
                                <p className="whitespace-pre-wrap">{quote.terms_conditions}</p>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {quote.notes && (
                        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-2">Observações</h3>
                            <p className="text-sm text-gray-700">{quote.notes}</p>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Totals */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Resumo</h3>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium text-gray-900">
                                    {formatCurrency(quote.total_amount)}
                                </span>
                            </div>

                            {quote.tax_amount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">IVA/Impostos</span>
                                    <span className="font-medium text-gray-900">
                                        {formatCurrency(quote.tax_amount)}
                                    </span>
                                </div>
                            )}

                            <div className="border-t border-gray-200 pt-3">
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-900">Total</span>
                                    <span className="text-2xl font-bold text-[#358c9c]">
                                        {formatCurrency(quote.grand_total || quote.total_amount)}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-gray-200 space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar className="h-4 w-4" />
                                    <span>Criada em: {quote.created_at}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar className="h-4 w-4" />
                                    <span className={quote.is_expired ? 'text-red-600 font-medium' : ''}>
                                        Válida até: {quote.valid_until}
                                    </span>
                                </div>
                                {quote.created_by && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <User className="h-4 w-4" />
                                        <span>Por: {quote.created_by.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    {canRespond && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-green-600" />
                                Responder Cotação
                            </h3>
                            <p className="text-sm text-gray-700 mb-4">
                                Esta cotação aguarda sua resposta. Você pode aceitar ou rejeitar.
                            </p>
                            <div className="space-y-2">
                                <button
                                    onClick={handleAccept}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                    <CheckCircle className="h-5 w-5" />
                                    Aceitar Cotação
                                </button>
                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                                >
                                    <XCircle className="h-5 w-5" />
                                    Rejeitar Cotação
                                </button>
                            </div>
                        </div>
                    )}

                    {quote.status === 'accepted' && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Cotação Aceita</h3>
                                    <p className="text-sm text-gray-700">
                                        Você aceitou esta cotação. Nossa equipe entrará em contato em breve para dar continuidade.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {quote.status === 'rejected' && (
                        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-200 p-6">
                            <div className="flex items-start gap-3">
                                <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Cotação Rejeitada</h3>
                                    <p className="text-sm text-gray-700">
                                        Você rejeitou esta cotação.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {quote.is_expired && (
                        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200 p-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-6 w-6 text-gray-600 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Cotação Expirada</h3>
                                    <p className="text-sm text-gray-700 mb-3">
                                        Esta cotação expirou. Entre em contato conosco para solicitar uma nova cotação.
                                    </p>
                                    <a
                                        href="mailto:vendas@logisticapro.com"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#358c9c] text-white rounded-lg hover:bg-[#246a77] transition-colors font-medium text-sm"
                                    >
                                        Solicitar Nova Cotação
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
                    >
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Rejeitar Cotação</h3>
                        <p className="text-gray-600 mb-4">
                            Por favor, informe o motivo da rejeição para que possamos melhorar nossa proposta:
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Digite o motivo da rejeição..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                            rows={4}
                        />
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleReject}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                Confirmar Rejeição
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </ClientPortalLayout>
    );
}
