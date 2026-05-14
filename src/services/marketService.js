const MASSIVE_API_KEY = 'fV5rCiX38dgg6NvC5HSA7OT72upRLBH7';
const BASE_URL = 'https://api.polygon.io';
const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price';
import { supabase } from '../lib/supabaseClient';

/**
 * Massive Unified Market Service - ULTRA FAST VERSION
 * Optimized: Cryptos use CoinGecko (Batching), Stocks use Polygon (Throttled).
 */

// Ticker to CoinGecko ID mapping
const COINGECKO_MAP = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'DOGE': 'dogecoin',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'DOT': 'polkadot',
  'MATIC': 'matic-network',
  'LINK': 'chainlink',
  'USDT': 'tether',
  'USDC': 'usd-coin',
  'BNB': 'binancecoin',
  'AVAX': 'avalanche-2',
  'LTC': 'litecoin',
  'UNI': 'uniswap',
  'ATOM': 'cosmos',
  'ALGO': 'algorand',
  'XLM': 'stellar',
  'FIL': 'filecoin',
  'ICP': 'internet-computer'
};

// Rate Limiter for Polygon ONLY
let lastPolygonRequestTime = 0;
const MIN_POLYGON_INTERVAL = 12500; 
let polygonThrottlePromise = Promise.resolve();

const throttlePolygon = () => {
  const currentPromise = polygonThrottlePromise;
  polygonThrottlePromise = (async () => {
    await currentPromise;
    const now = Date.now();
    const timeSinceLast = now - lastPolygonRequestTime;
    if (timeSinceLast < MIN_POLYGON_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, MIN_POLYGON_INTERVAL - timeSinceLast));
    }
    lastPolygonRequestTime = Date.now();
  })();
  return polygonThrottlePromise;
};

/**
 * Fetch from CoinGecko (No 12s throttle, much higher limits)
 */
export const fetchCryptoPricesBatch = async (tickers = []) => {
  if (tickers.length === 0) return {};
  try {
    const ids = tickers.map(t => COINGECKO_MAP[t.toUpperCase()] || t.toLowerCase()).join(',');
    const response = await fetch(`${COINGECKO_URL}?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
    const data = await response.json();
    
    const results = {};
    tickers.forEach(ticker => {
      const id = COINGECKO_MAP[ticker.toUpperCase()] || ticker.toLowerCase();
      const priceData = data[id];
      if (priceData) {
        results[ticker.toUpperCase()] = {
          price: priceData.usd,
          change: priceData.usd_24h_change
        };
      }
    });
    return results;
  } catch (error) {
    console.error('CoinGecko Batch Error:', error);
    return {};
  }
};

/**
 * Update Multiple Assets in DB
 */
export const updateAssetsInDB = async (assets) => {
  // 1. Group by Type
  const cryptos = assets.filter(a => a.type === 'Crypto');
  const stocks = assets.filter(a => a.type === 'Stock');

  // 2. Batch Update Cryptos (FAST)
  if (cryptos.length > 0) {
    const tickers = cryptos.map(c => c.ticker);
    const priceMap = await fetchCryptoPricesBatch(tickers);
    
    for (const asset of cryptos) {
      const data = priceMap[asset.ticker.toUpperCase()];
      if (data) {
        await supabase
          .from('assets')
          .update({
            current_price: data.price,
            price_change_24h: data.change,
            last_price_at: new Date().toISOString()
          })
          .eq('id', asset.id);
      }
    }
  }

  // 3. Sequential Update Stocks (POLYGON RATE LIMIT)
  for (const asset of stocks) {
    try {
      await throttlePolygon();
      const url = `${BASE_URL}/v2/aggs/ticker/${asset.ticker.toUpperCase()}/prev?adjusted=true`;
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${MASSIVE_API_KEY}` } });
      const data = await response.json();
      const result = data.results?.[0];

      if (result) {
        const price = result.c;
        const change = ((result.c - result.o) / result.o) * 100;

        await supabase
          .from('assets')
          .update({
            current_price: price,
            price_change_24h: change,
            last_price_at: new Date().toISOString()
          })
          .eq('id', asset.id);
      }
    } catch (error) {
      console.error(`Stock Update Error (${asset.ticker}):`, error.message);
    }
  }
};

export const fetchExchangeRate = async () => {
  try {
    await throttlePolygon();
    const data = await (await fetch(`${BASE_URL}/v2/aggs/ticker/C:USDKRW/prev?adjusted=true`, {
      headers: { 'Authorization': `Bearer ${MASSIVE_API_KEY}` }
    })).json();
    return data.results?.[0]?.c || 1450;
  } catch (error) {
    return 1450;
  }
};

// Legacy support for single asset update
export const updateAssetPriceInDB = async (assetId, ticker, type) => {
  if (type === 'Crypto') {
    const priceMap = await fetchCryptoPricesBatch([ticker]);
    const data = priceMap[ticker.toUpperCase()];
    if (data) {
      await supabase.from('assets').update({
        current_price: data.price,
        price_change_24h: data.change,
        last_price_at: new Date().toISOString()
      }).eq('id', assetId);
      return data;
    }
  } else {
    // Stock logic... (throttled)
    await throttlePolygon();
    const url = `${BASE_URL}/v2/aggs/ticker/${ticker.toUpperCase()}/prev?adjusted=true`;
    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${MASSIVE_API_KEY}` } });
    const data = await response.json();
    const result = data.results?.[0];
    if (result) {
      const price = result.c;
      const change = ((result.c - result.o) / result.o) * 100;
      await supabase.from('assets').update({
        current_price: price,
        price_change_24h: change,
        last_price_at: new Date().toISOString()
      }).eq('id', assetId);
      return { price, change };
    }
  }
  return null;
};
