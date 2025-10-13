import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
  Building2, Mail, Phone, MapPin, Globe, CreditCard,
  Calendar, Package, FileText, DollarSign, Edit, Trash2,
  Lock, Unlock, CheckCircle, XCircle, AlertCircle, User,
  TrendingUp, Clock, Shield, Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ClientShow({ client, stats }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      router.delete(`/clients/${client.id}`);
    }
  };

  const handleBlock = () => {
    router.post(`/clients/${client.id}/block`, { reason: blockReason });
    setShowBlockModal(false);
  };

  const handleUnblock = () => {
    router.post(`/clients/${client.id}/unblock`);
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'shipments', label: 'Cargas' },
    { id: 'invoices', label: 'Faturas' },
    { id: 'activities', label: 'Atividades' },
  ];

  return (
    <AppLayout
      title={client.display_name}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Clientes', href: '/clients' },
        { label: client.display_name }
      ]}
    >
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {/* Client Avatar/Icon */}
              <div className="flex items-center justify-center w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                <Building2 className="w-10 h-10 text-white" />
              </div>

              {/* Client Info */}
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {client.display_name}
                  </h1>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    client.priority === 'vip'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                      : client.priority === 'high'
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                      : client.priority === 'medium'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                  }`}>
                    {client.priority.toUpperCase()}
                  </span>
                  {client.active ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  {client.blocked && (
                    <Lock className="w-5 h-5 text-red-500" />
                  )}
                </div>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {client.type_label}
                  {client.tax_id && ` • NIF: ${client.tax_id}`}
                </p>

                <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  {client.email && (
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.website && (
                    <a
                      href={client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 transition-colors hover:text-blue-600"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Website</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Link
                href={`/clients/${client.id}/edit`}
                className="inline-flex items-center px-4 py-2 space-x-2 text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Edit className="w-4 h-4" />
                <span>Editar</span>
              </Link>

              {client.blocked ? (
                <button
                  onClick={handleUnblock}
                  className="inline-flex items-center px-4 py-2 space-x-2 text-white transition-all bg-green-600 rounded-lg hover:bg-green-700"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Desbloquear</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowBlockModal(true)}
                  className="inline-flex items-center px-4 py-2 space-x-2 text-white transition-all bg-orange-600 rounded-lg hover:bg-orange-700"
                >
                  <Lock className="w-4 h-4" />
                  <span>Bloquear</span>
                </button>
              )}

              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 space-x-2 text-white transition-all bg-red-600 rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
              </button>
            </div>
          </div>

          {/* Alert if blocked */}
          {client.blocked && (
            <div className="flex items-center p-4 mt-4 space-x-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-600">Cliente Bloqueado</p>
                {client.blocked_reason && (
                  <p className="text-sm text-red-500">{client.blocked_reason}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total de Cargas"
            value={stats.total_shipments}
            icon={Package}
            color="blue"
            subtitle="Todas as cargas"
          />
          <StatCard
            title="Cargas Ativas"
            value={stats.active_shipments}
            icon={Activity}
            color="green"
            subtitle="Em processamento"
          />
          <StatCard
            title="Receita Total"
            value={`${stats.total_revenue.toLocaleString('pt-MZ')} ${client.preferred_currency}`}
            icon={TrendingUp}
            color="purple"
            subtitle="Faturado"
          />
          <StatCard
            title="Faturas Pendentes"
            value={`${stats.pending_invoices.toLocaleString('pt-MZ')} ${client.preferred_currency}`}
            icon={DollarSign}
            color="orange"
            subtitle="A receber"
          />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Left Column - Details */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-4 font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6 bg-white rounded-xl dark:bg-gray-800">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Informações Detalhadas
                  </h3>

                  {/* Contact Information */}
                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Informações de Contato
                    </h4>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <InfoItem label="Email" value={client.email} />
                      <InfoItem label="Email Secundário" value={client.secondary_email} />
                      <InfoItem label="Telefone" value={client.phone} />
                      <InfoItem label="Telefone Secundário" value={client.secondary_phone} />
                      <InfoItem label="WhatsApp" value={client.whatsapp} />
                      <InfoItem label="Website" value={client.website} />
                    </div>
                  </div>

                  {/* Address */}
                  {client.address && (
                    <div>
                      <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Endereço
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {client.full_address}
                      </p>
                    </div>
                  )}

                  {/* Contact Person */}
                  {client.contact_person && (
                    <div>
                      <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Pessoa de Contato
                      </h4>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <InfoItem label="Nome" value={client.contact_person} />
                        <InfoItem label="Cargo" value={client.contact_position} />
                        <InfoItem label="Telefone" value={client.contact_phone} />
                        <InfoItem label="Email" value={client.contact_email} />
                      </div>
                    </div>
                  )}

                  {/* Commercial Info */}
                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Informações Comerciais
                    </h4>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <InfoItem label="Termos de Pagamento" value={client.payment_terms} />
                      <InfoItem
                        label="Limite de Crédito"
                        value={`${client.credit_limit.toLocaleString('pt-MZ')} ${client.preferred_currency}`}
                      />
                      <InfoItem label="Moeda Preferida" value={client.preferred_currency} />
                      <InfoItem label="Setor" value={client.industry} />
                    </div>
                  </div>

                  {/* Notes */}
                  {client.notes && (
                    <div>
                      <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Observações
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {client.notes}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {client.tags && (
                    <div>
                      <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {client.tags.split(',').map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full dark:bg-blue-900/30 dark:text-blue-400"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'shipments' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Cargas Recentes
                    </h3>
                    <Link
                      href={`/shipments/create?client_id=${client.id}`}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Nova Carga
                    </Link>
                  </div>

                  {client.shipments && client.shipments.length > 0 ? (
                    <div className="space-y-3">
                      {client.shipments.map((shipment) => (
                        <Link
                          key={shipment.id}
                          href={`/shipments/${shipment.id}`}
                          className="block p-4 transition-all border border-gray-200 rounded-lg dark:border-gray-700 hover:shadow-md"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {shipment.reference_number}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {shipment.bl_number}
                              </p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              shipment.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : shipment.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {shipment.status}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <Package className="w-12 h-12 mx-auto text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Nenhuma carga encontrada
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'invoices' && (
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Faturas
                  </h3>

                  {client.invoices && client.invoices.length > 0 ? (
                    <div className="space-y-3">
                      {client.invoices.map((invoice) => (
                        <div
                          key={invoice.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-700"
                        >
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Fatura #{invoice.invoice_number}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {invoice.created_at_formatted}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {invoice.total_amount} {invoice.currency}
                            </p>
                            <span className={`text-xs font-medium ${
                              invoice.status === 'paid'
                                ? 'text-green-600'
                                : invoice.status === 'overdue'
                                ? 'text-red-600'
                                : 'text-orange-600'
                            }`}>
                              {invoice.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <FileText className="w-12 h-12 mx-auto text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Nenhuma fatura encontrada
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'activities' && (
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Atividades Recentes
                  </h3>
                  <div className="py-12 text-center">
                    <Activity className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Nenhuma atividade recente
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Quick Info */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="p-6 bg-white rounded-xl dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Resumo
              </h3>
              <div className="space-y-4">
                <QuickStat
                  label="Cliente desde"
                  value={client.created_at_formatted}
                  icon={Calendar}
                />
                <QuickStat
                  label="Última interação"
                  value={client.last_interaction_formatted || 'Nunca'}
                  icon={Clock}
                />
                <QuickStat
                  label="Status"
                  value={client.active ? 'Ativo' : 'Inativo'}
                  icon={client.active ? CheckCircle : XCircle}
                  color={client.active ? 'green' : 'red'}
                />
                {client.assigned_user && (
                  <QuickStat
                    label="Responsável"
                    value={client.assigned_user.name}
                    icon={User}
                  />
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-6 bg-white rounded-xl dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Ações Rápidas
              </h3>
              <div className="space-y-2">
                <Link
                  href={`/shipments/create?client_id=${client.id}`}
                  className="flex items-center w-full px-4 py-2 space-x-2 text-left transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Package className="w-4 h-4" />
                  <span className="text-sm">Nova Carga</span>
                </Link>
                <Link
                  href={`/invoices/create?client_id=${client.id}`}
                  className="flex items-center w-full px-4 py-2 space-x-2 text-left transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">Nova Fatura</span>
                </Link>
                <button
                  onClick={() => window.location.href = `mailto:${client.email}`}
                  className="flex items-center w-full px-4 py-2 space-x-2 text-left transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">Enviar Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Block Modal */}
        {showBlockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white rounded-lg dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Bloquear Cliente
              </h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Informe o motivo do bloqueio:
              </p>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Motivo do bloqueio..."
              />
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg dark:bg-gray-700 dark:text-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleBlock}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Bloquear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color, subtitle }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="p-6 bg-white rounded-xl dark:bg-gray-800">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </p>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// Info Item Component
function InfoItem({ label, value }) {
  if (!value) return null;

  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

// Quick Stat Component
function QuickStat({ label, value, icon: Icon, color = 'gray' }) {
  const colorClasses = {
    green: 'text-green-600',
    red: 'text-red-600',
    gray: 'text-gray-600 dark:text-gray-400',
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Icon className={`w-4 h-4 ${colorClasses[color]}`} />
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        {value}
      </span>
    </div>
  );
}
