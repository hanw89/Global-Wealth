import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext.js';
import { formatCurrency } from '../../utils/currencyFormatter.js';
import ExpenseLog from './components/ExpenseLog.jsx';
import BudgetPieChart from './components/BudgetPieChart.jsx';
import CategoryMonthlyView from './components/CategoryMonthlyView.jsx';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, Wallet, TrendingUp, TrendingDown, MoreHorizontal, RotateCcw } from 'lucide-react';
import { DEFAULT_EXPENSES, DEFAULT_INCOME } from '../../utils/budgetDefaults.js';

const CustomTooltip = ({ active, payload, label, isPrivacyMode, displayFormat }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label} {payload[0].payload.year}</p>
        <p className="text-sm font-black text-white">
          {isPrivacyMode ? 'Masked' : displayFormat(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

const MoneyManagement = () => {
  const { currency, exchangeRate, convertAmount, theme } = useAppContext();
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [activeTab, setActiveTab] = useState('Expense'); // 'Income' or 'Expense'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedChartPoint, setSelectedChartPoint] = useState(null);

  // Load from LocalStorage
  const [expenseCategories, setExpenseCategories] = useState(() => {
    const saved = localStorage.getItem('budget-expenses');
    return saved ? JSON.parse(saved) : DEFAULT_EXPENSES;
  });

  const [incomeCategories, setIncomeCategories] = useState(() => {
    const saved = localStorage.getItem('budget-income');
    return saved ? JSON.parse(saved) : DEFAULT_INCOME;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('budget-transactions');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist to LocalStorage
  useEffect(() => {
    localStorage.setItem('budget-expenses', JSON.stringify(expenseCategories));
  }, [expenseCategories]);

  useEffect(() => {
    localStorage.setItem('budget-income', JSON.stringify(incomeCategories));
  }, [incomeCategories]);

  useEffect(() => {
    localStorage.setItem('budget-transactions', JSON.stringify(transactions));
  }, [transactions]);

  const activeCategories = activeTab === 'Expense' ? expenseCategories : incomeCategories;

  const setActiveCategories = (newList) => {
    if (activeTab === 'Expense') {
      setExpenseCategories(newList);
    } else {
      setIncomeCategories(newList);
    }
  };

  // Drag and Drop Logic
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  const handleDragStart = (index) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (index) => {
    if (draggedItemIndex === null) return;
    
    const newList = [...activeCategories];
    const draggedItem = newList[draggedItemIndex];
    newList.splice(draggedItemIndex, 1);
    newList.splice(index, 0, draggedItem);
    
    setActiveCategories(newList);
    setDraggedItemIndex(null);
  };

  // Monthly Filter Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [transactions, selectedMonth, selectedYear]);

  const monthlyCategoryTotals = useMemo(() => {
    const totals = {};
    filteredTransactions.forEach(t => {
      const cat = t.category.toString().trim();
      if (!totals[cat]) totals[cat] = 0;
      totals[cat] += t.amountUsd;
    });
    return totals;
  }, [filteredTransactions]);

  const currentTotalUsd = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === activeTab)
      .reduce((acc, curr) => acc + curr.amountUsd, 0);
  }, [filteredTransactions, activeTab]);

  const yearHistory = useMemo(() => {
    const months = [];
    const today = new Date();
    // Rolling 12 months ending with the current month
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        month: d.getMonth(),
        year: d.getFullYear(),
        label: d.toLocaleString('default', { month: 'short' })
      });
    }
    return months;
  }, []); // Static rolling 12 months based on "now"

  const categoryHistory = useMemo(() => {
    const history = {};
    
    activeCategories.forEach(cat => {
      history[cat.category] = yearHistory.map(m => ({ ...m, amount: 0 }));
    });

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      const tMonth = tDate.getMonth();
      const tYear = tDate.getFullYear();
      const tCat = t.category.toString().trim();
      
      if (history[tCat]) {
        // Match both month and year for rolling history
        const monthIndex = yearHistory.findIndex(m => m.month === tMonth && m.year === tYear);
        if (monthIndex > -1) {
          history[tCat][monthIndex].amount += t.amountUsd;
        }
      }
    });
    return history;
  }, [transactions, activeCategories, yearHistory]);

  const getHexColor = (colorClass) => {
    if (colorClass.includes('emerald')) return '#10b981'; // emerald-500
    if (colorClass.includes('blue')) return '#3b82f6'; // blue-500
    if (colorClass.includes('indigo')) return '#6366f1'; // indigo-500
    if (colorClass.includes('cyan')) return '#06b6d4'; // cyan-500
    if (colorClass.includes('rose')) return '#f43f5e'; // rose-500
    if (colorClass.includes('purple')) return '#a855f7'; // purple-500
    if (colorClass.includes('green')) return '#22c55e'; // green-500
    return '#64748b'; // slate-500
  };

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

  const resetData = () => {
    if (window.confirm('Are you sure you want to reset all budget data? This will clear all numbers.')) {
      setExpenseCategories(DEFAULT_EXPENSES);
      setIncomeCategories(DEFAULT_INCOME);
      setTransactions([]);
      setSelectedCategory('All');
    }
  };

  const handleAddTransaction = (transaction) => {
    setTransactions(prev => [transaction, ...prev]);
    
    // Also update the category totals
    const targetList = transaction.type === 'Income' ? incomeCategories : expenseCategories;
    const setTargetList = transaction.type === 'Income' ? setIncomeCategories : setExpenseCategories;
    
    const idx = targetList.findIndex(c => c.category === transaction.category);
    if (idx > -1) {
      const newList = [...targetList];
      newList[idx].amountUsd += transaction.amountUsd;
      setTargetList(newList);
    }
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

  const monthlyExpenses = useMemo(() => {
    return expenseCategories.map(c => ({
      ...c,
      amountUsd: monthlyCategoryTotals[c.category] || 0
    }));
  }, [expenseCategories, monthlyCategoryTotals]);

  const monthlyIncome = useMemo(() => {
    return incomeCategories.map(c => ({
      ...c,
      amountUsd: monthlyCategoryTotals[c.category] || 0
    }));
  }, [incomeCategories, monthlyCategoryTotals]);

  return (
    <div className="max-w-6xl mx-auto font-sans">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Navigation & Summary */}
        <aside className="w-full lg:w-72 space-y-4">
          <div className="bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Management</h3>
              <div className="flex gap-2">
                <button 
                  onClick={resetData}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                  title="Reset Data"
                >
                  <RotateCcw size={16} />
                </button>
                <button 
                  onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                  className={`p-1.5 rounded-lg transition-colors ${isPrivacyMode ? 'bg-white/10 text-white' : 'text-slate-500 hover:bg-white/5'}`}
                  title="Privacy Mode"
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>

            <div className="flex p-1 bg-black/40 rounded-xl mb-6">
              <button 
                onClick={() => { setActiveTab('Expense'); setSelectedCategory('All'); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'Expense' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500'}`}
              >
                <TrendingDown size={14} />
                Expense
              </button>
              <button 
                onClick={() => { setActiveTab('Income'); setSelectedCategory('All'); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'Income' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500'}`}
              >
                <TrendingUp size={14} />
                Income
              </button>
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedCategory === 'All' ? 'bg-white/10 text-white shadow-md' : 'text-slate-400 hover:bg-white/5'}`}
              >
                <span>All {activeTab}s</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${selectedCategory === 'All' ? 'bg-white/20' : 'bg-white/5 text-slate-500'}`}>
                  {activeCategories.length}
                </span>
              </button>
              
              {activeCategories.map((item, index) => (
                <div 
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                  className={`group relative transition-all ${draggedItemIndex === index ? 'opacity-30 scale-95' : 'opacity-100'}`}
                >
                  <button
                    onClick={() => setSelectedCategory(item.category)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-grab active:cursor-grabbing ${selectedCategory === item.category ? 'bg-white/10 text-white shadow-md' : 'text-slate-400 hover:bg-white/5'}`}
                  >
                    <div className={`p-1.5 rounded-lg transition-colors ${selectedCategory === item.category ? 'bg-white/10' : 'bg-white/5 ' + item.color}`}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                      </svg>
                    </div>
                    <span className="flex-1 text-left">{item.category}</span>
                    
                    {/* Drag Handle Indicator */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal size={14} className="text-slate-600 rotate-90" />
                    </div>
                  </button>
                </div>
              ))}

              <button
                onClick={addCategory}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-indigo-400 hover:bg-white/5 transition-all border border-dashed border-white/10 mt-4"
              >
                <div className="p-1.5 rounded-lg bg-indigo-500/10">
                  <Plus size={16} />
                </div>
                <span>Add Category</span>
              </button>
            </nav>
          </div>

          <div className={`${activeTab === 'Expense' ? 'bg-rose-500/10' : 'bg-emerald-500/10'} backdrop-blur-xl p-6 rounded-3xl text-white shadow-xl overflow-hidden relative border border-white/5`}>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total {activeTab} (Monthly)</p>
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
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">
                  {selectedCategory === 'All' ? `${activeTab} Overview` : `${selectedCategory} Breakdown`}
                </h2>
                <div className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                  Live
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-black text-white uppercase focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
                    <option key={m} value={i} className="bg-slate-900">{m}</option>
                  ))}
                </select>
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-black text-white uppercase focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {[2023, 2024, 2025, 2026].map(y => (
                    <option key={y} value={y} className="bg-slate-900">{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              {activeCategories
                .filter(item => selectedCategory === 'All' || item.category === selectedCategory)
                .map((item) => {
                  const monthlyAmount = monthlyCategoryTotals[item.category] || 0;
                  const percentage = currentTotalUsd > 0 ? (monthlyAmount / currentTotalUsd * 100).toFixed(1) : 0;
                  const isSelected = selectedCategory === item.category;
                  const historyData = categoryHistory[item.category] || [];

                  return (
                    <div 
                      key={item.id} 
                      onClick={() => setSelectedCategory(isSelected && selectedCategory !== 'All' ? 'All' : item.category)}
                      className={`group relative flex flex-col p-4 rounded-2xl border transition-all shadow-inner overflow-hidden cursor-pointer ${isSelected ? 'border-white/20 bg-white/[0.05] ring-1 ring-white/10' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'}`}
                    >
                      {/* Background Progress Indicator */}
                      <div 
                        className={`absolute left-0 top-0 bottom-0 opacity-[0.03] transition-all duration-1000 ${item.color.replace('text', 'bg')}`}
                        style={{ width: `${percentage}%` }}
                      ></div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10">
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-xl bg-white/5 ${item.color} shadow-lg transition-transform group-hover:scale-110`}>
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white mb-0.5">{item.category}</h4>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>
                                {percentage}% of {activeTab}
                              </span>
                              {item.subCategories?.length > 0 && (
                                <span className="text-[10px] text-slate-500 font-medium">
                                  • {item.subCategories.length} sub-categories
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          {editingId === item.id ? (
                            <div className="flex items-center gap-2 min-w-[120px]" onClick={e => e.stopPropagation()}>
                              <span className="text-lg font-black text-white">{currency === 'USD' ? '$' : '₩'}</span>
                              <input
                                type="number"
                                value={currency === 'KRW' ? (monthlyAmount * exchangeRate).toFixed(0) : monthlyAmount}
                                onChange={(e) => handleAmountChange(item.id, e.target.value)}
                                className="text-lg font-black text-white bg-black/40 border border-white/10 rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-white/20"
                                autoFocus
                                onBlur={handleSave}
                                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                              />
                            </div>
                          ) : (
                            <div className="text-right">
                              <p className={`text-lg font-black text-white transition-all ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>
                                {displayFormat(monthlyAmount)}
                              </p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                Current Usage
                              </p>
                            </div>
                          )}

                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                            <button 
                              onClick={() => addSubCategory(item.id)}
                              className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                              title="Add Sub-category"
                            >
                              <Plus size={14} />
                            </button>
                            <button 
                              onClick={() => editingId === item.id ? handleSave() : setEditingId(item.id)}
                              className="p-2 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                              title="Edit Amount"
                            >
                              <MoreHorizontal size={14} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 12-Month History Chart (Visible when selected) */}
                      {isSelected && (
                        <div className="mt-6 pt-6 border-t border-white/5 w-full h-48 z-10 animate-in fade-in slide-in-from-top-4 duration-500" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">12-Month Historical Breakdown</p>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${item.color.replace('text', 'bg')}`}></div>
                              <span className="text-[10px] font-bold text-white uppercase">{item.category}</span>
                            </div>
                          </div>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={historyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <Tooltip 
                                content={<CustomTooltip isPrivacyMode={isPrivacyMode} displayFormat={displayFormat} />}
                                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey={isPrivacyMode ? "dummy" : "amount"} 
                                stroke={getHexColor(item.color)} 
                                strokeWidth={3} 
                                dot={{ r: 4, fill: '#0f172a', stroke: getHexColor(item.color), strokeWidth: 2 }}
                                activeDot={{ 
                                  r: 6, 
                                  fill: getHexColor(item.color), 
                                  stroke: '#fff', 
                                  strokeWidth: 2,
                                  onClick: (e, payload) => {
                                    const data = payload?.payload || payload || e?.payload;
                                    if (data && data.month !== undefined) {
                                      setSelectedChartPoint({ category: item.category, ...data });
                                    }
                                  }
                                }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Categorical Depth View */}
          <CategoryMonthlyView 
            selectedCategory={selectedCategory} 
            transactions={transactions} 
            currency={currency} 
            convertAmount={convertAmount}
            privacyMode={isPrivacyMode}
          />

          {/* Privacy Disclaimer */}
          {isPrivacyMode && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-3">
              <div className="text-amber-500">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs text-amber-400 font-medium italic">
                Values are currently masked. Testing in public mode is active.
              </p>
            </div>
          )}

          {/* Visual Analysis */}
          <BudgetPieChart expenseCategories={monthlyExpenses} incomeCategories={monthlyIncome} />

          {/* Transaction Log */}
          <div className="mt-12">
            <h2 className="text-xl font-bold text-white mb-6">Transaction Log</h2>
            <ExpenseLog 
              key={activeTab} 
              activeTab={activeTab} 
              categories={allCategoryNames} 
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
            />
          </div>
        </main>
      </div>

      {/* Transaction Details Modal */}
      {selectedChartPoint && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
            <button 
              onClick={() => setSelectedChartPoint(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h3 className="text-xl font-bold text-white mb-1">{selectedChartPoint.category} Transactions</h3>
            <p className="text-xs text-slate-400 font-medium mb-6 uppercase tracking-wider">
              {selectedChartPoint.label} {selectedChartPoint.year}
            </p>
            
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {transactions
                .filter(t => {
                  const d = new Date(t.date);
                  return t.category === selectedChartPoint.category && d.getMonth() === selectedChartPoint.month && d.getFullYear() === selectedChartPoint.year;
                })
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map(t => (
                  <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div>
                      <p className="text-sm font-bold text-white">{t.description}</p>
                      <p className="text-[10px] text-slate-500">{t.date}</p>
                    </div>
                    <p className={`text-sm font-black ${t.type === 'Expense' ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {t.type === 'Expense' ? '-' : '+'}{displayFormat(t.amountUsd)}
                    </p>
                  </div>
                ))}
              {transactions.filter(t => {
                  const d = new Date(t.date);
                  return t.category === selectedChartPoint.category && d.getMonth() === selectedChartPoint.month && d.getFullYear() === selectedChartPoint.year;
                }).length === 0 && (
                  <div className="text-center py-10 opacity-50">
                    <p className="text-sm text-slate-400">No transactions found for this month.</p>
                  </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoneyManagement;
