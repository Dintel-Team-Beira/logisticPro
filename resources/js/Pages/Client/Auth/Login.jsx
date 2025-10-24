import { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react';

export default function ClientLogin() {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/client/login');
    };

    return (
        <>
            <Head title="Login - Portal do Cliente" />

            <div className="min-h-screen flex flex-col lg:flex-row">
                {/* Left Side - Branding */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#358c9c] to-[#246a77] p-12 flex-col justify-between relative overflow-hidden"
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-20 left-20 w-64 h-64 border-2 border-white rounded-full"></div>
                        <div className="absolute bottom-20 right-20 w-96 h-96 border-2 border-white rounded-full"></div>
                        <div className="absolute top-1/2 left-1/3 w-40 h-40 border-2 border-white rounded-full"></div>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                                <span className="text-[#358c9c] font-bold text-2xl">L</span>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">LogisticaPro</div>
                                <div className="text-white/80 text-sm">Portal do Cliente</div>
                            </div>
                        </div>

                        <div className="max-w-md">
                            <h1 className="text-4xl font-bold text-white mb-6">
                                Bem-vindo de volta!
                            </h1>
                            <p className="text-xl text-white/90 leading-relaxed">
                                Acompanhe seus processos logísticos em tempo real e tenha controle total sobre suas operações.
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">📦</span>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold mb-1">Rastreamento em Tempo Real</h3>
                                <p className="text-white/80 text-sm">Acompanhe cada etapa do seu processo logístico</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">📄</span>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold mb-1">Documentos Centralizados</h3>
                                <p className="text-white/80 text-sm">Acesse todos os seus documentos em um só lugar</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">💰</span>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold mb-1">Gestão Financeira</h3>
                                <p className="text-white/80 text-sm">Visualize faturas e cotações de forma simples</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side - Login Form */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white"
                >
                    <div className="w-full max-w-md">
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#358c9c] to-[#246a77] rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-2xl">L</span>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">LogisticaPro</div>
                                <div className="text-gray-600 text-sm">Portal do Cliente</div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Login</h2>
                            <p className="text-gray-600">Entre com suas credenciais para acessar o portal</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#358c9c] focus:border-transparent transition-all ${
                                            errors.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="seu@email.com"
                                        required
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Senha
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={`w-full pl-11 pr-11 py-3 border rounded-lg focus:ring-2 focus:ring-[#358c9c] focus:border-transparent transition-all ${
                                            errors.password ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            {/* Remember & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="h-4 w-4 text-[#358c9c] border-gray-300 rounded focus:ring-[#358c9c]"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Lembrar-me</span>
                                </label>

                                <Link
                                    href="/client/forgot-password"
                                    className="text-sm text-[#358c9c] hover:text-[#246a77] font-medium"
                                >
                                    Esqueceu a senha?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={processing}
                                className="w-full bg-gradient-to-r from-[#358c9c] to-[#246a77] text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <span>Entrando...</span>
                                ) : (
                                    <>
                                        <LogIn className="h-5 w-5" />
                                        <span>Entrar</span>
                                        <ArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        {/* Help Text */}
                        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-sm text-blue-900">
                                <strong>Primeiro acesso?</strong> Você deve ter recebido um email com o link para criar sua senha.
                                Se não recebeu, entre em contato conosco.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
}
