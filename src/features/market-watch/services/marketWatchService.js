import { fetchCryptoPrices, fetchStockPrices } from '../../../services/marketService.js';

/**
 * Market Watch Service
 * Handles portfolio calculations and live market data.
 */

export const getPortfolioValue = async (holdings) => {
  const stockTickers = holdings.filter(h => h.type === 'stock').map(h => h.ticker);
  const cryptoIds = holdings.filter(h => h.type === 'crypto').map(h => h.id);

  try {
    const [cryptoData, stockData] = await Promise.all([
      cryptoIds.length ? fetchCryptoPrices(cryptoIds) : Promise.resolve({}),
      stockTickers.length ? fetchStockPrices(stockTickers) : Promise.resolve({})
    ]);

    let totalValueUsd = 0;
    let cryptoValueChange = 0;
    let cryptoInitialValue = 0;

    const detailedHoldings = holdings.map(holding => {
      let price = 0;
      let change = 0;
      let value = 0;

      if (holding.type === 'stock') {
        const data = stockData[holding.ticker] || { price: 0, change: 0 };
        price = data.price;
        change = data.change;
        value = price * holding.amount;
      } else if (holding.type === 'crypto') {
        const data = cryptoData[holding.id] || { usd: 0, usd_24h_change: 0 };
        price = data.usd;
        change = data.usd_24h_change;
        value = price * holding.amount;
        
        cryptoInitialValue += value / (1 + change / 100);
        cryptoValueChange += value - (value / (1 + change / 100));
      }

      totalValueUsd += value;

      return {
        ...holding,
        price,
        change,
        value
      };
    });

    // Calculate Crypto Volatility
    const cryptoAvgVolatility = cryptoInitialValue > 0 ? (cryptoValueChange / cryptoInitialValue) * 100 : 0;
    const isVolatile = Math.abs(cryptoAvgVolatility) > 5;

    return {
      totalValueUsd,
      holdings: detailedHoldings,
      isVolatile,
      volatility: cryptoAvgVolatility
    };
  } catch (error) {
    console.error('Market Watch Error:', error);
    throw error;
  }
};
