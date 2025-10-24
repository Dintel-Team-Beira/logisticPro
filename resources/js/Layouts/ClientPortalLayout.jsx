import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    Package,
    FileText,
    DollarSign,
    LogOut,
    Menu,
    X,
    User,
    ChevronDown,
    Bell,
    MessageSquare
} from 'lucide-react';

export default function ClientPortalLayout({ children }) {
    const { client, auth } = usePage().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    const menuItems = [
        { name: 'Dashboard', icon: Home, href: '/client/dashboard' },
        { name: 'Meus Processos', icon: Package, href: '/client/shipments' },
        { name: 'Documentos', icon: FileText, href: '/client/documents' },
        { name: 'Faturas', icon: DollarSign, href: '/client/invoices' },
        { name: 'Cotações', icon: MessageSquare, href: '/client/quotes' },
    ];

    const handleLogout = () => {
        router.post('/client/logout');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Top Navigation */}
            <nav className="bg-white shadow-sm border-b border-gray-200 fixed w-full top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo & Mobile Menu Button */}
                        <div className="flex items-center">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 mr-2"
                            >
                                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>

                            <Link href="/client/dashboard" className="flex items-center">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#358c9c] to-[#246a77] rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-xl">L</span>
                                    </div>
                                    <div className="ml-3 hidden sm:block">
                                        <div className="text-lg font-bold text-gray-900">LogisticaPro</div>
                                        <div className="text-xs text-gray-500">Portal do Cliente</div>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden lg:flex lg:items-center lg:space-x-1">
                            {menuItems.map((item) => {
                                const isActive = window.location.pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                            isActive
                                                ? 'bg-[#358c9c] text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center gap-3">
                            {/* Notifications */}
                            <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 relative">
                                <Bell className="h-6 w-6" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>

                            {/* Profile Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                        {(client?.name || 'C').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="hidden sm:block text-left">
                                        <div className="text-sm font-semibold text-gray-900">
                                            {client?.company_name || client?.name}
                                        </div>
                                        <div className="text-xs text-gray-500">Cliente</div>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-gray-600 hidden sm:block" />
                                </button>

                                {/* Dropdown Menu */}
                                <AnimatePresence>
                                    {profileDropdownOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setProfileDropdownOpen(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                                            >
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {client?.company_name || client?.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">{client?.email}</div>
                                                </div>

                                                <Link
                                                    href="/client/profile"
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                >
                                                    <User className="h-4 w-4" />
                                                    Meu Perfil
                                                </Link>

                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    Sair
                                                </button>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="lg:hidden border-t border-gray-200 bg-white overflow-hidden"
                        >
                            <div className="px-4 py-3 space-y-1">
                                {menuItems.map((item) => {
                                    const isActive = window.location.pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                                                isActive
                                                    ? 'bg-[#358c9c] text-white'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            <item.icon className="h-5 w-5" />
                                            <span className="font-medium">{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Main Content */}
            <main className="pt-16 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-600">
                            © {new Date().getFullYear()} LogisticaPro. Todos os direitos reservados.
                        </div>
                        <div className="flex gap-6 text-sm text-gray-600">
                            <a href="#" className="hover:text-[#358c9c]">Suporte</a>
                            <a href="#" className="hover:text-[#358c9c]">Termos de Uso</a>
                            <a href="#" className="hover:text-[#358c9c]">Privacidade</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
