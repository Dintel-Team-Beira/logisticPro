import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Package, Users, FileText, DollarSign,
    Ship, Clock, TrendingUp, ExternalLink, Loader2,
    ArrowRight, Command, X
} from 'lucide-react';

/**
 * GlobalSearch - Pesquisa Global Moderna
 * Command Palette estilo Spotlight/Raycast
 *
 * @author Arnaldo Tomo
 */
export default function GlobalSearch({ isOpen, onClose }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const searchTimeout = useRef(null);

    // Focus input quando abrir
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Debounced Search
    useEffect(() => {
        if (query.length < 2) {
            setResults(null);
            return;
        }

        setLoading(true);

        // Clear previous timeout
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        // Set new timeout
        searchTimeout.current = setTimeout(async () => {
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                const data = await response.json();
                setResults(data.results);
                setSelectedIndex(0);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, [query]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            const allResults = getAllResults();

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < allResults.length - 1 ? prev + 1 : prev
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (allResults[selectedIndex]) {
                    navigateTo(allResults[selectedIndex]);
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, results]);

    const getAllResults = () => {
        if (!results) return [];
        return [
            ...results.shipments,
            ...results.clients,
            ...results.documents,
            ...results.invoices,
        ];
    };

    const navigateTo = (item) => {
        router.visit(item.url);
        onClose();
        setQuery('');
    };

    const getIcon = (type) => {
        const icons = {
            shipment: Package,
            client: Users,
            document: FileText,
            invoice: DollarSign,
        };
        return icons[type] || Package;
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-700',
            active: 'bg-green-100 text-green-700',
            completed: 'bg-blue-100 text-blue-700',
            paid: 'bg-green-100 text-green-700',
            overdue: 'bg-red-100 text-red-700',
            inactive: 'bg-gray-100 text-gray-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const ResultItem = ({ item, index }) => {
        const Icon = getIcon(item.type);
        const isSelected = index === selectedIndex;

        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => navigateTo(item)}
                className={`
                    group cursor-pointer p-4 rounded-xl transition-all duration-200
                    ${isSelected
                        ? 'bg-gradient-to-r from-[#358c9c] to-[#2a6d7a] text-white shadow-lg scale-[1.02]'
                        : 'hover:bg-slate-50 hover:shadow-md'
                    }
                `}
            >
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`
                        p-2.5 rounded-lg transition-colors
                        ${isSelected
                            ? 'bg-white/20'
                            : 'bg-gradient-to-br from-[#358c9c]/10 to-[#2a6d7a]/10 group-hover:from-[#358c9c]/20 group-hover:to-[#2a6d7a]/20'
                        }
                    `}>
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#358c9c]'}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1">
                            <h4 className={`
                                font-semibold text-base truncate
                                ${isSelected ? 'text-white' : 'text-slate-900 group-hover:text-[#358c9c]'}
                            `}>
                                {item.title}
                            </h4>
                            {item.status && (
                                <span className={`
                                    px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap
                                    ${isSelected ? 'bg-white/20 text-white' : getStatusColor(item.status)}
                                `}>
                                    {item.status}
                                </span>
                            )}
                        </div>

                        <p className={`
                            text-sm mb-2 truncate
                            ${isSelected ? 'text-white/80' : 'text-slate-600'}
                        `}>
                            {item.subtitle}
                        </p>

                        <p className={`
                            text-xs truncate
                            ${isSelected ? 'text-white/60' : 'text-slate-500'}
                        `}>
                            {item.description}
                        </p>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className={`
                        w-5 h-5 transition-transform
                        ${isSelected
                            ? 'text-white translate-x-1'
                            : 'text-slate-300 group-hover:text-[#358c9c] group-hover:translate-x-1'
                        }
                    `} />
                </div>
            </motion.div>
        );
    };

    const CategorySection = ({ title, items, icon: Icon }) => {
        if (!items || items.length === 0) return null;

        return (
            <div className="mb-6">
                <div className="flex items-center gap-2 px-4 mb-3">
                    <Icon className="w-4 h-4 text-[#358c9c]" />
                    <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                        {title} ({items.length})
                    </h3>
                </div>
                <div className="space-y-2">
                    {items.map((item, idx) => {
                        const globalIndex = getAllResults().findIndex(r => r.id === item.id && r.type === item.type);
                        return <ResultItem key={`${item.type}-${item.id}`} item={item} index={globalIndex} />;
                    })}
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] px-4 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ type: "spring", duration: 0.3 }}
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-3xl overflow-hidden bg-white shadow-2xl rounded-2xl"
                >
                    {/* Search Header */}
                    <div className="relative border-b border-slate-200">
                        <div className="flex items-center gap-3 px-5 py-4">
                            <Search className="w-5 h-5 text-[#358c9c]" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Buscar shipments, clientes, documentos, faturas..."
                                className="flex-1 text-base bg-transparent border-0 outline-none text-slate-900 placeholder-slate-400"
                            />
                            {loading && (
                                <Loader2 className="w-5 h-5 text-[#358c9c] animate-spin" />
                            )}
                            <button
                                onClick={onClose}
                                className="p-1.5 transition-colors rounded-lg hover:bg-slate-100"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Quick Tips */}
                        <div className="flex items-center gap-4 px-5 py-2 text-xs border-t bg-slate-50 text-slate-500 border-slate-100">
                            <span className="flex items-center gap-1.5">
                                <kbd className="px-2 py-0.5 bg-white border rounded shadow-sm border-slate-200">↑↓</kbd>
                                Navegar
                            </span>
                            <span className="flex items-center gap-1.5">
                                <kbd className="px-2 py-0.5 bg-white border rounded shadow-sm border-slate-200">Enter</kbd>
                                Selecionar
                            </span>
                            <span className="flex items-center gap-1.5">
                                <kbd className="px-2 py-0.5 bg-white border rounded shadow-sm border-slate-200">Esc</kbd>
                                Fechar
                            </span>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="max-h-[60vh] overflow-y-auto p-4">
                        {query.length < 2 && (
                            <div className="py-16 text-center">
                                <Search className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                <p className="text-sm font-medium text-slate-600">
                                    Digite para pesquisar
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    Busque por processos, clientes, documentos ou faturas
                                </p>
                            </div>
                        )}

                        {query.length >= 2 && !loading && results && (
                            <>
                                <CategorySection
                                    title="Processos (Shipments)"
                                    items={results.shipments}
                                    icon={Package}
                                />
                                <CategorySection
                                    title="Clientes"
                                    items={results.clients}
                                    icon={Users}
                                />
                                <CategorySection
                                    title="Documentos"
                                    items={results.documents}
                                    icon={FileText}
                                />
                                <CategorySection
                                    title="Faturas"
                                    items={results.invoices}
                                    icon={DollarSign}
                                />

                                {getAllResults().length === 0 && (
                                    <div className="py-16 text-center">
                                        <Ship className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                        <p className="text-sm font-medium text-slate-600">
                                            Nenhum resultado encontrado
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            Tente usar termos diferentes
                                        </p>
                                    </div>
                                )}
                            </>
                        )}

                        {loading && query.length >= 2 && (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="w-8 h-8 text-[#358c9c] animate-spin" />
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
