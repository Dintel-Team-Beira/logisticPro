import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import Card from '@/Components/Card';
import {
    Package,
    Ship,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle2,
    AlertCircle,
    FileText,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    MapPin,
    Users,
    Building2,
    ChevronRight,
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Area,
    AreaChart,
} from 'recharts';

export default function Dashboard({ auth, stats, shipments, revenue, activities }) {
    const [period, setPeriod] = useState('month');

    // Dados de exemplo - depois você substitui por dados reais
    const revenueData = [
        { name: 'Jan', valor: 45000, despesas: 32000 },
        { name: 'Fev', valor: 52000, despesas: 35000 },
        { name: 'Mar', valor: 48000, despesas: 33000 },
        { name: 'Abr', valor: 61000, despesas: 38000 },
        { name: 'Mai', valor: 55000, despesas: 36000 },
        { name: 'Jun', valor: 67000, despesas: 41000 },
    ];

    const shipmentsStatus = [
        { name: 'Coleta', value: 12, color: '#3B82F6' },
        { name: 'Legalização', value: 8, color: '#8B5CF6' },
        { name: 'Alfândegas', value: 5, color: '#F59E0B' },
        { name: 'Concluído', value: 45, color: '#10B981' },
    ];

    const upcomingEvents = [
        { id: 1, title: 'Chegada do navio MSC MAYA', date: '2025-10-08', type: 'arrival' },
        { id: 2, title: 'Vencimento BL #253157188', date: '2025-10-10', type: 'deadline' },
        { id: 3, title: 'Reunião com MAERSK', date: '2025-10-12', type: 'meeting' },
    ];

    const kpiCards = [
        {
            title: 'Receita Total',
            value: 'MZN 234,567',
            change: '+12.5%',
            trend: 'up',
            icon: DollarSign,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
        },
        {
            title: 'Shipments Ativos',
            value: '23',
            change: '+8.2%',
            trend: 'up',
            icon: Package,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
        },
        {
            title: 'Em Alfândegas',
            value: '5',
            change: '-2.1%',
            trend: 'down',
            icon: Building2,
            color: 'from-orange-500 to-orange-600',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-600',
        },
        {
            title: 'Taxa de Conclusão',
            value: '94.2%',
            change: '+3.4%',
            trend: 'up',
            icon: CheckCircle2,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600',
        },
    ];

    const recentShipments = [
        {
            id: 1,
            reference: 'SHP-2025-00123',
            bl: 'MAEU253157188',
            vessel: 'MSC MAYA',
            status: 'in_transit',
            eta: '2025-10-15',
            value: 'MZN 45,000',
        },
        {
            id: 2,
            reference: 'SHP-2025-00122',
            bl: 'TGHU2437301',
            vessel: 'CMA AFRICA',
            status: 'customs',
            eta: '2025-10-12',
            value: 'MZN 32,800',
        },
        {
            id: 3,
            reference: 'SHP-2025-00121',
            bl: 'OOLU6234567',
            vessel: 'ONE DIAMOND',
            status: 'legalization',
            eta: '2025-10-10',
            value: 'MZN 28,500',
        },
    ];

    return (
        <DashboardLayout>
            <Head title="Dashboard" />

      <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/10 backdrop-blur-xl border-gray-200/80">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-3xl font-bold text-gray-900">
                            Dashboard
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                            Aqui está o resumo das suas operações
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="week">Esta Semana</option>
                            <option value="month">Este Mês</option>
                            <option value="year">Este Ano</option>
                        </select>
                        <Link href="/shipments/create">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-6 py-2 text-sm font-semibold text-white rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                            >
                                <Package className="inline-block w-4 h-4 mr-2" />
                                Novo Shipment
                            </motion.button>
                        </Link>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 bg-white/10 backdrop-blur-xl">
                    {kpiCards.map((kpi, index) => (
                        <motion.div
                            key={kpi.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="relative overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-xl ${kpi.bgColor}`}>
                                            <kpi.icon className={`w-6 h-6 ${kpi.textColor}`} />
                                        </div>
                                        <div className="flex items-center gap-1 text-sm font-semibold">
                                            {kpi.trend === 'up' ? (
                                                <ArrowUpRight className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <ArrowDownRight className="w-4 h-4 text-red-500" />
                                            )}
                                            <span className={kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                                                {kpi.change}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                                    <p className="mt-2 text-3xl font-bold text-gray-900">{kpi.value}</p>
                                </div>
                                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${kpi.color}`} />
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 bg-white/10 backdrop-blur-xl">
                    {/* Revenue Chart */}
                    <Card className="lg:col-span-2">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Receitas vs Despesas</h3>
                                    <p className="text-sm text-gray-600">Últimos 6 meses</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">Receitas</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">Despesas</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="valor"
                                        stroke="#3B82F6"
                                        strokeWidth={3}
                                        fill="url(#colorReceita)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="despesas"
                                        stroke="#EF4444"
                                        strokeWidth={3}
                                        fill="url(#colorDespesa)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Pie Chart */}
                    <Card>
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Status dos Shipments</h3>
                            <p className="text-sm text-gray-600">Distribuição atual</p>
                        </div>
                        <div className="p-6">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={shipmentsStatus}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {shipmentsStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="mt-4 space-y-2">
                                {shipmentsStatus.map((status) => (
                                    <div key={status.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: status.color }}
                                            />
                                            <span className="text-sm text-gray-600">{status.name}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">{status.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Recent Shipments */}
                    <Card className="lg:col-span-2">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Shipments Recentes</h3>
                                <p className="text-sm text-gray-600">Últimos registros</p>
                            </div>
                            <Link href="/shipments" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                Ver todos <ChevronRight className="inline-block w-4 h-4" />
                            </Link>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {recentShipments.map((shipment) => (
                                    <Link key={shipment.id} href={`/shipments/${shipment.id}`}>
                                        <motion.div
                                            whileHover={{ x: 4 }}
                                            className="flex items-center gap-4 p-4 transition-all border border-gray-100 rounded-lg cursor-pointer hover:shadow-md hover:border-blue-200"
                                        >
                                            <div className="p-3 bg-blue-100 rounded-lg">
                                                <Ship className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-gray-900">{shipment.reference}</p>
                                                    <StatusBadge status={shipment.status} />
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {shipment.vessel} • BL: {shipment.bl}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">{shipment.value}</p>
                                                <p className="text-sm text-gray-600">ETA: {shipment.eta}</p>
                                            </div>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Upcoming Events */}
                    <Card>
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Próximos Eventos</h3>
                            <p className="text-sm text-gray-600">Agenda importante</p>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {upcomingEvents.map((event) => (
                                    <div key={event.id} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={`
                                                    w-10 h-10 rounded-lg flex items-center justify-center
                                                    ${event.type === 'arrival' ? 'bg-blue-100' : ''}
                                                    ${event.type === 'deadline' ? 'bg-red-100' : ''}
                                                    ${event.type === 'meeting' ? 'bg-green-100' : ''}
                                                `}
                                            >
                                                {event.type === 'arrival' && (
                                                    <Ship className="w-5 h-5 text-blue-600" />
                                                )}
                                                {event.type === 'deadline' && (
                                                    <Clock className="w-5 h-5 text-red-600" />
                                                )}
                                                {event.type === 'meeting' && (
                                                    <Users className="w-5 h-5 text-green-600" />
                                                )}
                                            </div>
                                            {event.id !== upcomingEvents.length && (
                                                <div className="w-px h-8 mt-2 bg-gray-200" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-900">{event.title}</p>
                                            <p className="text-xs text-gray-600 mt-0.5">
                                                <Calendar className="inline-block w-3 h-3 mr-1" />
                                                {event.date}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}

function StatusBadge({ status }) {
    const statusConfig = {
        in_transit: { label: 'Em Trânsito', color: 'bg-blue-100 text-blue-700' },
        customs: { label: 'Alfândegas', color: 'bg-orange-100 text-orange-700' },
        legalization: { label: 'Legalização', color: 'bg-purple-100 text-purple-700' },
        completed: { label: 'Concluído', color: 'bg-green-100 text-green-700' },
    };

    const config = statusConfig[status] || statusConfig.in_transit;

    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
            {config.label}
        </span>
    );
}
