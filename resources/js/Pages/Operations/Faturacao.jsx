import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
  PhaseTimeline,
  DocumentChecklist,
  ShipmentCard,
  PhaseHeader,
  FilterBar
} from '@/Components/Operations/OperationsComponents';
import {
  Ship, Send, DollarSign, CheckCircle2,
  AlertTriangle, Clock, ArrowRight
} from 'lucide-react';

// ========================================
// FASE 6: FATURAÇÃO
// ========================================
export function Faturacao({ shipments, stats }) {
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  return (
    <DashboardLayout>
      <Head title="Faturação - Fase 6" />

      <div className="p-6 space-y-6">
        <PhaseHeader
          phase={6}
          title="Faturação ao Cliente"
          description="Cálculo de custos, geração e envio de fatura ao cliente"
          stats={[
            { label: 'Total Processos', value: stats.total || 0 },
            { label: 'Aguardando Cálculo', value: stats.awaiting_calc || 0 },
            { label: 'Fatura Gerada', value: stats.invoice_generated || 0 },
            { label: 'Pago', value: stats.paid || 0 }
          ]}
        />

        <FilterBar onSearch={(q) => console.log('Buscar:', q)} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {shipments.data.map((shipment) => (
            <FaturacaoCard
              key={shipment.id}
              shipment={shipment}
              onGenerateInvoice={() => {
                setSelectedShipment(shipment);
                setShowInvoiceModal(true);
              }}
            />
          ))}
        </div>

        {showInvoiceModal && (
          <InvoiceGenerationModal
            shipment={selectedShipment}
            onClose={() => setShowInvoiceModal(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

function FaturacaoCard({ shipment, onGenerateInvoice }) {
  const hasInvoice = shipment.client_invoice_id;
  const isPaid = shipment.client_payment_status === 'paid';

  // Cálculo de custos (exemplo)
  const costs = {
    frete: shipment.freight_cost || 0,
    alfandega: shipment.customs_cost || 0,
    cornelder: shipment.cornelder_cost || 0,
    outros: shipment.other_costs || 0
  };

  const totalCost = Object.values(costs).reduce((a, b) => a + b, 0);
  const profitMargin = shipment.profit_margin || 15;
  const totalInvoice = totalCost * (1 + profitMargin / 100);

  return (
    <div className="overflow-hidden bg-white border rounded-xl border-slate-200">
      <div className="p-4 border-b bg-slate-50 border-slate-200">
        <h3 className="font-bold text-slate-900">{shipment.reference_number}</h3>
        <p className="text-sm text-slate-600">Cliente: {shipment.client?.name}</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Cost Breakdown */}
        <div className="p-4 rounded-lg bg-slate-50">
          <h4 className="mb-3 text-sm font-semibold text-slate-900">
            💰 Breakdown de Custos
          </h4>
          <div className="space-y-2 text-sm">
            <CostLine label="Frete" value={costs.frete} />
            <CostLine label="Alfândega" value={costs.alfandega} />
            <CostLine label="Cornelder" value={costs.cornelder} />
            <CostLine label="Outros" value={costs.outros} />
            <div className="pt-2 border-t border-slate-300">
              <CostLine label="Subtotal" value={totalCost} bold />
            </div>
            <CostLine
              label={`Margem (${profitMargin}%)`}
              value={totalInvoice - totalCost}
              color="text-emerald-600"
            />
            <div className="pt-2 border-t-2 border-slate-400">
              <CostLine
                label="Total a Faturar"
                value={totalInvoice}
                bold
                large
                color="text-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <StepItem
            icon={DollarSign}
            label="Custos Calculados"
            completed={totalCost > 0}
          />
          <StepItem
            icon={FileText}
            label="Fatura Gerada"
            completed={hasInvoice}
          />
          <StepItem
            icon={CheckCircle2}
            label="Pagamento Recebido"
            completed={isPaid}
          />
        </div>

        {/* Actions */}
        <div className="pt-3 space-y-2 border-t border-slate-200">
          <button
            onClick={onGenerateInvoice}
            disabled={hasInvoice}
            className={`w-full px-4 py-2 text-sm font-medium rounded-lg ${
              hasInvoice
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <FileText className="inline w-4 h-4 mr-2" />
            Gerar Fatura
          </button>

          {hasInvoice && (
            <>
              <button className="w-full px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-700">
                📧 Enviar ao Cliente
              </button>
              <button className="w-full px-4 py-2 text-sm font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50">
                👁️ Ver Fatura
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
