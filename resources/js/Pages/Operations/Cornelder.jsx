import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { PhaseHeader, FilterBar } from '@/Components/Operations/OperationsComponents';
import {
  Ship, DollarSign, FileText, CheckCircle2, AlertTriangle,
  Truck, Calendar, Clock, Package
} from 'lucide-react';

// ========================================
// FASE 4: CORNELDER
// ========================================
export function Cornelder({ shipments, stats }) {
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <DashboardLayout>
      <Head title="Cornelder - Fase 4" />

      <div className="p-6 space-y-6">
        <PhaseHeader
          phase={4}
          title="Cornelder"
          description="Gestão de storage, pagamentos Cornelder e emissão de termo da linha"
          stats={[
            { label: 'Total Processos', value: stats.total || 0 },
            { label: 'Storage Crítico', value: stats.critical_storage || 0 },
            { label: 'Aguardando Pagamento', value: stats.awaiting_payment || 0 },
            { label: 'Pronto p/ Liberação', value: stats.ready || 0 }
          ]}
        />

        {/* Storage Alert Banner */}
        {stats.critical_storage > 0 && (
          <div className="flex items-center gap-3 p-4 border border-red-200 rounded-lg bg-red-50">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <p className="font-bold text-red-900">
                ⚠️ ALERTA: Storage Crítico
              </p>
              <p className="text-sm text-red-700">
                {stats.critical_storage} container(s) próximo(s) ao limite de dias FREE
              </p>
            </div>
          </div>
        )}

        <FilterBar onSearch={(q) => console.log('Buscar:', q)} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {shipments.data.map((shipment) => (
            <CornelderCard
              key={shipment.id}
              shipment={shipment}
              onGetDraft={() => {
                setSelectedShipment(shipment);
                setShowDraftModal(true);
              }}
              onPayStorage={() => {
                setSelectedShipment(shipment);
                setShowPaymentModal(true);
              }}
            />
          ))}
        </div>

        {showDraftModal && (
          <DraftModal
            shipment={selectedShipment}
            onClose={() => setShowDraftModal(false)}
          />
        )}

        {showPaymentModal && (
          <StoragePaymentModal
            shipment={selectedShipment}
            onClose={() => setShowPaymentModal(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

function CornelderCard({ shipment, onGetDraft, onPayStorage }) {
  const [showDocs, setShowDocs] = useState(false);

  const hasDraft = shipment.documents.some(d => d.type === 'draft');
  const isPaid = shipment.cornelder_payment_status === 'paid';
  const hasTermo = shipment.documents.some(d => d.type === 'termo');

  // Cálculo de dias de storage
  const storageDays = shipment.storage_days || 0;
  const freeDays = shipment.shipping_line?.free_storage_days || 7;
  const daysRemaining = freeDays - storageDays;
  const isStorageCritical = daysRemaining <= 2;

  return (
    <div className={`overflow-hidden bg-white border rounded-xl ${
      isStorageCritical ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200'
    }`}>
      <div className={`p-4 border-b ${
        isStorageCritical ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-slate-900">{shipment.reference_number}</h3>
            <p className="text-sm text-slate-600">BL: {shipment.bl_number}</p>
          </div>
          {isStorageCritical && (
            <span className="px-2 py-1 text-xs font-bold text-red-700 bg-red-200 rounded-full">
              CRÍTICO
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Storage Counter */}
        <div className={`p-4 rounded-lg border-2 ${
          isStorageCritical
            ? 'border-red-300 bg-red-50'
            : daysRemaining <= 5
            ? 'border-yellow-300 bg-yellow-50'
            : 'border-emerald-300 bg-emerald-50'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-slate-700">Storage FREE</p>
            <Clock className={`w-4 h-4 ${
              isStorageCritical ? 'text-red-600' : 'text-slate-600'
            }`} />
          </div>
          <p className={`text-2xl font-bold ${
            isStorageCritical
              ? 'text-red-700'
              : daysRemaining <= 5
              ? 'text-yellow-700'
              : 'text-emerald-700'
          }`}>
            {daysRemaining} dias
          </p>
          <p className="text-xs text-slate-600">
            {storageDays}/{freeDays} dias decorridos
          </p>
        </div>

        <div className="space-y-2">
          <StepItem icon={FileText} label="Draft Cornelder" completed={hasDraft} />
          <StepItem icon={DollarSign} label="Storage Pago" completed={isPaid} />
          <StepItem icon={CheckCircle2} label="Termo Emitido" completed={hasTermo} />
        </div>

        <div className="pt-3 space-y-2 border-t border-slate-200">
          <button
            onClick={onGetDraft}
            disabled={hasDraft}
            className={`w-full px-4 py-2 text-sm font-medium rounded-lg ${
              hasDraft
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <FileText className="inline w-4 h-4 mr-2" />
            Obter Draft
          </button>

          <button
            onClick={onPayStorage}
            disabled={!hasDraft || isPaid}
            className={`w-full px-4 py-2 text-sm font-medium rounded-lg ${
              !hasDraft || isPaid
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : isStorageCritical
                ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            <DollarSign className="inline w-4 h-4 mr-2" />
            {isStorageCritical ? 'PAGAR URGENTE!' : 'Pagar Storage'}
          </button>

          <button
            onClick={() => setShowDocs(!showDocs)}
            className="w-full px-4 py-2 text-sm font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
          >
            {showDocs ? 'Ocultar' : 'Ver'} Documentos
          </button>
        </div>
      </div>
    </div>
  );
}
