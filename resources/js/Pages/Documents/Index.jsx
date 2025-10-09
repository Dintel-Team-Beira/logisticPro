import { Head, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import {
  FolderOpen,
  FileText,
  Search,
  Grid3x3,
  List,
  Calendar,
  Building2,
  Package
} from 'lucide-react';
import DashboardLayout from '@/Layouts/DashboardLayout';

export default function DocumentsIndex({ shipments, stats, filters }) {
  const [search, setSearch] = useState(filters.search || '');
  const [viewMode, setViewMode] = useState('grid'); // grid ou list

  const handleSearch = (e) => {
    e.preventDefault();
    router.get('/documents', { search });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <Head title="Gestor de Documentos" />

      <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="flex items-center gap-3 text-4xl font-bold text-slate-900">
                <FolderOpen className="w-10 h-10 text-blue-600" />
                Gestor de Documentos
              </h1>
              <p className="mt-2 text-lg text-slate-600">
                Organize e acesse todos os documentos dos seus processos
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 p-1 bg-white rounded-lg shadow">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
            <div className="p-6 text-white shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-100">Total de Processos</p>
                  <p className="mt-1 text-4xl font-bold">{stats.total_shipments}</p>
                </div>
                <Package className="w-12 h-12 text-blue-200" />
              </div>
            </div>

            <div className="p-6 text-white shadow-lg bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-100">Total de Documentos</p>
                  <p className="mt-1 text-4xl font-bold">{stats.total_documents}</p>
                </div>
                <FileText className="w-12 h-12 text-green-200" />
              </div>
            </div>

            <div className="p-6 text-white shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-100">Uploads Recentes (7 dias)</p>
                  <p className="mt-1 text-4xl font-bold">{stats.recent_uploads}</p>
                </div>
                <Calendar className="w-12 h-12 text-purple-200" />
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute w-5 h-5 transform -translate-y-1/2 left-4 top-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar processo por referência, BL ou cliente..."
              className="w-full py-4 pl-12 pr-4 text-lg transition bg-white border-2 shadow-sm border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </form>
        </div>

        {/* Folders Grid/List */}
        {shipments.data.length === 0 ? (
          <div className="p-12 text-center bg-white shadow-lg rounded-xl">
            <FolderOpen className="w-24 h-24 mx-auto mb-4 text-slate-300" />
            <p className="text-lg text-slate-600">Nenhum processo encontrado</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              // GRID VIEW
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {shipments.data.map((shipment) => (
                  <Link
                    key={shipment.id}
                    href={`/documents/${shipment.id}`}
                    className="group"
                  >
                    <div className="p-6 transition-all duration-300 transform bg-white border-2 border-transparent shadow-md cursor-pointer rounded-xl hover:shadow-2xl hover:border-blue-500 hover:scale-105">
                      {/* Folder Icon */}
                      <div className="flex items-center justify-center mb-4">
                        <div className="relative">
                          <FolderOpen className="w-20 h-20 text-blue-500 transition group-hover:text-blue-600" />
                          <div className="absolute flex items-center justify-center w-8 h-8 text-xs font-bold text-white bg-blue-600 rounded-full shadow-lg -bottom-1 -right-1">
                            {shipment.documents_count}
                          </div>
                        </div>
                      </div>

                      {/* Shipment Info */}
                      <div className="text-center">
                        <h3 className="mb-1 text-lg font-bold truncate text-slate-900">
                          {shipment.reference_number}
                        </h3>

                        {shipment.client && (
                          <p className="flex items-center justify-center gap-1 mb-2 text-sm text-slate-600">
                            <Building2 className="w-4 h-4" />
                            <span className="truncate">{shipment.client.name}</span>
                          </p>
                        )}

                        <div className="flex items-center justify-center gap-2 pt-3 mt-3 text-xs border-t text-slate-500 border-slate-100">
                          <Calendar className="w-3 h-3" />
                          {formatDate(shipment.created_at)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              // LIST VIEW
              <div className="overflow-hidden bg-white shadow-lg rounded-xl">
                <table className="min-w-full">
                  <thead className="border-b-2 bg-slate-50 border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold tracking-wider text-left uppercase text-slate-700">
                        Processo
                      </th>
                      <th className="px-6 py-4 text-xs font-bold tracking-wider text-left uppercase text-slate-700">
                        Cliente
                      </th>
                      <th className="px-6 py-4 text-xs font-bold tracking-wider text-center uppercase text-slate-700">
                        Documentos
                      </th>
                      <th className="px-6 py-4 text-xs font-bold tracking-wider text-left uppercase text-slate-700">
                        Data
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {shipments.data.map((shipment) => (
                      <tr
                        key={shipment.id}
                        onClick={() => router.visit(`/documents/${shipment.id}`)}
                        className="transition cursor-pointer hover:bg-blue-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <FolderOpen className="w-8 h-8 text-blue-500" />
                            <div>
                              <div className="font-semibold text-slate-900">
                                {shipment.reference_number}
                              </div>
                              {shipment.bl_number && (
                                <div className="text-xs text-slate-500">
                                  BL: {shipment.bl_number}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {shipment.client ? (
                            <div className="flex items-center gap-2 text-slate-700">
                              <Building2 className="w-4 h-4 text-slate-400" />
                              {shipment.client.name}
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-semibold text-blue-800 bg-blue-100 rounded-full">
                            {shipment.documents_count} arquivo{shipment.documents_count !== 1 && 's'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {formatDate(shipment.created_at)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {shipments.links && shipments.links.length > 3 && (
              <div className="flex items-center justify-between p-6 mt-8 bg-white shadow-lg rounded-xl">
                <div className="text-sm text-slate-600">
                  Mostrando {shipments.from} a {shipments.to} de {shipments.total} processos
                </div>
                <div className="flex gap-2">
                  {shipments.links.map((link, index) => (
                    <Link
                      key={index}
                      href={link.url || '#'}
                      disabled={!link.url}
                      className={`px-4 py-2 rounded-lg transition ${
                        link.active
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
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
