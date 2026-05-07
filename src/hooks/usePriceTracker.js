import { useQuery } from '@tanstack/react-query';
import { fetchCryptoPrices, fetchStockPrices } from '../services/marketService';

export const usePriceTracker = (options = { stocks: ['AAPL', 'TSLA', 'NVDA', 'VOO'], cryptos: ['bitcoin', 'ethereum'] }) => {
  const { data, isLoading, error, dataUpdatedAt, refetch } = useQuery({
    queryKey: ['market-prices', options.stocks, options.cryptos],
    queryFn: async () => {
      const [cryptoData, stockData] = await Promise.all([
        fetchCryptoPrices(options.cryptos).catch(err => {
          console.warn('Crypto fetch failed:', err.message);
          return null;
        }),
        fetchStockPrices(options.stocks).catch(err => {
          console.warn('Stock fetch failed:', err.message);
          return null;
        })
      ]);

      return {
        cryptos: cryptoData || {},
        stocks: stockData || {}
      };
    },
    refetchInterval: 60000, // 60 seconds
    staleTime: 55000,
  });

  return { 
    prices: data || { stocks: {}, cryptos: {} }, 
    loading: isLoading, 
    error: error?.message || null, 
    lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : null, 
    refresh: refetch 
  };
};
