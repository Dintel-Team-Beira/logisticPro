import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Input from '@/Components/Forms/Input';
import Select from '@/Components/Forms/Select';
import {
    ArrowLeft,
    Save,
    Ship,
    Package,
    Calendar,
    MapPin,
    FileText,
} from 'lucide-react';

export default function Create({ shippingLines }) {
    const { data, setData, post, processing, errors } = useForm({
        shipping_line_id: '',
        bl_number: '',
        container_number: '',
        vessel_name: '',
        arrival_date: '',
        origin_port: '',
        destination_port: '',
        cargo_description: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/shipments');
    };

    return (
        <DashboardLayout>
            <Head title="Novo Shipment" />

            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/shipments"
                        className="inline-flex items-center gap-2 mb-4 text-sm transition-colors text-slate-600 hover:text-slate-900"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para Shipments
                    </Link>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Novo Shipment
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Crie um novo shipment no sistema
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Card 1: Informações da Linha de Navegação */}
                    <div className="p-6 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center gap-2 mb-4">
                            <Ship className="w-5 h-5 text-slate-600" />
                            <h2 className="text-lg font-semibold text-slate-900">
                                Linha de Navegação
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Select
                                label="Linha de Navegação *"
                                value={data.shipping_line_id}
                                onChange={(e) => setData('shipping_line_id', e.target.value)}
                                error={errors.shipping_line_id}
                                required
                            >
                                <option value="">Selecione uma linha</option>
                                {shippingLines?.map((line) => (
                                    <option key={line.id} value={line.id}>
                                        {line.name}
                                    </option>
                                ))}
                            </Select>

                            <Input
                                label="Nome do Navio"
                                icon={Ship}
                                value={data.vessel_name}
                                onChange={(e) => setData('vessel_name', e.target.value)}
                                error={errors.vessel_name}
                                placeholder="Ex: MSC MAYA"
                            />
                        </div>
                    </div>

                    {/* Card 2: Documentação */}
                    <div className="p-6 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="w-5 h-5 text-slate-600" />
                            <h2 className="text-lg font-semibold text-slate-900">
                                Documentação
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Input
                                label="Número do BL"
                                icon={FileText}
                                value={data.bl_number}
                                onChange={(e) => setData('bl_number', e.target.value)}
                                error={errors.bl_number}
                                placeholder="Ex: 253157188"
                            />

                            <Input
                                label="Número do Container"
                                icon={Package}
                                value={data.container_number}
                                onChange={(e) => setData('container_number', e.target.value)}
                                error={errors.container_number}
                                placeholder="Ex: TCLU2437301"
                            />
                        </div>
                    </div>

                    {/* Card 3: Rota e Data */}
                    <div className="p-6 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="w-5 h-5 text-slate-600" />
                            <h2 className="text-lg font-semibold text-slate-900">
                                Rota e Cronograma
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <Input
                                label="Porto de Origem"
                                icon={MapPin}
                                value={data.origin_port}
                                onChange={(e) => setData('origin_port', e.target.value)}
                                error={errors.origin_port}
                                placeholder="Ex: QINGDAO, CHINA"
                            />

                            <Input
                                label="Porto de Destino"
                                icon={MapPin}
                                value={data.destination_port}
                                onChange={(e) => setData('destination_port', e.target.value)}
                                error={errors.destination_port}
                                placeholder="Ex: BEIRA, MOZAMBIQUE"
                            />

                            <Input
                                type="date"
                                label="Data de Chegada (ETA)"
                                icon={Calendar}
                                value={data.arrival_date}
                                onChange={(e) => setData('arrival_date', e.target.value)}
                                error={errors.arrival_date}
                            />
                        </div>
                    </div>

                    {/* Card 4: Descrição da Carga */}
                    <div className="p-6 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center gap-2 mb-4">
                            <Package className="w-5 h-5 text-slate-600" />
                            <h2 className="text-lg font-semibold text-slate-900">
                                Descrição da Carga
                            </h2>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-700">
                                Descrição
                            </label>
                            <textarea
                                value={data.cargo_description}
                                onChange={(e) => setData('cargo_description', e.target.value)}
                                rows="4"
                                className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                placeholder="Descreva o conteúdo da carga..."
                            />
                            {errors.cargo_description && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.cargo_description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Link href="/shipments">
                            <button
                                type="button"
                                className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Cancelar
                            </button>
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" />
                            {processing ? 'Criando...' : 'Criar Shipment'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
