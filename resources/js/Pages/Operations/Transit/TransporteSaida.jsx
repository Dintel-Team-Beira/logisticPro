import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Truck, Calendar, ArrowRight, AlertCircle } from 'lucide-react';

export default function TransporteSaida({ shipments }) {
  const handleStatusChange = (shipmentId, newStatus) => {
    router.post(`/operations/transit/transporte-saida/${shipmentId}/update-status`, {
      status: newStatus
    }, {
      preserveScroll: true,
    });
  };

  const handleActualDeparture = (shipmentId, date) => {
    router.post(`/operations/transit/transporte-saida/${shipmentId}/update-actual-departure`, {
      actual_departure_date: date
    }, {
      preserveScroll: true,
    });
  };

  const handleAdvancePhase = (shipmentId) => {
    if (confirm('Tem certeza que deseja avançar para Entrega Final?')) {
      router.post(`/operations/transit/${shipmentId}/advance-phase`);
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Aguardando', color: 'bg-slate-100 text-slate-800' },
    { value: 'in_transit', label: 'Em Trânsito', color: 'bg-blue-100 text-blue-800' },
    { value: 'delivered', label: 'Entregue', color: 'bg-emerald-100 text-emerald-800' },
  ];

  return (
    <DashboardLayout>
      <Head title="Trânsito - Transporte de Saída" />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Fase 6: Transporte de Saída</h1>
            <p className="mt-1 text-sm text-slate-600">
              Acompanhar transporte da carga até o destino final
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
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Checklist do Transporte</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Carregar carga no veículo de transporte</li>
                <li>✓ Registrar data real de partida</li>
                <li>✓ Acompanhar rota e posição da carga</li>
                <li>✓ Confirmar entrega no destino intermediário/final</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {shipments && shipments.length > 0 ? (
            shipments.map((shipment) => {
              const canAdvance = shipment.tra_outbound_transport_status === 'delivered' &&
                                shipment.tra_actual_departure_date;

              return (
                <div key={shipment.id} className="p-6 bg-white border rounded-xl border-slate-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{shipment.reference_number}</h3>
                      <p className="text-sm text-slate-600">Cliente: {shipment.client?.name}</p>
                      <p className="text-xs text-slate-500">
                        Rota: {shipment.origin_port} → {shipment.destination_port}
                      </p>
                      {shipment.tra_departure_date && (
                        <p className="text-xs text-blue-600 font-medium mt-1">
                          Partida Prevista: {new Date(shipment.tra_departure_date).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusOptions.find(s => s.value === shipment.tra_outbound_transport_status)?.color || 'bg-slate-100 text-slate-800'}`}>
                      {statusOptions.find(s => s.value === shipment.tra_outbound_transport_status)?.label || 'Aguardando'}
                    </div>
                  </div>

                  <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm font-medium text-slate-700 mb-3">Status do Transporte:</p>
                    <div className="flex gap-2">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleStatusChange(shipment.id, option.value)}
                          disabled={shipment.tra_outbound_transport_status === option.value}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${shipment.tra_outbound_transport_status === option.value ? option.color + ' ring-2 ring-offset-2 ring-purple-500' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      Data Real de Partida *
                    </label>
                    <input
                      type="date"
                      defaultValue={shipment.tra_actual_departure_date || ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          handleActualDeparture(shipment.id, e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  {shipment.tra_outbound_transport_status === 'in_transit' && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        🚛 Carga em trânsito para {shipment.destination_port}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="text-xs text-slate-500">
                      {canAdvance ? (
                        <span className="text-emerald-600 font-semibold">✓ Pronto para avançar</span>
                      ) : (
                        <span>Confirme a entrega e registre a data real</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAdvancePhase(shipment.id)}
                      disabled={!canAdvance}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Avançar para Entrega Final
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center bg-white border rounded-xl border-slate-200">
              <Truck className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhum processo nesta fase</h3>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
