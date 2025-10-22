import React from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { PhaseHeader, FilterBar } from '@/Components/Operations/OperationsComponents';
import { Globe, CheckCircle2 } from 'lucide-react';

export default function Acompanhamento({ shipments, stats }) {
  const handleUpdate = (shipmentId, field, value) => {
    router.post(`/shipments/${shipmentId}/update-export-status`, {
      field: field,
      value: value
    });
  };

  const handleComplete = (shipmentId) => {
    if (confirm('Confirmar que o processo de exportação foi concluído?')) {
      router.post(`/shipments/${shipmentId}/complete-phase`, { phase: 7 });
    }
  };

  return (
    <DashboardLayout>
      <Head title="Acompanhamento - Fase 7 (Exportação)" />

      <div className="p-6 space-y-6">
        <PhaseHeader
          phase={7}
          title="Acompanhamento"
          description="Tracking da carga até chegada e entrega no destino"
          stats={[
            { label: 'Total', value: stats?.total || 0 },
            { label: 'Em Trânsito', value: stats?.in_transit || 0 },
            { label: 'Entregue', value: stats?.delivered || 0 }
          ]}
        />

        <FilterBar onSearch={(q) => router.get('/operations/export/acompanhamento', { search: q })} />

        <div className="space-y-4">
          {shipments?.data?.map((shipment) => (
            <TrackingCard
              key={shipment.id}
              shipment={shipment}
              onUpdate={handleUpdate}
              onComplete={handleComplete}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

function TrackingCard({ shipment, onUpdate, onComplete }) {
  const status = shipment.exp_tracking_status || 'pending';
  const etaDestination = shipment.exp_eta_destination || '';
  const actualArrival = shipment.exp_actual_arrival_date || '';

  return (
    <div className="p-6 bg-white border rounded-xl">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{shipment.reference_number}</h3>
          <p className="text-sm text-slate-600">Cliente: {shipment.client?.name}</p>
          <p className="text-xs text-slate-500">
            Destino: {shipment.destination_port} | Navio: {shipment.vessel_name}
          </p>
        </div>
        {status === 'delivered' && (
          <span className="px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full">
            ✓ Entregue
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">ETA Destino</label>
          <input
            type="date"
            value={etaDestination}
            onChange={(e) => onUpdate(shipment.id, 'exp_eta_destination', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Data Real de Chegada</label>
          <input
            type="date"
            value={actualArrival}
            onChange={(e) => onUpdate(shipment.id, 'exp_actual_arrival_date', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <select
            value={status}
            onChange={(e) => onUpdate(shipment.id, 'exp_tracking_status', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="pending">Pendente</option>
            <option value="in_transit">Em Trânsito</option>
            <option value="arrived">Chegou ao Porto</option>
            <option value="delivered">Entregue ao Cliente</option>
          </select>
        </div>
      </div>

      {status === 'delivered' && (
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={() => onComplete(shipment.id)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
          >
            <CheckCircle2 className="w-4 h-4" />
            Concluir Processo
          </button>
        </div>
      )}
    </div>
  );
}
