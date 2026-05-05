import React, { createContext, useContext, useState, useEffect } from 'react';
import { useExchangeRate } from '../hooks/useExchangeRate.js';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'light');
  const [currency, setCurrency] = useState(localStorage.getItem('app-currency') || 'USD');
  const [privacyMode, setPrivacyMode] = useState(false);

  // Live Exchange Rate Synchronization
  const { data: liveRate, dataUpdatedAt: rateLastUpdated } = useExchangeRate();
  const exchangeRate = liveRate || 1350; // Fallback to baseline

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
      togglePrivacyMode
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
