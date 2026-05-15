import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

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

      // 3. Financial Calculations
      const FX_RATE = globalExchangeRate || 1350; 
      let monthlyCashFlow = 0;

      // Calculate Cash Flow (Convert KRW to USD)
      dbRentals.forEach(rental => {
        monthlyCashFlow += ((rental.monthly_amount_krw || 0) / FX_RATE);
      });

      return {
        monthlyCashFlow,
        exchangeRateUsed: FX_RATE,
        dbAssets,
        dbRentals,
        lastUpdated: new Date().toISOString()
      };
    },
    refetchInterval: 300000, // 5 minutes
    staleTime: 240000,
  });
};
