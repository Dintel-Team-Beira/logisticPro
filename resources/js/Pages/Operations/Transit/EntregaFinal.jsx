import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { CheckCircle, Calendar, MapPin, ArrowRight, AlertCircle, PartyPopper } from 'lucide-react';

export default function EntregaFinal({ shipments }) {
  const handleStatusChange = (shipmentId, newStatus) => {
    router.post(`/operations/transit/entrega-final/${shipmentId}/update-status`, {
      status: newStatus
    }, {
      preserveScroll: true,
    });
  };

  const handleDeliveryDate = (shipmentId, date) => {
    router.post(`/operations/transit/entrega-final/${shipmentId}/update-delivery-date`, {
      delivery_date: date
    }, {
      preserveScroll: true,
    });
  };

  const handleFinalDestination = (shipmentId, destination) => {
    router.post(`/operations/transit/entrega-final/${shipmentId}/update-final-destination`, {
      final_destination: destination
    }, {
      preserveScroll: true,
    });
  };

  const handleCompleteProcess = (shipmentId) => {
    if (confirm('Tem certeza que deseja finalizar este processo de trânsito?')) {
      router.post(`/operations/transit/${shipmentId}/complete`);
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pendente', color: 'bg-slate-100 text-slate-800' },
    { value: 'delivered', label: 'Entregue', color: 'bg-blue-100 text-blue-800' },
    { value: 'confirmed', label: 'Confirmada', color: 'bg-emerald-100 text-emerald-800' },
  ];

  return (
    <DashboardLayout>
      <Head title="Trânsito - Entrega Final" />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Fase 7: Entrega Final</h1>
            <p className="mt-1 text-sm text-slate-600">
              Confirmar entrega e finalizar processo de trânsito
            </p>
          </div>
          <div className="px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm font-semibold text-purple-900">🔄 Processo de Trânsito</p>
          </div>
        </div>

        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-emerald-900 mb-1">Checklist de Finalização</h3>
              <ul className="text-sm text-emerald-800 space-y-1">
                <li>✓ Confirmar chegada no destino final</li>
                <li>✓ Registrar data de entrega</li>
                <li>✓ Obter confirmação do destinatário</li>
                <li>✓ Finalizar processo de trânsito</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {shipments && shipments.length > 0 ? (
            shipments.map((shipment) => {
              const canComplete = shipment.tra_delivery_status === 'confirmed' &&
                                 shipment.tra_delivery_date &&
                                 shipment.tra_final_destination;

              return (
                <div key={shipment.id} className="p-6 bg-white border rounded-xl border-slate-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{shipment.reference_number}</h3>
                      <p className="text-sm text-slate-600">Cliente: {shipment.client?.name}</p>
                      <p className="text-xs text-slate-500">
                        Jornada: {shipment.origin_port} → Moçambique → {shipment.destination_port}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusOptions.find(s => s.value === shipment.tra_delivery_status)?.color || 'bg-slate-100 text-slate-800'}`}>
                      {statusOptions.find(s => s.value === shipment.tra_delivery_status)?.label || 'Pendente'}
                    </div>
                  </div>

                  <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm font-medium text-slate-700 mb-3">Status da Entrega:</p>
                    <div className="flex gap-2">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleStatusChange(shipment.id, option.value)}
                          disabled={shipment.tra_delivery_status === option.value}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${shipment.tra_delivery_status === option.value ? option.color + ' ring-2 ring-offset-2 ring-purple-500' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <MapPin className="inline w-4 h-4 mr-1" />
                        Destino Final Confirmado *
                      </label>
                      <input
                        type="text"
                        defaultValue={shipment.tra_final_destination || shipment.destination_port || ''}
                        onBlur={(e) => {
                          if (e.target.value && e.target.value !== shipment.tra_final_destination) {
                            handleFinalDestination(shipment.id, e.target.value);
                          }
                        }}
                        placeholder="Ex: Lusaka, Zâmbia - Endereço completo"
                        className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Calendar className="inline w-4 h-4 mr-1" />
                        Data de Entrega *
                      </label>
                      <input
                        type="date"
                        defaultValue={shipment.tra_delivery_date || ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            handleDeliveryDate(shipment.id, e.target.value);
                          }
                        }}
                        className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>
                  </div>

                  {canComplete && (
                    <div className="mb-4 p-4 bg-emerald-50 border-2 border-emerald-300 rounded-lg">
                      <div className="flex items-center gap-3">
                        <PartyPopper className="w-8 h-8 text-emerald-600" />
                        <div>
                          <p className="text-sm font-bold text-emerald-900">
                            Processo Pronto para Finalização!
                          </p>
                          <p className="text-xs text-emerald-700">
                            Todos os requisitos foram cumpridos. Clique em "Finalizar Processo" abaixo.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="text-xs text-slate-500">
                      {canComplete ? (
                        <span className="text-emerald-600 font-semibold">✓ Pronto para finalizar</span>
                      ) : (
                        <span>Complete todos os campos e confirme a entrega</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleCompleteProcess(shipment.id)}
                      disabled={!canComplete}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-purple-600 rounded-lg hover:from-emerald-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Finalizar Processo
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center bg-white border rounded-xl border-slate-200">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhum processo nesta fase</h3>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
