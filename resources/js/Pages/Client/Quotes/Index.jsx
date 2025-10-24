import { Head, Link, router } from '@inertiajs/react';
import ClientPortalLayout from '@/Layouts/ClientPortalLayout';
import { FileText, Calendar, DollarSign, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function QuotesIndex({ quotes, filters }) {
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    const handleStatusChange = (newStatus) => {
        setStatusFilter(newStatus);
        router.get('/client/quotes', {
            status: newStatus !== 'all' ? newStatus : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const statusOptions = [
        { value: 'all', label: 'Todas', icon: FileText },
        { value: 'sent', label: 'Pendentes', icon: Clock },
        { value: 'viewed', label: 'Visualizadas', icon: Eye },
        { value: 'accepted', label: 'Aceitas', icon: CheckCircle },
        { value: 'rejected', label: 'Rejeitadas', icon: XCircle },
    ];

    const statusColors = {
        sent: 'bg-blue-100 text-blue-800 border-blue-300',
        viewed: 'bg-purple-100 text-purple-800 border-purple-300',
        accepted: 'bg-green-100 text-green-800 border-green-300',
        rejected: 'bg-red-100 text-red-800 border-red-300',
        expired: 'bg-gray-100 text-gray-800 border-gray-300',
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: 'MZN'
        }).format(value);
    };

    return (
        <ClientPortalLayout>
            <Head title="Cotações" />

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-8 w-8 text-[#358c9c]" />
                    <h1 className="text-3xl font-bold text-gray-900">Minhas Cotações</h1>
                </div>
                <p className="text-gray-600">Visualize e responda suas cotações de serviços</p>
            </div>

            {/* Status Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {statusOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                            <button
                                key={option.value}
                                onClick={() => handleStatusChange(option.value)}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    statusFilter === option.value
                                        ? 'border-[#358c9c] bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <Icon className={`h-6 w-6 mb-2 ${
                                    statusFilter === option.value ? 'text-[#358c9c]' : 'text-gray-400'
                                }`} />
                                <p className={`font-medium ${
                                    statusFilter === option.value ? 'text-[#358c9c]' : 'text-gray-700'
                                }`}>
                                    {option.label}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Quotes List */}
            <div className="space-y-4">
                {quotes.data.length > 0 ? (
                    quotes.data.map((quote) => (
                        <Link key={quote.id} href={`/client/quotes/${quote.id}`}>
                            <motion.div
                                whileHover={{ x: 4 }}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-[#358c9c] transition-all"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    {/* Left Section */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                    {quote.quote_number}
                                                </h3>
                                                <p className="text-gray-600">{quote.title}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500 text-xs">Data de Criação</p>
                                                <p className="font-medium text-gray-900 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3 text-gray-400" />
                                                    {quote.created_at}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-xs">Válida Até</p>
                                                <p className={`font-medium flex items-center gap-1 ${
                                                    quote.is_expired ? 'text-red-600' : 'text-gray-900'
                                                }`}>
                                                    <Clock className="h-3 w-3" />
                                                    {quote.valid_until}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-xs">Valor Total</p>
                                                <p className="font-bold text-[#358c9c] text-lg">
                                                    {formatCurrency(quote.total_amount)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Section */}
                                    <div className="flex flex-col items-end gap-3">
                                        <span className={`px-4 py-2 rounded-lg text-sm font-medium border-2 ${
                                            quote.is_expired
                                                ? statusColors.expired
                                                : statusColors[quote.status]
                                        }`}>
                                            {quote.is_expired ? 'Expirada' :
                                             quote.status === 'sent' ? 'Pendente' :
                                             quote.status === 'viewed' ? 'Visualizada' :
                                             quote.status === 'accepted' ? 'Aceita' :
                                             quote.status === 'rejected' ? 'Rejeitada' :
                                             quote.status}
                                        </span>

                                        {(quote.status === 'sent' || quote.status === 'viewed') && !quote.is_expired && (
                                            <div className="flex gap-2">
                                                <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                                                    Aguardando resposta
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {quote.is_expired && (
                                    <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                        <p className="text-sm text-gray-600">
                                            Esta cotação expirou. Entre em contato conosco para solicitar uma nova cotação.
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        </Link>
                    ))
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma cotação encontrada</h3>
                        <p className="text-gray-600">
                            {filters.status && filters.status !== 'all'
                                ? `Você não possui cotações ${statusOptions.find(opt => opt.value === filters.status)?.label.toLowerCase()}`
                                : 'Você ainda não possui cotações'}
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {quotes.links && quotes.links.length > 3 && (
                <div className="mt-6 flex justify-center gap-2">
                    {quotes.links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.url || '#'}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                link.active
                                    ? 'bg-[#358c9c] text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                            } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </ClientPortalLayout>
    );
}
