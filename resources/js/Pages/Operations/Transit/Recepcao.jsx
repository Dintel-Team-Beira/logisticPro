import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Package, Check, X, Clock, ArrowRight, Download, FileText, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function Recepcao({ shipments }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleStatusChange = (shipmentId, newStatus) => {
    router.post(`/operations/transit/recepcao/${shipmentId}/update-status`, {
      status: newStatus
    }, {
      preserveScroll: true,
    });
  };

  const handleAdvancePhase = (shipmentId) => {
    if (confirm('Tem certeza que deseja avançar para a próxima fase?')) {
      router.post(`/operations/transit/${shipmentId}/advance-phase`);
    }
  };

  const handleFileUpload = (shipmentId, docType, event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', docType);
    formData.append('phase', 1);

    setIsUploading(true);

    router.post(`/shipments/${shipmentId}/documents`, formData, {
      onSuccess: () => {
        setIsUploading(false);
      },
      onError: () => {
        setIsUploading(false);
        alert('Erro ao fazer upload do documento');
      },
      preserveScroll: true,
    });
  };

  const statusOptions = [
    { value: 'pending', label: 'Pendente', color: 'bg-slate-100 text-slate-800' },
    { value: 'received', label: 'Recebida', color: 'bg-blue-100 text-blue-800' },
    { value: 'verified', label: 'Verificada', color: 'bg-emerald-100 text-emerald-800' },
  ];

  const getStatusColor = (status) => {
    return statusOptions.find(s => s.value === status)?.color || 'bg-slate-100 text-slate-800';
  };

  return (
    <DashboardLayout>
      <Head title="Trânsito - Recepção" />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Fase 1: Recepção de Carga em Trânsito</h1>
            <p className="mt-1 text-sm text-slate-600">
              Receber, verificar e confirmar a recepção da carga em trânsito
            </p>
          </div>
          <div className="px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm font-semibold text-purple-900">
              🔄 Processo de Trânsito
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Checklist da Fase de Recepção
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Receber a carga no terminal/armazém</li>
                <li>✓ Verificar integridade física da carga e documentos</li>
                <li>✓ Confirmar dados com manifesto de carga</li>
                <li>✓ Registrar a recepção no sistema</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Shipments List */}
        <div className="space-y-4">
          {shipments && shipments.length > 0 ? (
            shipments.map((shipment) => {
              const progress = shipment.real_progress || 0;
              const canAdvance = shipment.tra_reception_status === 'verified';

              return (
                <div
                  key={shipment.id}
                  className="p-6 bg-white border rounded-xl border-slate-200 hover:shadow-lg transition-shadow"
                >
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
                      <p className="text-xs text-slate-500">
                        Rota: {shipment.origin_port} → Moçambique → {shipment.destination_port}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(shipment.tra_reception_status)}`}>
                        {statusOptions.find(s => s.value === shipment.tra_reception_status)?.label || 'Pendente'}
                      </div>
                      <div className="mt-2 text-sm text-slate-600">
                        Progresso: <span className="font-bold text-purple-600">{progress}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Actions */}
                  <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm font-medium text-slate-700 mb-3">Status da Recepção:</p>
                    <div className="flex gap-2">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleStatusChange(shipment.id, option.value)}
                          disabled={shipment.tra_reception_status === option.value}
                          className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-all
                            ${shipment.tra_reception_status === option.value
                              ? option.color + ' ring-2 ring-offset-2 ring-purple-500'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                            }
                            disabled:cursor-not-allowed
                          `}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Documentos de Recepção:</h4>
                    <div className="space-y-2">
                      {[
                        { type: 'transit_manifest', label: 'Manifesto de Trânsito', required: true },
                        { type: 'bill_of_lading', label: 'Bill of Lading (BL)', required: true },
                        { type: 'transit_declaration', label: 'Declaração de Trânsito', required: false },
                      ].map((doc) => {
                        const uploadedDoc = shipment.documents?.find(d => d.type === doc.type);
                        return (
                          <div
                            key={doc.type}
                            className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`
                                flex items-center justify-center w-8 h-8 rounded-full
                                ${uploadedDoc ? 'bg-emerald-100' : 'bg-slate-100'}
                              `}>
                                {uploadedDoc ? (
                                  <Check className="w-5 h-5 text-emerald-600" />
                                ) : (
                                  <FileText className="w-5 h-5 text-slate-400" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-900">
                                  {doc.label}
                                  {doc.required && <span className="ml-1 text-red-500">*</span>}
                                </p>
                                {uploadedDoc && (
                                  <p className="text-xs text-slate-500">
                                    Anexado em {new Date(uploadedDoc.created_at).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {uploadedDoc ? (
                                <button
                                  onClick={() => window.open(`/documents/${uploadedDoc.id}/download`, '_blank')}
                                  className="px-3 py-1 text-xs text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
                                >
                                  Ver
                                </button>
                              ) : (
                                <label className="relative">
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => handleFileUpload(shipment.id, doc.type, e)}
                                    disabled={isUploading}
                                  />
                                  <span className="px-3 py-1 text-xs font-medium text-white bg-purple-600 rounded-lg cursor-pointer hover:bg-purple-700">
                                    {isUploading ? 'Enviando...' : 'Upload'}
                                  </span>
                                </label>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="text-xs text-slate-500">
                      {canAdvance ? (
                        <span className="text-emerald-600 font-semibold">✓ Pronto para avançar</span>
                      ) : (
                        <span>Confirme a verificação da carga para avançar</span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAdvancePhase(shipment.id)}
                      disabled={!canAdvance}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Avançar para Documentação
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center bg-white border rounded-xl border-slate-200">
              <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Nenhum processo nesta fase
              </h3>
              <p className="text-slate-600">
                Não há processos de trânsito aguardando recepção no momento
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
