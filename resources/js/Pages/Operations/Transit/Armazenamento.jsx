import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Warehouse, MapPin, ArrowRight, AlertCircle } from 'lucide-react';

export default function Armazenamento({ shipments }) {
  const handleStatusChange = (shipmentId, newStatus) => {
    router.post(`/operations/transit/armazenamento/${shipmentId}/update-status`, {
      status: newStatus
    }, {
      preserveScroll: true,
    });
  };

  const handleWarehouseLocation = (shipmentId, location) => {
    router.post(`/operations/transit/armazenamento/${shipmentId}/update-location`, {
      warehouse_location: location
    }, {
      preserveScroll: true,
    });
  };

  const handleAdvancePhase = (shipmentId) => {
    if (confirm('Tem certeza que deseja avançar para Preparação de Partida?')) {
      router.post(`/operations/transit/${shipmentId}/advance-phase`);
    }
  };

  const statusOptions = [
    { value: 'stored', label: 'Armazenada', color: 'bg-blue-100 text-blue-800' },
    { value: 'ready_for_departure', label: 'Pronta para Saída', color: 'bg-emerald-100 text-emerald-800' },
  ];

  return (
    <DashboardLayout>
      <Head title="Trânsito - Armazenamento" />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Fase 4: Armazenamento</h1>
            <p className="mt-1 text-sm text-slate-600">
              Controlar armazenamento temporário da carga em trânsito
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
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Checklist do Armazenamento</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Armazenar carga em local apropriado</li>
                <li>✓ Registrar localização no armazém</li>
                <li>✓ Monitorar condições de armazenamento</li>
                <li>✓ Marcar como pronta quando preparada para saída</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {shipments && shipments.length > 0 ? (
            shipments.map((shipment) => {
              const canAdvance = shipment.tra_storage_status === 'ready_for_departure' &&
                                shipment.tra_warehouse_location;

              return (
                <div key={shipment.id} className="p-6 bg-white border rounded-xl border-slate-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{shipment.reference_number}</h3>
                      <p className="text-sm text-slate-600">Cliente: {shipment.client?.name}</p>
                      <p className="text-xs text-slate-500">
                        Container: {shipment.container_number} | {shipment.container_type}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusOptions.find(s => s.value === shipment.tra_storage_status)?.color || 'bg-slate-100 text-slate-800'}`}>
                      {statusOptions.find(s => s.value === shipment.tra_storage_status)?.label || 'Pendente'}
                    </div>
                  </div>

                  <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm font-medium text-slate-700 mb-3">Status do Armazenamento:</p>
                    <div className="flex gap-2">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleStatusChange(shipment.id, option.value)}
                          disabled={shipment.tra_storage_status === option.value}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${shipment.tra_storage_status === option.value ? option.color + ' ring-2 ring-offset-2 ring-purple-500' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <MapPin className="inline w-4 h-4 mr-1" />
                      Localização no Armazém *
                    </label>
                    <input
                      type="text"
                      defaultValue={shipment.tra_warehouse_location || ''}
                      onBlur={(e) => {
                        if (e.target.value && e.target.value !== shipment.tra_warehouse_location) {
                          handleWarehouseLocation(shipment.id, e.target.value);
                        }
                      }}
                      placeholder="Ex: Armazém A - Corredor 3 - Posição 15"
                      className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="text-xs text-slate-500">
                      {canAdvance ? (
                        <span className="text-emerald-600 font-semibold">✓ Pronto para avançar</span>
                      ) : (
                        <span>Registre a localização e marque como pronta</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAdvancePhase(shipment.id)}
                      disabled={!canAdvance}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Avançar para Preparação
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center bg-white border rounded-xl border-slate-200">
              <Warehouse className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhum processo nesta fase</h3>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
