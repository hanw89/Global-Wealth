import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext.js';
import { formatCurrency } from '../../utils/currencyFormatter.js';
import ExpenseLog from './components/ExpenseLog.jsx';
import BudgetPieChart from './components/BudgetPieChart.jsx';
import CategoryMonthlyView from './components/CategoryMonthlyView.jsx';
import { Plus, Wallet, TrendingUp, TrendingDown, MoreHorizontal, Download, Upload, RotateCcw, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

const MoneyManagement = () => {
  const { currency, exchangeRate, convertAmount, theme } = useAppContext();
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [activeTab, setActiveTab] = useState('Expense'); // 'Income' or 'Expense'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Default Categories Configuration
  const DEFAULT_EXPENSES = [
    { id: 1, category: 'Food', amountUsd: 0, icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z', color: 'text-emerald-600', subCategories: ['Groceries', 'Eating out'] },
    { id: 2, category: 'Living Expense', amountUsd: 0, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', color: 'text-blue-600', subCategories: ['Rent', 'Utilities', 'Maintenance'] },
    { id: 3, category: 'Transport', amountUsd: 0, icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 100 2 1 1 0 000-2zm7 0a1 1 0 100 2 1 1 0 000-2z', color: 'text-indigo-600', subCategories: ['Public Transport', 'Fuel', 'Parking'] },
    { id: 4, category: 'Travel', amountUsd: 0, icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.065M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M9 21h6', color: 'text-cyan-600', subCategories: ['Flights', 'Hotels', 'Sightseeing'] },
    { id: 5, category: 'Gift', amountUsd: 0, icon: 'M20 12V8H4v4m16 0a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2m16 0h-16', color: 'text-rose-600', subCategories: ['Family', 'Friends', 'Charity'] },
    { id: 6, category: 'Education', amountUsd: 0, icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222', color: 'text-purple-600', subCategories: ['Tuition', 'Books', 'Courses'] },
  ];

  const DEFAULT_INCOME = [
    { id: 101, category: 'Salary', amountUsd: 0, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16V15', color: 'text-green-600', subCategories: ['Base Salary', 'Bonus'] },
    { id: 102, category: 'Investments', amountUsd: 0, icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', color: 'text-blue-600', subCategories: ['Dividends', 'Interest'] },
  ];

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

  const exportData = () => {
    const data = [
      ['Type', 'Category', 'Amount (USD)', 'Amount (Selected Currency)', 'Currency Used'],
      ...expenseCategories.map(c => ['Expense', c.category, c.amountUsd.toFixed(2), convertAmount(c.amountUsd, 'USD', currency).toFixed(0), currency]),
      ...incomeCategories.map(c => ['Income', c.category, c.amountUsd.toFixed(2), convertAmount(c.amountUsd, 'USD', currency).toFixed(0), currency])
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Budget');
    XLSX.writeFile(wb, `GlobalWealth_Budget_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (!data || data.length === 0) {
          alert('The excel file seems to be empty.');
          return;
        }

        // Keep current categories but reset their all-time totals if we want to sync
        // Actually, with the new filtered view, we should keep the full history in transactions.
        // We will just replace the transactions list with the imported one.
        const newTransactions = [];
        let importCount = 0;

        data.forEach(row => {
          const typeRaw = (row['Income/Expense'] || row['Type'] || row['type'] || '').toString().toLowerCase();
          const categoryRaw = (row['Category'] || row['category'] || '').toString().trim();
          const subCategory = row['Subcategory'] || row['subcategory'];
          const amount = parseFloat(row['USD'] || row['Amount (USD)'] || row['Amount'] || 0);
          const dateRaw = row['Period'] || row['Date'] || row['date'] || new Date();
          const description = row['Note'] || row['note'] || row['Accounts'] || row['accounts'] || categoryRaw;
          
          if (categoryRaw && !isNaN(amount)) {
            // Robust Income/Expense detection (handles 'Exp.' and 'Income')
            const isIncome = typeRaw.includes('income') || typeRaw === 'in' || typeRaw === '1';
            
            // Clean category for matching (strip emojis like 🍜 or 💰)
            const categoryClean = categoryRaw.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').replace(/[\u{2600}-\u{27BF}]/gu, '').trim();
            
            const targetList = isIncome ? newIncome : newExpenses;
            const normCategory = categoryClean.toLowerCase();
            
            // Match against existing categories (e.g. "🍜 Food" matches "Food")
            const idx = targetList.findIndex(c => 
              c.category.toLowerCase() === normCategory || 
              normCategory.includes(c.category.toLowerCase()) ||
              c.category.toLowerCase().includes(normCategory)
            );
            
            let finalCategoryName = categoryRaw;
            
            if (idx > -1) {
              finalCategoryName = targetList[idx].category; // Map to the website's clean name
              // Internal total is not used for monthly view anymore, but we update for consistency
              targetList[idx].amountUsd += amount;
            } else {
              // Create new category if it doesn't exist
              targetList.push({ 
                id: Date.now() + Math.random(), 
                category: categoryRaw, 
                amountUsd: amount, 
                icon: isIncome ? 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16V15' : 'M12 6v6m0 0v6m0-6h6m-6 0H6', 
                color: isIncome ? 'text-emerald-500' : 'text-slate-500',
                subCategories: subCategory ? [subCategory.toString()] : []
              });
            }

            let finalDate = dateRaw;
            if (!(dateRaw instanceof Date)) {
               finalDate = new Date(dateRaw);
            }
            const dateStr = isNaN(finalDate.getTime()) ? new Date().toISOString().split('T')[0] : finalDate.toISOString().split('T')[0];

            newTransactions.push({
              id: Date.now() + Math.random(),
              date: dateStr,
              description: description.toString(),
              category: finalCategoryName,
              type: isIncome ? 'Income' : 'Expense',
              amountUsd: amount,
              note: row['Note'] || row['note'] || ''
            });

            importCount++;
          }
        });

        setTransactions(newTransactions);
        alert(`Successfully imported ${importCount} budget entries! The dashboard is now updated to show data filtered by month.`);
      } catch (error) {
        console.error('Import Error:', error);
        alert('Failed to parse the Excel file. Please ensure it is a valid budget spreadsheet.');
      }
    };
    reader.readAsBinaryString(file);
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

            {/* Data Portability Tools */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              <button 
                onClick={exportData}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
              >
                <Download size={16} className="text-indigo-400 mb-1 group-hover:-translate-y-0.5 transition-transform" />
                <span className="text-[9px] font-black uppercase text-slate-500 group-hover:text-white">Export</span>
              </button>
              <label className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group cursor-pointer">
                <Upload size={16} className="text-emerald-400 mb-1 group-hover:-translate-y-0.5 transition-transform" />
                <span className="text-[9px] font-black uppercase text-slate-500 group-hover:text-white">Import</span>
                <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={importData} />
              </label>
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
              
              {activeCategories.map((item) => (
                <div key={item.id}>
                  <button
                    onClick={() => setSelectedCategory(item.category)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedCategory === item.category ? 'bg-white/10 text-white shadow-md' : 'text-slate-400 hover:bg-white/5'}`}
                  >
                    <div className={`p-1.5 rounded-lg ${selectedCategory === item.category ? 'bg-white/10' : 'bg-white/5 ' + item.color}`}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                      </svg>
                    </div>
                    <span className="flex-1 text-left">{item.category}</span>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeCategories
                .filter(item => selectedCategory === 'All' || item.category === selectedCategory)
                .map((item) => {
                  const monthlyAmount = monthlyCategoryTotals[item.category] || 0;
                  return (
                    <div key={item.id} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group relative shadow-inner">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-xl bg-white/5 ${item.color}`}>
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                          </svg>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => addSubCategory(item.id)}
                            className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter hover:text-indigo-300 transition-colors"
                          >
                            + Sub
                          </button>
                          <button 
                            onClick={() => editingId === item.id ? handleSave() : setEditingId(item.id)}
                            className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter hover:text-slate-300 transition-colors"
                          >
                            {editingId === item.id ? 'Save' : 'Edit'}
                          </button>
                        </div>
                      </div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">{item.category}</h4>
                      
                      {editingId === item.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-white">{currency === 'USD' ? '$' : '₩'}</span>
                          <input
                            type="number"
                            value={currency === 'KRW' ? (monthlyAmount * exchangeRate).toFixed(0) : monthlyAmount}
                            onChange={(e) => handleAmountChange(item.id, e.target.value)}
                            className="text-2xl font-black text-white bg-black/40 border border-white/10 rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-white/20"
                            autoFocus
                            onBlur={handleSave}
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                          />
                        </div>
                      ) : (
                        <p className={`text-2xl font-black text-white transition-all ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>
                          {displayFormat(monthlyAmount)}
                        </p>
                      )}

                      <div className="mt-4 w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${item.color.replace('text', 'bg')}`}
                          style={{ width: `${currentTotalUsd > 0 ? (monthlyAmount / currentTotalUsd * 100).toFixed(0) : 0}%` }}
                        ></div>
                      </div>
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
    </div>
  );
};

export default MoneyManagement;
