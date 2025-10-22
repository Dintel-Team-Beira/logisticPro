import React from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
  PhaseHeader,
  FilterBar
} from '@/Components/Operations/OperationsComponents';
import {
  Ship, CheckCircle2, Clock, ArrowRight, DollarSign
} from 'lucide-react';

export default function Booking({ shipments, stats }) {
  const handleUpdateStatus = (shipmentId, status) => {
    router.post(`/shipments/${shipmentId}/update-export-status`, {
      field: 'exp_booking_status',
      value: status
    });
  };

  const handleAdvancePhase = (shipmentId) => {
    if (confirm('Deseja avançar para Inspeção e Certificação?')) {
      router.post(`/shipments/${shipmentId}/advance`, { phase: 3 });
    }
  };

  return (
    <DashboardLayout>
      <Head title="Booking - Fase 2 (Exportação)" />

      <div className="p-6 space-y-6">
        <PhaseHeader
          phase={2}
          title="Booking"
          description="Reservar espaço no navio com a shipping line"
          stats={[
            { label: 'Total Processos', value: stats?.total || 0 },
            { label: 'Booking Solicitado', value: stats?.requested || 0 },
            { label: 'Confirmado', value: stats?.confirmed || 0 },
            { label: 'Pronto p/ Avançar', value: stats?.ready || 0 }
          ]}
        />

        <FilterBar onSearch={(q) => router.get('/operations/export/booking', { search: q })} />

        <div className="space-y-4">
          {shipments?.data?.map((shipment) => (
            <BookingCard
              key={shipment.id}
              shipment={shipment}
              onUpdateStatus={handleUpdateStatus}
              onAdvance={handleAdvancePhase}
            />
          ))}
        </div>

        {(!shipments?.data || shipments.data.length === 0) && (
          <div className="flex flex-col items-center justify-center p-12 bg-white border rounded-xl">
            <Ship className="w-16 h-16 mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold">Nenhum processo nesta fase</h3>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function BookingCard({ shipment, onUpdateStatus, onAdvance }) {
  const status = shipment.exp_booking_status || 'pending';
  const progress = shipment.real_progress || 0;

  return (
    <div className="p-6 bg-white border rounded-xl border-slate-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{shipment.reference_number}</h3>
          <p className="text-sm text-slate-600">Cliente: {shipment.client?.name}</p>
          <p className="text-xs text-slate-500">
            Linha: {shipment.shipping_line?.name} | Container: {shipment.container_type}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{progress}%</div>
        </div>
      </div>

      {/* Status Steps */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <StatusButton
          label="Solicitar"
          active={status === 'requested'}
          completed={['requested', 'confirmed', 'paid'].includes(status)}
          onClick={() => onUpdateStatus(shipment.id, 'requested')}
        />
        <StatusButton
          label="Confirmado"
          active={status === 'confirmed'}
          completed={['confirmed', 'paid'].includes(status)}
          onClick={() => onUpdateStatus(shipment.id, 'confirmed')}
        />
        <StatusButton
          label="Pago"
          active={status === 'paid'}
          completed={status === 'paid'}
          onClick={() => onUpdateStatus(shipment.id, 'paid')}
        />
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={() => onAdvance(shipment.id)}
          disabled={status !== 'paid'}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Avançar para Inspeção
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function StatusButton({ label, active, completed, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        p-3 rounded-lg text-sm font-medium transition-colors
        ${completed ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-500' : ''}
        ${active && !completed ? 'bg-blue-50 text-blue-700 border-2 border-blue-500' : ''}
        ${!active && !completed ? 'bg-slate-50 text-slate-600 border border-slate-200' : ''}
      `}
    >
      {completed && <CheckCircle2 className="w-4 h-4 inline mr-1" />}
      {label}
    </button>
  );
}
