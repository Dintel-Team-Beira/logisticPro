import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
  Truck, Search, Plus, Eye, Edit, Trash2,
  CheckCircle, XCircle, MapPin, Phone, User, Package
} from 'lucide-react';

export default function TransportsIndex({ transports, filters, stats, tiposVeiculo, destinosComuns }) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedTipo, setSelectedTipo] = useState(filters.tipo_veiculo || '');
  const [selectedDestino, setSelectedDestino] = useState(filters.destino || '');

  const handleSearch = (e) => {
    e.preventDefault();
    router.get('/transports', {
      search: searchTerm,
      tipo_veiculo: selectedTipo,
      destino: selectedDestino,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTipo('');
    setSelectedDestino('');
    router.get('/transports');
  };

  const handleDelete = (transport) => {
    if (confirm(`Tem certeza que deseja excluir o transporte "${transport.matricula}"?`)) {
      router.delete(`/transports/${transport.id}`);
    }
  };

  const toggleActive = (transport) => {
    router.patch(`/transports/${transport.id}/toggle-active`, {}, {
      preserveState: true,
    });
  };

  return (
    <DashboardLayout>
      <Head title="Transportes" />

      <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Transportes
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Gerencie caminhões, veículos e destinos
            </p>
          </div>
          <Link
            href="/transports/create"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Novo Transporte
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="p-4 bg-white border rounded-lg shadow-sm border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">Total</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {stats?.total || 0}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border rounded-lg shadow-sm border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">Ativos</p>
                <p className="mt-1 text-2xl font-bold text-emerald-600">
                  {stats?.ativos || 0}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border rounded-lg shadow-sm border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">Inativos</p>
                <p className="mt-1 text-2xl font-bold text-slate-600">
                  {stats?.inativos || 0}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <XCircle className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 bg-white border rounded-xl border-slate-200">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {/* Search */}
              <div className="md:col-span-1">
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Pesquisar
                </label>
                <div className="relative">
                  <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Matrícula, marca, motorista..."
                    className="w-full py-2 pl-10 pr-4 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Tipo de Veículo */}
              <div className="md:col-span-1">
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Tipo de Veículo
                </label>
                <select
                  value={selectedTipo}
                  onChange={(e) => setSelectedTipo(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  {Object.entries(tiposVeiculo || {}).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Destino */}
              <div className="md:col-span-1">
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Destino
                </label>
                <select
                  value={selectedDestino}
                  onChange={(e) => setSelectedDestino(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  {(destinosComuns || []).map((destino) => (
                    <option key={destino} value={destino}>{destino}</option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-end gap-2 md:col-span-1">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Filtrar
                </button>
                {(searchTerm || selectedTipo || selectedDestino) && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm font-medium text-slate-700 transition-colors bg-white border rounded-lg border-slate-300 hover:bg-slate-50"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Transports Table */}
        <div className="overflow-hidden bg-white border rounded-xl border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Veículo
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Matrícula
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Motorista
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Capacidade
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Destinos
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase text-slate-500">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {transports.data.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <Truck className="w-12 h-12 mx-auto text-slate-400" />
                      <p className="mt-2 text-sm font-medium text-slate-900">
                        Nenhum transporte encontrado
                      </p>
                      <p className="text-sm text-slate-500">
                        Comece adicionando um novo transporte
                      </p>
                    </td>
                  </tr>
                ) : (
                  transports.data.map((transport) => (
                    <tr key={transport.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-50">
                            <Truck className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {tiposVeiculo[transport.tipo_veiculo] || transport.tipo_veiculo}
                            </div>
                            {transport.marca && (
                              <div className="text-xs text-slate-500">
                                {transport.marca} {transport.modelo}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">
                          {transport.matricula}
                        </div>
                        {transport.ano && (
                          <div className="text-xs text-slate-500">
                            Ano: {transport.ano}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {transport.motorista_nome ? (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <div>
                              <div className="text-sm text-slate-900">
                                {transport.motorista_nome}
                              </div>
                              {transport.motorista_telefone && (
                                <div className="text-xs text-slate-500">
                                  {transport.motorista_telefone}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">Não informado</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {transport.capacidade_peso && (
                            <div className="flex items-center gap-1">
                              <Package className="w-3 h-3 text-slate-400" />
                              {transport.capacidade_peso} ton
                            </div>
                          )}
                          {transport.capacidade_volume && (
                            <div className="text-xs text-slate-500">
                              {transport.capacidade_volume} m³
                            </div>
                          )}
                          {!transport.capacidade_peso && !transport.capacidade_volume && (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {transport.destinos && transport.destinos.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {transport.destinos.slice(0, 2).map((destino, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700"
                              >
                                <MapPin className="w-3 h-3" />
                                {destino}
                              </span>
                            ))}
                            {transport.destinos.length > 2 && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                                +{transport.destinos.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">Sem destinos</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleActive(transport)}
                          className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${
                            transport.ativo
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {transport.ativo ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Ativo
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Inativo
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/transports/${transport.id}`}
                            className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/transports/${transport.id}/edit`}
                            className="p-2 text-amber-600 transition-colors rounded-lg hover:bg-amber-50"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(transport)}
                            className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50"
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
          {transports.data.length > 0 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50">
              <div className="text-sm text-slate-700">
                Mostrando {transports.from} a {transports.to} de {transports.total} transportes
              </div>
              <div className="flex gap-2">
                {transports.links.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url || '#'}
                    disabled={!link.url}
                    className={`px-3 py-1 text-sm rounded-lg ${
                      link.active
                        ? 'bg-blue-600 text-white'
                        : link.url
                        ? 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
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
