import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
  DollarSign,
  Upload,
  X,
  FileText,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

/**
 * Formulário de Solicitação de Pagamento
 * Usado por Operações em cada fase do processo
 */
export default function PaymentRequestForm({ shipment, phase, onClose }) {
  const [formData, setFormData] = useState({
    request_type: '',
    payee: '',
    amount: '',
    currency: 'MZN',
    description: '',
  });

  const [quotationFile, setQuotationFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Configurações por fase
  const phaseConfig = {
    coleta_dispersa: {
      title: 'Fase 1: Coleta de Dispersa',
      requestTypes: [
        { value: 'quotation_payment', label: 'Pagamento de Cotação de Frete' },
        { value: 'transport_fee', label: 'Taxa de Transporte' },
      ],
      defaultPayee: shipment.shipping_line?.name || '',
      description: 'Pagamento para linha de navegação',
    },
    alfandegas: {
      title: 'Fase 3: Alfândegas',
      requestTypes: [
        { value: 'customs_tax', label: 'Taxas Alfandegárias' },
        { value: 'inspection_fee', label: 'Taxa de Inspeção' },
      ],
      defaultPayee: 'Alfândegas de Moçambique',
      description: 'Pagamento de taxas aduaneiras',
    },
    cornelder: {
      title: 'Fase 4: Cornelder',
      requestTypes: [
        { value: 'cornelder_fee', label: 'Despesas de Manuseamento' },
        { value: 'storage_fee', label: 'Taxa de Armazenamento (Storage)' },
      ],
      defaultPayee: 'Cornelder de Moçambique',
      description: 'Pagamento de despesas portuárias',
    },
  };

  const config = phaseConfig[phase] || phaseConfig.coleta_dispersa;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    // Validações
    const newErrors = {};

    if (!formData.request_type) {
      newErrors.request_type = 'Selecione o tipo de pagamento';
    }

    if (!formData.payee.trim()) {
      newErrors.payee = 'Informe o destinatário';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Informe um valor válido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Informe a descrição/justificativa';
    }

    if (!quotationFile) {
      newErrors.quotation = 'Anexe a cotação recebida';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit
    setSubmitting(true);

    const data = new FormData();
    data.append('phase', phase);
    data.append('request_type', formData.request_type);
    data.append('payee', formData.payee);
    data.append('amount', formData.amount);
    data.append('currency', formData.currency);
    data.append('description', formData.description);
    data.append('quotation_document', quotationFile);

    router.post(`/payment-requests/${shipment.id}`, data, {
      preserveScroll: true,
      onSuccess: () => {
        onClose();
      },
      onError: (serverErrors) => {
        setErrors(serverErrors);
      },
      onFinish: () => setSubmitting(false),
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamanho (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, quotation: 'Arquivo muito grande. Máximo 10MB.' });
        return;
      }
      setQuotationFile(file);
      setErrors({ ...errors, quotation: null });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-3xl my-8 bg-white rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Nova Solicitação de Pagamento
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {config.title} • Processo: {shipment.reference_number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 transition-colors rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Alerta Informativo */}
        <div className="p-4 m-6 border border-blue-200 rounded-lg bg-blue-50">
          <div className="flex gap-3">
            <AlertCircle className="flex-shrink-0 w-5 h-5 text-blue-600" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold">Como funciona:</p>
              <ol className="mt-2 ml-4 space-y-1 list-decimal">
                <li>Você cria a solicitação anexando a cotação recebida</li>
                <li>Um gestor irá analisar e aprovar/rejeitar</li>
                <li>Se aprovado, o departamento financeiro processará o pagamento</li>
                <li>Você será notificado quando o pagamento for confirmado</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tipo de Pagamento */}
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Tipo de Pagamento *
            </label>
            <select
              value={formData.request_type}
              onChange={(e) => setFormData({ ...formData, request_type: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.request_type ? 'border-red-500' : 'border-slate-300'
              }`}
            >
              <option value="">Selecione...</option>
              {config.requestTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.request_type && (
              <p className="mt-1 text-sm text-red-600">{errors.request_type}</p>
            )}
          </div>

          {/* Grid: Destinatário e Valor */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Destinatário */}
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Destinatário do Pagamento *
              </label>
              <input
                type="text"
                value={formData.payee}
                onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
                placeholder={config.defaultPayee}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.payee ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.payee && (
                <p className="mt-1 text-sm text-red-600">{errors.payee}</p>
              )}
            </div>

            {/* Valor e Moeda */}
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Valor a Pagar *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.amount ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MZN">MZN</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
            </div>
          </div>

          {/* Descrição/Justificativa */}
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Descrição / Justificativa *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder={`Ex: ${config.description} para o processo ${shipment.reference_number}. BL: ${shipment.bl_number}`}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            <p className="mt-1 text-xs text-slate-500">
              Explique o motivo do pagamento e forneça detalhes relevantes
            </p>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Upload de Cotação */}
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Cotação Recebida * (PDF, JPG, PNG)
            </label>

            <div className="relative">
              <input
                type="file"
                id="quotation-upload"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
              />
              <label
                htmlFor="quotation-upload"
                className={`flex items-center justify-center w-full px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  errors.quotation
                    ? 'border-red-500 bg-red-50'
                    : quotationFile
                    ? 'border-green-500 bg-green-50'
                    : 'border-slate-300 bg-slate-50 hover:border-blue-500 hover:bg-blue-50'
                }`}
              >
                <div className="text-center">
                  {quotationFile ? (
                    <>
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-600" />
                      <p className="text-sm font-medium text-green-900">
                        {quotationFile.name}
                      </p>
                      <p className="text-xs text-green-700">
                        {(quotationFile.size / 1024).toFixed(2)} KB • Clique para trocar
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                      <p className="text-sm font-medium text-slate-700">
                        Clique para selecionar ou arraste o arquivo
                      </p>
                      <p className="text-xs text-slate-500">
                        PDF, JPG ou PNG • Máximo 10MB
                      </p>
                    </>
                  )}
                </div>
              </label>
            </div>

            {errors.quotation && (
              <p className="mt-1 text-sm text-red-600">{errors.quotation}</p>
            )}
          </div>

          {/* Preview do Valor Total */}
          {formData.amount && (
            <div className="p-4 border border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Valor Total da Solicitação</p>
                  <p className="text-xs text-slate-600">
                    Este valor será enviado para aprovação
                  </p>
                </div>
                <p className="text-3xl font-bold text-blue-900">
                  {parseFloat(formData.amount).toLocaleString('pt-MZ', {
                    style: 'currency',
                    currency: formData.currency,
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Erros Gerais */}
          {errors.error && (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <p className="text-sm font-medium text-red-900">{errors.error}</p>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-3 font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center flex-1 gap-2 px-4 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5" />
                  Enviar Solicitação
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
