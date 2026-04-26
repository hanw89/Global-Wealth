import React, { useState } from 'react';

const AssetTracker = () => {
  // Mock data/state
  const [usBank, setUsBank] = useState(12500);
  const [krBank, setKrBank] = useState(45000000); // KRW
  const [rentalProperty, setRentalProperty] = useState(350000000); // KRW (Assume Korean Property)
  const [bitcoin, setBitcoin] = useState(0.85); // BTC
  const btcPrice = 64500; // USD
  
  const [showInUSD, setShowInUSD] = useState(false);
  const KRW_TO_USD = 1350;

  // Calculations
  const btcValueUSD = bitcoin * btcPrice;
  const krBankUSD = krBank / KRW_TO_USD;
  const rentalUSD = rentalProperty / KRW_TO_USD;
  
  const totalUSD = usBank + btcValueUSD + krBankUSD + rentalUSD;

  const formatCurrency = (val, currency) => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        maximumFractionDigits: 0 
      }).format(val);
    }
    return new Intl.NumberFormat('ko-KR', { 
      style: 'currency', 
      currency: 'KRW',
      maximumFractionDigits: 0
    }).format(val);
  };

  const assets = [
    { 
      name: 'US Bank Balances', 
      value: usBank, 
      currency: 'USD', 
      converted: usBank,
      icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
    },
    { 
      name: 'Korean Bank Balances', 
      value: krBank, 
      currency: 'KRW', 
      converted: krBankUSD,
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16V15'
    },
    { 
      name: 'Rental Property Value', 
      value: rentalProperty, 
      currency: 'KRW', 
      converted: rentalUSD,
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    },
    { 
      name: 'Bitcoin', 
      value: btcValueUSD, 
      currency: 'USD', 
      converted: btcValueUSD,
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      subtext: `${bitcoin} BTC`
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Global Asset Tracker</h2>
          <p className="text-sm text-slate-500">Track and convert your international holdings</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm self-start">
          <span className={`text-xs font-bold uppercase tracking-wider ${!showInUSD ? 'text-slate-900' : 'text-slate-400'}`}>Original</span>
          <button 
            onClick={() => setShowInUSD(!showInUSD)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${showInUSD ? 'bg-slate-900' : 'bg-slate-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${showInUSD ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className={`text-xs font-bold uppercase tracking-wider ${showInUSD ? 'text-slate-900' : 'text-slate-400'}`}>USD Only</span>
        </div>
      </div>

      {/* Total Wealth Card */}
      <div className="rounded-2xl bg-slate-900 p-8 text-white shadow-xl">
        <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Total Global Wealth (USD)</p>
        <div className="mt-2 flex items-baseline gap-4">
          <h3 className="text-4xl font-bold tracking-tight">{formatCurrency(totalUSD, 'USD')}</h3>
          <span className="text-slate-400 text-sm font-mono">@ 1,350 KRW/USD</span>
        </div>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {assets.map((asset) => (
          <div key={asset.name} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-slate-300 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-slate-50 p-3 text-slate-900 transition-colors group-hover:bg-slate-100">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={asset.icon}></path>
                </svg>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded ${asset.currency === 'KRW' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                {showInUSD ? 'USD' : asset.currency}
              </span>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium text-slate-500">{asset.name}</h4>
              <div className="mt-1 flex items-baseline justify-between">
                <p className="text-2xl font-bold text-slate-900 tabular-nums">
                  {showInUSD ? formatCurrency(asset.converted, 'USD') : formatCurrency(asset.value, asset.currency)}
                </p>
              </div>
              {asset.subtext && <p className="mt-1 text-xs text-slate-400">{asset.subtext}</p>}
            </div>

            {/* Visual Indicator for Conversion */}
            {showInUSD && asset.currency === 'KRW' && (
              <div className="mt-4 border-t border-slate-50 pt-3">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                  Converted from {formatCurrency(asset.value, 'KRW')}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Humble Footer Note */}
      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-center">
        <p className="text-xs text-slate-500 italic">
          "Wealth is the ability to fully experience life." — Rates updated manually for stability.
        </p>
      </div>
    </div>
  );
};

export default AssetTracker;
