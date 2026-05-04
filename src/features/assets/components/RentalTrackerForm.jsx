import React, { useState, useMemo } from 'react';
import { Calculator, Save, Percent, Receipt, Wallet, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useAppContext } from '../../../context/AppContext.jsx';
import { formatCurrency } from '../../../utils/currencyFormatter.js';

const RentalTrackerForm = () => {
  const { exchangeRate, privacyMode } = useAppContext();
  const [formData, setFormData] = useState({
    propertyName: '',
    monthlyRent: '',
    managementFee: '',
    taxRate: 0, 
  });

  const calculations = useMemo(() => {
    const grossRent = parseFloat(formData.monthlyRent) || 0;
    const managementFee = parseFloat(formData.managementFee) || 0;
    const estTax = grossRent * formData.taxRate;
    const netKrw = grossRent - managementFee - estTax;
    const netUsd = netKrw / exchangeRate;
    
    // Currency Conversion Fee (est 1%)
    const conversionFeeUsd = netUsd * 0.01;
    const finalNetUsd = netUsd - conversionFeeUsd;

    return {
      grossRent,
      managementFee,
      estTax,
      netKrw,
      finalNetUsd,
      conversionFeeUsd
    };
  }, [formData, exchangeRate]);

  // Data for Recharts
  const chartData = [
    {
      name: 'Monthly Income',
      Keep: calculations.finalNetUsd,
      Tax: calculations.estTax / exchangeRate,
      Fees: calculations.managementFee / exchangeRate,
      Conversion: calculations.conversionFeeUsd,
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Saving Rental Data:', { ...formData, ...calculations });
    alert('Rental record synchronized with global cash flow.');
  };

  const formatVal = (val, cur = 'USD') => formatCurrency(val, cur, { privacyMode });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Section */}
      <div className="rounded-[2.5rem] bg-[#0f0f12] border border-white/[0.05] p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Receipt size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Income Analysis</h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Net vs Gross Calculator</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Monthly Gross Rent (KRW)</label>
              <div className="relative group">
                <input
                  type="number"
                  className="w-full bg-black/60 border border-white/10 rounded-2xl px-10 py-4 text-sm text-white focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all outline-none font-bold"
                  value={formData.monthlyRent}
                  onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">₩</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Mgmt. Fees (KRW)</label>
                <div className="relative group">
                  <input
                    type="number"
                    className="w-full bg-black/60 border border-white/10 rounded-2xl px-10 py-4 text-sm text-white focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500/40 transition-all outline-none font-bold"
                    value={formData.managementFee}
                    onChange={(e) => setFormData({ ...formData, managementFee: e.target.value })}
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500 font-bold">₩</span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Est. Income Tax</label>
                <div className="flex p-1 bg-black/60 border border-white/10 rounded-2xl h-[54px]">
                  {[0.1, 0.2].map(rate => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setFormData({ ...formData, taxRate: rate })}
                      className={`flex-1 rounded-xl text-xs font-black transition-all ${formData.taxRate === rate ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                      {rate * 100}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 space-y-3">
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gross Income</span>
              <span className="text-sm font-bold text-white">{formatVal(calculations.grossRent, 'KRW')}</span>
            </div>
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] font-black text-rose-500/80 uppercase tracking-widest">Total Deductions</span>
              <span className="text-sm font-bold text-rose-500">-{formatVal(calculations.managementFee + calculations.estTax, 'KRW')}</span>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex justify-between items-center mt-4">
              <div>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-0.5">Final Monthly Net</p>
                <p className="text-xs text-slate-400 font-medium italic">After conversion & fees</p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-black text-white ${privacyMode ? 'blur-md' : ''}`}>{formatVal(calculations.finalNetUsd)}</p>
                <p className="text-[10px] font-bold text-slate-500">USD / Month</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-white text-black font-black text-sm hover:bg-emerald-400 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Commit to Ledger
          </button>
        </form>
      </div>

      {/* Chart Section */}
      <div className="rounded-[2.5rem] bg-[#0f0f12] border border-white/[0.05] p-8 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Net vs Gross</h3>
          </div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
            USD Projections
          </div>
        </div>

        <div className="flex-1 min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              barSize={60}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ffffff08" />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" hide />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{ 
                  backgroundColor: '#0a0a0c', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '16px',
                  fontSize: '11px',
                  fontWeight: '900',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}
                itemStyle={{ padding: '2px 0' }}
              />
              <Legend 
                verticalAlign="bottom" 
                align="center"
                iconType="circle"
                wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}
              />
              <Bar dataKey="Keep" stackId="a" fill="#10b981" radius={[8, 0, 0, 8]} />
              <Bar dataKey="Tax" stackId="a" fill="#6366f1" />
              <Bar dataKey="Fees" stackId="a" fill="#f59e0b" />
              <Bar dataKey="Conversion" stackId="a" fill="#f43f5e" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Efficiency</p>
            <p className="text-xl font-bold text-white">
              {((calculations.finalNetUsd / (calculations.grossRent / exchangeRate)) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Drag</p>
            <p className="text-xl font-bold text-rose-500">
              -{(100 - (calculations.finalNetUsd / (calculations.grossRent / exchangeRate)) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalTrackerForm;
