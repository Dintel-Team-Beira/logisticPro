import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    Plus, Search, Filter, Eye, Edit2, Trash2,
    Ship, Package, Clock, CheckCircle2, AlertCircle,
    TrendingUp, Globe, ArrowRight, MapPin, Truck, Navigation,
    Check, DollarSign, Download
} from 'lucide-react';

export default function Index({ shipments, filters }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/shipments', { search, status: statusFilter, type: typeFilter }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('');
        setTypeFilter('');
        router.get('/shipments', {}, {
            preserveState: true,
        });
    };

    const handleDelete = (shipment) => {
        if (confirm(`Deletar processo ${shipment.reference_number}?`)) {
            router.delete(`/shipments/${shipment.id}`, {
                onSuccess: () => alert('Processo deletado!'),
            });
        }
    };

    // Redirecionar para a tela correta baseado no tipo
    const handleViewDetails = (shipment) => {
        switch (shipment.type) {
            case 'export':
                router.visit(`/operations/export/preparacao/${shipment.id}`);
                break;
            case 'transit':
                router.visit(`/operations/transit/recepcao`);
                break;
            case 'transport':
                router.visit(`/operations/transport/coleta`);
                break;
            default: // import
                router.visit(`/shipments/${shipment.id}`);
        }
    };

    const getPhaseColor = (phase) => {
        const colors = {
            1: 'bg-blue-100 text-blue-700',
            2: 'bg-purple-100 text-purple-700',
            3: 'bg-amber-100 text-amber-700',
            4: 'bg-cyan-100 text-cyan-700',
            5: 'bg-indigo-100 text-indigo-700',
            6: 'bg-green-100 text-green-700',
            7: 'bg-emerald-100 text-emerald-700',
        };
        return colors[phase] || 'bg-slate-100 text-slate-700';
    };

    const getPhaseName = (shipment, phase) => {
        switch (shipment.type) {
            case 'export':
                const exportNames = {
                    1: 'Prep. Documentos',
                    2: 'Booking',
                    3: 'Inspeção',
                    4: 'Despacho',
                    5: 'Transporte',
                    6: 'Embarque',
                    7: 'Acompanhamento',
                };
                return exportNames[phase] || 'Fase ' + phase;

            case 'transit':
                const transitNames = {
                    1: 'Recepção',
                    2: 'Documentação',
                    3: 'Desembaraço',
                    4: 'Armazenamento',
                    5: 'Prep. Partida',
                    6: 'Transp. Saída',
                    7: 'Acompanhamento',
                };
                return transitNames[phase] || 'Fase ' + phase;

            case 'transport':
                const transportNames = {
                    1: 'Coleta',
                    2: 'Entrega',
                };
                return transportNames[phase] || 'Fase ' + phase;

            default: // import
                const importNames = {
                    1: 'Coleta Dispersa',
                    2: 'Legalização',
                    3: 'Alfândegas',
                    4: 'Cornelder',
                    5: 'Taxação',
                    6: 'Faturação',
                    7: 'POD',
                };
                return importNames[phase] || 'Fase ' + phase;
        }
    };


    // nova cores
const getStageColor = (stageKey) => {
    const colors = {
        // Export
        preparacao_documentos:    'bg-blue-100 text-blue-800',
        booking:                  'bg-purple-100 text-purple-800',
        inspecao_certificacao:    'bg-amber-100 text-amber-800',
        despacho_aduaneiro:       'bg-cyan-100 text-cyan-800',
        transporte_porto:         'bg-indigo-100 text-indigo-800',
        embarque:                 'bg-green-100 text-green-800',
        acompanhamento:           'bg-emerald-100 text-emerald-800',

        // Transit
        recepcao:                 'bg-teal-100 text-teal-800',
        documentacao:             'bg-sky-100 text-sky-800',
        desembaraco:              'bg-orange-100 text-orange-800',
        armazenamento:            'bg-yellow-100 text-yellow-800',
        preparacao_partida:       'bg-lime-100 text-lime-800',
        transporte_saida:         'bg-rose-100 text-rose-800',

        // Transport
        coleta:                   'bg-pink-100 text-pink-800',
        entrega:                  'bg-red-100 text-red-800',

        // Import
        coleta_dispersa:          'bg-orange-100 text-orange-800',
        legalizacao:              'bg-pink-100 text-pink-800',
        alfandegas:               'bg-red-100 text-red-800',
        cornelder:                'bg-yellow-100 text-yellow-800',
        taxacao:                  'bg-lime-100 text-lime-800',
        faturacao:                'bg-rose-100 text-rose-800',
        pod:                      'bg-sky-100 text-sky-800',
    };
    return colors[stageKey] || 'bg-slate-100 text-slate-700';
};

