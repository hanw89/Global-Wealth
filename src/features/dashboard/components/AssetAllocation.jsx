import React, { useMemo } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { AlertTriangle, CheckCircle2, RefreshCw, PieChart as PieIcon, ArrowRight } from 'lucide-react';
import { useMarketData } from '../../../hooks/useMarketData.js';
import { useAppContext } from '../../../context/AppContext.jsx';
import { formatCurrency } from '../../../utils/currencyFormatter.js';

// Targets for Rebalancing Logic
const TARGETS = {
  Stocks: 40,
  Crypto: 30,
  Cash: 30
};

const MOCK_HOLDINGS = [
  { id: 'bitcoin', ticker: 'BTC', name: 'Bitcoin', amount: 0.45, type: 'crypto' },
  { id: 'ethereum', ticker: 'ETH', name: 'Ethereum', amount: 3.2, type: 'crypto' },
  { ticker: 'AAPL', name: 'Apple Inc.', amount: 15, type: 'stock' },
  { ticker: 'TSLA', name: 'Tesla, Inc.', amount: 10, type: 'stock' },
  { ticker: 'NVDA', name: 'NVIDIA', amount: 5, type: 'stock' },
];

const KOREAN_RENT_VALUE_USD = 1240.50 * 12; // Annualizing the cash flow as "Cash" asset

const COLORS = {
  Stocks: '#6366f1',
  Crypto: '#f59e0b',
  Cash: '#10b981'
};

const AssetAllocation = () => {
  const { privacyMode } = useAppContext();

  const { data, isLoading } = useMarketData(
    MOCK_HOLDINGS.filter(h => h.type === 'stock').map(h => h.ticker),
    MOCK_HOLDINGS.filter(h => h.type === 'crypto').map(h => h.id)
  );

  const allocationData = useMemo(() => {
    if (!data) return [];

    const stockVal = MOCK_HOLDINGS
      .filter(h => h.type === 'stock')
      .reduce((sum, h) => sum + (data.stocks?.[h.ticker]?.price || 0) * h.amount, 0);

    const cryptoVal = MOCK_HOLDINGS
      .filter(h => h.type === 'crypto')
      .reduce((sum, h) => sum + (data.cryptos?.[h.id]?.usd || 0) * h.amount, 0);

    const cashVal = KOREAN_RENT_VALUE_USD; // Treating annualized rent as the cash component

    const total = stockVal + cryptoVal + cashVal;

    return [
      { name: 'Stocks', value: stockVal, percent: (stockVal / total) * 100 },
      { name: 'Crypto', value: cryptoVal, percent: (cryptoVal / total) * 100 },
      { name: 'Cash', value: cashVal, percent: (cashVal / total) * 100 }
    ];
  }, [data]);

  const rebalanceAdvice = useMemo(() => {
    if (!allocationData.length) return null;

    const suggestions = [];
    allocationData.forEach(asset => {
      const target = TARGETS[asset.name];
      const diff = asset.percent - target;

      if (diff > 5) {
        suggestions.push({
          type: 'sell',
          asset: asset.name,
          diff: diff.toFixed(1),
          message: `Your ${asset.name} is currently ${asset.percent.toFixed(1)}% of your portfolio; your target is ${target}%. Consider trimming your position.`
        });
      } else if (diff < -5) {
        suggestions.push({
          type: 'buy',
          asset: asset.name,
          diff: Math.abs(diff).toFixed(1),
          message: `${asset.name} is underweight at ${asset.percent.toFixed(1)}% (Target: ${target}%). Consider increasing exposure.`
        });
      }
    });

    return suggestions;
  }, [allocationData]);

  const formatVal = (val) => formatCurrency(val, 'USD', { privacyMode });

  return (
    <div className="rounded-[2.5rem] bg-[#0f0f12] border border-white/[0.05] p-8 shadow-2xl relative overflow-hidden group">
      <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px]" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <PieIcon size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Asset Allocation</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Risk Distribution</p>
            </div>
          </div>
          {isLoading && <RefreshCw size={16} className="text-slate-500 animate-spin" />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Chart Section */}
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                  animationDuration={1500}
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  formatter={(value) => formatVal(value)}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Value</p>
              <p className={`text-2xl font-black text-white ${privacyMode ? 'blur-md' : ''}`}>
                {formatVal(allocationData.reduce((s, d) => s + d.value, 0))}
              </p>
            </div>
          </div>

          {/* Details & Rebalancing */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3">
              {allocationData.map(asset => (
                <div key={asset.name} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[asset.name] }} />
                    <span className="text-sm font-bold text-white">{asset.name}</span>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black text-white ${privacyMode ? 'blur-sm' : ''}`}>{asset.percent.toFixed(1)}%</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Target: {TARGETS[asset.name]}%</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Rebalancing Advice Card */}
            <div className={`p-5 rounded-2xl border transition-all duration-500 ${rebalanceAdvice?.length ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${rebalanceAdvice?.length ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {rebalanceAdvice?.length ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                </div>
                <div>
                  <h4 className={`text-xs font-black uppercase tracking-widest mb-2 ${rebalanceAdvice?.length ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {rebalanceAdvice?.length ? 'Rebalancing Required' : 'Allocation Optimized'}
                  </h4>
                  {rebalanceAdvice?.length ? (
                    <div className="space-y-3">
                      {rebalanceAdvice.map((advice, i) => (
                        <p key={i} className="text-xs text-slate-300 leading-relaxed font-medium">
                          {advice.message}
                        </p>
                      ))}
                      <button className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-widest hover:text-amber-400 transition-colors pt-1">
                        View Optimization Plan <ArrowRight size={12} />
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 font-medium">Your portfolio is currently aligned with your strategic targets.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetAllocation;
