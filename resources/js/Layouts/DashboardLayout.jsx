import { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    Package,
    Ship,
    FileText,
    DollarSign,
    Users,
    Settings,
    BarChart3,
    Bell,
    Search,
    Menu,
    X,
    LogOut,
    User,
    ChevronDown,
    Layers,
    AlertCircle,
    CheckCircle,
    Info,
    XCircle
} from 'lucide-react';

export default function DashboardLayout({ children }) {
    const { auth, flash, notifications } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Menu items com permissões
    const menuItems = [
        {
            name: 'Dashboard',
            icon: Home,
            href: '/dashboard',
            roles: ['admin', 'manager', 'operator', 'viewer'],
            badge: null
        },
        {
            name: 'Shipments',
            icon: Package,
            href: '/shipments',
            roles: ['admin', 'manager', 'operator'],
            badge: '12'
        },
        {
            name: 'Operações',
            icon: Layers,
            roles: ['admin', 'manager', 'operator'],
            submenu: [
                { name: 'Coleta de Dispersa', href: '/operations/coleta', roles: ['admin', 'manager', 'operator'] },
                { name: 'Legalização', href: '/operations/legalizacao', roles: ['admin', 'manager', 'operator'] },
                { name: 'Alfândegas', href: '/operations/alfandegas', roles: ['admin', 'manager', 'operator'] },
                { name: 'Cornelder', href: '/operations/cornelder', roles: ['admin', 'manager', 'operator'] },
            ]
        },
        {
            name: 'Documentos',
            icon: FileText,
            href: '/documents',
            roles: ['admin', 'manager', 'operator', 'viewer'],
            badge: null
        },
        {
            name: 'Finanças',
            icon: DollarSign,
            href: '/invoices',
            roles: ['admin', 'manager'],
            badge: '3'
        },
        {
            name: 'Relatórios',
            icon: BarChart3,
            href: '/reports',
            roles: ['admin', 'manager'],
            badge: null
        },
        {
            name: 'Linhas Navegação',
            icon: Ship,
            href: '/shipping-lines',
            roles: ['admin', 'manager'],
            badge: null
        },
        {
            name: 'Usuários',
            icon: Users,
            href: '/users',
            roles: ['admin'],
            badge: null
        },
        {
            name: 'Configurações',
            icon: Settings,
            href: '/settings',
            roles: ['admin', 'manager'],
            badge: null
        },
    ];

    // Filtrar menu baseado no role do usuário
    const filteredMenu = menuItems.filter(item =>
        item.roles.includes(auth.user?.role)
    );

    const unreadNotifications = notifications.filter(n => !n.read).length;

    // Flash messages
    useEffect(() => {
        if (flash.success || flash.error || flash.warning || flash.info) {
            const timer = setTimeout(() => {
                router.reload({ only: ['flash'] });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
            {/* Flash Messages */}
            <FlashMessages flash={flash} />

            {/* Topbar */}
            <Topbar
                auth={auth}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
                profileDropdownOpen={profileDropdownOpen}
                setProfileDropdownOpen={setProfileDropdownOpen}
                notificationsOpen={notificationsOpen}
                setNotificationsOpen={setNotificationsOpen}
                unreadNotifications={unreadNotifications}
                notifications={notifications}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            {/* Sidebar Desktop */}
            <Sidebar
                sidebarOpen={sidebarOpen}
                menuItems={filteredMenu}
                userRole={auth.user?.role}
            />

            {/* Mobile Menu */}
            <MobileSidebar
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
                menuItems={filteredMenu}
                userRole={auth.user?.role}
            />

            {/* Main Content */}
            <main
                className={`
                    transition-all duration-300 ease-in-out pt-20
                    ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'}
                `}
            >
                <div className="p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

// Topbar Component
function Topbar({
    auth,
    sidebarOpen,
    setSidebarOpen,
    mobileMenuOpen,
    setMobileMenuOpen,
    profileDropdownOpen,
    setProfileDropdownOpen,
    notificationsOpen,
    setNotificationsOpen,
    unreadNotifications,
    notifications,
    searchQuery,
    setSearchQuery
}) {
    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-40 border-b shadow-sm bg-white/80 backdrop-blur-xl border-gray-200/50"
        >
            <div className="flex items-center justify-between h-16 px-4 lg:px-6">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 transition-colors rounded-lg lg:hidden hover:bg-gray-100"
                    >
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6 text-gray-600" />
                        ) : (
                            <Menu className="w-6 h-6 text-gray-600" />
                        )}
                    </button>

                    {/* Desktop Sidebar Toggle */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="hidden p-2 transition-colors rounded-lg lg:block hover:bg-gray-100"
                    >
                        <Menu className="w-6 h-6 text-gray-600" />
                    </button>

                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="p-2 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                            <Ship className="w-6 h-6 text-white" />
                        </div>
                        <span className="hidden text-xl font-bold text-transparent md:block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text">
                            ShipManager
                        </span>
                    </Link>
                </div>

                {/* Center Section - Search */}
                <div className="flex-1 hidden max-w-2xl mx-8 md:flex">
                    <div className="relative w-full">
                        <Search className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-4 top-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar shipments, documentos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                        />
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2">
                    {/* Notifications */}
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setNotificationsOpen(!notificationsOpen)}
                            className="relative p-2 transition-colors rounded-xl hover:bg-gray-100"
                        >
                            <Bell className="w-6 h-6 text-gray-600" />
                            {unreadNotifications > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full top-1 right-1"
                                >
                                    {unreadNotifications}
                                </motion.span>
                            )}
                        </motion.button>

                        {/* Notifications Dropdown */}
                        <AnimatePresence>
                            {notificationsOpen && (
                                <NotificationsDropdown
                                    notifications={notifications}
                                    onClose={() => setNotificationsOpen(false)}
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                            className="flex items-center gap-3 px-3 py-2 transition-colors rounded-xl hover:bg-gray-100"
                        >
                            <div className="hidden text-right md:block">
                                <p className="text-sm font-semibold text-gray-900">{auth.user?.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{auth.user?.role}</p>
                            </div>
                            <div className="relative">
                                {auth.user?.avatar ? (
                                    <img
                                        src={auth.user.avatar}
                                        alt={auth.user.name}
                                        className="object-cover w-10 h-10 rounded-full ring-2 ring-blue-500"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-full bg-gradient-to-br from-blue-500 to-purple-600 ring-2 ring-blue-500">
                                        {auth.user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <ChevronDown className="hidden w-4 h-4 text-gray-600 md:block" />
                        </motion.button>

                        {/* Profile Dropdown */}
                        <AnimatePresence>
                            {profileDropdownOpen && (
                                <ProfileDropdown
                                    auth={auth}
                                    onClose={() => setProfileDropdownOpen(false)}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}

// Sidebar Component
function Sidebar({ sidebarOpen, menuItems, userRole }) {
    const [expandedItems, setExpandedItems] = useState([]);
    const currentPath = window.location.pathname;

    const toggleSubmenu = (itemName) => {
        setExpandedItems(prev =>
            prev.includes(itemName)
                ? prev.filter(i => i !== itemName)
                : [...prev, itemName]
        );
    };

    return (
        <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0, width: sidebarOpen ? 288 : 80 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed bottom-0 left-0 z-30 hidden lg:block top-16"
        >
            <div className="h-full overflow-y-auto border-r shadow-xl bg-white/80 backdrop-blur-xl border-gray-200/50">
                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => (
                        <MenuItem
                            key={item.name}
                            item={item}
                            sidebarOpen={sidebarOpen}
                            currentPath={currentPath}
                            expanded={expandedItems.includes(item.name)}
                            onToggle={() => toggleSubmenu(item.name)}
                            userRole={userRole}
                        />
                    ))}
                </nav>

                {/* User Card at Bottom */}
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 border-t border-gray-200"
                    >
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                            <p className="mb-1 text-sm font-semibold text-gray-900">
                                Plano Pro
                            </p>
                            <p className="mb-3 text-xs text-gray-600">
                                Shipments ilimitados
                            </p>
                            <button className="w-full px-3 py-2 text-sm font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                Upgrade
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.aside>
    );
}

// Menu Item Component
function MenuItem({ item, sidebarOpen, currentPath, expanded, onToggle, userRole }) {
    const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/');
    const hasSubmenu = item.submenu && item.submenu.length > 0;

    if (hasSubmenu) {
        return (
            <div>
                <motion.button
                    whileHover={{ x: 4 }}
                    onClick={onToggle}
                    className={`
                        w-full flex items-center justify-between px-4 py-3 rounded-xl
                        transition-all duration-200 group
                        ${expanded ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}
                    `}
                >
                    <div className="flex items-center gap-3">
                        <item.icon className={`h-5 w-5 ${expanded ? 'text-blue-600' : 'text-gray-500'}`} />
                        {sidebarOpen && (
                            <span className="font-medium">{item.name}</span>
                        )}
                    </div>
                    {sidebarOpen && (
                        <ChevronDown
                            className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                        />
                    )}
                </motion.button>

                <AnimatePresence>
                    {expanded && sidebarOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-2 ml-4 space-y-1 overflow-hidden"
                        >
                            {item.submenu
                                .filter(subItem => subItem.roles.includes(userRole))
                                .map((subItem) => (
                                    <Link
                                        key={subItem.name}
                                        href={subItem.href}
                                        className={`
                                            flex items-center gap-3 px-4 py-2 rounded-lg
                                            transition-all duration-200
                                            ${currentPath === subItem.href
                                                ? 'bg-blue-100 text-blue-600 font-medium'
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        <div className="h-1.5 w-1.5 rounded-full bg-current"></div>
                                        <span className="text-sm">{subItem.name}</span>
                                    </Link>
                                ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <Link href={item.href}>
            <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`
                    relative flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200 group
                    ${isActive
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50'
                        : 'text-gray-600 hover:bg-gray-50'
                    }
                `}
            >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`} />
                {sidebarOpen && (
                    <span className="flex-1 font-medium">{item.name}</span>
                )}
                {item.badge && sidebarOpen && (
                    <span className={`
                        px-2 py-1 text-xs font-bold rounded-full
                        ${isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'}
                    `}>
                        {item.badge}
                    </span>
                )}
                {!sidebarOpen && item.badge && (
                    <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full -top-1 -right-1">
                        {item.badge}
                    </span>
                )}
            </motion.div>
        </Link>
    );
}

// Mobile Sidebar
function MobileSidebar({ mobileMenuOpen, setMobileMenuOpen, menuItems, userRole }) {
    return (
        <AnimatePresence>
            {mobileMenuOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileMenuOpen(false)}
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="fixed top-0 bottom-0 left-0 z-50 bg-white shadow-2xl w-72 lg:hidden"
                    >
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                                        <Ship className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text">
                                        ShipManager
                                    </span>
                                </div>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100"
                                >
                                    <X className="w-6 h-6 text-gray-600" />
                                </button>
                            </div>

                            {/* Menu */}
                            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                                {menuItems.map((item) => (
                                    <MenuItem
                                        key={item.name}
                                        item={item}
                                        sidebarOpen={true}
                                        currentPath={window.location.pathname}
                                        userRole={userRole}
                                    />
                                ))}
                            </nav>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Notifications Dropdown
function NotificationsDropdown({ notifications, onClose }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 z-50 overflow-hidden bg-white border border-gray-200 shadow-2xl top-12 w-96 rounded-2xl"
        >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-900">Notificações</h3>
                <button
                    onClick={onClose}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                    Marcar todas como lida
                </button>
            </div>
            <div className="overflow-y-auto max-h-96">
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <NotificationItem key={notification.id} notification={notification} />
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>Nenhuma notificação</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function NotificationItem({ notification }) {
    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-500" />,
        warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
        error: <XCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />
    };

    return (
        <motion.div
            whileHover={{ backgroundColor: 'rgba(249, 250, 251, 1)' }}
            className="p-4 border-b border-gray-100 cursor-pointer last:border-0"
        >
            <div className="flex gap-3">
                {icons[notification.type]}
                <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                    <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                    <p className="mt-2 text-xs text-gray-400">{notification.time}</p>
                </div>
                {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
            </div>
        </motion.div>
    );
}

// Profile Dropdown
function ProfileDropdown({ auth, onClose }) {
    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 z-50 overflow-hidden bg-white border border-gray-200 shadow-2xl top-12 w-72 rounded-2xl"
        >
            <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="flex items-center gap-3">
                    {auth.user?.avatar ? (
                        <img
                            src={auth.user.avatar}
                            alt={auth.user.name}
                            className="object-cover w-12 h-12 rounded-full ring-2 ring-white"
                        />
                    ) : (
                        <div className="flex items-center justify-center w-12 h-12 text-lg font-bold text-white rounded-full bg-gradient-to-br from-blue-500 to-purple-600 ring-2 ring-white">
                            {auth.user?.name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <p className="font-bold text-gray-900">{auth.user?.name}</p>
                        <p className="text-sm text-gray-600">{auth.user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full capitalize">
                            {auth.user?.role}
                        </span>
                    </div>
                </div>
            </div>
            <div className="p-2">
                <Link href="/profile">
                    <motion.button
                        whileHover={{ x: 4 }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                        <User className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-700">Meu Perfil</span>
                    </motion.button>
                </Link>
                <Link href="/settings">
                    <motion.button
                        whileHover={{ x: 4 }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                        <Settings className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-700">Configurações</span>
                    </motion.button>
                </Link>
                <div className="my-2 border-t border-gray-200"></div>
                <motion.button
                    whileHover={{ x: 4 }}
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-red-50 transition-colors text-left"
                >
                    <LogOut className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-600">Sair</span>
                </motion.button>
            </div>
        </motion.div>
    );
}

// Flash Messages
function FlashMessages({ flash }) {
    if (!flash.success && !flash.error && !flash.warning && !flash.info) {
        return null;
    }

    const message = flash.success || flash.error || flash.warning || flash.info;
    const type = flash.success ? 'success' : flash.error ? 'error' : flash.warning ? 'warning' : 'info';

    const styles = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <XCircle className="w-5 h-5" />,
        warning: <AlertCircle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed z-50 max-w-md top-20 right-4"
        >
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${styles[type]}`}>
                {icons[type]}
                <p className="font-medium">{message}</p>
            </div>
        </motion.div>
    );
}
