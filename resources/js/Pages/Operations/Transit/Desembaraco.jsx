import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Shield, Check, ArrowRight, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function Desembaraco({ shipments }) {
  const handleStatusChange = (shipmentId, newStatus) => {
    router.post(`/operations/transit/desembaraco/${shipmentId}/update-status`, {
      status: newStatus
    }, {
      preserveScroll: true,
    });
  };

  const handleDeclarationNumber = (shipmentId, declarationNumber) => {
    router.post(`/operations/transit/desembaraco/${shipmentId}/update-declaration`, {
      declaration_number: declarationNumber
    }, {
      preserveScroll: true,
    });
  };

  const handleAdvancePhase = (shipmentId) => {
    if (confirm('Tem certeza que deseja avançar para Armazenamento?')) {
      router.post(`/operations/transit/${shipmentId}/advance-phase`);
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pendente', color: 'bg-slate-100 text-slate-800' },
    { value: 'in_progress', label: 'Em Processo', color: 'bg-blue-100 text-blue-800' },
    { value: 'cleared', label: 'Liberado', color: 'bg-emerald-100 text-emerald-800' },
  ];

  return (
    <DashboardLayout>
      <Head title="Trânsito - Desembaraço Aduaneiro" />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Fase 3: Desembaraço Aduaneiro</h1>
            <p className="mt-1 text-sm text-slate-600">
              Processar liberação alfandegária para trânsito internacional
            </p>
          </div>
          <div className="px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm font-semibold text-purple-900">🔄 Processo de Trânsito</p>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Checklist do Desembaraço</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Submeter declaração de trânsito (DT)</li>
                <li>✓ Aguardar análise e aprovação das alfândegas</li>
                <li>✓ Obter número de declaração</li>
                <li>✓ Confirmar liberação para trânsito</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {shipments && shipments.length > 0 ? (
            shipments.map((shipment) => {
              const canAdvance = shipment.tra_customs_clearance_status === 'cleared' &&
                                shipment.tra_customs_declaration_number;

              return (
                <div key={shipment.id} className="p-6 bg-white border rounded-xl border-slate-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{shipment.reference_number}</h3>
                      <p className="text-sm text-slate-600">Cliente: {shipment.client?.name}</p>
                      <p className="text-xs text-slate-500">
                        Container: {shipment.container_number} | {shipment.container_type}
                      </p>
                      <p className="text-xs text-slate-500">
                        Rota: {shipment.origin_port} → MOZ → {shipment.destination_port}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusOptions.find(s => s.value === shipment.tra_customs_clearance_status)?.color || 'bg-slate-100 text-slate-800'}`}>
                      {statusOptions.find(s => s.value === shipment.tra_customs_clearance_status)?.label || 'Pendente'}
                    </div>
                  </div>

                  <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm font-medium text-slate-700 mb-3">Status do Desembaraço:</p>
                    <div className="flex gap-2">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleStatusChange(shipment.id, option.value)}
                          disabled={shipment.tra_customs_clearance_status === option.value}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${shipment.tra_customs_clearance_status === option.value ? option.color + ' ring-2 ring-offset-2 ring-purple-500' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Número da Declaração de Trânsito (DT) *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        defaultValue={shipment.tra_customs_declaration_number || ''}
                        onBlur={(e) => {
                          if (e.target.value && e.target.value !== shipment.tra_customs_declaration_number) {
                            handleDeclarationNumber(shipment.id, e.target.value);
                          }
                        }}
                        placeholder="Ex: DT2024/12345"
                        className="flex-1 px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                      {shipment.tra_customs_declaration_number && (
                        <div className="flex items-center px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <Check className="w-4 h-4 text-emerald-600 mr-1" />
                          <span className="text-xs text-emerald-800">Registrado</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="text-xs text-slate-500">
                      {canAdvance ? (
                        <span className="text-emerald-600 font-semibold">✓ Pronto para avançar</span>
                      ) : (
                        <span>Complete o desembaraço e registre o nº DT</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAdvancePhase(shipment.id)}
                      disabled={!canAdvance}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Avançar para Armazenamento
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center bg-white border rounded-xl border-slate-200">
              <Shield className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhum processo nesta fase</h3>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
