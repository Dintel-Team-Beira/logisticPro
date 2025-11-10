import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ArrowLeft, Save } from 'lucide-react';

export default function ConsigneeEdit({ consignee, clients }) {
  const [data, setData] = useState({
    client_id: consignee.client_id || '',
    name: consignee.name || '',
    tax_id: consignee.tax_id || '',
    email: consignee.email || '',
    phone: consignee.phone || '',
    address: consignee.address || '',
    city: consignee.city || '',
    country: consignee.country || 'MZ',
    contact_person: consignee.contact_person || '',
    notes: consignee.notes || '',
    active: consignee.active !== undefined ? consignee.active : true,
  });

  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setProcessing(true);

    router.put(`/consignees/${consignee.id}`, data, {
      onError: (errors) => {
        setErrors(errors);
        setProcessing(false);
      },
      onSuccess: () => {
        setProcessing(false);
      },
    });
  };

  const handleChange = (field, value) => {
    setData({ ...data, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <DashboardLayout>
      <Head title={`Editar ${consignee.name}`} />

      <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Editar Consignatário
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {consignee.name}
            </p>
          </div>
          <Link
            href="/consignees"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 transition-colors bg-white border rounded-lg border-slate-300 hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 bg-white border rounded-xl border-slate-200">
          <div className="space-y-6">
            {/* Cliente Associado */}
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Cliente Associado (Opcional)
              </label>
              <select
                value={data.client_id}
                onChange={(e) => handleChange('client_id', e.target.value)}
                className="w-full px-4 py-2.5 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="">Nenhum cliente</option>
                {clients?.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.company_name || client.name}
                  </option>
                ))}
              </select>
              {errors.client_id && (
                <p className="mt-1 text-xs text-red-600">{errors.client_id}</p>
              )}
            </div>

            {/* Informações Básicas */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Nome / Razão Social *
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  NIF / NUIT
                </label>
                <input
                  type="text"
                  value={data.tax_id}
                  onChange={(e) => handleChange('tax_id', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
                {errors.tax_id && (
                  <p className="mt-1 text-xs text-red-600">{errors.tax_id}</p>
                )}
              </div>
            </div>

            {/* Contato */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Telefone
                </label>
                <input
                  type="text"
                  value={data.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Pessoa de Contato
              </label>
              <input
                type="text"
                value={data.contact_person}
                onChange={(e) => handleChange('contact_person', e.target.value)}
                className="w-full px-4 py-2.5 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
              {errors.contact_person && (
                <p className="mt-1 text-xs text-red-600">{errors.contact_person}</p>
              )}
            </div>

            {/* Endereço */}
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Endereço
              </label>
              <textarea
                value={data.address}
                onChange={(e) => handleChange('address', e.target.value)}
                rows="3"
                className="w-full px-4 py-2.5 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
              {errors.address && (
                <p className="mt-1 text-xs text-red-600">{errors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Cidade
                </label>
                <input
                  type="text"
                  value={data.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
                {errors.city && (
                  <p className="mt-1 text-xs text-red-600">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  País
                </label>
                <select
                  value={data.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="MZ">Moçambique</option>
                  <option value="ZA">África do Sul</option>
                  <option value="ZW">Zimbabwe</option>
                  <option value="TZ">Tanzânia</option>
                  <option value="MW">Malawi</option>
                  <option value="ZM">Zâmbia</option>
                </select>
                {errors.country && (
                  <p className="mt-1 text-xs text-red-600">{errors.country}</p>
                )}
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Observações
              </label>
              <textarea
                value={data.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows="4"
                className="w-full px-4 py-2.5 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="Informações adicionais sobre o consignatário..."
              />
              {errors.notes && (
                <p className="mt-1 text-xs text-red-600">{errors.notes}</p>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="active"
                checked={data.active}
                onChange={(e) => handleChange('active', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-600"
              />
              <label htmlFor="active" className="text-sm font-medium text-slate-700">
                Consignatário Ativo
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-200">
            <Link
              href="/consignees"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors bg-white border rounded-lg border-slate-300 hover:bg-slate-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {processing ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
