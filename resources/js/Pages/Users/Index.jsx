import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    Plus,
    Search,
    Users as UsersIcon,
    Edit,
    Trash2,
    Shield,
    User,
} from 'lucide-react';

export default function Index({ users }) {
    const handleDelete = (userId) => {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            router.delete(`/users/${userId}`);
        }
    };

    const getRoleBadge = (role) => {
        const roles = {
            admin: { label: 'Admin', color: 'bg-purple-100 text-purple-700 border-purple-200' },
            manager: { label: 'Gerente', color: 'bg-blue-100 text-blue-700 border-blue-200' },
            operator: { label: 'Operador', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
            viewer: { label: 'Visualizador', color: 'bg-slate-100 text-slate-700 border-slate-200' },
        };
        const config = roles[role] || roles.viewer;
        return (
            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md border ${config.color}`}>
                {config.label}
            </span>
        );
    };

    return (
        <DashboardLayout>
            <Head title="Usuários" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Usuários
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Gerencie os usuários do sistema
                        </p>
                    </div>
                    <Link href="/users/create">
                        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors duration-200">
                            <Plus className="w-4 h-4" />
                            Novo Usuário
                        </button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="p-4 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Total</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-900">
                                    {users.total || 0}
                                </p>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-100">
                                <UsersIcon className="w-5 h-5 text-slate-600" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Admins</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-900">2</p>
                            </div>
                            <div className="p-2 rounded-lg bg-purple-50">
                                <Shield className="w-5 h-5 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Gerentes</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-900">3</p>
                            </div>
                            <div className="p-2 rounded-lg bg-blue-50">
                                <UsersIcon className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Operadores</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-900">8</p>
                            </div>
                            <div className="p-2 rounded-lg bg-emerald-50">
                                <User className="w-5 h-5 text-emerald-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden bg-white border rounded-lg border-slate-200">
                    <table className="w-full">
                        <thead className="border-b bg-slate-50 border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600">
                                    Nome
                                </th>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600">
                                    Email
                                </th>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600">
                                    Função
                                </th>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600">
                                    Criado em
                                </th>
                                <th className="px-4 py-3 text-xs font-medium tracking-wider text-right uppercase text-slate-600">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {users.data && users.data.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-12 text-center">
                                        <UsersIcon className="w-12 h-12 mx-auto text-slate-300" />
                                        <h3 className="mt-2 text-sm font-medium text-slate-900">
                                            Nenhum usuário encontrado
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Comece criando um novo usuário
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                users.data.map((user) => (
                                    <tr key={user.id} className="transition-colors hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center w-10 h-10 font-semibold text-white rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <p className="text-sm font-medium text-slate-900">
                                                    {user.name}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {user.email}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {user.created_at}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/users/${user.id}/edit`}>
                                                    <button className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
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
                </div>

                {/* Pagination */}
                {users.links && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600">
                            Mostrando {users.from || 0} a {users.to || 0} de {users.total || 0} resultados
                        </p>
                        <div className="flex gap-1">
                            {users.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`
                                        px-3 py-1.5 text-sm rounded-md transition-colors
                                        ${link.active
                                            ? 'bg-slate-900 text-white'
                                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                                        }
                                        ${!link.url && 'opacity-50 cursor-not-allowed'}
                                    `}
                                    preserveState
                                    disabled={!link.url}
                                >
                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
