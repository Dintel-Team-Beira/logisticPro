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
    Plus,
    Trash2,
    CheckCircle2,
} from 'lucide-react';

/**
 * Modal para Solicitação Múltipla de Orçamentos
 * Permite criar várias solicitações de uma só vez na Fase 1
 *
 * @author Arnaldo Tomo
 */
export function BulkPaymentRequestModal({ shipment, phase, phaseName, onClose }) {
    // 🎯 TIPOS DE DESPESAS DISPONÍVEIS PARA FASE 1
    const expenseTypes = [
        {
            value: 'shipping_line_quotation',
            label: 'Cotação Linha de Navegação',
            payees: ['CMA CGM', 'PIL', 'MAERSK', 'MSC', 'COSCO', 'ONE DIAMOND', 'MANICA'],
            description: 'Pagamento de frete marítimo'
        },
        {
            value: 'cdm_fee',
            label: 'Despesas CDM',
            payees: ['CDM - Conselho de Ministros', 'Serviços CDM'],
            description: 'Taxas e despesas CDM'
        },
        {
            value: 'customs_preliminary',
            label: 'Taxas Alfandegárias Preliminares',
            payees: ['Alfândega de Maputo', 'Kudumba', 'MCNET', 'MECTS'],
            description: 'Taxas preliminares de alfândega'
        },
        {
            value: 'legalization_advance',
            label: 'Adiantamento Legalização',
            payees: ['Despachante Oficial', 'Serviços Jurídicos'],
            description: 'Adiantamento para legalização de documentos'
        },
        {
            value: 'transport_fee',
            label: 'Taxa de Transporte',
            payees: ['Transportadora', 'Empresa de Logística'],
            description: 'Custos de transporte e manuseamento'
        },
        {
            value: 'other_coleta',
            label: 'Outras Despesas Coleta',
            payees: ['Fornecedor', 'Prestador de Serviços'],
            description: 'Outras despesas relacionadas à coleta'
        }
    ];

    // Estado para armazenar múltiplas solicitações
    const [requests, setRequests] = useState([
        {
            id: Date.now(),
            expense_type: '',
            payee: '',
            amount: '',
            currency: 'MZN',
            description: '',
            quotation_file: null,
        }
    ]);

    const [uploading, setUploading] = useState(false);
    const [errors, setErrors] = useState({});

    // ========================================
    // HANDLERS
    // ========================================

    // Adicionar nova solicitação
    const addRequest = () => {
        setRequests([
            ...requests,
            {
                id: Date.now(),
                expense_type: '',
                payee: '',
                amount: '',
                currency: 'MZN',
                description: '',
                quotation_file: null,
            }
        ]);
    };

    // Remover solicitação
    const removeRequest = (id) => {
        if (requests.length === 1) {
            alert('Deve haver pelo menos uma solicitação');
            return;
        }
        setRequests(requests.filter(req => req.id !== id));
    };

    // Atualizar campo de uma solicitação específica
    const updateRequest = (id, field, value) => {
        setRequests(requests.map(req => {
            if (req.id === id) {
                const updated = { ...req, [field]: value };

                // Auto-preencher payee e description quando expense_type muda
                if (field === 'expense_type') {
                    const expenseConfig = expenseTypes.find(t => t.value === value);
                    if (expenseConfig) {
                        updated.payee = expenseConfig.payees[0];
                        updated.description = expenseConfig.description;
                    }
                }

                return updated;
            }
            return req;
        }));
    };

    // Upload de arquivo
    const handleFileChange = (id, file) => {
        updateRequest(id, 'quotation_file', file);
    };

    // Validação e Submissão
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // Validar cada solicitação
        const validationErrors = {};
        let hasErrors = false;

        requests.forEach((req, index) => {
            if (!req.expense_type) {
                validationErrors[`${req.id}_expense_type`] = 'Selecione o tipo de despesa';
                hasErrors = true;
            }
            if (!req.payee) {
                validationErrors[`${req.id}_payee`] = 'Selecione o destinatário';
                hasErrors = true;
            }
            if (!req.amount || parseFloat(req.amount) <= 0) {
                validationErrors[`${req.id}_amount`] = 'Informe um valor válido';
                hasErrors = true;
            }
            if (!req.quotation_file) {
                validationErrors[`${req.id}_file`] = 'Anexe a cotação/documento';
                hasErrors = true;
            }
        });

        if (hasErrors) {
            setErrors(validationErrors);
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        setUploading(true);

        // Criar um FormData com todas as solicitações
        const formData = new FormData();
        formData.append('phase', phase);
        formData.append('shipment_id', shipment.id);
        formData.append('bulk_request', 'true');

        // Adicionar cada solicitação
        requests.forEach((req, index) => {
            formData.append(`requests[${index}][expense_type]`, req.expense_type);
            formData.append(`requests[${index}][payee]`, req.payee);
            formData.append(`requests[${index}][amount]`, req.amount);
            formData.append(`requests[${index}][currency]`, req.currency);
            formData.append(`requests[${index}][description]`, req.description);
            formData.append(`requests[${index}][quotation_document]`, req.quotation_file);
        });

        router.post(`/payment-requests/${shipment.id}/bulk`, formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                alert(`✅ ${requests.length} solicitação(ões) enviada(s) para aprovação!`);
                onClose();
            },
            onError: (errors) => {
                console.error('Erros:', errors);
                setErrors(errors);
                // console.log("formData",shipment.id)
                alert('❌ Erro ao enviar solicitações. Verifique os dados.');
            },
            onFinish: () => {
                setUploading(false);
            }
        });

    };

    // Obter configuração do tipo de despesa
    const getExpenseConfig = (expenseType) => {
        return expenseTypes.find(t => t.value === expenseType);
    };

    // ========================================
    // RENDER
    // ========================================

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-5xl my-8 overflow-hidden bg-white shadow-2xl rounded-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-blue-700 bg-gradient-to-r from-blue-600 to-blue-700">
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            Solicitação Múltipla de Orçamentos
                        </h2>
                        <p className="mt-1 text-sm text-blue-100">
                            {phaseName} - {shipment.reference_number}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={uploading}
                        className="p-2 text-white transition-colors rounded-lg hover:bg-white/20 disabled:opacity-50"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Info Alert */}
                    <div className="p-6 border-b border-slate-200">
                        <div className="flex gap-3 p-4 border border-blue-200 rounded-lg bg-blue-50">
                            <AlertCircle className="flex-shrink-0 w-5 h-5 text-blue-600" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium">Solicitação Múltipla</p>
                                <p className="mt-1">
                                    Você pode solicitar várias despesas de uma só vez.
                                    Todas as solicitações serão enviadas para aprovação do gestor.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Lista de Solicitações */}
                    <div className="max-h-[60vh] overflow-y-auto p-6 space-y-6">
                        {requests.map((request, index) => {
                            const expenseConfig = getExpenseConfig(request.expense_type);

                            return (
                                <div
                                    key={request.id}
                                    className="p-6 border-2 rounded-xl border-slate-200 bg-slate-50"
                                >
                                    {/* Header da Solicitação */}
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-slate-900">
                                            Solicitação #{index + 1}
                                        </h3>
                                        {requests.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeRequest(request.id)}
                                                className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {/* Tipo de Despesa */}
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-slate-700">
                                                Tipo de Despesa *
                                            </label>
                                            <div className="relative">
                                                <DollarSign className="absolute text-blue-600 transform -translate-y-1/2 left-3 top-1/2" />
                                                <select
                                                    value={request.expense_type}
                                                    onChange={(e) => updateRequest(request.id, 'expense_type', e.target.value)}
                                                    className="w-full py-3 pl-10 pr-4 transition-all border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    required
                                                >
                                                    <option value="">Selecione o tipo</option>
                                                    {expenseTypes.map(type => (
                                                        <option key={type.value} value={type.value}>
                                                            {type.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            {errors[`${request.id}_expense_type`] && (
                                                <p className="mt-1 text-xs text-red-600">
                                                    {errors[`${request.id}_expense_type`]}
                                                </p>
                                            )}
                                        </div>

                                        {/* Destinatário */}
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-slate-700">
                                                Destinatário do Pagamento *
                                            </label>
                                            <div className="relative">
                                                <Building2 className="absolute text-blue-600 transform -translate-y-1/2 left-3 top-1/2" />
                                                <select
                                                    value={request.payee}
                                                    onChange={(e) => updateRequest(request.id, 'payee', e.target.value)}
                                                    className="w-full py-3 pl-10 pr-4 transition-all border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    disabled={!request.expense_type}
                                                    required
                                                >
                                                    <option value="">Selecione o destinatário</option>
                                                    {expenseConfig?.payees.map(payee => (
                                                        <option key={payee} value={payee}>
                                                            {payee}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            {errors[`${request.id}_payee`] && (
                                                <p className="mt-1 text-xs text-red-600">
                                                    {errors[`${request.id}_payee`]}
                                                </p>
                                            )}
                                        </div>

                                        {/* Valor */}
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-slate-700">
                                                Valor *
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={request.amount}
                                                    onChange={(e) => updateRequest(request.id, 'amount', e.target.value)}
                                                    className="flex-1 px-4 py-3 transition-all border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="0.00"
                                                    required
                                                />
                                                <select
                                                    value={request.currency}
                                                    onChange={(e) => updateRequest(request.id, 'currency', e.target.value)}
                                                    className="px-4 py-3 transition-all border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="MZN">MZN</option>
                                                    <option value="USD">USD</option>
                                                    <option value="EUR">EUR</option>
                                                </select>
                                            </div>
                                            {errors[`${request.id}_amount`] && (
                                                <p className="mt-1 text-xs text-red-600">
                                                    {errors[`${request.id}_amount`]}
                                                </p>
                                            )}
                                        </div>

                                        {/* Upload de Documento */}
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-slate-700">
                                                Anexar Cotação/Documento *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    onChange={(e) => handleFileChange(request.id, e.target.files[0])}
                                                    className="hidden"
                                                    id={`file-${request.id}`}
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    required
                                                />
                                                <label
                                                    htmlFor={`file-${request.id}`}
                                                    className="flex items-center justify-center w-full gap-2 px-4 py-3 transition-all border-2 border-dashed rounded-lg cursor-pointer border-slate-300 hover:border-blue-500 hover:bg-blue-50"
                                                >
                                                    <Upload className="w-5 h-5 text-blue-600" />
                                                    <span className="text-sm font-medium text-slate-700">
                                                        {request.quotation_file
                                                            ? request.quotation_file.name
                                                            : 'Selecionar arquivo.'}
                                                    </span>
                                                </label>
                                            </div>
                                            {errors[`${request.id}_file`] && (
                                                <p className="mt-1 text-xs text-red-600">
                                                    {errors[`${request.id}_file`]}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Descrição */}
                                    <div className="mt-4">
                                        <label className="block mb-2 text-sm font-medium text-slate-700">
                                            Descrição/Observações
                                        </label>
                                        <textarea
                                            value={request.description}
                                            onChange={(e) => updateRequest(request.id, 'description', e.target.value)}
                                            rows="3"
                                            className="w-full px-4 py-3 transition-all border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Informações adicionais sobre esta despesa..."
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Botão Adicionar Nova Solicitação */}
                    <div className="px-6 pb-6">
                        <button
                            type="button"
                            onClick={addRequest}
                            disabled={uploading}
                            className="flex items-center justify-center w-full gap-2 px-4 py-3 font-medium text-blue-600 transition-all border-2 border-blue-300 border-dashed rounded-lg hover:bg-blue-50 hover:border-blue-500 disabled:opacity-50"
                        >
                            <Plus className="w-5 h-5" />
                            Adicionar Outra Solicitação
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 flex gap-3 p-6 border-t border-slate-200 bg-slate-50">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={uploading}
                            className="flex-1 px-6 py-3 font-medium transition-all border rounded-lg text-slate-700 border-slate-300 hover:bg-white disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="flex items-center justify-center flex-1 gap-2 px-6 py-3 font-medium text-white transition-all rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
                        >
                            {uploading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Enviar {requests.length} Solicitação(ões)
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
