import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../../context/AppContext.js';
import { formatCurrency } from '../../../utils/currencyFormatter.js';
import { PlusCircle, Search, Calendar, ChevronRight } from 'lucide-react';

const TransactionLog = ({ activeTab, categories, transactions = [], onAddTransaction }) => {
  const { currency, convertAmount, exchangeRate, privacyMode } = useAppContext();
  const [filter, setFilter] = useState('');

  const [newTransaction, setNewTransaction] = useState({ 
    description: '', 
    amount: '', 
    category: categories[0] || 'Food',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTransaction.description || !newTransaction.amount) return;

    const amountInUsd = currency === 'KRW' ? parseFloat(newTransaction.amount) / exchangeRate : parseFloat(newTransaction.amount);
    
    const transaction = {
      id: Date.now(),
      date: newTransaction.date,
      description: newTransaction.description,
      category: newTransaction.category,
      type: activeTab,
      amountUsd: amountInUsd
    };

    onAddTransaction(transaction);
    setNewTransaction({ 
      description: '', 
      amount: '', 
      category: categories[0] || (activeTab === 'Expense' ? 'Food' : 'Salary'),
      date: new Date().toISOString().split('T')[0]
    });
  };

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => t.type === activeTab)
      .filter(t => 
        t.description.toLowerCase().includes(filter.toLowerCase()) || 
        t.category.toLowerCase().includes(filter.toLowerCase())
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, activeTab, filter]);

  const groupedTransactions = useMemo(() => {
    const groups = {};
    filteredTransactions.forEach(t => {
      if (!groups[t.date]) groups[t.date] = [];
      groups[t.date].push(t);
    });
    return groups;
  }, [filteredTransactions]);

  const sortedDates = useMemo(() => {
    return Object.keys(groupedTransactions).sort((a, b) => new Date(b) - new Date(a));
  }, [groupedTransactions]);

  const formatVal = (usd) => {
    if (privacyMode) return currency === 'USD' ? '$X,XXX' : '₩X,XXX';
    return formatCurrency(convertAmount(usd, 'USD', currency), currency);
  };

  return (
    <div className="space-y-8">
      {/* Add New Transaction Form */}
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
          <PlusCircle size={120} />
        </div>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <PlusCircle size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Log New {activeTab}</h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Manual Entry</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Description</label>
            <input
              type="text"
              placeholder="e.g. Starbucks Coffee"
              value={newTransaction.description}
              onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Amount ({currency})</label>
            <input
              type="number"
              placeholder="0.00"
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Category</label>
            <select
              value={newTransaction.category}
              onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all appearance-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Date</label>
            <input
              type="date"
              value={newTransaction.date}
              onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="lg:col-span-5 flex justify-end">
            <button 
              type="submit" 
              className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest text-white transition-all shadow-xl hover:-translate-y-0.5 active:scale-95 ${activeTab === 'Expense' ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'}`}
            >
              Confirm {activeTab}
            </button>
          </div>
        </form>
      </div>

      {/* Grouped Transaction History */}
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2 px-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white">Chronological History</h2>
            <div className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
              {filteredTransactions.length} Logs
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text" 
              placeholder="Search logs..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-white/10 bg-black/40 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full md:w-64"
            />
          </div>
        </div>

        {sortedDates.length > 0 ? (
          sortedDates.map(date => (
            <div key={date} className="space-y-3">
              <div className="flex items-center gap-4 px-2">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                  <Calendar size={12} className="text-indigo-400" />
                  {new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              <div className="grid grid-cols-1 gap-3">
                {groupedTransactions[date].map(t => (
                  <div 
                    key={t.id} 
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl bg-black/40 border border-white/5 ${t.type === 'Expense' ? 'text-rose-400' : 'text-emerald-400'}`}>
                        <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{t.description}</p>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.category}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-sm font-black ${t.type === 'Expense' ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {t.type === 'Expense' ? '-' : '+'}{formatVal(t.amountUsd)}
                      </p>
                      <p className="text-[9px] font-bold text-slate-600 uppercase">Settled</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
            <Calendar size={48} className="mx-auto text-slate-700 mb-4 opacity-20" />
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No activity found</p>
            <p className="text-xs text-slate-600 mt-2 italic">Try adjusting your filters or active tab</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionLog;

