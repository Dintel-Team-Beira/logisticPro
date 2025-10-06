import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import Card from '@/Components/Card';
import {
    Package,
    FileText,
    Building2,
    CheckCircle2,
    Clock,
    TrendingUp,
    AlertCircle,
    Ship
} from 'lucide-react';

export default function Dashboard({ auth, stats }) {
    const [timeRange, setTimeRange] = useState('month');

    const statCards = [
        {
            title: 'Shipments Ativos',
            value: stats?.active || 12,
            icon: Package,
            color: 'blue',
            trend: '+12%',
            bgGradient: 'from-blue-500 to-blue-600'
        },
        {
            title: 'Aguardando Legalização',
            value: stats?.pending_legalization || 5,
            icon: FileText,
            color: 'yellow',
            trend: '-3%',
            bgGradient: 'from-yellow-500 to-yellow-600'
        },
        {
            title: 'Em Alfândega',
            value: stats?.in_customs || 3,
            icon: Building2,
            color: 'orange',
            trend: '+5%',
            bgGradient: 'from-orange-500 to-orange-600'
        },
        {
            title: 'Concluídos (mês)',
            value: stats?.completed_month || 28,
            icon: CheckCircle2,
            color: 'green',
            trend: '+18%',
            bgGradient: 'from-green-500 to-green-600'
        },
    ];

    const recentActivities = [
        {
            id: 1,
            action: 'Novo shipment criado',
            shipment: 'SHP-2025-00123',
            user: 'Arnaldo Tomo',
            time: '2 minutos atrás',
            icon: Package,
            color: 'blue'
        },
        {
            id: 2,
            action: 'Documento enviado',
            shipment: 'SHP-2025-00122',
            user: 'Maria Silva',
            time: '15 minutos atrás',
            icon: FileText,
            color: 'green'
        },
        {
            id: 3,
            action: 'Stage atualizado',
            shipment: 'SHP-2025-00121',
            user: 'João Santos',
            time: '1 hora atrás',
            icon: Clock,
            color: 'purple'
        },
    ];

    return (
        <AppLayout auth={auth}>
            <Head title="Dashboard" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text">
                                    Bem-vindo de volta, {auth.user.name}! 👋
                                </h1>
                                <p className="mt-2 text-gray-600">
                                    Aqui está o resumo das suas operações de hoje
                                </p>
                            </div>
                            <Link href="/shipments/create">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-6 py-3 font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60"
                                >
                                    <Ship className="inline-block w-5 h-5 mr-2" />
                                    Novo Shipment
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
                        {statCards.map((stat, index) => (
                            <motion.div
                                key={stat.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="relative overflow-hidden group">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.bgGradient} shadow-lg`}>
                                                <stat.icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex items-center gap-1 text-sm font-semibold">
                                                <TrendingUp className="w-4 h-4 text-green-500" />
                                                <span className={stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                                                    {stat.trend}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="mb-1 text-sm font-medium text-gray-600">{stat.title}</p>
                                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                    </div>
                                    {/* Decorative gradient */}
                                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Recent Activities */}
                        <div className="lg:col-span-2">
                            <Card>
                                <div className="p-6 border-b border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Atividades Recentes
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {recentActivities.map((activity, index) => (
                                            <motion.div
                                                key={activity.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="flex items-start gap-4 p-4 transition-colors rounded-lg cursor-pointer hover:bg-gray-50"
                                            >
                                                <div className={`p-2 rounded-lg bg-${activity.color}-100`}>
                                                    <activity.icon className={`h-5 w-5 text-${activity.color}-600`} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900">{activity.action}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {activity.shipment} • {activity.user}
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-400">{activity.time}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <Link
                                        href="/activities"
                                        className="block mt-6 font-medium text-center text-blue-600 hover:text-blue-700"
                                    >
                                        Ver todas as atividades →
                                    </Link>
                                </div>
                            </Card>
                        </div>

                        {/* Quick Actions & Alerts */}
                        <div className="space-y-6">
                            {/* Quick Actions */}
                            <Card>
                                <div className="p-6 border-b border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Ações Rápidas
                                    </h2>
                                </div>
                                <div className="p-6 space-y-3">
                                    <QuickActionButton
                                        href="/shipments/create"
                                        icon={Package}
                                        label="Novo Shipment"
                                        color="blue"
                                    />
                                    <QuickActionButton
                                        href="/invoices"
                                        icon={FileText}
                                        label="Ver Faturas"
                                        color="green"
                                    />
                                    <QuickActionButton
                                        href="/reports"
                                        icon={TrendingUp}
                                        label="Relatórios"
                                        color="purple"
                                    />
                                </div>
                            </Card>

                            {/* Alerts */}
                            <Card>
                                <div className="p-6 border-b border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Alertas
                                    </h2>
                                </div>
                                <div className="p-6 space-y-3">
                                    <AlertItem
                                        type="warning"
                                        message="3 shipments aguardando documentos"
                                        action="Ver shipments"
                                    />
                                    <AlertItem
                                        type="danger"
                                        message="2 faturas vencidas"
                                        action="Pagar agora"
                                    />
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function QuickActionButton({ href, icon: Icon, label, color }) {
    return (
        <Link href={href}>
            <motion.div
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 p-3 rounded-lg bg-${color}-50 hover:bg-${color}-100 transition-colors cursor-pointer`}
            >
                <Icon className={`h-5 w-5 text-${color}-600`} />
                <span className="font-medium text-gray-900">{label}</span>
            </motion.div>
        </Link>
    );
}

function AlertItem({ type, message, action }) {
    const colors = {
        warning: 'yellow',
        danger: 'red',
        info: 'blue'
    };
    const color = colors[type];

    return (
        <div className={`p-3 rounded-lg bg-${color}-50 border border-${color}-200`}>
            <div className="flex items-start gap-2">
                <AlertCircle className={`h-5 w-5 text-${color}-600 flex-shrink-0 mt-0.5`} />
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{message}</p>
                    <button className={`text-xs text-${color}-600 hover:text-${color}-700 font-medium mt-1`}>
                        {action} →
                    </button>
                </div>
            </div>
        </div>
    );
}
