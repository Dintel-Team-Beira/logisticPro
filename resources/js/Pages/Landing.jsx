import { Head, Link } from '@inertiajs/react';
import { Ship, ArrowRight } from 'lucide-react';

export default function Landing() {
    return (
        <>
            <Head title="ShipManager - Gestão de Shipments" />
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
                <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
                    <div className="p-6 mb-8 shadow-2xl bg-white/10 backdrop-blur-xl rounded-3xl">
                        <Ship className="w-20 h-20 text-white" />
                    </div>

                    <h1 className="mb-6 text-6xl font-bold text-white">
                        ShipManager Pro
                    </h1>

                    <p className="max-w-2xl mb-12 text-xl text-blue-100">
                        Sistema completo de gestão de shipments, documentação e processos logísticos
                    </p>

                    <div className="flex gap-4">
                        <Link href="/login">
                            <button className="px-8 py-4 text-lg font-semibold text-blue-900 transition-all bg-white rounded-xl hover:bg-blue-50 hover:scale-105">
                                Entrar
                                <ArrowRight className="inline-block w-5 h-5 ml-2" />
                            </button>
                        </Link>

                        <Link href="/register">
                            <button className="px-8 py-4 text-lg font-semibold text-white transition-all border-2 border-white rounded-xl hover:bg-white/10 hover:scale-105">
                                Criar Conta
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
