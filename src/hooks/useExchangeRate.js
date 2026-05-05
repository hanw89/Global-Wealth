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
    // Senior Implementation: Polling every 1 hour (3600000 ms)
    refetchInterval: 3600000, 
    staleTime: 3500000,
    refetchOnWindowFocus: true,
  });
};
