import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
  FileText, DollarSign, Clock, CheckCircle2,
  XCircle, AlertCircle, Download, Eye,
  Search, Filter, X, MoreVertical
} from 'lucide-react';

/**
 * Página de Listagem de Invoices/Cotações
 * Lista TODAS as invoices geradas e permite mudar status
 *
 * @author Arnaldo Tomo
 */
export default function InvoicesIndex({ invoices, stats, filters }) {
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [selectedStatus, setSelectedStatus] = useState(filters?.status || 'all');
  const [showStatusMenu, setShowStatusMenu] = useState(null);

  // Aplicar filtros
  const handleFilter = () => {
    router.get('/invoices', {
      search: searchTerm,
      status: selectedStatus,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  // Limpar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    router.get('/invoices', {}, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  // Mudar status da invoice
  const handleStatusChange = (invoiceId, newStatus) => {
    if (confirm(`Tem certeza que deseja mudar o status para "${getStatusLabel(newStatus)}"?`)) {
      router.post(`/invoices/${invoiceId}/update-status`, {
        status: newStatus,
      }, {
        preserveScroll: true,
        onSuccess: () => {
          setShowStatusMenu(null);
        }
      });
    }
  };

  return (
    <DashboardLayout>
      <Head title="Faturas - Gestão de Cotações" />

      <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900">
              <FileText className="w-6 h-6 text-blue-600" />
              Gestão de Faturas
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Todas as cotações geradas e seus status
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <StatsCard
            icon={FileText}
            label="Total"
            value={stats?.total || 0}
            color="blue"
          />
          <StatsCard
            icon={Clock}
            label="Pendentes"
            value={stats?.pending || 0}
            color="yellow"
          />
          <StatsCard
            icon={CheckCircle2}
            label="Pagas"
            value={stats?.paid || 0}
            color="green"
          />
          <StatsCard
            icon={XCircle}
            label="Canceladas"
            value={stats?.cancelled || 0}
            color="gray"
          />
          <StatsCard
            icon={AlertCircle}
            label="Rejeitadas"
            value={stats?.rejected || 0}
            color="red"
          />
        </div>

        {/* Total Faturado */}
        <div className="p-6 border rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-emerald-600">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-900">Total Faturado</p>
              <p className="text-2xl font-bold text-emerald-900">
                ${(stats?.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="p-4 bg-white border rounded-xl border-slate-200">
          <div className="flex flex-wrap items-center gap-3">
            {/* Pesquisa */}
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute w-5 h-5 -translate-y-1/2 text-slate-400 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Pesquisar por número, processo ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                className="w-full py-2 pl-10 pr-4 transition-colors border rounded-lg border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Filtro de Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 transition-colors border rounded-lg border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="all">Todos Status</option>
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
              <option value="cancelled">Cancelado</option>
              <option value="rejected">Rejeitado</option>
            </select>

            {/* Botões */}
            <button
              onClick={handleFilter}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Filter className="w-4 h-4" />
              Filtrar
            </button>

            {(searchTerm || selectedStatus !== 'all') && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
              >
                <X className="w-4 h-4" />
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Tabela de Invoices */}
        <div className="overflow-hidden bg-white border rounded-xl border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-700">
                    Número Fatura
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-700">
                    Processo
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-700">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold tracking-wider text-right uppercase text-slate-700">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-700">
                    Data Emissão
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-700">
                    Vencimento
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold tracking-wider text-right uppercase text-slate-700">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoices?.data?.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                      <p className="text-sm font-medium">Nenhuma fatura encontrada</p>
                      <p className="text-xs">Tente ajustar os filtros</p>
                    </td>
                  </tr>
                ) : (
                  invoices?.data?.map((invoice) => (
                    <tr key={invoice.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <Link
                          href={`/invoices/${invoice.id}/show`}
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          {invoice.invoice_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-900">
                          {invoice.shipment?.reference_number || 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-900">
                          {invoice.client?.name || invoice.shipment?.client?.name || 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-slate-900">
                          ${invoice.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-900">
                          {new Date(invoice.issue_date).toLocaleDateString('pt-PT')}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-900">
                          {new Date(invoice.due_date).toLocaleDateString('pt-PT')}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={invoice.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Ver Detalhes */}
                          <Link
                            href={`/invoices/${invoice.id}/show`}
                            className="p-1 transition-colors rounded hover:bg-slate-200"
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                          </Link>

                          {/* Download */}
                          <a
                            href={`/invoices/${invoice.shipment_id}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 transition-colors rounded hover:bg-slate-200"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4 text-slate-600" />
                          </a>

                          {/* Menu de Status */}
                          <div className="relative">
                            <button
                              onClick={() => setShowStatusMenu(showStatusMenu === invoice.id ? null : invoice.id)}
                              className="p-1 transition-colors rounded hover:bg-slate-200"
                              title="Mudar status"
                            >
                              <MoreVertical className="w-4 h-4 text-slate-600" />
                            </button>

                            {showStatusMenu === invoice.id && (
                              <div className="absolute right-0 z-10 w-48 mt-2 bg-white border rounded-lg shadow-lg border-slate-200">
                                <div className="py-1">
                                  <button
                                    onClick={() => handleStatusChange(invoice.id, 'pending')}
                                    disabled={invoice.status === 'pending'}
                                    className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Clock className="w-4 h-4 text-yellow-600" />
                                    Marcar como Pendente
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(invoice.id, 'paid')}
                                    disabled={invoice.status === 'paid'}
                                    className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    Marcar como Pago
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(invoice.id, 'cancelled')}
                                    disabled={invoice.status === 'cancelled'}
                                    className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <XCircle className="w-4 h-4 text-gray-600" />
                                    Marcar como Cancelado
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(invoice.id, 'rejected')}
                                    disabled={invoice.status === 'rejected'}
                                    className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                    Marcar como Rejeitado
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {invoices?.links && invoices.links.length > 3 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                Mostrando {invoices.from} a {invoices.to} de {invoices.total} faturas
              </p>
              <div className="flex gap-2">
                {invoices.links.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url || '#'}
                    disabled={!link.url}
                    className={`px-3 py-1 text-sm rounded-lg ${
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
        </div>
      </div>
    </DashboardLayout>
  );
}

// Componente de Card de Estatísticas
function StatsCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    gray: 'bg-gray-100 text-gray-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="p-4 bg-white border rounded-xl border-slate-200">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-600">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Componente de Badge de Status
function StatusBadge({ status }) {
  const configs = {
    pending: {
      label: 'Pendente',
      className: 'bg-yellow-100 text-yellow-700',
    },
    paid: {
      label: 'Pago',
      className: 'bg-green-100 text-green-700',
    },
    cancelled: {
      label: 'Cancelado',
      className: 'bg-gray-100 text-gray-700',
    },
    rejected: {
      label: 'Rejeitado',
      className: 'bg-red-100 text-red-700',
    },
  };

  const config = configs[status] || configs.pending;

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
}

// Helper para obter label do status
function getStatusLabel(status) {
  const labels = {
    pending: 'Pendente',
    paid: 'Pago',
    cancelled: 'Cancelado',
    rejected: 'Rejeitado',
  };
  return labels[status] || status;
}
