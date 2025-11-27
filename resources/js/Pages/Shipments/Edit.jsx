import { useState, useEffect } from 'react';
import React from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Input from '@/Components/Forms/Input';
import Select from '@/Components/Forms/Select';
import QuotationCalculator from '@/Components/Quotation/QuotationCalculator';
import axios from 'axios';
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
    Globe,
    TrendingUp,
    Truck,
    Navigation,
    AlertCircle
} from 'lucide-react';

export default function Edit({ shipment, shippingLines, clients, consignees }) {
    const [blFile, setBlFile] = useState(null);
    const [filteredConsignees, setFilteredConsignees] = useState([]);

    // Parâmetros de precificação da API
    const [pricingParams, setPricingParams] = useState({
        container_type: [],
        cargo_type: [],
        regime: [],
        destination: [],
        additional_service: [],
    });
    const [loadingParams, setLoadingParams] = useState(true);

    // Cotação calculada
    const [quotationData, setQuotationData] = useState(null);
    const [selectedServices, setSelectedServices] = useState([]);

    // Validação em tempo real
    const [validationErrors, setValidationErrors] = useState({});
    const [touched, setTouched] = useState({});

    const { data, setData, put, processing, errors } = useForm({
        // Cliente e Consignatário
        client_id: shipment.client_id || '',
        consignee_id: shipment.consignee_id || '',

        // Tipo de Processo
        type: shipment.type || '',

        // Linha de Navegação e Documentos (Import/Export/Transit)
        shipping_line_id: shipment.shipping_line_id || '',
        bl_number: shipment.bl_number || '',
        bl_file: null,

        // Container (Import/Export/Transit)
        container_number: shipment.container_number || '',
        container_type: shipment.container_type || '',
        vessel_name: shipment.vessel_name || '',
        arrival_date: shipment.arrival_date || '',

        // Rota (Import/Export/Transit)
        origin_port: shipment.origin_port || '',
        destination_port: shipment.destination_port || '',

        // Carga (Todos os tipos)
        cargo_description: shipment.cargo_description || '',
        cargo_weight: shipment.cargo_weight || '',
        cargo_value: shipment.cargo_value || '',
        cargo_type: shipment.cargo_type || '',

        // Campos de cotação
        regime: shipment.regime || '',
        final_destination: shipment.final_destination || '',
        additional_services: shipment.additional_services || [],

        // Campos específicos de TRANSPORTE
        loading_location: shipment.loading_location || '',
        unloading_location: shipment.unloading_location || '',
        distance_km: shipment.distance_km || '',
        empty_return_location: shipment.empty_return_location || '',

        // Dados da cotação
        quotation_data: shipment.quotation_data || null,
    });

    // ========================================
    // PORTOS DINÂMICOS
    // ========================================

    const mozambiquePorts = [
        { value: 'BEIRA, MOZAMBIQUE', label: 'Beira, Moçambique' },
        { value: 'MAPUTO, MOZAMBIQUE', label: 'Maputo, Moçambique' },
        { value: 'NACALA, MOZAMBIQUE', label: 'Nacala, Moçambique' },
        { value: 'PEMBA, MOZAMBIQUE', label: 'Pemba, Moçambique' },
    ];

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

    // ========================================
    // VALIDAÇÃO EM TEMPO REAL
    // ========================================

    const validateField = (field, value) => {
        const newErrors = { ...validationErrors };

        // Campos obrigatórios gerais
        if (field === 'client_id' && !value) {
            newErrors.client_id = 'Cliente é obrigatório';
        } else if (field === 'client_id') {
            delete newErrors.client_id;
        }

        if (field === 'type' && !value) {
            newErrors.type = 'Tipo de processo é obrigatório';
        } else if (field === 'type') {
            delete newErrors.type;
        }

        if (field === 'cargo_description' && !value) {
            newErrors.cargo_description = 'Descrição da carga é obrigatória';
        } else if (field === 'cargo_description') {
            delete newErrors.cargo_description;
        }

        // Validações específicas por tipo
        if (data.type === 'transport') {
            // Validações para transporte
            if (field === 'loading_location' && !value) {
                newErrors.loading_location = 'Local de carregamento é obrigatório';
            } else if (field === 'loading_location') {
                delete newErrors.loading_location;
            }

            if (field === 'unloading_location' && !value) {
                newErrors.unloading_location = 'Local de descarregamento é obrigatório';
            } else if (field === 'unloading_location') {
                delete newErrors.unloading_location;
            }

            if (field === 'distance_km' && !value) {
                newErrors.distance_km = 'Distância é obrigatória';
            } else if (field === 'distance_km' && value <= 0) {
                newErrors.distance_km = 'Distância deve ser maior que zero';
            } else if (field === 'distance_km') {
                delete newErrors.distance_km;
            }

            if (field === 'empty_return_location' && !value) {
                newErrors.empty_return_location = 'Local de devolução é obrigatório';
            } else if (field === 'empty_return_location') {
                delete newErrors.empty_return_location;
            }
        } else {
            // Validações para import/export/transit
            if (field === 'shipping_line_id' && !value) {
                newErrors.shipping_line_id = 'Linha de navegação é obrigatória';
            } else if (field === 'shipping_line_id') {
                delete newErrors.shipping_line_id;
            }

            if (data.type === 'import' && field === 'bl_number' && !value) {
                newErrors.bl_number = 'Número do BL é obrigatório para importação';
            } else if (field === 'bl_number') {
                delete newErrors.bl_number;
            }

            if (field === 'container_type' && !value) {
                newErrors.container_type = 'Tipo de container é obrigatório';
            } else if (field === 'container_type') {
                delete newErrors.container_type;
            }

            if (field === 'origin_port' && !value) {
                newErrors.origin_port = 'Porto de origem é obrigatório';
            } else if (field === 'origin_port') {
                delete newErrors.origin_port;
            }

            if (field === 'destination_port' && !value) {
                newErrors.destination_port = 'Porto de destino é obrigatório';
            } else if (field === 'destination_port') {
                delete newErrors.destination_port;
            }
        }

        setValidationErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFieldChange = (field, value) => {
        setData(field, value);
        setTouched({ ...touched, [field]: true });
        validateField(field, value);
    };

    const handleBlur = (field) => {
        setTouched({ ...touched, [field]: true });
        validateField(field, data[field]);
    };

    // ========================================
    // EFEITOS E HANDLERS
    // ========================================

    // Filtrar consignatários por cliente selecionado
    useEffect(() => {
        if (data.client_id) {
            const filtered = consignees?.filter(c => !c.client_id || c.client_id == data.client_id) || [];
            setFilteredConsignees(filtered);
        } else {
            setFilteredConsignees([]);
            setData('consignee_id', '');
        }
    }, [data.client_id]);

    // Quando o tipo mudar, limpar portos para evitar conflitos (DESABILITADO NA EDIÇÃO)
    // Na edição, preservamos os valores existentes
    /* useEffect(() => {
        if (data.type) {
            setData(prev => ({
                ...prev,
                origin_port: '',
                destination_port: '',
            }));
            validateField('type', data.type);
        }
    }, [data.type]); */

    // Buscar parâmetros de precificação da API
    useEffect(() => {
        const fetchPricingParams = async () => {
            try {
                const response = await axios.get('/api/v1/pricing-parameters-grouped');
                setPricingParams(response.data);
                setLoadingParams(false);
            } catch (error) {
                console.error('Erro ao buscar parâmetros de precificação:', error);
                setLoadingParams(false);
            }
        };
        fetchPricingParams();
    }, []);

    // Pré-carregar cotação existente
    useEffect(() => {
        if (shipment.quotation_reference && shipment.quotation_breakdown) {
            const quotation = {
                subtotal: shipment.quotation_subtotal || 0,
                tax: shipment.quotation_tax || 0,
                total: shipment.quotation_total || 0,
                breakdown: shipment.quotation_breakdown || [],
            };
            setQuotationData(quotation);
            setData('quotation_data', quotation);
        }

        // Pré-carregar serviços adicionais
        if (shipment.additional_services && Array.isArray(shipment.additional_services)) {
            setSelectedServices(shipment.additional_services);
        }
    }, [shipment]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validar todos os campos
        const allFields = Object.keys(data);
        let hasErrors = false;
        allFields.forEach(field => {
            if (!validateField(field, data[field])) {
                hasErrors = true;
            }
        });

        // BL file é opcional na edição (pode já existir)
        // Não validamos aqui

        if (hasErrors) {
            return;
        }

        put(`/shipments/${shipment.id}`, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBlFile(file);
            setData('bl_file', file);
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.bl_file;
                return newErrors;
            });
        }
    };

    // Verifica se o formulário é válido (simplificado para edição)
    const isFormValid = () => {
        // Validações básicas - apenas campos essenciais
        if (!data.client_id || !data.type || !data.cargo_description) {
            return false;
        }

        if (data.type === 'transport') {
            // Para transporte, precisa dos campos de transporte
            return Boolean(data.loading_location && data.unloading_location &&
                   data.distance_km && data.empty_return_location);
        } else {
            // Para import/export/transit, verifica campos mínimos
            // Na edição, somos mais permissivos
            return Boolean(data.container_type && data.origin_port && data.destination_port);
        }
    };

    return (
        <DashboardLayout>
            <Head title={`Editar Processo ${shipment.reference_number}`} />

            <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href={`/shipments/${shipment.id}`}
                        className="inline-flex items-center gap-2 mb-4 text-sm transition-colors text-slate-600 hover:text-slate-900"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para Detalhes
                    </Link>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Editar Processo {shipment.reference_number}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Modifique os campos desejados. Você pode adicionar ou remover itens da cotação.
                        A validação é feita em tempo real.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* SEÇÃO 1: CLIENTE */}
                    <div className="p-6 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center gap-2 mb-6">
                            <User className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-slate-900">
                                1. Informações do Cliente
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Select
                                    label="Cliente *"
                                    value={data.client_id}
                                    onChange={(e) => handleFieldChange('client_id', e.target.value)}
                                    onBlur={() => handleBlur('client_id')}
                                    error={touched.client_id && (validationErrors.client_id || errors.client_id)}
                                    required
                                >
                                    <option value="">Selecione o cliente</option>
                                    {clients?.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.name} - {client.email}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            {data.client_id && (
                                <div>
                                    <Select
                                        label="Consignatário (Opcional)"
                                        value={data.consignee_id}
                                        onChange={(e) => handleFieldChange('consignee_id', e.target.value)}
                                        error={errors.consignee_id}
                                    >
                                        <option value="">Nenhum (usar dados do cliente)</option>
                                        {filteredConsignees.map((consignee) => (
                                            <option key={consignee.id} value={consignee.id}>
                                                {consignee.name} - {consignee.city || 'Sem localização'}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SEÇÃO 2: TIPO DE PROCESSO */}
                    <div className="p-6 bg-white border rounded-lg border-slate-200">
                        <div className="flex items-center gap-2 mb-6">
                            <Globe className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-slate-900">
                                2. Tipo de Processo *
                            </h2>
                        </div>

                        {touched.type && validationErrors.type && (
                            <div className="flex items-center gap-2 p-3 mb-4 text-sm text-red-800 border border-red-200 rounded-lg bg-red-50">
                                <AlertCircle className="w-4 h-4" />
                                {validationErrors.type}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {/* IMPORTAÇÃO */}
                            <button
                                type="button"
                                onClick={() => handleFieldChange('type', 'import')}
                                onBlur={() => handleBlur('type')}
                                className={`
                                    p-4 border-2 rounded-xl text-left transition-all
                                    ${data.type === 'import'
                                        ? 'border-blue-500 bg-blue-50 shadow-md'
                                        : 'border-slate-200 bg-white hover:border-blue-300'
                                    }
                                `}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <Ship className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        Importação
                                    </h3>
                                    <p className="text-xs text-center text-slate-600">
                                        Do exterior para Moçambique
                                    </p>
                                    {data.type === 'import' && (
                                        <Check className="w-4 h-4 text-blue-600" />
                                    )}
                                </div>
                            </button>

                            {/* EXPORTAÇÃO */}
                            <button
                                type="button"
                                onClick={() => handleFieldChange('type', 'export')}
                                onBlur={() => handleBlur('type')}
                                className={`
                                    p-4 border-2 rounded-xl text-left transition-all
                                    ${data.type === 'export'
                                        ? 'border-emerald-500 bg-emerald-50 shadow-md'
                                        : 'border-slate-200 bg-white hover:border-emerald-300'
                                    }
                                `}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-3 rounded-lg bg-emerald-100">
                                        <TrendingUp className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        Exportação
                                    </h3>
                                    <p className="text-xs text-center text-slate-600">
                                        De Moçambique para o exterior
                                    </p>
                                    {data.type === 'export' && (
                                        <Check className="w-4 h-4 text-emerald-600" />
                                    )}
                                </div>
                            </button>

                            {/* TRÂNSITO */}
                            <button
                                type="button"
                                onClick={() => handleFieldChange('type', 'transit')}
                                onBlur={() => handleBlur('type')}
                                className={`
                                    p-4 border-2 rounded-xl text-left transition-all
                                    ${data.type === 'transit'
                                        ? 'border-amber-500 bg-amber-50 shadow-md'
                                        : 'border-slate-200 bg-white hover:border-amber-300'
                                    }
                                `}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-3 rounded-lg bg-amber-100">
                                        <Navigation className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        Trânsito
                                    </h3>
                                    <p className="text-xs text-center text-slate-600">
                                        Passando por Moçambique
                                    </p>
                                    {data.type === 'transit' && (
                                        <Check className="w-4 h-4 text-amber-600" />
                                    )}
                                </div>
                            </button>

                            {/* TRANSPORTE */}
                            <button
                                type="button"
                                onClick={() => handleFieldChange('type', 'transport')}
                                onBlur={() => handleBlur('type')}
                                className={`
                                    p-4 border-2 rounded-xl text-left transition-all
                                    ${data.type === 'transport'
                                        ? 'border-purple-500 bg-purple-50 shadow-md'
                                        : 'border-slate-200 bg-white hover:border-purple-300'
                                    }
                                `}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <Truck className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        Transporte
                                    </h3>
                                    <p className="text-xs text-center text-slate-600">
                                        Rodoviário em Moçambique
                                    </p>
                                    {data.type === 'transport' && (
                                        <Check className="w-4 h-4 text-purple-600" />
                                    )}
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* SEÇÃO 3: DOCUMENTAÇÃO E DETALHES (Condicional por tipo) */}
                    {data.type && (
                        <>
                            {data.type === 'transport' ? (
                                // CAMPOS DE TRANSPORTE
                                <div className="p-6 bg-white border rounded-lg border-slate-200">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Truck className="w-5 h-5 text-purple-600" />
                                        <h2 className="text-lg font-semibold text-slate-900">
                                            3. Detalhes do Transporte Rodoviário
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <Select
                                            label="Transportadora (Opcional)"
                                            value={data.shipping_line_id}
                                            onChange={(e) => handleFieldChange('shipping_line_id', e.target.value)}
                                            error={errors.shipping_line_id}
                                        >
                                            <option value="">Selecione uma transportadora</option>
                                            {shippingLines?.map((line) => (
                                                <option key={line.id} value={line.id}>
                                                    {line.name}
                                                </option>
                                            ))}
                                        </Select>

                                        <Input
                                            label="Local de Carregamento *"
                                            icon={MapPin}
                                            value={data.loading_location}
                                            onChange={(e) => handleFieldChange('loading_location', e.target.value)}
                                            onBlur={() => handleBlur('loading_location')}
                                            error={touched.loading_location && (validationErrors.loading_location || errors.loading_location)}
                                            placeholder="Ex: Armazém Beira, Rua..."
                                            required
                                        />

                                        <Input
                                            label="Local de Descarregamento *"
                                            icon={MapPin}
                                            value={data.unloading_location}
                                            onChange={(e) => handleFieldChange('unloading_location', e.target.value)}
                                            onBlur={() => handleBlur('unloading_location')}
                                            error={touched.unloading_location && (validationErrors.unloading_location || errors.unloading_location)}
                                            placeholder="Ex: Cliente Final, Maputo..."
                                            required
                                        />

                                        <Input
                                            type="number"
                                            label="Distância (KM) *"
                                            icon={TrendingUp}
                                            value={data.distance_km}
                                            onChange={(e) => handleFieldChange('distance_km', e.target.value)}
                                            onBlur={() => handleBlur('distance_km')}
                                            error={touched.distance_km && (validationErrors.distance_km || errors.distance_km)}
                                            placeholder="Ex: 580"
                                            required
                                        />

                                        <div className="md:col-span-2">
                                            <Input
                                                label="Local da Devolução do Vazio *"
                                                icon={MapPin}
                                                value={data.empty_return_location}
                                                onChange={(e) => handleFieldChange('empty_return_location', e.target.value)}
                                                onBlur={() => handleBlur('empty_return_location')}
                                                error={touched.empty_return_location && (validationErrors.empty_return_location || errors.empty_return_location)}
                                                placeholder="Ex: Porto de Beira, Depósito..."
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Visualização da rota */}
                                    {data.loading_location && data.unloading_location && (
                                        <div className="p-4 mt-6 border border-purple-200 rounded-lg bg-purple-50">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex flex-col items-center gap-1">
                                                    <MapPin className="w-4 h-4 text-purple-600" />
                                                    <span className="font-semibold text-center text-purple-900">
                                                        {data.loading_location}
                                                    </span>
                                                    <span className="text-xs text-purple-600">Origem</span>
                                                </div>
                                                <div className="flex-1 mx-4 border-t-2 border-purple-300 border-dashed"></div>
                                                <Truck className="w-6 h-6 text-purple-500" />
                                                {data.distance_km && (
                                                    <span className="text-xs font-semibold text-purple-700">{data.distance_km} km</span>
                                                )}
                                                <div className="flex-1 mx-4 border-t-2 border-purple-300 border-dashed"></div>
                                                <div className="flex flex-col items-center gap-1">
                                                    <MapPin className="w-4 h-4 text-emerald-600" />
                                                    <span className="font-semibold text-center text-emerald-900">
                                                        {data.unloading_location}
                                                    </span>
                                                    <span className="text-xs text-emerald-600">Destino</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // CAMPOS IMPORT/EXPORT/TRANSIT
                                <>
                                    {/* Documentação */}
                                    <div className="p-6 bg-white border rounded-lg border-slate-200">
                                        <div className="flex items-center gap-2 mb-6">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                            <h2 className="text-lg font-semibold text-slate-900">
                                                3. Documentação e Linha de Navegação
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <Select
                                                label="Linha de Navegação *"
                                                value={data.shipping_line_id}
                                                onChange={(e) => handleFieldChange('shipping_line_id', e.target.value)}
                                                onBlur={() => handleBlur('shipping_line_id')}
                                                error={touched.shipping_line_id && (validationErrors.shipping_line_id || errors.shipping_line_id)}
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
                                                onChange={(e) => handleFieldChange('bl_number', e.target.value)}
                                                onBlur={() => handleBlur('bl_number')}
                                                error={touched.bl_number && (validationErrors.bl_number || errors.bl_number)}
                                                placeholder="Ex: 253157188"
                                                required={data.type === 'import'}
                                            />
                                        </div>

                                        {/* Upload de BL */}
                                        <div className="mt-6">
                                            <label className="block mb-2 text-sm font-medium text-slate-700">
                                                {data.type === 'import'
                                                    ? '📄 Upload do BL Original * (PDF, JPG, PNG)'
                                                    : '📄 Upload de Documentos (Opcional) (PDF, JPG, PNG)'}
                                            </label>
                                            <div className="flex items-center justify-center w-full">
                                                <label className={`
                                                    flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer
                                                    ${blFile ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50'}
                                                    hover:bg-slate-100 transition-colors
                                                `}>
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        {blFile ? (
                                                            <>
                                                                <Check className="w-8 h-8 mb-2 text-emerald-600" />
                                                                <p className="mb-1 text-sm font-medium text-emerald-700">
                                                                    {blFile.name}
                                                                </p>
                                                                <p className="text-xs text-emerald-600">
                                                                    {(blFile.size / 1024 / 1024).toFixed(2)} MB
                                                                </p>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Upload className="w-8 h-8 mb-2 text-slate-400" />
                                                                <p className="text-xs text-slate-500">
                                                                    <span className="font-semibold">Clique para fazer upload</span>
                                                                </p>
                                                                <p className="text-xs text-slate-400">
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
                                            {touched.bl_file && validationErrors.bl_file && (
                                                <p className="mt-1 text-xs text-red-600">{validationErrors.bl_file}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Container */}
                                    <div className="p-6 bg-white border rounded-lg border-slate-200">
                                        <div className="flex items-center gap-2 mb-6">
                                            <Package className="w-5 h-5 text-blue-600" />
                                            <h2 className="text-lg font-semibold text-slate-900">
                                                4. Informações do Container
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <Input
                                                label="Número do Container"
                                                icon={Package}
                                                value={data.container_number}
                                                onChange={(e) => handleFieldChange('container_number', e.target.value)}
                                                error={errors.container_number}
                                                placeholder="Ex: TCLU2437301"
                                            />

                                            <Select
                                                label="Tipo de Container *"
                                                value={data.container_type}
                                                onChange={(e) => handleFieldChange('container_type', e.target.value)}
                                                onBlur={() => handleBlur('container_type')}
                                                error={touched.container_type && (validationErrors.container_type || errors.container_type)}
                                                required
                                            >
                                                <option value="">Selecione o tipo</option>
                                                <option value="20DC">20' Dry Container</option>
                                                <option value="40DC">40' Dry Container</option>
                                                <option value="40HC">40' High Cube</option>
                                                <option value="20RF">20' Reefer (Refrigerado)</option>
                                                <option value="40RF">40' Reefer (Refrigerado)</option>
                                                <option value="20OT">20' Open Top</option>
                                                <option value="40OT">40' Open Top</option>
                                            </Select>

                                            <Input
                                                label="Nome do Navio"
                                                icon={Ship}
                                                value={data.vessel_name}
                                                onChange={(e) => handleFieldChange('vessel_name', e.target.value)}
                                                error={errors.vessel_name}
                                                placeholder="Ex: MSC MAYA"
                                            />

                                            <Input
                                                type="date"
                                                label={data.type === 'import' ? 'Data de Chegada (ETA)' : 'Data de Partida (ETD)'}
                                                icon={Calendar}
                                                value={data.arrival_date}
                                                onChange={(e) => handleFieldChange('arrival_date', e.target.value)}
                                                error={errors.arrival_date}
                                            />
                                        </div>
                                    </div>

                                    {/* Rota */}
                                    <div className="p-6 bg-white border rounded-lg border-slate-200">
                                        <div className="flex items-center gap-2 mb-6">
                                            <MapPin className="w-5 h-5 text-blue-600" />
                                            <h2 className="text-lg font-semibold text-slate-900">
                                                5. Rota {data.type === 'export' ? '(Moçambique → Exterior)' : '(Exterior → Moçambique)'}
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <Select
                                                label="Porto de Origem *"
                                                value={data.origin_port}
                                                onChange={(e) => handleFieldChange('origin_port', e.target.value)}
                                                onBlur={() => handleBlur('origin_port')}
                                                error={touched.origin_port && (validationErrors.origin_port || errors.origin_port)}
                                                required
                                            >
                                                <option value="">Selecione o porto de origem</option>
                                                {(data.type === 'export' ? mozambiquePorts : internationalPorts).map((port) => (
                                                    <option key={port.value} value={port.value}>
                                                        {port.label}
                                                    </option>
                                                ))}
                                            </Select>

                                            <Select
                                                label="Porto de Destino *"
                                                value={data.destination_port}
                                                onChange={(e) => handleFieldChange('destination_port', e.target.value)}
                                                onBlur={() => handleBlur('destination_port')}
                                                error={touched.destination_port && (validationErrors.destination_port || errors.destination_port)}
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

                                        {/* Visualização da rota */}
                                        {data.origin_port && data.destination_port && (
                                            <div className="p-4 mt-4 border rounded-lg bg-slate-50 border-slate-200">
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-blue-600" />
                                                        <span className="font-semibold">{data.origin_port}</span>
                                                    </div>
                                                    <div className="flex-1 mx-4 border-t-2 border-dashed border-slate-300"></div>
                                                    <Ship className="w-5 h-5 text-slate-400" />
                                                    <div className="flex-1 mx-4 border-t-2 border-dashed border-slate-300"></div>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-emerald-600" />
                                                        <span className="font-semibold">{data.destination_port}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* SEÇÃO 4: CARGA (COMUM A TODOS) */}
                            <div className="p-6 bg-white border rounded-lg border-slate-200">
                                <div className="flex items-center gap-2 mb-6">
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        {data.type === 'transport' ? '4' : '6'}. Descrição da Carga
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-slate-700">
                                            Descrição *
                                        </label>
                                        <textarea
                                            value={data.cargo_description}
                                            onChange={(e) => handleFieldChange('cargo_description', e.target.value)}
                                            onBlur={() => handleBlur('cargo_description')}
                                            rows="4"
                                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent
                                                ${touched.cargo_description && validationErrors.cargo_description ? 'border-red-500' : 'border-slate-300'}
                                            `}
                                            placeholder="Descreva o conteúdo da carga..."
                                            required
                                        />
                                        {touched.cargo_description && validationErrors.cargo_description && (
                                            <p className="mt-1 text-xs text-red-600">{validationErrors.cargo_description}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <Input
                                            label="Peso Aproximado (kg)"
                                            type="number"
                                            value={data.cargo_weight}
                                            onChange={(e) => handleFieldChange('cargo_weight', e.target.value)}
                                            error={errors.cargo_weight}
                                            placeholder="Ex: 15000"
                                        />

                                        <Input
                                            label="Valor da Carga (USD)"
                                            type="number"
                                            value={data.cargo_value}
                                            onChange={(e) => handleFieldChange('cargo_value', e.target.value)}
                                            error={errors.cargo_value}
                                            placeholder="Ex: 50000"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SEÇÃO 5: PARÂMETROS DE COTAÇÃO (Apenas não-transport) */}
                            {data.type !== 'transport' && (
                                <div className="p-6 bg-white border rounded-lg border-slate-200">
                                    <div className="flex items-center gap-2 mb-6">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        <h2 className="text-lg font-semibold text-slate-900">
                                            7. Parâmetros de Cotação (Opcional)
                                        </h2>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <Select
                                                label="Tipo de Mercadoria"
                                                value={data.cargo_type}
                                                onChange={(e) => handleFieldChange('cargo_type', e.target.value)}
                                                error={errors.cargo_type}
                                            >
                                                <option value="">{loadingParams ? 'Carregando...' : 'Selecione (opcional)'}</option>
                                                {pricingParams.cargo_type?.filter(p => p.active).map((param) => (
                                                    <option key={param.code} value={param.code}>
                                                        {param.name} - {param.formatted_price}
                                                    </option>
                                                ))}
                                            </Select>

                                            <Select
                                                label="Regime"
                                                value={data.regime}
                                                onChange={(e) => handleFieldChange('regime', e.target.value)}
                                                error={errors.regime}
                                            >
                                                <option value="">{loadingParams ? 'Carregando...' : 'Selecione (opcional)'}</option>
                                                {pricingParams.regime?.filter(p => p.active).map((param) => (
                                                    <option key={param.code} value={param.code}>
                                                        {param.name} - {param.formatted_price}
                                                    </option>
                                                ))}
                                            </Select>
                                        </div>

                                        <Select
                                            label="Destino Final"
                                            value={data.final_destination}
                                            onChange={(e) => handleFieldChange('final_destination', e.target.value)}
                                            error={errors.final_destination}
                                        >
                                            <option value="">{loadingParams ? 'Carregando...' : 'Selecione (opcional)'}</option>
                                            {pricingParams.destination?.filter(p => p.active).map((param) => (
                                                <option key={param.code} value={param.code}>
                                                    {param.name} - {param.formatted_price}
                                                </option>
                                            ))}
                                        </Select>

                                        {/* Serviços Adicionais */}
                                        {pricingParams.additional_service && pricingParams.additional_service.length > 0 && (
                                            <div>
                                                <label className="block mb-3 text-sm font-medium text-slate-700">
                                                    Serviços Adicionais
                                                </label>
                                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                                    {pricingParams.additional_service.filter(p => p.active).map((service) => (
                                                        <label
                                                            key={service.code}
                                                            className="flex items-start gap-3 p-3 transition-colors border rounded-lg cursor-pointer border-slate-200 hover:bg-slate-50"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                value={service.code}
                                                                checked={selectedServices.includes(service.code)}
                                                                onChange={(e) => {
                                                                    const newServices = e.target.checked
                                                                        ? [...selectedServices, service.code]
                                                                        : selectedServices.filter(s => s !== service.code);
                                                                    setSelectedServices(newServices);
                                                                    setData('additional_services', newServices);
                                                                }}
                                                                className="w-4 h-4 mt-1 text-blue-600 rounded border-slate-300 focus:ring-blue-600"
                                                            />
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium text-slate-900">{service.name}</p>
                                                                {service.description && (
                                                                    <p className="text-xs text-slate-500 mt-0.5">{service.description}</p>
                                                                )}
                                                                <p className="mt-1 text-sm font-semibold text-blue-600">
                                                                    {service.formatted_price}
                                                                </p>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Cotação Automática */}
                            {data.type !== 'transport' && (data.container_type || data.cargo_type || data.regime || data.final_destination || selectedServices.length > 0) && (
                                <QuotationCalculator
                                    containerType={data.container_type}
                                    cargoType={data.cargo_type}
                                    regime={data.regime}
                                    finalDestination={data.final_destination}
                                    additionalServices={selectedServices}
                                    onQuotationCalculated={(quotation) => {
                                        setQuotationData(quotation);
                                        setData('quotation_data', quotation);
                                    }}
                                />
                            )}
                        </>
                    )}

                    {/* Botão de Submissão */}
                    {data.type && (
                        <div className="flex items-center justify-between p-6 bg-white border rounded-lg border-slate-200">
                            <Link
                                href="/shipments"
                                className="px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors bg-white border rounded-lg border-slate-300 hover:bg-slate-50"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={processing || !isFormValid()}
                                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white transition-colors bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg hover:from-blue-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-4 h-4" />
                                {processing ? 'Salvando Alterações...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </DashboardLayout>
    );
}
