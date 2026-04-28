import React, { useState, useMemo } from 'react';
import { Calculator, Save, Percent } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext.jsx';
import { formatCurrency } from '../../../utils/currencyFormatter.js';

const RentalTrackerForm = () => {
  const { exchangeRate } = useAppContext();
  const [formData, setFormData] = useState({
    propertyName: '',
    monthlyRent: '',
    taxRate: 0.1, // 10%
  });

  const netIncomeKrw = useMemo(() => {
    const rent = parseFloat(formData.monthlyRent) || 0;
    return rent * (1 - formData.taxRate);
  }, [formData.monthlyRent, formData.taxRate]);

  const netIncomeUsd = useMemo(() => {
    return netIncomeKrw / exchangeRate;
  }, [netIncomeKrw, exchangeRate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Saving Rental Data:', { ...formData, netIncomeKrw, netIncomeUsd });
    // Reset or handle persistence
    alert('Rental income data saved (Simulation)');
  };

  return (
    <div className="rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
          <Calculator size={20} />
        </div>
        <h3 className="text-lg font-bold text-white">Rental Income Tracker</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 px-1">Property Name</label>
          <input
            type="text"
            placeholder="e.g., Gangnam Studio A"
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            value={formData.propertyName}
            onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 px-1">Monthly Rent (KRW)</label>
            <div className="relative">
              <input
                type="number"
                placeholder="1,200,000"
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all pl-9"
                value={formData.monthlyRent}
                onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
                required
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">₩</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 px-1">Tax Rate (Korea)</label>
            <div className="flex p-1 bg-black/40 border border-white/10 rounded-2xl h-[46px]">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, taxRate: 0.1 })}
                className={`flex-1 rounded-xl text-xs font-bold transition-all ${formData.taxRate === 0.1 ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                10%
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, taxRate: 0.2 })}
                className={`flex-1 rounded-xl text-xs font-bold transition-all ${formData.taxRate === 0.2 ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                20%
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 p-5 rounded-2xl bg-indigo-600/5 border border-indigo-500/10 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-medium">Net Income (KRW)</span>
            <span className="text-sm font-black text-emerald-400">{formatCurrency(netIncomeKrw, 'KRW')}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-medium">Net Income (USD Eq.)</span>
            <span className="text-sm font-black text-white">{formatCurrency(netIncomeUsd, 'USD')}</span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-3.5 rounded-2xl hover:bg-slate-200 transition-all shadow-xl active:scale-95"
        >
          <Save size={18} />
          Save Rental Record
        </button>
      </form>
    </div>
  );
};

export default RentalTrackerForm;
