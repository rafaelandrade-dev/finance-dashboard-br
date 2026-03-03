import axios from 'axios';

// ─────────────────────────────────────────────
// BRAPI Configuration
// ─────────────────────────────────────────────
const BRAPI_BASE_URL = 'https://brapi.dev/api';
// Public token – works for light usage. Replace with your own for production.
const BRAPI_TOKEN = 'demo';

const brapiClient = axios.create({
    baseURL: BRAPI_BASE_URL,
    timeout: 12000,
    params: { token: BRAPI_TOKEN },
});

// ─────────────────────────────────────────────
// Default watchlist
// ─────────────────────────────────────────────
export const DEFAULT_TICKERS = ['XPML11', 'BBDC4', 'IVVB11', 'MXRF11', 'PETR4', 'VALE3'];

// ─────────────────────────────────────────────
// Fallback / mock data (used when API is offline)
// ─────────────────────────────────────────────
const MOCK_ASSETS = [
    { ticker: 'XPML11', companyName: 'XP Malls FII', currentPrice: 103.50, change: 0.42, changePercent: 0.41, high: 104.20, low: 103.10, volume: 1200000, type: 'FII', dividendYield: 0.0823, lastDividend: 0.78, marketCap: 3800000000, previousClose: 103.07 },
    { ticker: 'BBDC4', companyName: 'Bradesco PN', currentPrice: 14.82, change: -0.18, changePercent: -1.20, high: 15.05, low: 14.70, volume: 35000000, type: 'ACAO', dividendYield: 0.0620, lastDividend: 0.10, marketCap: 130000000000, previousClose: 15.00 },
    { ticker: 'IVVB11', companyName: 'iShares S&P 500 BR', currentPrice: 432.10, change: 3.75, changePercent: 0.87, high: 433.50, low: 429.80, volume: 850000, type: 'ETF', dividendYield: 0.0015, lastDividend: 0.62, marketCap: 12000000000, previousClose: 428.35 },
    { ticker: 'MXRF11', companyName: 'Maxi Renda FII', currentPrice: 10.12, change: 0.05, changePercent: 0.50, high: 10.18, low: 10.08, volume: 4500000, type: 'FII', dividendYield: 0.1120, lastDividend: 0.09, marketCap: 5200000000, previousClose: 10.07 },
    { ticker: 'PETR4', companyName: 'Petrobras PN', currentPrice: 38.45, change: -0.85, changePercent: -2.16, high: 39.40, low: 38.20, volume: 62000000, type: 'ACAO', dividendYield: 0.1450, lastDividend: 2.10, marketCap: 502000000000, previousClose: 39.30 },
    { ticker: 'VALE3', companyName: 'Vale ON', currentPrice: 58.20, change: 1.10, changePercent: 1.93, high: 58.90, low: 57.50, volume: 48000000, type: 'ACAO', dividendYield: 0.0890, lastDividend: 4.50, marketCap: 280000000000, previousClose: 57.10 },
];

// Generate realistic sparkline history (30 days)
const generateSparkline = (basePrice, volatility = 0.015) => {
    let price = basePrice * (1 - Math.random() * 0.08);
    return Array.from({ length: 30 }, (_, i) => {
        const trend = (i / 30) * 0.04 - 0.01; // slight uptrend
        price *= 1 + (Math.random() - 0.46) * volatility + trend / 30;
        return { day: i + 1, price: parseFloat(price.toFixed(2)) };
    });
};

// ─────────────────────────────────────────────
// Data Transformation
// ─────────────────────────────────────────────
const transformBrapiResult = (result) => ({
    ticker: result.symbol,
    companyName: result.longName || result.shortName || result.symbol,
    currentPrice: result.regularMarketPrice || 0,
    change: result.regularMarketChange || 0,
    changePercent: result.regularMarketChangePercent || 0,
    high: result.regularMarketDayHigh || 0,
    low: result.regularMarketDayLow || 0,
    volume: result.regularMarketVolume || 0,
    previousClose: result.regularMarketPreviousClose || 0,
    marketCap: result.marketCap || 0,
    dividendYield: (result.dividendYield || 0),
    lastDividend: result.dividendsData?.cashDividends?.[0]?.rate || 0,
    type: result.symbol.endsWith('11') ? 'FII' : 'ACAO',
    sparkline: generateSparkline(result.regularMarketPrice || 100),
});

// ─────────────────────────────────────────────
// API Calls
// ─────────────────────────────────────────────
export const fetchAssets = async (tickers = DEFAULT_TICKERS) => {
    try {
        const symbols = tickers.join(',');
        const { data } = await brapiClient.get(`/quote/${symbols}`, {
            params: { fundamentals: false, dividends: true, token: BRAPI_TOKEN },
        });

        if (!data?.results?.length) throw new Error('Empty API response');

        return data.results.map((r) => ({
            ...transformBrapiResult(r),
            sparkline: generateSparkline(r.regularMarketPrice),
        }));
    } catch (err) {
        console.warn('BRAPI unavailable, using mock data:', err.message);
        // Return mock data enriched with sparklines
        return MOCK_ASSETS.filter((a) => tickers.includes(a.ticker)).map((a) => ({
            ...a,
            sparkline: generateSparkline(a.currentPrice),
        }));
    }
};

