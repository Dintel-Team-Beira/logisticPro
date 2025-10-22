import React from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { PhaseHeader, FilterBar } from '@/Components/Operations/OperationsComponents';
import { Truck, ArrowRight } from 'lucide-react';

export default function TransportePorto({ shipments, stats }) {
  const handleUpdate = (shipmentId, field, value) => {
    router.post(`/shipments/${shipmentId}/update-export-status`, {
      field: field,
      value: value
    });
  };

  return (
    <DashboardLayout>
      <Head title="Transporte ao Porto - Fase 5 (Exportação)" />

      <div className="p-6 space-y-6">
        <PhaseHeader
          phase={5}
          title="Transporte ao Porto"
          description="Arranjar transporte e movimentar carga ao terminal portuário"
          stats={[
            { label: 'Total', value: stats?.total || 0 },
            { label: 'Em Trânsito', value: stats?.in_transit || 0 },
            { label: 'Entregue', value: stats?.delivered || 0 }
          ]}
        />

        <FilterBar onSearch={(q) => router.get('/operations/export/transporte', { search: q })} />

        <div className="space-y-4">
          {shipments?.data?.map((shipment) => (
            <TransportCard
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

function TransportCard({ shipment, onUpdate }) {
  const status = shipment.exp_transport_status || 'pending';
  const deliveryDate = shipment.exp_delivery_to_port_date || '';

  return (
    <div className="p-6 bg-white border rounded-xl">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{shipment.reference_number}</h3>
          <p className="text-sm text-slate-600">Cliente: {shipment.client?.name}</p>
          <p className="text-xs text-slate-500">Porto Destino: {shipment.origin_port}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Data de Entrega no Porto</label>
          <input
            type="date"
            value={deliveryDate}
            onChange={(e) => onUpdate(shipment.id, 'exp_delivery_to_port_date', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <select
            value={status}
            onChange={(e) => onUpdate(shipment.id, 'exp_transport_status', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="pending">Pendente</option>
            <option value="scheduled">Agendado</option>
            <option value="in_transit">Em Trânsito</option>
            <option value="delivered">Entregue no Porto</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={() => router.post(`/shipments/${shipment.id}/advance`, { phase: 6 })}
          disabled={status !== 'delivered'}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Avançar para Embarque <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
