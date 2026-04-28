import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext.jsx';
import { formatCurrency } from '../../utils/currencyFormatter.js';
import ExpenseLog from './components/ExpenseLog.jsx';

const DailySpending = () => {
  const { currency, exchangeRate, convertAmount } = useAppContext();
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingId, setEditingId] = useState(null);
  
  // Spending data in state (Values are in USD)
  const [spendingData, setSpendingData] = useState([
    { id: 1, category: 'Groceries', amountUsd: 1250.45, icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z', color: 'text-emerald-600', bg: 'bg-emerald-50', darkBg: 'dark:bg-emerald-900/20' },
    { id: 2, category: 'Housing', amountUsd: 3200.00, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', color: 'text-blue-600', bg: 'bg-blue-50', darkBg: 'dark:bg-blue-900/20' },
    { id: 3, category: 'Kids', amountUsd: 850.00, icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'text-indigo-600', bg: 'bg-indigo-50', darkBg: 'dark:bg-indigo-900/20' },
    { id: 4, category: 'Maintenance', amountUsd: 420.12, icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', color: 'text-amber-600', bg: 'bg-amber-50', darkBg: 'dark:bg-amber-900/20' },
  ]);

  const totalSpendingUsd = spendingData.reduce((acc, curr) => acc + curr.amountUsd, 0);

  const displayFormat = (amountUsd) => {
    if (isPrivacyMode) return currency === 'USD' ? '$X,XXX.XX' : '₩X,XXX,XXX';
    return formatCurrency(convertAmount(amountUsd, 'USD', currency), currency);
  };

  const handleAmountChange = (id, newAmount) => {
    const numericAmount = parseFloat(newAmount) || 0;
    const amountInUsd = currency === 'KRW' ? numericAmount / exchangeRate : numericAmount;
    
    setSpendingData(spendingData.map(item => 
      item.id === id ? { ...item, amountUsd: amountInUsd } : item
    ));
  };

  const handleSave = () => {
    setEditingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Categories List */}
        <aside className="w-full lg:w-72 space-y-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Categories</h3>
              <button 
                onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                className={`p-1.5 rounded-lg transition-colors ${isPrivacyMode ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                title="Toggle Privacy Mode"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.074m9.474 9.474l.582-.582m0 0a4.992 4.992 0 01-3.046-3.046m0 0l-.582.582m0 0L8.122 13.122m7.756 7.756l1.581 1.581m-1.581-1.581l1.581-1.581m-1.581 1.581A9.955 9.955 0 0112 19c4.478 0 8.268-2.943 9.543-7a10.025 10.025 0 00-4.132-5.411m0 0L21 3m-3 3L3 18" />
                </svg>
              </button>
            </div>
            
            <nav className="space-y-1">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedCategory === 'All' ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
              >
                <span>All Spending</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${selectedCategory === 'All' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                  {spendingData.length}
                </span>
              </button>
              
              {spendingData.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedCategory(item.category)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedCategory === item.category ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                >
                  <div className={`p-1.5 rounded-lg ${selectedCategory === item.category ? 'bg-white/10' : item.bg + ' ' + item.darkBg + ' ' + item.color}`}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                    </svg>
                  </div>
                  <span className="flex-1 text-left">{item.category}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="bg-slate-900 dark:bg-slate-800 p-6 rounded-2xl text-white shadow-lg overflow-hidden relative border border-white/5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Monthly ({currency})</p>
            <p className={`text-2xl font-black transition-all ${isPrivacyMode ? 'blur-md' : ''}`}>
              {displayFormat(totalSpendingUsd)}
            </p>
            <div className="absolute -right-2 -bottom-2 opacity-10">
              <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16V15" />
              </svg>
            </div>
          </div>
        </aside>

        {/* Right Side: Content Area */}
        <main className="flex-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {selectedCategory === 'All' ? 'Spending Overview' : `${selectedCategory} Breakdown`}
              </h2>
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500 uppercase">April 2026</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {spendingData
                .filter(item => selectedCategory === 'All' || item.category === selectedCategory)
                .map((item) => (
                <div key={item.id} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-white dark:hover:bg-slate-700 hover:shadow-md transition-all group relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-xl ${item.bg} ${item.darkBg} ${item.color}`}>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                      </svg>
                    </div>
                    <button 
                      onClick={() => editingId === item.id ? handleSave() : setEditingId(item.id)}
                      className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      {editingId === item.id ? 'Save' : 'Edit'}
                    </button>
                  </div>
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{item.category}</h4>
                  
                  {editingId === item.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">{currency === 'USD' ? '$' : '₩'}</span>
                      <input
                        type="number"
                        value={currency === 'KRW' ? (item.amountUsd * exchangeRate).toFixed(0) : item.amountUsd}
                        onChange={(e) => handleAmountChange(item.id, e.target.value)}
                        className="text-2xl font-black text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500"
                        autoFocus
                        onBlur={handleSave}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                      />
                    </div>
                  ) : (
                    <p className={`text-2xl font-black text-slate-900 dark:text-white transition-all ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>
                      {displayFormat(item.amountUsd)}
                    </p>
                  )}

                  <div className="mt-4 w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${item.color.replace('text', 'bg')}`}
                      style={{ width: `${totalSpendingUsd > 0 ? (item.amountUsd / totalSpendingUsd * 100).toFixed(0) : 0}%` }}
                    ></div>
                  </div>
                  <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    {totalSpendingUsd > 0 ? (item.amountUsd / totalSpendingUsd * 100).toFixed(1) : 0}% of total monthly spending
                  </p>
                </div>
              ))}
            </div>

            {selectedCategory === 'All' && (
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-2">
                  <span>Spending Progress</span>
                  <span>{((totalSpendingUsd / 7500) * 100).toFixed(0)}% of Goal ({displayFormat(7500)})</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-slate-900 dark:bg-slate-100 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((totalSpendingUsd / 7500) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Privacy Disclaimer */}
          {isPrivacyMode && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 p-4 rounded-xl flex items-center gap-3">
              <div className="text-amber-600 dark:text-amber-500">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-500/80 font-medium italic">
                Values are currently masked. Testing in public mode is active.
              </p>
            </div>
          )}

          {/* Expense Log Component */}
          <div className="mt-12">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Daily Log</h2>
            <ExpenseLog />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DailySpending;
