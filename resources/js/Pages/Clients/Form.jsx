import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
  Building2, UserCircle, Mail, Phone, MapPin, CreditCard,
  Globe, User, Briefcase, DollarSign, AlertCircle, Save, X
} from 'lucide-react';

export default function ClientForm({ client, types, priorities, paymentTerms, users }) {
  const isEditing = !!client;
  const [activeTab, setActiveTab] = useState('basic');

  const { data, setData, post, put, processing, errors } = useForm({
    // Basic Info
    client_type: client?.client_type || 'company',
    name: client?.name || '',
    company_name: client?.company_name || '',

    // Contact
    email: client?.email || '',
    secondary_email: client?.secondary_email || '',
    phone: client?.phone || '',
    secondary_phone: client?.secondary_phone || '',
    whatsapp: client?.whatsapp || '',

    // Documents
    tax_id: client?.tax_id || '',
    tax_id_type: client?.tax_id_type || '',
    industry: client?.industry || '',
    website: client?.website || '',

    // Address
    address: client?.address || '',
    address_line2: client?.address_line2 || '',
    city: client?.city || '',
    state: client?.state || '',
    postal_code: client?.postal_code || '',
    country: client?.country || 'MZ',

    // Billing Address
    billing_address: client?.billing_address || '',
    billing_city: client?.billing_city || '',
    billing_state: client?.billing_state || '',
    billing_postal_code: client?.billing_postal_code || '',
    billing_country: client?.billing_country || '',

    // Contact Person
    contact_person: client?.contact_person || '',
    contact_position: client?.contact_position || '',
    contact_phone: client?.contact_phone || '',
    contact_email: client?.contact_email || '',

    // Commercial
    priority: client?.priority || 'medium',
    payment_terms: client?.payment_terms || 'net_30',
    credit_limit: client?.credit_limit || 0,
    preferred_currency: client?.preferred_currency || 'MZN',

    // Status
    active: client?.active ?? true,
    notes: client?.notes || '',
    tags: client?.tags || '',
    assigned_to_user_id: client?.assigned_to_user_id || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditing) {
      put(`/clients/${client.id}`);
    } else {
      post('/clients');
    }
  };

  const tabs = [
    { id: 'basic', label: 'Informações Básicas', icon: Building2 },
    { id: 'contact', label: 'Contato', icon: Phone },
    { id: 'address', label: 'Endereço', icon: MapPin },
    { id: 'commercial', label: 'Comercial', icon: DollarSign },
  ];

  return (
    <AppLayout
      title={isEditing ? 'Editar Cliente' : 'Novo Cliente'}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Clientes', href: '/clients' },
        { label: isEditing ? 'Editar' : 'Novo' }
      ]}
    >
      <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {isEditing
              ? 'Atualize as informações do cliente'
              : 'Preencha todas as informações do novo cliente'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

            {/* Left Sidebar - Tabs */}
            <div className="lg:col-span-1">
              <div className="sticky p-4 space-y-2 bg-white rounded-lg shadow-sm top-24 dark:bg-gray-800">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}

                {/* Action Buttons */}
                <div className="pt-4 mt-4 space-y-2 border-t dark:border-gray-700">
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex items-center justify-center w-full px-4 py-3 space-x-2 text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-5 h-5" />
                    <span>{processing ? 'Salvando...' : 'Salvar Cliente'}</span>
                  </button>
                  <a
                    href="/clients"
                    className="flex items-center justify-center w-full px-4 py-3 space-x-2 text-gray-700 transition-all bg-gray-100 rounded-lg dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <X className="w-5 h-5" />
                    <span>Cancelar</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Content - Form Fields */}
            <div className="lg:col-span-2">
              <div className="p-6 space-y-6 bg-white rounded-lg shadow-sm dark:bg-gray-800">

                {/* Basic Information Tab */}
                {activeTab === 'basic' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Informações Básicas
                    </h3>

                    {/* Client Type */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tipo de Cliente *
                      </label>
                      <select
                        value={data.client_type}
                        onChange={(e) => setData('client_type', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        {Object.entries(types).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      {errors.client_type && (
                        <p className="mt-1 text-sm text-red-600">{errors.client_type}</p>
                      )}
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {data.client_type === 'company' ? 'Razão Social *' : 'Nome Completo *'}
                      </label>
                      <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder={data.client_type === 'company' ? 'Nome da empresa' : 'Nome completo'}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>

                    {/* Company Name (for companies) */}
                    {data.client_type === 'company' && (
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Nome Fantasia
                        </label>
                        <input
                          type="text"
                          value={data.company_name}
                          onChange={(e) => setData('company_name', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                          placeholder="Nome fantasia da empresa"
                        />
                        {errors.company_name && (
                          <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>
                        )}
                      </div>
                    )}

                    {/* Tax ID */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          NIF/NUIT
                        </label>
                        <input
                          type="text"
                          value={data.tax_id}
                          onChange={(e) => setData('tax_id', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                          placeholder="123456789"
                        />
                        {errors.tax_id && (
                          <p className="mt-1 text-sm text-red-600">{errors.tax_id}</p>
                        )}
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Tipo de Documento
                        </label>
                        <input
                          type="text"
                          value={data.tax_id_type}
                          onChange={(e) => setData('tax_id_type', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                          placeholder="NIF, NUIT, etc."
                        />
                      </div>
                    </div>

                    {/* Industry & Website */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Setor/Indústria
                        </label>
                        <input
                          type="text"
                          value={data.industry}
                          onChange={(e) => setData('industry', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: Logística, Comércio"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Website
                        </label>
                        <input
                          type="url"
                          value={data.website}
                          onChange={(e) => setData('website', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                          placeholder="https://exemplo.com"
                        />
                        {errors.website && (
                          <p className="mt-1 text-sm text-red-600">{errors.website}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Tab */}
                {activeTab === 'contact' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Informações de Contato
                    </h3>

                    {/* Emails */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email Principal *
                        </label>
                        <input
                          type="email"
                          value={data.email}
                          onChange={(e) => setData('email', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                          placeholder="contato@exemplo.com"
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email Secundário
                        </label>
                        <input
                          type="email"
                          value={data.secondary_email}
                          onChange={(e) => setData('secondary_email', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                          placeholder="outro@exemplo.com"
                        />
                      </div>
                    </div>

                    {/* Phones */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Telefone Principal
                        </label>
                        <input
                          type="tel"
                          value={data.phone}
                          onChange={(e) => setData('phone', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                          placeholder="+258 84 123 4567"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Telefone Secundário
                        </label>
                        <input
                          type="tel"
                          value={data.secondary_phone}
                          onChange={(e) => setData('secondary_phone', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                          placeholder="+258 84 123 4567"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          WhatsApp
                        </label>
                        <input
                          type="tel"
                          value={data.whatsapp}
                          onChange={(e) => setData('whatsapp', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                          placeholder="+258 84 123 4567"
                        />
                      </div>
                    </div>

                    {/* Contact Person */}
                    <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                      <h4 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Pessoa de Contato
                      </h4>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nome
                          </label>
                          <input
                            type="text"
                            value={data.contact_person}
                            onChange={(e) => setData('contact_person', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="Nome do contato"
                          />
                        </div>

                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Cargo
                          </label>
                          <input
                            type="text"
                            value={data.contact_position}
                            onChange={(e) => setData('contact_position', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="Ex: Gerente de Compras"
                          />
                        </div>

                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Telefone
                          </label>
                          <input
                            type="tel"
                            value={data.contact_phone}
                            onChange={(e) => setData('contact_phone', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="+258 84 123 4567"
                          />
                        </div>

                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email
                          </label>
                          <input
                            type="email"
                            value={data.contact_email}
                            onChange={(e) => setData('contact_email', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="contato@exemplo.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Address Tab */}
                {activeTab === 'address' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Endereços
                    </h3>

                    {/* Main Address */}
                    <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                      <h4 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Endereço Principal
                      </h4>

                      <div className="space-y-4">
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Endereço
                          </label>
                          <input
                            type="text"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="Rua, Avenida, etc."
                          />
                        </div>

                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Complemento
                          </label>
                          <input
                            type="text"
                            value={data.address_line2}
                            onChange={(e) => setData('address_line2', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="Apt, Sala, etc."
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                              Cidade
                            </label>
                            <input
                              type="text"
                              value={data.city}
                              onChange={(e) => setData('city', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                              placeholder="Maputo"
                            />
                          </div>

                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                              Estado/Província
                            </label>
                            <input
                              type="text"
                              value={data.state}
                              onChange={(e) => setData('state', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                              placeholder="Maputo"
                            />
                          </div>

                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                              Código Postal
                            </label>
                            <input
                              type="text"
                              value={data.postal_code}
                              onChange={(e) => setData('postal_code', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                              placeholder="1100"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            País *
                          </label>
                          <select
                            value={data.country}
                            onChange={(e) => setData('country', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="MZ">Moçambique</option>
                            <option value="ZA">África do Sul</option>
                            <option value="ZW">Zimbabwe</option>
                            <option value="BR">Brasil</option>
                            <option value="PT">Portugal</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Billing Address */}
                    <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                      <h4 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Endereço de Faturação (se diferente)
                      </h4>

                      <div className="space-y-4">
                        <div>
                          <input
                            type="text"
                            value={data.billing_address}
                            onChange={(e) => setData('billing_address', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="Endereço de faturação"
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <input
                            type="text"
                            value={data.billing_city}
                            onChange={(e) => setData('billing_city', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="Cidade"
                          />

                          <input
                            type="text"
                            value={data.billing_state}
                            onChange={(e) => setData('billing_state', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="Estado"
                          />

                          <input
                            type="text"
                            value={data.billing_postal_code}
                            onChange={(e) => setData('billing_postal_code', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="CEP"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Commercial Tab */}
                {activeTab === 'commercial' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Informações Comerciais
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* Priority */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Prioridade *
                        </label>
                        <select
                          value={data.priority}
                          onChange={(e) => setData('priority', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                          {Object.entries(priorities).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Payment Terms */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Termos de Pagamento *
                        </label>
                        <select
                          value={data.payment_terms}
                          onChange={(e) => setData('payment_terms', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                          {Object.entries(paymentTerms).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Credit Limit */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Limite de Crédito *
                        </label>
                        <input
                          type="number"
                          value={data.credit_limit}
                          onChange={(e) => setData('credit_limit', parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                          min="0"
                        />
                      </div>

                      {/* Currency */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Moeda Preferida *
                        </label>
                        <select
                          value={data.preferred_currency}
                          onChange={(e) => setData('preferred_currency', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="MZN">MZN - Metical</option>
                          <option value="USD">USD - Dólar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="ZAR">ZAR - Rand</option>
                        </select>
                      </div>
                    </div>

                    {/* Assigned User */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Responsável
                      </label>
                      <select
                        value={data.assigned_to_user_id}
                        onChange={(e) => setData('assigned_to_user_id', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Nenhum</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status */}
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={data.active}
                          onChange={(e) => setData('active', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Cliente Ativo
                        </span>
                      </label>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Observações
                      </label>
                      <textarea
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="Observações gerais sobre o cliente..."
                      />
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tags
                      </label>
                      <input
                        type="text"
                        value={data.tags}
                        onChange={(e) => setData('tags', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="vip, importador, exportador (separadas por vírgula)"
                      />
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
