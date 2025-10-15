import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    X,
    DollarSign,
    Building2,
    Upload,
    FileText,
    Save,
    AlertCircle,
} from 'lucide-react';

export function PaymentRequestModal({ shipment, phase, phaseName, onClose }) {
    // 🎯 MAPEAMENTO: Número da Fase → Configuração AUTOMÁTICA
    const phaseConfig = {
        1: { // Coleta Dispersa
            type: 'shipping_line_quotation',
            label: 'Cotação Linha de Navegação',
            payees: ['CMA CGM', 'PIL', 'MAERSK', 'MSC', 'COSCO']
        },
        2: { // Legalização
            type: 'legalization_fee',
            label: 'Taxas de Legalização',
            payees: ['Despachante Oficial', 'Serviços Jurídicos']
        },
        3: { // Alfândegas
            type: 'customs_tax',
            label: 'Impostos Alfandegários',
            payees: ['Alfândega de Maputo', 'Receita Tributária']
        },
        4: { // Cornelder
            type: 'storage_fee',
            label: 'Taxa de Armazenamento Cornelder',
            payees: ['Cornelder Moçambique', 'Porto de Maputo']
        },
        5: { // Taxação
            type: 'tax_payment',
            label: 'Pagamento de Impostos',
            payees: ['AT - Autoridade Tributária', 'Ministério das Finanças']
        },
        6: { // Faturação
            type: 'invoice_related',
            label: 'Custos de Faturação',
            payees: ['Contador', 'Serviços Contabilísticos']
        },
        7: { // POD
            type: 'delivery_fee',
            label: 'Taxa de Entrega/Transporte',
            payees: ['Transportadora', 'Empresa de Logística']
        }
    };

    const currentConfig = phaseConfig[phase] || {
        type: 'other',
        label: 'Outro Pagamento',
        payees: []
    };

    const [formData, setFormData] = useState({
        request_type: currentConfig.type,
        payee: currentConfig.payees[0] || '',
        amount: '',
        currency: 'MZN',
        description: '',
        quotation_file: null,
    });
    const [uploading, setUploading] = useState(false);

    const handleSubmit = () => {
        if (!formData.quotation_file) {
            alert('Por favor, anexe a cotação');
            return;
        }

        setUploading(true);

        const data = new FormData();
        data.append('phase', phase);
        data.append('request_type', formData.request_type);
        data.append('payee', formData.payee);
        data.append('amount', formData.amount);
        data.append('currency', formData.currency);
        data.append('description', formData.description);
        data.append('quotation_document', formData.quotation_file);

        router.post(`/payment-requests/${shipment.id}`, data, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                alert('✅ Solicitação enviada para aprovação!');
                onClose();
            },
            onError: (errors) => {
                console.error('Erro:', errors);
                alert('❌ Erro ao criar solicitação');
            },
            onFinish: () => setUploading(false),
        });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl rounded-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white border-b border-slate-200">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Nova Solicitação de Pagamento
                        </h2>
                        <p className="text-sm text-slate-600">
                            {shipment.reference_number} - {phaseName}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 transition-colors rounded-lg hover:bg-slate-100"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                {/* Alerta Info - MOSTRA O TIPO DETECTADO AUTOMATICAMENTE */}
                <div className="flex gap-3 p-4 mx-6 mt-4 border-l-4 border-blue-500 rounded-lg bg-blue-50">
                    <AlertCircle className="flex-shrink-0 w-5 h-5 mt-0.5 text-blue-600" />
                    <div className="text-sm text-blue-900">
                        <p className="font-semibold">Tipo de Pagamento Detectado:</p>
                        <p className="mt-1 text-base font-bold">{currentConfig.label}</p>
                        <p className="mt-2 text-xs">Preencha os dados e anexe a cotação para enviar.</p>
                    </div>
                </div>

                {/* Form */}
                <div className="p-6 space-y-4">
                    {/* Beneficiário */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            Beneficiário (Para Quem Pagar) *
                        </label>
                        <div className="relative">
                            <Building2 className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                            {currentConfig.payees.length > 0 ? (
                                <select
                                    value={formData.payee}
                                    onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
                                    required
                                    className="w-full py-2 pl-10 pr-4 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
                                >
                                    {currentConfig.payees.map((payee) => (
                                        <option key={payee} value={payee}>
                                            {payee}
                                        </option>
                                    ))}
                                    <option value="outros">✏️ Outros (Digite abaixo)</option>
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={formData.payee}
                                    onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
                                    required
                                    className="w-full py-2 pl-10 pr-4 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nome da empresa/entidade"
                                />
                            )}
                        </div>
                        {formData.payee === 'outros' && (
                            <input
                                type="text"
                                onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
                                required
                                className="w-full px-4 py-2 mt-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
                                placeholder="Digite o nome do beneficiário"
                            />
                        )}
                    </div>

                    {/* Valor e Moeda */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="md:col-span-2">
                            <label className="block mb-2 text-sm font-medium text-slate-700">
                                Valor *
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full py-2 pl-10 pr-4 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-700">
                                Moeda
                            </label>
                            <select
                                value={formData.currency}
                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="MZN">MZN</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="ZAR">ZAR</option>
                            </select>
                        </div>
                    </div>

                    {/* Descrição */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            Descrição / Observações *
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            rows={3}
                            className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
                            placeholder="Descreva o motivo e detalhes do pagamento..."
                        />
                    </div>

                    {/* Upload Cotação */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            Cotação / Documento de Suporte *
                        </label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 transition-colors border-2 border-dashed rounded-lg cursor-pointer border-slate-300 hover:border-blue-500 hover:bg-blue-50">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-10 h-10 mb-3 text-slate-400" />
                                    <p className="mb-2 text-sm text-slate-600">
                                        <span className="font-semibold">Clique para fazer upload</span>
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        PDF, JPG, PNG (MAX. 10MB)
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    onChange={(e) => setFormData({ ...formData, quotation_file: e.target.files[0] })}
                                    required
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                />
                            </label>
                        </div>
                        {formData.quotation_file && (
                            <div className="flex items-center gap-2 p-3 mt-2 rounded-lg bg-green-50">
                                <FileText className="w-5 h-5 text-green-600" />
                                <span className="text-sm font-medium text-green-900">
                                    {formData.quotation_file.name}
                                </span>
                                <span className="ml-auto text-xs text-green-700">
                                    {(formData.quotation_file.size / 1024).toFixed(0)}KB
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={uploading}
                            className="flex-1 px-6 py-3 font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={uploading}
                            className="flex items-center justify-center flex-1 gap-2 px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {uploading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Enviar Solicitação
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
