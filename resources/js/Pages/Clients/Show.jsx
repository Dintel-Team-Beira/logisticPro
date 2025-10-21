import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  CreditCard,
  Calendar,
  Package,
  FileText,
  DollarSign,
  Edit,
  Trash2,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  TrendingUp,
  Clock,
  Shield,
  Activity,
  ArrowLeft,
  ChevronRight,
  Tag,
  Briefcase,
  Eye,
} from 'lucide-react';

export default function ClientShow({ client, stats }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
      router.delete(`/clients/${client.id}`);
    }
  };

  const handleToggleBlock = () => {
    if (client.blocked) {
      // Desbloquear diretamente
      router.post(`/clients/${client.id}/unblock`);
    } else {
      // Abrir modal para inserir motivo
      setShowBlockModal(true);
    }
  };

  const handleBlockSubmit = (e) => {
    e.preventDefault();

    if (!blockReason.trim()) {
      alert('Por favor, informe o motivo do bloqueio.');
      return;
    }

    setIsSubmitting(true);

    router.post(`/clients/${client.id}/block`,
      { reason: blockReason },
      {
        onSuccess: () => {
          setShowBlockModal(false);
          setBlockReason('');
          setIsSubmitting(false);
        },
        onError: () => {
          setIsSubmitting(false);
        }
      }
    );
  };

  const handleToggleActive = () => {
    router.post(`/clients/${client.id}/toggle-active`);
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: Eye },
    { id: 'shipments', label: 'Cargas', icon: Package },
    { id: 'invoices', label: 'Faturas', icon: FileText },
    { id: 'activities', label: 'Atividades', icon: Activity },
  ];

  // Priority Badge Component
  const PriorityBadge = ({ priority }) => {
    const configs = {
      vip: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'VIP' },
      high: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'ALTA' },
      medium: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'MÉDIA' },
      low: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'BAIXA' },
    };

    const config = configs[priority] || configs.medium;

    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Stat Card Component
  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-emerald-100 text-emerald-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
    };

    return (
      <div className="p-6 bg-white border rounded-lg border-slate-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
            {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    );
  };

  // Info Item Component
  const InfoItem = ({ label, value, icon: Icon }) => {
    if (!value) return null;

    return (
      <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
        {Icon && <Icon className="w-5 h-5 mt-0.5 text-slate-400" />}
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-0.5 text-sm font-medium text-slate-900">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <Head title={client.name} />

      <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">
        {/* Header Section */}
        <div className="mb-6">
          <Link
            href="/clients"
            className="inline-flex items-center gap-2 mb-4 text-sm transition-colors text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Clientes
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {/* Client Avatar */}
              <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                <Building2 className="w-8 h-8 text-white" />
              </div>

              {/* Client Info */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {client.name}
                  </h1>
                  <PriorityBadge priority={client.priority} />
                  {client.active ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  {client.blocked && (
                    <div className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
                      <Lock className="w-3 h-3" />
                      <span>BLOQUEADO</span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-slate-600">
                  {client.type_label}
                  {client.tax_id && ` • ${client.tax_id_type}: ${client.tax_id}`}
                </p>

                <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                  {client.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.website && (
                    <a
                      href={client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 transition-colors hover:text-blue-600"
                    >
                      <Globe className="w-4 h-4" />
                      <span>{client.website}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Link
                href={`/clients/${client.id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Edit className="w-4 h-4" />
                Editar
              </Link>

              <button
                onClick={handleToggleBlock}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                  client.blocked
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                }`}
              >
                {client.blocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                {client.blocked ? 'Desbloquear' : 'Bloquear'}
              </button>

              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 transition-colors bg-red-100 rounded-lg hover:bg-red-200"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total de Cargas"
            value={stats.total_shipments || 0}
            icon={Package}
            color="blue"
            subtitle="Todas"
          />
          <StatCard
            title="Cargas Ativas"
            value={stats.active_shipments || 0}
            icon={Activity}
            color="green"
            subtitle="Em andamento"
          />
          <StatCard
            title="Receita Total"
            value={`${(stats.total_revenue || 0).toLocaleString('pt-MZ')} ${client.preferred_currency}`}
            icon={TrendingUp}
            color="purple"
            subtitle="Faturado"
          />
          <StatCard
            title="Pendente"
            value={`${(stats.pending_invoices || 0).toLocaleString('pt-MZ')} ${client.preferred_currency}`}
            icon={DollarSign}
            color="orange"
            subtitle="A receber"
          />
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

        {/* Tab Content */}
        <div className="p-6 bg-white border rounded-lg border-slate-200">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Informações Detalhadas
              </h3>

              {/* Contact Information */}
              <div>
                <h4 className="flex items-center gap-2 mb-4 text-sm font-semibold text-slate-700">
                  <Phone className="w-4 h-4" />
                  Informações de Contacto
                </h4>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <InfoItem label="Email Principal" value={client.email} icon={Mail} />
                  <InfoItem label="Email Secundário" value={client.secondary_email} icon={Mail} />
                  <InfoItem label="Telefone Principal" value={client.phone} icon={Phone} />
                  <InfoItem label="Telefone Secundário" value={client.secondary_phone} icon={Phone} />
                  <InfoItem label="WhatsApp" value={client.whatsapp} icon={Phone} />
                  <InfoItem label="Website" value={client.website} icon={Globe} />
                </div>
              </div>

              {/* Address */}
              {client.address && (
                <div>
                  <h4 className="flex items-center gap-2 mb-4 text-sm font-semibold text-slate-700">
                    <MapPin className="w-4 h-4" />
                    Endereço
                  </h4>
                  <div className="p-4 rounded-lg bg-slate-50">
                    <p className="text-sm text-slate-900">{client.full_address || client.address}</p>
                    {client.city && (
                      <p className="mt-1 text-sm text-slate-600">
                        {client.city}, {client.state} {client.postal_code}
                      </p>
                    )}
                    {client.country && (
                      <p className="mt-1 text-xs text-slate-500">{client.country}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Person */}
              {client.contact_person && (
                <div>
                  <h4 className="flex items-center gap-2 mb-4 text-sm font-semibold text-slate-700">
                    <User className="w-4 h-4" />
                    Pessoa de Contacto
                  </h4>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <InfoItem label="Nome" value={client.contact_person} icon={User} />
                    <InfoItem label="Cargo" value={client.contact_position} icon={Briefcase} />
                    <InfoItem label="Telefone" value={client.contact_phone} icon={Phone} />
                    <InfoItem label="Email" value={client.contact_email} icon={Mail} />
                  </div>
                </div>
              )}

              {/* Commercial Information */}
              <div>
                <h4 className="flex items-center gap-2 mb-4 text-sm font-semibold text-slate-700">
                  <DollarSign className="w-4 h-4" />
                  Informações Comerciais
                </h4>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <InfoItem
                    label="Termos de Pagamento"
                    value={client.payment_terms_label || client.payment_terms}
                    icon={CreditCard}
                  />
                  <InfoItem
                    label="Limite de Crédito"
                    value={`${(client.credit_limit || 0).toLocaleString('pt-MZ')} ${client.preferred_currency}`}
                    icon={DollarSign}
                  />
                  <InfoItem
                    label="Moeda Preferencial"
                    value={client.preferred_currency}
                    icon={DollarSign}
                  />
                  <InfoItem label="Setor/Indústria" value={client.industry} icon={Briefcase} />
                  {client.assigned_user && (
                    <InfoItem
                      label="Responsável"
                      value={client.assigned_user.name}
                      icon={User}
                    />
                  )}
                </div>
              </div>

              {/* Tags */}
              {client.tags && (
                <div>
                  <h4 className="flex items-center gap-2 mb-4 text-sm font-semibold text-slate-700">
                    <Tag className="w-4 h-4" />
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {client.tags.split(',').map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {client.notes && (
                <div>
                  <h4 className="flex items-center gap-2 mb-4 text-sm font-semibold text-slate-700">
                    <FileText className="w-4 h-4" />
                    Observações
                  </h4>
                  <div className="p-4 rounded-lg bg-slate-50">
                    <p className="text-sm whitespace-pre-wrap text-slate-700">{client.notes}</p>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="pt-4 border-t border-slate-200">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <InfoItem
                    label="Data de Cadastro"
                    value={new Date(client.created_at).toLocaleDateString('pt-MZ')}
                    icon={Calendar}
                  />
                  <InfoItem
                    label="Última Atualização"
                    value={new Date(client.updated_at).toLocaleDateString('pt-MZ')}
                    icon={Clock}
                  />
                  <InfoItem
                    label="Status"
                    value={client.active ? 'Ativo' : 'Inativo'}
                    icon={client.active ? CheckCircle : XCircle}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Shipments Tab */}
          {activeTab === 'shipments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Cargas Recentes</h3>
                <Link
                  href={`/shipments/create?client_id=${client.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <Package className="w-4 h-4" />
                  Nova Carga
                </Link>
              </div>

              {client.shipments && client.shipments.length > 0 ? (
                <div className="space-y-3">
                  {client.shipments.map((shipment) => (
                    <Link
                      key={shipment.id}
                      href={`/shipments/${shipment.id}`}
                      className="flex items-center justify-between p-4 transition-all border rounded-lg border-slate-200 hover:shadow-md hover:border-blue-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                          <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {shipment.reference_number}
                          </p>
                          <p className="text-sm text-slate-600">BL: {shipment.bl_number}</p>
                          <p className="text-xs text-slate-500">
                            {shipment.shipping_line?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            shipment.current_phase === 'completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {shipment.phase_label || shipment.current_phase}
                        </span>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Package className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="mt-2 text-sm text-slate-600">Nenhuma carga registrada</p>
                  <Link
                    href={`/shipments/create?client_id=${client.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 mt-4 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <Package className="w-4 h-4" />
                    Criar Primeira Carga
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Faturas Recentes</h3>
                <Link
                  href={`/invoices/create?client_id=${client.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <FileText className="w-4 h-4" />
                  Nova Fatura
                </Link>
              </div>

              {client.invoices && client.invoices.length > 0 ? (
                <div className="space-y-3">
                  {client.invoices.map((invoice) => (
                    <Link
                      key={invoice.id}
                      href={`/invoices/${invoice.id}`}
                      className="flex items-center justify-between p-4 transition-all border rounded-lg border-slate-200 hover:shadow-md hover:border-blue-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                          <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {invoice.invoice_number}
                          </p>
                          <p className="text-sm text-slate-600">
                            {new Date(invoice.issue_date).toLocaleDateString('pt-MZ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-slate-900">
                          {invoice.total.toLocaleString('pt-MZ')} {invoice.currency}
                        </p>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            invoice.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-700'
                              : invoice.status === 'overdue'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {invoice.status_label || invoice.status}
                        </span>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <FileText className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="mt-2 text-sm text-slate-600">Nenhuma fatura registrada</p>
                </div>
              )}
            </div>
          )}

          {/* Activities Tab */}
          {activeTab === 'activities' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Atividades Recentes</h3>

              {client.activities && client.activities.length > 0 ? (
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />

                  <div className="space-y-4">
                    {client.activities.map((activity, index) => (
                      <div key={index} className="relative flex gap-4">
                        <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                          <Activity className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 p-4 border rounded-lg border-slate-200">
                          <p className="text-sm font-medium text-slate-900">
                            {activity.description}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {new Date(activity.created_at).toLocaleString('pt-MZ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Activity className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="mt-2 text-sm text-slate-600">Nenhuma atividade registrada</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 duration-200 bg-white shadow-2xl rounded-xl animate-in fade-in zoom-in">
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full">
                  <Lock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Bloquear Cliente
                  </h3>
                  <p className="text-sm text-slate-600">
                    {client.display_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setBlockReason('');
                }}
                className="p-1 transition-colors rounded-lg hover:bg-slate-100"
              >
                <XCircle className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleBlockSubmit}>
              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Motivo do Bloqueio *
                </label>
                <textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-3 border rounded-lg resize-none border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Ex: Cliente com pagamentos em atraso, inadimplência recorrente, documentos irregulares..."
                  required
                  autoFocus
                />
                <p className="mt-2 text-xs text-slate-500">
                  Informe o motivo do bloqueio para referência futura.
                </p>
              </div>

              {/* Alert Box */}
              <div className="flex gap-3 p-4 mb-6 rounded-lg bg-orange-50">
                <AlertCircle className="w-5 h-5 mt-0.5 text-orange-600 flex-shrink-0" />
                <div className="text-sm text-orange-800">
                  <p className="font-medium">Atenção!</p>
                  <p className="mt-1">
                    O cliente bloqueado não poderá realizar novas operações até ser desbloqueado.
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowBlockModal(false);
                    setBlockReason('');
                  }}
                  className="flex-1 px-4 py-3 text-sm font-medium transition-colors bg-white border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center flex-1 gap-2 px-4 py-3 text-sm font-medium text-white transition-colors bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                      <span>Bloqueando...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Bloquear Cliente</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
