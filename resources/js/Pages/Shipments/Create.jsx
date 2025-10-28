import { useState, useEffect } from 'react';
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
    Globe,
    TrendingUp,
    Truck,
    Navigation
} from 'lucide-react';

export default function Create() {
    const { shippingLines, clients } = usePage().props;
    const [step, setStep] = useState(1);
    const [blFile, setBlFile] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        // Cliente
        client_id: '',

        // Tipo de Processo (será escolhido no step 2)
        type: '',

        // Linha de Navegação e Documentos
        shipping_line_id: '',
        bl_number: '',
        bl_file: null,

        // Container
        container_number: '',
        container_type: '',
        vessel_name: '',
        arrival_date: '',

        // Rota (dinâmica baseada no tipo)
        origin_port: '',
        destination_port: '',

        // Carga
        cargo_description: '',
        cargo_weight: '',
        cargo_value: '',
    });

    // ========================================
    // PORTOS DINÂMICOS
    // ========================================

    // Portos de Moçambique (para Export = origem, Import = destino)
    const mozambiquePorts = [
        { value: 'BEIRA, MOZAMBIQUE', label: 'Beira, Moçambique' },
        { value: 'MAPUTO, MOZAMBIQUE', label: 'Maputo, Moçambique' },
        { value: 'NACALA, MOZAMBIQUE', label: 'Nacala, Moçambique' },
        { value: 'PEMBA, MOZAMBIQUE', label: 'Pemba, Moçambique' },
    ];

    // Portos Internacionais (para Export = destino, Import = origem)
    const internationalPorts = [
        { value: 'SHANGHAI, CHINA', label: 'Shanghai, China' },
        { value: 'QINGDAO, CHINA', label: 'Qingdao, China' },
        { value: 'MUMBAI, INDIA', label: 'Mumbai, Índia' },
        { value: 'DURBAN, SOUTH AFRICA', label: 'Durban, África do Sul' },
        { value: 'DAR ES SALAAM, TANZANIA', label: 'Dar es Salaam, Tanzânia' },
        { value: 'HAMBURG, GERMANY', label: 'Hamburg, Alemanha' },
        { value: 'ROTTERDAM, NETHERLANDS', label: 'Rotterdam, Holanda' },
        { value: 'LOS ANGELES, USA', label: 'Los Angeles, EUA' },
        { value: 'SINGAPORE', label: 'Singapura' },
        { value: 'DUBAI, UAE', label: 'Dubai, EAU' },
    ];

    const containerTypes = [
        { value: '20DC', label: "20' Dry Container" },
        { value: '40DC', label: "40' Dry Container" },
        { value: '40HC', label: "40' High Cube" },
        { value: '20RF', label: "20' Reefer" },
        { value: '40RF', label: "40' Reefer" },
        { value: '20OT', label: "20' Open Top" },
        { value: '40OT', label: "40' Open Top" },
    ];

    // ========================================
    // EFEITOS E HANDLERS
    // ========================================

    // Quando o tipo mudar, limpar portos para evitar conflitos
    useEffect(() => {
        if (data.type) {
            setData(prev => ({
                ...prev,
                origin_port: '',
                destination_port: '',
            }));
        }
    }, [data.type]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validar BL file apenas para importação
        if (data.type === 'import' && !data.bl_file) {
            alert('Por favor, anexe o BL Original para processos de importação');
            return;
        }

        post('/shipments', {
            forceFormData: true,
            // O backend já redireciona automaticamente baseado no tipo
            // Não precisa fazer redirect aqui
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBlFile(file);
            setData('bl_file', file);
        }
    };

    // ========================================
    // VALIDAÇÕES DE STEPS
    // ========================================

    const canProceedToStep2 = () => {
        return data.client_id;
    };

    const canProceedToStep3 = () => {
        return data.type;
    };

    const canProceedToStep4 = () => {
        // Para importação: exige shipping_line_id, bl_number e bl_file
        if (data.type === 'import') {
            return data.shipping_line_id && data.bl_number && data.bl_file;
        }
        // Para exportação: apenas shipping_line_id é obrigatório
        return data.shipping_line_id;
    };

    const canProceedToStep5 = () => {
        return data.container_type && data.origin_port && data.destination_port;
    };

    // ========================================
    // STEPS CONFIGURATION
    // ========================================

    const steps = [
        { number: 1, title: 'Cliente', icon: User },
        { number: 2, title: 'Tipo', icon: Globe },
        { number: 3, title: 'Documentação', icon: FileText },
        { number: 4, title: 'Container & Rota', icon: Package },
        { number: 5, title: 'Carga', icon: TrendingUp },
    ];

    return (
        <DashboardLayout>
            <Head title="Novo Processo" />

            <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/shipments"
                        className="inline-flex items-center gap-2 mb-4 text-sm transition-colors text-slate-600 hover:text-slate-900"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para Processos
                    </Link>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Criar Novo Processo Logístico
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {data.type === 'export'
                            ? 'Processo de Exportação: mercadoria saindo de Moçambique para o exterior'
                            : data.type === 'import'
                            ? 'Processo de Importação: mercadoria chegando do exterior para Moçambique'
                            : data.type === 'transit'
                            ? 'Processo de Trânsito: mercadoria passando por Moçambique em rota para outro destino'
                            : data.type === 'transport'
                            ? 'Processo de Transporte: transporte rodoviário dentro de Moçambique'
                            : 'Selecione o tipo de processo para começar'
                        }
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

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* STEP 1: SELECIONAR CLIENTE */}
                    {step === 1 && (
                        <div className="p-6 bg-white border rounded-lg border-slate-200">
                            <div className="flex items-center gap-2 mb-6">
                                <User className="w-5 h-5 text-slate-600" />
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Selecionar Cliente
                                </h2>
                            </div>

                            <Select
                                label="Cliente *"
                                value={data.client_id}
                                onChange={(e) => setData('client_id', e.target.value)}
                                error={errors.client_id}
                                required
                            >
                                <option value="">Selecione o cliente</option>
                                {clients?.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.name} - {client.email}
                                    </option>
                                ))}
                            </Select>

                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    💡 <strong>Dica:</strong> Se o cliente não estiver na lista, você pode cadastrá-lo em{' '}
                                    <Link href="/clients/create" className="underline font-semibold">
                                        Gestão de Clientes
                                    </Link>
                                </p>
                            </div>

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

                    {/* STEP 2: ESCOLHER TIPO (IMPORT/EXPORT) */}
                    {step === 2 && (
                        <div className="p-6 bg-white border rounded-lg border-slate-200">
                            <div className="flex items-center gap-2 mb-6">
                                <Globe className="w-5 h-5 text-slate-600" />
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Tipo de Processo
                                </h2>
                            </div>

                            <p className="mb-6 text-sm text-slate-600">
                                Selecione o tipo de operação logística que deseja realizar:
                            </p>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {/* IMPORTAÇÃO */}
                                <button
                                    type="button"
                                    onClick={() => setData('type', 'import')}
                                    className={`
                                        p-6 border-2 rounded-xl text-left transition-all transform hover:scale-105
                                        ${data.type === 'import'
                                            ? 'border-blue-500 bg-blue-50 shadow-lg'
                                            : 'border-slate-200 bg-white hover:border-blue-300'
                                        }
                                    `}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-blue-100 rounded-lg">
                                            <Ship className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-slate-900 mb-2">
                                                📦 Importação
                                            </h3>
                                            <p className="text-sm text-slate-600 mb-3">
                                                Mercadoria chegando <strong>do exterior</strong> para <strong>Moçambique</strong>
                                            </p>
                                            <div className="space-y-1 text-xs text-slate-500">
                                                <p>• Origem: Portos Internacionais</p>
                                                <p>• Destino: Beira, Maputo, Nacala...</p>
                                                <p>• Requer: BL Original</p>
                                            </div>
                                            {data.type === 'import' && (
                                                <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                                                    <Check className="w-3 h-3" />
                                                    Selecionado
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>

                                {/* EXPORTAÇÃO */}
                                <button
                                    type="button"
                                    onClick={() => setData('type', 'export')}
                                    className={`
                                        p-6 border-2 rounded-xl text-left transition-all transform hover:scale-105
                                        ${data.type === 'export'
                                            ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                                            : 'border-slate-200 bg-white hover:border-emerald-300'
                                        }
                                    `}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-emerald-100 rounded-lg">
                                            <TrendingUp className="w-8 h-8 text-emerald-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-slate-900 mb-2">
                                                🚢 Exportação
                                            </h3>
                                            <p className="text-sm text-slate-600 mb-3">
                                                Mercadoria saindo <strong>de Moçambique</strong> para <strong>o exterior</strong>
                                            </p>
                                            <div className="space-y-1 text-xs text-slate-500">
                                                <p>• Origem: Beira, Maputo, Nacala...</p>
                                                <p>• Destino: Portos Internacionais</p>
                                                <p>• Requer: Fatura Comercial, Packing List</p>
                                            </div>
                                            {data.type === 'export' && (
                                                <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-full">
                                                    <Check className="w-3 h-3" />
                                                    Selecionado
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>

                                {/* TRÂNSITO */}
                                <button
                                    type="button"
                                    onClick={() => setData('type', 'transit')}
                                    className={`
                                        p-6 border-2 rounded-xl text-left transition-all transform hover:scale-105
                                        ${data.type === 'transit'
                                            ? 'border-amber-500 bg-amber-50 shadow-lg'
                                            : 'border-slate-200 bg-white hover:border-amber-300'
                                        }
                                    `}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-amber-100 rounded-lg">
                                            <Navigation className="w-8 h-8 text-amber-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-slate-900 mb-2">
                                                🔄 Trânsito
                                            </h3>
                                            <p className="text-sm text-slate-600 mb-3">
                                                Mercadoria <strong>passando por Moçambique</strong> em rota para <strong>outro destino</strong>
                                            </p>
                                            <div className="space-y-1 text-xs text-slate-500">
                                                <p>• Origem: Qualquer porto</p>
                                                <p>• Via: Moçambique (Trânsito)</p>
                                                <p>• Destino: Outro país</p>
                                                <p>• Requer: Documentação de Trânsito</p>
                                            </div>
                                            {data.type === 'transit' && (
                                                <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-amber-600 text-white text-xs font-semibold rounded-full">
                                                    <Check className="w-3 h-3" />
                                                    Selecionado
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>

                                {/* TRANSPORTE */}
                                <button
                                    type="button"
                                    onClick={() => setData('type', 'transport')}
                                    className={`
                                        p-6 border-2 rounded-xl text-left transition-all transform hover:scale-105
                                        ${data.type === 'transport'
                                            ? 'border-purple-500 bg-purple-50 shadow-lg'
                                            : 'border-slate-200 bg-white hover:border-purple-300'
                                        }
                                    `}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-purple-100 rounded-lg">
                                            <Truck className="w-8 h-8 text-purple-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-slate-900 mb-2">
                                                🚚 Transporte
                                            </h3>
                                            <p className="text-sm text-slate-600 mb-3">
                                                Transporte <strong>rodoviário dentro de Moçambique</strong>
                                            </p>
                                            <div className="space-y-1 text-xs text-slate-500">
                                                <p>• 2 Fases: Coleta e Entrega</p>
                                                <p>• Transporte terrestre</p>
                                                <p>• Origem/Destino: Qualquer local em MZ</p>
                                                <p>• Requer: Guia de Remessa</p>
                                            </div>
                                            {data.type === 'transport' && (
                                                <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">
                                                    <Check className="w-3 h-3" />
                                                    Selecionado
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
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

                    {/* STEP 3: DOCUMENTAÇÃO (DINÂMICA) */}
                    {step === 3 && (
                        <div className="p-6 bg-white border rounded-lg border-slate-200">
                            <div className="flex items-center gap-2 mb-6">
                                <FileText className="w-5 h-5 text-slate-600" />
                                <h2 className="text-lg font-semibold text-slate-900">
                                    {data.type === 'import' ? 'Documentação de Importação' : 'Documentação de Exportação'}
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
                                    label={data.type === 'import' ? 'Número do BL *' : 'Número do BL (Opcional)'}
                                    icon={FileText}
                                    value={data.bl_number}
                                    onChange={(e) => setData('bl_number', e.target.value)}
                                    error={errors.bl_number}
                                    placeholder="Ex: 253157188"
                                    required={data.type === 'import'}
                                />
                            </div>

                            {/* Upload de Documentos */}
                            <div className="mt-6">
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    {data.type === 'import'
                                        ? '📄 Upload do BL Original * (PDF, JPG, PNG)'
                                        : '📄 Upload de Documentos (Fatura Comercial, Packing List) (PDF, JPG, PNG)'}
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
                                    onClick={() => setStep(2)}
                                    className="px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors bg-white border rounded-lg border-slate-300 hover:bg-slate-50"
                                >
                                    Voltar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(4)}
                                    disabled={!canProceedToStep4()}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Próximo
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: CONTAINER E ROTA (DINÂMICA) */}
                    {step === 4 && (
                        <div className="space-y-6">
                            {/* Container */}
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
                                        <option value="">Selecione o tipo</option>
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
                                        label={data.type === 'import' ? 'Data de Chegada (ETA)' : 'Data de Partida (ETD)'}
                                        icon={Calendar}
                                        value={data.arrival_date}
                                        onChange={(e) => setData('arrival_date', e.target.value)}
                                        error={errors.arrival_date}
                                    />
                                </div>
                            </div>

                            {/* Rota Dinâmica */}
                            <div className="p-6 bg-white border rounded-lg border-slate-200">
                                <div className="flex items-center gap-2 mb-6">
                                    <MapPin className="w-5 h-5 text-slate-600" />
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Rota {data.type === 'export' ? '(Moçambique → Exterior)' : '(Exterior → Moçambique)'}
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {/* Porto de Origem (Dinâmico) */}
                                    <Select
                                        label="Porto de Origem *"
                                        value={data.origin_port}
                                        onChange={(e) => setData('origin_port', e.target.value)}
                                        error={errors.origin_port}
                                        required
                                    >
                                        <option value="">Selecione o porto de origem</option>
                                        {(data.type === 'export' ? mozambiquePorts : internationalPorts).map((port) => (
                                            <option key={port.value} value={port.value}>
                                                {port.label}
                                            </option>
                                        ))}
                                    </Select>

                                    {/* Porto de Destino (Dinâmico) */}
                                    <Select
                                        label="Porto de Destino *"
                                        value={data.destination_port}
                                        onChange={(e) => setData('destination_port', e.target.value)}
                                        error={errors.destination_port}
                                        required
                                    >
                                        <option value="">Selecione o porto de destino</option>
                                        {(data.type === 'export' ? internationalPorts : mozambiquePorts).map((port) => (
                                            <option key={port.value} value={port.value}>
                                                {port.label}
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                {/* Info visual */}
                                <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-blue-600" />
                                            <span className="font-semibold">{data.origin_port || 'Origem'}</span>
                                        </div>
                                        <div className="flex-1 mx-4 border-t-2 border-dashed border-slate-300"></div>
                                        <Ship className="w-5 h-5 text-slate-400" />
                                        <div className="flex-1 mx-4 border-t-2 border-dashed border-slate-300"></div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-emerald-600" />
                                            <span className="font-semibold">{data.destination_port || 'Destino'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => setStep(3)}
                                    className="px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors bg-white border rounded-lg border-slate-300 hover:bg-slate-50"
                                >
                                    Voltar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(5)}
                                    disabled={!canProceedToStep5()}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Próximo
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: CARGA */}
                    {step === 5 && (
                        <div className="space-y-6">
                            <div className="p-6 bg-white border rounded-lg border-slate-200">
                                <div className="flex items-center gap-2 mb-6">
                                    <TrendingUp className="w-5 h-5 text-slate-600" />
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

                            {/* Resumo Final */}
                            <div className="p-6 bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-lg">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">📋 Resumo do Processo</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-600">Tipo:</p>
                                        <p className="font-semibold text-slate-900">
                                            {data.type === 'export' ? '🚢 Exportação' : data.type === 'transit' ? '🔄 Trânsito' : '📦 Importação'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-600">Rota:</p>
                                        <p className="font-semibold text-slate-900">
                                            {data.origin_port} → {data.destination_port}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-600">Container:</p>
                                        <p className="font-semibold text-slate-900">{data.container_type || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-600">Linha:</p>
                                        <p className="font-semibold text-slate-900">
                                            {shippingLines?.find(l => l.id == data.shipping_line_id)?.name || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between p-6 bg-white border rounded-lg border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setStep(4)}
                                    className="px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors bg-white border rounded-lg border-slate-300 hover:bg-slate-50"
                                >
                                    Voltar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white transition-colors bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg hover:from-blue-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="w-4 h-4" />
                                    {processing ? 'Criando Processo...' : 'Criar Processo'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </DashboardLayout>
    );
}
