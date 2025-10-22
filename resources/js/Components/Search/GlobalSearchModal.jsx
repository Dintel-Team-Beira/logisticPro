import React, { useState, useEffect, useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';
import {
    Search,
    X,
    FileText,
    Users,
    Ship,
    DollarSign,
    Anchor,
    ArrowRight,
    Loader2,
    TrendingUp,
    Package,
    Clock,
    Maximize2,
    Minimize2
} from 'lucide-react';
import axios from 'axios';

/**
 * GlobalSearchModal - Pesquisa Global com Animações
 * Inspirado em Algolia DocSearch / Raycast Command Palette
 */
export default function GlobalSearchModal({ isOpen, onClose }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const inputRef = useRef(null);
    const resultsRef = useRef(null);

    // Icons map para cada tipo
    const typeIcons = {
        shipment: Package,
        client: Users,
        document: FileText,
        invoice: DollarSign,
        shipping_line: Anchor,
    };

    const typeLabels = {
        shipment: 'Processos',
        client: 'Clientes',
        document: 'Documentos',
        invoice: 'Faturas',
        shipping_line: 'Navios',
    };

    const typeColors = {
        shipment: 'text-blue-600 bg-blue-100',
        client: 'text-emerald-600 bg-emerald-100',
        document: 'text-purple-600 bg-purple-100',
        invoice: 'text-amber-600 bg-amber-100',
        shipping_line: 'text-cyan-600 bg-cyan-100',
    };

    // Debounce search
    useEffect(() => {
        if (query.length < 2) {
            setResults(null);
            return;
        }

        setLoading(true);
        const timeoutId = setTimeout(async () => {
            try {
                const response = await axios.get(`/api/search?q=${encodeURIComponent(query)}`);
                setResults(response.data.results);
                setSelectedIndex(0);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (!results) return;

        const allResults = Object.values(results).flat();
        const totalResults = allResults.length;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % totalResults);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + totalResults) % totalResults);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (allResults[selectedIndex]) {
                navigateToResult(allResults[selectedIndex]);
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    const navigateToResult = (result) => {
        router.visit(result.url);
        onClose();
    };

    // Flatten results for navigation
    const getAllResults = () => {
        if (!results) return [];
        return Object.entries(results).flatMap(([type, items]) =>
            items.map((item) => ({ ...item, categoryType: type }))
        );
    };

    const allResults = getAllResults();

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh] pointer-events-none">
                <div
                    className={`w-full bg-white rounded-2xl shadow-2xl pointer-events-auto overflow-hidden transition-all duration-300 ${
                        isExpanded ? 'max-w-6xl h-[80vh]' : 'max-w-3xl max-h-[600px]'
                    } animate-slide-up`}
                    style={{
                        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                >
                    {/* Search Header */}
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <Search className="w-5 h-5 text-gray-400" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Pesquisar processos, clientes, documentos, faturas..."
                            className="flex-1 text-lg border-0 bg-transparent focus:ring-0 focus:outline-none placeholder:text-gray-400"
                        />
                        {loading && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-2 text-gray-500 transition-colors rounded-lg hover:bg-gray-200"
                            title={isExpanded ? 'Minimizar' : 'Expandir'}
                        >
                            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 transition-colors rounded-lg hover:bg-gray-200"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Results */}
                    <div
                        ref={resultsRef}
                        className="overflow-y-auto"
                        style={{ maxHeight: isExpanded ? 'calc(80vh - 80px)' : '500px' }}
                    >
                        {query.length < 2 ? (
                            <div className="px-6 py-20 text-center">
                                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p className="text-gray-500">Digite pelo menos 2 caracteres para pesquisar</p>
                                <div className="mt-6 space-y-2 text-sm text-gray-400">
                                    <p>
                                        <kbd className="px-2 py-1 font-mono text-xs bg-gray-100 rounded">↑</kbd>
                                        <kbd className="px-2 py-1 ml-1 font-mono text-xs bg-gray-100 rounded">↓</kbd>
                                        {' '}para navegar
                                    </p>
                                    <p>
                                        <kbd className="px-2 py-1 font-mono text-xs bg-gray-100 rounded">Enter</kbd>
                                        {' '}para selecionar
                                    </p>
                                    <p>
                                        <kbd className="px-2 py-1 font-mono text-xs bg-gray-100 rounded">Esc</kbd>
                                        {' '}para fechar
                                    </p>
                                </div>
                            </div>
                        ) : loading && !results ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            </div>
                        ) : results && allResults.length === 0 ? (
                            <div className="px-6 py-20 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 text-4xl">🔍</div>
                                <p className="text-lg font-semibold text-gray-700">Nenhum resultado encontrado</p>
                                <p className="mt-2 text-gray-500">
                                    Tente pesquisar por número de referência, BL, container, cliente ou navio
                                </p>
                            </div>
                        ) : (
                            <div className="py-2">
                                {results &&
                                    Object.entries(results).map(([category, items]) => {
                                        if (items.length === 0) return null;

                                        return (
                                            <div key={category} className="mb-4">
                                                <div className="px-6 py-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                                    {typeLabels[category]} ({items.length})
                                                </div>
                                                {items.map((result, index) => {
                                                    const globalIndex = allResults.findIndex(
                                                        (r) => r.id === result.id && r.type === result.type
                                                    );
                                                    const isSelected = globalIndex === selectedIndex;
                                                    const Icon = typeIcons[result.type] || FileText;

                                                    return (
                                                        <button
                                                            key={`${result.type}-${result.id}`}
                                                            onClick={() => navigateToResult(result)}
                                                            className={`w-full px-6 py-3 flex items-start gap-4 transition-all ${
                                                                isSelected
                                                                    ? 'bg-blue-50 border-l-4 border-blue-500'
                                                                    : 'hover:bg-gray-50 border-l-4 border-transparent'
                                                            }`}
                                                        >
                                                            <div
                                                                className={`mt-0.5 p-2 rounded-lg ${
                                                                    typeColors[result.type]
                                                                }`}
                                                            >
                                                                <Icon className="w-4 h-4" />
                                                            </div>

                                                            <div className="flex-1 text-left">
                                                                <div className="font-semibold text-gray-900">
                                                                    {result.title}
                                                                </div>
                                                                <div className="text-sm text-gray-600">
                                                                    {result.subtitle}
                                                                </div>
                                                                <div className="mt-1 text-xs text-gray-500">
                                                                    {result.description}
                                                                </div>
                                                                {result.meta && (
                                                                    <div className="flex gap-2 mt-2">
                                                                        {result.meta.vessel && (
                                                                            <span className="px-2 py-0.5 text-xs bg-gray-100 rounded">
                                                                                🚢 {result.meta.vessel}
                                                                            </span>
                                                                        )}
                                                                        {result.meta.arrival_date && (
                                                                            <span className="px-2 py-0.5 text-xs bg-gray-100 rounded flex items-center gap-1">
                                                                                <Clock className="w-3 h-3" />
                                                                                {result.meta.arrival_date}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <ArrowRight
                                                                className={`w-5 h-5 text-gray-400 mt-2 transition-transform ${
                                                                    isSelected ? 'translate-x-1' : ''
                                                                }`}
                                                            />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {results && allResults.length > 0 && (
                        <div className="flex items-center justify-between px-6 py-3 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
                            <div>{allResults.length} resultados encontrados</div>
                            <div className="flex gap-4">
                                <span>
                                    <kbd className="px-2 py-1 font-mono bg-white rounded shadow-sm">↑↓</kbd> Navegar
                                </span>
                                <span>
                                    <kbd className="px-2 py-1 font-mono bg-white rounded shadow-sm">⏎</kbd> Selecionar
                                </span>
                                <span>
                                    <kbd className="px-2 py-1 font-mono bg-white rounded shadow-sm">Esc</kbd> Fechar
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px) scale(0.98);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
            `}</style>
        </>
    );
}
