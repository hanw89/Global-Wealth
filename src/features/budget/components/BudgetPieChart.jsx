import React, { useState, useMemo } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { PieChart as PieIcon, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../../utils/currencyFormatter.js';
import { useAppContext } from '../../../context/AppContext.js';

const COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#f43f5e', 
  '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'
];

const BudgetPieChart = ({ expenseCategories, incomeCategories }) => {
  const { privacyMode, currency, convertAmount, theme } = useAppContext();
  const [timeframe, setTimeframe] = useState('Monthly'); // 'Weekly', 'Monthly', 'Annually'
  const [activeTab, setActiveTab] = useState('Expense'); // 'Expense', 'Income'

  const multiplier = useMemo(() => {
    switch (timeframe) {
      case 'Weekly': return 1 / 4.33;
      case 'Annually': return 12;
      default: return 1;
    }
  }, [timeframe]);

  const activeData = useMemo(() => {
    const categories = activeTab === 'Expense' ? expenseCategories : incomeCategories;
    return categories
      .filter(c => c.amountUsd > 0)
      .map((c, i) => ({
        name: c.category,
        value: c.amountUsd * multiplier,
        color: COLORS[i % COLORS.length]
      }));
  }, [activeTab, expenseCategories, incomeCategories, multiplier]);

  const totalValue = useMemo(() => {
    return activeData.reduce((acc, curr) => acc + curr.value, 0);
  }, [activeData]);

  const formatVal = (valUsd) => {
    if (privacyMode) return currency === 'USD' ? '$X,XXX' : '₩X,XXX';
    return formatCurrency(convertAmount(valUsd, 'USD', currency), currency);
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-xl mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <PieIcon size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Budget Distribution</h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visual Analysis</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          {/* Timeframe Selector */}
          <div className="flex p-1 bg-black/40 rounded-xl border border-white/5">
            {['Weekly', 'Monthly', 'Annually'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${timeframe === tf ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Type Selector */}
          <div className="flex p-1 bg-black/40 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('Expense')}
              className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'Expense' ? 'bg-rose-500/20 text-rose-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <TrendingDown size={12} />
              Expense
            </button>
            <button
              onClick={() => setActiveTab('Income')}
              className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'Income' ? 'bg-emerald-500/20 text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <TrendingUp size={12} />
              Income
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Chart Section */}
        <div className="h-[350px] w-full relative">
          {activeData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={130}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    animationDuration={1000}
                  >
                    {activeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0a0a0c', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }}
                    formatter={(value) => formatVal(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{timeframe} Total</p>
                <p className={`text-3xl font-black text-white ${privacyMode ? 'blur-md' : ''}`}>
                  {formatVal(totalValue)}
                </p>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center flex-col text-slate-600">
              <PieIcon size={48} className="opacity-20 mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest">No Data to Visualize</p>
              <p className="text-xs mt-2 italic">Add {activeTab.toLowerCase()} amounts to see breakdown</p>
            </div>
          )}
        </div>

        {/* Legend/Details Section */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {activeData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-bold text-slate-200">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black text-white ${privacyMode ? 'blur-sm' : ''}`}>{formatVal(item.value)}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">
                    {((item.value / totalValue) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-3">
            <Calendar size={18} className="text-indigo-400" />
            <p className="text-[10px] font-medium text-slate-400 leading-tight">
              Showing aggregated <span className="text-white font-bold">{timeframe.toLowerCase()}</span> projections based on your active budget entries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetPieChart;
