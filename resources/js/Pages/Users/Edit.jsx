import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Input from '@/Components/Forms/Input';
import Select from '@/Components/Forms/Select';
import {
    ArrowLeft,
    Save,
    User,
    Mail,
    Lock,
    Shield,
} from 'lucide-react';

export default function Edit({ user }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        role: user.role || 'operator',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/users/${user.id}`);
    };

    const roleOptions = [
        { value: 'admin', label: 'Administrador' },
        { value: 'manager', label: 'Gerente' },
        { value: 'operator', label: 'Operador' },
        { value: 'viewer', label: 'Visualizador' },
    ];

    return (
        <DashboardLayout>
            <Head title={`Editar ${user.name}`} />

            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/users"
                        className="inline-flex items-center gap-2 mb-4 text-sm transition-colors text-slate-600 hover:text-slate-900"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para Usuários
                    </Link>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Editar Usuário
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Atualize as informações do usuário
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Card 1: Informações Pessoais */}
                    <div className="p-6 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-slate-100">
                                <User className="w-5 h-5 text-slate-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Informações Pessoais
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Dados do usuário
                                </p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <Input
                                label="Nome Completo"
                                icon={User}
                                placeholder="Ex: João Silva"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={errors.name}
                                required
                            />

                            <Input
                                type="email"
                                label="Email"
                                icon={Mail}
                                placeholder="Ex: joao@exemplo.com"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                error={errors.email}
                                required
                            />
                        </div>
                    </div>

                    {/* Card 2: Alterar Senha (Opcional) */}
                    <div className="p-6 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-slate-100">
                                <Lock className="w-5 h-5 text-slate-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Alterar Senha
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Deixe em branco para manter a senha atual
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <Input
                                type="password"
                                label="Nova Senha"
                                icon={Lock}
                                placeholder="Mínimo 8 caracteres"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                error={errors.password}
                                helper="Deixe em branco para não alterar"
                            />

                            <Input
                                type="password"
                                label="Confirmar Nova Senha"
                                icon={Lock}
                                placeholder="Digite a senha novamente"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                error={errors.password_confirmation}
                            />
                        </div>
                    </div>

                    {/* Card 3: Permissões */}
                    <div className="p-6 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-slate-100">
                                <Shield className="w-5 h-5 text-slate-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Permissões
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Nível de acesso no sistema
                                </p>
                            </div>
                        </div>

                        <div>
                            <Select
                                label="Função"
                                options={roleOptions}
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                error={errors.role}
                                required
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Link href="/users">
                            <button
                                type="button"
                                className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors duration-200"
                            >
                                Cancelar
                            </button>
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" />
                            {processing ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
