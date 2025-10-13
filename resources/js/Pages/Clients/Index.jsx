import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
  Building2, UserCircle, Shield, Heart, Search, Filter,
  Plus, Download, MoreVertical, Edit, Trash2, Eye,
  Lock, Unlock, CheckCircle, XCircle, Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  return (
    <AppLayout title="Clientes" breadcrumbs={[
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Clientes' }
    ]}>
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">

        {/* Header with Stats */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Clientes
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Gerencie todos os seus clientes e suas informações
              </p>
            </div>
            <Link
              href="/clients/create"
              className="inline-flex items-center px-4 py-2 space-x-2 text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700 hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Novo Cliente</span>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              title="Total"
              value={stats.total}
              icon={Building2}
              color="blue"
            />
            <StatCard
              title="Ativos"
              value={stats.active}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              title="Bloqueados"
              value={stats.blocked}
              icon={Lock}
              color="red"
            />
            <StatCard
              title="VIP"
              value={stats.vip}
              icon={Shield}
              color="purple"
            />
            <StatCard
              title="Com Cargas Ativas"
              value={stats.with_active_shipments}
              icon={Package}
              color="orange"
            />
          </div>
        </div>

        {/* Filters Section */}
        <div className="p-6 mb-6 bg-white rounded-xl dark:bg-gray-800">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email, telefone, NIF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter Button */}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 space-x-2 text-gray-700 bg-gray-100 rounded-lg dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Filter className="w-5 h-5" />
                <span>Filtros</span>
              </button>

              {/* Search Button */}
              <button
                type="submit"
                className="inline-flex items-center px-6 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Search className="w-5 h-5" />
                <span>Buscar</span>
              </button>

              {/* Export Button */}
              <Link
                href="/clients/export"
                className="inline-flex items-center px-4 py-2 space-x-2 text-gray-700 bg-gray-100 rounded-lg dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Download className="w-5 h-5" />
                <span>Exportar</span>
              </Link>
            </div>

            {/* Expandable Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="grid grid-cols-1 gap-4 pt-4 border-t md:grid-cols-3 dark:border-gray-700"
                >
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tipo de Cliente
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Todos os tipos</option>
                      {Object.entries(types).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Prioridade
                    </label>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Todas as prioridades</option>
                      {Object.entries(priorities).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Limpar Filtros
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Clients Table */}
        <div className="overflow-hidden bg-white shadow-sm rounded-xl dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Prioridade
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase dark:text-gray-400">
                    Cargas
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase dark:text-gray-400">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {clients.data.map((client) => (
                  <ClientRow key={client.id} client={client} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {clients.links && (
            <div className="px-6 py-4 border-t dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrando {clients.from} até {clients.to} de {clients.total} clientes
                </div>
                <div className="flex space-x-2">
                  {clients.links.map((link, index) => (
                    <Link
                      key={index}
                      href={link.url}
                      preserveState
                      className={`px-3 py-1 rounded ${
                        link.active
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="p-6 bg-white shadow-sm rounded-xl dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

// Helper functions (moved outside component for reusability)
const getTypeIconComponent = (type) => {
  const icons = {
    company: Building2,
    individual: UserCircle,
    government: Shield,
    ngo: Heart,
  };
  return icons[type] || Building2;
};

const getPriorityColorClass = (priority) => {
  const colors = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    vip: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  };
  return colors[priority] || colors.low;
};

// Client Row Component
function ClientRow({ client }) {
  const [showMenu, setShowMenu] = useState(false);
  const TypeIcon = getTypeIconComponent(client.client_type);

  return (
    <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-10 h-10">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <TypeIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {client.display_name}
            </div>
            {client.tax_id && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                NIF: {client.tax_id}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white">
          {client.email}
        </div>
        {client.phone && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {client.phone}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-900 dark:text-white">
          {client.type_label}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColorClass(client.priority)}`}>
          {client.priority.toUpperCase()}
        </span>
      </td>
      <td className="px-6 py-4 text-center whitespace-nowrap">
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {client.active_shipments_count}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            de {client.shipments_count}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-center whitespace-nowrap">
        <div className="flex items-center justify-center space-x-2">
          {client.active ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          {client.blocked && (
            <Lock className="w-5 h-5 text-red-500" />
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-right whitespace-nowrap">
        <div className="relative inline-block">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 z-20 w-48 py-1 mt-2 bg-white rounded-lg shadow-lg dark:bg-gray-800">
                <Link
                  href={`/clients/${client.id}`}
                  className="flex items-center px-4 py-2 space-x-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Eye className="w-4 h-4" />
                  <span>Ver Detalhes</span>
                </Link>
                <Link
                  href={`/clients/${client.id}/edit`}
                  className="flex items-center px-4 py-2 space-x-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </Link>
                <button
                  onClick={() => router.post(`/clients/${client.id}/toggle-active`)}
                  className="flex items-center w-full px-4 py-2 space-x-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {client.active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  <span>{client.active ? 'Desativar' : 'Ativar'}</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm('Tem certeza que deseja excluir este cliente?')) {
                      router.delete(`/clients/${client.id}`);
                    }
                  }}
                  className="flex items-center w-full px-4 py-2 space-x-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir</span>
                </button>
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
