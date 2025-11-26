import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { FileText, ArrowLeft, Download, User, Calendar, DollarSign, TrendingUp, TrendingDown, Receipt, FileDown, FileUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Show({ client, transactions, summary, startDate, endDate }) {
    const [filterStartDate, setFilterStartDate] = useState(startDate);
    const [filterEndDate, setFilterEndDate] = useState(endDate);

    const handleFilterChange = () => {
        router.get(`/statements/client/${client.id}`, {
            start_date: filterStartDate,
            end_date: filterEndDate,
        });
    };

    const getTransactionIcon = (type) => {
        const icons = {
            invoice: FileText,
            receipt: Receipt,
            credit_note: FileDown,
            debit_note: FileUp,
        };
        return icons[type] || FileText;
    };

    const getTransactionBadge = (type) => {
        const badges = {
            invoice: { label: 'Fatura', color: 'bg-blue-100 text-blue-700' },
            receipt: { label: 'Recibo', color: 'bg-green-100 text-green-700' },
            credit_note: { label: 'Nota Crédito', color: 'bg-purple-100 text-purple-700' },
            debit_note: { label: 'Nota Débito', color: 'bg-orange-100 text-orange-700' },
        };
        const config = badges[type] || badges.invoice;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${config.color}`}>
                {React.createElement(getTransactionIcon(type), { className: 'w-3 h-3' })}
                {config.label}
            </span>
        );
    };

    return (
        <DashboardLayout>
            <Head title={`Extrato - ${client.name}`} />

            <div className="p-6 ml-5 -mt-3 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/clients">
                            <button className="p-2 transition-colors rounded-lg hover:bg-slate-100">
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900">Extrato de Cliente</h1>
                            <p className="mt-1 text-sm text-slate-500">
                                {client.name}
                            </p>
                        </div>
                    </div>
                    <a href={`/statements/client/${client.id}/pdf?start_date=${startDate}&end_date=${endDate}`} target="_blank">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                        >
                            <Download className="w-4 h-4" />
                            Baixar PDF
                        </motion.button>
                    </a>
                </div>

                {/* Date Filter */}
                <div className="flex gap-4 p-4 bg-white border rounded-lg border-slate-200">
                    <div>
                        <label className="block mb-1 text-xs font-medium text-slate-600">Data Início</label>
                        <input
                            type="date"
                            value={filterStartDate}
                            onChange={e => setFilterStartDate(e.target.value)}
                            className="px-3 py-2 text-sm border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-xs font-medium text-slate-600">Data Fim</label>
                        <input
                            type="date"
                            value={filterEndDate}
                            onChange={e => setFilterEndDate(e.target.value)}
                            className="px-3 py-2 text-sm border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleFilterChange}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            <Calendar className="w-4 h-4" />
                            Filtrar
                        </button>
                    </div>
                    <div className="flex items-end ml-auto">
                        <div className="text-right">
                            <div className="text-xs font-medium text-slate-500">Período</div>
                            <div className="text-sm font-semibold text-slate-900">
                                {new Date(startDate).toLocaleDateString('pt-MZ')} - {new Date(endDate).toLocaleDateString('pt-MZ')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-white border rounded-lg border-slate-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Saldo Inicial</p>
                                <p className="mt-2 text-2xl font-semibold text-slate-900">
                                    {Number(summary.initial_balance).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            <DollarSign className="w-12 h-12 text-slate-500" />
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
                                <p className="text-sm font-medium text-slate-600">Total Débitos</p>
                                <p className="mt-2 text-2xl font-semibold text-red-600">
                                    +{Number(summary.total_debits).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            <TrendingUp className="w-12 h-12 text-red-500" />
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
                                <p className="text-sm font-medium text-slate-600">Total Créditos</p>
                                <p className="mt-2 text-2xl font-semibold text-green-600">
                                    -{Number(summary.total_credits).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            <TrendingDown className="w-12 h-12 text-green-500" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 border rounded-lg border-blue-600"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-white">Saldo Final</p>
                                <p className="mt-2 text-2xl font-bold text-white">
                                    {Number(summary.final_balance).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            <DollarSign className="w-12 h-12 text-white" />
                        </div>
                    </motion.div>
                </div>

                {/* Transactions Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white border rounded-lg border-slate-200 overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-200">
                        <h2 className="text-lg font-semibold text-slate-900">Movimentos</h2>
                        <p className="text-sm text-slate-500">Todas as transações do período</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-xs font-medium text-left text-slate-600 uppercase">Data</th>
                                    <th className="px-4 py-3 text-xs font-medium text-left text-slate-600 uppercase">Tipo</th>
                                    <th className="px-4 py-3 text-xs font-medium text-left text-slate-600 uppercase">Documento</th>
                                    <th className="px-4 py-3 text-xs font-medium text-left text-slate-600 uppercase">Descrição</th>
                                    <th className="px-4 py-3 text-xs font-medium text-right text-slate-600 uppercase">Débito</th>
                                    <th className="px-4 py-3 text-xs font-medium text-right text-slate-600 uppercase">Crédito</th>
                                    <th className="px-4 py-3 text-xs font-medium text-right text-slate-600 uppercase">Saldo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                                            Nenhuma transação encontrada para o período selecionado
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((transaction, index) => (
                                        <tr key={index} className="hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-slate-600">
                                                    {new Date(transaction.date).toLocaleDateString('pt-MZ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {getTransactionBadge(transaction.type)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm font-mono font-medium text-slate-900">
                                                    {transaction.document_number}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-slate-600">
                                                    {transaction.description}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {transaction.debit > 0 ? (
                                                    <span className="text-sm font-semibold text-red-600">
                                                        +{Number(transaction.debit).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {transaction.credit > 0 ? (
                                                    <span className="text-sm font-semibold text-green-600">
                                                        -{Number(transaction.credit).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className={`text-sm font-bold ${
                                                    transaction.balance >= 0 ? 'text-slate-900' : 'text-red-600'
                                                }`}>
                                                    {Number(transaction.balance).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary Footer */}
                    {transactions.length > 0 && (
                        <div className="p-6 border-t-2 border-slate-200 bg-slate-50">
                            <div className="grid grid-cols-3 gap-4 max-w-2xl ml-auto">
                                <div className="text-right">
                                    <div className="text-xs font-medium text-slate-500">Total Débitos</div>
                                    <div className="text-lg font-bold text-red-600">
                                        +{Number(summary.total_debits).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-medium text-slate-500">Total Créditos</div>
                                    <div className="text-lg font-bold text-green-600">
                                        -{Number(summary.total_credits).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-medium text-slate-500">Saldo Final</div>
                                    <div className={`text-xl font-bold ${
                                        summary.final_balance >= 0 ? 'text-blue-600' : 'text-red-600'
                                    }`}>
                                        {Number(summary.final_balance).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Pending Invoices */}
                {summary.pending_invoices > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="p-4 border-l-4 border-yellow-500 rounded-lg bg-yellow-50"
                    >
                        <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6 text-yellow-600" />
                            <div>
                                <div className="font-semibold text-yellow-900">Faturas Pendentes</div>
                                <div className="text-sm text-yellow-700">
                                    O cliente possui {Number(summary.pending_invoices).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MZN em faturas pendentes
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </DashboardLayout>
    );
}
