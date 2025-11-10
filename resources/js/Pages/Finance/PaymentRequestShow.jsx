import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
  ArrowLeft,
  FileText,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  User,
  Calendar,
  AlertCircle,
  Building
} from 'lucide-react';

export default function PaymentRequestShow({ paymentRequest }) {
  const formatCurrency = (amount, currency = 'MZN') => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('pt-MZ', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: 'Pendente', class: 'bg-yellow-100 text-yellow-700', icon: Clock },
      approved: { label: 'Aprovado', class: 'bg-blue-100 text-blue-700', icon: CheckCircle },
      in_payment: { label: 'Em Pagamento', class: 'bg-purple-100 text-purple-700', icon: DollarSign },
      paid: { label: 'Pago', class: 'bg-green-100 text-green-700', icon: CheckCircle },
      rejected: { label: 'Rejeitado', class: 'bg-red-100 text-red-700', icon: XCircle }
    };
    return badges[status] || badges.pending;
  };

  const handleStartPayment = () => {
    if (confirm('Deseja iniciar o processo de pagamento?')) {
      router.post(`/payment-requests/${paymentRequest.id}/start-payment`, {}, {
        preserveScroll: true
      });
    }
  };

  const badge = getStatusBadge(paymentRequest.status);
  const StatusIcon = badge.icon;

  return (
    <DashboardLayout>
      <Head title={`Solicitação de Pagamento #${paymentRequest.id}`} />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/finance"
              className="p-2 transition-colors rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Solicitação de Pagamento
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Processo: {paymentRequest.shipment?.reference_number || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg ${badge.class}`}>
              <StatusIcon className="w-4 h-4" />
              {badge.label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Details */}
          <div className="space-y-6 lg:col-span-2">
            {/* Payment Information */}
            <div className="bg-white border rounded-xl border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Informações de Pagamento
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Beneficiário</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {paymentRequest.payee}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-600">Valor</p>
                    <p className="mt-1 text-2xl font-bold text-green-600">
                      {formatCurrency(paymentRequest.amount, paymentRequest.currency)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-600">Tipo de Despesa</p>
                    <p className="mt-1 text-slate-900">
                      {paymentRequest.request_type_label || paymentRequest.request_type}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-600">Fase</p>
                    <p className="mt-1 text-slate-900">
                      Fase {paymentRequest.phase}
                    </p>
                  </div>
                </div>

                {paymentRequest.description && (
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-sm font-medium text-slate-600">Descrição</p>
                    <p className="mt-1 text-slate-900">{paymentRequest.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Process Information */}
            <div className="bg-white border rounded-xl border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Informações do Processo
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Referência</p>
                    <p className="mt-1 text-slate-900">
                      {paymentRequest.shipment?.reference_number || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-600">Cliente</p>
                    <p className="mt-1 text-slate-900">
                      {paymentRequest.shipment?.client?.name || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-600">BL Number</p>
                    <p className="mt-1 text-slate-900">
                      {paymentRequest.shipment?.bl_number || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-600">Tipo de Operação</p>
                    <p className="mt-1 text-slate-900">
                      {paymentRequest.shipment?.type === 'import' ? 'Importação' :
                       paymentRequest.shipment?.type === 'export' ? 'Exportação' : 'Trânsito'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white border rounded-xl border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                  <FileText className="w-5 h-5 text-amber-600" />
                  Documentos
                </h2>
              </div>

              <div className="p-6 space-y-3">
                {paymentRequest.quotation_document_id && (
                  <div className="flex items-center justify-between p-4 border rounded-lg border-slate-200 hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Cotação / Fatura</p>
                        <p className="text-sm text-slate-600">Documento anexado</p>
                      </div>
                    </div>
                    <a
                      href={`/documents/${paymentRequest.quotation_document_id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4" />
                      Baixar
                    </a>
                  </div>
                )}

                {paymentRequest.payment_proof_id && (
                  <div className="flex items-center justify-between p-4 border rounded-lg border-slate-200 hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Comprovativo de Pagamento</p>
                        <p className="text-sm text-slate-600">Anexado por Finanças</p>
                      </div>
                    </div>
                    <a
                      href={`/documents/${paymentRequest.payment_proof_id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                    >
                      <Download className="w-4 h-4" />
                      Baixar
                    </a>
                  </div>
                )}

                {paymentRequest.receipt_document_id && (
                  <div className="flex items-center justify-between p-4 border rounded-lg border-slate-200 hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Recibo do Fornecedor</p>
                        <p className="text-sm text-slate-600">Anexado por Operações</p>
                      </div>
                    </div>
                    <a
                      href={`/documents/${paymentRequest.receipt_document_id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700"
                    >
                      <Download className="w-4 h-4" />
                      Baixar
                    </a>
                  </div>
                )}

                {!paymentRequest.quotation_document_id && !paymentRequest.payment_proof_id && !paymentRequest.receipt_document_id && (
                  <div className="flex items-center justify-center py-8 text-slate-500">
                    <div className="text-center">
                      <AlertCircle className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                      <p className="text-sm">Nenhum documento anexado</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <div className="bg-white border rounded-xl border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Linha do Tempo
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 w-px mt-2 bg-slate-200"></div>
                  </div>
                  <div className="pb-4">
                    <p className="font-medium text-slate-900">Solicitado</p>
                    <p className="text-sm text-slate-600">
                      {paymentRequest.requester?.name || 'N/A'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(paymentRequest.created_at)}
                    </p>
                  </div>
                </div>

                {paymentRequest.approved_at && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="p-2 bg-green-100 rounded-full">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      {paymentRequest.paid_at && <div className="flex-1 w-px mt-2 bg-slate-200"></div>}
                    </div>
                    <div className={paymentRequest.paid_at ? 'pb-4' : ''}>
                      <p className="font-medium text-slate-900">Aprovado</p>
                      <p className="text-sm text-slate-600">
                        {paymentRequest.approver?.name || 'N/A'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(paymentRequest.approved_at)}
                      </p>
                    </div>
                  </div>
                )}

                {paymentRequest.paid_at && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <DollarSign className="w-4 h-4 text-purple-600" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Pago</p>
                      <p className="text-sm text-slate-600">
                        {paymentRequest.payer?.name || 'N/A'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(paymentRequest.paid_at)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {paymentRequest.status === 'approved' && (
              <div className="bg-white border rounded-xl border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-lg font-bold text-slate-900">Ações</h2>
                </div>

                <div className="p-6">
                  <button
                    onClick={handleStartPayment}
                    className="flex items-center justify-center w-full gap-2 px-4 py-3 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    <DollarSign className="w-5 h-5" />
                    Processar Pagamento
                  </button>
                </div>
              </div>
            )}

            {/* View Process */}
            <div className="bg-white border rounded-xl border-slate-200">
              <div className="p-6">
                <Link
                  href={`/shipments/${paymentRequest.shipment_id}`}
                  className="flex items-center justify-center w-full gap-2 px-4 py-3 text-sm font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
                >
                  <Building className="w-5 h-5" />
                  Ver Processo Completo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
