import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
  FileText, DollarSign, Calculator, Send, CheckCircle2,
  Clock, AlertCircle, Download, Eye, Edit, X
} from 'lucide-react';

/**
 * Página de Gerenciamento de Faturas
 * RF-020 até RF-024
 *
 * @author Arnaldo Tomo
 */
export default function Invoices({ shipments, stats }) {
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <DashboardLayout>
      <Head title="Faturação - Fase 6" />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              💰 Faturação - Fase 6
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Geração e gestão de faturas aos clientes
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard
            icon={FileText}
            label="Processos Prontos"
            value={stats?.ready || 0}
            color="blue"
          />
          <StatCard
            icon={Clock}
            label="Faturas Pendentes"
            value={stats?.pending || 0}
            color="yellow"
          />
          <StatCard
            icon={CheckCircle2}
            label="Faturas Pagas"
            value={stats?.paid || 0}
            color="green"
          />
          <StatCard
            icon={DollarSign}
            label="Total Faturado"
            value={`${stats?.total_amount || 0} USD`}
            color="emerald"
          />
        </div>

        {/* Lista de Shipments */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {shipments?.data?.map((shipment) => (
            <InvoiceCard
              key={shipment.id}
              shipment={shipment}
              onGenerate={() => {
                setSelectedShipment(shipment);
                setShowGenerateModal(true);
              }}
              onRegisterPayment={() => {
                setSelectedShipment(shipment);
                setShowPaymentModal(true);
              }}
            />
          ))}
        </div>

        {/* Modals */}
        {showGenerateModal && (
          <GenerateInvoiceModal
            shipment={selectedShipment}
            onClose={() => {
              setShowGenerateModal(false);
              setSelectedShipment(null);
            }}
          />
        )}

        {showPaymentModal && (
          <RegisterPaymentModal
            shipment={selectedShipment}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedShipment(null);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

// ========================================
// COMPONENTE: CARD DE FATURA
// ========================================
function InvoiceCard({ shipment, onGenerate, onRegisterPayment }) {
  const hasInvoice = shipment.invoices?.length > 0;
  const invoice = hasInvoice ? shipment.invoices[0] : null;
  const isPaid = invoice?.payment_status === 'paid';
  const canGenerate = !hasInvoice && shipment.phase1_complete;

  return (
    <div className="overflow-hidden bg-white border rounded-xl border-slate-200">
      {/* Header */}
      <div className="p-4 border-b bg-slate-50 border-slate-200">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-slate-900">
              {shipment.reference_number}
            </h3>
            <p className="text-sm text-slate-600">
              Cliente: {shipment.client?.name}
            </p>
          </div>
          {hasInvoice && (
            <StatusBadge status={invoice.payment_status} />
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Se não tem fatura */}
        {!hasInvoice && (
          <div className="p-4 rounded-lg bg-blue-50">
            <div className="flex items-start gap-3">
              <Calculator className="w-5 h-5 mt-0.5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  Pronto para Faturação
                </p>
                <p className="mt-1 text-xs text-blue-700">
                  {canGenerate
                    ? 'Todos os custos foram coletados. Clique para gerar fatura.'
                    : 'Aguardando conclusão da Fase 1 e pagamento de despesas.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Se tem fatura */}
        {hasInvoice && (
          <>
            <div className="p-4 rounded-lg bg-slate-50">
              <h4 className="mb-3 text-sm font-semibold text-slate-900">
                📄 Detalhes da Fatura
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Número:</span>
                  <span className="font-medium text-slate-900">
                    {invoice.invoice_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Data Emissão:</span>
                  <span className="text-slate-900">
                    {new Date(invoice.issue_date).toLocaleDateString('pt-PT')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Vencimento:</span>
                  <span className="text-slate-900">
                    {new Date(invoice.due_date).toLocaleDateString('pt-PT')}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="font-medium text-slate-700">Total:</span>
                  <span className="text-lg font-bold text-emerald-600">
                    ${invoice.total?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Breakdown de Custos */}
            <CostBreakdown costs={invoice.invoice_data} />
          </>
        )}

        {/* Ações */}
        <div className="pt-3 space-y-2 border-t border-slate-200">
          {!hasInvoice ? (
            <button
              onClick={onGenerate}
              disabled={!canGenerate}
              className={`w-full px-4 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 ${
                canGenerate
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Calculator className="w-4 h-4" />
              Gerar Fatura
            </button>
          ) : (
            <>
              {!isPaid && (
                <button
                  onClick={onRegisterPayment}
                  className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-emerald-600 hover:bg-emerald-700"
                >
                  <DollarSign className="w-4 h-4" />
                  Registrar Pagamento
                </button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => router.get(`/invoices/${shipment.id}/preview`)}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
                >
                  <Eye className="w-4 h-4" />
                  Visualizar
                </button>
                <button
                  onClick={() => router.get(`/invoices/${shipment.id}/download`)}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>

              {!isPaid && (
                <button
                  onClick={() => router.post(`/invoices/${shipment.id}/send`)}
                  className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                  Enviar ao Cliente
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ========================================
// COMPONENTE: BREAKDOWN DE CUSTOS
// ========================================
function CostBreakdown({ costs }) {
  const [expanded, setExpanded] = useState(false);

  if (!costs) return null;

  return (
    <div className="p-4 space-y-3 border rounded-lg border-slate-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-sm font-medium text-slate-900"
      >
        <span>💰 Breakdown de Custos</span>
        <span className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {expanded && (
        <div className="pt-2 space-y-3 border-t border-slate-200">
          {/* Custos por Fase */}
          <CostSection
            title="Coleta Dispersa"
            items={costs.costs_by_phase?.coleta_dispersa || []}
          />
          <CostSection
            title="Alfândegas"
            items={costs.costs_by_phase?.alfandegas || []}
          />
          <CostSection
            title="Cornelder"
            items={costs.costs_by_phase?.cornelder || []}
          />

          {/* Base Rates */}
          <div className="pt-2 border-t border-slate-200">
            <p className="mb-2 text-xs font-semibold text-slate-700">
              Custos Padrões (Base Rates)
            </p>
            {costs.base_rates?.map((rate, idx) => (
              <div key={idx} className="flex justify-between text-xs text-slate-600">
                <span>{rate.description}</span>
                <span>${rate.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totais */}
          <div className="pt-2 space-y-1 border-t border-slate-200">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal:</span>
              <span className="font-medium text-slate-900">
                ${costs.subtotal?.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">
                Margem ({costs.margin_percent}%):
              </span>
              <span className="font-medium text-emerald-600">
                +${costs.margin_amount?.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200">
              <span className="text-base font-bold text-slate-900">Total:</span>
              <span className="text-lg font-bold text-emerald-600">
                ${costs.total_invoice?.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CostSection({ title, items }) {
  if (!items || items.length === 0) return null;

  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-slate-700">{title}</p>
      {items.map((item, idx) => (
        <div key={idx} className="flex justify-between text-xs text-slate-600">
          <span className="truncate">{item.description}</span>
          <span>${item.amount.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

// ========================================
// MODAL: GERAR FATURA
// ========================================
function GenerateInvoiceModal({ shipment, onClose }) {
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [marginPercent, setMarginPercent] = useState(15);
  const [dueDays, setDueDays] = useState(30);
  const [notes, setNotes] = useState('');

  // Buscar preview ao carregar
  React.useEffect(() => {
    fetchPreview();
  }, []);

  const fetchPreview = async () => {
    try {
      setLoading(true);
      setError(null);

      // Log para debug
      console.log('Buscando preview para shipment:', shipment.id);

      const response = await fetch(`/invoices/${shipment.id}/calculate`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      });

      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setPreview(data);
      } else {
        setError(data.error || 'Erro ao calcular custos');
        console.error('Erro na resposta:', data);
      }
    } catch (err) {
      console.error('Erro na requisição:', err);
      setError('Erro ao conectar com o servidor: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const recalculate = () => {
    if (!preview?.costs) return;

    const newInvoice = {
      subtotal: preview.costs.subtotal,
      margin_percent: marginPercent,
      margin_amount: preview.costs.subtotal * (marginPercent / 100),
    };
    newInvoice.total_invoice = newInvoice.subtotal + newInvoice.margin_amount;

    setPreview({
      ...preview,
      invoice_preview: newInvoice,
    });
  };

  React.useEffect(() => {
    recalculate();
  }, [marginPercent]);

  const handleSubmit = (e) => {
    e.preventDefault();
    router.post(`/invoices/${shipment.id}/generate`, {
      margin_percent: marginPercent,
      due_days: dueDays,
      notes: notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-3xl overflow-hidden bg-white rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Gerar Fatura
            </h2>
            <p className="text-sm text-slate-600">
              {shipment.reference_number} - {shipment.client?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 transition-colors rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-red-50">
              <p className="text-sm font-medium text-red-900">{error}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Validação */}
              {preview?.validation?.warnings?.length > 0 && (
                <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 mt-0.5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Avisos:</p>
                      <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside">
                        {preview.validation.warnings.map((warning, idx) => (
                          <li key={idx}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview de Custos */}
              <CostBreakdown costs={{...preview.costs, ...preview.invoice_preview}} />

              {/* Configurações */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Margem de Lucro (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={marginPercent}
                    onChange={(e) => setMarginPercent(parseFloat(e.target.value))}
                    className="block w-full px-3 py-2 mt-1 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Margem padrão: 15%. Ajuste conforme necessário.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Prazo de Pagamento (dias)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={dueDays}
                    onChange={(e) => setDueDays(parseInt(e.target.value))}
                    className="block w-full px-3 py-2 mt-1 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Observações (opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="block w-full px-3 py-2 mt-1 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
                    placeholder="Adicione observações para o cliente..."
                  />
                </div>
              </div>

              {/* Total Final */}
              <div className="p-6 rounded-lg bg-emerald-50">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-emerald-900">
                    Total da Fatura:
                  </span>
                  <span className="text-3xl font-bold text-emerald-600">
                    ${preview?.invoice_preview?.total_invoice?.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <FileText className="w-4 h-4" />
                  Gerar Fatura em PDF
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ========================================
// MODAL: REGISTRAR PAGAMENTO
// ========================================
function RegisterPaymentModal({ shipment, onClose }) {
  const invoice = shipment.invoices?.[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    router.post(`/invoices/${shipment.id}/register-payment`, formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-lg overflow-hidden bg-white rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Registrar Pagamento
            </h2>
            <p className="text-sm text-slate-600">
              Fatura {invoice?.invoice_number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 transition-colors rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-4 rounded-lg bg-slate-50">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Valor da Fatura:</span>
              <span className="text-lg font-bold text-slate-900">
                ${invoice?.total?.toFixed(2)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Valor Pago *
            </label>
            <input
              type="number"
              name="amount_paid"
              step="0.01"
              min="0"
              defaultValue={invoice?.total}
              required
              className="block w-full px-3 py-2 mt-1 border rounded-lg border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Data do Pagamento *
            </label>
            <input
              type="date"
              name="payment_date"
              defaultValue={new Date().toISOString().split('T')[0]}
              required
              className="block w-full px-3 py-2 mt-1 border rounded-lg border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Método de Pagamento *
            </label>
            <select
              name="payment_method"
              required
              className="block w-full px-3 py-2 mt-1 border rounded-lg border-slate-300 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="bank_transfer">Transferência Bancária</option>
              <option value="cash">Dinheiro</option>
              <option value="check">Cheque</option>
              <option value="other">Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Comprovativo de Pagamento
            </label>
            <input
              type="file"
              name="payment_proof"
              accept=".pdf,.jpg,.jpeg,.png"
              className="block w-full px-3 py-2 mt-1 text-sm border rounded-lg border-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Observações
            </label>
            <textarea
              name="notes"
              rows={3}
              className="block w-full px-3 py-2 mt-1 border rounded-lg border-slate-300 focus:ring-2 focus:ring-emerald-500"
              placeholder="Adicione observações sobre o pagamento..."
            />
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirmar Pagamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ========================================
// COMPONENTES AUXILIARES
// ========================================
function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };

  return (
    <div className="p-4 bg-white border rounded-lg border-slate-200">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-slate-600">{label}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    pending: { label: 'Pendente', class: 'bg-yellow-100 text-yellow-700' },
    paid: { label: 'Pago', class: 'bg-green-100 text-green-700' },
    overdue: { label: 'Vencido', class: 'bg-red-100 text-red-700' },
  };

  const { label, class: className } = config[status] || config.pending;

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${className}`}>
      {label}
    </span>
  );
}
