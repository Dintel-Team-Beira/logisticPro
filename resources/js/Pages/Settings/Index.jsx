import { useState } from 'react';
import { Head, router, useForm, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Card from '@/Components/Card';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Bell,
    Building2,
    Key,
    Shield,
    Palette,
    Globe,
    DollarSign,
    Save,
    Upload,
    CheckCircle,
    AlertCircle,
    Camera,
    Lock,
    Mail,
    Phone,
    Briefcase,
    Clock,
    MapPin,
    Calendar,
    Package,
    BarChart3,
    FileText,
    X,
    Settings as SettingsIcon,
    ArrowRight,
} from 'lucide-react';
import Select from '@/Components/Forms/Select';

export default function Settings({ auth, userSettings, companySettings, notificationPreferences, stats }) {
    const [activeTab, setActiveTab] = useState('profile');
    const [avatarPreview, setAvatarPreview] = useState(null);

    // Tabs de navegação
    const tabs = [
        { id: 'profile', label: 'Perfil', icon: User },
        { id: 'preferences', label: 'Preferências', icon: Palette },
        { id: 'notifications', label: 'Notificações', icon: Bell },
        { id: 'security', label: 'Segurança', icon: Shield },
        ...(auth.user.role === 'admin' ? [
            { id: 'company', label: 'Empresa', icon: Building2 },
            { id: 'api', label: 'API', icon: Key },
        ] : [])
    ];

    // Form: Perfil
    const profileForm = useForm({
        name: auth.user.name || '',
        email: auth.user.email || '',
        phone: auth.user.phone || '',
        department: auth.user.department || '',
    });

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        profileForm.put(route('settings.profile.update'), {
            preserveScroll: true,
        });
    };

    // Form: Avatar
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarPreview(URL.createObjectURL(file));
            router.post(route('settings.profile.avatar'), {
                avatar: file
            }, {
                forceFormData: true,
                preserveScroll: true,
            });
        }
    };

    // Form: Senha
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        passwordForm.put(route('settings.password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
            }
        });
    };

    // Form: Preferências
    const preferencesForm = useForm({
        theme: userSettings?.theme || 'light',
        language: userSettings?.language || 'pt',
        timezone: userSettings?.timezone || 'Africa/Maputo',
        date_format: userSettings?.date_format || 'DD/MM/YYYY',
        currency: userSettings?.currency || 'MZN',
        items_per_page: userSettings?.items_per_page || 25,
    });

    const handlePreferencesSubmit = (e) => {
        e.preventDefault();
        preferencesForm.put(route('settings.preferences.update'), {
            preserveScroll: true,
        });
    };

    // Form: Notificações
    const notificationsForm = useForm({
        email_notifications: notificationPreferences?.email_notifications ?? true,
        shipment_updates: notificationPreferences?.shipment_updates ?? true,
        document_alerts: notificationPreferences?.document_alerts ?? true,
        payment_reminders: notificationPreferences?.payment_reminders ?? true,
        storage_warnings: notificationPreferences?.storage_warnings ?? true,
        deadline_alerts: notificationPreferences?.deadline_alerts ?? true,
        daily_summary: notificationPreferences?.daily_summary ?? false,
        weekly_report: notificationPreferences?.weekly_report ?? true,
    });

    const handleNotificationsSubmit = (e) => {
        e.preventDefault();
        notificationsForm.put(route('settings.notifications.update'), {
            preserveScroll: true,
        });
    };

    // Form: Empresa
    const companyForm = useForm({
        company_name: companySettings?.company_name || '',
        company_email: companySettings?.company_email || '',
        company_phone: companySettings?.company_phone || '',
        company_address: companySettings?.company_address || '',
        tax_id: companySettings?.tax_id || '',
    });


    // Form: Faturação/Invoice
const invoiceForm = useForm({
    invoice_prefix: companySettings?.invoice_settings?.invoice_prefix || 'INV',
    next_invoice_number: companySettings?.invoice_settings?.next_invoice_number || 1,
    default_payment_terms: companySettings?.invoice_settings?.default_payment_terms || 30,
    default_margin_percentage: companySettings?.invoice_settings?.default_margin_percentage || 15,
    bank_details: companySettings?.invoice_settings?.bank_details || '',
    invoice_notes: companySettings?.invoice_settings?.invoice_notes || '',
});

