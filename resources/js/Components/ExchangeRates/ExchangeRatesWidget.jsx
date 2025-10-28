import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, RefreshCw, DollarSign } from 'lucide-react';

export default function ExchangeRatesWidget({ sidebarOpen }) {
    const [rates, setRates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchRates();

        // Atualizar a cada 10 minutos
        const interval = setInterval(fetchRates, 10 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    const fetchRates = async () => {
        try {
            const response = await fetch('/api/exchange-rates/current');
            const data = await response.json();

            if (response.ok) {
                setRates(data.rates || []);
                setLastUpdate(data.updated_at);
                setError(null);
            } else {
                setError(data.message || 'Erro ao carregar taxas');
            }
        } catch (err) {
            console.error('Erro ao buscar taxas:', err);
            setError('Erro de conexão');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchRates();
    };

    const formatLastUpdate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        const now = new Date();
        const diffMinutes = Math.floor((now - date) / 1000 / 60);

        if (diffMinutes < 60) {
            return `há ${diffMinutes} min`;
        } else if (diffMinutes < 1440) {
            return `há ${Math.floor(diffMinutes / 60)}h`;
        } else {
            return date.toLocaleDateString('pt-MZ');
        }
    };

    if (!sidebarOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 border-t border-gray-200"
        >
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <p className="text-sm font-semibold text-gray-900">
                            💱 Câmbio
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                            {formatLastUpdate(lastUpdate)}
                        </span>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="p-1 text-green-600 transition-colors rounded hover:text-green-700 hover:bg-green-100 disabled:opacity-50"
                            title="Atualizar"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="rounded-lg h-14 bg-white/50 animate-pulse" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                        <p className="text-xs text-red-700">{error}</p>
                        <p className="mt-1 text-xs text-red-600">
                            Execute: <code className="px-1 bg-red-100 rounded">php artisan exchange:update</code>
                        </p>
                    </div>
                ) : rates.length === 0 ? (
                    <div className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                        <p className="text-xs text-yellow-700">Nenhuma taxa disponível</p>
                    </div>
                ) : (
                    <div className="mb-3 space-y-2">
                        <AnimatePresence>
                            {rates.map((rate, index) => (
                                <motion.div
                                    key={rate.from_currency}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center justify-between p-2 transition-shadow bg-white rounded-lg hover:shadow-sm"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{rate.flag}</span>
                                        <div>
                                            <p className="text-xs font-medium text-gray-700">
                                                {rate.from_currency} → MZN
                                            </p>
                                            <p className="text-xs text-gray-500">{rate.currency_name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900">
                                            {parseFloat(rate.rate).toLocaleString('pt-MZ', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </p>
                                        <div className={`text-xs flex items-center gap-1 justify-end ${
                                            rate.is_increasing ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {rate.is_increasing ? (
                                                <TrendingUp className="w-3 h-3" />
                                            ) : (
                                                <TrendingDown className="w-3 h-3" />
                                            )}
                                            <span>{Math.abs(parseFloat(rate.change_percentage)).toFixed(2)}%</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {!loading && !error && rates.length > 0 && (
                    <div className="p-2 text-xs text-gray-600 rounded-lg bg-blue-50">
                        <span className="font-medium">💡 Dica:</span> Taxas atualizadas automaticamente a cada 30 min
                    </div>
                )}
            </div>
        </motion.div>
    );
}
