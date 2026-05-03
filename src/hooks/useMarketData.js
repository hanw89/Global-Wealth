import { useQuery } from '@tanstack/react-query';
import { fetchCryptoPrices, fetchStockPrices } from '../services/marketService.js';

/**
 * Senior Fintech Hook: useMarketData
 * Implements a high-reliability polling strategy with stale-while-revalidate logic.
 */
export const useMarketData = (stockTickers = [], cryptoIds = []) => {
  return useQuery({
    queryKey: ['marketData', stockTickers, cryptoIds],
    queryFn: async () => {
      const [stocks, cryptos] = await Promise.all([
        stockTickers.length ? fetchStockPrices(stockTickers) : Promise.resolve({}),
        cryptoIds.length ? fetchCryptoPrices(cryptoIds) : Promise.resolve({}),
      ]);

      return {
        stocks,
        cryptos,
        timestamp: new Date().toISOString(),
      };
    },
    // Senior Implementation: Polling every 60 seconds
    refetchInterval: 60000, 
    // Optimization: Keep previous data while fetching to prevent UI flickering
    placeholderData: (previousData) => previousData,
  });
};
