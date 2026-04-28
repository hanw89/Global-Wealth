import { useState, useEffect, useCallback } from 'react';
import { fetchCryptoPrices, fetchStockPrices } from '../services/marketService';

export const usePriceTracker = (options = { stocks: ['AAPL', 'TSLA', 'NVDA', 'VOO'], cryptos: ['bitcoin', 'ethereum'] }) => {
  const [prices, setPrices] = useState({ stocks: {}, cryptos: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const updatePrices = useCallback(async () => {
    try {
      // setError(null); // Clear previous errors on retry
      
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

      setPrices(prev => ({
        cryptos: cryptoData || prev.cryptos,
        stocks: stockData || prev.stocks
      }));
      
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [options.cryptos, options.stocks]);

  useEffect(() => {
    updatePrices(); // Initial fetch

    const intervalId = setInterval(() => {
      updatePrices();
    }, 60000); // 60 seconds

    return () => clearInterval(intervalId);
  }, [updatePrices]);

  return { prices, loading, error, lastUpdated, refresh: updatePrices };
};
