import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
  Users, Building2, Search, Plus, Eye, Edit, Trash2,
  CheckCircle, XCircle, MapPin, Phone, Mail, User
} from 'lucide-react';

export default function ConsigneesIndex({ consignees, filters, stats, clients }) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedClient, setSelectedClient] = useState(filters.client_id || '');

  const handleSearch = (e) => {
    e.preventDefault();
    router.get('/consignees', {
      search: searchTerm,
      client_id: selectedClient,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedClient('');
    router.get('/consignees');
  };

  const handleDelete = (consignee) => {
    if (confirm(`Tem certeza que deseja excluir o consignatário "${consignee.name}"?`)) {
      router.delete(`/consignees/${consignee.id}`);
    }
  };

  return (
    <DashboardLayout>
      <Head title="Consignatários" />

      <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            Consignatários
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Gerencie os destinatários das mercadorias
          </p>
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
                <Users className="w-6 h-6 text-blue-600" />
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
                <p className="text-xs font-medium uppercase text-slate-500">Inativos</p>
                <p className="mt-1 text-2xl font-bold text-slate-600">
                  {stats?.inactive || 0}
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
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute w-4 h-4 text-slate-400 left-3 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome, email, telefone, NIF, cidade..."
                  className="w-full py-2.5 pl-10 pr-4 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              {/* Client Filter */}
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="py-2.5 px-4 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="">Todos os Clientes</option>
                {clients?.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.company_name || client.name}
                  </option>
                ))}
              </select>

              {/* Search Button */}
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Search className="w-4 h-4" />
                Buscar
              </button>

              {/* Clear Button */}
              {(searchTerm || selectedClient) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors bg-white border rounded-lg border-slate-300 hover:bg-slate-50"
                >
                  Limpar
                </button>
              )}

              {/* New Consignee Button */}
              <Link
                href="/consignees/create"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Novo Consignatário
              </Link>
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="overflow-hidden bg-white border rounded-xl border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Localização
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Processos
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
                {consignees.data?.length > 0 ? (
                  consignees.data.map((consignee) => (
                    <tr key={consignee.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">
                              {consignee.name}
                            </div>
                            {consignee.tax_id && (
                              <div className="text-xs text-slate-500">
                                NIF: {consignee.tax_id}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {consignee.client ? (
                            consignee.client.company_name || consignee.client.name
                          ) : (
                            <span className="text-slate-400">Sem cliente</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900">
                          {consignee.email && (
                            <div className="flex items-center gap-1 mb-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{consignee.email}</span>
                            </div>
                          )}
                          {consignee.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{consignee.phone}</span>
                            </div>
                          )}
                          {consignee.contact_person && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                              <User className="w-3 h-3" />
                              <span>{consignee.contact_person}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900">
                          {consignee.city && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{consignee.city}, {consignee.country || 'MZ'}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {consignee.shipments_count || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          consignee.active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {consignee.active ? (
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
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/consignees/${consignee.id}`}
                            className="text-blue-600 transition-colors hover:text-blue-900"
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/consignees/${consignee.id}/edit`}
                            className="text-slate-600 transition-colors hover:text-slate-900"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(consignee)}
                            className="text-red-600 transition-colors hover:text-red-900"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
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
                        <p className="text-sm font-medium text-slate-900">
                          Nenhum consignatário encontrado
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Comece criando um novo consignatário
                        </p>
                        <Link
                          href="/consignees/create"
                          className="inline-flex items-center gap-2 px-4 py-2 mt-4 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4" />
                          Novo Consignatário
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {consignees.data?.length > 0 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <span>Mostrando</span>
                <span className="font-medium">{consignees.from}</span>
                <span>a</span>
                <span className="font-medium">{consignees.to}</span>
                <span>de</span>
                <span className="font-medium">{consignees.total}</span>
                <span>consignatários</span>
              </div>

              <div className="flex gap-1">
                {consignees.links.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url || '#'}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      link.active
                        ? 'bg-blue-600 text-white'
                        : link.url
                        ? 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    preserveState
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
