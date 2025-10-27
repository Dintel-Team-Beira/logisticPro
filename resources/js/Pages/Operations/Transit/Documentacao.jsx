import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { FileText, Check, ArrowRight, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function Documentacao({ shipments }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleStatusChange = (shipmentId, newStatus) => {
    router.post(`/operations/transit/documentacao/${shipmentId}/update-status`, {
      status: newStatus
    }, {
      preserveScroll: true,
    });
  };

  const handleAdvancePhase = (shipmentId) => {
    if (confirm('Tem certeza que deseja avançar para o Desembaraço Aduaneiro?')) {
      router.post(`/operations/transit/${shipmentId}/advance-phase`);
    }
  };

  const handleFileUpload = (shipmentId, docType, event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', docType);
    formData.append('phase', 2);

    setIsUploading(true);

    router.post(`/shipments/${shipmentId}/documents`, formData, {
      onSuccess: () => setIsUploading(false),
      onError: () => {
        setIsUploading(false);
        alert('Erro ao fazer upload do documento');
      },
      preserveScroll: true,
    });
  };

  const statusOptions = [
    { value: 'pending', label: 'Pendente', color: 'bg-slate-100 text-slate-800' },
    { value: 'in_progress', label: 'Em Andamento', color: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: 'Concluída', color: 'bg-emerald-100 text-emerald-800' },
  ];

  const requiredDocs = [
    { type: 'transit_permit', label: 'Permissão de Trânsito', required: true },
    { type: 'customs_bond', label: 'Caução Alfandegária', required: true },
    { type: 'route_plan', label: 'Plano de Rota', required: false },
  ];

  return (
    <DashboardLayout>
      <Head title="Trânsito - Documentação" />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Fase 2: Documentação de Trânsito</h1>
            <p className="mt-1 text-sm text-slate-600">
              Preparar e validar toda documentação necessária para trânsito
            </p>
          </div>
          <div className="px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm font-semibold text-purple-900">🔄 Processo de Trânsito</p>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Checklist da Documentação</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Obter permissão de trânsito das autoridades</li>
                <li>✓ Processar caução/garantia alfandegária</li>
                <li>✓ Preparar plano de rota e cronograma</li>
                <li>✓ Verificar conformidade documental</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {shipments && shipments.length > 0 ? (
            shipments.map((shipment) => {
              const canAdvance = shipment.tra_documentation_status === 'completed';
              const allRequiredDocsUploaded = requiredDocs
                .filter(doc => doc.required)
                .every(doc => shipment.documents?.find(d => d.type === doc.type));

              return (
                <div key={shipment.id} className="p-6 bg-white border rounded-xl border-slate-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{shipment.reference_number}</h3>
                      <p className="text-sm text-slate-600">Cliente: {shipment.client?.name}</p>
                      <p className="text-xs text-slate-500">
                        Rota: {shipment.origin_port} → MOZ → {shipment.destination_port}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusOptions.find(s => s.value === shipment.tra_documentation_status)?.color || 'bg-slate-100 text-slate-800'}`}>
                      {statusOptions.find(s => s.value === shipment.tra_documentation_status)?.label || 'Pendente'}
                    </div>
                  </div>

                  <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm font-medium text-slate-700 mb-3">Status da Documentação:</p>
                    <div className="flex gap-2">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleStatusChange(shipment.id, option.value)}
                          disabled={shipment.tra_documentation_status === option.value}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${shipment.tra_documentation_status === option.value ? option.color + ' ring-2 ring-offset-2 ring-purple-500' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Documentos:</h4>
                    <div className="space-y-2">
                      {requiredDocs.map((doc) => {
                        const uploadedDoc = shipment.documents?.find(d => d.type === doc.type);
                        return (
                          <div key={doc.type} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${uploadedDoc ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                                {uploadedDoc ? <Check className="w-5 h-5 text-emerald-600" /> : <FileText className="w-5 h-5 text-slate-400" />}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-900">
                                  {doc.label}
                                  {doc.required && <span className="ml-1 text-red-500">*</span>}
                                </p>
                              </div>
                            </div>
                            {!uploadedDoc && (
                              <label className="relative">
                                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(shipment.id, doc.type, e)} disabled={isUploading} />
                                <span className="px-3 py-1 text-xs font-medium text-white bg-purple-600 rounded-lg cursor-pointer hover:bg-purple-700">Upload</span>
                              </label>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="text-xs text-slate-500">
                      {canAdvance && allRequiredDocsUploaded ? (
                        <span className="text-emerald-600 font-semibold">✓ Pronto para avançar</span>
                      ) : (
                        <span>Complete a documentação para avançar</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAdvancePhase(shipment.id)}
                      disabled={!canAdvance || !allRequiredDocsUploaded}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Avançar para Desembaraço
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center bg-white border rounded-xl border-slate-200">
              <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhum processo nesta fase</h3>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
