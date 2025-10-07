import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    Ship,
    Plus,
    Search,
    Edit,
    Eye,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Mail,
    Phone,
    MapPin,
    Package,
    CheckCircle2,
    XCircle,
} from 'lucide-react';

export default function Index({ shippingLines }) {
    const [search, setSearch] = useState('');

    const filteredLines = shippingLines.filter(line =>
        line.name.toLowerCase().includes(search.toLowerCase()) ||
        line.code.toLowerCase().includes(search.toLowerCase())
    );

    const handleToggleStatus = (lineId) => {
        if (confirm('Tem certeza que deseja alterar o status desta linha?')) {
            router.patch(`/shipping-lines/${lineId}/toggle-status`);
        }
    };

    const handleDelete = (lineId) => {
        if (confirm('Tem certeza que deseja remover esta linha de navegação?')) {
            router.delete(`/shipping-lines/${lineId}`);
        }
    };

    return (
        <DashboardLayout>
            <Head title="Linhas de Navegação" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Linhas de Navegação
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Gerencie as companhias de navegação marítima
                        </p>
                    </div>
                    <Link href="/shipping-lines/create">
                        <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700">
                            <Plus className="w-4 h-4" />
                            Nova Linha
                        </button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="p-4 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Total</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-900">
                                    {shippingLines.length}
                                </p>
                            </div>
                            <Ship className="w-8 h-8 text-slate-400" />
                        </div>
                    </div>

                    <div className="p-4 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Ativas</p>
                                <p className="mt-1 text-2xl font-semibold text-emerald-600">
                                    {shippingLines.filter(l => l.active).length}
                                </p>
                            </div>
                            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        </div>
                    </div>

                    <div className="p-4 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Inativas</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-400">
                                    {shippingLines.filter(l => !l.active).length}
                                </p>
                            </div>
                            <XCircle className="w-8 h-8 text-slate-300" />
                        </div>
                    </div>

                    <div className="p-4 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Total Shipments</p>
                                <p className="mt-1 text-2xl font-semibold text-blue-600">
                                    {shippingLines.reduce((sum, l) => sum + (l.shipments_count || 0), 0)}
                                </p>
                            </div>
                            <Package className="w-8 h-8 text-blue-400" />
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="p-4 bg-white border rounded-lg border-slate-200">
                    <div className="relative">
                        <Search className="absolute w-4 h-4 -translate-y-1/2 text-slate-400 left-3 top-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por nome ou código..."
                            className="w-full py-2.5 pl-10 pr-4 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Shipping Lines Grid */}
                {filteredLines.length === 0 ? (
                    <div className="p-12 text-center bg-white border rounded-lg border-slate-200">
                        <Ship className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <h3 className="mb-1 text-sm font-medium text-slate-900">
                            Nenhuma linha encontrada
                        </h3>
                        <p className="text-sm text-slate-500">
                            {search ? 'Tente uma busca diferente' : 'Comece criando uma nova linha de navegação'}
                        </p>
                        {!search && (
                            <Link href="/shipping-lines/create">
                                <button className="inline-flex items-center gap-2 px-4 py-2 mt-4 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700">
                                    <Plus className="w-4 h-4" />
                                    Nova Linha
                                </button>
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredLines.map((line) => (
                            <div
                                key={line.id}
                                className="relative p-6 transition-all bg-white border rounded-lg border-slate-200 hover:shadow-md group"
                            >
                                {/* Status Badge */}
                                <div className="absolute top-4 right-4">
                                    <span className={`
                                        px-2 py-1 text-xs font-medium rounded-full
                                        ${line.active
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-slate-100 text-slate-600'
                                        }
                                    `}>
                                        {line.active ? 'Ativa' : 'Inativa'}
                                    </span>
                                </div>

                                {/* Header */}
                                <div className="mb-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-50">
                                            <Ship className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-slate-900">
                                                {line.name}
                                            </h3>
                                            <p className="text-sm text-slate-500">
                                                Código: {line.code}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="mb-4 space-y-2">
                                    {line.email && (
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Mail className="w-4 h-4 text-slate-400" />
                                            <span className="truncate">{line.email}</span>
                                        </div>
                                    )}
                                    {line.phone && (
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Phone className="w-4 h-4 text-slate-400" />
                                            <span>{line.phone}</span>
                                        </div>
                                    )}
                                    {line.address && (
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <MapPin className="w-4 h-4 text-slate-400" />
                                            <span className="truncate">{line.address}</span>
                                        </div>
                                    )}
                                    {line.contact_person && (
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Ship className="w-4 h-4 text-slate-400" />
                                            <span>Contato: {line.contact_person}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="pt-4 mb-4 border-t border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-500">Shipments</span>
                                        <span className="text-lg font-semibold text-blue-600">
                                            {line.shipments_count || 0}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Link
                                        href={`/shipping-lines/${line.id}`}
                                        className="flex-1"
                                    >
                                        <button className="w-full px-3 py-2 text-sm font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50">
                                            <Eye className="inline-block w-4 h-4 mr-1" />
                                            Ver
                                        </button>
                                    </Link>

                                    <Link
                                        href={`/shipping-lines/${line.id}/edit`}
                                        className="flex-1"
                                    >
                                        <button className="w-full px-3 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700">
                                            <Edit className="inline-block w-4 h-4 mr-1" />
                                            Editar
                                        </button>
                                    </Link>

                                    <button
                                        onClick={() => handleToggleStatus(line.id)}
                                        className="px-3 py-2 transition-colors border rounded-lg text-slate-600 border-slate-300 hover:bg-slate-50"
                                        title={line.active ? 'Desativar' : 'Ativar'}
                                    >
                                        {line.active ? (
                                            <ToggleRight className="w-4 h-4 text-emerald-600" />
                                        ) : (
                                            <ToggleLeft className="w-4 h-4 text-slate-400" />
                                        )}
                                    </button>

                                    <button
                                        onClick={() => handleDelete(line.id)}
                                        className="px-3 py-2 text-red-600 transition-colors border border-red-300 rounded-lg hover:bg-red-50"
                                        title="Remover"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
