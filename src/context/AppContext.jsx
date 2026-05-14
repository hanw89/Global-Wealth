import React, { useState, useEffect, useMemo } from 'react';
import { useExchangeRate } from '../hooks/useExchangeRate.js';
import { usePortfolio } from '../hooks/usePortfolio.js';
import { useMarketData } from '../hooks/useMarketData.js';
import { AppContext } from './AppContext.js';

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'light');
  const [currency, setCurrency] = useState(localStorage.getItem('app-currency') || 'USD');
  const [privacyMode, setPrivacyMode] = useState(false);

  // 1. Live Exchange Rate Synchronization
  const { data: liveRate, dataUpdatedAt: rateLastUpdated } = useExchangeRate();
  const exchangeRate = liveRate || 1350; 

  // 2. Global Portfolio Fetch (Used for background sync)
  const { data: portfolio } = usePortfolio(exchangeRate);
  const dbAssets = useMemo(() => portfolio?.dbAssets || [], [portfolio]);

  // 3. Global Background Market Data Sync Worker
  // This hook now acts as a singleton background worker
  const { isSyncing, lastUpdated: marketLastUpdated } = useMarketData(dbAssets);

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('app-currency', currency);
  }, [currency]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const togglePrivacyMode = () => setPrivacyMode(prev => !prev);

  const convertAmount = (amount, from, to) => {
    if (from === to) return amount;
    if (from === 'USD' && to === 'KRW') return amount * exchangeRate;
    if (from === 'KRW' && to === 'USD') return amount / exchangeRate;
    return amount;
  };

  return (
    <AppContext.Provider value={{ 
      theme, 
      setTheme, 
      toggleTheme, 
      currency, 
      setCurrency, 
      exchangeRate, 
      rateLastUpdated,
      convertAmount,
      privacyMode,
      togglePrivacyMode,
      isSyncing,
      marketLastUpdated
    }}>
      {children}
    </AppContext.Provider>
  );
};