// Form: Configurações Avançadas
const advancedForm = useForm({
    maintenance_mode: companySettings?.maintenance_mode || false,
    two_factor_enabled: companySettings?.two_factor_enabled || false,
    session_timeout: companySettings?.session_timeout || 120,
});
    const handleCompanySubmit = (e) => {
        e.preventDefault();
        companyForm.put(route('settings.company.update'), {
            preserveScroll: true,
        });
    };

        const roleOptions = [
        { value: 'admin', label: 'Administrador' },
        { value: 'manager', label: 'Gerente' },
        { value: 'operator', label: 'Operador' },
        { value: 'viewer', label: 'Visualizador' },
    ];
    return (
        <DashboardLayout>
            <Head title="Configurações" />

      <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Configurações</h1>
                        <p className="mt-1 text-slate-600">
                            Gerencie suas preferências e configurações do sistema
                        </p>
                    </div>
                </motion.div>

                {/* Admin Quick Access - Parâmetros de Precificação */}
                {auth.user.role === 'admin' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Link href="/settings/pricing-parameters">
                            <Card className="p-6 transition-all cursor-pointer bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-xl hover:scale-[1.02]">
                                <div className="flex items-center justify-between text-white">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-white/20 rounded-xl">
                                            <DollarSign className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">Parâmetros de Precificação</h3>
                                            <p className="mt-1 text-sm text-blue-100">
                                                Configure os preços para cotações automáticas (Containers, Destinos, Serviços, etc)
                                            </p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-6 h-6" />
                                </div>
                            </Card>
                        </Link>
                    </motion.div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Briefcase className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Processos Criados</p>
                                    <p className="text-2xl font-bold text-slate-900">{stats?.shipments_created || 0}</p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-lg bg-emerald-100">
                                    <Upload className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Documentos Enviados</p>
                                    <p className="text-2xl font-bold text-slate-900">{stats?.documents_uploaded || 0}</p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <Clock className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Último Acesso</p>
                                    <p className="text-sm font-medium text-slate-900">
                                        {stats?.last_login || 'Primeiro acesso'}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    {/* Sidebar Tabs */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-2"
                    >
                        {tabs.map((tab) => (
                            <motion.button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all
                                    ${activeTab === tab.id
                                        ? 'bg-slate-900 text-white shadow-lg'
                                        : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                                    }
                                `}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span className="font-medium">{tab.label}</span>
                            </motion.button>
                        ))}
                    </motion.div>

                    {/* Content Area */}
                    <div className="lg:col-span-3">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card className="p-6">
                                    {/* TAB: Perfil */}
                                    {activeTab === 'profile' && (
                                        <div className="space-y-6">
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-900">Perfil do Usuário</h2>
                                                <p className="mt-1 text-slate-600">Atualize suas informações pessoais</p>
                                            </div>

                                            {/* Avatar Section */}
                                            <div className="pb-6 border-b border-slate-200">
                                                <label className="block mb-3 text-sm font-medium text-slate-700">
                                                    Foto de Perfil
                                                </label>
                                                <div className="flex items-center gap-6">
                                                    <div className="relative group">
                                                        {avatarPreview || auth.user.avatar ? (
                                                            <img
                                                                src={avatarPreview || auth.user.avatar}
                                                                alt="Avatar"
                                                                className="object-cover w-24 h-24 border-4 rounded-full border-slate-200"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center justify-center w-24 h-24 border-4 rounded-full bg-slate-100 border-slate-200">
                                                                <span className="text-3xl font-bold text-slate-600">
                                                                    {auth.user.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <label className="absolute inset-0 flex items-center justify-center transition-opacity bg-black rounded-full opacity-0 cursor-pointer bg-opacity-40 group-hover:opacity-100">
                                                            <Camera className="w-6 h-6 text-white" />
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleAvatarChange}
                                                                className="hidden"
                                                            />
                                                        </label>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">
                                                            {auth.user.name}
                                                        </p>
                                                        <p className="text-sm text-slate-600">{auth.user.role}</p>
                                                        <label className="inline-flex items-center gap-2 px-4 py-2 mt-2 text-sm font-medium transition-colors border rounded-lg cursor-pointer text-slate-700 border-slate-300 hover:bg-slate-50">
                                                            <Upload className="w-4 h-4" />
                                                            Alterar foto
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleAvatarChange}
                                                                className="hidden"
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Profile Form */}
                                            <form onSubmit={handleProfileSubmit} className="space-y-4">
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div>
                                                        <label className="block mb-2 text-sm font-medium text-slate-700">
                                                            <User className="inline-block w-4 h-4 mr-2" />
                                                            Nome Completo
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={profileForm.data.name}
                                                            onChange={e => profileForm.setData('name', e.target.value)}
                                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                                            required
                                                        />
                                                        {profileForm.errors.name && (
                                                            <p className="mt-1 text-sm text-red-600">{profileForm.errors.name}</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block mb-2 text-sm font-medium text-slate-700">
                                                            <Mail className="inline-block w-4 h-4 mr-2" />
                                                            Email
                                                        </label>
                                                        <input
                                                            type="email"
                                                            value={profileForm.data.email}
                                                            onChange={e => profileForm.setData('email', e.target.value)}
                                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                                            required
                                                        />
                                                        {profileForm.errors.email && (
                                                            <p className="mt-1 text-sm text-red-600">{profileForm.errors.email}</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block mb-2 text-sm font-medium text-slate-700">
                                                            <Phone className="inline-block w-4 h-4 mr-2" />
                                                            Telefone
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={profileForm.data.phone}
                                                            onChange={e => profileForm.setData('phone', e.target.value)}
                                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                                            placeholder="+258 84 000 0000"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block mb-2 text-sm font-medium text-slate-700">
                                                            <Briefcase className="inline-block w-4 h-4 mr-2" />
                                                            Departamento
                                                        </label>
                                                          <Select
                                                                                    //   label="Função"
                                                                                      options={roleOptions}
                                                                                      value={profileForm.data.department}
                                                                                     onChange={e => profileForm.setData('department', e.target.value)}
                                                                                    //   error={errors.role}
                                                                                      helper="Define as permissões do usuário no sistema"
                                                                                      required
                                                                                  />
                                                        {/* <input
                                                            type="text"
                                                            value={profileForm.data.department}
                                                            onChange={e => profileForm.setData('department', e.target.value)}
                                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                                            placeholder="Ex: Operações"
                                                        /> */}
                                                    </div>
                                                </div>

                                                <div className="flex justify-end pt-4">
                                                    <motion.button
                                                        type="submit"
                                                        disabled={profileForm.processing}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                        {profileForm.processing ? 'Salvando...' : 'Salvar Perfil'}
                                                    </motion.button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    {/* TAB: Segurança */}
                                    {activeTab === 'security' && (
                                        <div className="space-y-6">
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-900">Segurança</h2>
                                                <p className="mt-1 text-slate-600">Altere sua senha e configure opções de segurança</p>
                                            </div>

                                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                                <div>
                                                    <label className="block mb-2 text-sm font-medium text-slate-700">
                                                        <Lock className="inline-block w-4 h-4 mr-2" />
                                                        Senha Atual
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={passwordForm.data.current_password}
                                                        onChange={e => passwordForm.setData('current_password', e.target.value)}
                                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                                        required
                                                    />
                                                    {passwordForm.errors.current_password && (
                                                        <p className="mt-1 text-sm text-red-600">{passwordForm.errors.current_password}</p>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div>
                                                        <label className="block mb-2 text-sm font-medium text-slate-700">
                                                            Nova Senha
                                                        </label>
                                                        <input
                                                            type="password"
                                                            value={passwordForm.data.password}
                                                            onChange={e => passwordForm.setData('password', e.target.value)}
                                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                                            required
                                                        />
                                                        {passwordForm.errors.password && (
                                                            <p className="mt-1 text-sm text-red-600">{passwordForm.errors.password}</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block mb-2 text-sm font-medium text-slate-700">
                                                            Confirmar Senha
                                                        </label>
                                                        <input
                                                            type="password"
                                                            value={passwordForm.data.password_confirmation}
                                                            onChange={e => passwordForm.setData('password_confirmation', e.target.value)}
                                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="p-4 rounded-lg bg-blue-50">
                                                    <div className="flex gap-3">
                                                        <AlertCircle className="flex-shrink-0 w-5 h-5 text-blue-600" />
                                                        <div className="text-sm text-blue-900">
                                                            <p className="font-medium">Dica de segurança:</p>
                                                            <ul className="mt-2 space-y-1 list-disc list-inside">
                                                                <li>Use no mínimo 8 caracteres</li>
                                                                <li>Inclua letras maiúsculas e minúsculas</li>
                                                                <li>Adicione números e símbolos</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end pt-4">
                                                    <motion.button
                                                        type="submit"
                                                        disabled={passwordForm.processing}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                                                    >
                                                        <Lock className="w-4 h-4" />
                                                        {passwordForm.processing ? 'Alterando...' : 'Alterar Senha'}
                                                    </motion.button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    {/* TAB: Preferências */}
                                    {activeTab === 'preferences' && (
                                        <div className="space-y-6">
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-900">Preferências do Sistema</h2>
                                                <p className="mt-1 text-slate-600">Personalize a experiência do sistema</p>
                                            </div>

                                            <form onSubmit={handlePreferencesSubmit} className="space-y-4">
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div>
                                                        <label className="block mb-2 text-sm font-medium text-slate-700">
                                                            <Palette className="inline-block w-4 h-4 mr-2" />
                                                            Tema
                                                        </label>
                                                        <select
                                                            value={preferencesForm.data.theme}
                                                            onChange={e => preferencesForm.setData('theme', e.target.value)}
                                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                                        >
                                                            <option value="light">☀️ Claro</option>
                                                            <option value="dark">🌙 Escuro</option>
                                                            <option value="auto">🔄 Automático</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block mb-2 text-sm font-medium text-slate-700">
                                                            <Globe className="inline-block w-4 h-4 mr-2" />
                                                            Idioma
                                                        </label>
                                                        <select
                                                            value={preferencesForm.data.language}
                                                            onChange={e => preferencesForm.setData('language', e.target.value)}
                                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                                        >
                                                            <option value="pt">🇵🇹 Português</option>
                                                            <option value="en">🇬🇧 English</option>
                                                            <option value="es">🇪🇸 Español</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block mb-2 text-sm font-medium text-slate-700">
                                                            <MapPin className="inline-block w-4 h-4 mr-2" />
                                                            Fuso Horário
                                                        </label>
                                                        <select
                                                            value={preferencesForm.data.timezone}
                                                            onChange={e => preferencesForm.setData('timezone', e.target.value)}
                                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                                        >
                                                            <option value="Africa/Maputo">Africa/Maputo (CAT)</option>
                                                            <option value="Europe/Lisbon">Europe/Lisbon (WET)</option>
                                                            <option value="America/New_York">America/New_York (EST)</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block mb-2 text-sm font-medium text-slate-700">
                                                            <Calendar className="inline-block w-4 h-4 mr-2" />
                                                            Formato de Data
                                                        </label>
                                                        <select
                                                            value={preferencesForm.data.date_format}
                                                            onChange={e => preferencesForm.setData('date_format', e.target.value)}
                                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                                        >
                                                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block mb-2 text-sm font-medium text-slate-700">
                                                            <DollarSign className="inline-block w-4 h-4 mr-2" />
                                                            Moeda
                                                        </label>
                                                        <select
                                                            value={preferencesForm.data.currency}
                                                            onChange={e => preferencesForm.setData('currency', e.target.value)}
                                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                                        >
                                                            <option value="MZN">MZN (Metical)</option>
                                                            <option value="USD">USD (Dólar)</option>
                                                            <option value="EUR">EUR (Euro)</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block mb-2 text-sm font-medium text-slate-700">
                                                            Itens por Página
                                                        </label>
                                                        <select
                                                            value={preferencesForm.data.items_per_page}
                                                            onChange={e => preferencesForm.setData('items_per_page', parseInt(e.target.value))}
                                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                                        >
                                                            <option value={10}>10</option>
                                                            <option value={25}>25</option>
                                                            <option value={50}>50</option>
                                                            <option value={100}>100</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end pt-4">
                                                    <motion.button
                                                        type="submit"
                                                        disabled={preferencesForm.processing}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                        {preferencesForm.processing ? 'Salvando...' : 'Salvar Preferências'}
                                                    </motion.button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    {/* TAB: Notificações - CORRIGIDO */}
                                    {activeTab === 'notifications' && (
                                        <div className="space-y-6">
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-900">Notificações</h2>
                                                <p className="mt-1 text-slate-600">Controle quais notificações você deseja receber</p>
                                            </div>

                                            <form onSubmit={handleNotificationsSubmit} className="space-y-4">
                                                <div className="space-y-4">
                                                    {[
                                                        { key: 'email_notifications', label: 'Receber notificações por email', icon: Mail },
                                                        { key: 'shipment_updates', label: 'Atualizações de processos', icon: Package },
                                                        { key: 'document_alerts', label: 'Alertas de documentos', icon: AlertCircle },
                                                        { key: 'payment_reminders', label: 'Lembretes de pagamento', icon: DollarSign },
                                                        { key: 'storage_warnings', label: 'Avisos de storage crítico', icon: AlertCircle },
                                                        { key: 'deadline_alerts', label: 'Alertas de prazos', icon: Clock },
                                                        { key: 'daily_summary', label: 'Resumo diário', icon: Mail },
                                                        { key: 'weekly_report', label: 'Relatório semanal', icon: BarChart3 },
                                                    ].map((notification) => {
                                                        const Icon = notification.icon;
                                                        return (
                                                            <label
                                                                key={notification.key}
                                                                className="flex items-center justify-between p-4 transition-all border rounded-lg cursor-pointer border-slate-200 hover:bg-slate-50"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <Icon className="w-5 h-5 text-slate-600" />
                                                                    <span className="font-medium text-slate-900">
                                                                        {notification.label}
                                                                    </span>
                                                                </div>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={notificationsForm.data[notification.key]}
                                                                    onChange={e => notificationsForm.setData(notification.key, e.target.checked)}
                                                                    className="w-5 h-5 rounded text-slate-900 focus:ring-slate-900"
                                                                />
                                                            </label>
                                                        );
                                                    })}
                                                </div>

                                                <div className="flex justify-end pt-4">
                                                    <motion.button
                                                        type="submit"
                                                        disabled={notificationsForm.processing}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                        {notificationsForm.processing ? 'Salvando...' : 'Salvar Notificações'}
                                                    </motion.button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    {/* TAB: Empresa - CORRIGIDO */}
                           {/* TAB: Empresa - VERSÃO COMPLETA */}
{activeTab === 'company' && auth.user.role === 'admin' && (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold text-slate-900">Configurações da Empresa</h2>
            <p className="mt-1 text-slate-600">Configure os dados e preferências da empresa</p>
        </div>

        {/* Seção 1: Dados Básicos */}
        <div className="p-6 border rounded-lg border-slate-200 bg-slate-50">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
                <Building2 className="inline-block w-5 h-5 mr-2" />
                Informações da Empresa
            </h3>

            <form onSubmit={handleCompanySubmit} className="space-y-4">
                {/* Logo Upload */}
                <div className="pb-4 border-b border-slate-200">
                    <label className="block mb-3 text-sm font-medium text-slate-700">
                        Logo da Empresa
                    </label>
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            {companySettings?.logo ? (
                                <img
                                    src={`/storage/${companySettings.logo}`}
                                    alt="Logo"
                                    className="object-contain w-24 h-24 p-2 bg-white border-4 rounded-lg border-slate-200"
                                />
                            ) : (
                                <div className="flex items-center justify-center w-24 h-24 border-4 rounded-lg bg-slate-100 border-slate-200">
                                    <Building2 className="w-12 h-12 text-slate-400" />
                                </div>
                            )}
                            <label className="absolute inset-0 flex items-center justify-center transition-opacity bg-black rounded-lg opacity-0 cursor-pointer bg-opacity-40 group-hover:opacity-100">
                                <Upload className="w-6 h-6 text-white" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const formData = new FormData();
                                            formData.append('logo', file);
                                            router.post(route('settings.company.update'), formData, {
                                                forceFormData: true,
                                                preserveScroll: true,
                                            });
                                        }
                                    }}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-900">
                                {companySettings?.company_name || 'Nome da Empresa'}
                            </p>
                            <p className="text-sm text-slate-600">Clique no logo para alterar</p>
                            <p className="mt-1 text-xs text-slate-500">Recomendado: 500x500px, PNG ou JPG</p>
                        </div>
                    </div>
                </div>

                {/* Dados da Empresa */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            <Building2 className="inline-block w-4 h-4 mr-2" />
                            Nome da Empresa *
                        </label>
                        <input
                            type="text"
                            value={companyForm.data.company_name}
                            onChange={e => companyForm.setData('company_name', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                            required
                        />
                        {companyForm.errors.company_name && (
                            <p className="mt-1 text-sm text-red-600">{companyForm.errors.company_name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            <Mail className="inline-block w-4 h-4 mr-2" />
                            Email da Empresa *
                        </label>
                        <input
                            type="email"
                            value={companyForm.data.company_email}
                            onChange={e => companyForm.setData('company_email', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                            required
                        />
                        {companyForm.errors.company_email && (
                            <p className="mt-1 text-sm text-red-600">{companyForm.errors.company_email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            <Phone className="inline-block w-4 h-4 mr-2" />
                            Telefone *
                        </label>
                        <input
                            type="text"
                            value={companyForm.data.company_phone}
                            onChange={e => companyForm.setData('company_phone', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                            placeholder="+258 84 000 0000"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            <FileText className="inline-block w-4 h-4 mr-2" />
                            NUIT (Tax ID)
                        </label>
                        <input
                            type="text"
                            value={companyForm.data.tax_id}
                            onChange={e => companyForm.setData('tax_id', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                            placeholder="123456789"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            <MapPin className="inline-block w-4 h-4 mr-2" />
                            Endereço Completo
                        </label>
                        <textarea
                            value={companyForm.data.company_address}
                            onChange={e => companyForm.setData('company_address', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                            placeholder="Endereço completo da empresa"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <motion.button
                        type="submit"
                        disabled={companyForm.processing}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {companyForm.processing ? 'Salvando...' : 'Salvar Informações'}
                    </motion.button>
                </div>
            </form>
        </div>

        {/* Seção 2: Configurações de Faturação */}
        <div className="p-6 border rounded-lg border-slate-200 bg-slate-50">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
                <DollarSign className="inline-block w-5 h-5 mr-2" />
                Configurações de Faturação
            </h3>

            <form onSubmit={(e) => {
                e.preventDefault();
                router.put(route('settings.invoices.update'), {
                    invoice_prefix: invoiceForm.data.invoice_prefix,
                    next_invoice_number: invoiceForm.data.next_invoice_number,
                    default_payment_terms: invoiceForm.data.default_payment_terms,
                    default_margin_percentage: invoiceForm.data.default_margin_percentage,
                    bank_details: invoiceForm.data.bank_details,
                    invoice_notes: invoiceForm.data.invoice_notes,
                }, {
                    preserveScroll: true,
                });
            }} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            Prefixo da Fatura
                        </label>
                        <input
                            type="text"
                            value={invoiceForm.data.invoice_prefix}
                            onChange={e => invoiceForm.setData('invoice_prefix', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                            placeholder="INV"
                            maxLength={10}
                        />
                        <p className="mt-1 text-xs text-slate-500">
                            Exemplo: INV-00001, FAT-00001
                        </p>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            Próximo Número
                        </label>
                        <input
                            type="number"
                            value={invoiceForm.data.next_invoice_number}
                            onChange={e => invoiceForm.setData('next_invoice_number', parseInt(e.target.value))}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                            min="1"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                            Próxima fatura: {invoiceForm.data.invoice_prefix}-{String(invoiceForm.data.next_invoice_number).padStart(5, '0')}
                        </p>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            Prazo de Pagamento Padrão (dias)
                        </label>
                        <input
                            type="number"
                            value={invoiceForm.data.default_payment_terms}
                            onChange={e => invoiceForm.setData('default_payment_terms', parseInt(e.target.value))}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                            min="1"
                            placeholder="30"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            Margem de Lucro Padrão (%)
                        </label>
                        <input
                            type="number"
                            value={invoiceForm.data.default_margin_percentage}
                            onChange={e => invoiceForm.setData('default_margin_percentage', parseFloat(e.target.value))}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="15"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            Dados Bancários
                        </label>
                        <textarea
                            value={invoiceForm.data.bank_details}
                            onChange={e => invoiceForm.setData('bank_details', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                            placeholder="Banco: BCI&#10;Conta: 12345678&#10;NIB: 000100001234567890123"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            Notas da Fatura (rodapé)
                        </label>
                        <textarea
                            value={invoiceForm.data.invoice_notes}
                            onChange={e => invoiceForm.setData('invoice_notes', e.target.value)}
                            rows={2}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                            placeholder="Texto que aparecerá no rodapé das faturas"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <motion.button
                        type="submit"
                        disabled={invoiceForm.processing}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {invoiceForm.processing ? 'Salvando...' : 'Salvar Faturação'}
                    </motion.button>
                </div>
            </form>
        </div>

        {/* Seção 3: Configurações Avançadas */}
        <div className="p-6 border rounded-lg border-slate-200 bg-slate-50">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
                <Shield className="inline-block w-5 h-5 mr-2" />
                Configurações Avançadas
            </h3>

            <div className="space-y-4">
                <label className="flex items-center justify-between p-4 transition-all border rounded-lg cursor-pointer border-slate-200 hover:bg-white">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-slate-600" />
                        <div>
                            <span className="font-medium text-slate-900">Modo de Manutenção</span>
                            <p className="text-sm text-slate-600">Bloquear acesso ao sistema temporariamente</p>
                        </div>
                    </div>
                    <input
                        type="checkbox"
                        checked={advancedForm.data.maintenance_mode}
                        onChange={e => {
                            advancedForm.setData('maintenance_mode', e.target.checked);
                            router.put(route('settings.company.update'), {
                                maintenance_mode: e.target.checked
                            }, {
                                preserveScroll: true,
                            });
                        }}
                        className="w-5 h-5 rounded text-slate-900 focus:ring-slate-900"
                    />
                </label>

                <label className="flex items-center justify-between p-4 transition-all border rounded-lg cursor-pointer border-slate-200 hover:bg-white">
                    <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-slate-600" />
                        <div>
                            <span className="font-medium text-slate-900">Autenticação de Dois Fatores</span>
                            <p className="text-sm text-slate-600">Exigir 2FA para todos os usuários</p>
                        </div>
                    </div>
                    <input
                        type="checkbox"
                        checked={advancedForm.data.two_factor_enabled}
                        onChange={e => {
                            advancedForm.setData('two_factor_enabled', e.target.checked);
                            router.put(route('settings.company.update'), {
                                two_factor_enabled: e.target.checked
                            }, {
                                preserveScroll: true,
                            });
                        }}
                        className="w-5 h-5 rounded text-slate-900 focus:ring-slate-900"
                    />
                </label>

                <div className="p-4 border rounded-lg border-slate-200">
                    <label className="block mb-2 text-sm font-medium text-slate-700">
                        <Clock className="inline-block w-4 h-4 mr-2" />
                        Timeout de Sessão (minutos)
                    </label>
                    <input
                        type="number"
                        value={advancedForm.data.session_timeout}
                        onChange={e => advancedForm.setData('session_timeout', parseInt(e.target.value))}
                        onBlur={() => {
                            router.put(route('settings.company.update'), {
                                session_timeout: advancedForm.data.session_timeout
                            }, {
                                preserveScroll: true,
                            });
                        }}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                        min="5"
                        max="1440"
                        placeholder="120"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                        Tempo até desconectar usuário inativo (5-1440 minutos)
                    </p>
                </div>
            </div>
        </div>

        {/* Alerta Informativo */}
        <div className="p-4 rounded-lg bg-amber-50">
            <div className="flex gap-3">
                <AlertCircle className="flex-shrink-0 w-5 h-5 text-amber-600" />
                <div className="text-sm text-amber-900">
                    <p className="font-medium">Importante:</p>
                    <p className="mt-1">
                        Estas configurações afetam todo o sistema. Alterações nas configurações de faturação
                        serão aplicadas apenas para novas faturas geradas.
                    </p>
                </div>
            </div>
        </div>
    </div>
)}
                                    {/* TAB: API */}
                                    {activeTab === 'api' && auth.user.role === 'admin' && (
                                        <div className="space-y-6">
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-900">API & Integrações</h2>
                                                <p className="mt-1 text-slate-600">Gere tokens para integração com sistemas externos</p>
                                            </div>

                                            <div className="p-6 border rounded-lg border-slate-200 bg-slate-50">
                                                <div className="flex items-start gap-4">
                                                    <div className="p-3 bg-blue-100 rounded-lg">
                                                        <Key className="w-8 h-8 text-blue-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-slate-900">Token API</h3>
                                                        <p className="mt-1 text-sm text-slate-600">
                                                            Gere um token para acessar a API do sistema programaticamente
                                                        </p>
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => router.post(route('settings.api-token.generate'))}
                                                            className="flex items-center gap-2 px-6 py-2.5 mt-4 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                                                        >
                                                            <Key className="w-4 h-4" />
                                                            Gerar Novo Token
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
