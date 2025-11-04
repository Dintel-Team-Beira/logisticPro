import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  Download,
  Eye,
  Search,
  X
} from 'lucide-react';

export default function FinanceDashboard({ stats, recentRequests }) {
    console.log('Recent Requests:', stats); // Log para depuração
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const statCards = [
    {
      title: 'Pendentes Aprovação',
      value: stats.pending_approval,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      filter: 'pending'
    },
    {
      title: 'Aprovados (A Pagar)',
      value: stats.approved,
      icon: CheckCircle,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      filter: 'approved'
    },
    {
      title: 'Em Pagamento',
      value: stats.in_payment,
      icon: DollarSign,
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      filter: 'in_payment'
    },
    {
      title: 'Pagos Hoje',
      value: stats.paid_today,
      icon: TrendingUp,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      filter: 'paid_today'
    }
  ];

  // Filtrar requests baseado no filtro ativo e pesquisa
  const filteredRequests = useMemo(() => {
    let filtered = [...recentRequests];

    // Aplicar filtro de status
    if (activeFilter !== 'all') {
      if (activeFilter === 'paid_today') {
        // Filtrar pagos hoje
        const today = new Date().toDateString();
        filtered = filtered.filter(req =>
          req.status === 'paid' &&
          req.paid_at &&
          new Date(req.paid_at).toDateString() === today
        );
      } else {
        filtered = filtered.filter(req => req.status === activeFilter);
      }
    }

    // Aplicar pesquisa
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(req =>
        req.shipment.reference_number.toLowerCase().includes(search) ||
        req.payee.toLowerCase().includes(search) ||
        (req.shipment.client?.name || '').toLowerCase().includes(search) ||
        req.request_type.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [recentRequests, activeFilter, searchTerm]);

  const formatCurrency = (amount, currency = 'MZN') => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: 'Pendente', class: 'bg-yellow-100 text-yellow-700' },
      approved: { label: 'Aprovado', class: 'bg-blue-100 text-blue-700' },
      in_payment: { label: 'Em Pagamento', class: 'bg-purple-100 text-purple-700' },
      paid: { label: 'Pago', class: 'bg-green-100 text-green-700' },
      rejected: { label: 'Rejeitado', class: 'bg-red-100 text-red-700' }
    };
    return badges[status] || badges.pending;
  };

  const handlePayment = (requestId) => {
    router.post(`/finance/payment-requests/${requestId}/start-payment`, {}, {
      preserveScroll: true,
      onSuccess: () => {
        // Redirecionar para página de confirmação
        router.visit(`/finance/payment-requests/${requestId}/confirm`);
      }
    });
  };

  const handleCardClick = (filter) => {
    if (activeFilter === filter) {
      setActiveFilter('all'); // Desmarcar se clicar novamente
    } else {
      setActiveFilter(filter);
    }
  };

  const clearFilters = () => {
    setActiveFilter('all');
    setSearchTerm('');
  };

  return (
    <DashboardLayout>
      <Head title="Dashboard Financeiro" />
    <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          Dashboard Financeiro
        </h1>
        <p className="mt-1 text-slate-600">
          Gestão de solicitações de pagamento e controle orçamental
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, idx) => {
          const isActive = activeFilter === stat.filter;
          return (
            <button
              key={idx}
              onClick={() => handleCardClick(stat.filter)}
              className={`p-6 text-left transition-all duration-200 bg-white border rounded-xl
                ${isActive
                  ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
                  : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                }
                cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                {isActive && (
                  <div className="p-1 bg-blue-100 rounded-full">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                )}
              </div>
              <h3 className="text-sm font-medium text-slate-600">{stat.title}</h3>
              <p className="mt-1 text-3xl font-bold text-slate-900">{stat.value}</p>
              {isActive && (
                <p className="mt-2 text-xs font-medium text-blue-600">
                  Filtro ativo
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
        <div className="p-6 border border-blue-200 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
          <h3 className="text-sm font-semibold text-blue-900">Total Pendente</h3>
          <p className="mt-2 text-3xl font-bold text-blue-900">
            {formatCurrency(stats.total_pending_amount)}
          </p>
          <p className="mt-1 text-xs text-blue-700">
            Aguardando aprovação da gestão
          </p>
        </div>

        <div className="p-6 border border-green-200 rounded-xl bg-gradient-to-br from-green-50 to-green-100">
          <h3 className="text-sm font-semibold text-green-900">Total Aprovado</h3>
          <p className="mt-2 text-3xl font-bold text-green-900">
            {formatCurrency(stats.total_approved_amount)}
          </p>
          <p className="mt-1 text-xs text-green-700">
            Pronto para processamento
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
        <Link
          href="/finance/pending"
          className="flex items-center gap-3 p-4 transition-all bg-white border rounded-lg border-slate-200 hover:shadow-lg hover:border-blue-500"
        >
          <div className="p-2 bg-blue-100 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">Solicitações Pendentes</h4>
            <p className="text-sm text-slate-600">Processar pagamentos</p>
          </div>
        </Link>

        <Link
          href="/finance/payments"
          className="flex items-center gap-3 p-4 transition-all bg-white border rounded-lg border-slate-200 hover:shadow-lg hover:border-green-500"
        >
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">Histórico de Pagamentos</h4>
            <p className="text-sm text-slate-600">Ver pagamentos realizados</p>
          </div>
        </Link>

        <Link
          href="/finance/reports"
          className="flex items-center gap-3 p-4 transition-all bg-white border rounded-lg border-slate-200 hover:shadow-lg hover:border-purple-500"
        >
          <div className="p-2 bg-purple-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">Relatórios</h4>
            <p className="text-sm text-slate-600">Análises financeiras</p>
          </div>
        </Link>
      </div>

      {/* Recent Requests Table */}
      <div className="bg-white border rounded-xl border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Solicitações Recentes
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {activeFilter === 'all'
                  ? 'Todas as solicitações'
                  : `Filtrado por: ${statCards.find(s => s.filter === activeFilter)?.title || 'N/A'}`
                }
                {searchTerm && ` - Pesquisando: "${searchTerm}"`}
                {filteredRequests.length !== recentRequests.length && (
                  <span className="ml-2 text-blue-600">
                    ({filteredRequests.length} de {recentRequests.length})
                  </span>
                )}
              </p>
            </div>
            <Link
              href="/finance/pending"
              className="px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Ver Todas
            </Link>
          </div>

          {/* Search Bar and Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute w-5 h-5 -translate-y-1/2 text-slate-400 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Pesquisar por processo, cliente, payee ou tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-10 transition-colors border rounded-lg border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute p-1 transition-colors -translate-y-1/2 rounded-full right-3 top-1/2 hover:bg-slate-200"
                  title="Limpar pesquisa"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              )}
            </div>
            {(activeFilter !== 'all' || searchTerm) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border rounded-lg border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
                Limpar Filtros
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-700">
                  Processo
                </th>
                <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-700">
                  Cliente
                </th>
                <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-700">
                  Tipo
                </th>
                <th className="px-6 py-3 text-xs font-semibold tracking-wider text-right uppercase text-slate-700">
                  Valor
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
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                    <p className="text-sm font-medium">
                      {recentRequests.length === 0
                        ? 'Nenhuma solicitação encontrada'
                        : 'Nenhum resultado para os filtros aplicados'
                      }
                    </p>
                    <p className="text-xs">
                      {recentRequests.length === 0
                        ? 'Todas as solicitações foram processadas'
                        : 'Tente ajustar os filtros ou pesquisa'
                      }
                    </p>
                    {(activeFilter !== 'all' || searchTerm) && (
                      <button
                        onClick={clearFilters}
                        className="px-4 py-2 mt-4 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                      >
                        Limpar Filtros
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => {
                  const badge = getStatusBadge(request.status);
                  return (
                    <tr key={request.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {request.shipment.reference_number}
                          </p>
                          <p className="text-xs text-slate-600">
                            {request.payee}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-900">
                          {request.shipment.client?.name || 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-900">
                          {request.getTypeLabel || request.request_type}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-slate-900">
                          {formatCurrency(request.amount, request.currency)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badge.class}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.visit(`/finance/payment-requests/${request.id}`)}
                            className="p-1 transition-colors rounded hover:bg-slate-200"
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                          </button>

                          {request.quotation_document && (
                            <button
                              onClick={() => router.visit(`/documents/${request.quotation_document.id}/download`)}
                              className="p-1 transition-colors rounded hover:bg-slate-200"
                              title="Baixar cotação"
                            >
                              <Download className="w-4 h-4 text-slate-600" />
                            </button>
                          )}

                          {request.status === 'approved' && (
                            <button
                              onClick={() => handlePayment(request.id)}
                              className="px-3 py-1 text-xs font-medium text-white transition-colors bg-green-600 rounded hover:bg-green-700"
                            >
                              Processar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
     </div>
    </DashboardLayout>
  );
}
