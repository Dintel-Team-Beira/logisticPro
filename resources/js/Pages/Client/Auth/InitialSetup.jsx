import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, Shield } from 'lucide-react';

export default function InitialSetup({ email, token, clientName }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: email || '',
        token: token || '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/client/setup');
    };

    const passwordRequirements = [
        { label: 'Mínimo de 8 caracteres', met: data.password.length >= 8 },
        { label: 'Letras maiúsculas e minúsculas', met: /[a-z]/.test(data.password) && /[A-Z]/.test(data.password) },
        { label: 'Números', met: /\d/.test(data.password) },
    ];

    return (
        <>
            <Head title="Configurar Acesso - Portal do Cliente" />

            <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-blue-50">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#358c9c] to-[#246a77] rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-2xl">L</span>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">LogisticaPro</div>
                            <div className="text-gray-600 text-sm">Portal do Cliente</div>
                        </div>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="h-8 w-8 text-green-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo, {clientName}!</h1>
                            <p className="text-gray-600">Configure sua senha para acessar o portal</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email (readonly) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    readOnly
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nova Senha
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
                                        placeholder="Digite sua senha"
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

                            {/* Password Confirmation */}
                            <div>
                                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirmar Senha
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        id="password_confirmation"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#358c9c] focus:border-transparent transition-all"
                                        placeholder="Confirme sua senha"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Password Requirements */}
                            {data.password && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Requisitos da senha:</p>
                                    <div className="space-y-2">
                                        {passwordRequirements.map((req, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <CheckCircle
                                                    className={`h-4 w-4 ${
                                                        req.met ? 'text-green-600' : 'text-gray-300'
                                                    }`}
                                                />
                                                <span className={`text-sm ${req.met ? 'text-green-600' : 'text-gray-500'}`}>
                                                    {req.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={processing}
                                className="w-full bg-gradient-to-r from-[#358c9c] to-[#246a77] text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Configurando...' : 'Ativar Minha Conta'}
                            </motion.button>
                        </form>

                        {/* Security Note */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-sm text-blue-900">
                                <strong>🔒 Seguro:</strong> Sua senha será criptografada e nunca será compartilhada.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
}
