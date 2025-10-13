import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Input from '@/Components/Forms/Input';
import Select from '@/Components/Forms/Select';
import {
  ArrowLeft,
  Save,
  Building2,
  UserCircle,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Globe,
  User,
  Briefcase,
  DollarSign,
  AlertCircle,
  FileText,
  Shield,
  Tag,
} from 'lucide-react';
import { label } from 'framer-motion/client';

export default function ClientForm({ client, types, priorities, paymentTerms, users }) {
  const isEditing = !!client;
  const [activeTab, setActiveTab] = useState('basic');
  const [showCustomIndustry, setShowCustomIndustry] = useState(false);
  const [showCustomPosition, setShowCustomPosition] = useState(false);

  // Opções predefinidas
  const industries = [
    { value: '', label: 'Selecione o setor' },
    { value: 'import_export', label: 'Importação/Exportação' },
    { value: 'logistics', label: 'Logística e Transporte' },
    { value: 'agriculture', label: 'Agricultura' },
    { value: 'mining', label: 'Mineração' },
    { value: 'construction', label: 'Construção Civil' },
    { value: 'manufacturing', label: 'Indústria Manufatureira' },
    { value: 'food_beverage', label: 'Alimentos e Bebidas' },
    { value: 'retail', label: 'Comércio Varejista' },
    { value: 'wholesale', label: 'Comércio Atacadista' },
    { value: 'technology', label: 'Tecnologia' },
    { value: 'energy', label: 'Energia' },
    { value: 'oil_gas', label: 'Petróleo e Gás' },
    { value: 'automotive', label: 'Automotivo' },
    { value: 'pharmaceutical', label: 'Farmacêutico' },
    { value: 'textile', label: 'Têxtil' },
    { value: 'fishing', label: 'Pesca' },
    { value: 'tourism', label: 'Turismo' },
    { value: 'other', label: 'Outro (especificar)' },
  ];

  const mozambiqueProvinces = [
    { value: '', label: 'Selecione a província' },
    { value: 'Maputo', label: 'Maputo (Cidade)' },
    { value: 'Maputo Província', label: 'Maputo (Província)' },
    { value: 'Gaza', label: 'Gaza' },
    { value: 'Inhambane', label: 'Inhambane' },
    { value: 'Sofala', label: 'Sofala' },
    { value: 'Manica', label: 'Manica' },
    { value: 'Tete', label: 'Tete' },
    { value: 'Zambezia', label: 'Zambézia' },
    { value: 'Nampula', label: 'Nampula' },
    { value: 'Cabo Delgado', label: 'Cabo Delgado' },
    { value: 'Niassa', label: 'Niassa' },
  ];

  const mainCities = [
    { value: '', label: 'Selecione a cidade' },
    { value: 'Maputo', label: 'Maputo' },
    { value: 'Matola', label: 'Matola' },
    { value: 'Beira', label: 'Beira' },
    { value: 'Nampula', label: 'Nampula' },
    { value: 'Chimoio', label: 'Chimoio' },
    { value: 'Nacala', label: 'Nacala' },
    { value: 'Quelimane', label: 'Quelimane' },
    { value: 'Tete', label: 'Tete' },
    { value: 'Xai-Xai', label: 'Xai-Xai' },
    { value: 'Lichinga', label: 'Lichinga' },
    { value: 'Pemba', label: 'Pemba' },
    { value: 'Inhambane', label: 'Inhambane' },
    { value: 'Maxixe', label: 'Maxixe' },
    { value: 'Angoche', label: 'Angoche' },
    { value: 'Mocuba', label: 'Mocuba' },
    { value: 'Gurué', label: 'Gurué' },
    { value: 'other', label: 'Outra (especificar)' },
  ];

  const commonPositions = [
    { value: '', label: 'Selecione o cargo' },
    { value: 'Director Geral', label: 'Director Geral' },
    { value: 'Gerente Geral', label: 'Gerente Geral' },
    { value: 'Gerente de Importação', label: 'Gerente de Importação' },
    { value: 'Gerente de Exportação', label: 'Gerente de Exportação' },
    { value: 'Gerente de Logística', label: 'Gerente de Logística' },
    { value: 'Gerente Comercial', label: 'Gerente Comercial' },
    { value: 'Gerente Financeiro', label: 'Gerente Financeiro' },
    { value: 'Director de Operações', label: 'Director de Operações' },
    { value: 'Responsável de Compras', label: 'Responsável de Compras' },
    { value: 'Coordenador de Importação', label: 'Coordenador de Importação' },
    { value: 'Assistente Administrativo', label: 'Assistente Administrativo' },
    { value: 'Proprietário', label: 'Proprietário' },
    { value: 'Sócio-Gerente', label: 'Sócio-Gerente' },
    { value: 'other', label: 'Outro (especificar)' },
  ];

  const countries = [
    { value: 'MZ', label: '🇲🇿 Moçambique' },
    { value: 'ZA', label: '🇿🇦 África do Sul' },
    { value: 'ZW', label: '🇿🇼 Zimbabwe' },
    { value: 'TZ', label: '🇹🇿 Tanzânia' },
    { value: 'MW', label: '🇲🇼 Malawi' },
    { value: 'ZM', label: '🇿🇲 Zâmbia' },
    { value: 'AO', label: '🇦🇴 Angola' },
    { value: 'BW', label: '🇧🇼 Botswana' },
    { value: 'NA', label: '🇳🇦 Namíbia' },
    { value: 'SZ', label: '🇸🇿 Eswatini' },
    { value: 'LS', label: '🇱🇸 Lesoto' },
    { value: 'MG', label: '🇲🇬 Madagascar' },
    { value: 'MU', label: '🇲🇺 Maurícia' },
    { value: 'SC', label: '🇸🇨 Seychelles' },
    { value: 'CD', label: '🇨🇩 RD Congo' },
    { value: 'PT', label: '🇵🇹 Portugal' },
    { value: 'BR', label: '🇧🇷 Brasil' },
    { value: 'CN', label: '🇨🇳 China' },
    { value: 'IN', label: '🇮🇳 Índia' },
    { value: 'AE', label: '🇦🇪 Emirados Árabes' },
    { value: 'US', label: '🇺🇸 Estados Unidos' },
    { value: 'GB', label: '🇬🇧 Reino Unido' },
  ];

  const priorit = [
    {value:'low',label:'low'},
    {value:'medium',label:'medium'},
    {value:'high',label:'high'},
    {value:'vip',label:'vip'},
    // {value:'vip',label:'vip'},
  ];

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
    { id: 'additional', label: 'Adicional', icon: FileText },
  ];

  return (
    <DashboardLayout>
      <Head title={isEditing ? 'Editar Cliente' : 'Novo Cliente'} />

      <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/clients"
            className="inline-flex items-center gap-2 mb-4 text-sm transition-colors text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Clientes
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900">
            {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isEditing
              ? 'Atualize as informações do cliente'
              : 'Preencha todas as informações do novo cliente'}
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="overflow-hidden bg-white border rounded-lg border-slate-200">
          <div className="flex overflow-x-auto border-b border-slate-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all whitespace-nowrap
                    border-b-2 -mb-px
                    ${
                      isActive
                        ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="p-6 bg-white border rounded-lg border-slate-200">
              <div className="flex items-center gap-2 mb-6">
                <Building2 className="w-5 h-5 text-slate-600" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Informações Básicas
                </h2>
              </div>

              <div className="space-y-4">
                {/* Client Type */}
                <Select
                  label="Tipo de Cliente *"
                  value={data.client_type}
                  onChange={(e) => setData('client_type', e.target.value)}
                  error={errors.client_type}
                  required
                >
                  {Object.entries(types).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>

                {/* Name */}
                <Input
                  label={
                    data.client_type === 'company'
                      ? 'Razão Social *'
                      : 'Nome Completo *'
                  }
                  icon={Building2}
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  error={errors.name}
                  placeholder={
                    data.client_type === 'company'
                      ? 'Ex: ABC Importações Lda'
                      : 'Ex: João Silva'
                  }
                  required
                />

                {/* Company Name (if individual) */}
                {data.client_type !== 'company' && (
                  <Input
                    label="Nome da Empresa (Opcional)"
                    icon={Briefcase}
                    value={data.company_name}
                    onChange={(e) => setData('company_name', e.target.value)}
                    error={errors.company_name}
                    placeholder="Ex: Silva & Filhos"
                  />
                )}

                {/* Tax ID */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Select
                    label="Tipo de Documento *"
                    value={data.tax_id_type}
                    onChange={(e) => setData('tax_id_type', e.target.value)}
                    error={errors.tax_id_type}
                    required
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="NUIT">NUIT (Número Único de Identificação Tributária)</option>
                    <option value="DIRE">DIRE (Documento Identificação de Regime Especial)</option>
                    <option value="BI">Bilhete de Identidade</option>
                    <option value="Passaporte">Passaporte</option>
                    <option value="CESSIONARIO">Cessionário</option>
                    <option value="OUTROS">Outros</option>
                  </Select>

                  <Input
                    label="Número do Documento *"
                    icon={CreditCard}
                    value={data.tax_id}
                    onChange={(e) => setData('tax_id', e.target.value)}
                    error={errors.tax_id}
                    placeholder="Ex: 123456789"
                    required
                  />
                </div>

                {/* Industry & Website */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Select
                      label="Indústria/Setor"
                      value={data.industry}
                      onChange={(e) => {
                        setData('industry', e.target.value);
                        setShowCustomIndustry(e.target.value === 'other');
                      }}
                      error={errors.industry}
                    >
                      {industries.map((ind) => (
                        <option key={ind.value} value={ind.value}>
                          {ind.label}
                        </option>
                      ))}
                    </Select>
                    {showCustomIndustry && (
                      <Input
                        className="mt-2"
                        placeholder="Especifique o setor"
                        value={data.industry !== 'other' ? data.industry : ''}
                        onChange={(e) => setData('industry', e.target.value)}
                      />
                    )}
                  </div>

                  <Input
                    label="Website"
                    type="url"
                    icon={Globe}
                    value={data.website}
                    onChange={(e) => setData('website', e.target.value)}
                    error={errors.website}
                    placeholder="https://www.empresa.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact Information Tab */}
          {activeTab === 'contact' && (
            <div className="p-6 bg-white border rounded-lg border-slate-200">
              <div className="flex items-center gap-2 mb-6">
                <Phone className="w-5 h-5 text-slate-600" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Informações de Contato
                </h2>
              </div>

              <div className="space-y-6">
                {/* Email Section */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-slate-700">
                    E-mails
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                      label="E-mail Principal *"
                      type="email"
                      icon={Mail}
                      value={data.email}
                      onChange={(e) => setData('email', e.target.value)}
                      error={errors.email}
                      placeholder="contato@empresa.com"
                      required
                    />

                    <Input
                      label="E-mail Secundário"
                      type="email"
                      icon={Mail}
                      value={data.secondary_email}
                      onChange={(e) => setData('secondary_email', e.target.value)}
                      error={errors.secondary_email}
                      placeholder="financeiro@empresa.com"
                    />
                  </div>
                </div>

                {/* Phone Section */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-slate-700">
                    Telefones
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Input
                      label="Telefone Principal *"
                      icon={Phone}
                      value={data.phone}
                      onChange={(e) => setData('phone', e.target.value)}
                      error={errors.phone}
                      placeholder="+258 84 123 4567"
                      required
                    />

                    <Input
                      label="Telefone Secundário"
                      icon={Phone}
                      value={data.secondary_phone}
                      onChange={(e) => setData('secondary_phone', e.target.value)}
                      error={errors.secondary_phone}
                      placeholder="+258 82 123 4567"
                    />

                    <Input
                      label="WhatsApp"
                      icon={Phone}
                      value={data.whatsapp}
                      onChange={(e) => setData('whatsapp', e.target.value)}
                      error={errors.whatsapp}
                      placeholder="+258 84 123 4567"
                    />
                  </div>
                </div>

                {/* Contact Person Section */}
                <div className="pt-6 border-t border-slate-200">
                  <h3 className="mb-3 text-sm font-semibold text-slate-700">
                    Pessoa de Contato
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                      label="Nome do Contato"
                      icon={User}
                      value={data.contact_person}
                      onChange={(e) => setData('contact_person', e.target.value)}
                      error={errors.contact_person}
                      placeholder="Ex: Maria Silva"
                    />

                    <div>
                      <Select
                        label="Cargo"
                        value={data.contact_position}
                        onChange={(e) => {
                          setData('contact_position', e.target.value);
                          setShowCustomPosition(e.target.value === 'other');
                        }}
                        error={errors.contact_position}
                      >
                        {commonPositions.map((pos) => (
                          <option key={pos.value} value={pos.value}>
                            {pos.label}
                          </option>
                        ))}
                      </Select>
                      {showCustomPosition && (
                        <Input
                          className="mt-2"
                          placeholder="Especifique o cargo"
                          value={data.contact_position !== 'other' ? data.contact_position : ''}
                          onChange={(e) => setData('contact_position', e.target.value)}
                        />
                      )}
                    </div>

                    <Input
                      label="Telefone do Contato"
                      icon={Phone}
                      value={data.contact_phone}
                      onChange={(e) => setData('contact_phone', e.target.value)}
                      error={errors.contact_phone}
                      placeholder="+258 84 123 4567"
                    />

                    <Input
                      label="E-mail do Contato"
                      type="email"
                      icon={Mail}
                      value={data.contact_email}
                      onChange={(e) => setData('contact_email', e.target.value)}
                      error={errors.contact_email}
                      placeholder="maria@empresa.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Address Tab */}
          {activeTab === 'address' && (
            <div className="p-6 bg-white border rounded-lg border-slate-200">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-slate-600" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Endereços
                </h2>
              </div>

              <div className="space-y-6">
                {/* Primary Address */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-slate-700">
                    Endereço Principal *
                  </h3>
                  <div className="space-y-4">
                    <Input
                      label="Endereço *"
                      icon={MapPin}
                      value={data.address}
                      onChange={(e) => setData('address', e.target.value)}
                      error={errors.address}
                      placeholder="Av. Julius Nyerere, 1234"
                      required
                    />

                    <Input
                      label="Complemento"
                      icon={MapPin}
                      value={data.address_line2}
                      onChange={(e) => setData('address_line2', e.target.value)}
                      error={errors.address_line2}
                      placeholder="Andar 5, Sala 501"
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                      <div className="md:col-span-2">
                        <Select
                          label="Cidade *"
                          value={data.city}
                          onChange={(e) => setData('city', e.target.value)}
                          error={errors.city}
                          required
                        >
                          {mainCities.map((city) => (
                            <option key={city.value} value={city.value}>
                              {city.label}
                            </option>
                          ))}
                        </Select>
                        {data.city === 'other' && (
                          <Input
                            className="mt-2"
                            placeholder="Digite o nome da cidade"
                            onChange={(e) => setData('city', e.target.value)}
                          />
                        )}
                      </div>

                      <Select
                        label="Província"
                        value={data.state}
                        onChange={(e) => setData('state', e.target.value)}
                        error={errors.state}
                      >
                        {mozambiqueProvinces.map((prov) => (
                          <option key={prov.value} value={prov.value}>
                            {prov.label}
                          </option>
                        ))}
                      </Select>

                      <Input
                        label="Código Postal"
                        icon={MapPin}
                        value={data.postal_code}
                        onChange={(e) => setData('postal_code', e.target.value)}
                        error={errors.postal_code}
                        placeholder="1100"
                      />
                    </div>

                    <Select
                      label="País *"
                      value={data.country}
                      onChange={(e) => setData('country', e.target.value)}
                      error={errors.country}
                      required
                    >
                      {countries.map((country) => (
                        <option key={country.value} value={country.value}>
                          {country.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                {/* Billing Address */}
                <div className="pt-6 border-t border-slate-200">
                  <h3 className="mb-3 text-sm font-semibold text-slate-700">
                    Endereço de Faturação (se diferente)
                  </h3>
                  <div className="space-y-4">
                    <Input
                      label="Endereço"
                      icon={MapPin}
                      value={data.billing_address}
                      onChange={(e) => setData('billing_address', e.target.value)}
                      error={errors.billing_address}
                      placeholder="Av. Acordos de Lusaka, 567"
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                      <div className="md:col-span-2">
                        <Select
                          label="Cidade"
                          value={data.billing_city}
                          onChange={(e) => setData('billing_city', e.target.value)}
                          error={errors.billing_city}
                        >
                          {mainCities.map((city) => (
                            <option key={city.value} value={city.value}>
                              {city.label}
                            </option>
                          ))}
                        </Select>
                        {data.billing_city === 'other' && (
                          <Input
                            className="mt-2"
                            placeholder="Digite o nome da cidade"
                            onChange={(e) => setData('billing_city', e.target.value)}
                          />
                        )}
                      </div>

                      <Select
                        label="Província"
                        value={data.billing_state}
                        onChange={(e) => setData('billing_state', e.target.value)}
                        error={errors.billing_state}
                      >
                        <option value="">Selecione</option>
                        {mozambiqueProvinces.slice(1).map((prov) => (
                          <option key={prov.value} value={prov.value}>
                            {prov.label}
                          </option>
                        ))}
                      </Select>

                      <Input
                        label="Código Postal"
                        icon={MapPin}
                        value={data.billing_postal_code}
                        onChange={(e) =>
                          setData('billing_postal_code', e.target.value)
                        }
                        error={errors.billing_postal_code}
                        placeholder="2100"
                      />
                    </div>

                    <Select
                      label="País"
                      value={data.billing_country}
                      onChange={(e) => setData('billing_country', e.target.value)}
                      error={errors.billing_country}
                    >
                      <option value="">Mesmo do endereço principal</option>
                      {countries.map((country) => (
                        <option key={country.value} value={country.value}>
                          {country.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Commercial Tab */}
          {activeTab === 'commercial' && (
            <div className="p-6 bg-white border rounded-lg border-slate-200">
              <div className="flex items-center gap-2 mb-6">
                <DollarSign className="w-5 h-5 text-slate-600" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Informações Comerciais
                </h2>
              </div>

              <div className="space-y-4">
                {/* Priority & Payment Terms */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Select
                    label="Prioridade *"
                    value={data.priority}
                    onChange={(e) => setData('priority', e.target.value)}
                    error={errors.priority}
                    required
                  >
                    {Object.entries(priorities).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>

                  <Select
                    label="Termos de Pagamento *"
                    value={data.payment_terms}
                    onChange={(e) => setData('payment_terms', e.target.value)}
                    error={errors.payment_terms}
                    required
                  >
                    {Object.entries(paymentTerms).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Credit Limit & Currency */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    label="Limite de Crédito"
                    type="number"
                    icon={DollarSign}
                    value={data.credit_limit}
                    onChange={(e) => setData('credit_limit', e.target.value)}
                    error={errors.credit_limit}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />

                  <Select
                    label="Moeda Preferencial *"
                    value={data.preferred_currency}
                    onChange={(e) => setData('preferred_currency', e.target.value)}
                    error={errors.preferred_currency}
                    required
                  >
                    <option value="MZN">MZN - Metical Moçambicano</option>
                    <option value="USD">USD - Dólar Americano</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="ZAR">ZAR - Rand Sul-Africano</option>
                    <option value="GBP">GBP - Libra Esterlina</option>
                    <option value="CNY">CNY - Yuan Chinês</option>
                    <option value="AED">AED - Dirham dos EAU</option>
                    <option value="INR">INR - Rupia Indiana</option>
                  </Select>
                </div>

                {/* Assigned User */}
                <Select
                  label="Atribuído a"
                  value={data.assigned_to_user_id}
                  onChange={(e) => setData('assigned_to_user_id', e.target.value)}
                  error={errors.assigned_to_user_id}
                >
                  <option value="">Selecione um usuário</option>
                  {users?.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </Select>

                {/* Active Status */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="active"
                    checked={data.active}
                    onChange={(e) => setData('active', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="active"
                    className="text-sm font-medium text-slate-700"
                  >
                    Cliente Ativo
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Additional Information Tab */}
          {activeTab === 'additional' && (
            <div className="p-6 bg-white border rounded-lg border-slate-200">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-slate-600" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Informações Adicionais
                </h2>
              </div>

              <div className="space-y-4">
                          {/* Assigned User */}
                <Select
                  label="Prioridade do Cliente"
                  value={data.tags}
                  onChange={(e) => setData('tags', e.target.value)}
                  error={errors.tags}
                >
                  <option  disabled >Prioridade do cliente</option>
                  {priorit?.map((user) => (
                    <option key={user.id} value={user.value}>
                      {user.value}
                    </option>
                  ))}
                </Select>
                {/* Tags */}
                {/* <Input
                  label="Tags"
                  icon={Tag}
                  value={data.tags}

                  onChange={(e) => setData('tags', e.target.value)}
                  error={errors.tags}
                  placeholder="Ex: VIP, Importador, Premium (separadas por vírgula)"
                /> */}


                {/* Notes */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-700">
                    Observações
                  </label>
                  <textarea
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    rows="6"
                    className="w-full px-4 py-3 border rounded-lg resize-none border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Adicione observações importantes sobre este cliente..."
                  />
                  {errors.notes && (
                    <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6">
            <Link
              href="/clients"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors bg-white border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>{processing ? 'Salvando...' : 'Salvar Cliente'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
