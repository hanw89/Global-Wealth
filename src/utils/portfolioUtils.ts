import { Asset, LivePriceMap } from '../types/database';

/**
 * Calculates the total value of the portfolio in USD.
 * 
 * @param holdings - Array of asset holdings from the database
 * @param livePrices - Map of ticker symbols to their current market price
 * @returns Total portfolio value in USD
 */
export const calculateTotalPortfolioValue = (
  holdings: Asset[],
  livePrices: LivePriceMap
): number => {
  return holdings.reduce((total, holding) => {
    // Get live price for the ticker, fallback to average buy price if unavailable
    const currentPrice = livePrices[holding.ticker_symbol] || 0;
    const holdingValue = currentPrice * holding.quantity;
    
    return total + holdingValue;
  }, 0);
};

/**
 * Alternative version that specifically maps through and handles potential 
 * currency or asset-specific logic if needed in the future.
 */
export const getDetailedPortfolioSummary = (
  holdings: Asset[],
  livePrices: LivePriceMap
) => {
  return holdings.map(holding => {
    const livePrice = livePrices[holding.ticker_symbol] || 0;
    const currentValue = livePrice * holding.quantity;
    const costBasis = holding.average_buy_price * holding.quantity;
    const gainLoss = currentValue - costBasis;
    const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

    return {
      ...holding,
      livePrice,
      currentValue,
      gainLoss,
      gainLossPercent
    };
  });
};
