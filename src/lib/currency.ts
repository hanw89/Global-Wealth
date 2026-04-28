/**
 * Converts KRW to USD using a provided exchange rate.
 * In a real Next.js/Supabase app, this would fetch from the 'currency_rates' table.
 * 
 * @param krwAmount Amount in Korean Won
 * @param exchangeRate Current USD/KRW rate (defaulting to 1350)
 * @returns number Amount in USD
 */
export function convertKRWtoUSD(krwAmount: number, exchangeRate: number = 1350): number {
  if (exchangeRate <= 0) return 0;
  return krwAmount / exchangeRate;
}

/**
 * Example usage with Supabase (Conceptual):
 * 
 * export async function getTotalNetWorthInUSD(supabase: any) {
 *   const { data: assets } = await supabase.from('assets').select('*');
 *   const { data: rateData } = await supabase.from('currency_rates').select('rate').eq('pair', 'USD_KRW').single();
 *   const rate = rateData?.rate || 1350;
 * 
 *   return assets.reduce((total, asset) => {
 *     if (asset.currency === 'USD') return total + calculateAssetValue(asset);
 *     return total + convertKRWtoUSD(calculateAssetValue(asset), rate);
 *   }, 0);
 * }
 */