const getStageLabel = (stageKey) => {
    const labels = {
        preparacao_documentos: 'Documentos',
        booking: 'Booking',
        inspecao_certificacao: 'Inspeção',
        despacho_aduaneiro: 'Despacho',
        transporte_porto: 'Transporte',
        embarque: 'Embarque',
        acompanhamento: 'Acompanhamento',

        recepcao: 'Recepção',
        documentacao: 'Documentação',
        desembaraco: 'Desembaraço',
        armazenamento: 'Armazenamento',
        preparacao_partida: 'Prep. Partida',
        transporte_saida: 'Transp. Saída',

        coleta: 'Coleta',
        entrega: 'Entrega',

        coleta_dispersa: 'Coleta',
        legalizacao: 'Legalização',
        alfandegas: 'Alfândegas',
        cornelder: 'Cornelder',
        taxacao: 'Taxação',
        faturacao: 'Faturação',
        pod: 'POD',
    };
    return labels[stageKey] || stageKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

    // Calcular estatísticas
    const importCount = shipments.data?.filter(s => s.type === 'import' || !s.type).length || 0;
    const exportCount = shipments.data?.filter(s => s.type === 'export').length || 0;
    const transitCount = shipments.data?.filter(s => s.type === 'transit').length || 0;
    const transportCount = shipments.data?.filter(s => s.type === 'transport').length || 0;

    return (
        <DashboardLayout>
            <Head title="Processos Logísticos" />

            <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Processos Logísticos
                        </h1>
                        <p className="text-sm text-slate-500">
                            Gerencie processos de importação, exportação, trânsito e transporte
                        </p>
                    </div>
                    <Link
                        href="/shipments/create"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
                    >
                        <Plus className="w-5 h-5" />
                        Novo Processo
                    </Link>
                </div>

                {/* Filtros */}
                <div className="p-6 bg-white border rounded-xl border-slate-200">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        {/* Busca */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar por referência, BL, container, cliente..."
                                    className="w-full py-2 pl-10 pr-4 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Tipo Filter */}
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Todos os Tipos</option>
                            <option value="import">📦 Importação</option>
                            <option value="export">🚢 Exportação</option>
                            <option value="transit">🔄 Trânsito</option>
                            <option value="transport">🚚 Transporte</option>
                        </select>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Todos os Status</option>
                            <option value="active">Ativo</option>
                            <option value="completed">Completado</option>
                            <option value="blocked">Bloqueado</option>
                        </select>

                        {/* Botões */}
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            <Filter className="w-5 h-5" />
                        </button>

                        {(search || statusFilter || typeFilter) && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="px-4 py-2 text-sm font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
                            >
                                Limpar
                            </button>
                        )}
                    </form>
                </div>

                {/* Estatísticas Rápidas */}
                <div className="grid grid-cols-6 gap-4">
                    <StatCard
                        title="Total Processos"
                        value={shipments.total}
                        icon={Package}
                        color="blue"
                    />
                    <StatCard
                        title="Importações"
                        value={importCount}
                        icon={Ship}
                        color="blue"
                        badge="📦"
                    />
                    <StatCard
                        title="Exportações"
                        value={exportCount}
                        icon={TrendingUp}
                        color="emerald"
                        badge="🚢"
                    />
                    <StatCard
                        title="Trânsitos"
                        value={transitCount}
                        icon={Navigation}
                        color="amber"
                        badge="🔄"
                    />
                    <StatCard
                        title="Transportes"
                        value={transportCount}
                        icon={Truck}
                        color="blue"
                        badge="🚚"
                    />
                    <StatCard
                        title="Completados"
                        value={shipments.data?.filter(s => s.status === 'completed').length || 0}
                        icon={CheckCircle2}
                        color="green"
                    />
                </div>

                {/* Tabela */}
                <div className="overflow-hidden bg-white border rounded-xl border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                                        Referência / Tipo
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                                        Cliente
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                                        Rota
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                                        Container / BL
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                                        Fase Atual
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                                        Linha
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase text-slate-500">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">

                                {shipments.data && shipments.data.length > 0 ? (

                                    shipments.data.map((shipment) => (

                                        <tr
                                            key={shipment.id}
                                            className="transition-colors hover:bg-slate-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {shipment.type === 'export' ? (
                                                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                                                    ) : shipment.type === 'transit' ? (
                                                        <Navigation className="w-5 h-5 text-amber-600" />
                                                    ) : shipment.type === 'transport' ? (
                                                        <Truck className="w-5 h-5 text-purple-600" />
                                                    ) : (
                                                        <Ship className="w-5 h-5 text-blue-600" />
                                                    )}
                                                    <div>
                                                        <Link
                                                            href={`/shipments/${shipment.id}`}
                                                            className="font-medium text-blue-600 hover:text-blue-700"
                                                        >
                                                            {shipment.reference_number}
                                                        </Link>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {shipment.type === 'export' ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full">
                                                                    🚢 Exportação
                                                                </span>
                                                            ) : shipment.type === 'transit' ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-amber-700 bg-amber-100 rounded-full">
                                                                    🔄 Trânsito
                                                                </span>
                                                            ) : shipment.type === 'transport' ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full">
                                                                    🚚 Transporte
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                                                                    📦 Importação
                                                                </span>
                                                            )}

                                                            {/* Indicador de Cotação - Só para Admin e Finance */}
                                                            {shipment.quotation_reference && (auth.user.role === 'admin' || auth.user.role === 'finance') && (
                                                                <span
                                                                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-green-700 bg-green-100 rounded-full"
                                                                    title={`Cotação: ${shipment.quotation_reference}`}
                                                                >
                                                                    <DollarSign className="w-3 h-3" />
                                                                    Cotação
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-slate-900">
                                                    {shipment.client?.name}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {shipment.client?.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 text-xs">
                                                    <MapPin className="w-3 h-3 text-blue-600" />
                                                    <span className="text-slate-700">{shipment.origin_port?.split(',')[0] || 'N/A'}</span>
                                                    <ArrowRight className="w-3 h-3 text-slate-400" />
                                                    <MapPin className="w-3 h-3 text-emerald-600" />
                                                    <span className="text-slate-700">{shipment.destination_port?.split(',')[0] || 'N/A'}</span>
                                                </div>
                                                <div className="mt-1 text-xs text-slate-500">
                                                    {shipment.type === 'export' ? '🇲🇿 → 🌍' : '🌍 → 🇲🇿'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-slate-900">
                                                    {shipment.container_type || 'N/A'}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {shipment.bl_number || shipment.container_number || 'Sem BL'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                            {shipment.stages?.map((stage) => (
    <span
        key={stage.id}
        className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
            stage.status === 'completed'
                ? 'bg-slate-200 text-slate-600'
                : getStageColor(stage.stage)
        }`}
    >
        {getStageLabel(stage.stage)}
        {stage.status === 'completed' && <Check className="w-3 h-3" />}
    </span>
))}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-slate-900">
                                                    {shipment.shipping_line?.name || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleViewDetails(shipment)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                                                        title="Ver detalhes"
                                                    >
                                                        <Eye className="w-3 h-3" />
                                                        Ver
                                                    </button>

                                                    {/* Botão Download Cotação - Admin e Finance */}
                                                    {shipment.quotation_reference && (auth.user.role === 'admin' || auth.user.role === 'finance') && (
                                                        <a
                                                            href={`/quotations/${shipment.id}/pdf`}
                                                            target="_blank"
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white transition-colors bg-emerald-600 rounded-lg hover:bg-emerald-700"
                                                            title="Baixar Cotação"
                                                        >
                                                            <Download className="w-3 h-3" />
                                                            Cotação
                                                        </a>
                                                    )}

                                                    <Link
                                                        href={`/shipments/${shipment.id}/edit`}
                                                        className="p-2 transition-colors rounded-lg hover:bg-slate-100"
                                                        title="Editar"
                                                    >
                                                        <Edit2 className="w-4 h-4 text-slate-600" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(shipment)}
                                                        className="p-2 transition-colors rounded-lg hover:bg-red-50"
                                                        title="Deletar"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center">
                                            <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                            <p className="text-sm font-medium text-slate-500">
                                                Nenhum processo encontrado
                                            </p>
                                            <Link
                                                href="/shipments/create"
                                                className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-700"
                                            >
                                                Criar primeiro processo
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginação */}
                    {shipments.last_page > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                            <div className="text-sm text-slate-500">
                                Mostrando {shipments.from} a {shipments.to} de {shipments.total} registros
                            </div>
                            <div className="flex gap-2">
                                {shipments.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        preserveState
                                        preserveScroll
                                        className={`
                                            px-3 py-1 text-sm rounded-lg border transition-colors
                                            ${link.active
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                            }
                                            ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}
                                        `}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

// ========================================
// COMPONENTE: StatCard
// ========================================
function StatCard({ title, value, icon: Icon, color, badge }) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        green: 'bg-green-50 text-green-600',
        red: 'bg-red-50 text-red-600',
    };

    return (
        <div className="relative p-4 overflow-hidden transition-shadow bg-white border rounded-lg border-slate-200 hover:shadow-md">
            {badge && (
                <div className="absolute text-2xl top-2 right-2 opacity-20">
                    {badge}
                </div>
            )}
            <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-600">{title}</p>
                    <p className="text-2xl font-bold text-slate-900">{value}</p>
                </div>
            </div>
        </div>
    );
}
