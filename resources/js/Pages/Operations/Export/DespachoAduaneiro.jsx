import React from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { PhaseHeader, FilterBar } from '@/Components/Operations/OperationsComponents';
import { Building2, ArrowRight, FileText } from 'lucide-react';

export default function DespachoAduaneiro({ shipments, stats }) {
  const handleUpdate = (shipmentId, field, value) => {
    router.post(`/shipments/${shipmentId}/update-export-status`, {
      field: field,
      value: value
    });
  };

  return (
    <DashboardLayout>
      <Head title="Despacho Aduaneiro - Fase 4 (Exportação)" />

      <div className="p-6 space-y-6">
        <PhaseHeader
          phase={4}
          title="Despacho Aduaneiro"
          description="Submeter declaração de exportação e obter liberação alfandegária"
          stats={[
            { label: 'Total', value: stats?.total || 0 },
            { label: 'Submetidas', value: stats?.submitted || 0 },
            { label: 'Liberadas', value: stats?.cleared || 0 }
          ]}
        />

        <FilterBar onSearch={(q) => router.get('/operations/export/despacho', { search: q })} />

        <div className="space-y-4">
          {shipments?.data?.map((shipment) => (
            <CustomsCard
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

function CustomsCard({ shipment, onUpdate }) {
  const status = shipment.exp_customs_status || 'pending';
  const declarationNumber = shipment.exp_customs_declaration_number || '';

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
          <label className="block text-sm font-medium mb-2">Nº Declaração (DU-E)</label>
          <input
            type="text"
            value={declarationNumber}
            onChange={(e) => onUpdate(shipment.id, 'exp_customs_declaration_number', e.target.value)}
            placeholder="Ex: 25/123456-7"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <select
            value={status}
            onChange={(e) => onUpdate(shipment.id, 'exp_customs_status', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="pending">Pendente</option>
            <option value="submitted">Submetida</option>
            <option value="cleared">Liberada</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={() => router.post(`/shipments/${shipment.id}/advance`, { phase: 5 })}
          disabled={status !== 'cleared'}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Avançar para Transporte <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
