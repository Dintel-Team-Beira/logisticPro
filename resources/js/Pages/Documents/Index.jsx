import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
  FolderOpen,
  FileText,
  Search,
  Grid3x3,
  List,
  Calendar,
  User,
  Building2,
  Package,
  Filter,
  Download,
  Upload,
  Eye,
  Clock,
  TrendingUp,
  File,
  ChevronRight,
  X,
} from 'lucide-react';

export default function DocumentsIndex({ shipments, stats, filters }) {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState(filters?.search || '');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    router.get('/documents', { search: searchQuery }, { preserveState: true });
  };

  const clearSearch = () => {
    setSearchQuery('');
    router.get('/documents', {}, { preserveState: true });
  };

  // Stats Card Component
  const StatCard = ({ title, value, icon: Icon, color, trend }) => {
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-emerald-100 text-emerald-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
    };

    return (
      <div className="p-6 bg-white border rounded-lg border-slate-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
            {trend && (
              <p className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
                <TrendingUp className="w-3 h-3" />
                {trend}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    );
  };

  // Folder Card Component (Grid View)
  const FolderCard = ({ shipment }) => {
    const docCount = shipment.documents_count || 0;

    return (
      <Link
        href={`/documents/shipment/${shipment.id}`}
        className="relative overflow-hidden transition-all duration-300 bg-white border-2 border-transparent group rounded-xl hover:shadow-2xl hover:border-blue-500"
      >
        {/* Folder Icon Section */}
        <div className="relative flex items-center justify-center h-40 bg-gradient-to-br from-blue-50 to-slate-50">
          <div className="relative">
            <FolderOpen className="w-24 h-24 text-blue-500 transition-transform group-hover:scale-110" />
            {docCount > 0 && (
              <div className="absolute flex items-center justify-center w-8 h-8 text-xs font-bold text-white bg-blue-600 rounded-full -top-2 -right-2">
                {docCount}
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="p-4 border-t border-slate-100">
          <h3 className="mb-1 text-lg font-semibold truncate text-slate-900 group-hover:text-blue-600">
            {shipment.reference_number}
          </h3>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span className="truncate">{shipment.client?.name || 'N/A'}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Package className="w-4 h-4 text-slate-400" />
              <span className="truncate">{shipment.bl_number || 'N/A'}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{new Date(shipment.created_at).toLocaleDateString('pt-MZ')}</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <FileText className="w-3 h-3 text-slate-400" />
              <span className="text-slate-500">
                {docCount} {docCount === 1 ? 'documento' : 'documentos'}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              shipment.current_phase === 'completed'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {shipment.phase_label || shipment.current_phase || 'Em Processo'}
            </span>
            <ChevronRight className="w-5 h-5 transition-transform text-slate-400 group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    );
  };

  // List Item Component (List View)
  const ListItem = ({ shipment }) => {
    const docCount = shipment.documents_count || 0;

    return (
      <Link
        href={`/documents/shipment/${shipment.id}`}
        className="flex items-center gap-4 p-4 transition-all bg-white border rounded-lg border-slate-200 hover:shadow-md hover:border-blue-300"
      >
        {/* Folder Icon */}
        <div className="relative flex-shrink-0">
          <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-blue-50">
            <FolderOpen className="w-8 h-8 text-blue-500" />
          </div>
          {docCount > 0 && (
            <div className="absolute flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-600 rounded-full -top-1 -right-1">
              {docCount}
            </div>
          )}
        </div>

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <h3 className="mb-1 text-lg font-semibold truncate text-slate-900">
            {shipment.reference_number}
          </h3>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              <span className="truncate max-w-[200px]">{shipment.client?.name || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Package className="w-4 h-4" />
              <span>{shipment.bl_number || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(shipment.created_at).toLocaleDateString('pt-MZ')}</span>
            </div>
          </div>
        </div>

        {/* Stats & Status */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">{docCount}</p>
            <p className="text-xs text-slate-500">documentos</p>
          </div>

          <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
            shipment.current_phase === 'completed'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {shipment.phase_label || shipment.current_phase || 'Em Processo'}
          </span>

          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>
      </Link>
    );
  };

  return (
    <DashboardLayout>
      <Head title="Repositório de Documentos" />

      <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Repositório de Documentos
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Gerencie e acesse todos os documentos dos seus processos
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute w-5 h-5 -translate-y-1/2 text-slate-400 left-4 top-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por referência, BL, cliente..."
              className="w-full py-3 pl-12 pr-12 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute p-1 transition-colors -translate-y-1/2 rounded-full right-3 top-1/2 hover:bg-slate-100"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            )}
          </form>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard
            title="Total de Processos"
            value={stats.total_shipments || 0}
            icon={FolderOpen}
            color="blue"
          />
          <StatCard
            title="Total de Documentos"
            value={stats.total_documents || 0}
            icon={FileText}
            color="purple"
          />
          <StatCard
            title="Uploads Recentes"
            value={stats.recent_uploads || 0}
            icon={Upload}
            color="green"
            trend="Últimos 7 dias"
          />
        </div>

        {/* Content Area */}
        {shipments.data.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center bg-white border rounded-lg border-slate-200">
            <FolderOpen className="w-24 h-24 mx-auto mb-4 text-slate-300" />
            <h3 className="mb-2 text-xl font-semibold text-slate-900">
              Nenhum processo encontrado
            </h3>
            <p className="mb-6 text-slate-600">
              {searchQuery
                ? 'Tente ajustar sua busca ou limpe os filtros'
                : 'Comece criando um novo processo de importação'}
            </p>
            {searchQuery ? (
              <button
                onClick={clearSearch}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <X className="w-4 h-4" />
                Limpar Busca
              </button>
            ) : (
              <Link
                href="/shipments/create"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Package className="w-4 h-4" />
                Novo Processo
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Grid/List View */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {shipments.data.map((shipment) => (
                  <FolderCard key={shipment.id} shipment={shipment} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {shipments.data.map((shipment) => (
                  <ListItem key={shipment.id} shipment={shipment} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {shipments.last_page > 1 && (
              <div className="flex items-center justify-between p-4 mt-6 bg-white border rounded-lg border-slate-200">
                <div className="text-sm text-slate-600">
                  Mostrando {shipments.from} a {shipments.to} de {shipments.total} processos
                </div>
                <div className="flex gap-2">
                  {shipments.links.map((link, index) => (
                    <Link
                      key={index}
                      href={link.url || '#'}
                      preserveState
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                        link.active
                          ? 'bg-blue-600 text-white'
                          : link.url
                          ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
