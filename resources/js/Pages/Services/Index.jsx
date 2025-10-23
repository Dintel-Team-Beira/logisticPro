import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Plus, Search, Edit, Trash2, Power, PowerOff, Package } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Index({ services, stats }) {
    const handleDelete = (serviceId) => {
        if (confirm('Tem certeza que deseja excluir este serviço?')) {
            router.delete(`/services/${serviceId}`);
        }
    };

    const handleToggle = (serviceId) => {
        router.post(`/services/${serviceId}/toggle`);
    };

    const getCategoryBadge = (category) => {
        const categories = {
            freight: { label: 'Frete', color: 'bg-blue-100 text-blue-700' },
            customs: { label: 'Alfândega', color: 'bg-purple-100 text-purple-700' },
            warehousing: { label: 'Armazenagem', color: 'bg-amber-100 text-amber-700' },
            handling: { label: 'Manuseio', color: 'bg-green-100 text-green-700' },
            transport: { label: 'Transporte', color: 'bg-indigo-100 text-indigo-700' },
            insurance: { label: 'Seguro', color: 'bg-red-100 text-red-700' },
            documentation: { label: 'Documentação', color: 'bg-yellow-100 text-yellow-700' },
            inspection: { label: 'Inspeção', color: 'bg-pink-100 text-pink-700' },
            consulting: { label: 'Consultoria', color: 'bg-teal-100 text-teal-700' },
            other: { label: 'Outros', color: 'bg-gray-100 text-gray-700' },
        };
        const config = categories[category] || categories.other;
        return (
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${config.color}`}>
                {config.label}
            </span>
        );
    };

    return (
        <DashboardLayout>
            <Head title="Catálogo de Serviços" />

            <div className="p-6 ml-5 -mt-3 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Catálogo de Serviços
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Gerencie os serviços disponíveis para cotações
                        </p>
                    </div>
                    <Link href="/services/create">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors duration-200"
                        >
                            <Plus className="w-4 h-4" />
                            Novo Serviço
                        </motion.button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-white border rounded-lg border-slate-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Total de Serviços</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-900">
                                    {stats?.total || 0}
                                </p>
                            </div>
                            <div className="p-2 rounded-lg bg-blue-100">
                                <Package className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-4 bg-white border rounded-lg border-slate-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Ativos</p>
                                <p className="mt-1 text-2xl font-semibold text-green-600">
                                    {stats?.active || 0}
                                </p>
                            </div>
                            <div className="p-2 rounded-lg bg-green-100">
                                <Power className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-4 bg-white border rounded-lg border-slate-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Inativos</p>
                                <p className="mt-1 text-2xl font-semibold text-red-600">
                                    {(stats?.total || 0) - (stats?.active || 0)}
                                </p>
                            </div>
                            <div className="p-2 rounded-lg bg-red-100">
                                <PowerOff className="w-5 h-5 text-red-600" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Table */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="overflow-hidden bg-white border rounded-lg border-slate-200"
                >
                    <table className="w-full">
                        <thead className="border-b bg-slate-50 border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600">
                                    Código
                                </th>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600">
                                    Nome
                                </th>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600">
                                    Categoria
                                </th>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-right uppercase text-slate-600">
                                    Preço
                                </th>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-center uppercase text-slate-600">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-right uppercase text-slate-600">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {services.data && services.data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-12 text-center">
                                        <Package className="w-12 h-12 mx-auto text-slate-300" />
                                        <h3 className="mt-2 text-sm font-medium text-slate-900">
                                            Nenhum serviço encontrado
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Comece criando um novo serviço
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                services.data?.map((service) => (
                                    <tr key={service.id} className="transition-colors hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm font-mono font-medium text-slate-900">
                                            {service.code}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-slate-900">
                                                {service.name}
                                            </p>
                                            {service.description && (
                                                <p className="text-xs text-slate-500 line-clamp-1">
                                                    {service.description}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getCategoryBadge(service.category)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right text-slate-900">
                                            <span className="font-semibold">
                                                {Number(service.unit_price).toLocaleString('pt-MZ', {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </span>
                                            <span className="text-slate-500"> MZN/{service.unit}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleToggle(service.id)}
                                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                                                    service.is_active
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                }`}
                                            >
                                                {service.is_active ? 'Ativo' : 'Inativo'}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/services/${service.id}/edit`}>
                                                    <button className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(service.id)}
                                                    className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {services.links && services.data?.length > 0 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
                            <p className="text-sm text-slate-600">
                                Mostrando {services.from || 0} a {services.to || 0} de {services.total || 0} serviços
                            </p>
                            <div className="flex gap-2">
                                {services.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                            link.active
                                                ? 'bg-slate-900 text-white'
                                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
