import React, { useState, useMemo } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronRight,
  ChevronDown,
  Trash2,
  Loader2,
  Calendar,
  DollarSign,
  Layers,
  TrendingUp
} from 'lucide-react';
import { useAppContext } from '../../../context/AppContext.js';
import { usePortfolio } from '../../../hooks/usePortfolio.js';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../../../lib/supabaseClient';
import { formatCurrency } from '../../../utils/currencyFormatter.js';

const getAssetColor = (ticker, type) => {
  if (type === 'Crypto') {
    const colors = {
      'BTC': '#f7931a',
      'ETH': '#627eea',
      'SOL': '#14f195',
      'BNB': '#f3ba2f',
      'XRP': '#23292f'
    };
    return colors[ticker.toUpperCase()] || '#f59e0b';
  }
  return '#6366f1'; 
};

const LotRow = ({ lot, privacyMode, formatVal, deleteMutation }) => (
  <tr className="bg-white/[0.01] hover:bg-white/[0.03] transition-colors border-b border-white/[0.03]">
    <td className="pl-16 pr-6 py-3">
      <div className="flex items-center gap-2">
        <Calendar size={10} className="text-slate-500" />
        <span className="text-[10px] text-slate-400 font-mono">
          {new Date(lot.created_at).toLocaleDateString()}
        </span>
      </div>
    </td>
    <td className="px-6 py-3 text-right">
      <span className="text-[10px] text-slate-400 font-medium">{formatVal(lot.avg_buy_price)}</span>
    </td>
    <td className="px-6 py-3 text-right">
      <span className="text-[10px] text-slate-400">{lot.quantity.toLocaleString()}</span>
    </td>
    <td className="px-6 py-3 text-right">
      <span className="text-[10px] text-white font-medium">{formatVal(lot.value)}</span>
    </td>
    <td className="px-6 py-3 text-right">
       <div className={`flex flex-col items-end`}>
          <span className={`text-[10px] font-bold ${lot.profitLoss >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {lot.profitLoss >= 0 ? '+' : ''}{formatVal(Math.abs(lot.profitLoss))}
          </span>
          <span className={`text-[8px] font-black opacity-60 ${lot.profitLoss >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {lot.profitLossPercent >= 0 ? '+' : ''}{lot.profitLossPercent.toFixed(1)}%
          </span>
        </div>
    </td>
    <td className="px-6 py-3 text-center">
      <button 
        onClick={() => {
          if (window.confirm(`Delete this lot (${lot.quantity} units)?`)) {
            deleteMutation.mutate(lot.id);
          }
        }}
        className="p-1 rounded-md text-slate-600 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
      >
        {deleteMutation.isPending && deleteMutation.variables === lot.id ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <Trash2 size={12} />
        )}
      </button>
    </td>
  </tr>
);

const AssetGroup = ({ asset, privacyMode, formatVal, deleteMutation }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <tr 
        onClick={() => setIsExpanded(!isExpanded)}
        className="group cursor-pointer hover:bg-white/[0.02] transition-all border-b border-white/[0.05]"
      >
        <td className="px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="text-slate-500 transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(90deg)' : 'none' }}>
              <ChevronRight size={16} />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/5 shadow-inner">
                <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.3)]" style={{ backgroundColor: getAssetColor(asset.ticker, asset.type) }} />
                <span className="text-xs font-black text-white tracking-wider">{asset.ticker}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{asset.type}</span>
                <span className="text-[8px] text-indigo-400 font-bold">{asset.lots.length} LOTS</span>
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-5 text-right">
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-white">{formatVal(asset.currentPrice)}</span>
            <div className={`flex items-center gap-0.5 text-[9px] font-black ${asset.change24h >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {asset.change24h >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
              {Math.abs(asset.change24h).toFixed(2)}%
            </div>
          </div>
        </td>
        <td className="px-6 py-5 text-right">
          <div className="flex flex-col items-end">
             <span className="text-xs font-medium text-slate-300">{asset.totalQuantity.toLocaleString()}</span>
             <span className="text-[8px] text-slate-500 font-black uppercase tracking-tighter">Total Units</span>
          </div>
        </td>
        <td className="px-6 py-5 text-right">
          <div className="flex flex-col items-end">
            <span className="text-xs font-black text-white">{formatVal(asset.totalValue)}</span>
            <span className="text-[8px] text-slate-500 font-bold uppercase">Market Value</span>
          </div>
        </td>
        <td className="px-6 py-5 text-right">
           <div className={`flex flex-col items-end`}>
            <span className={`text-xs font-black ${asset.profitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {asset.profitLoss >= 0 ? '+' : ''}{formatVal(Math.abs(asset.profitLoss))}
            </span>
            <span className={`text-[9px] font-black opacity-60 ${asset.profitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {asset.profitLossPercent >= 0 ? '+' : ''}{asset.profitLossPercent.toFixed(1)}%
            </span>
          </div>
        </td>
        <td className="px-6 py-5 text-center">
           <div className="w-8 h-8 rounded-full bg-white/[0.03] flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors mx-auto">
              <Layers size={14} />
           </div>
        </td>
      </tr>
      {isExpanded && asset.lots.map((lot, idx) => (
        <LotRow 
          key={lot.id || idx} 
          lot={lot} 
          privacyMode={privacyMode} 
          formatVal={formatVal} 
          deleteMutation={deleteMutation} 
        />
      ))}
    </>
  );
};

const GlobalAssetList = () => {
  const { privacyMode, exchangeRate } = useAppContext();
  const queryClient = useQueryClient();
  const { data: portfolio, isLoading: isPortfolioLoading } = usePortfolio(exchangeRate);
  
  const dbAssets = useMemo(() => {
    return portfolio?.dbAssets?.filter(a => a.type === 'Stock' || a.type === 'Crypto') || [];
  }, [portfolio]);

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('assets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-unified'] });
    },
    onError: (error) => {
      alert(`Delete failed: ${error.message}`);
    }
  });

  const formatVal = (val, cur = 'USD') => formatCurrency(val, cur, { privacyMode });

  const groupedData = useMemo(() => {
    const categories = {
      'Stock': {},
      'Crypto': {}
    };

    dbAssets.forEach(asset => {
      const type = asset.type || 'Stock';
      if (!categories[type]) categories[type] = {};
      
      const ticker = asset.ticker;
      if (!categories[type][ticker]) {
        categories[type][ticker] = {
          ticker,
          type,
          lots: [],
          totalQuantity: 0,
          totalValue: 0,
          totalCost: 0,
          currentPrice: asset.current_price || 0,
          change24h: asset.price_change_24h || 0
        };
      }
      
      const currentPrice = asset.current_price || 0;
      const quantity = asset.quantity || 0;
      const buyPrice = asset.avg_buy_price || 0;
      const value = currentPrice * quantity;
      const cost = buyPrice * quantity;
      
      categories[type][ticker].lots.push({
        ...asset,
        value,
        cost,
        profitLoss: value - cost,
        profitLossPercent: cost > 0 ? ((value - cost) / cost) * 100 : 0
      });
      
      categories[type][ticker].totalQuantity += quantity;
      categories[type][ticker].totalValue += value;
      categories[type][ticker].totalCost += cost;
    });

    Object.values(categories).forEach(typeGroup => {
      Object.values(typeGroup).forEach(asset => {
        asset.avgBuyPrice = asset.totalCost / asset.totalQuantity;
        asset.profitLoss = asset.totalValue - asset.totalCost;
        asset.profitLossPercent = asset.totalCost > 0 ? (asset.profitLoss / asset.totalCost) * 100 : 0;
        asset.lots.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      });
    });

    return categories;
  }, [dbAssets]);

  const categories = ['Stock', 'Crypto'];

  return (
    <div className="space-y-12">
      <div className="px-4">
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
          <TrendingUp className="text-indigo-400" size={24} />
          Global Inventory Ledger
        </h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 ml-9">Unified Portfolio Management</p>
      </div>

      {isPortfolioLoading ? (
        <div className="space-y-4 px-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-white/[0.02] rounded-3xl animate-pulse border border-white/5" />
          ))}
        </div>
      ) : categories.map(cat => {
        const assets = Object.values(groupedData[cat] || {}).sort((a, b) => b.totalValue - a.totalValue);
        if (assets.length === 0) return null;

        return (
          <section key={cat} className="space-y-4">
            <div className="flex items-center gap-4 px-6">
               <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
               <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                 <div className={`w-1.5 h-1.5 rounded-full ${cat === 'Stock' ? 'bg-blue-400' : 'bg-orange-400'}`} />
                 {cat} ASSETS
               </h3>
               <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            <div className="overflow-x-auto mx-4 rounded-3xl border border-white/[0.05] bg-[#0f0f12]/50 backdrop-blur-xl overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/10 bg-white/[0.01]">
                    <th className="px-6 py-5">Asset</th>
                    <th className="px-6 py-5 text-right">Market Price</th>
                    <th className="px-6 py-5 text-right">Holdings</th>
                    <th className="px-6 py-5 text-right">Value</th>
                    <th className="px-6 py-5 text-right">Profit/Loss</th>
                    <th className="px-6 py-5 text-center">Lots</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {assets.map((asset, idx) => (
                    <AssetGroup 
                      key={asset.ticker} 
                      asset={asset} 
                      privacyMode={privacyMode} 
                      formatVal={formatVal} 
                      deleteMutation={deleteMutation} 
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default GlobalAssetList;
