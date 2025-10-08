import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import StatusBadge from '@/Components/StatusBadge';
import {
    Package,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    Ship,
    Calendar,
    MapPin,
    Anchor,
} from 'lucide-react';

export default function Index({ shipments, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/shipments', { search, status: selectedStatus }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (shipmentId) => {
        if (confirm('Tem certeza que deseja excluir este shipment?')) {
            router.delete(`/shipments/${shipmentId}`);
        }
    };

    return (
        <DashboardLayout>
            <Head title="Shipments" />

            <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Shipments
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Gerencie todos os seus shipments
                        </p>
                    </div>
                    <Link href="/shipments/create">
                        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors duration-200">
                            <Plus className="w-4 h-4" />
                            Novo Shipment
                        </button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="p-4 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Total</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-900">
                                    {shipments.total || 0}
                                </p>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-100">
                                <Package className="w-5 h-5 text-slate-600" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Em Progresso</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-900">15</p>
                            </div>
                            <div className="p-2 rounded-lg bg-blue-50">
                                <Ship className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Alfândegas</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-900">3</p>
                            </div>
                            <div className="p-2 rounded-lg bg-amber-50">
                                <Anchor className="w-5 h-5 text-amber-600" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Concluídos</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-900">8</p>
                            </div>
                            <div className="p-2 rounded-lg bg-emerald-50">
                                <Package className="w-5 h-5 text-emerald-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="p-4 bg-white border rounded-lg border-slate-200">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute w-4 h-4 -translate-y-1/2 text-slate-400 left-3 top-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar por referência, BL, container..."
                                className="w-full py-2.5 pl-10 pr-4 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                        >
                            <option value="">Todos os Status</option>
                            <option value="draft">Rascunho</option>
                            <option value="coleta_dispersa">Coleta</option>
                            <option value="legalizacao">Legalização</option>
                            <option value="alfandegas">Alfândegas</option>
                            <option value="cornelder">Cornelder</option>
                            <option value="taxacao">Taxação</option>
                            <option value="completed">Concluído</option>
                        </select>
                        <button
                            type="submit"
                            className="px-5 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            Filtrar
                        </button>
                    </form>
                </div>

                {/* Table */}
                <div className="overflow-hidden bg-white border rounded-lg border-slate-200">
                    <table className="w-full">
                        <thead className="border-b bg-slate-50 border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600">
                                    Referência
                                </th>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600">
                                    Linha de Navegação
                                </th>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600">
                                    BL / Container
                                </th>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600">
                                    Navio
                                </th>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600">
                                    ETA
                                </th>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-right uppercase text-slate-600">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {shipments.data && shipments.data.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-12 text-center">
                                        <Package className="w-12 h-12 mx-auto text-slate-300" />
                                        <h3 className="mt-2 text-sm font-medium text-slate-900">
                                            Nenhum shipment encontrado
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Comece criando um novo shipment
                                        </p>
                                        <Link href="/shipments/create">
                                            <button className="inline-flex items-center gap-2 px-4 py-2 mt-4 text-sm font-medium text-white rounded-lg bg-slate-900 hover:bg-slate-800">
                                                <Plus className="w-4 h-4" />
                                                Criar Shipment
                                            </button>
                                        </Link>
                                    </td>
                                </tr>
                            ) : (
                                shipments.data.map((shipment) => (
                                    <tr key={shipment.id} className="transition-colors hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                            {shipment.reference_number}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {shipment.shipping_line?.name || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs text-slate-500">BL:</span>
                                                    <span>{shipment.bl_number || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs text-slate-500">CNT:</span>
                                                    <span>{shipment.container_number || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {shipment.vessel_name || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={shipment.status} />
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {shipment.arrival_date || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/shipments/${shipment.id}`}>
                                                    <button
                                                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                                                        title="Ver detalhes"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                                <Link href={`/shipments/${shipment.id}/edit`}>
                                                    <button
                                                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(shipment.id)}
                                                    className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {shipments.links && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600">
                            Mostrando {shipments.from || 0} a {shipments.to || 0} de {shipments.total || 0} resultados
                        </p>
                        <div className="flex gap-1">
                            {shipments.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`
                                        px-3 py-1.5 text-sm rounded-md transition-colors
                                        ${link.active
                                            ? 'bg-slate-900 text-white'
                                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                                        }
                                        ${!link.url && 'opacity-50 cursor-not-allowed'}
                                    `}
                                    preserveState
                                    disabled={!link.url}
                                >
                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
