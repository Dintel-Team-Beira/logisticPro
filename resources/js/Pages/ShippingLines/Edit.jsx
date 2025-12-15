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
    Package,
    CheckCircle,
} from 'lucide-react';

export default function Edit({ shippingLine }) {
    const { data, setData, put, processing, errors } = useForm({
        name: shippingLine.name || '',
        code: shippingLine.code || '',
        email: shippingLine.email || '',
        phone: shippingLine.phone || '',
        address: shippingLine.address || '',
        contact_person: shippingLine.contact_person || '',
        services: shippingLine.services || [],
        active: shippingLine.active ?? true,
    });

    // Serviços disponíveis
    const availableServices = [
        { value: 'freight', label: 'Frete Marítimo' },
        { value: 'thc', label: 'THC (Terminal Handling Charge)' },
        { value: 'storage', label: 'Armazenagem/Storage' },
        { value: 'documentation', label: 'Documentação' },
        { value: 'bl_fee', label: 'Taxa de BL' },
        { value: 'seal_fee', label: 'Taxa de Selo' },
        { value: 'inspection', label: 'Inspeção de Container' },
        { value: 'cleaning', label: 'Limpeza de Container' },
        { value: 'repair', label: 'Reparos' },
        { value: 'demurrage', label: 'Demurrage (Sobrestadia)' },
        { value: 'detention', label: 'Detention (Detenção)' },
        { value: 'vgm', label: 'VGM (Verified Gross Mass)' },
        { value: 'reefer', label: 'Serviço Reefer (Refrigerado)' },
        { value: 'hazmat', label: 'Cargas Perigosas (Hazmat)' },
        { value: 'oversized', label: 'Cargas Sobredimensionadas' },
        { value: 'customs_clearance', label: 'Desembaraço Aduaneiro' },
        { value: 'transport', label: 'Transporte Terrestre' },
        { value: 'other', label: 'Outros Serviços' },
    ];

    const handleServiceToggle = (serviceValue) => {
        const currentServices = data.services || [];
        if (currentServices.includes(serviceValue)) {
            setData('services', currentServices.filter(s => s !== serviceValue));
        } else {
            setData('services', [...currentServices, serviceValue]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/shipping-lines/${shippingLine.id}`);
    };

    return (
        <DashboardLayout>
            <Head title={`Editar ${shippingLine.name}`} />

           <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">
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

                    {/* Card 3: Serviços Oferecidos */}
                    <div className="p-6 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center gap-2 mb-6">
                            <Package className="w-5 h-5 text-slate-600" />
                            <h2 className="text-lg font-semibold text-slate-900">
                                Serviços Oferecidos
                            </h2>
                        </div>
                        <p className="mb-4 text-sm text-slate-600">
                            Selecione os serviços que esta linha de navegação oferece
                        </p>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {availableServices.map((service) => (
                                <label
                                    key={service.value}
                                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                                        data.services.includes(service.value)
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={data.services.includes(service.value)}
                                        onChange={() => handleServiceToggle(service.value)}
                                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                    />
                                    <div className="flex items-center gap-2 flex-1">
                                        {data.services.includes(service.value) && (
                                            <CheckCircle className="w-4 h-4 text-blue-600" />
                                        )}
                                        <span className={`text-sm ${
                                            data.services.includes(service.value)
                                                ? 'font-medium text-blue-900'
                                                : 'text-slate-700'
                                        }`}>
                                            {service.label}
                                        </span>
                                    </div>
                                </label>
                            ))}
                        </div>

                        {data.services.length > 0 && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm font-medium text-blue-900">
                                    ✓ {data.services.length} serviço(s) selecionado(s)
                                </p>
                            </div>
                        )}
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
