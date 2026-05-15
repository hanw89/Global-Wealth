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
  
  console.log('Invoking market-proxy for:', tickers);
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
    const errorText = await response.text();
    console.error('Market Proxy HTTP Error:', response.status, errorText);
    throw new Error('Market Proxy Failed');
  }
  const result = await response.json();
  console.log('Market Proxy Result:', result);
  return result;
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
      if (data[id]) {
        results[ticker.toUpperCase()] = {
          price: data[id].usd,
          change: data[id].usd_24h_change || 0
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
  console.log('updateAssetsInDB started with:', assets.length, 'assets');
  
  // 1. Normalize and Group
  const normalizedAssets = assets.map(a => ({
    ...a,
    cleanTicker: (a.ticker || '').replace('.CRYPTO', '').trim().toUpperCase(),
    effectiveType: (a.type === 'Crypto' || (a.ticker || '').includes('.CRYPTO')) ? 'Crypto' : 'Stock'
  }));

  const cryptos = normalizedAssets.filter(a => a.effectiveType === 'Crypto');
  const stocks = normalizedAssets.filter(a => a.effectiveType === 'Stock');

  console.log(`Sync Groups - Cryptos: ${cryptos.length}, Stocks: ${stocks.length}`);

  // 2. Batch Update Cryptos
  if (cryptos.length > 0) {
    try {
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
    } catch (error) {
      console.error('Crypto Batch Update Error:', error);
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
          console.log(`Updating DB for ${asset.cleanTicker}: ${data.price}`);
          await supabase
            .from('assets')
            .update({
              current_price: data.price,
              price_change_24h: data.change,
              last_price_at: new Date().toISOString()
            })
            .eq('id', asset.id);
        } else {
          console.warn(`No data for stock: ${asset.cleanTicker}`);
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
 * Fetch Historical Forex
 */
export const fetchHistoricalForex = async () => {
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
  const cleanTicker = (ticker || '').replace('.CRYPTO', '').trim().toUpperCase();
  if (type === 'Crypto' || (ticker || '').includes('.CRYPTO')) {
    const priceMap = await fetchCryptoPricesBatch([cleanTicker]);
    const data = priceMap[cleanTicker];
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
      const priceMap = await invokeMarketProxy([cleanTicker]);
      const data = priceMap[cleanTicker];
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
