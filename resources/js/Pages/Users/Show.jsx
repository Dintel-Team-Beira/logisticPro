import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Mail,
    Shield,
    Calendar,
    Activity,
    Package,
    FileText,
    DollarSign,
    CheckCircle,
    Clock,
    MapPin,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Show({ user, stats }) {
    const [activities, setActivities] = useState(user.activities || []);
    const [loadingMore, setLoadingMore] = useState(false);

    const getRoleBadge = (role) => {
        const roles = {
            admin: { label: 'Administrador', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Shield },
            manager: { label: 'Gerente', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle },
            operations: { label: 'Operações', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Package },
            finance: { label: 'Financeiro', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: DollarSign },
            viewer: { label: 'Visualizador', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: Activity },
        };
        const config = roles[role] || roles.viewer;
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border ${config.color}`}>
                <Icon className="w-4 h-4" />
                {config.label}
            </span>
        );
    };

    const StatCard = ({ icon: Icon, label, value, color = 'blue' }) => (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm"
        >
            <div className="flex items-center gap-3">
                <div className={`p-3 bg-${color}-100 rounded-lg`}>
                    <Icon className={`w-5 h-5 text-${color}-600`} />
                </div>
                <div>
                    <p className="text-sm text-gray-600">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </motion.div>
    );

    const getActivityIcon = (action) => {
        const icons = {
            login: '🔐',
            logout: '👋',
            create: '✨',
            update: '✏️',
            delete: '🗑️',
            view: '👁️',
            approve: '✅',
            reject: '❌',
            export: '📥',
        };
        return icons[action] || '📝';
    };

    const getActivityColor = (action) => {
        const colors = {
            login: 'text-green-600 bg-green-50',
            logout: 'text-gray-600 bg-gray-50',
            create: 'text-blue-600 bg-blue-50',
            update: 'text-yellow-600 bg-yellow-50',
            delete: 'text-red-600 bg-red-50',
            view: 'text-indigo-600 bg-indigo-50',
            approve: 'text-green-600 bg-green-50',
            reject: 'text-red-600 bg-red-50',
            export: 'text-purple-600 bg-purple-50',
        };
        return colors[action] || 'text-gray-600 bg-gray-50';
    };

    return (
        <DashboardLayout>
            <Head title={`Perfil - ${user.name}`} />

            <div className="p-6 ml-5 -mt-3 space-y-6">
                {/* Back Button */}
                <Link
                    href="/users"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para Usuários
                </Link>

                {/* User Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg overflow-hidden"
                >
                    <div className="p-8 text-white">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white/30">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Mail className="w-4 h-4 opacity-80" />
                                        <span className="opacity-90">{user.email}</span>
                                    </div>
                                    {getRoleBadge(user.role)}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={Activity}
                        label="Total de Atividades"
                        value={stats.total_activities || 0}
                        color="blue"
                    />
                    <StatCard
                        icon={Package}
                        label="Processos Criados"
                        value={stats.shipments_created || 0}
                        color="emerald"
                    />
                    <StatCard
                        icon={FileText}
                        label="Documentos Enviados"
                        value={stats.documents_uploaded || 0}
                        color="purple"
                    />
                    <StatCard
                        icon={Clock}
                        label="Últimos Logins"
                        value={stats.recent_logins || 0}
                        color="amber"
                    />
                </div>

                {/* Role-specific Stats */}
                {stats.payment_requests && (
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-blue-600" />
                            Estatísticas de Pedidos de Pagamento
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-blue-600">{stats.payment_requests.total}</p>
                                <p className="text-sm text-gray-600 mt-1">Total</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-yellow-600">{stats.payment_requests.pending}</p>
                                <p className="text-sm text-gray-600 mt-1">Pendentes</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-green-600">{stats.payment_requests.approved}</p>
                                <p className="text-sm text-gray-600 mt-1">Aprovados</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-purple-600">{stats.payment_requests.paid}</p>
                                <p className="text-sm text-gray-600 mt-1">Pagos</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-red-600">{stats.payment_requests.rejected}</p>
                                <p className="text-sm text-gray-600 mt-1">Rejeitados</p>
                            </div>
                        </div>
                    </div>
                )}

                {stats.approvals && (
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            Estatísticas de Aprovações
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-green-600">{stats.approvals.total_approved}</p>
                                <p className="text-sm text-gray-600 mt-1">Aprovados</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-red-600">{stats.approvals.total_rejected}</p>
                                <p className="text-sm text-gray-600 mt-1">Rejeitados</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-yellow-600">{stats.approvals.pending_approval}</p>
                                <p className="text-sm text-gray-600 mt-1">Aguardando Aprovação</p>
                            </div>
                        </div>
                    </div>
                )}

                {stats.payments && (
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-amber-600" />
                            Estatísticas de Pagamentos
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-green-600">{stats.payments.total_processed}</p>
                                <p className="text-sm text-gray-600 mt-1">Processados</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-blue-600">{stats.payments.in_progress}</p>
                                <p className="text-sm text-gray-600 mt-1">Em Processamento</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-yellow-600">{stats.payments.pending}</p>
                                <p className="text-sm text-gray-600 mt-1">Pendentes</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Activities */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-600" />
                        Atividades Recentes
                    </h3>

                    {activities.length === 0 ? (
                        <div className="text-center py-12">
                            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">Nenhuma atividade registrada ainda</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activities.map((activity, index) => (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <div className={`p-2 rounded-lg ${getActivityColor(activity.action)}`}>
                                        <span className="text-xl">{getActivityIcon(activity.action)}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {activity.time_ago || 'Há pouco'}
                                            </span>
                                            {activity.ip_address && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {activity.ip_address}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
