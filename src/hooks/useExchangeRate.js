import { useQuery } from '@tanstack/react-query';
import { fetchExchangeRate } from '../services/marketService.js';

/**
 * Senior Fintech Hook: useExchangeRate
 * Fetches live USD/KRW exchange rate with an hourly refresh cycle.
 */
export const useExchangeRate = () => {
  return useQuery({
    queryKey: ['exchange-rate-live'],
    queryFn: fetchExchangeRate,
    // Senior Implementation: Polling every 12 hours (43200000 ms)
    refetchInterval: 43200000, 
    staleTime: 43100000,
    refetchOnWindowFocus: true,
  });
};
