import { Head, Link, router } from '@inertiajs/react';
import ClientPortalLayout from '@/Layouts/ClientPortalLayout';
import { FileText, Search, Download, Package, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function DocumentsIndex({ documents, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/client/documents', {
            search: searchTerm,
            type: typeFilter !== 'all' ? typeFilter : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleTypeChange = (newType) => {
        setTypeFilter(newType);
        router.get('/client/documents', {
            search: searchTerm || undefined,
            type: newType !== 'all' ? newType : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const typeOptions = [
        { value: 'all', label: 'Todos os Documentos' },
        { value: 'commercial_invoice', label: 'Fatura Comercial' },
        { value: 'packing_list', label: 'Packing List' },
        { value: 'bill_of_lading', label: 'Bill of Lading' },
        { value: 'certificate_origin', label: 'Certificado de Origem' },
        { value: 'customs', label: 'Documentos Aduaneiros' },
        { value: 'other', label: 'Outros' },
    ];

    const getDocumentIcon = (type) => {
        const icons = {
            commercial_invoice: '💰',
            packing_list: '📦',
            bill_of_lading: '🚢',
            certificate_origin: '📜',
            customs: '🛃',
            other: '📄',
        };
        return icons[type] || '📄';
    };

    const getDocumentTypeLabel = (type) => {
        const option = typeOptions.find(opt => opt.value === type);
        return option ? option.label : type;
    };

    return (
        <ClientPortalLayout>
            <Head title="Documentos" />

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-8 w-8 text-[#358c9c]" />
                    <h1 className="text-3xl font-bold text-gray-900">Meus Documentos</h1>
                </div>
                <p className="text-gray-600">Acesse e faça download de todos os seus documentos</p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar documentos..."
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#358c9c] focus:border-transparent"
                        />
                    </div>

                    {/* Type Filter */}
                    <select
                        value={typeFilter}
                        onChange={(e) => handleTypeChange(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#358c9c] focus:border-transparent"
                    >
                        {typeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {/* Search Button */}
                    <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-[#358c9c] to-[#246a77] text-white rounded-lg hover:shadow-lg transition-all font-medium"
                    >
                        Buscar
                    </button>
                </form>
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.data.length > 0 ? (
                    documents.data.map((doc) => (
                        <motion.div
                            key={doc.id}
                            whileHover={{ y: -4 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-[#358c9c] transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{getDocumentIcon(doc.type)}</span>
                                    <div>
                                        <span className="text-xs font-medium text-[#358c9c] uppercase tracking-wide">
                                            {getDocumentTypeLabel(doc.type)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                {doc.name}
                            </h3>

                            {doc.shipment_reference && (
                                <Link
                                    href={`/client/shipments/${doc.shipment_id}`}
                                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#358c9c] mb-3"
                                >
                                    <Package className="h-4 w-4" />
                                    <span>{doc.shipment_reference}</span>
                                </Link>
                            )}

                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                                <Calendar className="h-3 w-3" />
                                <span>{doc.uploaded_at}</span>
                            </div>

                            <a
                                href={`/client/documents/${doc.id}/download`}
                                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gradient-to-r from-[#358c9c] to-[#246a77] text-white rounded-lg hover:shadow-lg transition-all font-medium"
                            >
                                <Download className="h-4 w-4" />
                                Download
                            </a>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum documento encontrado</h3>
                        <p className="text-gray-600">
                            {filters.search || filters.type !== 'all'
                                ? 'Tente ajustar os filtros de busca'
                                : 'Você ainda não possui documentos disponíveis'}
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {documents.links && documents.links.length > 3 && (
                <div className="mt-6 flex justify-center gap-2">
                    {documents.links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.url || '#'}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                link.active
                                    ? 'bg-[#358c9c] text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                            } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </ClientPortalLayout>
    );
}
