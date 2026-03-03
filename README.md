# 📈 Brazilian Fintech Dashboard & Projection Engine

A modern, high-performance financial dashboard built with **React**, **Vite**, and **Tailwind CSS**. Designed specifically for the Brazilian stock market (B3), this application allows investors to track real-time stock and REIT (FIIs) quotes, analyze portfolio dividends, and simulate long-term compound interest scenarios through an advanced graphical visualization engine.

![Tech Stack](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Exceptional Features

### 🔍 Live Tracking & Smart Search
- **Live B3 Quotes Pipeline:** Integrated with the Brapi API endpoints, rendering up-to-date data for Brazilian Tickers (`ACAO` and `FII`).
- **Real-Time Sparkline Charts:** Embedded micro-charts within Asset Cards featuring dynamic auto-scaling `YAxis` domains to correctly display minimal oscillation (volatility zoom) over the last 30 days without producing blank flat lines.
- **Visual Thresholds & Badges:** Instant visual awareness through dynamic styling. Assets automatically flip styles depending on the asset category or daily gain/loss percent status (Bull Greens vs Bear Reds vs FII Golds).

### 🚀 "Snowball" Projection Engine
A dedicated compound-interest calculation module modeling your path to financial independence:
- **Comprehensive Variables:** Tweak your initial lump sum, monthly contribution, capital ROI %, Expected Dividend Yield, Inflation adjustment, and Dividend Growth parameters.
- **Real vs. Nominal Returns:** Check exactly how much purchasing power you retain adjusted for projected inflation models using beautifully plotted `Recharts` area layers.
- **Dividend Reinvestment Protocol (DRIP):** Instant toggle switches rendering the "hockey stick" compound effect generated if you keep reinvesting the yielded dividends back to the bankroll seamlessly.

### 🎨 State-of-the-Art Aesthetic
- High-fidelity **Dark Mode Glassmorphism** design scheme using strict token structures powered by Tailwind Configs, delivering a premium "trading-station-like" user experience.

## 🛠️ Project Setup

1. **Clone the repository:**
```bash
git clone https://github.com/your-username/fintech-br-dashboard.git
```

2. **Navigate to the directory:**
```bash
cd fintech-br-dashboard
```

3. **Install Dependencies:**
```bash
npm install
```

4. **Run the local development server:**
```bash
npm run dev
```

The server usually starts at `http://localhost:5173`. 

*(Note: API tokens can be managed within `DashboardService.js` for higher production rate limits. It currently utilizes a safe fallback local mock generator if the public Brapi token bandwidth is exceeded).*

## 🤝 Contributing
Feel free to open issues or submit Pull Requests to expand tracking bounds, plug in different Market APIs, or refine charting models.

## 📄 License
This project is open-source and free to use under the MIT License.
