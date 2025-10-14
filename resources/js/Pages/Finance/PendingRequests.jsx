import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Eye,
  DollarSign,
  FileText,
  AlertCircle,
  Filter,
  Search,
} from 'lucide-react';

export default function PendingRequests({ requests, filters }) {
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [selectedPhase, setSelectedPhase] = useState(filters?.phase || 'all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const phases = [
    { value: 'all', label: 'Todas as Fases' },
    { value: 'coleta_dispersa', label: 'Fase 1: Coleta' },
    { value: 'legalizacao', label: 'Fase 2: Legalização' },
    { value: 'alfandegas', label: 'Fase 3: Alfândegas' },
    { value: 'cornelder', label: 'Fase 4: Cornelder' },
  ];

  const handleSearch = () => {
    router.get('/finance/pending', {
      search: searchTerm,
      phase: selectedPhase !== 'all' ? selectedPhase : null,
    }, {
      preserveState: true,
    });
  };

  const handleStartPayment = (request) => {
    setSelectedRequest(request);
    setShowConfirmModal(true);
  };

  const formatCurrency = (amount, currency = 'MZN') => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const badges = {
      approved: {
        label: 'Aprovado - A Pagar',
        class: 'bg-blue-100 text-blue-700 border-blue-300',
        icon: Clock
      },
      in_payment: {
        label: 'Em Processamento',
        class: 'bg-purple-100 text-purple-700 border-purple-300',
        icon: DollarSign
      },
    };
    return badges[status] || badges.approved;
  };

  const getPriorityClass = (amount) => {
    if (amount > 100000) return 'border-l-4 border-red-500';
    if (amount > 50000) return 'border-l-4 border-yellow-500';
    return 'border-l-4 border-blue-500';
  };

  return (
    <DashboardLayout>
      <Head title="Solicitações Pendentes - Finanças" />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Solicitações Pendentes
            </h1>
            <p className="mt-1 text-slate-600">
              Processar pagamentos aprovados
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 border border-blue-200 rounded-lg bg-blue-50">
              <p className="text-sm font-medium text-blue-900">
                Total Pendente: {formatCurrency(requests.data.reduce((sum, r) => sum + parseFloat(r.amount), 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="p-4 mb-6 bg-white border rounded-xl border-slate-200">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Busca */}
          <div className="relative md:col-span-2">
            <Search className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Buscar por processo, BL, cliente..."
              className="w-full py-2 pl-10 pr-4 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro de Fase */}
          <div className="relative">
            <Filter className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2 text-slate-400" />
            <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
            >
              {phases.map(phase => (
                <option key={phase.value} value={phase.value}>
                  {phase.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleSearch}
          className="px-4 py-2 mt-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Aplicar Filtros
        </button>
      </div>

      {/* Lista de Solicitações */}
      <div className="space-y-4">
        {requests.data.length === 0 ? (
          <div className="p-12 text-center bg-white border rounded-xl border-slate-200">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h3 className="mb-2 text-lg font-bold text-slate-900">
              Tudo em Dia! 🎉
            </h3>
            <p className="text-slate-600">
              Não há solicitações pendentes para processar no momento.
            </p>
          </div>
        ) : (
          requests.data.map((request) => {
            const badge = getStatusBadge(request.status);
            const StatusIcon = badge.icon;

            return (
              <div
                key={request.id}
                className={`bg-white border rounded-xl border-slate-200 overflow-hidden hover:shadow-lg transition-all ${getPriorityClass(request.amount)}`}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {request.shipment.reference_number}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${badge.class}`}>
                          <StatusIcon className="w-3 h-3" />
                          {badge.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>Cliente: {request.shipment.client?.name}</span>
                        <span>•</span>
                        <span>BL: {request.shipment.bl_number}</span>
                        <span>•</span>
                        <span>Solicitado por: {request.requester?.name}</span>
                      </div>
                    </div>

                    {/* Valor em Destaque */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">
                        {formatCurrency(request.amount, request.currency)}
                      </p>
                      <p className="text-xs text-slate-600">
                        {request.currency}
                      </p>
                    </div>
                  </div>

                  {/* Informações do Pagamento */}
                  <div className="grid grid-cols-3 gap-4 p-4 mb-4 border rounded-lg bg-slate-50 border-slate-200">
                    <div>
                      <p className="text-xs font-medium text-slate-600">Destinatário</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {request.payee}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600">Tipo de Pagamento</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {request.request_type === 'quotation_payment' && 'Pagamento de Cotação'}
                        {request.request_type === 'customs_tax' && 'Taxas Alfandegárias'}
                        {request.request_type === 'storage_fee' && 'Taxa de Armazenamento'}
                        {request.request_type === 'cornelder_fee' && 'Despesas Cornelder'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600">Fase</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {request.phase === 'coleta_dispersa' && 'Fase 1: Coleta'}
                        {request.phase === 'alfandegas' && 'Fase 3: Alfândegas'}
                        {request.phase === 'cornelder' && 'Fase 4: Cornelder'}
                      </p>
                    </div>
                  </div>

                  {/* Descrição */}
                  <div className="p-3 mb-4 border-l-4 border-blue-500 rounded-r-lg bg-blue-50">
                    <p className="text-sm text-slate-700">
                      <strong>Descrição:</strong> {request.description}
                    </p>
                  </div>

                  {/* Aprovação Info */}
                  {request.approved_by && (
                    <div className="flex items-center gap-2 p-3 mb-4 border border-green-200 rounded-lg bg-green-50">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div className="flex-1 text-sm">
                        <p className="font-medium text-green-900">
                          Aprovado por {request.approver?.name}
                        </p>
                        <p className="text-xs text-green-700">
                          {new Date(request.approved_at).toLocaleDateString('pt-MZ', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {request.approval_notes && (
                          <p className="mt-1 text-xs italic text-green-800">
                            "{request.approval_notes}"
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="flex gap-2">
                      {request.quotation_document && (
                        <a
                          href={`/documents/${request.quotation_document.id}/download`}
                          className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
                        >
                          <Download className="w-4 h-4" />
                          Baixar Cotação
                        </a>
                      )}

                      <Link
                        href={`/shipments/${request.shipment.id}`}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Processo
                      </Link>
                    </div>

                    <div className="flex gap-2">
                      {request.status === 'approved' && (
                        <button
                          onClick={() => handleStartPayment(request)}
                          className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                        >
                          <DollarSign className="w-4 h-4" />
                          Processar Pagamento
                        </button>
                      )}

                      {request.status === 'in_payment' && (
                        <div className="flex items-center gap-2 px-4 py-2 text-purple-700 bg-purple-100 rounded-lg">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Sendo processado por você
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Paginação */}
      {requests.links && (
        <div className="flex justify-center gap-2 mt-6">
          {requests.links.map((link, idx) => (
            <Link
              key={idx}
              href={link.url}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                link.active
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          ))}
        </div>
      )}

      {/* Modal de Confirmação de Pagamento */}
      {showConfirmModal && selectedRequest && (
        <PaymentConfirmModal
          request={selectedRequest}
          onClose={() => {
            setShowConfirmModal(false);
            setSelectedRequest(null);
          }}
        />
      )}
    </DashboardLayout>
  );
}

// ========================================
// MODAL DE CONFIRMAÇÃO DE PAGAMENTO
// ========================================

function PaymentConfirmModal({ request, onClose }) {
  const [paymentProof, setPaymentProof] = useState(null);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentReference, setPaymentReference] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!paymentProof) {
      alert('Por favor, anexe o comprovativo de pagamento');
      return;
    }

    setProcessing(true);

    const formData = new FormData();
    formData.append('payment_proof', paymentProof);
    formData.append('payment_date', paymentDate);
    formData.append('reference', paymentReference);

    router.post(`/finance/payment-requests/${request.id}/confirm-payment`, formData, {
      preserveScroll: true,
      onSuccess: () => {
        onClose();
      },
      onError: (errors) => {
        console.error(errors);
        alert('Erro ao confirmar pagamento');
      },
      onFinish: () => setProcessing(false),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">
            Confirmar Pagamento
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Processo: {request.shipment.reference_number}
          </p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Resumo do Pagamento */}
          <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-blue-900">Destinatário</p>
                <p className="text-sm font-bold text-blue-900">{request.payee}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-blue-900">Valor</p>
                <p className="text-2xl font-bold text-blue-900">
                  {new Intl.NumberFormat('pt-MZ', {
                    style: 'currency',
                    currency: request.currency
                  }).format(request.amount)}
                </p>
              </div>
            </div>
          </div>

          {/* Data do Pagamento */}
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Data do Pagamento *
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Referência */}
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Referência Bancária
            </label>
            <input
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="Ex: TRF123456789"
              className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Comprovativo */}
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Comprovativo de Pagamento * (PDF, JPG, PNG)
            </label>
            <input
              type="file"
              onChange={(e) => setPaymentProof(e.target.files[0])}
              accept=".pdf,.jpg,.jpeg,.png"
              required
              className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
            {paymentProof && (
              <p className="mt-2 text-sm text-green-600">
                ✓ {paymentProof.name} ({(paymentProof.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={processing}
              className="flex-1 px-4 py-2 font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-1 px-4 py-2 font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {processing ? 'Processando...' : 'Confirmar Pagamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
