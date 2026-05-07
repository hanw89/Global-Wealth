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

export const fetchCryptoPrices = async (ids = []) => {
  if (!ids || ids.length === 0) return {};
  try {
    const response = await fetch(
      `${COINGECKO_BASE}/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`
    );
    if (response.status === 429) {
      console.warn('Crypto API rate limit exceeded');
      return {};
    }
    if (!response.ok) throw new Error('Failed to fetch crypto prices');
    return await response.json();
  } catch (error) {
    console.error('Crypto Fetch Error:', error);
    return {};
  }
};

/**
 * Live Stock Fetcher (using Yahoo Finance via AllOrigins Proxy)
 * This bypasses CORS and provides real-time data as requested.
 */
export const fetchStockPrices = async (tickers = []) => {
  if (!tickers || tickers.length === 0) return {};
  
  const stockData = {};
  
  // Parallel fetch for efficiency
  await Promise.all(tickers.map(async (ticker) => {
    try {
      // Use AllOrigins as a reliable CORS proxy
      const encodedUrl = encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d`);
      const response = await fetch(`https://api.allorigins.win/get?url=${encodedUrl}`);
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (!data.contents) throw new Error('No contents found in proxy response');
      
      const contents = JSON.parse(data.contents);
      const result = contents.chart.result?.[0];
      
      if (result) {
        const price = result.meta.regularMarketPrice;
        const prevClose = result.meta.chartPreviousClose;
        const change = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
        
        stockData[ticker] = {
          price,
          change
        };
      } else {
        console.warn(`No data found for ticker: ${ticker}`);
        stockData[ticker] = { price: 0, change: 0 };
      }
    } catch (error) {
      console.error(`Error fetching price for ${ticker}:`, error);
      stockData[ticker] = { price: 0, change: 0 };
    }
  }));

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
