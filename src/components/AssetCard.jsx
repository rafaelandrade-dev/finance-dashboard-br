import React, { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import {
    TrendingUp, TrendingDown, BarChart2, DollarSign, Percent, Users,
} from 'lucide-react';
import { formatCurrency, formatPercent, formatVolume } from '../services/DashboardService';

// Compact sparkline for card
const Sparkline = ({ data, isPositive }) => (
    <ResponsiveContainer width="100%" height={48}>
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
            <defs>
                <linearGradient id={`sg-${isPositive ? 'bull' : 'bear'}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0} />
                </linearGradient>
            </defs>
            <YAxis hide domain={['dataMin - (dataMin * 0.05)', 'dataMax + (dataMax * 0.05)']} />
            <Tooltip
                content={({ active, payload }) =>
                    active && payload?.length ? (
                        <div className="bg-surface-700 text-white text-xs px-2 py-1 rounded-lg border border-white/10">
                            {formatCurrency(payload[0].value)}
                        </div>
                    ) : null
                }
            />
            <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? '#10b981' : '#ef4444'}
                strokeWidth={1.5}
                fill={`url(#sg-${isPositive ? 'bull' : 'bear'})`}
                dot={false}
                animationDuration={800}
            />
        </AreaChart>
    </ResponsiveContainer>
);

const StatPill = ({ icon: Icon, label, value, color }) => (
    <div className="flex flex-col">
        <div className={`flex items-center gap-1 text-xs ${color || 'text-gray-500'} mb-0.5`}>
            <Icon size={10} />
            <span>{label}</span>
        </div>
        <span className="text-sm font-mono font-semibold text-gray-200">{value}</span>
    </div>
);

export default function AssetCard({ asset, isSelected, onSelect }) {
    const isPositive = asset.changePercent >= 0;

    const typeBadge = useMemo(() => {
        if (asset.type === 'FII') return 'badge-fii';
        if (asset.type === 'ETF') return 'badge-etf';
        return 'badge-neutral';
    }, [asset.type]);

    return (
        <div
            onClick={() => onSelect(asset.ticker)}
            className={`card-hover p-4 flex flex-col gap-3 animate-slide-up ${isSelected ? 'border-accent-500/30 shadow-glow-accent' : ''
                }`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(asset.ticker)}
            aria-label={`Selecionar ${asset.ticker}`}
        >
            {/* Top Row */}
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-base font-bold text-white font-mono">{asset.ticker}</h3>
                        <span className={typeBadge}>{asset.type}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{asset.companyName}</p>
                </div>

                {/* Change Badge */}
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-sm font-bold flex-shrink-0 ${isPositive
                    ? 'bg-bull-500/15 text-bull-400 border border-bull-500/20'
                    : 'bg-bear-500/15 text-bear-400 border border-bear-500/20'
                    }`}>
                    {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {formatPercent(asset.changePercent)}
                </div>
            </div>

            {/* Price + Sparkline */}
            <div className="flex items-end gap-3">
                <div className="flex-shrink-0">
                    <p className="text-2xl font-black text-white font-mono leading-none">
                        {formatCurrency(asset.currentPrice)}
                    </p>
                    <p className={`text-xs mt-1 font-medium ${isPositive ? 'text-bull-400' : 'text-bear-400'}`}>
                        {isPositive ? '+' : ''}{formatCurrency(asset.change)} hoje
                    </p>
                </div>
                <div className="flex-1 min-w-0">
                    <Sparkline data={asset.sparkline} isPositive={isPositive} />
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/5">
                <StatPill
                    icon={Percent}
                    label="DY a.a."
                    value={`${(asset.dividendYield * 100).toFixed(1)}%`}
                    color="text-gold-400"
                />
                <StatPill
                    icon={DollarSign}
                    label="Últ. Div."
                    value={formatCurrency(asset.lastDividend)}
                    color="text-bull-400"
                />
                <StatPill
                    icon={BarChart2}
                    label="Volume"
                    value={formatVolume(asset.volume)}
                    color="text-accent-400"
                />
            </div>

            {/* High / Low Bar */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                    <span>Mín: {formatCurrency(asset.low)}</span>
                    <span>Máx: {formatCurrency(asset.high)}</span>
                </div>
                <div className="h-1 bg-surface-600 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-bear-500 via-gold-500 to-bull-500 rounded-full"
                        style={{
                            width: '100%',
                            clipPath: `inset(0 ${100 - ((asset.currentPrice - asset.low) / Math.max(asset.high - asset.low, 0.01)) * 100}% 0 0)`,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
