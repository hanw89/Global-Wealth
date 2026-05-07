import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext.js';
import { formatCurrency } from '../../utils/currencyFormatter.js';
import ExpenseLog from './components/ExpenseLog.jsx';
import { Plus, Wallet, TrendingUp, TrendingDown, MoreHorizontal } from 'lucide-react';

const MoneyManagement = () => {
  const { currency, exchangeRate, convertAmount } = useAppContext();
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [activeTab, setActiveTab] = useState('Expense'); // 'Income' or 'Expense'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingId, setEditingId] = useState(null);
  
  const [expenseCategories, setExpenseCategories] = useState([
    { id: 1, category: 'Food', amountUsd: 450.00, icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z', color: 'text-emerald-600', bg: 'bg-emerald-50', darkBg: 'dark:bg-emerald-900/20', subCategories: ['Groceries', 'Eating out'] },
    { id: 2, category: 'Living Expense', amountUsd: 1200.00, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', color: 'text-blue-600', bg: 'bg-blue-50', darkBg: 'dark:bg-blue-900/20', subCategories: ['Rent', 'Utilities', 'Maintenance'] },
    { id: 3, category: 'Transport', amountUsd: 200.00, icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 100 2 1 1 0 000-2zm7 0a1 1 0 100 2 1 1 0 000-2z', color: 'text-indigo-600', bg: 'bg-indigo-50', darkBg: 'dark:bg-indigo-900/20', subCategories: ['Public Transport', 'Fuel', 'Parking'] },
    { id: 4, category: 'Travel', amountUsd: 0, icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.065M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M9 21h6', color: 'text-cyan-600', bg: 'bg-cyan-50', darkBg: 'dark:bg-cyan-900/20', subCategories: ['Flights', 'Hotels', 'Sightseeing'] },
    { id: 5, category: 'Gift', amountUsd: 50.00, icon: 'M20 12V8H4v4m16 0a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2m16 0h-16', color: 'text-rose-600', bg: 'bg-rose-50', darkBg: 'dark:bg-rose-900/20', subCategories: ['Family', 'Friends', 'Charity'] },
    { id: 6, category: 'Education', amountUsd: 100.00, icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222', color: 'text-purple-600', bg: 'bg-purple-50', darkBg: 'dark:bg-purple-900/20', subCategories: ['Tuition', 'Books', 'Courses'] },
    { id: 7, category: 'Medical', amountUsd: 80.00, icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', color: 'text-red-600', bg: 'bg-red-50', darkBg: 'dark:bg-red-900/20', subCategories: ['Doctor', 'Pharmacy', 'Health Insurance'] },
    { id: 8, category: 'Subscription', amountUsd: 120.00, icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', color: 'text-orange-600', bg: 'bg-orange-50', darkBg: 'dark:bg-orange-900/20', subCategories: ['Streaming', 'Software', 'Gym'] },
  ]);

  const [incomeCategories, setIncomeCategories] = useState([
    { id: 101, category: 'Salary', amountUsd: 5000.00, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16V15', color: 'text-green-600', bg: 'bg-green-50', darkBg: 'dark:bg-green-900/20', subCategories: ['Base Salary', 'Bonus'] },
    { id: 102, category: 'Freelance', amountUsd: 800.00, icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'text-teal-600', bg: 'bg-teal-50', darkBg: 'dark:bg-teal-900/20', subCategories: ['Web Dev', 'Consulting'] },
    { id: 103, category: 'Investments', amountUsd: 350.00, icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', color: 'text-blue-600', bg: 'bg-blue-50', darkBg: 'dark:bg-blue-900/20', subCategories: ['Dividends', 'Interest'] },
  ]);

  const activeCategories = activeTab === 'Expense' ? expenseCategories : incomeCategories;
  const setActiveCategories = activeTab === 'Expense' ? setExpenseCategories : setIncomeCategories;

  const totalExpenseUsd = expenseCategories.reduce((acc, curr) => acc + curr.amountUsd, 0);
  const totalIncomeUsd = incomeCategories.reduce((acc, curr) => acc + curr.amountUsd, 0);
  const currentTotalUsd = activeTab === 'Expense' ? totalExpenseUsd : totalIncomeUsd;

  const displayFormat = (amountUsd) => {
    if (isPrivacyMode) return currency === 'USD' ? '$X,XXX.XX' : '₩X,XXX,XXX';
    return formatCurrency(convertAmount(amountUsd, 'USD', currency), currency);
  };

  const handleAmountChange = (id, newAmount) => {
    const numericAmount = parseFloat(newAmount) || 0;
    const amountInUsd = currency === 'KRW' ? numericAmount / exchangeRate : numericAmount;
    
    setActiveCategories(activeCategories.map(item => 
      item.id === id ? { ...item, amountUsd: amountInUsd } : item
    ));
  };

  const handleSave = () => {
    setEditingId(null);
  };

  const addCategory = () => {
    const name = prompt(`Enter new ${activeTab} category name:`);
    if (name) {
      const newCat = {
        id: Date.now(),
        category: name,
        amountUsd: 0,
        icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
        color: 'text-slate-600',
        bg: 'bg-slate-50',
        darkBg: 'dark:bg-slate-900/20',
        subCategories: []
      };
      setActiveCategories([...activeCategories, newCat]);
    }
  };

  const addSubCategory = (categoryId) => {
    const name = prompt('Enter sub-category name:');
    if (name) {
      setActiveCategories(activeCategories.map(cat => 
        cat.id === categoryId 
          ? { ...cat, subCategories: [...(cat.subCategories || []), name] }
          : cat
      ));
    }
  };

  const allCategoryNames = activeCategories.flatMap(cat => [
    cat.category,
    ...(cat.subCategories || []).map(sub => `${cat.category}: ${sub}`)
  ]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Navigation & Summary */}
        <aside className="w-full lg:w-72 space-y-4">
          <div className="bg-white dark:bg-white/[0.03] backdrop-blur-xl p-4 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Management</h3>
              <button 
                onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                className={`p-1.5 rounded-lg transition-colors ${isPrivacyMode ? 'bg-slate-900 dark:bg-white/10 text-white dark:text-white' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
              >
                <MoreHorizontal size={16} />
              </button>
            </div>

            <div className="flex p-1 bg-slate-100 dark:bg-black/40 rounded-xl mb-6">
              <button 
                onClick={() => { setActiveTab('Expense'); setSelectedCategory('All'); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'Expense' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
              >
                <TrendingDown size={14} />
                Expense
              </button>
              <button 
                onClick={() => { setActiveTab('Income'); setSelectedCategory('All'); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'Income' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
              >
                <TrendingUp size={14} />
                Income
              </button>
            </div>
            
            <nav className="space-y-1">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedCategory === 'All' ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
              >
                <span>All {activeTab}s</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${selectedCategory === 'All' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                  {activeCategories.length}
                </span>
              </button>
              
              {activeCategories.map((item) => (
                <div key={item.id}>
                  <button
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
                  {selectedCategory === item.category && item.subCategories && (
                    <div className="ml-9 mt-1 space-y-1">
                      {item.subCategories.map(sub => (
                        <div key={sub} className="px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                          {sub}
                        </div>
                      ))}
                      <button 
                        onClick={() => addSubCategory(item.id)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
                      >
                        <Plus size={12} />
                        Add Sub
                      </button>
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={addCategory}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all border border-dashed border-indigo-200 dark:border-indigo-800/50 mt-4"
              >
                <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
                  <Plus size={16} />
                </div>
                <span>Add Category</span>
              </button>
            </nav>
          </div>

          <div className={`${activeTab === 'Expense' ? 'bg-slate-900' : 'bg-emerald-900'} dark:bg-slate-800 p-6 rounded-2xl text-white shadow-lg overflow-hidden relative border border-white/5`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total {activeTab} ({currency})</p>
            <p className={`text-2xl font-black transition-all ${isPrivacyMode ? 'blur-md' : ''}`}>
              {displayFormat(currentTotalUsd)}
            </p>
            <div className="absolute -right-2 -bottom-2 opacity-10">
              <Wallet size={64} />
            </div>
          </div>
        </aside>

        {/* Right Side: Content Area */}
        <main className="flex-1 space-y-6">
          <div className="bg-white dark:bg-white/[0.03] backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {selectedCategory === 'All' ? `${activeTab} Overview` : `${selectedCategory} Breakdown`}
              </h2>
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500 uppercase">May 2026</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeCategories
                .filter(item => selectedCategory === 'All' || item.category === selectedCategory)
                .map((item) => (
                <div key={item.id} className="p-5 rounded-2xl border border-slate-100 dark:border-white/[0.05] bg-slate-50/50 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.05] hover:shadow-md transition-all group relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-xl ${item.bg} ${item.darkBg} ${item.color}`}>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                      </svg>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => addSubCategory(item.id)}
                        className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter hover:text-indigo-700 transition-colors"
                      >
                        + Sub
                      </button>
                      <button 
                        onClick={() => editingId === item.id ? handleSave() : setEditingId(item.id)}
                        className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        {editingId === item.id ? 'Save' : 'Edit'}
                      </button>
                    </div>
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

                  {item.subCategories && item.subCategories.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.subCategories.map(sub => (
                        <span key={sub} className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                          {sub}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 w-full bg-slate-200 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${item.color.replace('text', 'bg')}`}
                      style={{ width: `${currentTotalUsd > 0 ? (item.amountUsd / currentTotalUsd * 100).toFixed(0) : 0}%` }}
                    ></div>
                  </div>
                  <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    {currentTotalUsd > 0 ? (item.amountUsd / currentTotalUsd * 100).toFixed(1) : 0}% of total monthly {activeTab.toLowerCase()}
                  </p>
                </div>
              ))}
            </div>

            {selectedCategory === 'All' && activeTab === 'Expense' && (
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-2">
                  <span>Spending Progress</span>
                  <span>{((totalExpenseUsd / 7500) * 100).toFixed(0)}% of Goal ({displayFormat(7500)})</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/5 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-slate-900 dark:bg-white h-full rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((totalExpenseUsd / 7500) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Privacy Disclaimer */}
          {isPrivacyMode && (
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-4 rounded-2xl flex items-center gap-3">
              <div className="text-amber-600 dark:text-amber-500">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium italic">
                Values are currently masked. Testing in public mode is active.
              </p>
            </div>
          )}

          <div className="mt-12">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Transaction Log</h2>
            <ExpenseLog key={activeTab} activeTab={activeTab} categories={allCategoryNames} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MoneyManagement;
