import React from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { PhaseHeader, FilterBar } from '@/Components/Operations/OperationsComponents';
import { ClipboardCheck, ArrowRight, Calendar } from 'lucide-react';

export default function InspecaoCertificacao({ shipments, stats }) {
  const handleUpdateStatus = (shipmentId, status) => {
    router.post(`/shipments/${shipmentId}/update-export-status`, {
      field: 'exp_inspection_status',
      value: status
    });
  };

  const handleSetDate = (shipmentId, date) => {
    router.post(`/shipments/${shipmentId}/update-export-status`, {
      field: 'exp_inspection_date',
      value: date
    });
  };

  return (
    <DashboardLayout>
      <Head title="Inspeção e Certificação - Fase 3 (Exportação)" />

      <div className="p-6 space-y-6">
        <PhaseHeader
          phase={3}
          title="Inspeção e Certificação"
          description="Agendar e realizar inspeções, obter certificados necessários"
          stats={[
            { label: 'Total', value: stats?.total || 0 },
            { label: 'Agendadas', value: stats?.scheduled || 0 },
            { label: 'Concluídas', value: stats?.completed || 0 }
          ]}
        />

        <FilterBar onSearch={(q) => router.get('/operations/export/inspecao', { search: q })} />

        <div className="space-y-4">
          {shipments?.data?.map((shipment) => (
            <InspectionCard
              key={shipment.id}
              shipment={shipment}
              onUpdateStatus={handleUpdateStatus}
              onSetDate={handleSetDate}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

function InspectionCard({ shipment, onUpdateStatus, onSetDate }) {
  const status = shipment.exp_inspection_status || 'pending';
  const date = shipment.exp_inspection_date;

  return (
    <div className="p-6 bg-white border rounded-xl">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{shipment.reference_number}</h3>
          <p className="text-sm text-slate-600">Cliente: {shipment.client?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Data da Inspeção</label>
          <input
            type="date"
            value={date || ''}
            onChange={(e) => onSetDate(shipment.id, e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <select
            value={status}
            onChange={(e) => onUpdateStatus(shipment.id, e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="pending">Pendente</option>
            <option value="scheduled">Agendada</option>
            <option value="completed">Concluída</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={() => router.post(`/shipments/${shipment.id}/advance`, { phase: 4 })}
          disabled={status !== 'completed'}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Avançar para Despacho <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
