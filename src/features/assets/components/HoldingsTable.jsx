import React, { useState, useMemo } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown,
  Layers
} from 'lucide-react';
import { useMarketData } from '../../../hooks/useMarketData.js';
import { formatCurrency } from '../../../utils/currencyFormatter.js';
import { useAppContext } from '../../../context/AppContext.jsx';

const SortIcon = ({ column, sortConfig }) => {
  if (sortConfig.key !== column) return <ArrowUpDown size={12} className="opacity-30" />;
  return sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
};

const MOCK_HOLDINGS = [
  { id: 'bitcoin', ticker: 'BTC', name: 'Bitcoin', amount: 0.45, type: 'crypto', avgPrice: 42000, color: '#f7931a' },
  { id: 'ethereum', ticker: 'ETH', name: 'Ethereum', amount: 3.2, type: 'crypto', avgPrice: 2100, color: '#627eea' },
  { ticker: 'AAPL', name: 'Apple Inc.', amount: 15, type: 'stock', avgPrice: 175, color: '#ffffff' },
  { ticker: 'TSLA', name: 'Tesla, Inc.', amount: 10, type: 'stock', avgPrice: 240, color: '#cc0000' },
  { ticker: 'NVDA', name: 'NVIDIA', amount: 5, type: 'stock', avgPrice: 450, color: '#76b900' },
  { id: 'solana', ticker: 'SOL', name: 'Solana', amount: 120, type: 'crypto', avgPrice: 95, color: '#14f195' },
];

