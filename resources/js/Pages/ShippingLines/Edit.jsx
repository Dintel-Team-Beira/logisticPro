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

export default function Edit({ shippingLine }) {
    const { data, setData, put, processing, errors } = useForm({
        name: shippingLine.name || '',
        code: shippingLine.code || '',
        email: shippingLine.email || '',
        phone: shippingLine.phone || '',
        address: shippingLine.address || '',
        contact_person: shippingLine.contact_person || '',
        active: shippingLine.active ?? true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/shipping-lines/${shippingLine.id}`);
    };

    return (
        <DashboardLayout>
            <Head title={`Editar ${shippingLine.name}`} />

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
                        Editar Linha de Navegação
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Atualize as informações de {shippingLine.name}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
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
                                <div className="flex-1">
                                    <label htmlFor="active" className="text-sm font-medium text-slate-700">
                                        Linha ativa
                                    </label>
                                    <p className="text-xs text-slate-500">
                                        Linhas inativas não aparecem na criação de novos shipments
                                    </p>
                                </div>
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
                    <div className="flex items-center justify-between">
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
                            {processing ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
