import { Head, Link, router } from '@inertiajs/react';
import ClientPortalLayout from '@/Layouts/ClientPortalLayout';
import { Package, Search, Filter, ChevronRight, Ship, Anchor, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function ShipmentsIndex({ shipments, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/client/shipments', {
            search: searchTerm,
            status: statusFilter !== 'all' ? statusFilter : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleStatusChange = (newStatus) => {
        setStatusFilter(newStatus);
        router.get('/client/shipments', {
            search: searchTerm || undefined,
            status: newStatus !== 'all' ? newStatus : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const statusOptions = [
        { value: 'all', label: 'Todos', count: null },
        { value: 'pending', label: 'Pendente', color: 'yellow' },
        { value: 'in_transit', label: 'Em Trânsito', color: 'blue' },
        { value: 'arrived', label: 'Chegou', color: 'green' },
        { value: 'completed', label: 'Concluído', color: 'gray' },
    ];

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        in_transit: 'bg-blue-100 text-blue-800',
        arrived: 'bg-green-100 text-green-800',
        completed: 'bg-gray-100 text-gray-800',
        cancelled: 'bg-red-100 text-red-800',
    };

    const typeIcons = {
        import: '📥',
        export: '📤',
    };

    return (
        <ClientPortalLayout>
            <Head title="Meus Processos" />

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Package className="h-8 w-8 text-[#358c9c]" />
                    <h1 className="text-3xl font-bold text-gray-900">Meus Processos</h1>
                </div>
                <p className="text-gray-600">Acompanhe todos os seus processos logísticos em tempo real</p>
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
                            placeholder="Buscar por número de referência..."
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#358c9c] focus:border-transparent"
                        />
                    </div>

                    {/* Search Button */}
                    <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-[#358c9c] to-[#246a77] text-white rounded-lg hover:shadow-lg transition-all font-medium"
                    >
                        Buscar
                    </button>
                </form>

                {/* Status Filters */}
                <div className="flex flex-wrap gap-2 mt-4">
                    {statusOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleStatusChange(option.value)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                statusFilter === option.value
                                    ? 'bg-[#358c9c] text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Shipments List */}
            <div className="space-y-4">
                {shipments.data.length > 0 ? (
                    shipments.data.map((shipment) => (
                        <Link key={shipment.id} href={`/client/shipments/${shipment.id}`}>
                            <motion.div
                                whileHover={{ x: 4 }}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-[#358c9c] transition-all"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    {/* Left Section */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-2xl">{typeIcons[shipment.type]}</span>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{shipment.reference_number}</h3>
                                                <p className="text-sm text-gray-500 capitalize">{shipment.type}</p>
                                            </div>
                                            <span className={`ml-auto lg:ml-0 px-3 py-1 rounded-full text-xs font-medium ${statusColors[shipment.status]}`}>
                                                {shipment.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Anchor className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <p className="text-gray-500 text-xs">Origem</p>
                                                    <p className="font-medium text-gray-900">{shipment.origin_port}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Ship className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <p className="text-gray-500 text-xs">Destino</p>
                                                    <p className="font-medium text-gray-900">{shipment.destination_port}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <p className="text-gray-500 text-xs">ETA</p>
                                                    <p className="font-medium text-gray-900">{shipment.estimated_arrival || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Section - Progress */}
                                    <div className="lg:w-64">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-gray-600">Progresso</span>
                                            <span className="text-sm font-bold text-[#358c9c]">{shipment.progress}%</span>
                                        </div>
                                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${shipment.progress}%` }}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                                className="h-full bg-gradient-to-r from-[#358c9c] to-[#246a77]"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-gray-500">{shipment.shipping_line || 'N/A'}</span>
                                            <ChevronRight className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum processo encontrado</h3>
                        <p className="text-gray-600">
                            {filters.search || filters.status !== 'all'
                                ? 'Tente ajustar os filtros de busca'
                                : 'Você ainda não possui processos logísticos'}
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {shipments.links && shipments.links.length > 3 && (
                <div className="mt-6 flex justify-center gap-2">
                    {shipments.links.map((link, index) => (
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
