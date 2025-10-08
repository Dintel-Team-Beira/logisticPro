import { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Input from '@/Components/Forms/Input';
import Select from '@/Components/Forms/Select';;
import Button from '@/Components/Button';
import { ArrowLeft, Save } from 'lucide-react';

export default function Edit({ shipment, shippingLines, clients }) {
    const { data, setData, put, processing, errors } = useForm({
        client_id: shipment.client_id || '',
        shipping_line_id: shipment.shipping_line_id || '',
        bl_number: shipment.bl_number || '',
        container_number: shipment.container_number || '',
        container_type: shipment.container_type || '',
        vessel_name: shipment.vessel_name || '',
        arrival_date: shipment.arrival_date || '',
        origin_port: shipment.origin_port || '',
        destination_port: shipment.destination_port || '',
        cargo_description: shipment.cargo_description || '',
        cargo_weight: shipment.cargo_weight || '',
        cargo_value: shipment.cargo_value || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('shipments.update', shipment.id));
    };

    return (
        <DashboardLayout>
            <Head title={`Editar Shipment ${shipment.reference_number}`} />

            <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Editar Shipment
                        </h1>
                        <p className="mt-1 text-sm text-slate-600">
                            {shipment.reference_number}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        href={route('shipments.show', shipment.id)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="p-6 space-y-6 bg-white rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Informações do Cliente
                        </h2>

                        <Select
                            label="Cliente"
                            value={data.client_id}
                            onChange={(e) => setData('client_id', e.target.value)}
                            error={errors.client_id}
                        >
                            <option value="">Selecione um cliente</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.name}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="p-6 space-y-6 bg-white rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Informações do BL
                        </h2>

                        <div className="grid grid-cols-2 gap-6">
                            <Select
                                label="Linha de Navegação"
                                value={data.shipping_line_id}
                                onChange={(e) => setData('shipping_line_id', e.target.value)}
                                error={errors.shipping_line_id}
                            >
                                <option value="">Selecione</option>
                                {shippingLines.map((line) => (
                                    <option key={line.id} value={line.id}>
                                        {line.name}
                                    </option>
                                ))}
                            </Select>

                            <Input
                                label="Número do BL"
                                value={data.bl_number}
                                onChange={(e) => setData('bl_number', e.target.value)}
                                error={errors.bl_number}
                            />
                        </div>
                    </div>

                    <div className="p-6 space-y-6 bg-white rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Container e Navio
                        </h2>

                        <div className="grid grid-cols-2 gap-6">
                            <Input
                                label="Número do Container"
                                value={data.container_number}
                                onChange={(e) => setData('container_number', e.target.value)}
                                error={errors.container_number}
                            />

                            <Select
                                label="Tipo de Container"
                                value={data.container_type}
                                onChange={(e) => setData('container_type', e.target.value)}
                                error={errors.container_type}
                            >
                                <option value="">Selecione</option>
                                <option value="20DC">20' Dry Container</option>
                                <option value="40DC">40' Dry Container</option>
                                <option value="40HC">40' High Cube</option>
                                <option value="20RF">20' Reefer</option>
                                <option value="40RF">40' Reefer</option>
                                <option value="20OT">20' Open Top</option>
                                <option value="40OT">40' Open Top</option>
                            </Select>

                            <Input
                                label="Nome do Navio"
                                value={data.vessel_name}
                                onChange={(e) => setData('vessel_name', e.target.value)}
                                error={errors.vessel_name}
                            />

                            <Input
                                type="date"
                                label="Data de Chegada"
                                value={data.arrival_date}
                                onChange={(e) => setData('arrival_date', e.target.value)}
                                error={errors.arrival_date}
                            />
                        </div>
                    </div>

                    <div className="p-6 space-y-6 bg-white rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Rota
                        </h2>

                        <div className="grid grid-cols-2 gap-6">
                            <Input
                                label="Porto de Origem"
                                value={data.origin_port}
                                onChange={(e) => setData('origin_port', e.target.value)}
                                error={errors.origin_port}
                            />

                            <Input
                                label="Porto de Destino"
                                value={data.destination_port}
                                onChange={(e) => setData('destination_port', e.target.value)}
                                error={errors.destination_port}
                            />
                        </div>
                    </div>

                    <div className="p-6 space-y-6 bg-white rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Carga
                        </h2>

                        <Input
                            label="Descrição da Carga"
                            value={data.cargo_description}
                            onChange={(e) => setData('cargo_description', e.target.value)}
                            error={errors.cargo_description}
                        />

                        <div className="grid grid-cols-2 gap-6">
                            <Input
                                type="number"
                                label="Peso (kg)"
                                value={data.cargo_weight}
                                onChange={(e) => setData('cargo_weight', e.target.value)}
                                error={errors.cargo_weight}
                            />

                            <Input
                                type="number"
                                label="Valor (USD)"
                                value={data.cargo_value}
                                onChange={(e) => setData('cargo_value', e.target.value)}
                                error={errors.cargo_value}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            href={route('shipments.show', shipment.id)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" size='sm' disabled={processing}>
                            <Save className="w-4 h-4 mr-2" />
                            Salvar Alterações
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
