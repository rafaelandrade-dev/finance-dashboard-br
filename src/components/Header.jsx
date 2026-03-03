import React from 'react';
import {
    TrendingUp, TrendingDown, Wallet, Activity, ChevronRight,
} from 'lucide-react';
import { formatCurrency, formatPercent } from '../services/DashboardService';

const StatCard = ({ label, value, sub, icon: Icon, iconColor, change }) => (
    <div className="card flex-1 min-w-0 p-4 flex items-start gap-3 animate-fade-in">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
            <Icon size={18} />
        </div>
        <div className="min-w-0">
            <p className="stat-label mb-0.5">{label}</p>
            <p className="text-lg font-bold text-white font-mono truncate">{value}</p>
            {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
        </div>
        {change !== undefined && (
            <div className={`ml-auto text-xs font-semibold flex items-center gap-0.5 ${change >= 0 ? 'text-bull-400' : 'text-bear-400'}`}>
                {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {formatPercent(change)}
            </div>
        )}
    </div>
);

export default function Header({ assets, metrics, lastUpdated }) {
    const isPositive = metrics.totalChangePercent >= 0;

    return (
        <header className="sticky top-0 z-30 bg-surface-900/80 backdrop-blur-xl border-b border-white/5">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3">
                <div className="flex items-center gap-3">
                    {/* Logo */}
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center shadow-glow-accent">
                        <Activity size={16} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-white leading-none">InvestView</h1>
                        <p className="text-xs text-gray-500">Análise de Ativos BR</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Live indicator */}
                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-2 h-2 rounded-full bg-bull-500 animate-pulse-slow"></span>
                        <span>Ao Vivo</span>
                    </div>
                    {lastUpdated && (
                        <span className="hidden sm:block text-xs text-gray-600">
                            {lastUpdated}
                        </span>
                    )}
                </div>
            </div>

            {/* Stats Row */}
            <div className="px-4 sm:px-6 pb-4">
                <div className="flex flex-wrap gap-3">
                    <StatCard
                        label="Patrimônio Total"
                        value={formatCurrency(metrics.totalValue, true)}
                        sub={`${assets.length} ativo${assets.length !== 1 ? 's' : ''} monitorados`}
                        icon={Wallet}
                        iconColor="bg-accent-500/15 text-accent-400"
                    />
                    <StatCard
                        label="Variação Hoje"
                        value={formatCurrency(metrics.totalChange)}
                        sub="em relação ao fechamento anterior"
                        icon={isPositive ? TrendingUp : TrendingDown}
                        iconColor={isPositive ? 'bg-bull-500/15 text-bull-400' : 'bg-bear-500/15 text-bear-400'}
                        change={metrics.totalChangePercent}
                    />
                    <div className="card flex-1 min-w-0 p-4 animate-fade-in">
                        <p className="stat-label mb-2">Composição</p>
                        <div className="flex gap-3 flex-wrap">
                            {metrics.stockCount > 0 && (
                                <div className="flex items-center gap-1.5">
                                    <span className="badge-neutral">{metrics.stockCount} Ações</span>
                                </div>
                            )}
                            {metrics.fiiCount > 0 && (
                                <div className="flex items-center gap-1.5">
                                    <span className="badge-fii">{metrics.fiiCount} FIIs</span>
                                </div>
                            )}
                            {metrics.etfCount > 0 && (
                                <div className="flex items-center gap-1.5">
                                    <span className="badge-etf">{metrics.etfCount} ETFs</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 ml-auto">
                                <span className="text-xs text-gray-500">DY Médio</span>
                                <span className="text-xs font-mono font-semibold text-gold-400">
                                    {(metrics.weightedDY * 100).toFixed(2)}% a.a.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
