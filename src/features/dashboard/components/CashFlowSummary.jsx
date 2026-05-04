import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Globe, DollarSign, Wallet, Home, Zap, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext.jsx';
import { formatCurrency } from '../../../utils/currencyFormatter.js';
import { fetchHistoricalForex } from '../../../services/marketService.js';

const CashFlowSummary = () => {
  const { exchangeRate, privacyMode } = useAppContext();
  const [showKrw, setShowKrw] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistoricalForex().then(setHistory);
  }, []);

  const forexAlert = useMemo(() => {
    if (!history.length || !exchangeRate) return false;
    
    // Get last 30 days
    const last30 = history.slice(-30);
    const avg30 = last30.reduce((sum, d) => sum + d.close, 0) / last30.length;
    
    // Won is "stronger" if exchangeRate (USD/KRW) is LOWER than average
    // 2% stronger means rate is < 98% of average
    return exchangeRate < (avg30 * 0.98);
  }, [history, exchangeRate]);

  // Clean state (no dummy data)

  const usDividends = 0;
  const cryptoStaking = 0;
  const koreanRentKrw = 0;
  const koreanRentUsd = koreanRentKrw / exchangeRate;

  const totalMonthlyIncomeUsd = usDividends + cryptoStaking + koreanRentUsd;

  // Proportions for the breakdown bar
  const total = totalMonthlyIncomeUsd || 1; // Avoid division by zero
  const divPercent = (usDividends / total) * 100;
  const cryptoPercent = (cryptoStaking / total) * 100;
  const rentPercent = (koreanRentUsd / total) * 100;

  const formatUSD = (val) => formatCurrency(val, 'USD', { privacyMode });
  const formatKRW = (val) => formatCurrency(val, 'KRW', { privacyMode });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      
      {/* Primary Metric: Total Monthly Passive Income */}
      <div className="lg:col-span-3 p-8 rounded-[2.5rem] bg-[#0f0f12] border border-white/[0.05] shadow-2xl relative overflow-hidden group transition-all hover:border-emerald-500/30">
        {/* Decorative Glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] group-hover:bg-emerald-500/10 transition-all duration-1000" />
        
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap size={18} fill="currentColor" fillOpacity={0.2} />
            </div>
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em]">Passive Revenue Stream</span>
          </div>

          <div className="mb-auto">
            <h2 className="text-slate-400 text-sm font-medium mb-1">Total Monthly Passive Income</h2>
            <div className={`text-6xl font-black text-white tracking-tighter mb-4 ${privacyMode ? 'blur-2xl select-none' : ''}`}>
              {formatUSD(totalMonthlyIncomeUsd)}
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <TrendingUp size={16} />
              <span>+12.5% from last quarter</span>
            </div>
          </div>

          {/* Breakdown: Horizontal Progress Bar */}
          <div className="mt-12 space-y-5">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset Allocation</span>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">Diversified</span>
            </div>
            
            <div className="h-3 w-full flex rounded-full overflow-hidden bg-white/[0.03] border border-white/[0.05] p-0.5">
              <div 
                style={{ width: `${divPercent}%` }} 
                className="bg-gradient-to-r from-blue-600 to-indigo-500 rounded-l-full transition-all duration-1000 ease-in-out" 
                title={`US Dividends: ${divPercent.toFixed(1)}%`}
              />
              <div 
                style={{ width: `${cryptoPercent}%` }} 
                className="bg-gradient-to-r from-orange-600 to-amber-500 mx-0.5 transition-all duration-1000 ease-in-out delay-150" 
                title={`Crypto Staking: ${cryptoPercent.toFixed(1)}%`}
              />
              <div 
                style={{ width: `${rentPercent}%` }} 
                className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-r-full transition-all duration-1000 ease-in-out delay-300" 
                title={`KR Rental: ${rentPercent.toFixed(1)}%`}
              />
            </div>
            
            {/* Detailed Legend */}
            <div className="flex flex-wrap gap-6 pt-2">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">US Dividends</p>
                  <p className="text-xs font-bold text-white">{formatUSD(usDividends)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Crypto Staking</p>
                  <p className="text-xs font-bold text-white">{formatUSD(cryptoStaking)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">KR Rental</p>
                  <p className="text-xs font-bold text-white">{formatUSD(koreanRentUsd)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Korean Rental Card with Currency Toggle */}
      <div className="p-7 rounded-[2.5rem] bg-[#0f0f12] border border-white/[0.05] flex flex-col shadow-xl hover:border-indigo-500/30 transition-all group">
        <div className="flex justify-between items-start mb-8">
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
            <Globe size={20} />
          </div>
          
          {/* Currency Toggle Switch */}
          <div 
            onClick={() => setShowKrw(!showKrw)}
            className="flex items-center p-1 bg-black/60 border border-white/10 rounded-full cursor-pointer relative w-24 h-9"
          >
            <div className={`absolute top-1 bottom-1 w-[46%] bg-white rounded-full shadow-lg transition-all duration-300 ease-out ${showKrw ? 'left-[50%]' : 'left-1'}`} />
            <span className={`flex-1 text-center text-[10px] font-black z-10 transition-colors ${!showKrw ? 'text-black' : 'text-slate-500'}`}>USD</span>
            <span className={`flex-1 text-center text-[10px] font-black z-10 transition-colors ${showKrw ? 'text-black' : 'text-slate-500'}`}>KRW</span>
          </div>
        </div>

        <div className="mt-auto">
          {forexAlert && (
            <div className="mb-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 animate-bounce">
              <CheckCircle2 size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest">Good Time to Transfer</span>
            </div>
          )}
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Foreign Asset Income</p>

          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">Seoul Rental A</h3>
          <p className="text-xs text-slate-500 mb-6 font-medium">Gangnam District 4-12</p>
          
          <div className={`text-4xl font-black text-white tracking-tighter transition-all duration-500 ${privacyMode ? 'blur-xl select-none' : ''}`}>
            {showKrw ? formatKRW(koreanRentKrw) : formatUSD(koreanRentUsd)}
          </div>
          
          <div className="flex items-center gap-2 mt-4 pt-6 border-t border-white/[0.05]">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Flow Active</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CashFlowSummary;
