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

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'operator',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/users');
    };

    const roleOptions = [
        { value: 'admin', label: 'Administrador' },
        { value: 'manager', label: 'Gerente' },
        { value: 'operator', label: 'Operador' },
        { value: 'finance', label: 'Finança' },
    ];

    return (
        <DashboardLayout>
            <Head title="Novo Usuário" />
          <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">
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
                        Novo Usuário
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Adicione um novo usuário ao sistema
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
                                helper="Este email será usado para login no sistema"
                                required
                            />
                        </div>
                    </div>

                    {/* Card 2: Segurança */}
                    <div className="p-6 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-slate-100">
                                <Lock className="w-5 h-5 text-slate-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Segurança
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Senha de acesso
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <Input
                                type="password"
                                label="Senha"
                                icon={Lock}
                                placeholder="Mínimo 8 caracteres"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                error={errors.password}
                                helper="Use letras, números e símbolos"
                                required
                            />

                            <Input
                                type="password"
                                label="Confirmar Senha"
                                icon={Lock}
                                placeholder="Digite a senha novamente"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                error={errors.password_confirmation}
                                required
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
                                helper="Define as permissões do usuário no sistema"
                                required
                            />

                            {/* Role descriptions */}
                            <div className="p-4 mt-4 rounded-lg bg-slate-50">
                                <p className="mb-2 text-sm font-medium text-slate-900">
                                    Descrição das funções:
                                </p>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="flex items-start gap-2">
                                        <span className="font-medium text-purple-600">Administrador:</span>
                                        Acesso total ao sistema
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-medium text-blue-600">Gerente:</span>
                                        Acesso a relatórios e gestão de shipments
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-medium text-emerald-600">Operador:</span>
                                        Gestão de processos operacionais
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-medium text-slate-600">Visualizador:</span>
                                        Somente leitura
                                    </li>
                                </ul>
                            </div>
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
                            {processing ? 'Salvando...' : 'Criar Usuário'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
