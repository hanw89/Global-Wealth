import React, { useState } from 'react';

const AssetTracker = ({ currency }) => {
  // Asset State
  const [usBank, setUsBank] = useState(12500);
  const [krBank, setKrBank] = useState(45000000); // KRW
  const [rentalProperty, setRentalProperty] = useState(350000000); // KRW
  const [bitcoin, setBitcoin] = useState(0.85); // BTC
  
  const KRW_TO_USD = 1350;
  const BTC_PRICE_USD = 64500;

  // Calculations
  const btcValueUSD = bitcoin * BTC_PRICE_USD;
  const krBankUSD = krBank / KRW_TO_USD;
  const rentalUSD = rentalProperty / KRW_TO_USD;
  
  const totalUSD = usBank + btcValueUSD + krBankUSD + rentalUSD;
  const totalKRW = totalUSD * KRW_TO_USD;

  const formatCurrency = (val, cur) => {
    return new Intl.NumberFormat(cur === 'KRW' ? 'ko-KR' : 'en-US', { 
      style: 'currency', 
      currency: cur,
      maximumFractionDigits: 0 
    }).format(val);
  };

  const assets = [
    { 
      id: 'usBank',
      name: 'US Bank Balances', 
      value: usBank, 
      setter: setUsBank,
      originalCurrency: 'USD', 
      converted: currency === 'USD' ? usBank : usBank * KRW_TO_USD,
      icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
    },
    { 
      id: 'krBank',
      name: 'Korean Bank Balances', 
      value: krBank, 
      setter: setKrBank,
      originalCurrency: 'KRW', 
      converted: currency === 'USD' ? krBank / KRW_TO_USD : krBank,
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16V15'
    },
    { 
      id: 'rentalProperty',
      name: 'Rental Property Value', 
      value: rentalProperty, 
      setter: setRentalProperty,
      originalCurrency: 'KRW', 
      converted: currency === 'USD' ? rentalProperty / KRW_TO_USD : rentalProperty,
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    },
    { 
      id: 'bitcoin',
      name: 'Bitcoin (BTC)', 
      value: bitcoin, 
      setter: setBitcoin,
      originalCurrency: 'BTC', 
      converted: currency === 'USD' ? btcValueUSD : btcValueUSD * KRW_TO_USD,
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      isCrypto: true
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Global Asset Tracker</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage holdings in {currency === 'USD' ? 'US Dollars' : 'Korean Won'}.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Base Mode</span>
          <span className="px-3 py-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-xs font-black shadow-sm border border-slate-200 dark:border-slate-700">
            {currency}
          </span>
        </div>
      </div>

      {/* Main Wealth Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assets.map((asset) => (
              <div key={asset.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={asset.icon}></path>
                    </svg>
                  </div>
                  <label htmlFor={asset.id} className="text-sm font-semibold text-slate-700 dark:text-slate-300">{asset.name}</label>
                </div>
                
                <div className="relative">
                  <input
                    id={asset.id}
                    type="number"
                    value={asset.value}
                    onChange={(e) => asset.setter(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 pl-4 pr-12 text-lg font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-600 transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">
                    {asset.originalCurrency}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-400 dark:text-slate-500">Value in {currency}:</span>
                  <span className="font-mono font-bold text-slate-600 dark:text-slate-300">
                    {formatCurrency(asset.converted, currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden border border-white/5">
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Estimated Net Worth</p>
              <h3 className="text-4xl font-black tracking-tight mb-6">
                {formatCurrency(currency === 'USD' ? totalUSD : totalKRW, currency)}
              </h3>
              
              <div className="space-y-3 pt-6 border-t border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">In USD</span>
                  <span className="font-mono">{formatCurrency(totalUSD, 'USD')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">In KRW</span>
                  <span className="font-mono">{formatCurrency(totalKRW, 'KRW')}</span>
                </div>
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 border border-amber-100 dark:border-amber-900/30">
            <div className="flex gap-3">
              <div className="text-amber-600 dark:text-amber-500 mt-1">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900 dark:text-amber-400">Exchange Rate Info</p>
                <p className="text-xs text-amber-700 dark:text-amber-500/80 mt-1 leading-relaxed">
                  Using a fixed rate of <span className="font-bold">1,350 KRW/USD</span>. 
                  Bitcoin at <span className="font-bold">$64,500</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center py-4">
        <p className="text-slate-400 dark:text-slate-500 text-xs italic">"True wealth is the freedom to live life on your own terms."</p>
      </div>
    </div>
  );
};

export default AssetTracker;
