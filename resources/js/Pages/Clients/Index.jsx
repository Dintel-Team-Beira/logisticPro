import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
  Users, Building2, UserCircle, Shield, Heart, Search,
  Plus, Download, Eye, Edit, Trash2, Lock, Unlock,
  CheckCircle, XCircle, Package, Filter, X, ChevronRight
} from 'lucide-react';

export default function ClientsIndex({ clients, filters, stats, types, priorities, users }) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedType, setSelectedType] = useState(filters.type || '');
  const [selectedPriority, setSelectedPriority] = useState(filters.priority || '');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    router.get('/clients', {
      search: searchTerm,
      type: selectedType,
      priority: selectedPriority,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedPriority('');
    router.get('/clients');
  };

  const getTypeIcon = (type) => {
    const icons = {
      company: Building2,
      individual: UserCircle,
      government: Shield,
      ngo: Heart,
    };
    const Icon = icons[type] || Building2;
    return <Icon className="w-5 h-5" />;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-slate-100 text-slate-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-amber-100 text-amber-700',
      vip: 'bg-purple-100 text-purple-700',
    };
    return colors[priority] || colors.low;
  };

  return (
    <DashboardLayout>
      <Head title="Clientes" />

      <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            Clientes
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Gerencie todos os seus clientes e suas informações
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-5">
          <div className="p-4 bg-white border rounded-lg shadow-sm border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">Total</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {stats?.total || 0}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border rounded-lg shadow-sm border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">Ativos</p>
                <p className="mt-1 text-2xl font-bold text-emerald-600">
                  {stats?.active || 0}
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
                <p className="text-xs font-medium uppercase text-slate-500">Bloqueados</p>
                <p className="mt-1 text-2xl font-bold text-red-600">
                  {stats?.blocked || 0}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-50">
                <Lock className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border rounded-lg shadow-sm border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">VIP</p>
                <p className="mt-1 text-2xl font-bold text-purple-600">
                  {stats?.vip || 0}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border rounded-lg shadow-sm border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">Com Cargas</p>
                <p className="mt-1 text-2xl font-bold text-amber-600">
                  {stats?.with_active_shipments || 0}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50">
                <Package className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 bg-white border rounded-xl border-slate-200">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute w-4 h-4 text-slate-400 left-3 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome, email, telefone, NIF..."
                  className="w-full py-2.5 pl-10 pr-4 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              {/* Filter Button */}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors bg-white border rounded-lg border-slate-300 hover:bg-slate-50"
              >
                <Filter className="w-4 h-4" />
                Filtros
              </button>

              {/* Search Button */}
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Search className="w-4 h-4" />
                Buscar
              </button>

              {/* Export Button */}
              <Link
                href="/clients/export"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors bg-white border rounded-lg border-slate-300 hover:bg-slate-50"
              >
                <Download className="w-4 h-4" />
                Exportar
              </Link>

              {/* New Client Button */}
              <Link
                href="/clients/create"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Novo Cliente
              </Link>
            </div>

            {/* Expandable Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 gap-4 pt-4 border-t md:grid-cols-3 border-slate-200">
                <div>
                  <label className="block mb-2 text-xs font-medium uppercase text-slate-600">
                    Tipo de Cliente
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Todos os tipos</option>
                    {types && Object.entries(types).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-xs font-medium uppercase text-slate-600">
                    Prioridade
                  </label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Todas as prioridades</option>
                    {priorities && Object.entries(priorities).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="w-full px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors bg-white border rounded-lg border-slate-300 hover:bg-slate-50"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Table */}
        <div className="overflow-hidden bg-white border shadow-sm rounded-xl border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Prioridade
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-center uppercase text-slate-500">
                    Cargas
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-center uppercase text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase text-slate-500">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {clients.data && clients.data.length > 0 ? (
                  clients.data.map((client) => (
                    <tr key={client.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 text-white bg-blue-600 rounded-lg">
                            {getTypeIcon(client.client_type)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              {client.display_name}
                            </div>
                            {client.tax_id && (
                              <div className="text-xs text-slate-500">
                                NIF: {client.tax_id}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{client.email}</div>
                        {client.phone && (
                          <div className="text-xs text-slate-500">{client.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-700">
                          {client.type_label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getPriorityColor(client.priority)}`}>
                          {client.priority?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-900">
                          {client.active_shipments_count || 0}
                        </div>
                        <div className="text-xs text-slate-500">
                          de {client.shipments_count || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          {client.active ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          {client.blocked && (
                            <Lock className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/clients/${client.id}`}
                            className="p-2 transition-colors rounded-lg hover:bg-slate-100"
                            title="Ver Detalhes"
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                          </Link>
                          <Link
                            href={`/clients/${client.id}/edit`}
                            className="p-2 transition-colors rounded-lg hover:bg-slate-100"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4 text-slate-600" />
                          </Link>
                          <button
                            onClick={() => {
                              if (confirm('Tem certeza que deseja excluir este cliente?')) {
                                router.delete(`/clients/${client.id}`);
                              }
                            }}
                            className="p-2 transition-colors rounded-lg hover:bg-red-50"
                            title="Excluir"
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
                      <div className="flex flex-col items-center justify-center">
                        <Users className="w-12 h-12 mb-3 text-slate-300" />
                        <h3 className="mb-1 text-sm font-semibold text-slate-900">
                          Nenhum cliente encontrado
                        </h3>
                        <p className="text-sm text-slate-500">
                          Tente ajustar os filtros ou criar um novo cliente
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {clients.links && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
              <p className="text-sm text-slate-600">
                Mostrando <span className="font-semibold">{clients.from || 0}</span> a <span className="font-semibold">{clients.to || 0}</span> de <span className="font-semibold">{clients.total || 0}</span> clientes
              </p>
              <div className="flex gap-1">
                {clients.links.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url || '#'}
                    className={`
                      px-3 py-1.5 text-sm rounded-lg transition-colors
                      ${link.active
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
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
      </div>
    </DashboardLayout>
  );
}
