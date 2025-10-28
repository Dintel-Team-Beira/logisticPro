import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Truck, Search, MapPin, Calendar, CheckCircle2, Clock, Package, User } from 'lucide-react';

export default function Entrega({ shipments, stats, filters }) {
  const [search, setSearch] = useState(filters.search || '');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [formData, setFormData] = useState({
    status: 'delivered',
    entrega_date: new Date().toISOString().split('T')[0],
    receiver_name: '',
    delivery_notes: '',
  });

  const handleSearch = (e) => {
    e.preventDefault();
    router.get('/operations/transport/entrega', { search }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const openModal = (shipment) => {
    setSelectedShipment(shipment);
    setFormData({
      status: 'delivered',
      entrega_date: new Date().toISOString().split('T')[0],
      receiver_name: '',
      delivery_notes: '',
    });
    setModalOpen(true);
  };

  const handleUpdateStatus = (e) => {
    e.preventDefault();

    router.post(`/operations/transport/entrega/${selectedShipment.id}/update-status`, formData, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        setModalOpen(false);
        alert('Entrega registrada com sucesso!');
      },
      onError: (errors) => {
        console.error('Erro ao registrar entrega:', errors);
        alert('Erro ao registrar entrega');
      }
    });
  };

  const handleStartDelivery = (shipmentId) => {
    router.post(`/operations/transport/entrega/${shipmentId}/update-status`, {
      status: 'in_transit',
    }, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        alert('Entrega iniciada!');
      },
    });
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pendente',
      'in_transit': 'Em Trânsito',
      'delivered': 'Entregue',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'in_transit': 'bg-blue-100 text-blue-700',
      'delivered': 'bg-green-100 text-green-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <DashboardLayout>
      <Head title="Transport - Entrega" />

      <div className="p-6 ml-5 -mt-3 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-7 h-7 text-purple-600" />
              Transporte - Fase 2: Entrega
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Gerencie a entrega de cargas transportadas
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
            value={stats.pending_entrega}
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
            title="Entregues"
            value={stats.delivered}
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
                    Destino
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Data Entrega
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
                          {shipment.trp_destination_address || shipment.destination_port || 'Não definido'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Calendar className="w-4 h-4" />
                          {shipment.trp_entrega_date || 'Pendente'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(shipment.trp_entrega_status || 'pending')}`}>
                          {getStatusLabel(shipment.trp_entrega_status || 'pending')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {shipment.trp_entrega_status !== 'delivered' && (
                            <>
                              {shipment.trp_entrega_status !== 'in_transit' && (
                                <button
                                  onClick={() => handleStartDelivery(shipment.id)}
                                  className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                                >
                                  Iniciar Entrega
                                </button>
                              )}
                              <button
                                onClick={() => openModal(shipment)}
                                className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
                              >
                                Registrar Entrega
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
                        Nenhum processo de entrega encontrado
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Entrega */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Registrar Entrega
            </h3>
            <form onSubmit={handleUpdateStatus}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Data de Entrega
                  </label>
                  <input
                    type="date"
                    value={formData.entrega_date}
                    onChange={(e) => setFormData({ ...formData, entrega_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nome do Recebedor
                  </label>
                  <input
                    type="text"
                    value={formData.receiver_name}
                    onChange={(e) => setFormData({ ...formData, receiver_name: e.target.value })}
                    placeholder="Nome de quem recebeu"
                    className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={formData.delivery_notes}
                    onChange={(e) => setFormData({ ...formData, delivery_notes: e.target.value })}
                    placeholder="Observações sobre a entrega..."
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Confirmar Entrega
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