const HoldingsTable = () => {
  const { privacyMode } = useAppContext();
  const [sortConfig, setSortConfig] = useState({ key: 'value', direction: 'desc' });

  const { data, isLoading } = useMarketData(
    MOCK_HOLDINGS.filter(h => h.type === 'stock').map(h => h.ticker),
    MOCK_HOLDINGS.filter(h => h.type === 'crypto').map(h => h.id)
  );

  const formatVal = (val, cur = 'USD') => formatCurrency(val, cur, { privacyMode });

  // Process data with Profit/Loss calculations
  const tableData = useMemo(() => {
    return MOCK_HOLDINGS.map(holding => {
      let priceData;
      if (holding.type === 'stock') {
        priceData = data?.stocks?.[holding.ticker];
      } else {
        priceData = data?.cryptos?.[holding.id];
        if (priceData && !priceData.price) {
          priceData = { price: priceData.usd, change: priceData.usd_24h_change };
        }
      }

      const currentPrice = priceData?.price || 0;
      const change24h = priceData?.change || 0;
      const totalValue = currentPrice * holding.amount;
      const costBasis = holding.avgPrice * holding.amount;
      const profitLoss = totalValue - costBasis;
      const profitLossPercent = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0;

      return {
        ...holding,
        currentPrice,
        change24h,
        totalValue,
        profitLoss,
        profitLossPercent
      };
    });
  }, [data]);

  // Sorting Logic
  const sortedData = useMemo(() => {
    let sortableItems = [...tableData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        // Custom key mapping for "Alpha" (Name)
        if (sortConfig.key === 'alpha') {
          aVal = a.name;
          bVal = b.name;
        }

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
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Portfolio Ledger</h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Institutional Grade Tracking</p>
        </div>

        {/* Sorting Quick Controls */}
        <div className="flex items-center gap-2 p-1.5 bg-white/[0.03] border border-white/[0.05] rounded-2xl">
          <button 
            onClick={() => requestSort('totalValue')}
            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${sortConfig.key === 'totalValue' ? 'bg-white text-black' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Sort by Value
          </button>
          <button 
            onClick={() => requestSort('profitLossPercent')}
            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${sortConfig.key === 'profitLossPercent' ? 'bg-white text-black' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Sort by Profit
          </button>
          <button 
            onClick={() => requestSort('alpha')}
            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${sortConfig.key === 'alpha' ? 'bg-white text-black' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Alpha
          </button>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-separate border-spacing-y-2.5">
          <thead>
            <tr className="text-slate-500">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest cursor-pointer group" onClick={() => requestSort('alpha')}>
                <div className="flex items-center gap-2">Asset <SortIcon column="alpha" sortConfig={sortConfig} /></div>
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right cursor-pointer group" onClick={() => requestSort('currentPrice')}>
                <div className="flex items-center justify-end gap-2">Price <SortIcon column="currentPrice" sortConfig={sortConfig} /></div>
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right cursor-pointer group" onClick={() => requestSort('change24h')}>
                <div className="flex items-center justify-end gap-2">24h Change <SortIcon column="change24h" sortConfig={sortConfig} /></div>
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right cursor-pointer group" onClick={() => requestSort('amount')}>
                <div className="flex items-center justify-end gap-2">Holdings <SortIcon column="amount" sortConfig={sortConfig} /></div>
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right cursor-pointer group" onClick={() => requestSort('totalValue')}>
                <div className="flex items-center justify-end gap-2">Total Value <SortIcon column="totalValue" sortConfig={sortConfig} /></div>
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right cursor-pointer group" onClick={() => requestSort('profitLossPercent')}>
                <div className="flex items-center justify-end gap-2">Profit/Loss <SortIcon column="profitLossPercent" sortConfig={sortConfig} /></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse bg-white/[0.02] rounded-2xl">
                  <td colSpan={6} className="px-6 py-8 h-20 rounded-2xl"></td>
                </tr>
              ))
            ) : sortedData.map((item, idx) => (
              <tr 
                key={idx} 
                className="group relative transition-all duration-300 hover:scale-[1.01]"
              >
                {/* Glassmorphism Background Layer */}
                <td className="absolute inset-0 bg-white/[0.03] border border-white/[0.06] backdrop-blur-md rounded-2xl group-hover:bg-white/[0.05] group-hover:border-white/10 transition-all pointer-events-none" />
                
                <td className="relative px-6 py-6 z-10">
                  <div className="flex items-center gap-4">
                    {/* Ticker Pill Design */}
                    <div 
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-black/40 shadow-inner group-hover:border-white/20 transition-all"
                    >
                      <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: item.color, backgroundColor: item.color }} />
                      <span className="text-[10px] font-black text-white uppercase tracking-tighter">{item.ticker}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{item.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{item.type}</p>
                    </div>
                  </div>
                </td>

                <td className="relative px-6 py-6 text-right z-10">
                  <p className={`text-sm font-bold text-white ${privacyMode ? 'blur-sm' : ''}`}>
                    {formatVal(item.currentPrice)}
                  </p>
                </td>

                <td className="relative px-6 py-6 text-right z-10">
                  <div className={`inline-flex items-center gap-1 text-xs font-black ${item.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.change24h >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {Math.abs(item.change24h).toFixed(2)}%
                  </div>
                </td>

                <td className="relative px-6 py-6 text-right z-10">
                  <p className="text-sm font-medium text-slate-200">{item.amount.toLocaleString()}</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Units held</p>
                </td>

                <td className="relative px-6 py-6 text-right z-10">
                  <p className={`text-sm font-black text-white ${privacyMode ? 'blur-md' : ''}`}>
                    {formatVal(item.totalValue)}
                  </p>
                </td>

                <td className="relative px-6 py-6 text-right z-10">
                  <div className={`flex flex-col items-end`}>
                    <p className={`text-sm font-bold ${item.profitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {item.profitLoss >= 0 ? '+' : ''}{formatVal(Math.abs(item.profitLoss))}
                    </p>
                    <div className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${item.profitLoss >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {item.profitLossPercent >= 0 ? '+' : ''}{item.profitLossPercent.toFixed(1)}%
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4 p-4 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
          <Layers size={20} />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset Concentration</p>
          <div className="flex items-center gap-2 mt-1">
            {tableData.slice(0, 4).map((item, idx) => (
              <div 
                key={idx}
                className="h-1.5 rounded-full" 
                style={{ 
                  backgroundColor: item.color, 
                  width: `${(item.totalValue / sortedData.reduce((s, h) => s + h.totalValue, 0)) * 100}%`,
                  minWidth: '4px'
                }} 
              />
            ))}
            <div className="flex-1 h-1.5 rounded-full bg-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoldingsTable;
