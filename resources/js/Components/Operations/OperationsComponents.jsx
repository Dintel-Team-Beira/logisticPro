import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import {
  Upload, Download, Eye, Trash2, Check, X, Clock,
  FileText, AlertCircle, CheckCircle2, ArrowRight,
  DollarSign, Calendar, Package, Ship, Building2,
  Truck, ClipboardCheck, ChevronRight, Filter,
  Search, Plus, Edit2
} from 'lucide-react';

// ========================================
// COMPONENTE: PhaseTimeline
// Timeline visual das 7 fases
// ========================================
export function PhaseTimeline({ currentPhase, shipment }) {
  const phases = [
    { id: 1, name: 'Coleta Dispersa', icon: Package, color: 'blue' },
    { id: 2, name: 'Legalização', icon: FileText, color: 'purple' },
    { id: 3, name: 'Alfândegas', icon: Building2, color: 'indigo' },
    { id: 4, name: 'Cornelder', icon: Ship, color: 'cyan' },
    { id: 5, name: 'Taxação', icon: DollarSign, color: 'green' },
    { id: 6, name: 'Faturação', icon: FileText, color: 'yellow' },
    { id: 7, name: 'POD', icon: CheckCircle2, color: 'emerald' }
  ];

  const getPhaseStatus = (phaseId) => {
    if (phaseId < currentPhase) return 'completed';
    if (phaseId === currentPhase) return 'current';
    return 'pending';
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-between gap-2 p-6 bg-white border min-w-max rounded-xl border-slate-200">
        {phases.map((phase, index) => {
          const status = getPhaseStatus(phase.id);
          const Icon = phase.icon;

          return (
            <React.Fragment key={phase.id}>
              {/* Phase Item */}
              <div className="flex flex-col items-center gap-2">
                <div className={`
                  relative flex items-center justify-center w-12 h-12 rounded-full
                  transition-all duration-300
                  ${status === 'completed' ? 'bg-emerald-500 text-white' : ''}
                  ${status === 'current' ? `bg-${phase.color}-500 text-white ring-4 ring-${phase.color}-100 scale-110` : ''}
                  ${status === 'pending' ? 'bg-slate-200 text-slate-400' : ''}
                `}>
                  {status === 'completed' ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                <div className="text-center">
                  <p className={`text-xs font-semibold ${
                    status === 'current' ? 'text-slate-900' : 'text-slate-600'
                  }`}>
                    Fase {phase.id}
                  </p>
                  <p className={`text-xs ${
                    status === 'current' ? 'text-slate-700 font-medium' : 'text-slate-500'
                  }`}>
                    {phase.name}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {index < phases.length - 1 && (
                <div className={`flex-1 h-1 rounded transition-all duration-300 ${
                  status === 'completed' ? 'bg-emerald-500' : 'bg-slate-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ========================================
// COMPONENTE: DocumentChecklist
// Checklist de documentos necessários
// ========================================
export function DocumentChecklist({ phase, documents, onUpload, onDelete, onView }) {
  const documentsByPhase = {
    1: [
      { type: 'bl', label: 'BL Original', required: true },
      { type: 'carta_endosso', label: 'Carta de Endosso', required: true },
      { type: 'invoice', label: 'Fatura da Linha', required: true },
      { type: 'pop', label: 'Comprovativo Pagamento', required: true },
      { type: 'receipt', label: 'Recibo da Linha', required: true }
    ],
    2: [
      { type: 'bl', label: 'BL Carimbado', required: true },
      { type: 'delivery_order', label: 'Delivery Order', required: true }
    ],
    3: [
      { type: 'packing_list', label: 'Packing List', required: true },
      { type: 'invoice', label: 'Commercial Invoice', required: true },
      { type: 'aviso', label: 'Aviso de Taxação', required: true },
      { type: 'pop', label: 'POP Alfândegas', required: true },
      { type: 'autorizacao', label: 'Autorização de Saída', required: true }
    ],
    4: [
      { type: 'draft', label: 'Draft Cornelder', required: true },
      { type: 'storage', label: 'Storage', required: true },
      { type: 'pop', label: 'POP Cornelder', required: true },
      { type: 'receipt', label: 'Recibo Cornelder', required: true },
      { type: 'termo', label: 'Termo da Linha', required: true }
    ],
    5: [
      { type: 'sad', label: 'SAD (Documento Trânsito)', required: true },
      { type: 'delivery_order', label: 'IDO', required: true }
    ],
    6: [
      { type: 'invoice', label: 'Fatura ao Cliente', required: true }
    ],
    7: [
      { type: 'receipt', label: 'POD (Proof of Delivery)', required: true }
    ]
  };

  const requiredDocs = documentsByPhase[phase] || [];

  const getDocumentStatus = (docType) => {
    return documents.find(d => d.type === docType);
  };

  return (
    <div className="p-6 bg-white border rounded-xl border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          📋 Checklist de Documentos
        </h3>
        <span className="text-sm text-slate-500">
          {documents.length}/{requiredDocs.length} completo
        </span>
      </div>

      <div className="space-y-3">
        {requiredDocs.map((doc) => {
          const uploaded = getDocumentStatus(doc.type);

          return (
            <div
              key={doc.type}
              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                uploaded
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  uploaded ? 'bg-emerald-500' : 'bg-slate-300'
                }`}>
                  {uploaded ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <Clock className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <p className={`font-medium ${
                    uploaded ? 'text-emerald-900' : 'text-slate-700'
                  }`}>
                    {doc.label}
                  </p>
                  {doc.required && (
                    <p className="text-xs text-slate-500">Obrigatório</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {uploaded ? (
                  <>
                    <button
                      onClick={() => onView(uploaded)}
                      className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(uploaded.id)}
                      className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <label className="px-3 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700">
                    <Upload className="inline w-4 h-4 mr-2" />
                    Upload
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => onUpload(doc.type, e.target.files[0])}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ========================================
// COMPONENTE: ShipmentCard
// Card de processo na listagem
// ========================================
export function ShipmentCard({ shipment, onViewDetails }) {
  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-emerald-100 text-emerald-700',
      delayed: 'bg-red-100 text-red-700'
    };
    return styles[status] || styles.active;
  };

  const daysElapsed = shipment.days_elapsed || 0;

  return (
    <div className="p-6 transition-all bg-white border rounded-xl border-slate-200 hover:shadow-lg hover:border-blue-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {shipment.reference_number}
          </h3>
          <p className="text-sm text-slate-600">
            BL: {shipment.bl_number}
          </p>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(shipment.status)}`}>
          {shipment.status_label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-slate-500">Cliente</p>
          <p className="font-medium text-slate-900">{shipment.client?.name || 'N/A'}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Linha</p>
          <p className="font-medium text-slate-900">{shipment.shipping_line?.name || 'N/A'}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Container</p>
          <p className="font-medium text-slate-900">{shipment.container_number}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Dias Decorridos</p>
          <p className={`font-medium ${daysElapsed > 20 ? 'text-red-600' : 'text-slate-900'}`}>
            {daysElapsed} dias
          </p>
        </div>
      </div>

      {shipment.storage_alert && (
        <div className="flex items-center gap-2 p-3 mb-4 border border-red-200 rounded-lg bg-red-50">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <p className="text-sm font-medium text-red-700">
            ⚠️ Storage crítico - {shipment.days_to_storage_deadline} dias restantes
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails(shipment.id)}
          className="flex-1 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Ver Detalhes
        </button>
        <Link
          href={`/shipments/${shipment.id}/edit`}
          className="px-4 py-2 text-sm font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
        >
          <Edit2 className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// ========================================
// COMPONENTE: PhaseHeader
// Cabeçalho padrão para páginas de fase
// ========================================
export function PhaseHeader({ phase, title, description, stats }) {
  return (
    <div className="p-6 bg-white border rounded-xl border-slate-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 text-xs font-bold text-blue-600 bg-blue-100 rounded">
              FASE {phase}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mt-1 text-slate-600">{description}</p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-4 mt-6">
          {stats.map((stat, index) => (
            <div key={index} className="p-4 rounded-lg bg-slate-50">
              <p className="text-sm text-slate-600">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ========================================
// COMPONENTE: FilterBar
// Barra de filtros e busca
// ========================================
export function FilterBar({ onSearch, onFilter, filters }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white border rounded-xl border-slate-200">
      <div className="relative flex-1">
        <Search className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Buscar por BL, referência, container..."
          className="w-full py-2 pl-10 pr-4 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <button className="flex items-center gap-2 px-4 py-2 font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50">
        <Filter className="w-4 h-4" />
        Filtros
      </button>
    </div>
  );
}

// Exportar todos os componentes
export default {
  PhaseTimeline,
  DocumentChecklist,
  ShipmentCard,
  PhaseHeader,
  FilterBar
};
