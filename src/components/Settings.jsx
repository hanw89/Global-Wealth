import React from 'react';
import { useAppContext } from '../context/AppContext.js';

const Settings = () => {
  const { theme, setTheme, currency, setCurrency, exchangeRate, setExchangeRate } = useAppContext();

  return (
    <div className="mx-auto max-w-2xl font-sans">
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="border-b border-white/5 px-6 py-4">
          <h2 className="text-lg font-medium text-white">General Settings</h2>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Theme Setting */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Appearance</p>
              <p className="text-xs text-slate-500">Switch between light and dark mode</p>
            </div>
            <div className="flex rounded-lg bg-black/40 p-1 border border-white/5">
              <button 
                onClick={() => setTheme('light')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${theme === 'light' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Light
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${theme === 'dark' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Dark
              </button>
            </div>
          </div>

          {/* Currency Setting */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Base Currency</p>
              <p className="text-xs text-slate-500">Display all values in this currency</p>
            </div>
            <select 
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
            >
              <option value="USD" className="bg-[#0a0a0c]">USD ($)</option>
              <option value="KRW" className="bg-[#0a0a0c]">KRW (₩)</option>
            </select>
          </div>

          {/* Exchange Rate Setting */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Manual Exchange Rate</p>
              <p className="text-xs text-slate-500">1 USD = ? KRW</p>
            </div>
            <input 
              type="number" 
              value={exchangeRate}
              onChange={(e) => setExchangeRate(Number(e.target.value))}
              className="w-32 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white text-right focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl">
        <h3 className="text-sm font-semibold text-white">Data Export</h3>
        <p className="mt-1 text-xs text-slate-500">Download your financial data for backup or offline analysis.</p>
        <div className="mt-4 flex gap-3">
          <button className="rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/5 transition-colors">
            Export as CSV
          </button>
          <button className="rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/5 transition-colors">
            Export as JSON
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