export const searchAsset = async (query) => {
    try {
        const { data } = await brapiClient.get('/available', { params: { search: query, token: BRAPI_TOKEN } });
        // BRAPI returns an array of strings like: ["AAL", "ABCP11", ...]
        // We must map it so it matches component's props destructuration as SearchResult expects object { stock, name }
        return (data?.stocks || [])
            .slice(0, 8)
            .map((tickerStr) => ({ stock: tickerStr, name: tickerStr }));
    } catch {
        // Fallback: filter from known tickers
        const allKnown = [...DEFAULT_TICKERS, 'HGLG11', 'KNRI11', 'ITUB4', 'ABEV3', 'WEGE3', 'EGIE3'];
        return allKnown
            .filter((t) => t.includes(query.toUpperCase()))
            .map((t) => ({ stock: t, name: t }));
    }
};

// ─────────────────────────────────────────────
// Portfolio Metrics (using .reduce, .map, .filter)
// ─────────────────────────────────────────────
export const calculatePortfolioMetrics = (assets, positions = {}) => {
    if (!assets.length) return { totalValue: 0, totalChange: 0, totalChangePercent: 0, weightedDY: 0 };

    // Total portfolio value
    const totalValue = assets.reduce((sum, asset) => {
        const qty = positions[asset.ticker]?.qty || 1;
        return sum + asset.currentPrice * qty;
    }, 0);

    // Daily P&L
    const totalChange = assets.reduce((sum, asset) => {
        const qty = positions[asset.ticker]?.qty || 1;
        return sum + asset.change * qty;
    }, 0);

    const totalChangePercent = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;

    // Weighted Dividend Yield
    const weightedDY = assets.reduce((sum, asset) => {
        const weight = (asset.currentPrice / assets.reduce((s, a) => s + a.currentPrice, 0));
        return sum + asset.dividendYield * weight;
    }, 0);

    // Only FIIs
    const fiis = assets.filter((a) => a.type === 'FII');
    const fiiTotalDY = fiis.reduce((sum, a) => sum + a.dividendYield, 0);
    const avgFiiDY = fiis.length > 0 ? fiiTotalDY / fiis.length : 0;

    return {
        totalValue,
        totalChange,
        totalChangePercent,
        weightedDY,
        avgFiiDY,
        fiiCount: fiis.length,
        stockCount: assets.filter((a) => a.type === 'ACAO').length,
        etfCount: assets.filter((a) => a.type === 'ETF').length,
    };
};

// ─────────────────────────────────────────────
// Projection Engine (Phase 2)
// ─────────────────────────────────────────────
/**
 * Projects portfolio growth with monthly contributions + dividend reinvestment.
 *
 * @param {object} params
 * @param {number} params.initialValue      - Starting portfolio value (BRL)
 * @param {number} params.monthlyContrib    - Monthly aporte (BRL)
 * @param {number} params.annualReturn      - Expected annual capital appreciation (decimal, e.g. 0.10)
 * @param {number} params.dividendYield     - Annual dividend yield (decimal, e.g. 0.08)
 * @param {number} params.inflationRate     - Annual inflation (decimal, e.g. 0.045)
 * @param {number} params.dividendGrowth    - Annual dividend growth rate (decimal, e.g. 0.03)
 * @param {number} params.years             - Projection horizon in years
 * @param {boolean} params.reinvest         - Whether to reinvest dividends
 */
export const projectGrowth = ({
    initialValue = 10000,
    monthlyContrib = 1000,
    annualReturn = 0.10,
    dividendYield = 0.08,
    inflationRate = 0.045,
    dividendGrowth = 0.03,
    years = 10,
    reinvest = true,
}) => {
    const monthlyReturn = annualReturn / 12;
    const monthlyDY = dividendYield / 12;
    const monthlyInflation = inflationRate / 12;
    const monthlyDivGrowth = dividendGrowth / 12;

    let portfolio = initialValue;
    let currentDY = monthlyDY;
    const dataPoints = [{ month: 0, year: 0, nominal: initialValue, real: initialValue, dividends: 0, monthlyDividend: 0 }];

    let cumulativeDividends = 0;
    let inflationFactor = 1;

    for (let month = 1; month <= years * 12; month++) {
        // Capital appreciation
        portfolio *= 1 + monthlyReturn;

        // Monthly dividend
        const dividendIncome = portfolio * currentDY;
        cumulativeDividends += dividendIncome;

        // Reinvest dividends or take cash
        if (reinvest) {
            portfolio += dividendIncome;
        }

        // Monthly contribution
        portfolio += monthlyContrib;

        // Dividend yield grows over time
        currentDY *= 1 + monthlyDivGrowth;

        // Inflation adjustment
        inflationFactor *= 1 + monthlyInflation;

        // Only store yearly snapshots + milestones
        if (month % 12 === 0) {
            dataPoints.push({
                month,
                year: month / 12,
                nominal: Math.round(portfolio),
                real: Math.round(portfolio / inflationFactor),
                dividends: Math.round(cumulativeDividends),
                monthlyDividend: Math.round(portfolio * currentDY),
            });
        }
    }

    return dataPoints;
};

// Format currency BRL
export const formatCurrency = (value, compact = false) => {
    if (compact && Math.abs(value) >= 1_000_000) {
        return `R$ ${(value / 1_000_000).toFixed(2)}M`;
    }
    if (compact && Math.abs(value) >= 1_000) {
        return `R$ ${(value / 1_000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
    }).format(value);
};

export const formatPercent = (value) =>
    `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

export const formatVolume = (value) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
    return value.toString();
};
