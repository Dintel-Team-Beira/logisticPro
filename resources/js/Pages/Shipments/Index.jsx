import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/Components/Card';
import Badge from '@/Components/Badge';
import Input from '@/Components/Input';
import Button from '@/Components/Button';
import {
    Search,
    Filter,
    Package,
    Ship,
    Eye,
    Trash2,
    Plus,
    Download,
    MoreVertical,
    Edit,
    MapPin,
    Calendar
} from 'lucide-react';

export default function ShipmentsIndex({ auth, shipments, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/shipments', {
            search: searchTerm,
            status: statusFilter !== 'all' ? statusFilter : undefined
        }, {
            preserveState: true,
            replace: true
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            draft: { variant: 'default', label: 'Rascunho', icon: '📝' },
            coleta_dispersa: { variant: 'primary', label: 'Coleta', icon: '📦' },
            legalizacao: { variant: 'warning', label: 'Legalização', icon: '📄' },
            alfandegas: { variant: 'purple', label: 'Alfândegas', icon: '🏛️' },
            cornelder: { variant: 'indigo', label: 'Cornelder', icon: '🚢' },
            taxacao: { variant: 'warning', label: 'Taxação', icon: '💰' },
            completed: { variant: 'success', label: 'Concluído', icon: '✅' }
        };
        return badges[status] || badges.draft;
    };

    const handleDelete = (id) => {
        if (confirm('Tem certeza que deseja remover este shipment?')) {
            router.delete(`/shipments/${id}`);
        }
    };

    return (
        <DashboardLayout>
            <Head title="Shipments" />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex flex-col mb-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="flex items-center gap-3 mb-2 text-3xl font-bold text-gray-900 md:text-4xl">
                            <div className="p-3 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                                <Package className="w-8 h-8 text-white" />
                            </div>
                            Gestão de Shipments
                        </h1>
                        <p className="text-gray-600">
                            Gerencie todos os seus shipments de forma eficiente
                        </p>
                    </div>
                    <Link href="/shipments/create">
                        <Button variant="primary" size="lg" className="mt-4 md:mt-0">
                            <Plus className="w-5 h-5" />
                            Novo Shipment
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card>
                    <div className="p-6">
                        <form onSubmit={handleSearch} className="flex flex-col gap-4 lg:flex-row">
                            <div className="flex-1">
                                <Input
                                    icon={Search}
                                    placeholder="Buscar por referência, BL, container..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div className="w-full lg:w-64">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-[42px]"
                                >
                                    <option value="all">Todos os Status</option>
                                    <option value="draft">Rascunho</option>
                                    <option value="coleta_dispersa">Coleta de Dispersa</option>
                                    <option value="legalizacao">Legalização</option>
                                    <option value="alfandegas">Alfândegas</option>
                                    <option value="cornelder">Cornelder</option>
                                    <option value="taxacao">Taxação</option>
                                    <option value="completed">Concluído</option>
                                </select>
                            </div>
                            <Button type="submit" variant="primary">
                                <Filter className="w-5 h-5" />
                                Filtrar
                            </Button>
                        </form>
                    </div>
                </Card>
            </motion.div>

            {/* Shipments Grid/List */}
            <AnimatePresence mode="wait">
                {shipments.data.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <Card className="py-20 text-center">
                            <div className="inline-flex p-6 mb-6 bg-gray-100 rounded-full">
                                <Ship className="w-16 h-16 text-gray-400" />
                            </div>
                            <h3 className="mb-3 text-2xl font-bold text-gray-900">
                                Nenhum shipment encontrado
                            </h3>
                            <p className="max-w-md mx-auto mb-8 text-gray-600">
                                Comece criando seu primeiro shipment para gerenciar suas operações de importação
                            </p>
                            <Link href="/shipments/create">
                                <Button variant="primary" size="lg">
                                    <Plus className="w-5 h-5" />
                                    Criar Primeiro Shipment
                                </Button>
                            </Link>
                        </Card>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {shipments.data.map((shipment, index) => (
                            <motion.div
                                key={shipment.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="transition-all duration-300 hover:shadow-2xl group">
                                    <div className="p-6">
                                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                                            {/* Left: Icon & Main Info */}
                                            <div className="flex items-start flex-1 gap-4">
                                                <div className="p-4 transition-transform duration-300 transform shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl group-hover:scale-110">
                                                    <Ship className="w-8 h-8 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Link
                                                            href={`/shipments/${shipment.id}`}
                                                            className="text-xl font-bold text-gray-900 transition-colors hover:text-blue-600"
                                                        >
                                                            {shipment.reference_number}
                                                        </Link>
                                                        <Badge
                                                            variant={getStatusBadge(shipment.status).variant}
                                                            className="px-3 py-1 text-xs"
                                                        >
                                                            {getStatusBadge(shipment.status).icon} {getStatusBadge(shipment.status).label}
                                                        </Badge>
                                                    </div>
                                                    <p className="mb-3 text-sm font-medium text-gray-600">
                                                        {shipment.shipping_line?.name}
                                                    </p>

                                                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                                        <InfoPill
                                                            icon={Package}
                                                            label="Container"
                                                            value={shipment.container_number || '-'}
                                                        />
                                                        <InfoPill
                                                            icon={FileText}
                                                            label="BL"
                                                            value={shipment.bl_number || '-'}
                                                        />
                                                        <InfoPill
                                                            icon={Ship}
                                                            label="Navio"
                                                            value={shipment.vessel_name || '-'}
                                                        />
                                                        <InfoPill
                                                            icon={Calendar}
                                                            label="Chegada"
                                                            value={shipment.arrival_date ? new Date(shipment.arrival_date).toLocaleDateString('pt-BR') : '-'}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Progress & Actions */}
                                            <div className="lg:w-80">
                                                {/* Progress */}
                                                <div className="mb-4">
                                                    <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
                                                        <span className="font-medium">Progresso do Processo</span>
                                                        <span className="font-bold">
                                                            {shipment.stages?.filter(s => s.status === 'completed').length || 0} de 5
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-3 overflow-hidden bg-gray-200 rounded-full">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{
                                                                width: `${((shipment.stages?.filter(s => s.status === 'completed').length || 0) / 5) * 100}%`
                                                            }}
                                                            transition={{ duration: 1, ease: "easeOut" }}
                                                            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    <Link href={`/shipments/${shipment.id}`} className="flex-1">
                                                        <Button variant="primary" size="sm" className="w-full">
                                                            <Eye className="w-4 h-4" />
                                                            Ver Detalhes
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleDelete(shipment.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>

                                                <div className="mt-3 text-xs text-center text-gray-500">
                                                    Criado em {new Date(shipment.created_at).toLocaleDateString('pt-BR')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Pagination */}
            {shipments.data.length > 0 && shipments.links.length > 3 && (
                <div className="flex justify-center mt-8">
                    <div className="flex gap-2">
                        {shipments.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                preserveState
                                className={`
                                    px-4 py-2 rounded-xl font-medium transition-all
                                    ${link.active
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                    }
                                    ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

function InfoPill({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
            <Icon className="flex-shrink-0 w-4 h-4 text-gray-400" />
            <div className="min-w-0">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
            </div>
        </div>
    );
}
