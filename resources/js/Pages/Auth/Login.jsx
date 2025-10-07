import { Mail, Lock, UserCheck, ArrowRight, Truck } from 'lucide-react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';


export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [isVisible, setIsVisible] = useState(true);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in - Logistics Pro" />

            {/* Animated Background Icon */}
            <div className="absolute text-gray-300 top-8 left-8 opacity-10 animate-pulse">
                {/* <Truck size={64} /> */}
                <img src='background.svg' className='w-50 h-50'/>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600 animate-fade-in">
                    {status}
                </div>
            )}

            <div className="max-w-md mx-auto animate-slide-up mb-[30px]">
                <div className="flex-row justify-center text-center">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">Welcome Back</h1>
                    <p className="text-gray-600">Sign in to your logistics Pro</p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Email Field */}
                    <div className="relative group">
                        <InputLabel htmlFor="email" value="Email" className="block mb-2 text-sm font-medium text-gray-700" />

                        <div className="relative">
                            <Mail className="absolute text-gray-400 transition-colors duration-200 transform -translate-y-1/2 left-3 top-1/2 group-focus-within:text-indigo-500" size={20} />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="block w-full py-3 pl-10 pr-4 transition-all duration-200 ease-in-out border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                        </div>

                        <InputError message={errors.email} className="mt-2 text-sm text-red-600 animate-shake" />
                    </div>

                    {/* Password Field */}
                    <div className="relative group">
                        <InputLabel htmlFor="password" value="Password" className="block mb-2 text-sm font-medium text-gray-700" />

                        <div className="relative">
                            <Lock className="absolute text-gray-400 transition-colors duration-200 transform -translate-y-1/2 left-3 top-1/2 group-focus-within:text-indigo-500" size={20} />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="block w-full py-3 pl-10 pr-4 transition-all duration-200 ease-in-out border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                        </div>

                        <InputError message={errors.password} className="mt-2 text-sm text-red-600 animate-shake" />
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="w-4 h-4 text-indigo-600 transition-all duration-200 ease-in-out border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-600 transition-colors duration-200 cursor-pointer ms-2 hover:text-gray-900">
                                Remember me
                            </span>
                        </label>

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm font-medium text-indigo-600 transition-colors duration-200 hover:text-indigo-500"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>

                    {/* Submit Button */}
                    <PrimaryButton
                        className="flex items-center justify-center w-full px-10 py-3 transition-all duration-200 ease-in-out transform bg-[#358c9c] mb-50 hover:bg-[#f68716] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        disabled={processing}
                    >
                        <span className="mr-2">{processing ? 'Signing in...' : 'Log in'}</span>
                        <ArrowRight size={20} className={processing ? 'animate-spin' : ''} />
                    </PrimaryButton>
                </form>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-out;
                }
                .animate-slide-up {
                    animation: slideUp 0.6s ease-out;
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </GuestLayout>
    );
}
