import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Truck, Search, MapPin, Calendar, CheckCircle2, Clock, Package } from 'lucide-react';

export default function Coleta({ shipments, stats, filters }) {
  const [search, setSearch] = useState(filters.search || '');

  const handleSearch = (e) => {
    e.preventDefault();
    router.get('/operations/transport/coleta', { search }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleUpdateStatus = (shipmentId, status) => {
    const data = {
      status,
      coleta_date: status === 'collected' ? new Date().toISOString().split('T')[0] : null,
    };

    router.post(`/operations/transport/coleta/${shipmentId}/update-status`, data, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        alert(`Status atualizado para: ${getStatusLabel(status)}`);
      },
      onError: (errors) => {
        console.error('Erro ao atualizar status:', errors);
        alert('Erro ao atualizar status');
      }
    });
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pendente',
      'in_transit': 'Em Trânsito',
      'collected': 'Coletado',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'in_transit': 'bg-blue-100 text-blue-700',
      'collected': 'bg-green-100 text-green-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <DashboardLayout>
      <Head title="Transport - Coleta" />

      <div className="p-6 ml-5 -mt-3 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-7 h-7 text-purple-600" />
              Transporte - Fase 1: Coleta
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Gerencie a coleta de cargas para transporte
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="Total"
            value={stats.total}
            icon={Package}
            color="blue"
          />
          <StatCard
            title="Pendentes"
            value={stats.pending_coleta}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title="Em Trânsito"
            value={stats.in_transit}
            icon={Truck}
            color="blue"
          />
          <StatCard
            title="Coletados"
            value={stats.collected}
            icon={CheckCircle2}
            color="green"
          />
        </div>

        {/* Search */}
        <div className="p-4 bg-white border rounded-lg border-slate-200">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por referência, cliente..."
                className="w-full py-2 pl-10 pr-4 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Buscar
            </button>
          </form>
        </div>

        {/* Shipments List */}
        <div className="bg-white border rounded-lg border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Referência
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Origem
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Data Coleta
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase text-slate-500">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {shipments.data && shipments.data.length > 0 ? (
                  shipments.data.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Truck className="w-5 h-5 text-purple-600" />
                          <span className="font-medium text-slate-900">
                            {shipment.reference_number}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">
                          {shipment.client?.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <MapPin className="w-4 h-4" />
                          {shipment.trp_origin_address || shipment.origin_port || 'Não definido'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Calendar className="w-4 h-4" />
                          {shipment.trp_coleta_date || 'Pendente'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(shipment.trp_coleta_status || 'pending')}`}>
                          {getStatusLabel(shipment.trp_coleta_status || 'pending')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {shipment.trp_coleta_status !== 'collected' && (
                            <>
                              {shipment.trp_coleta_status !== 'in_transit' && (
                                <button
                                  onClick={() => handleUpdateStatus(shipment.id, 'in_transit')}
                                  className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                                >
                                  Iniciar Coleta
                                </button>
                              )}
                              <button
                                onClick={() => handleUpdateStatus(shipment.id, 'collected')}
                                className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
                              >
                                Marcar Coletado
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <Truck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p className="text-sm font-medium text-slate-500">
                        Nenhum processo de transporte encontrado
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {shipments.last_page > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
              <div className="text-sm text-slate-500">
                Mostrando {shipments.from} a {shipments.to} de {shipments.total} registros
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
  };

  return (
    <div className="p-4 bg-white border rounded-lg border-slate-200">
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
