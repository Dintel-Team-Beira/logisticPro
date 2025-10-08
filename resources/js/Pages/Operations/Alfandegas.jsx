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
// FASE 3: ALFÂNDEGAS
// ========================================
export function Alfandegas({ shipments, stats }) {
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [showAuthorizationModal, setShowAuthorizationModal] = useState(false);

  const handleSubmitToCustoms = (shipmentId) => {
    setSelectedShipment(shipments.data.find(s => s.id === shipmentId));
    setShowSubmitModal(true);
  };

  const handleRegisterTax = (shipmentId) => {
    setSelectedShipment(shipments.data.find(s => s.id === shipmentId));
    setShowTaxModal(true);
  };

  const handleGetAuthorization = (shipmentId) => {
    setSelectedShipment(shipments.data.find(s => s.id === shipmentId));
    setShowAuthorizationModal(true);
  };

  return (
    <DashboardLayout>
      <Head title="Alfândegas - Fase 3" />

      <div className="p-6 space-y-6">
        <PhaseHeader
          phase={3}
          title="Alfândegas"
          description="Submissão de documentos, pagamento de taxas e autorização de saída"
          stats={[
            { label: 'Total Processos', value: stats.total || 0 },
            { label: 'Documentos Submetidos', value: stats.submitted || 0 },
            { label: 'Aguardando Taxação', value: stats.awaiting_tax || 0 },
            { label: 'Autorizado', value: stats.authorized || 0 }
          ]}
        />

        <FilterBar onSearch={(q) => console.log('Buscar:', q)} />

        {/* Alert Box */}
        <div className="flex items-center gap-3 p-4 border border-yellow-200 rounded-lg bg-yellow-50">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-900">
              Atenção: Prazos Alfandegários
            </p>
            <p className="text-sm text-yellow-700">
              {stats.overdue || 0} processos com prazos vencendo em breve
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {shipments.data.map((shipment) => (
            <AlfandegasCard
              key={shipment.id}
              shipment={shipment}
              onSubmit={handleSubmitToCustoms}
              onRegisterTax={handleRegisterTax}
              onGetAuthorization={handleGetAuthorization}
            />
          ))}
        </div>

        {showSubmitModal && (
          <SubmitToCustomsModal
            shipment={selectedShipment}
            onClose={() => setShowSubmitModal(false)}
          />
        )}

        {showTaxModal && (
          <TaxPaymentModal
            shipment={selectedShipment}
            onClose={() => setShowTaxModal(false)}
          />
        )}

        {showAuthorizationModal && (
          <AuthorizationModal
            shipment={selectedShipment}
            onClose={() => setShowAuthorizationModal(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

// Card das Alfândegas
function AlfandegasCard({ shipment, onSubmit, onRegisterTax, onGetAuthorization }) {
  const [showDocs, setShowDocs] = useState(false);

  const isSubmitted = shipment.customs_status === 'submitted';
  const hasTaxNotice = shipment.documents.some(d => d.type === 'aviso');
  const isPaid = shipment.customs_payment_status === 'paid';
  const isAuthorized = shipment.customs_status === 'authorized';

  return (
    <div className="overflow-hidden bg-white border rounded-xl border-slate-200">
      <div className="p-4 border-b bg-slate-50 border-slate-200">
        <h3 className="font-bold text-slate-900">{shipment.reference_number}</h3>
        <p className="text-sm text-slate-600">BL: {shipment.bl_number}</p>
      </div>

      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <StepItem
            icon={Send}
            label="Docs Submetidos"
            completed={isSubmitted}
          />
          <StepItem
            icon={FileText}
            label="Aviso de Taxação"
            completed={hasTaxNotice}
          />
          <StepItem
            icon={DollarSign}
            label="Taxas Pagas"
            completed={isPaid}
          />
          <StepItem
            icon={CheckCircle2}
            label="Autorização de Saída"
            completed={isAuthorized}
          />
        </div>

        {shipment.customs_deadline && (
          <div className={`flex items-center gap-2 p-3 rounded-lg border ${
            new Date(shipment.customs_deadline) < new Date()
              ? 'border-red-200 bg-red-50'
              : 'border-blue-200 bg-blue-50'
          }`}>
            <AlertTriangle className={`w-4 h-4 ${
              new Date(shipment.customs_deadline) < new Date()
                ? 'text-red-600'
                : 'text-blue-600'
            }`} />
            <div>
              <p className="text-xs font-medium text-slate-700">
                Prazo Alfândega
              </p>
              <p className="text-sm font-bold text-slate-900">
                {shipment.customs_deadline}
              </p>
            </div>
          </div>
        )}

        <div className="pt-3 space-y-2 border-t border-slate-200">
          <button
            onClick={() => onSubmit(shipment.id)}
            disabled={isSubmitted}
            className={`w-full px-4 py-2 text-sm font-medium rounded-lg ${
              isSubmitted
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Send className="inline w-4 h-4 mr-2" />
            Submeter Documentos
          </button>

          <button
            onClick={() => onRegisterTax(shipment.id)}
            disabled={!hasTaxNotice || isPaid}
            className={`w-full px-4 py-2 text-sm font-medium rounded-lg ${
              !hasTaxNotice || isPaid
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            <DollarSign className="inline w-4 h-4 mr-2" />
            Pagar Taxas
          </button>

          <button
            onClick={() => onGetAuthorization(shipment.id)}
            disabled={!isPaid || isAuthorized}
            className={`w-full px-4 py-2 text-sm font-medium rounded-lg ${
              !isPaid || isAuthorized
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            <CheckCircle2 className="inline w-4 h-4 mr-2" />
            Obter Autorização
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

// ========================================
// COMPONENTES AUXILIARES
// ========================================

function StepItem({ icon: Icon, label, completed }) {
  return (
    <div className={`flex items-center gap-3 p-2 rounded-lg ${
      completed ? 'bg-emerald-50' : 'bg-slate-50'
    }`}>
      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
        completed ? 'bg-emerald-500' : 'bg-slate-300'
      }`}>
        {completed ? (
          <CheckCircle2 className="w-5 h-5 text-white" />
        ) : (
          <Icon className="w-5 h-5 text-white" />
        )}
      </div>
      <p className={`text-sm font-medium ${
        completed ? 'text-emerald-700' : 'text-slate-600'
      }`}>
        {label}
      </p>
    </div>
  );
}

// Modals (simplificados)
function StampBLModal({ shipment, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-2xl">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Carimbar BL</h2>
        </div>
        <div className="p-6">
          <p>Registrar carimbo do BL para {shipment.reference_number}</p>
          {/* Form aqui */}
        </div>
        <div className="flex gap-3 p-6 border-t">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg">
            Cancelar
          </button>
          <button className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

function DeliveryOrderModal({ shipment, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-2xl">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Emitir Delivery Order</h2>
        </div>
        <div className="p-6">
          <p>Emitir DO para {shipment.reference_number}</p>
        </div>
        <div className="flex gap-3 p-6 border-t">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg">
            Cancelar
          </button>
          <button className="flex-1 px-4 py-2 text-white rounded-lg bg-emerald-600">
            Emitir
          </button>
        </div>
      </div>
    </div>
  );
}

function SubmitToCustomsModal({ shipment, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-2xl">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Submeter à Alfândega</h2>
        </div>
        <div className="p-6">
          <p>Submeter documentos de {shipment.reference_number}</p>
        </div>
        <div className="flex gap-3 p-6 border-t">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg">
            Cancelar
          </button>
          <button className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg">
            Submeter
          </button>
        </div>
      </div>
    </div>
  );
}

function TaxPaymentModal({ shipment, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-2xl">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Pagar Taxas Alfandegárias</h2>
        </div>
        <div className="p-6">
          <p>Registrar pagamento de taxas</p>
        </div>
        <div className="flex gap-3 p-6 border-t">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg">
            Cancelar
          </button>
          <button className="flex-1 px-4 py-2 text-white rounded-lg bg-emerald-600">
            Confirmar Pagamento
          </button>
        </div>
      </div>
    </div>
  );
}

function AuthorizationModal({ shipment, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-2xl">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Autorização de Saída</h2>
        </div>
        <div className="p-6">
          <p>Registrar autorização de saída da alfândega</p>
        </div>
        <div className="flex gap-3 p-6 border-t">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg">
            Cancelar
          </button>
          <button className="flex-1 px-4 py-2 text-white bg-purple-600 rounded-lg">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
