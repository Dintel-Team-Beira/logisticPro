import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { router } from '@inertiajs/react';

const PaymentReceiptModal = ({
    paymentRequest,
    onClose
}) => {
    const [file, setFile] = useState(null);
    const [notes, setNotes] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        // Validações de arquivo
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/jpg'
        ];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!allowedTypes.includes(selectedFile.type)) {
            setError('Tipo de arquivo não permitido. Aceite PDF ou imagens.');
            return;
        }

        if (selectedFile.size > maxSize) {
            setError('Arquivo muito grande. Máximo 10MB.');
            return;
        }

        setFile(selectedFile);
        setError(null);
    };

    const handleSubmit = () => {
        if (!file) {
            setError('Selecione um arquivo de recibo');
            return;
        }

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('receipt', file);
        formData.append('notes', notes);
        formData.append('payment_requests_id', paymentRequest.id);
        formData.append('shimpment_id', paymentRequest.shipment_id);

        router.post( route('payment-requests.attach-receipt', paymentRequest.id),
            formData,
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    // Fechamento do modal após sucesso
                    onClose();
                },
                onError: (errors) => {
                    // Tratamento de erros
                    setError(
                        errors.receipt
                        || errors.message
                        || 'Erro ao anexar recibo'
                    );
                    setUploading(false);
                }
            }
        );
    };

    return (
        <div
            className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'
            onClick={onClose}
        >
            <div
                className='w-full max-w-lg bg-white rounded-lg shadow-2xl'
                onClick={e => e.stopPropagation()}
            >
                {/* Cabeçalho */}
                <div className='flex items-center justify-between p-6 border-b border-slate-200'>
                    <div>
                        <h2 className='text-xl font-bold text-slate-900'>
                            Anexar Recibo de Pagamento
                        </h2>
                        <p className='mt-1 text-sm text-slate-600'>
                            Solicitação #{paymentRequest.id}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className='p-2 rounded-lg hover:bg-slate-100'
                    >
                        <X className='w-5 h-5' />
                    </button>
                </div>

                {/* Corpo do Modal */}
                <div className='p-6 space-y-4'>
                    {/* Exibição de Erros */}
                    {error && (
                        <div className='p-3 text-red-800 border border-red-300 rounded-lg bg-red-50'>
                            {error}
                        </div>
                    )}

                    {/* Input de Arquivo */}
                    <div>
                        <label className='block mb-2 text-sm font-medium text-slate-900'>
                            Selecionar Arquivo de Recibo
                        </label>
                        <input
                            type='file'
                            onChange={handleFileChange}
                            className='w-full px-4 py-2 border rounded-lg border-slate-300'
                            accept='.pdf,.jpg,.jpeg,.png'
                        />
                        <p className='mt-1 text-xs text-slate-500'>
                            Formatos aceitos: PDF, JPG, PNG (máx. 10MB)
                        </p>
                    </div>

                    {/* Preview do Arquivo */}
                    {file && (
                        <div className='flex items-center justify-between p-3 rounded-lg bg-slate-100'>
                            <div>
                                <p className='text-sm font-medium'>{file.name}</p>
                                <p className='text-xs text-slate-600'>
                                    {(file.size / 1024).toFixed(2)} KB
                                </p>
                            </div>
                            <button
                                onClick={() => setFile(null)}
                                className='p-1 text-red-500 rounded hover:bg-red-100'
                            >
                                <X className='w-4 h-4' />
                            </button>
                        </div>
                    )}

                    {/* Área de Observações */}
                    <div>
                        <label className='block mb-2 text-sm font-medium text-slate-900'>
                            Observações (Opcional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={3}
                            className='w-full px-4 py-2 border rounded-lg border-slate-300'
                            placeholder='Adicione observações sobre o recibo...'
                        />
                    </div>
                </div>

                {/* Rodapé com Botões */}
                <div className='flex gap-3 p-6 border-t border-slate-200'>
                    <button
                        onClick={onClose}
                        disabled={uploading}
                        className='flex-1 px-4 py-2 border rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50'
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!file || uploading}
                        className='flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50'
                    >
                        {uploading ? 'Enviando...' : 'Anexar Recibo'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function AttachReceiptButton({ request }) {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <button
                className='flex items-center gap-2 p-5 px-3 py-1 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700'
                onClick={() => setShowModal(true)}
            >
                <Upload className='w-10 h-7' />
                Anexar Recibo de pagamento
            </button>

            {showModal && (
                <PaymentReceiptModal
                    paymentRequest={request}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
}
