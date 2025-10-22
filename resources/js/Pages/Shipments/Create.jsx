import { useState } from 'react';
import React from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
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
    User,
    Building2,
    Upload,
    Check,
    ChevronRight,
} from 'lucide-react';

export default function Create() {
  const { shippingLines, clients } = usePage().props;
    const [step, setStep] = useState(1);
    const [showNewClientForm, setShowNewClientForm] = useState(false);
    const [blFile, setBlFile] = useState(null);
    const [dataa, setDataa]=useState(shippingLines);

    const { data, setData, post, processing, errors } = useForm({
        // Tipo de Processo
        type: 'import',

        // Cliente
        client_id: '',
        new_client_name: '',
        new_client_email: '',
        new_client_phone: '',
        new_client_address: '',

        // Linha de Navegação e BL
        shipping_line_id: '',
        bl_number: '',
        bl_file: null,

        // Container
        container_number: '',
        container_type: '',
        vessel_name: '',

        // Rota e Datas
        origin_port: '',
        destination_port: '',
        arrival_date: '',

        // Carga
        cargo_description: '',
        cargo_weight: '',
        cargo_value: '',
    });

    // const showNewClientForm(){

    // }
    const containerTypes = [
        { value: '20DC', label: "20' Dry Container" },
        { value: '40DC', label: "40' Dry Container" },
        { value: '40HC', label: "40' High Cube" },
        { value: '20RF', label: "20' Reefer" },
        { value: '40RF', label: "40' Reefer" },
        { value: '20OT', label: "20' Open Top" },
        { value: '40OT', label: "40' Open Top" },
    ];

     // Lista de portos de origem (países exportadores)
  const originPorts = [
    { value: 'QINGDAO, CHINA', label: 'QINGDAO, CHINA' },
    { value: 'SHANGHAI, CHINA', label: 'SHANGHAI, CHINA' },
    { value: 'MUMBAI, INDIA', label: 'MUMBAI, INDIA' },
    { value: 'HAMBURG, GERMANY', label: 'HAMBURG, GERMANY' },
    { value: 'LOS ANGELES, USA', label: 'LOS ANGELES, USA' },
  ];

  // Lista de portos de destino (países importadores)
  const destinationPorts = [
    { value: 'BEIRA, MOZAMBIQUE', label: 'BEIRA, MOZAMBIQUE' },
    { value: 'MAPUTO, MOZAMBIQUE', label: 'MAPUTO, MOZAMBIQUE' },
    { value: 'NACALA, MOZAMBIQUE', label: 'NACALA, MOZAMBIQUE' },
    { value: 'DURBAN, SOUTH AFRICA', label: 'DURBAN, SOUTH AFRICA' },
    { value: 'DAR ES SALAAM, TANZANIA', label: 'DAR ES SALAAM, TANZANIA' },
  ];

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validar BL file apenas para importação
        if (data.type === 'import' && !data.bl_file) {
            alert('Por favor, anexe o BL Original para processos de importação');
            return;
        }

        post('/shipments', {
            forceFormData: true,
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBlFile(file);
            setData('bl_file', file);
        }
    };

    const canProceedToStep2 = () => {
        if (showNewClientForm) {
            return data.new_client_name && data.new_client_email;
        }
        return data.client_id;
    };

    const canProceedToStep3 = () => {
        // Para importação: exige shipping_line_id, bl_number e bl_file
        if (data.type === 'import') {
            return data.shipping_line_id && data.bl_number && data.bl_file;
        }
        // Para exportação: apenas shipping_line_id é obrigatório
        return data.shipping_line_id;
    };

    const novoCklinte = ()=>{
        console.log("Clincado"),
        router.get('clients/create')
    }
    const steps = [
        { number: 1, title: 'Cliente', icon: User },
        { number: 2, title: 'Documentação', icon: FileText },
        { number: 3, title: 'Container', icon: Package },
        { number: 4, title: 'Rota', icon: MapPin },
    ];

    return (
        <DashboardLayout>
            <Head title="Novo Shipment" />

          <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">
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
                        Criar Novo Shipment
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Preencha todos os dados para iniciar o processo de importação
                    </p>
                </div>

                {/* Steps Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((s, index) => {
                            const Icon = s.icon;
                            const isActive = s.number === step;
                            const isCompleted = s.number < step;

                            return (
                                <div key={s.number} className="flex items-center flex-1">
                                    <div className="flex items-center flex-1">
                                        <div
                                            className={`
                                                flex items-center justify-center w-10 h-10 rounded-full
                                                ${isCompleted ? 'bg-emerald-500' : ''}
                                                ${isActive ? 'bg-blue-600' : ''}
                                                ${!isActive && !isCompleted ? 'bg-slate-200' : ''}
                                                transition-all duration-200
                                            `}
                                        >
                                            {isCompleted ? (
                                                <Check className="w-5 h-5 text-white" />
                                            ) : (
                                                <Icon className={`
                                                    w-5 h-5
                                                    ${isActive ? 'text-white' : 'text-slate-400'}
                                                `} />
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <p className={`
                                                text-xs font-medium
                                                ${isActive || isCompleted ? 'text-slate-900' : 'text-slate-400'}
                                            `}>
                                                Passo {s.number}
                                            </p>
                                            <p className={`
                                                text-sm font-semibold
                                                ${isActive ? 'text-blue-600' : ''}
                                                ${isCompleted ? 'text-emerald-600' : ''}
                                                ${!isActive && !isCompleted ? 'text-slate-400' : ''}
                                            `}>
                                                {s.title}
                                            </p>
                                        </div>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <ChevronRight className="w-5 h-5 mx-4 text-slate-300" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
        {/* {    console.log('shippingLines',shippingLines)} */}
                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Step 1: Cliente */}
                    {step === 1 && (
                        <div className="p-6 bg-white border rounded-lg border-slate-200">
                            <div className="flex items-center gap-2 mb-6">
                                <User className="w-5 h-5 text-slate-600" />
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Informações do Cliente
                                </h2>
                            </div>

                            {/* Toggle Tipo de Processo */}
                            <div className="mb-6">
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    Tipo de Processo *
                                </label>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setData('type', 'import')}
                                        className={`
                                            flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all
                                            ${data.type === 'import'
                                                ? 'bg-blue-50 text-blue-700 border-2 border-blue-500'
                                                : 'bg-slate-50 text-slate-600 border border-slate-200'
                                            }
                                        `}
                                    >
                                        📦 Importação
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setData('type', 'export')}
                                        className={`
                                            flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all
                                            ${data.type === 'export'
                                                ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-500'
                                                : 'bg-slate-50 text-slate-600 border border-slate-200'
                                            }
                                        `}
                                    >
                                        🚢 Exportação
                                    </button>
                                </div>
                                <p className="mt-2 text-xs text-slate-500">
                                    {data.type === 'import'
                                        ? 'Processo de importação: mercadoria chegando do exterior'
                                        : 'Processo de exportação: mercadoria saindo para o exterior'}
                                </p>
                            </div>

                            {/* Toggle Cliente Existente / Novo */}
                            <div className="flex gap-4 mb-6">
                                <button
                                    type="button"
                                    onClick={() => setShowNewClientForm(false)}
                                    className={`
                                        flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all
                                        ${!showNewClientForm
                                            ? 'bg-blue-50 text-blue-700 border-2 border-blue-500'
                                            : 'bg-slate-50 text-slate-600 border border-slate-200'
                                        }
                                    `}
                                >
                                    Cliente Existente
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowNewClientForm(true)}
                                    className={`
                                        flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all
                                        ${showNewClientForm
                                            ? 'bg-blue-50 text-blue-700 border-2 border-blue-500'
                                            : 'bg-slate-50 text-slate-600 border border-slate-200'
                                        }
                                    `}
                                >
                                    Novo Cliente
                                </button>
                            </div>

                            {!showNewClientForm ? (
                                <Select
                                    label="Selecione o Cliente *"
                                    value={data.client_id}
                                    onChange={(e) => setData('client_id', e.target.value)}
                                    error={errors.client_id}
                                    required
                                >
                                    {/* <option value="">Selecione um cliente</option> */}
                                    {clients?.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.name} - {client.email}
                                        </option>
                                    ))}
                                </Select>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <Input
                                        label="Nome da Empresa *"
                                        icon={Building2}
                                        value={data.new_client_name}
                                        onChange={(e) => setData('new_client_name', e.target.value)}
                                        error={errors.new_client_name}
                                        placeholder="Ex: ABC Importações Lda"
                                        required
                                    />
                                    <Input
                                        label="Email *"
                                        type="email"
                                        icon={User}
                                        value={data.new_client_email}
                                        onChange={(e) => setData('new_client_email', e.target.value)}
                                        error={errors.new_client_email}
                                        placeholder="contato@empresa.com"
                                        required
                                    />
                                    <Input
                                        label="Telefone"
                                        icon={User}
                                        value={data.new_client_phone}
                                        onChange={(e) => setData('new_client_phone', e.target.value)}
                                        error={errors.new_client_phone}
                                        placeholder="+258 84 123 4567"
                                    />
                                    <Input
                                        label="Endereço"
                                        icon={MapPin}
                                        value={data.new_client_address}
                                        onChange={(e) => setData('new_client_address', e.target.value)}
                                        error={errors.new_client_address}
                                        placeholder="Cidade, País"
                                    />
                                </div>
                            )}

                            <div className="flex justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    disabled={!canProceedToStep2()}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Próximo
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Documentação (BL) */}
                    {step === 2 && (
                        <div className="p-6 bg-white border rounded-lg border-slate-200">
                            <div className="flex items-center gap-2 mb-6">
                                <FileText className="w-5 h-5 text-slate-600" />
                                <h2 className="text-lg font-semibold text-slate-900">
                                    {data.type === 'import' ? 'Bill of Lading (BL)' : 'Documentação Inicial'}
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                                    label={data.type === 'import' ? 'Número do BL *' : 'Número do BL'}
                                    icon={FileText}
                                    value={data.bl_number}
                                    onChange={(e) => setData('bl_number', e.target.value)}
                                    error={errors.bl_number}
                                    placeholder="Ex: 253157188"
                                    required={data.type === 'import'}
                                />
                            </div>

                            {/* Upload BL Original */}
                            <div className="mt-6">
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    {data.type === 'import'
                                        ? 'Upload do BL Original * (PDF, JPG, PNG)'
                                        : 'Upload de Documentos (Opcional) (PDF, JPG, PNG)'}
                                </label>
                                <div className="flex items-center justify-center w-full">
                                    <label className={`
                                        flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer
                                        ${blFile ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50'}
                                        hover:bg-slate-100 transition-colors
                                    `}>
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            {blFile ? (
                                                <>
                                                    <Check className="w-10 h-10 mb-3 text-emerald-600" />
                                                    <p className="mb-2 text-sm font-medium text-emerald-700">
                                                        {blFile.name}
                                                    </p>
                                                    <p className="text-xs text-emerald-600">
                                                        {(blFile.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-10 h-10 mb-3 text-slate-400" />
                                                    <p className="mb-2 text-sm text-slate-500">
                                                        <span className="font-semibold">Clique para fazer upload</span> ou arraste o arquivo
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        PDF, JPG, PNG (MAX. 10MB)
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </div>
                                {errors.bl_file && (
                                    <p className="mt-1 text-xs text-red-600">{errors.bl_file}</p>
                                )}
                            </div>

                            <div className="flex justify-between mt-6">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors bg-white border rounded-lg border-slate-300 hover:bg-slate-50"
                                >
                                    Voltar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(3)}
                                    disabled={!canProceedToStep3()}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Próximo
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Container */}
                    {step === 3 && (
                        <div className="p-6 bg-white border rounded-lg border-slate-200">
                            <div className="flex items-center gap-2 mb-6">
                                <Package className="w-5 h-5 text-slate-600" />
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Informações do Container
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Input
                                    label="Número do Container"
                                    icon={Package}
                                    value={data.container_number}
                                    onChange={(e) => setData('container_number', e.target.value)}
                                    error={errors.container_number}
                                    placeholder="Ex: TCLU2437301"
                                />

                                <Select
                                    label="Tipo de Container *"
                                    value={data.container_type}
                                    onChange={(e) => setData('container_type', e.target.value)}
                                    error={errors.container_type}
                                    required
                                >
                                    {/* <option value="">Selecione o tipo</option> */}
                                    {containerTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
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

                                <Input
                                    type="date"
                                    label="Data de Chegada (ETA)"
                                    icon={Calendar}
                                    value={data.arrival_date}
                                    onChange={(e) => setData('arrival_date', e.target.value)}
                                    error={errors.arrival_date}
                                />
                            </div>

                            <div className="flex justify-between mt-6">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors bg-white border rounded-lg border-slate-300 hover:bg-slate-50"
                                >
                                    Voltar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(4)}
                                    disabled={!data.container_type}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Próximo
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Rota e Carga */}
                    {step === 4 && (
                        <div className="space-y-6">
                            {/* Rota */}
                            <div className="p-6 bg-white border rounded-lg border-slate-200">
                                <div className="flex items-center gap-2 mb-6">
                                    <MapPin className="w-5 h-5 text-slate-600" />
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Rota
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
{/*
<Input
                                        label="Porto de Origem"
                                        icon={MapPin}
                                        value={data.origin_port}
                                        onChange={(e) => setData('origin_port', e.target.value)}
                                        error={errors.origin_port}
                                        placeholder="Ex: QINGDAO, CHINA"
                                    /> */}
                                    <Select
                                    label="Porto de Origem"
                                     options={originPorts}
                                     onChange={(e) => setData('origin_port', e.target.value)}
                                    error={errors.origin_port}
                                    required
                                >
                                    <option value="" >Selecione um ou mais portos de origem</option>

                                    {originPorts?.map((line) => (
                                        <option key={line.id} value={line.value}>
                                            {line.value}
                                        </option>
                                    ))}
                                </Select>

                                    <Select
                                       label="Porto de Destino *"
                                        icon={MapPin}
                                        value={data.destination_port}
                                        onChange={(e) => setData('destination_port', e.target.value)}
                                        error={errors.destination_port}
                                    required
                                >
                                    <option value="" disabled>Selecione um ou mais portos de origem</option>

                                    {destinationPorts?.map((line) => (
                                        <option key={line.id} value={line.value}>
                                            {line.value}
                                        </option>
                                    ))}
                                </Select>
                                    {/* <Input
                                        label="Porto de Origem"
                                        icon={MapPin}
                                        value={data.origin_port}
                                        onChange={(e) => setData('origin_port', e.target.value)}
                                        error={errors.origin_port}
                                        placeholder="Ex: QINGDAO, CHINA"
                                    />


                                    <Input
                                        label="Porto de Destino *"
                                        icon={MapPin}
                                        value={data.destination_port}
                                        onChange={(e) => setData('destination_port', e.target.value)}
                                        error={errors.destination_port}
                                        placeholder="Ex: BEIRA, MOZAMBIQUE"
                                        required
                                    /> */}
                                </div>
                            </div>

                            {/* Carga */}
                            <div className="p-6 bg-white border rounded-lg border-slate-200">
                                <div className="flex items-center gap-2 mb-6">
                                    <Package className="w-5 h-5 text-slate-600" />
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Descrição da Carga
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-slate-700">
                                            Descrição *
                                        </label>
                                        <textarea
                                            value={data.cargo_description}
                                            onChange={(e) => setData('cargo_description', e.target.value)}
                                            rows="4"
                                            className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                            placeholder="Descreva o conteúdo da carga..."
                                            required
                                        />
                                        {errors.cargo_description && (
                                            <p className="mt-1 text-xs text-red-600">{errors.cargo_description}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <Input
                                            label="Peso Aproximado (kg)"
                                            type="number"
                                            value={data.cargo_weight}
                                            onChange={(e) => setData('cargo_weight', e.target.value)}
                                            error={errors.cargo_weight}
                                            placeholder="Ex: 15000"
                                        />

                                        <Input
                                            label="Valor da Carga (USD)"
                                            type="number"
                                            value={data.cargo_value}
                                            onChange={(e) => setData('cargo_value', e.target.value)}
                                            error={errors.cargo_value}
                                            placeholder="Ex: 50000"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between p-6 bg-white border rounded-lg border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setStep(3)}
                                    className="px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors bg-white border rounded-lg border-slate-300 hover:bg-slate-50"
                                >
                                    Voltar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="w-4 h-4" />
                                    {processing ? 'Criando Shipment...' : 'Criar Shipment'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </DashboardLayout>
    );
}
