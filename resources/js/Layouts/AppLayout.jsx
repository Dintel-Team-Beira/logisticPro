import { Link } from '@inertiajs/react';

export default function AppLayout({ children, auth }) {
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 shadow-sm">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            {/* Logo */}
                            <div className="flex items-center flex-shrink-0">
                                <Link href="/" className="text-xl font-bold text-gray-800">
                                    Shipment Manager
                                </Link>
                            </div>

                            {/* Navigation Links */}
                            <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/shipments"
                                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300"
                                >
                                    Shipments
                                </Link>
                                <Link
                                    href="/financas"
                                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300"
                                >
                                    Finançasdd
                                </Link>
                            </div>
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center">
                            {auth?.user ? (
                                <div className="relative ml-3">
                                    <span className="text-sm text-gray-700">{auth.user.name}</span>
                                </div>
                            ) : (
                                <Link href="/login" className="text-sm text-gray-700">
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Page Content */}
            <main className="py-6">
                {children}
            </main>
        </div>
    );
}
