import React, { useState } from 'react';
import { useAppContext } from '../../../context/AppContext.js';
import { formatCurrency } from '../../../utils/currencyFormatter.js';
import { PlusCircle, Search } from 'lucide-react';

const TransactionLog = ({ activeTab, categories }) => {
  const { currency, convertAmount, exchangeRate } = useAppContext();
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('');

  const [newTransaction, setNewTransaction] = useState({ 
    description: '', 
    amount: '', 
    category: categories[0] || 'Food',
    type: activeTab 
  });

  const addTransaction = (e) => {
    e.preventDefault();
    if (!newTransaction.description || !newTransaction.amount) return;

    const amountInUsd = currency === 'KRW' ? parseFloat(newTransaction.amount) / exchangeRate : parseFloat(newTransaction.amount);
    
    const transaction = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      description: newTransaction.description,
      category: newTransaction.category,
      type: activeTab,
      amountUsd: amountInUsd
    };

    setTransactions([transaction, ...transactions]);
    setNewTransaction({ 
      description: '', 
      amount: '', 
      category: categories[0] || (activeTab === 'Expense' ? 'Food' : 'Salary'),
      type: activeTab 
    });
  };

  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(filter.toLowerCase()) || 
    t.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] backdrop-blur-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <PlusCircle size={18} className="text-indigo-600" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New {activeTab}</h3>
        </div>
        <form onSubmit={addTransaction} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <input
              type="text"
              placeholder="Description (e.g. Lunch)"
              value={newTransaction.description}
              onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-black/40 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder={`Amount (${currency})`}
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-black/40 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <select
              value={newTransaction.category}
              onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-black/40 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <button type="submit" className={`rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-95 ${activeTab === 'Expense' ? 'bg-slate-900 hover:bg-slate-800' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
            Log {activeTab}
          </button>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] backdrop-blur-xl shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 dark:border-white/[0.05] px-6 py-4 bg-slate-50/50 dark:bg-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Recent Activity</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search transactions..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-black/40 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64 text-slate-900 dark:text-white"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/[0.02] text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-400">{t.date}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{t.description}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-tight bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {t.category}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right tabular-nums font-black ${t.type === 'Expense' ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {t.type === 'Expense' ? '-' : '+'}{formatCurrency(convertAmount(t.amountUsd, 'USD', currency), currency)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 italic text-sm">
                    No transactions found for this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionLog;
