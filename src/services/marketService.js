import { supabase } from '../lib/supabaseClient';

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price';
const CURRENCY_API_URL = 'https://open.er-api.com/v6/latest/USD';

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

/**
 * Invoke Supabase Edge Function for Stock Prices (Yahoo Finance Proxy)
 */
const invokeMarketProxy = async (tickers) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const response = await fetch(`${supabaseUrl}/functions/v1/market-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'apikey': supabaseAnonKey
    },
    body: JSON.stringify({ tickers })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Market Proxy Failed');
  }
  return await response.json();
};

/**
 * Fetch from CoinGecko (Batching)
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
  // 1. Normalize and Group
  const normalizedAssets = assets.map(a => ({
    ...a,
    cleanTicker: a.ticker.replace('.CRYPTO', '').toUpperCase(),
    effectiveType: (a.type === 'Crypto' || a.ticker.includes('.CRYPTO')) ? 'Crypto' : 'Stock'
  }));

  const cryptos = normalizedAssets.filter(a => a.effectiveType === 'Crypto');
  const stocks = normalizedAssets.filter(a => a.effectiveType === 'Stock');

  // 2. Batch Update Cryptos
  if (cryptos.length > 0) {
    const tickers = cryptos.map(c => c.cleanTicker);
    const priceMap = await fetchCryptoPricesBatch(tickers);
    
    for (const asset of cryptos) {
      const data = priceMap[asset.cleanTicker];
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

  // 3. Batch Update Stocks (Ultra Fast via Edge Function)
  if (stocks.length > 0) {
    try {
      const tickers = stocks.map(s => s.cleanTicker);
      const priceMap = await invokeMarketProxy(tickers);
      
      for (const asset of stocks) {
        const data = priceMap[asset.cleanTicker];
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
    } catch (error) {
      console.error('Stock Batch Update Error:', error.message);
    }
  }
};

/**
 * Fetch Current Exchange Rate (USD to KRW)
 */
export const fetchExchangeRate = async () => {
  try {
    const response = await fetch(CURRENCY_API_URL);
    const data = await response.json();
    return data.rates?.KRW || 1450;
  } catch (error) {
    console.error('Exchange Rate Error:', error);
    return 1450;
  }
};

/**
 * Fetch Historical Forex (Fallback to placeholder for now, or use another free API)
 */
export const fetchHistoricalForex = async () => {
  // open.er-api.com doesn't provide history. 
  // We'll return empty for now as requested to focus on "live" data speed.
  return [];
};

// Compatibility Exports
export const fetchCryptoPrices = async (tickers = []) => {
  const priceMap = await fetchCryptoPricesBatch(tickers);
  const results = {};
  Object.keys(priceMap).forEach(ticker => {
    results[ticker] = { usd: priceMap[ticker].price, usd_24h_change: priceMap[ticker].change };
    results[ticker.toLowerCase()] = results[ticker];
  });
  return results;
};

export const fetchStockPrices = async (tickers = []) => {
  if (tickers.length === 0) return {};
  try {
    return await invokeMarketProxy(tickers);
  } catch (error) {
    console.error('Stock Price Fetch Error:', error);
    return {};
  }
};

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
    try {
      const priceMap = await invokeMarketProxy([ticker]);
      const data = priceMap[ticker.toUpperCase()];
      if (data) {
        await supabase.from('assets').update({
          current_price: data.price,
          price_change_24h: data.change,
          last_price_at: new Date().toISOString()
        }).eq('id', assetId);
        return data;
      }
    } catch (error) {
      console.error('Single Stock Update Error:', error);
    }
  }
  return null;
};
