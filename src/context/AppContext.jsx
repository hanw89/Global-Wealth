import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchExchangeRate } from '../services/marketService.js';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'light');
  const [currency, setCurrency] = useState(localStorage.getItem('app-currency') || 'USD');
  const [exchangeRate, setExchangeRate] = useState(1350); // Initial placeholder
  const [privacyMode, setPrivacyMode] = useState(false);

  useEffect(() => {
    // Fetch live rate on mount
    const updateRate = async () => {
      const rate = await fetchExchangeRate();
      setExchangeRate(rate);
    };
    updateRate();
  }, []);

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
      setExchangeRate,
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
