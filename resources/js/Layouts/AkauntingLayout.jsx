import { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AkauntingSidebar from '@/Components/Layout/AkauntingSidebar';
import {
    Search,
    Bell,
    User,
    LogOut,
    Settings,
    Menu,
    X,
} from 'lucide-react';

export default function AkauntingLayout({ children }) {
    const { auth } = usePage().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Bar */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
                <div className="flex items-center justify-between h-16 px-6">
                    {/* Left */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6 text-gray-600" />
                            ) : (
                                <Menu className="w-6 h-6 text-gray-600" />
                            )}
                        </button>
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-8 h-8 font-bold text-white rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                                S
                            </div>
                            <span className="text-xl font-bold text-gray-900">
                                ShipManager
                            </span>
                        </Link>
                    </div>

                    {/* Center - Search */}
                    <div className="flex-1 max-w-2xl mx-8">
                        <div className="relative">
                            <Search className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                            <input
                                type="search"
                                placeholder="Buscar..."
                                className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-3">
                        <button className="relative p-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        <div className="relative group">
                            <button className="flex items-center gap-2 p-2 transition-colors rounded-lg hover:bg-gray-100">
                                <div className="flex items-center justify-center w-8 h-8 text-sm font-semibold text-white rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                                    {auth.user?.name?.charAt(0).toUpperCase()}
                                </div>
                            </button>

                            {/* Dropdown */}
                            <div className="absolute right-0 invisible w-48 mt-2 transition-all bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:visible group-hover:opacity-100 top-full">
                                <div className="p-3 border-b border-gray-100">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {auth.user?.name}
                                    </p>
                                    <p className="text-xs text-gray-600">{auth.user?.email}</p>
                                </div>
                                <div className="p-2">
                                    <Link href="/profile">
                                        <button className="flex items-center w-full gap-2 px-3 py-2 text-sm text-left text-gray-700 transition-colors rounded-lg hover:bg-gray-100">
                                            <User className="w-4 h-4" />
                                            Perfil
                                        </button>
                                    </Link>
                                    <Link href="/settings">
                                        <button className="flex items-center w-full gap-2 px-3 py-2 text-sm text-left text-gray-700 transition-colors rounded-lg hover:bg-gray-100">
                                            <Settings className="w-4 h-4" />
                                            Configurações
                                        </button>
                                    </Link>
                                    <hr className="my-2" />
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full gap-2 px-3 py-2 text-sm text-left text-red-600 transition-colors rounded-lg hover:bg-red-50"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sair
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <AkauntingSidebar />

            {/* Main Content */}
            <main className="pt-16 ml-0 transition-all duration-300 lg:ml-72">
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
