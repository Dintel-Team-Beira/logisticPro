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

            <div className="flex flex-col min-h-screen lg:flex-row">
                {/* Left Side - Branding */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#358c9c] to-[#246a77] p-12 flex-col justify-between relative overflow-hidden"
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute w-64 h-64 border-2 border-white rounded-full top-20 left-20"></div>
                        <div className="absolute border-2 border-white rounded-full bottom-20 right-20 w-96 h-96"></div>
                        <div className="absolute w-40 h-40 border-2 border-white rounded-full top-1/2 left-1/3"></div>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg">
                                {/* <span className="text-[#358c9c] font-bold text-2xl">L</span> */}
                                <img className='w-5 h-5' src='logo.svg'/>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">Logistic Pro</div>
                                <div className="text-sm text-white/80">Portal do Cliente</div>
                            </div>
                        </div>

                        <div className="max-w-md">
                            <h1 className="mb-6 text-4xl font-bold text-white">
                                Bem-vindo de volta!
                            </h1>
                            <p className="text-xl leading-relaxed text-white/90">
                                Acompanhe seus processos logísticos em tempo real e tenha controle total sobre suas operações.
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-lg bg-white/10">
                                <span className="text-2xl">📦</span>
                            </div>
                            <div>
                                <h3 className="mb-1 font-semibold text-white">Rastreamento em Tempo Real</h3>
                                <p className="text-sm text-white/80">Acompanhe cada etapa do seu processo logístico</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-lg bg-white/10">
                                <span className="text-2xl">📄</span>
                            </div>
                            <div>
                                <h3 className="mb-1 font-semibold text-white">Documentos Centralizados</h3>
                                <p className="text-sm text-white/80">Acesse todos os seus documentos em um só lugar</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-lg bg-white/10">
                                <span className="text-2xl">💰</span>
                            </div>
                            <div>
                                <h3 className="mb-1 font-semibold text-white">Gestão Financeira</h3>
                                <p className="text-sm text-white/80">Visualize faturas e cotações de forma simples</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side - Login Form */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex items-center justify-center flex-1 p-6 bg-white sm:p-12"
                >
                    <div className="w-full max-w-md">
                        {/* Mobile Logo */}
                        <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#358c9c] to-[#246a77] rounded-lg flex items-center justify-center">
                                <span className="text-2xl font-bold text-white">L</span>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">LogisticaPro</div>
                                <div className="text-sm text-gray-600">Portal do Cliente</div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h2 className="mb-2 text-3xl font-bold text-gray-900">Login</h2>
                            <p className="text-gray-600">Entre com suas credenciais para acessar o portal</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
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
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
                                    Senha
                                </label>
                                <div className="relative">
                                    <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
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
                                        className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                                        <LogIn className="w-5 h-5" />
                                        <span>Entrar</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        {/* Help Text */}
                        <div className="p-4 mt-8 border border-blue-100 rounded-lg bg-blue-50">
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
