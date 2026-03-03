import React from 'react';
import {
    Search, X, Plus, TrendingUp, TrendingDown, Trash2, Star,
} from 'lucide-react';
import { formatCurrency, formatPercent } from '../services/DashboardService';

const WatchlistItem = ({ asset, isActive, onClick, onRemove }) => {
    const isPositive = asset.changePercent >= 0;
    return (
        <button
            onClick={() => onClick(asset.ticker)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-left
        ${isActive
                    ? 'bg-accent-500/10 border border-accent-500/20'
                    : 'hover:bg-surface-700/50 border border-transparent'
                }`}
        >
            {/* Ticker + Type */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-sm font-bold text-white">{asset.ticker}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${asset.type === 'FII' ? 'bg-gold-500/15 text-gold-400' :
                            asset.type === 'ETF' ? 'bg-purple-500/15 text-purple-400' :
                                'bg-accent-500/15 text-accent-400'
                        }`}>{asset.type}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{asset.companyName}</p>
            </div>

            {/* Price + Change */}
            <div className="text-right flex-shrink-0">
                <p className="text-sm font-mono font-semibold text-white">
                    {formatCurrency(asset.currentPrice)}
                </p>
                <div className={`flex items-center justify-end gap-0.5 text-xs font-medium ${isPositive ? 'text-bull-400' : 'text-bear-400'
                    }`}>
                    {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    <span>{formatPercent(asset.changePercent)}</span>
                </div>
            </div>

            {/* Remove button */}
            <button
                onClick={(e) => { e.stopPropagation(); onRemove(asset.ticker); }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-bear-500/15 hover:text-bear-400 text-gray-600 transition-all duration-200 flex-shrink-0"
                aria-label={`Remover ${asset.ticker}`}
            >
                <Trash2 size={12} />
            </button>
        </button>
    );
};

const SearchResult = ({ ticker, name, onAdd }) => (
    <button
        onClick={() => onAdd(ticker)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-surface-700/50 transition-all group"
    >
        <div>
            <p className="text-sm font-semibold text-white text-left">{ticker}</p>
            <p className="text-xs text-gray-500 text-left">{name || ticker}</p>
        </div>
        <Plus size={14} className="text-accent-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
);

export default function Sidebar({ assets, selectedTicker, onSelectAsset, onRemoveAsset, onAddAsset, searchResults, searchQuery, onSearchChange, isSearching }) {
    const grouped = {
        FII: assets.filter(a => a.type === 'FII'),
        ACAO: assets.filter(a => a.type === 'ACAO'),
        ETF: assets.filter(a => a.type === 'ETF'),
    };

    return (
        <aside className="w-72 flex-shrink-0 flex flex-col gap-4 h-full overflow-y-auto pb-6">
            {/* Search */}
            <div className="sticky top-0 bg-surface-900 pt-2 pb-1 z-10">
                <div className="section-title">Buscar Ativos</div>
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Ex: PETR4, MXRF11..."
                        className="input-field w-full pl-9 pr-9"
                        aria-label="Buscar ativo"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>

                {/* Search Results */}
                {searchQuery && (
                    <div className="mt-2 card p-2 animate-fade-in">
                        {isSearching ? (
                            <p className="text-xs text-gray-500 text-center py-2">Buscando...</p>
                        ) : searchResults.length > 0 ? (
                            <div className="space-y-0.5">
                                {searchResults.map(({ stock, name }) => (
                                    <SearchResult
                                        key={stock}
                                        ticker={stock}
                                        name={name}
                                        onAdd={onAddAsset}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500 text-center py-2">Nenhum resultado encontrado</p>
                        )}
                    </div>
                )}
            </div>

            {/* Watchlist */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <div className="section-title mb-0">Carteira</div>
                    <span className="text-xs text-gray-600">{assets.length} ativos</span>
                </div>

                {Object.entries(grouped).map(([type, group]) =>
                    group.length > 0 ? (
                        <div key={type} className="mb-4">
                            <div className="flex items-center gap-2 mb-1.5 px-1">
                                <span className={`text-xs font-semibold ${type === 'FII' ? 'text-gold-400' :
                                        type === 'ETF' ? 'text-purple-400' :
                                            'text-accent-400'
                                    }`}>{type}s</span>
                                <div className="flex-1 h-px bg-white/5" />
                            </div>
                            <div className="space-y-0.5">
                                {group.map((asset) => (
                                    <WatchlistItem
                                        key={asset.ticker}
                                        asset={asset}
                                        isActive={selectedTicker === asset.ticker}
                                        onClick={onSelectAsset}
                                        onRemove={onRemoveAsset}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : null
                )}
            </div>

            {/* Tips */}
            <div className="card p-3 border-accent-500/10">
                <div className="flex items-start gap-2">
                    <Star size={12} className="text-gold-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Clique em um ativo para ver detalhes e projeções personalizadas.
                    </p>
                </div>
            </div>
        </aside>
    );
}
