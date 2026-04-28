const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
// For demo purposes, we use a placeholder or public key. 
// In production, these should be in .env (e.g., VITE_POLYGON_API_KEY)
const POLYGON_API_KEY = import.meta.env.VITE_POLYGON_API_KEY || 'demo_key';
/**
 * Fetches live exchange rates (USD to KRW)
 */
export const fetchExchangeRate = async () => {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!response.ok) throw new Error('Failed to fetch exchange rates');
    const data = await response.json();
    return data.rates.KRW || 1350;
  } catch (error) {
    console.error('Exchange Rate Fetch Error:', error);
    return 1350; // Fallback
  }
};

/**
 * Fetches crypto prices from CoinGecko
...

 * @param {string[]} ids - CoinGecko IDs (e.g., ['bitcoin', 'ethereum'])
 */
export const fetchCryptoPrices = async (ids = ['bitcoin', 'ethereum', 'solana']) => {
  try {
    const response = await fetch(
      `${COINGECKO_BASE}/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`
    );
    
    if (response.status === 429) {
      throw new Error('Crypto API rate limit exceeded');
    }
    
    if (!response.ok) throw new Error('Failed to fetch crypto prices');
    
    return await response.json();
  } catch (error) {
    console.error('Crypto Fetch Error:', error);
    throw error;
  }
};

/**
 * Fetches stock prices from Polygon.io
 * @param {string[]} tickers - Stock tickers (e.g., ['AAPL', 'TSLA'])
 */
export const fetchStockPrices = async (tickers = ['AAPL', 'TSLA', 'NVDA', 'VOO']) => {
  try {
    // Note: Free tier Polygon.io often requires individual calls or specific endpoints
    // For this implementation, we simulate the structure.
    const promises = tickers.map(ticker => 
      fetch(`https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${POLYGON_API_KEY}`)
        .then(res => {
          if (res.status === 429) throw new Error('Stock API rate limit exceeded');
          return res.json();
        })
    );

    // Mock Fallback for UI visibility if API fails or key is missing
    const results = await Promise.all(promises).catch(() => tickers.map(t => ({ 
      results: [{ c: Math.random() * 200 + 50, o: Math.random() * 200 + 50 }] 
    })));
    
    const stockData = {};
    results.forEach((res, index) => {
      const ticker = tickers[index];
      if (res.results && res.results[0]) {
        const data = res.results[0];
        stockData[ticker] = {
          price: data.c,
          change: ((data.c - data.o) / data.o) * 100
        };
      } else {
        // Ultimate fallback
        stockData[ticker] = { price: 150.00, change: 1.5 };
      }
    });

    return stockData;
  } catch (error) {
    console.error('Stock Fetch Error:', error);
    throw error;
  }
};
