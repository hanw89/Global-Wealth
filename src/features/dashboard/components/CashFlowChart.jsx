import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const data = [
  { month: 'May 25', krw: 1200000, usd: 888 },
  { month: 'Jun 25', krw: 1200000, usd: 870 },
  { month: 'Jul 25', krw: 1200000, usd: 865 },
  { month: 'Aug 25', krw: 1250000, usd: 910 },
  { month: 'Sep 25', krw: 1250000, usd: 905 },
  { month: 'Oct 25', krw: 1250000, usd: 920 },
  { month: 'Nov 25', krw: 1250000, usd: 915 },
  { month: 'Dec 25', krw: 1300000, usd: 960 },
  { month: 'Jan 26', krw: 1300000, usd: 955 },
  { month: 'Feb 26', krw: 1300000, usd: 965 },
  { month: 'Mar 26', krw: 1300000, usd: 960 },
  { month: 'Apr 26', krw: 1300000, usd: 962 },
];

const CashFlowChart = () => {
  return (
    <div className="w-full h-[400px] rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6 px-2">
        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Rental Cash Flow</h3>
          <p className="text-xs text-slate-400">12-Month Performance Trend</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-tighter">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="text-slate-300">Income (KRW)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-300">USD Equivalent</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
          <defs>
            <linearGradient id="colorKrw" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorUsd" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
            dy={10}
          />
          <YAxis 
            yAxisId="left"
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
            tickFormatter={(val) => `₩${(val / 10000).toFixed(0)}만`}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
            tickFormatter={(val) => `$${val}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e1e24', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#fff'
            }}
            itemStyle={{ color: '#fff' }}
          />
          <Area 
            yAxisId="left"
            type="monotone" 
            dataKey="krw" 
            stroke="#6366f1" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorKrw)" 
            animationDuration={2000}
          />
          <Area 
            yAxisId="right"
            type="monotone" 
            dataKey="usd" 
            stroke="#10b981" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorUsd)" 
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CashFlowChart;
