const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

/**
 * Senior Fintech Service: Market Data
 * Refactored for Browser compatibility (Vite/React).
 * Note: Pure client-side stock APIs are limited by CORS. 
 * We use a simulation with stochastic drift for Stock data in this demo.
 */

export const fetchExchangeRate = async () => {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!response.ok) throw new Error('Failed to fetch exchange rates');
    const data = await response.json();
    return data.rates.KRW || 1350;
  } catch (error) {
    console.error('Exchange Rate Fetch Error:', error);
    return 1350; 
  }
};

export const fetchCryptoPrices = async (ids = ['bitcoin', 'ethereum', 'solana']) => {
  try {
    const response = await fetch(
      `${COINGECKO_BASE}/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`
    );
    if (response.status === 429) throw new Error('Crypto API rate limit exceeded');
    if (!response.ok) throw new Error('Failed to fetch crypto prices');
    return await response.json();
  } catch (error) {
    console.error('Crypto Fetch Error:', error);
    throw error;
  }
};

/**
 * Simulated Stock Fetcher (Browser Compatible)
 * In a production app, this would call a secure backend proxy.
 */
export const fetchStockPrices = async (tickers = []) => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 500));

  const stockData = {};
  const mockReference = {
    'AAPL': { p: 185.40, c: 1.2 },
    'TSLA': { p: 210.15, c: -2.4 },
    'NVDA': { p: 485.20, c: 4.8 },
    'VOO': { p: 450.10, c: 0.5 },
  };

  tickers.forEach(ticker => {
    const ref = mockReference[ticker] || { p: 150.00, c: 0.0 };
    // Add small random movement for "live" feel
    const volatility = (Math.random() - 0.5) * 0.2;
    stockData[ticker] = {
      price: ref.p + volatility,
      change: ref.c + (volatility / ref.p) * 100
    };
  });

  return stockData;
};

/**
 * Fetches historical exchange rates (Simulated for Browser stability)
 */
export const fetchHistoricalForex = async () => {
  const mockData = [];
  const baseRate = 1320;
  const now = new Date();
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (365 - i));
    
    // Create a realistic-looking random walk
    const drift = Math.sin(i / 20) * 40;
    const noise = (Math.random() - 0.5) * 10;
    
    mockData.push({
      date: date.toISOString().split('T')[0],
      close: baseRate + drift + noise
    });
  }
  return mockData;
};
