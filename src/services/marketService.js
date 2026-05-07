const MASSIVE_API_KEY = 'fV5rCiX38dgg6NvC5HSA7OT72upRLBH7';
const BASE_URL = 'https://api.polygon.io'; // Massive uses Polygon's architecture

/**
 * Massive Unified Market Service
 * Institutional grade real-time data for Stocks, Crypto, and Forex.
 */

const fetchWithAuth = async (url) => {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${MASSIVE_API_KEY}`
    }
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const fetchExchangeRate = async () => {
  try {
    // Massive Forex Snapshot (USD/KRW)
    const data = await fetchWithAuth(`${BASE_URL}/v2/aggs/ticker/C:USDKRW/prev?adjusted=true`);
    const rate = data.results?.[0]?.c;
    return rate || 1450; // Fallback if data missing
  } catch (error) {
    console.error('Massive Forex Error:', error);
    return 1450; 
  }
};

export const fetchCryptoPrices = async (tickers = []) => {
  if (!tickers || tickers.length === 0) return {};
  
  const cryptoData = {};
  
  // Massive handles crypto via X:SYMBOLUSD format
  await Promise.all(tickers.map(async (ticker) => {
    try {
      // Map common names to symbols if necessary (or assume tickers are passed)
      const symbol = ticker.toUpperCase().replace('BITCOIN', 'BTC').replace('ETHEREUM', 'ETH');
      const data = await fetchWithAuth(`${BASE_URL}/v2/aggs/ticker/X:${symbol}USD/prev?adjusted=true`);
      
      const result = data.results?.[0];
      if (result) {
        cryptoData[ticker.toLowerCase()] = {
          usd: result.c,
          usd_24h_change: ((result.c - result.o) / result.o) * 100
        };
      }
    } catch (error) {
      console.error(`Massive Crypto Error (${ticker}):`, error);
    }
  }));

  return cryptoData;
};

export const fetchStockPrices = async (tickers = []) => {
  if (!tickers || tickers.length === 0) return {};
  
  const stockData = {};
  
  await Promise.all(tickers.map(async (ticker) => {
    try {
      const data = await fetchWithAuth(`${BASE_URL}/v2/aggs/ticker/${ticker.toUpperCase()}/prev?adjusted=true`);
      
      const result = data.results?.[0];
      if (result) {
        stockData[ticker.toUpperCase()] = {
          price: result.c,
          change: ((result.c - result.o) / result.o) * 100
        };
      }
    } catch (error) {
      console.error(`Massive Stock Error (${ticker}):`, error);
    }
  }));

  return stockData;
};

/**
 * Fetches historical forex data using Massive Aggregates
 */
export const fetchHistoricalForex = async () => {
  try {
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Last 90 days
    
    const data = await fetchWithAuth(`${BASE_URL}/v2/aggs/ticker/C:USDKRW/range/1/day/${from}/${to}?adjusted=true&sort=asc`);
    
    return (data.results || []).map(r => ({
      date: new Date(r.t).toISOString().split('T')[0],
      close: r.c
    }));
  } catch (error) {
    console.error('Massive Historical Forex Error:', error);
    return [];
  }
};
