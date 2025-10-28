import { Head, Link, router } from '@inertiajs/react';
import ClientPortalLayout from '@/Layouts/ClientPortalLayout';
import { DollarSign, Calendar, Package, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function InvoicesIndex({ invoices, filters }) {
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    const handleStatusChange = (newStatus) => {
        setStatusFilter(newStatus);
        router.get('/client/invoices', {
            status: newStatus !== 'all' ? newStatus : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const statusOptions = [
        { value: 'all', label: 'Todas', icon: DollarSign },
        { value: 'pending', label: 'Pendentes', icon: Clock },
        { value: 'paid', label: 'Pagas', icon: CheckCircle },
        { value: 'overdue', label: 'Vencidas', icon: AlertCircle },
    ];

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        paid: 'bg-green-100 text-green-800 border-green-300',
        overdue: 'bg-red-100 text-red-800 border-red-300',
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: 'MZN'
        }).format(value);
    };

    return (
        <ClientPortalLayout>
            <Head title="Faturas" />

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="h-8 w-8 text-[#358c9c]" />
                    <h1 className="text-3xl font-bold text-gray-900">Minhas Faturas</h1>
                </div>
                <p className="text-gray-600">Visualize e gerencie suas faturas</p>
            </div>

            {/* Status Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

            {/* Invoices List */}
            <div className="space-y-4">
                {invoices.data.length > 0 ? (
                    invoices.data.map((invoice) => (
                        <Link key={invoice.id} href={`/client/invoices/${invoice.id}`}>
                            <motion.div
                                whileHover={{ x: 4 }}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-[#358c9c] transition-all"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    {/* Left Section */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <DollarSign className="h-6 w-6 text-[#358c9c]" />
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{invoice.invoice_number}</h3>
                                                {invoice.shipment_reference && (
                                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                                        <Package className="h-3 w-3" />
                                                        {invoice.shipment_reference}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500 text-xs">Emissão</p>
                                                <p className="font-medium text-gray-900">{invoice.issue_date}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-xs">Vencimento</p>
                                                <p className={`font-medium ${
                                                    invoice.is_overdue ? 'text-red-600' : 'text-gray-900'
                                                }`}>
                                                    {invoice.due_date}
                                                </p>
                                            </div>
                                            {invoice.paid_date && (
                                                <div>
                                                    <p className="text-gray-500 text-xs">Pagamento</p>
                                                    <p className="font-medium text-green-600">{invoice.paid_date}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Section */}
                                    <div className="flex flex-col items-end gap-3">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Valor Total</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {formatCurrency(invoice.amount)}
                                            </p>
                                        </div>

                                        <span className={`px-4 py-2 rounded-lg text-sm font-medium border-2 ${
                                            invoice.is_overdue
                                                ? statusColors.overdue
                                                : statusColors[invoice.status]
                                        }`}>
                                            {invoice.is_overdue ? 'Vencida' :
                                             invoice.status === 'paid' ? 'Paga' : 'Pendente'}
                                        </span>
                                    </div>
                                </div>

                                {invoice.is_overdue && (
                                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-800">
                                            Esta fatura está vencida. Por favor, efetue o pagamento o quanto antes para evitar interrupções nos serviços.
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        </Link>
                    ))
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma fatura encontrada</h3>
                        <p className="text-gray-600">
                            {filters.status && filters.status !== 'all'
                                ? `Você não possui faturas ${statusOptions.find(opt => opt.value === filters.status)?.label.toLowerCase()}`
                                : 'Você ainda não possui faturas'}
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {invoices.links && invoices.links.length > 3 && (
                <div className="mt-6 flex justify-center gap-2">
                    {invoices.links.map((link, index) => (
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
