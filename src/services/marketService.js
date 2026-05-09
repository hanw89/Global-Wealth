const MASSIVE_API_KEY = 'fV5rCiX38dgg6NvC5HSA7OT72upRLBH7';
const BASE_URL = 'https://api.polygon.io';

/**
 * Massive Unified Market Service
 * Institutional grade real-time data for Stocks, Crypto, and Forex.
 * Optimized for Polygon.io Free Tier (5 requests per minute).
 */

// Simple Rate Limiter state
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 12500; // 12.5 seconds to safely stay under 5/min

const throttle = async () => {
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < MIN_REQUEST_INTERVAL) {
    const delay = MIN_REQUEST_INTERVAL - timeSinceLast;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  lastRequestTime = Date.now();
};

const fetchWithAuth = async (url) => {
  await throttle();
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${MASSIVE_API_KEY}`
    }
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 429) {
      throw new Error('Market data rate limit reached (Polygon Free Tier). Please wait.');
    }
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

/**
 * Normalizes tickers and handles hybrid formats like BTC.CRYPTO
 */
const normalizeTicker = (ticker, type) => {
  if (!ticker) return '';
  let cleaned = ticker.trim().toUpperCase();
  
  // Handle hybrid crypto tickers stored as stocks
  if (cleaned.endsWith('.CRYPTO')) {
    cleaned = cleaned.replace('.CRYPTO', '');
    return { symbol: cleaned, isCrypto: true };
  }
  
  // Basic heuristic for common cryptos labeled as stocks
  const commonCryptos = ['BTC', 'ETH', 'SOL', 'DOGE', 'XRP'];
  if (commonCryptos.includes(cleaned)) {
    return { symbol: cleaned, isCrypto: true };
  }

  return { symbol: cleaned, isCrypto: type === 'crypto' };
};

export const fetchExchangeRate = async () => {
  try {
    const data = await fetchWithAuth(`${BASE_URL}/v2/aggs/ticker/C:USDKRW/prev?adjusted=true`);
    const rate = data.results?.[0]?.c;
    return rate || 1450; 
  } catch (error) {
    console.error('Massive Forex Error:', error);
    return 1450; 
  }
};

export const fetchCryptoPrices = async (tickers = []) => {
  if (!tickers || tickers.length === 0) return {};
  
  const cryptoData = {};
  
  for (const ticker of tickers) {
    try {
      const { symbol } = normalizeTicker(ticker, 'crypto');
      // Map common names to symbols
      const mappedSymbol = symbol.replace('BITCOIN', 'BTC').replace('ETHEREUM', 'ETH');
      
      const data = await fetchWithAuth(`${BASE_URL}/v2/aggs/ticker/X:${mappedSymbol}USD/prev?adjusted=true`);
      
      const result = data.results?.[0];
      if (result) {
        cryptoData[ticker.toLowerCase()] = {
          price: result.c,
          usd: result.c,
          change: ((result.c - result.o) / result.o) * 100,
          usd_24h_change: ((result.c - result.o) / result.o) * 100
        };
      }
    } catch (error) {
      console.error(`Massive Crypto Error (${ticker}):`, error);
    }
  }

  return cryptoData;
};

export const fetchStockPrices = async (tickers = []) => {
  if (!tickers || tickers.length === 0) return {};
  
  const stockData = {};
  
  for (const ticker of tickers) {
    try {
      const { symbol, isCrypto } = normalizeTicker(ticker, 'stock');
      
      let data;
      if (isCrypto) {
        // Redirect hybrid tickers to Crypto API
        data = await fetchWithAuth(`${BASE_URL}/v2/aggs/ticker/X:${symbol}USD/prev?adjusted=true`);
      } else {
        data = await fetchWithAuth(`${BASE_URL}/v2/aggs/ticker/${symbol}/prev?adjusted=true`);
      }
      
      const result = data.results?.[0];
      if (result) {
        stockData[ticker] = { // Key by original ticker to ensure matching
          price: result.c,
          change: ((result.c - result.o) / result.o) * 100
        };
      }
    } catch (error) {
      console.error(`Massive Stock Error (${ticker}):`, error);
    }
  }

  return stockData;
};

export const fetchHistoricalForex = async () => {
  try {
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
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
