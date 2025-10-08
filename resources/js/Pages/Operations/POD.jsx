// ========================================
// FASE 7: POD (Proof of Delivery)
// ========================================
export function POD({ shipments, stats }) {
  return (
    <DashboardLayout>
      <Head title="POD - Fase 7" />

      <div className="p-6 space-y-6">
        <PhaseHeader
          phase={7}
          title="POD - Proof of Delivery"
          description="Devolução de container e conclusão do processo"
          stats={[
            { label: 'Total Processos', value: stats.total || 0 },
            { label: 'Aguardando Devolução', value: stats.awaiting_return || 0 },
            { label: 'Container Devolvido', value: stats.returned || 0 },
            { label: 'Concluídos', value: stats.completed || 0 }
          ]}
        />

        <FilterBar onSearch={(q) => console.log('Buscar:', q)} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {shipments.data.map((shipment) => (
            <PODCard key={shipment.id} shipment={shipment} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

function PODCard({ shipment }) {
  const hasPOD = shipment.documents.some(d => d.type === 'receipt' && d.stage === 'pod');
  const isCompleted = shipment.status === 'completed';

  // Cálculo de tempo total
  const startDate = new Date(shipment.created_at);
  const endDate = shipment.completed_at ? new Date(shipment.completed_at) : new Date();
  const daysTaken = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));

  return (
    <div className={`overflow-hidden bg-white border rounded-xl ${
      isCompleted ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200'
    }`}>
      <div className={`p-4 border-b ${
        isCompleted ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-slate-900">{shipment.reference_number}</h3>
            <p className="text-sm text-slate-600">BL: {shipment.bl_number}</p>
          </div>
          {isCompleted && (
            <span className="px-3 py-1 text-xs font-bold rounded-full text-emerald-700 bg-emerald-200">
              ✅ CONCLUÍDO
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Summary */}
        <div className="p-4 rounded-lg bg-blue-50">
          <h4 className="mb-2 text-sm font-semibold text-blue-900">
            📊 Resumo do Processo
          </h4>
          <div className="space-y-1 text-sm">
            <SummaryLine label="Cliente" value={shipment.client?.name} />
            <SummaryLine label="Container" value={shipment.container_number} />
            <SummaryLine label="Linha" value={shipment.shipping_line?.name} />
            <SummaryLine label="Tempo Total" value={`${daysTaken} dias`} />
            <SummaryLine
              label="Receita"
              value={`MZN ${shipment.total_revenue?.toLocaleString() || '0'}`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <StepItem icon={Truck} label="Mercadoria Entregue" completed={true} />
          <StepItem icon={Package} label="Container Devolvido" completed={hasPOD} />
          <StepItem icon={CheckCircle2} label="Processo Concluído" completed={isCompleted} />
        </div>

        <div className="pt-3 space-y-2 border-t border-slate-200">
          <button
            disabled={hasPOD}
            className={`w-full px-4 py-2 text-sm font-medium rounded-lg ${
              hasPOD
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Package className="inline w-4 h-4 mr-2" />
            Registrar Devolução
          </button>

          <button
            disabled={!hasPOD || isCompleted}
            className={`w-full px-4 py-2 text-sm font-medium rounded-lg ${
              !hasPOD || isCompleted
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            <CheckCircle2 className="inline w-4 h-4 mr-2" />
            Concluir Processo
          </button>

          {isCompleted && (
            <button className="w-full px-4 py-2 text-sm font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50">
              📄 Ver Relatório Final
            </button>
          )}
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

function CostLine({ label, value, bold, large, color }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`${bold ? 'font-semibold' : ''} ${large ? 'text-base' : ''} ${color || 'text-slate-700'}`}>
        {label}
      </span>
      <span className={`${bold ? 'font-bold' : 'font-medium'} ${large ? 'text-lg' : ''} ${color || 'text-slate-900'}`}>
        MZN {value.toLocaleString()}
      </span>
    </div>
  );
}

function SummaryLine({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-blue-700">{label}:</span>
      <span className="font-medium text-blue-900">{value}</span>
    </div>
  );
}

// Modals simplificados
function DraftModal({ shipment, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-2xl">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Obter Draft Cornelder</h2>
        </div>
        <div className="p-6">
          <p>Solicitar draft para {shipment.reference_number}</p>
        </div>
        <div className="flex gap-3 p-6 border-t">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg">
            Cancelar
          </button>
          <button className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg">
            Solicitar
          </button>
        </div>
      </div>
    </div>
  );
}

function StoragePaymentModal({ shipment, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-2xl">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Pagar Storage Cornelder</h2>
        </div>
        <div className="p-6">
          <p>Registrar pagamento de storage</p>
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

function InvoiceGenerationModal({ shipment, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-2xl bg-white rounded-2xl">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Gerar Fatura ao Cliente</h2>
        </div>
        <div className="p-6">
          <p>Gerar e enviar fatura para {shipment.client?.name}</p>
          {/* Form de fatura aqui */}
        </div>
        <div className="flex gap-3 p-6 border-t">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg">
            Cancelar
          </button>
          <button className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg">
            Gerar Fatura
          </button>
        </div>
      </div>
    </div>
  );
}
