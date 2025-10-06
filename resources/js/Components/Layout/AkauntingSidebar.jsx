import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Package,
    Ship,
    FileText,
    DollarSign,
    ShoppingCart,
    Users,
    Building2,
    BarChart3,
    Settings,
    Rocket,
    ChevronDown,
    ChevronRight,
} from 'lucide-react';

export default function AkauntingSidebar() {
    const { auth } = usePage().props;
    const [expandedMenus, setExpandedMenus] = useState(['sales']);
    const currentPath = window.location.pathname;

    const toggleMenu = (key) => {
        setExpandedMenus(prev =>
            prev.includes(key)
                ? prev.filter(k => k !== key)
                : [...prev, key]
        );
    };

    const menuItems = [
        {
            key: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            href: '/dashboard',
        },
        {
            key: 'inventory',
            label: 'Inventário',
            icon: Package,
            submenu: [
                { label: 'Produtos', href: '/inventory/products' },
                { label: 'Categorias', href: '/inventory/categories' },
            ],
        },
        {
            key: 'sales',
            label: 'Vendas',
            icon: ShoppingCart,
            submenu: [
                { label: 'Faturas', href: '/invoices' },
                { label: 'Clientes', href: '/customers' },
            ],
        },
        {
            key: 'shipments',
            label: 'Shipments',
            icon: Ship,
            href: '/shipments',
        },
        {
            key: 'purchases',
            label: 'Compras',
            icon: ShoppingCart,
            submenu: [
                { label: 'Despesas', href: '/purchases/expenses' },
                { label: 'Fornecedores', href: '/purchases/vendors' },
            ],
        },
        {
            key: 'hr',
            label: 'Recursos Humanos',
            icon: Users,
        },
        {
            key: 'banking',
            label: 'Banca',
            icon: Building2,
        },
        {
            key: 'reports',
            label: 'Relatórios',
            icon: BarChart3,
            href: '/reports',
        },
        {
            key: 'apps',
            label: 'Apps',
            icon: Rocket,
        },
    ];

    return (
        <aside className="fixed left-0 z-30 flex flex-col h-full bg-sidebar top-16 w-72">
            {/* Company Selector */}
            <div className="px-4 py-4 border-b border-sidebar-border">
                <button className="flex items-center justify-between w-full p-3 transition-all rounded-lg hover:bg-sidebar-hover group">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                            {auth.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-sidebar-text-active">
                                John's Inc.
                            </p>
                            <p className="text-xs text-sidebar-text">Empresa principal</p>
                        </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-sidebar-text" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
                <div className="space-y-1">
                    {menuItems.map((item) => (
                        <MenuItem
                            key={item.key}
                            item={item}
                            currentPath={currentPath}
                            isExpanded={expandedMenus.includes(item.key)}
                            onToggle={() => toggleMenu(item.key)}
                        />
                    ))}
                </div>
            </nav>

            {/* Settings at Bottom */}
            <div className="px-3 py-4 border-t border-sidebar-border">
                <Link href="/settings">
                    <motion.button
                        whileHover={{ x: 2 }}
                        className={`
                            flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
                            transition-colors text-left
                            ${currentPath === '/settings'
                                ? 'bg-primary-50 text-primary-600'
                                : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active'
                            }
                        `}
                    >
                        <Settings className="w-5 h-5" />
                        <span className="text-sm font-medium">Configurações</span>
                    </motion.button>
                </Link>
            </div>
        </aside>
    );
}

function MenuItem({ item, currentPath, isExpanded, onToggle }) {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/');

    if (hasSubmenu) {
        return (
            <div>
                <button
                    onClick={onToggle}
                    className={`
                        flex items-center justify-between w-full px-3 py-2.5 rounded-lg
                        transition-colors text-left
                        ${isExpanded
                            ? 'bg-sidebar-hover text-sidebar-text-active'
                            : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active'
                        }
                    `}
                >
                    <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </motion.div>
                </button>

                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-1 ml-8 space-y-1 overflow-hidden"
                    >
                        {item.submenu.map((subItem) => (
                            <Link key={subItem.href} href={subItem.href}>
                                <motion.div
                                    whileHover={{ x: 2 }}
                                    className={`
                                        px-3 py-2 rounded-lg text-sm transition-colors
                                        ${currentPath === subItem.href
                                            ? 'bg-primary-50 text-primary-600 font-medium'
                                            : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active'
                                        }
                                    `}
                                >
                                    {subItem.label}
                                </motion.div>
                            </Link>
                        ))}
                    </motion.div>
                )}
            </div>
        );
    }

    return (
        <Link href={item.href}>
            <motion.button
                whileHover={{ x: 2 }}
                className={`
                    flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
                    transition-colors text-left
                    ${isActive
                        ? 'bg-primary-50 text-primary-600 font-medium'
                        : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active'
                    }
                `}
            >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
            </motion.button>
        </Link>
    );
}
