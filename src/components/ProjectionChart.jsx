import React, { useState, useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { TrendingUp, RefreshCw, DollarSign, Calendar } from 'lucide-react';
import { projectGrowth, formatCurrency } from '../services/DashboardService';

const HORIZONS = [
    { label: '1 Ano', years: 1 },
    { label: '5 Anos', years: 5 },
    { label: '10 Anos', years: 10 },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="card p-3 border border-accent-500/20 shadow-glow-accent min-w-48">
            <p className="text-xs text-gray-400 mb-2">Ano {label}</p>
            {payload.map((entry) => (
                <div key={entry.name} className="flex justify-between items-center gap-4 mb-1">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-xs text-gray-400">
                            {entry.name === 'nominal' ? 'Nominal' : entry.name === 'real' ? 'Real (adj. inflação)' : 'Dividendos Acum.'}
                        </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-white">{formatCurrency(entry.value, true)}</span>
                </div>
            ))}
        </div>
    );
};

const SliderInput = ({ label, value, onChange, min, max, step, format }) => (
    <div className="space-y-1.5">
        <div className="flex justify-between">
            <label className="text-xs text-gray-500">{label}</label>
            <span className="text-xs font-mono font-semibold text-accent-400">{format(value)}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-surface-600 rounded-full appearance-none cursor-pointer accent-accent-500"
            style={{ accentColor: '#00baff' }}
        />
    </div>
);

