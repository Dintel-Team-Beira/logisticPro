import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, File, X } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function FileUpload({ shipmentId, stage, onSuccess }) {
    const [uploading, setUploading] = useState(false);
    const [files, setFiles] = useState([]);

    const onDrop = useCallback((acceptedFiles) => {
        setFiles(acceptedFiles);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        },
        maxSize: 10485760 // 10MB
    });

    const handleUpload = async (type) => {
        if (files.length === 0) return;

        setUploading(true);

        const formData = new FormData();
        formData.append('file', files[0]);
        formData.append('type', type);
        formData.append('stage', stage);

        router.post(`/shipments/${shipmentId}/documents`, formData, {
            onSuccess: () => {
                setFiles([]);
                setUploading(false);
                if (onSuccess) onSuccess();
            },
            onError: () => {
                setUploading(false);
            }
        });
    };

    const documentTypes = {
        coleta_dispersa: [
            { value: 'invoice', label: 'Fatura' },
            { value: 'receipt', label: 'Recibo' },
            { value: 'pop', label: 'Comprovativo de Pagamento' }
        ],
        legalizacao: [
            { value: 'bl', label: 'BL' },
            { value: 'carta_endosso', label: 'Carta de Endosso' },
            { value: 'receipt', label: 'Recibo' }
        ],
        alfandegas: [
            { value: 'bl', label: 'BL Carimbado' },
            { value: 'packing_list', label: 'Packing List' },
            { value: 'invoice', label: 'Commercial Invoice' },
            { value: 'aviso', label: 'Aviso' },
            { value: 'autorizacao', label: 'Autorização' }
        ],
        cornelder: [
            { value: 'draft', label: 'Draft' },
            { value: 'storage', label: 'Storage' },
            { value: 'receipt', label: 'Recibo' }
        ],
        taxacao: [
            { value: 'sad', label: 'SAD (Transito)' },
            { value: 'termo', label: 'Termo da Linha' }
        ]
    };

    return (
        <div className="space-y-4">
            <motion.div
                {...getRootProps()}
                whileHover={{ scale: 1.01 }}
                className={`
                    border-2 border-dashed rounded-xl p-8
                    transition-all duration-200 cursor-pointer
                    ${isDragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400 bg-gray-50'
                    }
                `}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center text-center">
                    <Upload className={`h-12 w-12 mb-4 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                    <p className="text-lg font-medium text-gray-700">
                        {isDragActive ? 'Solte o arquivo aqui' : 'Arraste e solte um arquivo aqui'}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                        ou clique para selecionar (PDF, Imagens, Excel - máx 10MB)
                    </p>
                </div>
            </motion.div>

            {files.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-white border border-gray-200 rounded-xl"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <File className="w-8 h-8 text-blue-500" />
                            <div>
                                <p className="font-medium text-gray-900">{files[0].name}</p>
                                <p className="text-sm text-gray-500">
                                    {(files[0].size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setFiles([])}
                            className="text-gray-400 transition-colors hover:text-red-500"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Tipo de Documento
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {documentTypes[stage]?.map((type) => (
                                <motion.button
                                    key={type.value}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleUpload(type.value)}
                                    disabled={uploading}
                                    className="px-4 py-2 font-medium text-blue-700 transition-colors rounded-lg bg-blue-50 hover:bg-blue-100 disabled:opacity-50"
                                >
                                    {type.label}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
