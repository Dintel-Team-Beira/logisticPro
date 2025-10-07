import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Input from '@/Components/Forms/Input';
import {
    ArrowLeft,
    Save,
    Ship,
    Mail,
    Phone,
    MapPin,
    User,
    Hash,
} from 'lucide-react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        email: '',
        phone: '',
        address: '',
        contact_person: '',
        active: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/shipping-lines');
    };

    // Sugestões de linhas populares
    const popularLines = [
        { name: 'MAERSK', code: 'MAEU' },
        { name: 'CMA CGM', code: 'CMDU' },
        { name: 'PIL (Pacific International Lines)', code: 'PIL' },
        { name: 'MSC (Mediterranean Shipping Company)', code: 'MSCU' },
        { name: 'COSCO', code: 'COSU' },
        { name: 'ONE (Ocean Network Express)', code: 'ONE' },
        { name: 'MANICA', code: 'MANI' },
    ];

    const fillWithTemplate = (template) => {
        setData({
            ...data,
            name: template.name,
            code: template.code,
        });
    };

    return (
        <DashboardLayout>
            <Head title="Nova Linha de Navegação" />

            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/shipping-lines"
                        className="inline-flex items-center gap-2 mb-4 text-sm transition-colors text-slate-600 hover:text-slate-900"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para Linhas de Navegação
                    </Link>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Nova Linha de Navegação
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Adicione uma nova companhia de navegação marítima ao sistema
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Formulário Principal */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Card 1: Informações Básicas */}
                            <div className="p-6 bg-white border rounded-lg border-slate-200">
                                <div className="flex items-center gap-2 mb-6">
                                    <Ship className="w-5 h-5 text-slate-600" />
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Informações Básicas
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    <Input
                                        label="Nome da Linha *"
                                        icon={Ship}
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        error={errors.name}
                                        placeholder="Ex: MAERSK, CMA CGM, MSC..."
                                        required
                                    />

                                    <Input
                                        label="Código SCAC *"
                                        icon={Hash}
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                        error={errors.code}
                                        placeholder="Ex: MAEU, CMDU, MSCU..."
                                        maxLength={10}
                                        required
                                        helper="Código de 2-4 letras (Standard Carrier Alpha Code)"
                                    />

                                    <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50">
                                        <input
                                            type="checkbox"
                                            id="active"
                                            checked={data.active}
                                            onChange={(e) => setData('active', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                        />
                                        <label htmlFor="active" className="text-sm font-medium text-slate-700">
                                            Linha ativa (disponível para novos shipments)
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Contato */}
                            <div className="p-6 bg-white border rounded-lg border-slate-200">
                                <div className="flex items-center gap-2 mb-6">
                                    <Mail className="w-5 h-5 text-slate-600" />
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Informações de Contato
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    <Input
                                        label="Email"
                                        type="email"
                                        icon={Mail}
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        error={errors.email}
                                        placeholder="contato@linha.com"
                                    />

                                    <Input
                                        label="Telefone"
                                        icon={Phone}
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        error={errors.phone}
                                        placeholder="+258 84 123 4567"
                                    />

                                    <Input
                                        label="Pessoa de Contato"
                                        icon={User}
                                        value={data.contact_person}
                                        onChange={(e) => setData('contact_person', e.target.value)}
                                        error={errors.contact_person}
                                        placeholder="Nome do representante"
                                    />

                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-slate-700">
                                            Endereço
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute w-4 h-4 text-slate-400 left-3 top-3" />
                                            <textarea
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                                rows="3"
                                                className="w-full py-2 pl-10 pr-4 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                                placeholder="Endereço completo do escritório"
                                            />
                                        </div>
                                        {errors.address && (
                                            <p className="mt-1 text-xs text-red-600">{errors.address}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3">
                                <Link href="/shipping-lines">
                                    <button
                                        type="button"
                                        className="px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors bg-white border rounded-lg border-slate-300 hover:bg-slate-50"
                                    >
                                        Cancelar
                                    </button>
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="w-4 h-4" />
                                    {processing ? 'Salvando...' : 'Criar Linha'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Sidebar: Templates */}
                    <div className="space-y-6">
                        <div className="p-6 bg-white border rounded-lg border-slate-200">
                            <h3 className="mb-4 text-sm font-semibold text-slate-900">
                                📋 Templates Rápidos
                            </h3>
                            <p className="mb-4 text-xs text-slate-500">
                                Clique para preencher automaticamente com linhas populares
                            </p>
                            <div className="space-y-2">
                                {popularLines.map((line, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => fillWithTemplate(line)}
                                        className="w-full px-3 py-2 text-sm text-left transition-colors border rounded-lg text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-blue-300"
                                    >
                                        <div className="font-medium">{line.name}</div>
                                        <div className="text-xs text-slate-500">Código: {line.code}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 border border-blue-200 rounded-lg bg-blue-50">
                            <h3 className="mb-2 text-sm font-semibold text-blue-900">
                                💡 Dica
                            </h3>
                            <p className="text-xs text-blue-700">
                                O código SCAC é usado para identificar a linha nos sistemas internacionais.
                                Use os códigos oficiais da NMFTA (National Motor Freight Traffic Association).
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
