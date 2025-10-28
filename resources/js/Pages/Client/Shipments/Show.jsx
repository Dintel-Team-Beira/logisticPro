import { Head, Link } from '@inertiajs/react';
import ClientPortalLayout from '@/Layouts/ClientPortalLayout';
import {
    ArrowLeft, Package, Ship, MapPin, Calendar, Weight, Box,
    FileText, Activity, Download, CheckCircle2, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ShipmentShow({ shipment }) {
    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        in_transit: 'bg-blue-100 text-blue-800 border-blue-300',
        arrived: 'bg-green-100 text-green-800 border-green-300',
        completed: 'bg-gray-100 text-gray-800 border-gray-300',
        cancelled: 'bg-red-100 text-red-800 border-red-300',
    };

    const phaseSteps = [
        { id: 1, name: 'Documentação', completed: shipment.current_phase >= 1 },
        { id: 2, name: 'Booking', completed: shipment.current_phase >= 2 },
        { id: 3, name: 'Inspeção', completed: shipment.current_phase >= 3 },
        { id: 4, name: 'Despacho', completed: shipment.current_phase >= 4 },
        { id: 5, name: 'Transporte', completed: shipment.current_phase >= 5 },
        { id: 6, name: 'Embarque', completed: shipment.current_phase >= 6 },
        { id: 7, name: 'Acompanhamento', completed: shipment.current_phase >= 7 },
    ];

    return (
        <ClientPortalLayout>
            <Head title={`Processo ${shipment.reference_number}`} />

            {/* Back Button */}
            <Link
                href="/client/shipments"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-[#358c9c] mb-6 font-medium"
            >
                <ArrowLeft className="h-4 w-4" />
                Voltar para processos
            </Link>

            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{shipment.reference_number}</h1>
                        <p className="text-gray-600">Tipo: <span className="capitalize font-medium">{shipment.type}</span></p>
                    </div>
                    <span className={`px-4 py-2 rounded-lg text-sm font-medium border-2 ${statusColors[shipment.status]}`}>
                        {shipment.status}
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Progresso do Processo</span>
                        <span className="text-lg font-bold text-[#358c9c]">{shipment.progress}%</span>
                    </div>
                    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${shipment.progress}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-[#358c9c] to-[#246a77]"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Details Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Package className="h-6 w-6 text-[#358c9c]" />
                            Detalhes do Processo
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-500">Porto de Origem</p>
                                    <p className="font-semibold text-gray-900">{shipment.origin_port}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Ship className="h-5 w-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-500">Porto de Destino</p>
                                    <p className="font-semibold text-gray-900">{shipment.destination_port}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Box className="h-5 w-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-500">Container</p>
                                    <p className="font-semibold text-gray-900">{shipment.container_number || 'N/A'}</p>
                                    <p className="text-xs text-gray-500">{shipment.container_type}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Weight className="h-5 w-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-500">Peso</p>
                                    <p className="font-semibold text-gray-900">{shipment.weight || 'N/A'}</p>
                                </div>
                            </div>

                            {shipment.commodity && (
                                <div className="flex items-start gap-3 md:col-span-2">
                                    <Package className="h-5 w-5 text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-500">Mercadoria</p>
                                        <p className="font-semibold text-gray-900">{shipment.commodity}</p>
                                    </div>
                                </div>
                            )}

                            {shipment.estimated_departure && (
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-500">Partida Estimada</p>
                                        <p className="font-semibold text-gray-900">{shipment.estimated_departure}</p>
                                    </div>
                                </div>
                            )}

                            {shipment.estimated_arrival && (
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-500">Chegada Estimada</p>
                                        <p className="font-semibold text-gray-900">{shipment.estimated_arrival}</p>
                                    </div>
                                </div>
                            )}

                            {shipment.shipping_line && (
                                <div className="flex items-start gap-3 md:col-span-2">
                                    <Ship className="h-5 w-5 text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-500">Linha de Navegação</p>
                                        <p className="font-semibold text-gray-900">{shipment.shipping_line.name}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timeline/Phases */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Fases do Processo</h2>

                        <div className="relative">
                            {/* Vertical Line */}
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

                            {/* Steps */}
                            <div className="space-y-6">
                                {phaseSteps.map((step, index) => (
                                    <div key={step.id} className="relative flex items-start gap-4">
                                        {/* Circle */}
                                        <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${
                                            step.completed
                                                ? 'bg-green-500'
                                                : shipment.current_phase === step.id
                                                ? 'bg-[#358c9c]'
                                                : 'bg-gray-300'
                                        }`}>
                                            {step.completed ? (
                                                <CheckCircle2 className="h-5 w-5 text-white" />
                                            ) : (
                                                <span className="text-white font-bold text-sm">{step.id}</span>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <h3 className={`font-semibold ${
                                                step.completed || shipment.current_phase === step.id
                                                    ? 'text-gray-900'
                                                    : 'text-gray-500'
                                            }`}>
                                                {step.name}
                                            </h3>
                                            {shipment.current_phase === step.id && (
                                                <p className="text-sm text-[#358c9c] font-medium">Em andamento</p>
                                            )}
                                            {step.completed && (
                                                <p className="text-sm text-green-600 font-medium">Concluído</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Activities */}
                    {shipment.activities && shipment.activities.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Activity className="h-6 w-6 text-[#358c9c]" />
                                Atividades Recentes
                            </h2>

                            <div className="space-y-3">
                                {shipment.activities.slice(0, 5).map((activity, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Clock className="h-4 w-4 text-gray-400 mt-1" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-900">{activity.description}</p>
                                            <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Documents */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="h-6 w-6 text-[#358c9c]" />
                            Documentos
                        </h2>

                        {shipment.documents && shipment.documents.length > 0 ? (
                            <div className="space-y-2">
                                {shipment.documents.map((doc) => (
                                    <a
                                        key={doc.id}
                                        href={`/client/documents/${doc.id}/download`}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <FileText className="h-5 w-5 text-[#358c9c] flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                                                <p className="text-xs text-gray-500">{doc.uploaded_at}</p>
                                            </div>
                                        </div>
                                        <Download className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-4">Nenhum documento disponível</p>
                        )}

                        <Link
                            href="/client/documents"
                            className="block mt-4 text-center text-sm text-[#358c9c] hover:text-[#246a77] font-medium"
                        >
                            Ver todos os documentos →
                        </Link>
                    </div>

                    {/* Info Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
                        <h3 className="font-bold text-gray-900 mb-2">Precisa de ajuda?</h3>
                        <p className="text-sm text-gray-700 mb-4">
                            Nossa equipe está sempre disponível para te ajudar com qualquer dúvida sobre seu processo.
                        </p>
                        <a
                            href="mailto:suporte@logisticapro.com"
                            className="block w-full text-center px-4 py-2 bg-[#358c9c] text-white rounded-lg hover:bg-[#246a77] transition-colors font-medium"
                        >
                            Entrar em Contato
                        </a>
                    </div>
                </div>
            </div>
        </ClientPortalLayout>
    );
}
