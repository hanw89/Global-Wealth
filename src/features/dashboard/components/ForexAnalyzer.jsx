import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeftRight, 
  TrendingDown, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  RefreshCw
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { fetchHistoricalForex, fetchExchangeRate } from '../../../services/marketService.js';
import { useAppContext } from '../../../context/AppContext.js';

const ForexAnalyzer = () => {
  const { privacyMode } = useAppContext();
  const [history, setHistory] = useState([]);
  const [currentRate, setCurrentRate] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hist, rate] = await Promise.all([
        fetchHistoricalForex(),
        fetchExchangeRate()
      ]);
      setHistory(hist);
      setCurrentRate(rate);
    } catch (error) {
      console.error('Forex Analysis Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function startFetching() {
      try {
        const [hist, rate] = await Promise.all([
          fetchHistoricalForex(),
          fetchExchangeRate()
        ]);
        if (!ignore) {
          setHistory(hist);
          setCurrentRate(rate);
        }
      } catch (error) {
        console.error('Forex Analysis Error:', error);
      }
    }

    startFetching();

    return () => {
      ignore = true;
    };
  }, []);



  const analysis = useMemo(() => {
    if (!history.length || !currentRate) return null;

    const avg = history.reduce((sum, d) => sum + d.close, 0) / history.length;
    const diff = ((currentRate - avg) / avg) * 100;
    
    // For USD/KRW:
    // If rate is LOWER than average, KRW is STRONGER (Good to buy USD)
    // If rate is HIGHER than average, KRW is WEAKER (Bad to buy USD)
    const isKrwStrong = currentRate < avg;
    const strengthPercent = Math.abs(diff).toFixed(1);

    return {
      average: avg,
      isKrwStrong,
      strengthPercent,
      recommendation: isKrwStrong 
        ? "Excellent time to transfer. KRW is trading at a premium compared to the yearly average."
        : "Consider waiting. KRW is currently weaker than the yearly average, meaning less USD per Won."
    };
  }, [history, currentRate]);

  return (
    <div className="rounded-[2.5rem] bg-[#0f0f12] border border-white/[0.05] p-8 shadow-2xl overflow-hidden relative">
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px]" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ArrowLeftRight size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Forex Optimizer</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">USD / KRW Strategy</p>
            </div>
          </div>
          <button 
            onClick={fetchData}
            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 transition-all"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Current Status */}
          <div className="lg:col-span-2 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4">
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${analysis?.isKrwStrong ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/20 text-rose-400 border border-rose-500/20'}`}>
                {analysis?.isKrwStrong ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                KRW is {analysis?.isKrwStrong ? 'Strong' : 'Weak'}
              </div>
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                {analysis?.strengthPercent}% {analysis?.isKrwStrong ? 'Below' : 'Above'} Yearly Avg
              </span>
            </div>
            
            <h2 className={`text-5xl font-black text-white tracking-tighter mb-4 ${privacyMode ? 'blur-xl' : ''}`}>
              1 USD = {currentRate?.toFixed(2)} ₩
            </h2>
            
            <p className="text-sm text-slate-400 font-medium max-w-md leading-relaxed">
              {analysis?.recommendation}
            </p>
          </div>

          {/* Average Stats */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 flex flex-col justify-center space-y-4">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">1-Year Average</p>
              <p className="text-xl font-bold text-white">₩{analysis?.average?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <Calendar size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Data Period</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Last 365 Days (Daily)</p>
            </div>
          </div>
        </div>

        {/* Historical Chart */}
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="colorForex" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
              <XAxis dataKey="date" hide />
              <YAxis domain={['auto', 'auto']} hide />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0a0a0c', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '12px',
                  fontSize: '10px'
                }}
                labelFormatter={() => "Exchange Rate"}
              />
              <Area 
                type="monotone" 
                dataKey="close" 
                stroke="#6366f1" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorForex)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ForexAnalyzer;
