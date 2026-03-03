import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AssetCard from './components/AssetCard';
import ProjectionChart from './components/ProjectionChart';
import SkeletonLoader from './components/SkeletonLoader';
import { ErrorBoundary, ErrorFallback } from './components/ErrorBoundary';
import {
  fetchAssets,
  searchAsset,
  calculatePortfolioMetrics,
  DEFAULT_TICKERS,
} from './services/DashboardService';
import { RefreshCw, LayoutGrid, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

// ─── Debounce hook ──────────────────────────────────────────────────────────
function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// ─── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tickers, setTickers] = useState(DEFAULT_TICKERS);
  const [selectedTicker, setSelectedTicker] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // UI state
  const [showProjection, setShowProjection] = useState(true);
  const [sortBy, setSortBy] = useState('changePercent'); // 'changePercent' | 'price' | 'dy'
  const [sortDir, setSortDir] = useState('desc');

  const refreshTimerRef = useRef(null);

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const loadAssets = useCallback(async (tickerList = tickers, silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await fetchAssets(tickerList);
      setAssets(data);
      setLastUpdated(new Date().toLocaleTimeString('pt-BR'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tickers]);

  useEffect(() => {
    loadAssets(tickers);
    // Auto-refresh every 60 seconds
    refreshTimerRef.current = setInterval(() => loadAssets(tickers, true), 60_000);
    return () => clearInterval(refreshTimerRef.current);
  }, [tickers]);

  // ─── Search ───────────────────────────────────────────────────────────────
  const debouncedQuery = useDebounce(searchQuery, 400);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    searchAsset(debouncedQuery).then((results) => {
      setSearchResults(results);
      setIsSearching(false);
    });
  }, [debouncedQuery]);

  // ─── Add / Remove ─────────────────────────────────────────────────────────
  const handleAddAsset = useCallback((ticker) => {
    const upper = ticker.toUpperCase();
    if (tickers.includes(upper)) return;
    const newTickers = [...tickers, upper];
    setTickers(newTickers);
    setSearchQuery('');
    setSearchResults([]);
    // Immediately fetch the new ticker
    fetchAssets([upper]).then((newAssets) => {
      setAssets((prev) => {
        const existing = prev.filter((a) => a.ticker !== upper);
        return [...existing, ...newAssets];
      });
      setLastUpdated(new Date().toLocaleTimeString('pt-BR'));
    });
  }, [tickers]);

  const handleRemoveAsset = useCallback((ticker) => {
    setTickers((prev) => prev.filter((t) => t !== ticker));
    setAssets((prev) => prev.filter((a) => a.ticker !== ticker));
    if (selectedTicker === ticker) setSelectedTicker(null);
  }, [selectedTicker]);

  // ─── Portfolio Metrics ────────────────────────────────────────────────────
  const metrics = useMemo(() => calculatePortfolioMetrics(assets), [assets]);

  // ─── Sorted Assets ────────────────────────────────────────────────────────
  const sortedAssets = useMemo(() => {
    const sorted = [...assets].sort((a, b) => {
      let valA, valB;
      if (sortBy === 'changePercent') { valA = a.changePercent; valB = b.changePercent; }
      else if (sortBy === 'price') { valA = a.currentPrice; valB = b.currentPrice; }
      else if (sortBy === 'dy') { valA = a.dividendYield; valB = b.dividendYield; }
      else { valA = a.ticker; valB = b.ticker; }
      return sortDir === 'desc' ? valB - valA : valA - valB;
    });
    return sorted;
  }, [assets, sortBy, sortDir]);

  // ─── Toggle Sort ──────────────────────────────────────────────────────────
  const handleSort = (key) => {
    if (sortBy === key) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    else { setSortBy(key); setSortDir('desc'); }
  };

  const SortButton = ({ label, k }) => (
    <button
      onClick={() => handleSort(k)}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${sortBy === k
          ? 'bg-accent-500/15 text-accent-400 border border-accent-500/20'
          : 'text-gray-500 hover:text-gray-300 hover:bg-surface-700/50'
        }`}
    >
      {label}
      {sortBy === k && (sortDir === 'desc' ? <ChevronDown size={10} /> : <ChevronUp size={10} />)}
    </button>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <ErrorBoundary>
        {loading ? (
          <div className="sticky top-0 z-30 bg-surface-900/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 py-6 animate-pulse-slow">
            <div className="h-6 w-32 bg-surface-700 rounded shimmer mb-4" />
            <div className="flex gap-3">
              {[1, 2, 3].map(i => <div key={i} className="flex-1 h-20 bg-surface-800 rounded-2xl shimmer" />)}
            </div>
          </div>
        ) : (
          <Header assets={assets} metrics={metrics} lastUpdated={lastUpdated} />
        )}
      </ErrorBoundary>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="flex flex-1 gap-0">

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <div className="hidden lg:block w-72 flex-shrink-0 p-4 border-r border-white/5 h-[calc(100vh-160px)] sticky top-[160px] overflow-y-auto">
          <Sidebar
            assets={assets}
            selectedTicker={selectedTicker}
            onSelectAsset={setSelectedTicker}
            onRemoveAsset={handleRemoveAsset}
            onAddAsset={handleAddAsset}
            searchResults={searchResults}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isSearching={isSearching}
          />
        </div>

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 space-y-6">

          {/* Mobile Search */}
          <div className="lg:hidden">
            <div className="relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar ativo (ex: PETR4)..."
                className="input-field w-full"
              />
              {searchQuery && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 card p-2 z-20 animate-fade-in">
                  {searchResults.map(({ stock, name }) => (
                    <button
                      key={stock}
                      onClick={() => handleAddAsset(stock)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-700/50 transition-all"
                    >
                      <span className="text-sm font-semibold text-white">{stock}</span>
                      <span className="text-xs text-gray-500 ml-2">{name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cards Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <LayoutGrid size={14} className="text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-300">
                Ativos monitorados
                <span className="ml-2 text-xs font-normal text-gray-600">({sortedAssets.length})</span>
              </h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-600 hidden sm:block">Ordenar por:</span>
              <div className="flex gap-1">
                <SortButton label="Variação" k="changePercent" />
                <SortButton label="Preço" k="price" />
                <SortButton label="DY" k="dy" />
              </div>
              <button
                onClick={() => loadAssets(tickers)}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-accent-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-surface-700/50"
                aria-label="Atualizar dados"
              >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                <span className="hidden sm:block">Atualizar</span>
              </button>
            </div>
          </div>

          {/* Asset Grid */}
          <ErrorBoundary>
            {loading ? (
              <SkeletonLoader count={tickers.length || 6} />
            ) : error ? (
              <ErrorFallback message={error} onRetry={() => loadAssets(tickers)} />
            ) : sortedAssets.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-gray-500 text-sm">Nenhum ativo encontrado. Adicione um ativo pelo campo de busca.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {sortedAssets.map((asset) => (
                  <AssetCard
                    key={asset.ticker}
                    asset={asset}
                    isSelected={selectedTicker === asset.ticker}
                    onSelect={setSelectedTicker}
                  />
                ))}
              </div>
            )}
          </ErrorBoundary>

          {/* Projection Chart */}
          <div>
            <button
              onClick={() => setShowProjection((v) => !v)}
              className="flex items-center gap-2 mb-4 group"
            >
              <div className="w-8 h-8 rounded-xl bg-bull-500/10 border border-bull-500/20 flex items-center justify-center group-hover:border-bull-500/40 transition-colors">
                <TrendingUp size={14} className="text-bull-400" />
              </div>
              <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">
                Projeção de Crescimento Patrimonial
              </span>
              {showProjection ? (
                <ChevronUp size={14} className="text-gray-500 ml-auto" />
              ) : (
                <ChevronDown size={14} className="text-gray-500 ml-auto" />
              )}
            </button>
            {showProjection && (
              <ErrorBoundary>
                <ProjectionChart />
              </ErrorBoundary>
            )}
          </div>

          {/* Footer */}
          <footer className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
            <span>© 2025 InvestView · Dados fornecidos pela BRAPI</span>
            <span>Atualizado: {lastUpdated || '–'} · Todos os valores em BRL</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
