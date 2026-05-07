import React, { useMemo } from 'react';
import { useAppContext } from '../../../context/AppContext.js';
import { formatCurrency } from '../../../utils/currencyFormatter.js';
import { Calendar, ChevronRight, Hash } from 'lucide-react';

const CategoryMonthlyView = ({ selectedCategory, transactions, currency, convertAmount, privacyMode }) => {
  const filteredTransactions = useMemo(() => {
    if (selectedCategory === 'All') return [];
    return transactions.filter(t => t.category === selectedCategory);
  }, [selectedCategory, transactions]);

  const monthlyGroups = useMemo(() => {
    const groups = {};
    filteredTransactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!groups[monthKey]) groups[monthKey] = {};
      
      const dayKey = t.date;
      if (!groups[monthKey][dayKey]) groups[monthKey][dayKey] = [];
      groups[monthKey][dayKey].push(t);
    });
    return groups;
  }, [filteredTransactions]);

  const sortedMonths = useMemo(() => {
    return Object.keys(monthlyGroups).sort((a, b) => new Date(b) - new Date(a));
  }, [monthlyGroups]);

  const formatVal = (usd) => {
    if (privacyMode) return currency === 'USD' ? '$X,XXX' : '₩X,XXX';
    return formatCurrency(convertAmount(usd, 'USD', currency), currency);
  };

  if (selectedCategory === 'All' || filteredTransactions.length === 0) return null;

  return (
    <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 px-2">
        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Hash size={18} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">{selectedCategory} Depth Analysis</h3>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Monthly Breakdown</p>
        </div>
      </div>

      {sortedMonths.map(month => (
        <div key={month} className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em] bg-indigo-500/5 px-4 py-1.5 rounded-full border border-indigo-500/10">
              {month}
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/20 to-transparent" />
            <span className="text-[10px] font-bold text-slate-500">
              {Object.values(monthlyGroups[month]).flat().length} Entries
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {Object.keys(monthlyGroups[month]).sort((a, b) => new Date(b) - new Date(a)).map(date => (
              <div key={date} className="bg-white/[0.02] border border-white/[0.05] rounded-3xl overflow-hidden">
                <div className="px-6 py-3 bg-white/[0.03] border-b border-white/[0.05] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-slate-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {new Date(date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">
                    Total: {formatVal(monthlyGroups[month][date].reduce((sum, t) => sum + t.amountUsd, 0))}
                  </span>
                </div>
                
                <div className="divide-y divide-white/[0.03]">
                  {monthlyGroups[month][date].map(t => (
                    <div key={t.id} className="px-6 py-4 flex items-center justify-between group hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-4">
                        <ChevronRight size={14} className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                        <div>
                          <p className="text-sm font-medium text-slate-200">{t.description}</p>
                          {t.note && <p className="text-[10px] text-slate-500 italic mt-0.5">{t.note}</p>}
                        </div>
                      </div>
                      <p className={`text-sm font-black ${t.type === 'Income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.type === 'Income' ? '+' : '-'}{formatVal(t.amountUsd)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryMonthlyView;
