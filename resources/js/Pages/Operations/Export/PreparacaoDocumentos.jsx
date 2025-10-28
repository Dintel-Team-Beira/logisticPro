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
  FileText, Send, Upload, CheckCircle2,
  AlertTriangle, Clock, ArrowRight, Package
} from 'lucide-react';

export default function PreparacaoDocumentos({ shipments, stats, flash }) {
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // ========================================
  // HANDLERS
  // ========================================

  const handleDocumentUpload = (shipmentId, docType, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', docType);
    formData.append('stage', 'preparacao_documentos');

    router.post(`/shipments/${shipmentId}/documents`, formData, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        alert('Documento enviado com sucesso!');
      },
      onError: (errors) => {
        console.error('Erro ao enviar documento:', errors);
        alert('Erro ao enviar documento: ' + (errors.file || errors.error || 'Erro desconhecido'));
      }
    });
  };

  const handleDocumentDelete = (documentId) => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      router.delete(`/documents/${documentId}`, {
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          console.log('Documento excluído com sucesso!');
        },
        onError: (errors) => {
          console.error('Erro ao excluir documento:', errors);
          alert('Erro ao excluir documento: ' + (errors.error || 'Erro desconhecido'));
        }
      });
    }
  };

  const handleDocumentView = (document) => {
    window.open(`/documents/${document.id}/download`, '_blank');
  };

  const handleSearch = (query) => {
    router.get('/operations/export/preparacao', { search: query }, {
      preserveState: true,
      preserveScroll: true
    });
  };

  const handleAdvancePhase = (shipmentId, canAdvance) => {
    // Validar se pode avançar antes de confirmar
    if (!canAdvance) {
      alert('Por favor, complete todos os documentos obrigatórios antes de avançar.');
      return;
    }

    if (confirm('Deseja avançar para a próxima fase (Booking)?')) {
      router.post(`/shipments/${shipmentId}/advance`, {
        phase: 2
      }, {
        onSuccess: () => {
          console.log('Avançado com sucesso!');
        },
        onError: (errors) => {
          console.error('Erro ao avançar:', errors);
          alert('Erro ao avançar: ' + (errors.error || 'Erro desconhecido. Verifique se todos os documentos obrigatórios foram enviados.'));
        }
      });
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <DashboardLayout>
      <Head title="Preparação de Documentos - Fase 1 (Exportação)" />

      <div className="p-6 space-y-6">
        {/* Header */}
        <PhaseHeader
          phase={1}
          title="Preparação de Documentos"
          description="Preparar fatura comercial, packing list e certificados necessários"
          stats={[
            { label: 'Total Processos', value: stats?.total || 0 },
            { label: 'Aguardando Documentos', value: stats?.awaiting_documents || 0 },
            { label: 'Documentos Completos', value: stats?.documents_ready || 0 },
            { label: 'Pronto p/ Avançar', value: stats?.ready_to_advance || 0 }
          ]}
        />

        {/* Filtros */}
        <FilterBar onSearch={handleSearch} />

        {/* Grid de Processos */}
        <div className="space-y-6">
          {shipments?.data?.map((shipment) => (
            <ShipmentDetailedCard
              key={shipment.id}
              shipment={shipment}
              onUploadDocument={handleDocumentUpload}
              onDeleteDocument={handleDocumentDelete}
              onViewDocument={handleDocumentView}
              onAdvancePhase={handleAdvancePhase}
            />
          ))}
        </div>

        {/* Empty State */}
        {(!shipments?.data || shipments.data.length === 0) && (
          <div className="flex flex-col items-center justify-center p-12 bg-white border rounded-xl border-slate-200">
            <Package className="w-16 h-16 mb-4 text-slate-300" />
            <h3 className="mb-2 text-lg font-semibold text-slate-900">
              Nenhum processo de exportação nesta fase
            </h3>
            <p className="text-slate-600">
              Crie um novo shipment de exportação para começar
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ========================================
// COMPONENTE: ShipmentDetailedCard
// Card detalhado com ações da Fase 1 Export
// ========================================
function ShipmentDetailedCard({
  shipment,
  onUploadDocument,
  onDeleteDocument,
  onViewDocument,
  onAdvancePhase,
}) {
  const [uploading, setUploading] = useState(null);

  const requiredDocs = [
    { type: 'commercial_invoice', label: 'Fatura Comercial', required: true },
    { type: 'packing_list', label: 'Packing List', required: true },
    { type: 'certificate_origin', label: 'Certificado de Origem', required: false },
  ];

  const handleFileUpload = async (docType, event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(docType);
    await onUploadDocument(shipment.id, docType, file);
    setUploading(null);
  };

  const getDocumentStatus = (docType) => {
    return shipment.documents?.find(doc => doc.type === docType);
  };

  const progress = shipment.real_progress || 0;
  const canAdvance = progress >= 100;

  return (
    <div className="p-6 mb-4 bg-white border rounded-xl border-slate-200 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {shipment.reference_number}
          </h3>
          <p className="text-sm text-slate-600">
            Cliente: {shipment.client?.name}
          </p>
          <p className="text-xs text-slate-500">
            Container: {shipment.container_number} | {shipment.container_type}
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{progress}%</div>
          <div className="text-xs text-slate-500">Progresso</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist de Documentos */}
      <div className="space-y-3 mb-4">
        <h4 className="text-sm font-semibold text-slate-700">Documentos Necessários:</h4>
        {requiredDocs.map((doc) => {
          const uploadedDoc = getDocumentStatus(doc.type);
          const isUploading = uploading === doc.type;

          return (
            <div
              key={doc.type}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {uploadedDoc ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Clock className="w-5 h-5 text-slate-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {doc.label}
                    {doc.required && <span className="text-red-500 ml-1">*</span>}
                  </p>
                  {uploadedDoc && (
                    <p className="text-xs text-slate-500">{uploadedDoc.name}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {uploadedDoc ? (
                  <>
                    <button
                      onClick={() => onViewDocument(uploadedDoc)}
                      className="px-3 py-1 text-xs text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => onDeleteDocument(uploadedDoc.id)}
                      className="px-3 py-1 text-xs text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
                    >
                      Remover
                    </button>
                  </>
                ) : (
                  <label className="relative">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(doc.type, e)}
                      disabled={isUploading}
                    />
                    <span className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700">
                      {isUploading ? 'Enviando...' : 'Upload'}
                    </span>
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div className="text-xs text-slate-500">
          {canAdvance ? (
            <span className="text-emerald-600 font-semibold">✓ Pronto para avançar</span>
          ) : (
            <span>Complete os documentos obrigatórios</span>
          )}
        </div>

        <button
          onClick={() => onAdvancePhase(shipment.id, canAdvance)}
          disabled={!canAdvance}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Avançar para Booking
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
