import React from 'react';
import { useAppContext } from '../context/AppContext.jsx';

const Settings = () => {
  const { theme, setTheme, currency, setCurrency, exchangeRate, setExchangeRate } = useAppContext();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <div className="border-b border-slate-100 dark:border-slate-700 px-6 py-4">
          <h2 className="text-lg font-medium text-slate-800 dark:text-white">General Settings</h2>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Theme Setting */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-white">Appearance</p>
              <p className="text-xs text-slate-500">Switch between light and dark mode</p>
            </div>
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-900 p-1">
              <button 
                onClick={() => setTheme('light')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${theme === 'light' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
              >
                Light
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${theme === 'dark' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
              >
                Dark
              </button>
            </div>
          </div>

          {/* Currency Setting */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-white">Base Currency</p>
              <p className="text-xs text-slate-500">Display all values in this currency</p>
            </div>
            <select 
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="USD">USD ($)</option>
              <option value="KRW">KRW (₩)</option>
            </select>
          </div>

          {/* Exchange Rate Setting */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-white">Manual Exchange Rate</p>
              <p className="text-xs text-slate-500">1 USD = ? KRW</p>
            </div>
            <input 
              type="number" 
              value={exchangeRate}
              onChange={(e) => setExchangeRate(Number(e.target.value))}
              className="w-32 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-white text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Data Export</h3>
        <p className="mt-1 text-xs text-slate-500">Download your financial data for backup or offline analysis.</p>
        <div className="mt-4 flex gap-3">
          <button className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Export as CSV
          </button>
          <button className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Export as JSON
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
