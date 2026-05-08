import React, { useState, useMemo } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown,
  Trash2,
  Loader2
} from 'lucide-react';
import { useAppContext } from '../../../context/AppContext.js';
import { usePortfolio } from '../../../hooks/usePortfolio.js';
import { useMarketData } from '../../../hooks/useMarketData.js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';
import { formatCurrency } from '../../../utils/currencyFormatter.js';

const SortIcon = ({ column, sortConfig }) => {
  if (sortConfig.key !== column) return <ArrowUpDown size={12} className="opacity-30" />;
  return sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
};

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

const GlobalAssetList = () => {
  const { privacyMode, exchangeRate } = useAppContext();
  const queryClient = useQueryClient();
  const [sortConfig, setSortConfig] = useState({ key: 'totalValue', direction: 'desc' });

  const { data: portfolio, isLoading: isPortfolioLoading } = usePortfolio(exchangeRate);
  
  const dbAssets = useMemo(() => {
    return portfolio?.dbAssets?.filter(a => a.type === 'Stock' || a.type === 'Crypto') || [];
  }, [portfolio]);

  const stockTickers = useMemo(() => [...new Set(dbAssets.filter(a => a.type === 'Stock').map(a => a.ticker))], [dbAssets]);
  const cryptoIds = useMemo(() => [...new Set(dbAssets.filter(a => a.type === 'Crypto').map(a => {
    const t = a.ticker.toLowerCase();
    if (t === 'btc') return 'bitcoin';
    if (t === 'eth') return 'ethereum';
    if (t === 'sol') return 'solana';
    return t;
  }))], [dbAssets]);

  const { data: marketData, isLoading: isMarketLoading } = useMarketData(stockTickers, cryptoIds);

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-unified'] });
    },
    onError: (error) => {
      alert(`Delete failed: ${error.message}`);
    }
  });

  const isLoading = isPortfolioLoading || isMarketLoading;

  const formatVal = (val, cur = 'USD') => formatCurrency(val, cur, { privacyMode });

  const tableData = useMemo(() => {
    return dbAssets.map(asset => {
      let priceData;
      if (asset.type === 'Stock') {
        priceData = marketData?.stocks?.[asset.ticker];
      } else {
        const id = asset.ticker.toLowerCase() === 'btc' ? 'bitcoin' : 
                   asset.ticker.toLowerCase() === 'eth' ? 'ethereum' : 
                   asset.ticker.toLowerCase() === 'sol' ? 'solana' : asset.ticker.toLowerCase();
        priceData = marketData?.cryptos?.[id];
        if (priceData && !priceData.price) {
          priceData = { price: priceData.usd, change: priceData.usd_24h_change };
        }
      }

      const currentPrice = priceData?.price || 0;
      const change24h = priceData?.change || 0;
      const totalValue = currentPrice * asset.quantity;
      const costBasis = (asset.avg_buy_price || 0) * asset.quantity;
      const profitLoss = totalValue - costBasis;
      const profitLossPercent = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0;

      return {
        ...asset,
        name: asset.ticker,
        currentPrice,
        change24h,
        totalValue,
        profitLoss,
        profitLossPercent
      };
    });
  }, [dbAssets, marketData]);

  const sortedData = useMemo(() => {
    let sortableItems = [...tableData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (sortConfig.key === 'alpha') { aVal = a.ticker; bVal = b.ticker; }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [tableData, sortConfig]);

  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between px-4 gap-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Global Inventory Ledger</h2>
        
        <div className="flex items-center gap-2 p-1 bg-white/[0.03] border border-white/[0.05] rounded-xl">
          {['totalValue', 'profitLossPercent', 'alpha'].map(key => (
            <button 
              key={key}
              onClick={() => requestSort(key)}
              className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${sortConfig.key === key ? 'bg-white text-black' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {key === 'totalValue' ? 'Value' : key === 'profitLossPercent' ? 'Profit' : 'Alpha'}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              <th className="px-6 py-3 cursor-pointer" onClick={() => requestSort('alpha')}>Asset <SortIcon column="alpha" sortConfig={sortConfig} /></th>
              <th className="px-6 py-3 text-right">Price</th>
              <th className="px-6 py-3 text-right">24h</th>
              <th className="px-6 py-3 text-right">Holdings</th>
              <th className="px-6 py-3 text-right">Value</th>
              <th className="px-6 py-3 text-right">Profit/Loss</th>
              <th className="px-6 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse bg-white/[0.02] rounded-xl"><td colSpan={7} className="h-16"></td></tr>
              ))
            ) : sortedData.map((item, idx) => (
              <tr key={idx} className="group relative transition-all hover:scale-[1.005]">
                <td className="absolute inset-0 bg-white/[0.03] border border-white/[0.06] backdrop-blur-md rounded-2xl group-hover:bg-white/[0.05] transition-all pointer-events-none" />
                
                <td className="relative px-6 py-4 z-10">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-black/40 border border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getAssetColor(item.ticker, item.type) }} />
                      <span className="text-[10px] font-bold text-white">{item.ticker}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-slate-400">{item.type}</span>
                      <span className="text-[9px] text-slate-600 font-mono">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="relative px-6 py-4 text-right z-10 text-xs font-bold text-white">
                  {formatVal(item.currentPrice)}
                </td>

                <td className="relative px-6 py-4 text-right z-10">
                  <div className={`inline-flex items-center gap-0.5 text-[10px] font-black ${item.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.change24h >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(item.change24h).toFixed(2)}%
                  </div>
                </td>

                <td className="relative px-6 py-4 text-right z-10 text-xs text-slate-300">
                  {item.quantity.toLocaleString()}
                </td>

                <td className="relative px-6 py-4 text-right z-10 text-xs font-bold text-white">
                  {formatVal(item.totalValue)}
                </td>

                <td className="relative px-6 py-4 text-right z-10">
                  <div className={`flex flex-col items-end`}>
                    <span className={`text-xs font-bold ${item.profitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {item.profitLoss >= 0 ? '+' : ''}{formatVal(Math.abs(item.profitLoss))}
                    </span>
                    <span className={`text-[9px] font-black opacity-60 ${item.profitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {item.profitLossPercent >= 0 ? '+' : ''}{item.profitLossPercent.toFixed(1)}%
                    </span>
                  </div>
                </td>

                <td className="relative px-6 py-4 text-center z-10">
                  <button 
                    onClick={() => {
                      if (window.confirm(`Delete this ${item.ticker} entry (${item.quantity} units)?`)) {
                        deleteMutation.mutate(item.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                  >
                    {deleteMutation.isPending && deleteMutation.variables === item.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GlobalAssetList;

