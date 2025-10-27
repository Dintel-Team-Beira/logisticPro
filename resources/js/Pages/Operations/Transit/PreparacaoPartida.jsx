import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ClipboardCheck, Calendar, ArrowRight, AlertCircle } from 'lucide-react';

export default function PreparacaoPartida({ shipments }) {
  const handleStatusChange = (shipmentId, newStatus) => {
    router.post(`/operations/transit/preparacao-partida/${shipmentId}/update-status`, {
      status: newStatus
    }, {
      preserveScroll: true,
    });
  };

  const handleDepartureDate = (shipmentId, date) => {
    router.post(`/operations/transit/preparacao-partida/${shipmentId}/update-date`, {
      departure_date: date
    }, {
      preserveScroll: true,
    });
  };

  const handleAdvancePhase = (shipmentId) => {
    if (confirm('Tem certeza que deseja avançar para Transporte de Saída?')) {
      router.post(`/operations/transit/${shipmentId}/advance-phase`);
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pendente', color: 'bg-slate-100 text-slate-800' },
    { value: 'in_progress', label: 'Em Preparação', color: 'bg-blue-100 text-blue-800' },
    { value: 'ready', label: 'Pronta', color: 'bg-emerald-100 text-emerald-800' },
  ];

  return (
    <DashboardLayout>
      <Head title="Trânsito - Preparação de Partida" />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Fase 5: Preparação de Partida</h1>
            <p className="mt-1 text-sm text-slate-600">
              Preparar carga e documentação para transporte de saída
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
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Checklist da Preparação</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Verificar integridade da carga</li>
                <li>✓ Preparar documentos de saída</li>
                <li>✓ Agendar transporte</li>
                <li>✓ Definir data de partida</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {shipments && shipments.length > 0 ? (
            shipments.map((shipment) => {
              const canAdvance = shipment.tra_departure_prep_status === 'ready' &&
                                shipment.tra_departure_date;

              return (
                <div key={shipment.id} className="p-6 bg-white border rounded-xl border-slate-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{shipment.reference_number}</h3>
                      <p className="text-sm text-slate-600">Cliente: {shipment.client?.name}</p>
                      <p className="text-xs text-slate-500">
                        Destino Final: {shipment.destination_port}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusOptions.find(s => s.value === shipment.tra_departure_prep_status)?.color || 'bg-slate-100 text-slate-800'}`}>
                      {statusOptions.find(s => s.value === shipment.tra_departure_prep_status)?.label || 'Pendente'}
                    </div>
                  </div>

                  <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm font-medium text-slate-700 mb-3">Status da Preparação:</p>
                    <div className="flex gap-2">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleStatusChange(shipment.id, option.value)}
                          disabled={shipment.tra_departure_prep_status === option.value}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${shipment.tra_departure_prep_status === option.value ? option.color + ' ring-2 ring-offset-2 ring-purple-500' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      Data Prevista de Partida *
                    </label>
                    <input
                      type="date"
                      defaultValue={shipment.tra_departure_date || ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          handleDepartureDate(shipment.id, e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="text-xs text-slate-500">
                      {canAdvance ? (
                        <span className="text-emerald-600 font-semibold">✓ Pronto para avançar</span>
                      ) : (
                        <span>Complete a preparação e defina a data</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAdvancePhase(shipment.id)}
                      disabled={!canAdvance}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Avançar para Transporte
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center bg-white border rounded-xl border-slate-200">
              <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhum processo nesta fase</h3>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
