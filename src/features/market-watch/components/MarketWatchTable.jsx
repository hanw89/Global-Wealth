import React, { useMemo } from 'react';
import { AlertCircle, ArrowUpRight, ArrowDownRight, RefreshCw, Zap, Clock } from 'lucide-react';
import { useMarketData } from '../../../hooks/useMarketData.js';
import { usePortfolio } from '../../../hooks/usePortfolio.js';
import { formatCurrency } from '../../../utils/currencyFormatter.js';
import { useAppContext } from '../../../context/AppContext.jsx';

const MarketWatchTable = () => {
  const { privacyMode, exchangeRate } = useAppContext();
  const { data: portfolio, isLoading: isPortfolioLoading } = usePortfolio(exchangeRate);
  
  const dbAssets = useMemo(() => portfolio?.dbAssets || [], [portfolio]);

  const stockTickers = useMemo(() => dbAssets.filter(a => a.type === 'Stock').map(a => a.ticker), [dbAssets]);
  const cryptoIds = useMemo(() => dbAssets.filter(a => a.type === 'Crypto').map(a => {
    const t = a.ticker.toLowerCase();
    if (t === 'btc') return 'bitcoin';
    if (t === 'eth') return 'ethereum';
    if (t === 'sol') return 'solana';
    return t;
  }), [dbAssets]);

  // High-reliability Fintech Strategy: Use TanStack Query
  const { 
    data: marketData, 
    isLoading: isMarketLoading, 
    isError, 
    refetch, 
    isFetching,
    dataUpdatedAt 
  } = useMarketData(stockTickers, cryptoIds);

  const isLoading = isPortfolioLoading || isMarketLoading;

  const formatVal = (val) => formatCurrency(val, 'USD', { privacyMode });

  // Map holdings to their live (or last known) prices
  const processedHoldings = useMemo(() => {
    return dbAssets.map(asset => {
      let priceData;
      if (asset.type === 'Stock') {
        priceData = marketData?.stocks?.[asset.ticker];
      } else {
        const id = asset.ticker.toLowerCase() === 'btc' ? 'bitcoin' : 
                   asset.ticker.toLowerCase() === 'eth' ? 'ethereum' : 
                   asset.ticker.toLowerCase() === 'sol' ? 'solana' : asset.ticker.toLowerCase();
        priceData = marketData?.cryptos?.[id];
        // Normalize CoinGecko's nested structure if needed
        if (priceData && !priceData.price) {
          priceData = {
            price: priceData.usd,
            change: priceData.usd_24h_change
          };
        }
      }

      const price = priceData?.price || 0;
      const change = priceData?.change || 0;
      const value = price * asset.quantity;

      return { 
        ...asset, 
        name: asset.ticker, // Default name to ticker if not provided
        amount: asset.quantity,
        price, 
        change, 
        value 
      };
    });
  }, [dbAssets, marketData]);

  const totalValue = processedHoldings.reduce((sum, h) => sum + h.value, 0);
  const cryptoVolatility = processedHoldings
    .filter(h => h.type === 'crypto')
    .reduce((acc, h, _, arr) => acc + (h.change / arr.length), 0);
  
  const isVolatile = Math.abs(cryptoVolatility) > 5;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">Market Watch</h2>
          {isVolatile && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertCircle size={12} />
              <span className="text-[10px] font-black uppercase tracking-tighter">Volatility Alert</span>
            </div>
          )}
          {isError && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Clock size={12} />
              <span className="text-[10px] font-black uppercase tracking-tighter">Last Known Prices</span>
            </div>
          )}
        </div>
        <button 
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 transition-all disabled:opacity-50"
        >
          <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="rounded-3xl bg-[#0f0f12] border border-white/[0.05] overflow-hidden shadow-2xl relative">
        {/* Background Syncing Indicator */}
        {isFetching && !isLoading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-indigo-500/50 animate-pulse z-50" />
        )}

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.05] bg-white/[0.01]">
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Ticker</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Price</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Holdings</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={4} className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-full" /></td>
                </tr>
              ))
            ) : processedHoldings.map((item, idx) => (
              <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-[10px] text-slate-400">
                      {item.ticker}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{item.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{item.type.toUpperCase()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <p className={`text-sm font-bold text-white ${privacyMode ? 'blur-sm' : ''}`}>{formatVal(item.price)}</p>
                    {isError && <AlertCircle size={10} className="text-amber-500" />}
                  </div>
                  <div className={`flex items-center justify-end gap-1 text-[10px] font-medium ${item.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {item.change >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {Math.abs(item.change).toFixed(2)}%
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="text-sm font-medium text-slate-300">{item.amount}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Units</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <p className={`text-sm font-black text-white ${privacyMode ? 'blur-md' : ''}`}>{formatVal(item.value)}</p>
                  <p className="text-[10px] text-slate-500 font-bold">Total Share</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {dataUpdatedAt ? (
          <div className="px-6 py-3 border-t border-white/[0.05] bg-white/[0.01] flex justify-between items-center">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Global Portfolio Summary</span>
            <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
              <Clock size={10} />
              Sync: {new Date(dataUpdatedAt).toLocaleTimeString()}
            </span>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex flex-col justify-center">
            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Portfolio Balance</p>
            <p className={`text-3xl font-black text-white ${privacyMode ? 'blur-lg' : ''}`}>
              {formatVal(totalValue)}
            </p>
        </div>
        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Crypto Heat</p>
              <p className={`text-xl font-bold ${cryptoVolatility >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {cryptoVolatility >= 0 ? '+' : ''}{cryptoVolatility.toFixed(2)}%
              </p>
            </div>
            <div className={`p-3 rounded-2xl ${isVolatile ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-slate-500'}`}>
               <Zap size={20} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default MarketWatchTable;

