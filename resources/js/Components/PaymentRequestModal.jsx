import { useState } from 'react';
import { router } from '@inertiajs/react';
import { X, Upload, FileText, DollarSign, AlertCircle, Loader2 } from 'lucide-react';

export default function PaymentRequestModal({ shipment, phase, phaseName, onClose }) {
    const [formData, setFormData] = useState({
        description: '',
        estimated_amount: '',
        quotation_file: null,
    });
    const [errors, setErrors] = useState({});
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            // Validar tamanho (máx 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setErrors({ ...errors, quotation_file: 'Arquivo muito grande. Máximo 10MB.' });
                return;
            }

            // Validar tipo
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
            if (!allowedTypes.includes(file.type)) {
                setErrors({ ...errors, quotation_file: 'Tipo de arquivo não permitido. Use PDF, JPG ou PNG.' });
                return;
            }

            setFormData({ ...formData, quotation_file: file });
            setErrors({ ...errors, quotation_file: null });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validação
        const newErrors = {};
        if (!formData.description.trim()) {
            newErrors.description = 'Descrição é obrigatória';
        }
        if (!formData.estimated_amount) {
            newErrors.estimated_amount = 'Valor estimado é obrigatório';
        }
        if (!formData.quotation_file) {
            newErrors.quotation_file = 'Anexe a cotação do fornecedor';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setUploading(true);

        const data = new FormData();
        data.append('phase', phase);
        data.append('description', formData.description);
        data.append('estimated_amount', formData.estimated_amount);
        data.append('quotation_file', formData.quotation_file);

        router.post(`/payment-requests/${shipment.id}`, data, {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
            },
            onError: (errors) => {
                setErrors(errors);
                setUploading(false);
            },
            onFinish: () => {
                setUploading(false);
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl overflow-hidden bg-white shadow-2xl rounded-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-blue-700 bg-gradient-to-r from-blue-600 to-blue-700">
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            Solicitar Orçamento
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Info Alert */}
                    <div className="flex gap-3 p-4 border border-blue-200 rounded-lg bg-blue-50">
                        <AlertCircle className="flex-shrink-0 w-5 h-5 text-blue-600" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium">Atenção!</p>
                            <p className="mt-1">
                                Esta solicitação será enviada para aprovação do gestor antes do pagamento.
                            </p>
                        </div>
                    </div>

                    {/* Descrição */}
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-slate-700">
                            Descrição do Serviço/Produto *
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Ex: Taxas alfandegárias, transporte terrestre, armazenamento..."
                            rows={4}
                            disabled={uploading}
                            className={`
                                w-full px-4 py-3 border rounded-lg resize-none
                                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                disabled:bg-slate-50 disabled:cursor-not-allowed
                                ${errors.description ? 'border-red-300 bg-red-50' : 'border-slate-300'}
                            `}
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                        )}
                    </div>

                    {/* Valor Estimado */}
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-slate-700">
                            Valor Estimado (USD) *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <DollarSign className="w-5 h-5 text-slate-400" />
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.estimated_amount}
                                onChange={(e) => setFormData({ ...formData, estimated_amount: e.target.value })}
                                placeholder="0.00"
                                disabled={uploading}
                                className={`
                                    w-full py-3 pl-12 pr-4 border rounded-lg
                                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                    disabled:bg-slate-50 disabled:cursor-not-allowed
                                    ${errors.estimated_amount ? 'border-red-300 bg-red-50' : 'border-slate-300'}
                                `}
                            />
                        </div>
                        {errors.estimated_amount && (
                            <p className="mt-1 text-sm text-red-600">{errors.estimated_amount}</p>
                        )}
                    </div>

                    {/* Upload de Cotação */}
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-slate-700">
                            Anexar Cotação do Fornecedor *
                        </label>
                        <label
                            className={`
                                block p-8 text-center transition-all border-2 border-dashed rounded-lg cursor-pointer
                                ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500 hover:bg-blue-50'}
                                ${errors.quotation_file ? 'border-red-300 bg-red-50' : 'border-slate-300'}
                                ${formData.quotation_file ? 'border-green-500 bg-green-50' : ''}
                            `}
                        >
                            <input
                                type="file"
                                onChange={handleFileChange}
                                disabled={uploading}
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                            />
                            <div className="flex flex-col items-center gap-2">
                                <Upload className={`w-10 h-10 ${formData.quotation_file ? 'text-green-600' : 'text-slate-400'}`} />
                                <p className={`text-sm font-medium ${formData.quotation_file ? 'text-green-700' : 'text-slate-600'}`}>
                                    {formData.quotation_file ? 'Arquivo selecionado!' : 'Clique ou arraste para fazer upload'}
                                </p>
                                <p className="text-xs text-slate-500">
                                    PDF, JPG ou PNG (máx. 10MB)
                                </p>
                            </div>
                        </label>

                        {/* Preview do arquivo */}
                        {formData.quotation_file && (
                            <div className="flex items-center gap-3 p-4 mt-3 border border-green-200 rounded-lg bg-green-50">
                                <FileText className="w-6 h-6 text-green-600" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-green-900 truncate">
                                        {formData.quotation_file.name}
                                    </p>
                                    <p className="text-xs text-green-700">
                                        {(formData.quotation_file.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, quotation_file: null })}
                                    disabled={uploading}
                                    className="p-1 text-green-700 transition-colors rounded hover:bg-green-200 disabled:opacity-50"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {errors.quotation_file && (
                            <p className="mt-1 text-sm text-red-600">{errors.quotation_file}</p>
                        )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={uploading}
                            className="flex-1 px-6 py-3 font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="flex items-center justify-center flex-1 gap-2 px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
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
