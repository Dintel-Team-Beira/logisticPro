import { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo  from '@/Components/Logo';
import GlobalSearch from '@/Components/GlobalSearch';
import GlobalSearchModal from '@/Components/Search/GlobalSearchModal';
import NotificationToasts from '@/Components/NotificationToasts';
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
    XCircle,
    TrendingUp,
    Clock
} from 'lucide-react';

export default function DashboardLayout({ children }) {
    const { auth, flash, stats } = usePage().props;

    console.log(stats);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Global Search Modal state
    const [searchModalOpen, setSearchModalOpen] = useState(false);

     // Global Search Shortcut (Ctrl+K / Cmd+K)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setSearchModalOpen(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Fetch notifications from API
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch('/notifications');
                const data = await response.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unread_count || 0);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        // Fetch immediately
        fetchNotifications();

        // Poll every 10 seconds for new notifications (tempo real)
        const interval = setInterval(fetchNotifications, 10000);

        return () => clearInterval(interval);
    }, []);

    // Mark all notifications as read
    const handleMarkAllAsRead = async () => {
        try {
            await fetch('/notifications/read-all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
            });

            // Update local state
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    // Menu items com permissões
    const menuItems = [
        // ========== TODOS OS USUÁRIOS ==========
        {
            name: 'Dashboard',
            icon: Home,
            href: '/dashboard',
            roles: ['admin', 'manager', 'operations', 'finance'],
            badge: null
        },

        // ========== PROCESSOS LOGÍSTICOS ==========
       {
            name: 'Processos',
            icon: Package,
            href: '/shipments',
            roles: ['admin', 'manager', 'operations', 'finance'],
            badge: stats?.activeShipments || null,
        },
        {
            name: 'Documentos',
            icon: FileText,
            href: '/documents',
            roles: ['admin', 'manager', 'operations', 'finance'],
            badge: null
        },

        // ========== FINANÇAS ==========
        {
            name: 'Finanças',
            icon: DollarSign,
            roles: ['admin', 'manager', 'finance'],
            badge: stats?.pending_payments || null,
            badgeColor: 'blue',
            submenu: [
                {
                    name: 'Dashboard',
                    href: '/finance',
                    icon: TrendingUp,
                    roles: ['admin', 'manager', 'finance'],
                },
                {
                    name: 'Pendentes',
                    href: '/finance/pending',
                    icon: Clock,
                    roles: ['admin', 'manager', 'finance'],
                    badge: stats?.pending_payments || null,
                },
                {
                    name: 'Histórico',
                    href: '/finance/payments',
                    icon: CheckCircle,
                    roles: ['admin', 'manager', 'finance'],
                },
                {
                    name: 'Relatórios',
                    href: '/finance/reports',
                    icon: BarChart3,
                    roles: ['admin', 'manager', 'finance'],
                },
            ]
        },
        {
            name: 'Facturas',
            icon: DollarSign,
            href: '/invoices',
            roles: ['admin', 'manager', 'finance'],
            badge: stats?.pendingInvoices || null,
        },

        // ========== APROVAÇÕES (ADMIN + MANAGER) ==========
        {
            name: 'Aprovações',
            icon: CheckCircle,
            href: '/approvals',
            roles: ['admin', 'manager'],
            badge: stats?.peddingPayment || null,
            badgeColor: 'red',
        },

        // ========== RELATÓRIOS (ADMIN + MANAGER) ==========
        {
            name: 'Relatórios',
            icon: BarChart3,
            href: '/reports',
            roles: ['admin', 'manager'],
            badge: null
        },

        // ========== CADASTROS (ADMIN + MANAGER) ==========
        {
            name: 'Clientes',
            icon: Users,
            href: '/clients',
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

        // ========== ADMINISTRAÇÃO (APENAS ADMIN) ==========
        {
            name: 'Usuários',
            icon: User,
            href: '/users',
            roles: ['admin'],
            badge: null
        },
        {
            name: 'Configurações',
            icon: Settings,
            href: '/settings',
            roles: ['admin'],
            badge: null
        },
    ];

    // Filtrar menu baseado no role do usuário
    const filteredMenu = menuItems.filter(item =>
        item.roles.includes(auth.user?.role)
    );

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
        <div className="min-h-screen ">
            {/* Global Search Modal */}
            <GlobalSearchModal
                isOpen={searchModalOpen}
                onClose={() => setSearchModalOpen(false)}
            />

            {/* Notification Toasts - Aparecem automaticamente */}
            <NotificationToasts
                notifications={notifications}
                // Não marcar como lida ao fechar toast - apenas esconder
                // Usuário deve marcar como lida no dropdown
            />

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
                unreadNotifications={unreadCount}
                notifications={notifications}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleMarkAllAsRead={handleMarkAllAsRead}
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
    unreadCount,
    notifications,
    searchQuery,
    setSearchQuery,
    handleMarkAllAsRead
}) {
    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed z-40 border-b rounded-lg shadow-sm left-10 right-12 top-3 bg-white/60 backdrop-blur-xl border-gray-200/50"
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
                         <Logo className="w-20 h-20 text-gray-500 fill-current" />

                    </Link>
                </div>

                {/* Center Section - Search */}
                <div className="flex-1 hidden max-w-2xl mx-8 md:flex">
                    <button
                        onClick={() => setSearchModalOpen(true)}
                        className="relative w-full group"
                    >
                        <Search className="absolute w-5 h-5 text-gray-400 transition-colors -translate-y-1/2 left-4 top-1/2 group-hover:text-gray-600" />
                        <div className="w-full pl-12 pr-20 py-2.5 bg-gray-100 border-0 rounded-xl text-left text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700 transition-all cursor-text">
                            Pesquisar processos, clientes, documentos...
                        </div>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                            <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-white border border-gray-300 rounded shadow-sm">
                                {navigator.platform.indexOf('Mac') !== -1 ? '⌘' : 'Ctrl'}
                            </kbd>
                            <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-white border border-gray-300 rounded shadow-sm">
                                K
                            </kbd>
                        </div>
                    </button>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2">
                    {/* Notifications */}
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            animate={unreadCount > 0 ? {
                                rotate: [-10, 10, -10, 10, 0],
                            } : {}}
                            transition={{
                                duration: 0.5,
                                repeat: unreadCount > 0 ? Infinity : 0,
                                repeatDelay: 2
                            }}
                            onClick={() => setNotificationsOpen(!notificationsOpen)}
                            className="relative p-2 transition-colors rounded-xl hover:bg-gray-100"
                        >
                            <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'text-red-500' : 'text-gray-600'}`} />
                            {unreadCount > 0 && (
                                <>
                                    {/* Pulse effect background */}
                                    <motion.span
                                        animate={{
                                            scale: [1, 1.5, 1],
                                            opacity: [0.7, 0, 0.7],
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className="absolute w-5 h-5 bg-red-500 rounded-full top-1 right-1"
                                    />
                                    {/* Badge */}
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{
                                            scale: [1, 1.2, 1],
                                        }}
                                        transition={{
                                            duration: 0.8,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full shadow-lg top-1 right-1"
                                    >
                                        {unreadCount}
                                    </motion.span>
                                </>
                            )}
                        </motion.button>

                        {/* Notifications Dropdown */}
                        <AnimatePresence>
                            {notificationsOpen && (
                                <NotificationsDropdown
                                    notifications={notifications}
                                    onClose={() => setNotificationsOpen(false)}
                                    onMarkAllAsRead={handleMarkAllAsRead}
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
            className="fixed bottom-0 z-30 hidden left-10 rounded-lg lg:block top-[100px]"
        >
            <div className="overflow-y-auto border-r rounded-lg shadow-xl bg-white/50 backdrop-blur-xl border-gray-200/50">
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
                        ${expanded ? 'bg-blue-50 text-[#358c9c]' : 'text-gray-600 hover:bg-gray-50'}
                    `}
                >
                    <div className="flex items-center gap-3">
                        <item.icon className={`h-5 w-5 ${expanded ? 'text-[#358c9c]' : 'text-gray-500'}`} />
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
                                                ? 'bg-blue-100 text-[#f68716] font-medium'
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
    relative flex items-center gap-3 px-4 py-2 my-2 rounded-xl
    transition-all duration-200 group
    ${isActive
      ? 'bg-[#358c9c]  text-white shadow-lg'
      : 'text-gray-600 hover:bg-gray-50'
    }
  `}

            >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-[#f68716]'}`} />
                {sidebarOpen && (
                    <span className="flex-1 font-normal">{item.name}</span>
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
                                  <Link href="/">
                                        <Logo className="w-20 h-20 text-gray-500 fill-current" />
                                    </Link>
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
function NotificationsDropdown({ notifications, onClose, onMarkAllAsRead }) {
    const handleMarkAllAsRead = async () => {
        await onMarkAllAsRead();
        // Don't close dropdown automatically
    };

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
                    onClick={handleMarkAllAsRead}
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
                <Link href="/settings">
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
