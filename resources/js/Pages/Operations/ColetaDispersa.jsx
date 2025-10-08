import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
  PhaseTimeline,
  DocumentChecklist,
  ShipmentCard,
  PhaseHeader,
  FilterBar
} from '@/Components/Operations/OperationsComponents';
import {
  Ship, Send, DollarSign, CheckCircle2,
  AlertTriangle, Clock, ArrowRight
} from 'lucide-react';

export default function ColetaDispersa({ shipments, stats, flash }) {
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // ========================================
  // HANDLERS
  // ========================================

  const handleRequestQuotations = (shipmentId) => {
    setSelectedShipment(shipments.data.find(s => s.id === shipmentId));
    setShowQuotationModal(true);
  };

  const handleRegisterPayment = (shipmentId) => {
    setSelectedShipment(shipments.data.find(s => s.id === shipmentId));
    setShowPaymentModal(true);
  };

  const handleDocumentUpload = (shipmentId, docType, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', docType);
    formData.append('stage', 'coleta_dispersa');

    router.post(`/shipments/${shipmentId}/documents`, formData, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        alert('Documento enviado com sucesso!');
      }
    });
  };

  const handleDocumentDelete = (documentId) => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      router.delete(`/documents/${documentId}`, {
        preserveState: true,
        preserveScroll: true
      });
    }
  };

  const handleDocumentView = (document) => {
    window.open(`/documents/${document.id}/download`, '_blank');
  };

  const handleSearch = (query) => {
    router.get('/operations/coleta', { search: query }, {
      preserveState: true,
      preserveScroll: true
    });
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <DashboardLayout>
      <Head title="Coleta de Dispersa - Fase 1" />

      <div className="p-6 space-y-6">
        {/* Header */}
        <PhaseHeader
          phase={1}
          title="Coleta de Dispersa"
          description="Recebimento do BL, solicitação de cotações e pagamento do frete"
          stats={[
            { label: 'Total Processos', value: stats.total || 0 },
            { label: 'Aguardando Cotação', value: stats.awaiting_quotation || 0 },
            { label: 'Cotação Recebida', value: stats.quotation_received || 0 },
            { label: 'Pronto p/ Avançar', value: stats.ready_to_advance || 0 }
          ]}
        />

        {/* Filtros */}
        <FilterBar onSearch={handleSearch} />

        {/* Grid de Processos */}
        <div className="col ">
          {shipments.data.map((shipment) => (
            <ShipmentDetailedCard
              key={shipment.id}
              shipment={shipment}
              onRequestQuotations={handleRequestQuotations}
              onRegisterPayment={handleRegisterPayment}
              onUploadDocument={handleDocumentUpload}
              onDeleteDocument={handleDocumentDelete}
              onViewDocument={handleDocumentView}
            />
          ))}
        </div>

        {/* Empty State */}
        {shipments.data.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 bg-white border rounded-xl border-slate-200">
            <Ship className="w-16 h-16 mb-4 text-slate-300" />
            <h3 className="mb-2 text-lg font-semibold text-slate-900">
              Nenhum processo nesta fase
            </h3>
            <p className="text-slate-600">
              Crie um novo shipment para começar
            </p>
          </div>
        )}

        {/* Modals */}
        {showQuotationModal && (
          <QuotationModal
            shipment={selectedShipment}
            onClose={() => setShowQuotationModal(false)}
          />
        )}

        {showPaymentModal && (
          <PaymentModal
            shipment={selectedShipment}
            onClose={() => setShowPaymentModal(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

// ========================================
// COMPONENTE: ShipmentDetailedCard
// Card detalhado com ações da Fase 1
// ========================================
function ShipmentDetailedCard({
  shipment,
  onRequestQuotations,
  onRegisterPayment,
  onUploadDocument,
  onDeleteDocument,
  onViewDocument
}) {
  const [showDocuments, setShowDocuments] = useState(false);

  const canRequestQuotation = shipment.documents.some(d => d.type === 'bl');
  const hasQuotation = shipment.quotation_status === 'received';
  const isPaid = shipment.payment_status === 'paid';

  return (
    <div className="overflow-hidden bg-white border rounded-xl border-slate-200">
      {/* Header */}
      <div className="p-4 border-b bg-slate-50 border-slate-200">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-slate-900">{shipment.reference_number}</h3>
            <p className="text-sm text-slate-600">BL: {shipment.bl_number}</p>
          </div>
          <PhaseTimeline currentPhase={1} shipment={shipment} />
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-500">Cliente</p>
            <p className="font-medium text-slate-900">{shipment.client?.name}</p>
          </div>
          <div>
            <p className="text-slate-500">Linha</p>
            <p className="font-medium text-slate-900">
              {shipment.shipping_line?.name || 'Não definida'}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Container</p>
            <p className="font-medium text-slate-900">{shipment.container_number}</p>
          </div>
          <div>
            <p className="text-slate-500">Chegada</p>
            <p className="font-medium text-slate-900">{shipment.arrival_date}</p>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="space-y-2">
          <ProgressItem
            icon={Ship}
            label="BL Recebido"
            completed={shipment.documents.some(d => d.type === 'bl')}
          />
          <ProgressItem
            icon={Send}
            label="Cotação Solicitada"
            completed={shipment.quotation_status === 'requested'}
          />
          <ProgressItem
            icon={CheckCircle2}
            label="Cotação Recebida"
            completed={hasQuotation}
          />
          <ProgressItem
            icon={DollarSign}
            label="Frete Pago"
            completed={isPaid}
          />
        </div>

        {/* Actions */}
        <div className="pt-3 space-y-2 border-t border-slate-200">
          {!canRequestQuotation && (
            <div className="flex items-center gap-2 p-3 border border-yellow-200 rounded-lg bg-yellow-50">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <p className="text-sm font-medium text-yellow-700">
                Upload BL antes de solicitar cotações
              </p>
            </div>
          )}

          <button
            onClick={() => onRequestQuotations(shipment.id)}
            disabled={!canRequestQuotation || hasQuotation}
            className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              canRequestQuotation && !hasQuotation
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="inline w-4 h-4 mr-2" />
            Solicitar Cotações
          </button>

          <button
            onClick={() => onRegisterPayment(shipment.id)}
            disabled={!hasQuotation || isPaid}
            className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              hasQuotation && !isPaid
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <DollarSign className="inline w-4 h-4 mr-2" />
            Registrar Pagamento
          </button>

          <button
            onClick={() => setShowDocuments(!showDocuments)}
            className="w-full px-4 py-2 text-sm font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
          >
            {showDocuments ? 'Ocultar' : 'Gerenciar'} Documentos ({shipment.documents.length})
          </button>
        </div>

        {/* Documents Section */}
        {showDocuments && (
          <div className="pt-3 border-t border-slate-200">
            <DocumentChecklist
              phase={1}
              documents={shipment.documents}
              onUpload={(type, file) => onUploadDocument(shipment.id, type, file)}
              onDelete={onDeleteDocument}
              onView={onViewDocument}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ========================================
// COMPONENTE: ProgressItem
// Item de progresso com ícone
// ========================================
function ProgressItem({ icon: Icon, label, completed }) {
  return (
    <div className={`flex items-center gap-3 p-2 rounded-lg ${
      completed ? 'bg-emerald-50' : 'bg-slate-50'
    }`}>
      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
        completed ? 'bg-emerald-500' : 'bg-slate-300'
      }`}>
        {completed ? (
          <CheckCircle2 className="w-5 h-5 text-white" />
        ) : (
          <Icon className="w-5 h-5 text-white" />
        )}
      </div>
      <p className={`text-sm font-medium ${
        completed ? 'text-emerald-700' : 'text-slate-600'
      }`}>
        {label}
      </p>
    </div>
  );
}

// ========================================
// COMPONENTE: QuotationModal
// Modal para solicitar cotações
// ========================================
function QuotationModal({ shipment, onClose }) {
  const [selectedLines, setSelectedLines] = useState([]);
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    router.post(`/shipments/${shipment.id}/quotations/request`, {
      shipping_lines: selectedLines,
      message
    }, {
      onSuccess: () => {
        alert('Cotações solicitadas com sucesso!');
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            Solicitar Cotações
          </h2>
          <button
            onClick={onClose}
            className="p-2 transition-colors rounded-lg hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Selecionar Linhas de Navegação
            </label>
            {/* Lista de linhas aqui */}
            <p className="text-sm text-slate-500">
              Selecione as linhas para solicitar cotações
            </p>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Mensagem (opcional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg border-slate-300"
              rows="4"
              placeholder="Informações adicionais para as linhas..."
            />
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Enviar Solicitações
          </button>
        </div>
      </div>
    </div>
  );
}

// ========================================
// COMPONENTE: PaymentModal
// Modal para registrar pagamento
// ========================================
function PaymentModal({ shipment, onClose }) {
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    payment_date: '',
    reference: '',
    receipt: null
  });

  const handleSubmit = () => {
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    router.post(`/shipments/${shipment.id}/payment`, data, {
      onSuccess: () => {
        alert('Pagamento registrado com sucesso!');
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            Registrar Pagamento do Frete
          </h2>
          <button onClick={onClose} className="p-2 transition-colors rounded-lg hover:bg-slate-100">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Valor
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg border-slate-300"
                placeholder="2500.00"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Moeda
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg border-slate-300"
              >
                <option value="USD">USD</option>
                <option value="MZN">MZN</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Data de Pagamento
            </label>
            <input
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg border-slate-300"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Referência
            </label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => setFormData({...formData, reference: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg border-slate-300"
              placeholder="Número de referência do pagamento"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Comprovante (POP)
            </label>
            <input
              type="file"
              onChange={(e) => setFormData({...formData, receipt: e.target.files[0]})}
              className="w-full px-3 py-2 border rounded-lg border-slate-300"
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 font-medium text-white transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-700"
          >
            Registrar Pagamento
          </button>
        </div>
      </div>
    </div>
  );
}
