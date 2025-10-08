// ========================================
// FASE 5: TAXAÇÃO
// ========================================
export function Taxacao({ shipments, stats }) {
  return (
    <DashboardLayout>
      <Head title="Taxação - Fase 5" />

      <div className="p-6 space-y-6">
        <PhaseHeader
          phase={5}
          title="Taxação"
          description="Emissão de SAD (Single Administrative Document) e IDO"
          stats={[
            { label: 'Total Processos', value: stats.total || 0 },
            { label: 'Aguardando SAD', value: stats.awaiting_sad || 0 },
            { label: 'SAD Emitido', value: stats.sad_issued || 0 },
            { label: 'Liberado', value: stats.released || 0 }
          ]}
        />

        <FilterBar onSearch={(q) => console.log('Buscar:', q)} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {shipments.data.map((shipment) => (
            <TaxacaoCard key={shipment.id} shipment={shipment} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

function TaxacaoCard({ shipment }) {
  const hasSAD = shipment.documents.some(d => d.type === 'sad');
  const hasIDO = shipment.documents.some(d => d.type === 'delivery_order');

  return (
    <div className="overflow-hidden bg-white border rounded-xl border-slate-200">
      <div className="p-4 border-b bg-slate-50 border-slate-200">
        <h3 className="font-bold text-slate-900">{shipment.reference_number}</h3>
        <p className="text-sm text-slate-600">Container: {shipment.container_number}</p>
      </div>

      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <StepItem icon={FileText} label="SAD Emitido" completed={hasSAD} />
          <StepItem icon={Truck} label="IDO Processado" completed={hasIDO} />
          <StepItem
            icon={CheckCircle2}
            label="Liberado para Transporte"
            completed={hasSAD && hasIDO}
          />
        </div>

        <div className="pt-3 space-y-2 border-t border-slate-200">
          <button
            disabled={hasSAD}
            className={`w-full px-4 py-2 text-sm font-medium rounded-lg ${
              hasSAD
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <FileText className="inline w-4 h-4 mr-2" />
            Emitir SAD
          </button>

          <button
            disabled={!hasSAD || hasIDO}
            className={`w-full px-4 py-2 text-sm font-medium rounded-lg ${
              !hasSAD || hasIDO
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            <Truck className="inline w-4 h-4 mr-2" />
            Processar IDO
          </button>
        </div>
      </div>
    </div>
  );
}
