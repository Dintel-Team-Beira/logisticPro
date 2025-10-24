import { Head, Link } from '@inertiajs/react';
import ClientPortalLayout from '@/Layouts/ClientPortalLayout';
import { Package, DollarSign, FileText, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ClientDashboard({ client, stats, recentShipments, recentInvoices, pendingQuotes }) {
    const StatCard = ({ icon: Icon, label, value, color, trend }) => (
        <motion.div
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">{label}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                    {trend && <p className="text-xs text-green-600 mt-1">↗ {trend}</p>}
                </div>
                <div className={`w-14 h-14 rounded-lg ${color} bg-opacity-10 flex items-center justify-center`}>
                    <Icon className={`h-7 w-7 ${color}`} />
                </div>
            </div>
        </motion.div>
    );

    const ShipmentCard = ({ shipment }) => {
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800',
            in_transit: 'bg-blue-100 text-blue-800',
            arrived: 'bg-green-100 text-green-800',
            completed: 'bg-gray-100 text-gray-800',
        };

        return (
            <Link href={`/client/shipments/${shipment.id}`}>
                <motion.div
                    whileHover={{ x: 4 }}
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:border-[#358c9c] hover:shadow-sm transition-all"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <Package className="h-5 w-5 text-[#358c9c]" />
                            <div>
                                <p className="font-semibold text-gray-900">{shipment.reference_number}</p>
                                <p className="text-xs text-gray-500">{shipment.type}</p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[shipment.status] || statusColors.pending}`}>
                            {shipment.status}
                        </span>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Origem:</span>
                            <span className="font-medium">{shipment.origin_port}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Destino:</span>
                            <span className="font-medium">{shipment.destination_port}</span>
                        </div>
                        <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-600">Progresso</span>
                                <span className="font-medium text-[#358c9c]">{shipment.progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#358c9c] to-[#246a77]"
                                    style={{ width: `${shipment.progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </Link>
        );
    };

    return (
        <ClientPortalLayout>
            <Head title="Dashboard" />

            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Olá, {client.company_name || client.name}! 👋
                </h1>
                <p className="text-gray-600">Bem-vindo ao seu painel de controle. Aqui está um resumo das suas operações.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={Package}
                    label="Processos Ativos"
                    value={stats.active_shipments}
                    color="text-blue-600"
                />
                <StatCard
                    icon={CheckCircle}
                    label="Processos Concluídos"
                    value={stats.completed_shipments}
                    color="text-green-600"
                />
                <StatCard
                    icon={DollarSign}
                    label="Faturas Pendentes"
                    value={stats.pending_invoices}
                    color="text-orange-600"
                />
                <StatCard
                    icon={FileText}
                    label="Cotações Pendentes"
                    value={stats.pending_quotes}
                    color="text-purple-600"
                />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Shipments */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Processos Recentes</h2>
                            <Link href="/client/shipments" className="text-sm text-[#358c9c] hover:text-[#246a77] font-medium">
                                Ver todos →
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {recentShipments.length > 0 ? (
                                recentShipments.map((shipment) => (
                                    <ShipmentCard key={shipment.id} shipment={shipment} />
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-8">Nenhum processo encontrado</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Pending Invoices */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900">Faturas Recentes</h3>
                            <Link href="/client/invoices" className="text-sm text-[#358c9c] font-medium">Ver →</Link>
                        </div>
                        <div className="space-y-3">
                            {recentInvoices.slice(0, 3).map((invoice) => (
                                <Link
                                    key={invoice.id}
                                    href={`/client/invoices/${invoice.id}`}
                                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-sm font-medium text-gray-900">{invoice.invoice_number}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                                            invoice.is_overdue ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {invoice.status}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-[#358c9c]">
                                        {invoice.amount.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                                    </p>
                                    <p className="text-xs text-gray-500">Vence: {invoice.due_date}</p>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Pending Quotes */}
                    {pendingQuotes.length > 0 && (
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="h-5 w-5 text-purple-600" />
                                <h3 className="font-bold text-gray-900">Cotações Pendentes</h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                                Você tem {pendingQuotes.length} cotação(ões) aguardando sua resposta.
                            </p>
                            <Link
                                href="/client/quotes"
                                className="block w-full text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                            >
                                Ver Cotações
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </ClientPortalLayout>
    );
}
