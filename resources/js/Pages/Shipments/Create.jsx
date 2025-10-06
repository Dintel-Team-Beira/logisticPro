import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import Card from '@/Components/Card';
import Input from '@/Components/Input';
import Button from '@/Components/Button';
import { Ship, ArrowLeft, Save } from 'lucide-react';

export default function ShipmentsCreate({ auth, shippingLines }) {
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
        <AppLayout auth={auth}>
            <Head title="Novo Shipment" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="max-w-4xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <Link href="/shipments" className="inline-flex items-center mb-4 text-blue-600 hover:text-blue-700">
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Voltar para Shipments
                        </Link>
                        <h1 className="flex items-center gap-3 text-4xl font-bold text-transparent bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text">
                            <Ship className="w-10 h-10 text-blue-600" />
                            Criar Novo Shipment
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Preencha as informações básicas do shipment
                        </p>
                    </motion.div>

                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card>
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Shipping Line */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                        Linha de Navegação *
                                    </label>
                                    <select
                                        value={data.shipping_line_id}
                                        onChange={(e) => setData('shipping_line_id', e.target.value)}
                                        className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Selecione uma linha</option>
                                        {shippingLines.map((line) => (
                                            <option key={line.id} value={line.id}>
                                                {line.name} ({line.code})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.shipping_line_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.shipping_line_id}</p>
                                    )}
                                </div>

                                {/* BL and Container */}
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <Input
                                        label="BL Number"
                                        value={data.bl_number}
                                        onChange={(e) => setData('bl_number', e.target.value)}
                                        error={errors.bl_number}
                                        placeholder="Ex: MAEU123456789"
                                    />
                                    <Input
                                        label="Container Number"
                                        value={data.container_number}
                                        onChange={(e) => setData('container_number', e.target.value)}
                                        error={errors.container_number}
                                        placeholder="Ex: TGHU2437301"
                                    />
                                </div>

                                {/* Vessel and Arrival */}
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <Input
                                        label="Nome do Navio"
                                        value={data.vessel_name}
                                        onChange={(e) => setData('vessel_name', e.target.value)}
                                        error={errors.vessel_name}
                                        placeholder="Ex: MSC MAYA"
                                    />
                                    <Input
                                        label="Data de Chegada"
                                        type="date"
                                        value={data.arrival_date}
                                        onChange={(e) => setData('arrival_date', e.target.value)}
                                        error={errors.arrival_date}
                                    />
                                </div>

                                {/* Ports */}
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <Input
                                        label="Porto de Origem"
                                        value={data.origin_port}
                                        onChange={(e) => setData('origin_port', e.target.value)}
                                        error={errors.origin_port}
                                        placeholder="Ex: Shanghai"
                                    />
                                    <Input
                                        label="Porto de Destino"
                                        value={data.destination_port}
                                        onChange={(e) => setData('destination_port', e.target.value)}
                                        error={errors.destination_port}
                                        placeholder="Ex: Maputo"
                                    />
                                </div>

                                {/* Cargo Description */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                        Descrição da Carga
                                    </label>
                                    <textarea
                                        value={data.cargo_description}
                                        onChange={(e) => setData('cargo_description', e.target.value)}
                                        rows={4}
                                        className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Descreva a carga transportada..."
                                    />
                                    {errors.cargo_description && (
                                        <p className="mt-1 text-sm text-red-600">{errors.cargo_description}</p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                                    <Link href="/shipments">
                                        <Button variant="secondary" type="button">
                                            Cancelar
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        loading={processing}
                                    >
                                        <Save className="w-5 h-5" />
                                        Criar Shipment
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </AppLayout>
    );
}
