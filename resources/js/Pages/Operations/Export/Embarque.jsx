import React from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { PhaseHeader, FilterBar } from '@/Components/Operations/OperationsComponents';
import { Anchor, ArrowRight } from 'lucide-react';

export default function Embarque({ shipments, stats }) {
  const handleUpdate = (shipmentId, field, value) => {
    router.post(`/shipments/${shipmentId}/update-export-status`, {
      field: field,
      value: value
    });
  };

  return (
    <DashboardLayout>
      <Head title="Embarque - Fase 6 (Exportação)" />

      <div className="p-6 space-y-6">
        <PhaseHeader
          phase={6}
          title="Embarque"
          description="Carregar container no navio e emitir BL"
          stats={[
            { label: 'Total', value: stats?.total || 0 },
            { label: 'Carregando', value: stats?.loading || 0 },
            { label: 'Embarcado', value: stats?.loaded || 0 }
          ]}
        />

        <FilterBar onSearch={(q) => router.get('/operations/export/embarque', { search: q })} />

        <div className="space-y-4">
          {shipments?.data?.map((shipment) => (
            <LoadingCard
              key={shipment.id}
              shipment={shipment}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

function LoadingCard({ shipment, onUpdate }) {
  const status = shipment.exp_loading_status || 'pending';
  const loadingDate = shipment.exp_actual_loading_date || '';
  const etd = shipment.exp_etd || '';

  return (
    <div className="p-6 bg-white border rounded-xl">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{shipment.reference_number}</h3>
          <p className="text-sm text-slate-600">Cliente: {shipment.client?.name}</p>
          <p className="text-xs text-slate-500">Navio: {shipment.vessel_name}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Data de Embarque</label>
          <input
            type="date"
            value={loadingDate}
            onChange={(e) => onUpdate(shipment.id, 'exp_actual_loading_date', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">ETD (Partida)</label>
          <input
            type="date"
            value={etd}
            onChange={(e) => onUpdate(shipment.id, 'exp_etd', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <select
            value={status}
            onChange={(e) => onUpdate(shipment.id, 'exp_loading_status', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="pending">Pendente</option>
            <option value="loading">Carregando</option>
            <option value="loaded">Embarcado</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={() => router.post(`/shipments/${shipment.id}/advance`, { phase: 7 })}
          disabled={status !== 'loaded'}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Avançar para Acompanhamento <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
