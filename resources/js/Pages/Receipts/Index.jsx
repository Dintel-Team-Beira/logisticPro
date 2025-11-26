import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Receipt, Plus, Search, Download, Eye, Trash2, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Index({ receipts = { data: [] }, stats = {}, filters = {} }) {
    // Garantir valores padrão para stats
    const safeStats = {
        total: stats?.total || 0,
        this_month: stats?.this_month || 0,
        total_amount: stats?.total_amount || 0,
        by_method: stats?.by_method || []
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [filterClient, setFilterClient] = useState(filters?.client_id || '');
    const [filterMethod, setFilterMethod] = useState(filters?.payment_method || '');

    const handleSearch = () => {
        router.get('/receipts', {
            search: searchTerm,
            client_id: filterClient,
            payment_method: filterMethod,
        }, {
            preserveState: true,
        });
    };

    const handleDelete = (receiptId) => {
        if (confirm('Deseja realmente excluir este recibo?')) {
            router.delete(`/receipts/${receiptId}`);
        }
    };

    const getPaymentMethodBadge = (method) => {
        const methods = {
            cash: { label: 'Dinheiro', color: 'bg-green-100 text-green-700' },
            bank_transfer: { label: 'Transferência', color: 'bg-blue-100 text-blue-700' },
            cheque: { label: 'Cheque', color: 'bg-purple-100 text-purple-700' },
            mpesa: { label: 'M-Pesa', color: 'bg-red-100 text-red-700' },
            emola: { label: 'E-Mola', color: 'bg-orange-100 text-orange-700' },
            credit_card: { label: 'Cartão Crédito', color: 'bg-indigo-100 text-indigo-700' },
            debit_card: { label: 'Cartão Débito', color: 'bg-cyan-100 text-cyan-700' },
            other: { label: 'Outro', color: 'bg-gray-100 text-gray-700' },
        };
        const config = methods[method] || methods.other;
        return (
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${config.color}`}>
                {config.label}
            </span>
        );
    };

    return (
        <DashboardLayout>
            <Head title="Recibos" />

            <div className="p-6 ml-5 -mt-3 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Recibos</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Gestão de comprovantes de pagamento
                        </p>
                    </div>
                    <Link href="/receipts/create">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Novo Recibo
                        </motion.button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-white border rounded-lg border-slate-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Total de Recibos</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-900">{safeStats.total}</p>
                            </div>
                            <Receipt className="w-12 h-12 text-blue-500" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-6 bg-white border rounded-lg border-slate-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Este Mês</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-900">{safeStats.this_month}</p>
                            </div>
                            <Receipt className="w-12 h-12 text-green-500" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 bg-white border rounded-lg border-slate-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Total Recebido (Mês)</p>
                                <p className="mt-2 text-2xl font-semibold text-slate-900">
                                    {Number(safeStats.total_amount).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MZN
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-6 bg-white border rounded-lg border-slate-200"
                    >
                        <div>
                            <p className="text-sm font-medium text-slate-600 mb-2">Por Método</p>
                            <div className="space-y-1">
                                {safeStats.by_method?.slice(0, 3).map((method, idx) => (
                                    <div key={idx} className="flex justify-between text-xs">
                                        <span className="text-slate-600">{method.payment_method}</span>
                                        <span className="font-medium text-slate-900">{method.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Filters and Search */}
                <div className="flex gap-4 p-4 bg-white border rounded-lg border-slate-200">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Buscar recibos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <Search className="w-4 h-4" />
                        Buscar
                    </button>
                </div>

                {/* Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white border rounded-lg border-slate-200 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-xs font-medium text-left text-slate-600 uppercase">Nº Recibo</th>
                                    <th className="px-4 py-3 text-xs font-medium text-left text-slate-600 uppercase">Cliente</th>
                                    <th className="px-4 py-3 text-xs font-medium text-left text-slate-600 uppercase">Fatura</th>
                                    <th className="px-4 py-3 text-xs font-medium text-left text-slate-600 uppercase">Data</th>
                                    <th className="px-4 py-3 text-xs font-medium text-left text-slate-600 uppercase">Método</th>
                                    <th className="px-4 py-3 text-xs font-medium text-right text-slate-600 uppercase">Valor</th>
                                    <th className="px-4 py-3 text-xs font-medium text-center text-slate-600 uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {receipts.data?.map((receipt) => (
                                    <tr key={receipt.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-medium text-slate-900">{receipt.receipt_number}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-slate-900">{receipt.client?.name}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-mono text-slate-600">{receipt.invoice?.invoice_number}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-slate-600">
                                                {new Date(receipt.payment_date).toLocaleDateString('pt-MZ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {getPaymentMethodBadge(receipt.payment_method)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-sm font-semibold text-slate-900">
                                                {Number(receipt.amount).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} {receipt.currency}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link href={`/receipts/${receipt.id}`}>
                                                    <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                                <a href={`/receipts/${receipt.id}/pdf`} target="_blank">
                                                    <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(receipt.id)}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {receipts.links && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
                            <div className="text-sm text-slate-600">
                                Mostrando {receipts.from} a {receipts.to} de {receipts.total} recibos
                            </div>
                            <div className="flex gap-2">
                                {receipts.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`px-3 py-1 text-sm rounded ${
                                            link.active
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-slate-600 hover:bg-slate-100'
                                        } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
