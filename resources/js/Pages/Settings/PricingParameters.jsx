import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
  DollarSign, Plus, Edit, Trash2, CheckCircle, XCircle,
  Save, X, Package, Ship, MapPin, Settings as SettingsIcon
} from 'lucide-react';

export default function PricingParameters({ parameters, currentCategory, categories, stats }) {
  const [selectedCategory, setSelectedCategory] = useState(currentCategory);
  const [showModal, setShowModal] = useState(false);
  const [editingParameter, setEditingParameter] = useState(null);

  const { data, setData, post, put, reset, processing, errors } = useForm({
    category: selectedCategory,
    code: '',
    name: '',
    description: '',
    price: '',
    order: 0,
    active: true,
  });

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    router.get('/settings/pricing-parameters', { category }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const openCreateModal = () => {
    reset();
    setData('category', selectedCategory);
    setEditingParameter(null);
    setShowModal(true);
  };

  const openEditModal = (parameter) => {
    setData({
      category: parameter.category,
      code: parameter.code,
      name: parameter.name,
      description: parameter.description || '',
      price: parameter.price,
      order: parameter.order,
      active: parameter.active,
    });
    setEditingParameter(parameter);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingParameter) {
      put(`/settings/pricing-parameters/${editingParameter.id}`, {
        onSuccess: () => {
          setShowModal(false);
          reset();
        },
      });
    } else {
      post('/settings/pricing-parameters', {
        onSuccess: () => {
          setShowModal(false);
          reset();
        },
      });
    }
  };

  const handleDelete = (parameter) => {
    if (confirm(`Tem certeza que deseja excluir "${parameter.name}"?`)) {
      router.delete(`/settings/pricing-parameters/${parameter.id}`);
    }
  };

  const handleToggleActive = (parameter) => {
    router.patch(`/settings/pricing-parameters/${parameter.id}/toggle-active`);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      container_type: Package,
      cargo_type: Ship,
      regime: SettingsIcon,
      destination: MapPin,
      additional_service: DollarSign,
    };
    return icons[category] || Package;
  };

  return (
    <DashboardLayout>
      <Head title="Parâmetros de Precificação" />

      <div className="p-6 ml-5 -mt-3 space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            Parâmetros de Precificação
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Configure os preços para cálculo automático de cotações
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">Total</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">Ativos</p>
                <p className="mt-1 text-2xl font-bold text-emerald-600">{stats.active}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">Inativos</p>
                <p className="mt-1 text-2xl font-bold text-slate-600">{stats.inactive}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <XCircle className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border rounded-lg border-slate-200">
          <div className="border-b border-slate-200">
            <div className="flex overflow-x-auto">
              {Object.entries(categories).map(([key, label]) => {
                const Icon = getCategoryIcon(key);
                return (
                  <button
                    key={key}
                    onClick={() => handleCategoryChange(key)}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      selectedCategory === key
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-900">
                {categories[selectedCategory]}
              </h3>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Novo Parâmetro
              </button>
            </div>

            {/* Table */}
            <div className="overflow-hidden border rounded-lg border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                      Código
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase text-slate-500">
                      Preço
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-center uppercase text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase text-slate-500">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {parameters.length > 0 ? (
                    parameters.map((param) => (
                      <tr key={param.id} className="transition-colors hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="px-2 py-1 text-sm font-mono rounded bg-slate-100 text-slate-700">
                            {param.code}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900">
                            {param.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-500">
                            {param.description || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="text-sm font-semibold text-slate-900">
                            {new Intl.NumberFormat('pt-MZ', {
                              style: 'currency',
                              currency: 'MZN',
                            }).format(param.price)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleToggleActive(param)}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              param.active
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {param.active ? (
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
                            <button
                              onClick={() => openEditModal(param)}
                              className="text-blue-600 transition-colors hover:text-blue-900"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(param)}
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
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <DollarSign className="w-12 h-12 mb-3 text-slate-300" />
                          <p className="text-sm font-medium text-slate-900">
                            Nenhum parâmetro configurado
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Clique em "Novo Parâmetro" para adicionar
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingParameter ? 'Editar Parâmetro' : 'Novo Parâmetro'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {!editingParameter && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-700">
                    Código *
                  </label>
                  <input
                    type="text"
                    value={data.code}
                    onChange={(e) => setData('code', e.target.value)}
                    className="w-full px-4 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                  {errors.code && (
                    <p className="mt-1 text-xs text-red-600">{errors.code}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Nome *
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className="w-full px-4 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Descrição
                </label>
                <textarea
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Preço (MZN) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={data.price}
                  onChange={(e) => setData('price', e.target.value)}
                  className="w-full px-4 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
                {errors.price && (
                  <p className="mt-1 text-xs text-red-600">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Ordem
                </label>
                <input
                  type="number"
                  value={data.order}
                  onChange={(e) => setData('order', e.target.value)}
                  className="w-full px-4 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={data.active}
                  onChange={(e) => setData('active', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-600"
                />
                <label htmlFor="active" className="text-sm font-medium text-slate-700">
                  Parâmetro Ativo
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 transition-colors bg-white border rounded-lg border-slate-300 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {processing ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