export default function ProjectionChart() {
    const [horizon, setHorizon] = useState(10);
    const [params, setParams] = useState({
        initialValue: 10000,
        monthlyContrib: 1000,
        annualReturn: 0.10,
        dividendYield: 0.08,
        inflationRate: 0.045,
        dividendGrowth: 0.03,
        reinvest: true,
    });

    const set = (key) => (val) => setParams((p) => ({ ...p, [key]: val }));

    const data = useMemo(() =>
        projectGrowth({ ...params, years: horizon }).filter(d => d.year !== undefined || d.month === 0),
        [params, horizon]
    );

    const finalPoint = data[data.length - 1] || {};
    const growth = finalPoint.nominal && params.initialValue
        ? ((finalPoint.nominal - params.initialValue) / params.initialValue) * 100
        : 0;

    return (
        <div className="card p-5 animate-slide-up">
            {/* Title */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-bull-500/10 border border-bull-500/20 flex items-center justify-center">
                        <TrendingUp size={16} className="text-bull-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white">Motor de Projeções</h2>
                        <p className="text-xs text-gray-500">Composição com aportes e reinvestimento</p>
                    </div>
                </div>

                {/* Horizon Selector */}
                <div className="flex gap-1 bg-surface-700/50 rounded-xl p-1">
                    {HORIZONS.map(({ label, years }) => (
                        <button
                            key={years}
                            onClick={() => setHorizon(years)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${horizon === years
                                    ? 'bg-accent-500 text-surface-900 shadow-glow-accent'
                                    : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-surface-700/30 rounded-xl p-3 border border-white/5">
                    <p className="stat-label mb-1">Patrimônio Final</p>
                    <p className="text-lg font-black font-mono text-bull-400">
                        {formatCurrency(finalPoint.nominal || 0, true)}
                    </p>
                    <p className="text-xs text-gray-500">+{growth.toFixed(0)}% de crescimento</p>
                </div>
                <div className="bg-surface-700/30 rounded-xl p-3 border border-white/5">
                    <p className="stat-label mb-1">Valor Real</p>
                    <p className="text-lg font-black font-mono text-accent-400">
                        {formatCurrency(finalPoint.real || 0, true)}
                    </p>
                    <p className="text-xs text-gray-500">Ajustado pela inflação</p>
                </div>
                <div className="bg-surface-700/30 rounded-xl p-3 border border-white/5">
                    <p className="stat-label mb-1">Dividendo/Mês</p>
                    <p className="text-lg font-black font-mono text-gold-400">
                        {formatCurrency(finalPoint.monthlyDividend || 0, true)}
                    </p>
                    <p className="text-xs text-gray-500">No {horizon}º ano</p>
                </div>
            </div>

            {/* Chart */}
            <div className="h-64 mb-5">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="grad-nominal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="grad-real" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00baff" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#00baff" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="grad-dividends" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis
                            dataKey="year"
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) => `Ano ${v}`}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) => formatCurrency(v, true)}
                            width={72}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="dividends" name="dividends" stroke="#f59e0b" strokeWidth={1.5} fill="url(#grad-dividends)" dot={false} />
                        <Area type="monotone" dataKey="real" name="real" stroke="#00baff" strokeWidth={1.5} fill="url(#grad-real)" dot={false} />
                        <Area type="monotone" dataKey="nominal" name="nominal" stroke="#10b981" strokeWidth={2} fill="url(#grad-nominal)" dot={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex gap-4 mb-5 flex-wrap">
                {[
                    { color: '#10b981', label: 'Nominal' },
                    { color: '#00baff', label: 'Real (inflação)' },
                    { color: '#f59e0b', label: 'Dividendos Acum.' },
                ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-xs text-gray-500">{label}</span>
                    </div>
                ))}
            </div>

            {/* Parameters */}
            <div className="border-t border-white/5 pt-5">
                <p className="section-title">Parâmetros de Simulação</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <SliderInput
                            label="Aporte Inicial"
                            value={params.initialValue}
                            onChange={set('initialValue')}
                            min={1000} max={500000} step={1000}
                            format={(v) => formatCurrency(v, true)}
                        />
                        <SliderInput
                            label="Aporte Mensal"
                            value={params.monthlyContrib}
                            onChange={set('monthlyContrib')}
                            min={0} max={20000} step={100}
                            format={(v) => formatCurrency(v, true)}
                        />
                        <SliderInput
                            label="Retorno Anual (Capital)"
                            value={params.annualReturn}
                            onChange={set('annualReturn')}
                            min={0.02} max={0.30} step={0.01}
                            format={(v) => `${(v * 100).toFixed(0)}%`}
                        />
                    </div>
                    <div className="space-y-4">
                        <SliderInput
                            label="Dividend Yield Anual"
                            value={params.dividendYield}
                            onChange={set('dividendYield')}
                            min={0.01} max={0.25} step={0.01}
                            format={(v) => `${(v * 100).toFixed(0)}%`}
                        />
                        <SliderInput
                            label="Inflação Estimada"
                            value={params.inflationRate}
                            onChange={set('inflationRate')}
                            min={0.01} max={0.15} step={0.005}
                            format={(v) => `${(v * 100).toFixed(1)}%`}
                        />
                        <SliderInput
                            label="Crescimento do Dividendo"
                            value={params.dividendGrowth}
                            onChange={set('dividendGrowth')}
                            min={0} max={0.15} step={0.005}
                            format={(v) => `${(v * 100).toFixed(1)}%`}
                        />
                    </div>
                </div>

                {/* Reinvest Toggle */}
                <div className="flex items-center justify-between mt-4 p-3 bg-surface-700/30 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2">
                        <RefreshCw size={14} className="text-accent-400" />
                        <div>
                            <p className="text-xs font-semibold text-white">Reinvestir Dividendos</p>
                            <p className="text-xs text-gray-500">Juros sobre juros – efeito bola de neve</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setParams(p => ({ ...p, reinvest: !p.reinvest }))}
                        className={`relative w-11 h-6 rounded-full transition-all duration-300 ${params.reinvest ? 'bg-accent-500' : 'bg-surface-600'
                            }`}
                        aria-label="Toggle reinvestimento"
                        role="switch"
                        aria-checked={params.reinvest}
                    >
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${params.reinvest ? 'left-5.5 translate-x-0.5' : 'left-0.5'
                            }`} />
                    </button>
                </div>
            </div>
        </div>
    );
}
