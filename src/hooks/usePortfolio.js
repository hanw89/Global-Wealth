import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { fetchCryptoPrices, fetchStockPrices } from '../services/marketService.js';

/**
 * Senior Fintech Hook: usePortfolio
 * Orchestrates global asset state, live valuations, and cash flow analysis.
 */
export const usePortfolio = (globalExchangeRate) => {
  return useQuery({
    queryKey: ['portfolio-unified'],
    queryFn: async () => {
      // 1. Fetch User Session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      // 2. Parallel Fetch: Database Records
      const [assetsResponse, rentalsResponse] = await Promise.all([
        supabase.from('assets').select('*').eq('user_id', user.id),
        supabase.from('rental_income').select('*').eq('user_id', user.id)
      ]);

      if (assetsResponse.error) throw assetsResponse.error;
      if (rentalsResponse.error) throw rentalsResponse.error;

      const dbAssets = assetsResponse.data || [];
      const dbRentals = rentalsResponse.data || [];

      // 3. Parallel Fetch: Market Data
      const stockTickers = dbAssets.filter(a => a.type.toLowerCase() === 'stock').map(a => a.ticker);
      const cryptoTickers = dbAssets.filter(a => a.type.toLowerCase() === 'crypto').map(a => a.ticker.toLowerCase());

      // Note: Mapping tickers to CoinGecko IDs if necessary (simplified for this hook)
      const cryptoIds = cryptoTickers.map(t => {
        if (t === 'btc') return 'bitcoin';
        if (t === 'eth') return 'ethereum';
        if (t === 'sol') return 'solana';
        return t;
      });

      const [stockPrices, cryptoPrices] = await Promise.all([
        fetchStockPrices(stockTickers).catch(() => ({})),
        fetchCryptoPrices(cryptoIds).catch(() => ({})),
      ]);

      // 4. Financial Calculations
      const FX_RATE = globalExchangeRate || 1350; 

      let stockValue = 0;
      let cryptoValue = 0;
      let monthlyCashFlow = 0;

      // Calculate Assets
      dbAssets.forEach(asset => {
        const type = asset.type.toLowerCase();
        if (type === 'stock') {
          // Key might be original ticker or normalized uppercase
          const price = (stockPrices?.[asset.ticker] || stockPrices?.[asset.ticker.toUpperCase()])?.price || 0;
          stockValue += price * (asset.quantity || 0);
        } else if (type === 'crypto') {
          // Normalize CoinGecko response
          const id = asset.ticker.toLowerCase() === 'btc' ? 'bitcoin' : 
                     asset.ticker.toLowerCase() === 'eth' ? 'ethereum' : 
                     asset.ticker.toLowerCase() === 'sol' ? 'solana' : asset.ticker.toLowerCase();
          const price = cryptoPrices?.[id]?.usd || 0;
          cryptoValue += price * (asset.quantity || 0);
        }
      });

      // Calculate Cash Flow (Convert KRW to USD)
      dbRentals.forEach(rental => {
        monthlyCashFlow += ((rental.monthly_amount_krw || 0) / FX_RATE);
      });

      const totalValue = stockValue + cryptoValue;

      return {
        totalValue,
        stockValue,
        cryptoValue,
        monthlyCashFlow,
        exchangeRateUsed: FX_RATE,
        dbAssets,
        dbRentals,
        lastUpdated: new Date().toISOString()
      };
    },
    refetchInterval: 21600000, // 6 hours
    staleTime: 21500000,
  });
};
