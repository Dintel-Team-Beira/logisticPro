import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
  PhaseTimeline,
  DocumentChecklist,
  PhaseHeader,
  FilterBar
} from '@/Components/Operations/OperationsComponents';
import {
  FileText, Stamp, Building2, DollarSign, CheckCircle2,
  AlertTriangle, Upload, Download, Send
} from 'lucide-react';

// ========================================
// FASE 2: LEGALIZAÇÃO
// ========================================
export function Legalizacao({ shipments, stats }) {
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showStampModal, setShowStampModal] = useState(false);
  const [showDOModal, setShowDOModal] = useState(false);

  const handleStampBL = (shipmentId) => {
    setSelectedShipment(shipments.data.find(s => s.id === shipmentId));
    setShowStampModal(true);
  };

  const handleIssueDO = (shipmentId) => {
    setSelectedShipment(shipments.data.find(s => s.id === shipmentId));
    setShowDOModal(true);
  };

  const handleDocumentUpload = (shipmentId, docType, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', docType);
    formData.append('stage', 'legalizacao');

    router.post(`/shipments/${shipmentId}/documents`, formData, {
      preserveState: true,
      onSuccess: () => alert('Documento enviado com sucesso!')
    });
  };

  return (
    <DashboardLayout>
      <Head title="Legalização - Fase 2" />

      <div className="p-6 space-y-6">
        <PhaseHeader
          phase={2}
          title="Legalização"
          description="Carimbar BL na linha de navegação e emitir Delivery Order"
          stats={[
            { label: 'Total Processos', value: stats.total || 0 },
            { label: 'Aguardando Carimbo', value: stats.awaiting_stamp || 0 },
            { label: 'BL Carimbado', value: stats.bl_stamped || 0 },
            { label: 'DO Emitido', value: stats.do_issued || 0 }
          ]}
        />

        <FilterBar onSearch={(q) => console.log('Buscar:', q)} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {shipments.data.map((shipment) => (
            <LegalizacaoCard
              key={shipment.id}
              shipment={shipment}
              onStampBL={handleStampBL}
              onIssueDO={handleIssueDO}
              onUploadDocument={handleDocumentUpload}
            />
          ))}
        </div>

        {showStampModal && (
          <StampBLModal
            shipment={selectedShipment}
            onClose={() => setShowStampModal(false)}
          />
        )}

        {showDOModal && (
          <DeliveryOrderModal
            shipment={selectedShipment}
            onClose={() => setShowDOModal(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

// Card da Legalização
function LegalizacaoCard({ shipment, onStampBL, onIssueDO, onUploadDocument }) {
  const [showDocs, setShowDocs] = useState(false);

  const hasBLStamped = shipment.documents.some(d => d.type === 'bl' && d.metadata?.stamped);
  const hasDO = shipment.documents.some(d => d.type === 'delivery_order');

  return (
    <div className="overflow-hidden bg-white border rounded-xl border-slate-200">
      <div className="p-4 border-b bg-slate-50 border-slate-200">
        <h3 className="font-bold text-slate-900">{shipment.reference_number}</h3>
        <p className="text-sm text-slate-600">BL: {shipment.bl_number}</p>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-500">Cliente</p>
            <p className="font-medium text-slate-900">{shipment.client?.name}</p>
          </div>
          <div>
            <p className="text-slate-500">Linha</p>
            <p className="font-medium text-slate-900">{shipment.shipping_line?.name}</p>
          </div>
        </div>

        <div className="space-y-2">
          <StepItem
            icon={Stamp}
            label="BL Carimbado"
            completed={hasBLStamped}
          />
          <StepItem
            icon={FileText}
            label="Delivery Order Emitido"
            completed={hasDO}
          />
        </div>

        <div className="pt-3 space-y-2 border-t border-slate-200">
          <button
            onClick={() => onStampBL(shipment.id)}
            disabled={hasBLStamped}
            className={`w-full px-4 py-2 text-sm font-medium rounded-lg ${
              hasBLStamped
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Stamp className="inline w-4 h-4 mr-2" />
            Carimbar BL
          </button>

          <button
            onClick={() => onIssueDO(shipment.id)}
            disabled={!hasBLStamped || hasDO}
            className={`w-full px-4 py-2 text-sm font-medium rounded-lg ${
              !hasBLStamped || hasDO
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            <FileText className="inline w-4 h-4 mr-2" />
            Emitir Delivery Order
          </button>

          <button
            onClick={() => setShowDocs(!showDocs)}
            className="w-full px-4 py-2 text-sm font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
          >
            {showDocs ? 'Ocultar' : 'Ver'} Documentos
          </button>
        </div>

        {showDocs && (
          <DocumentChecklist
            phase={2}
            documents={shipment.documents}
            onUpload={(type, file) => onUploadDocument(shipment.id, type, file)}
            onDelete={(id) => console.log('Delete', id)}
            onView={(doc) => console.log('View', doc)}
          />
        )}
      </div>
    </div>
  );
}
