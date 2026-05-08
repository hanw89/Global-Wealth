import React from 'react';
import { useAppContext } from '../context/AppContext.js';
import * as XLSX from 'xlsx';
import { DEFAULT_EXPENSES, DEFAULT_INCOME } from '../utils/budgetDefaults.js';
import { Download, Upload } from 'lucide-react';

const Settings = () => {
  const { theme, setTheme, currency, setCurrency, exchangeRate, setExchangeRate, convertAmount } = useAppContext();

  const exportData = () => {
    const expenseCategories = JSON.parse(localStorage.getItem('budget-expenses')) || DEFAULT_EXPENSES;
    const incomeCategories = JSON.parse(localStorage.getItem('budget-income')) || DEFAULT_INCOME;

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

        const expenseCategories = JSON.parse(localStorage.getItem('budget-expenses')) || DEFAULT_EXPENSES;
        const incomeCategories = JSON.parse(localStorage.getItem('budget-income')) || DEFAULT_INCOME;

        const newExpenses = [...expenseCategories];
        const newIncome = [...incomeCategories];
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
            const isIncome = typeRaw.includes('income') || typeRaw === 'in' || typeRaw === '1';
            const categoryClean = categoryRaw.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').replace(/[\u{2600}-\u{27BF}]/gu, '').trim();
            
            const targetList = isIncome ? newIncome : newExpenses;
            const normCategory = categoryClean.toLowerCase();
            
            const idx = targetList.findIndex(c => 
              c.category.toLowerCase() === normCategory || 
              normCategory.includes(c.category.toLowerCase()) ||
              c.category.toLowerCase().includes(normCategory)
            );
            
            let finalCategoryName = categoryRaw;
            
            if (idx > -1) {
              finalCategoryName = targetList[idx].category;
              targetList[idx].amountUsd += amount;
            } else {
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

        localStorage.setItem('budget-expenses', JSON.stringify(newExpenses));
        localStorage.setItem('budget-income', JSON.stringify(newIncome));
        localStorage.setItem('budget-transactions', JSON.stringify(newTransactions));
        
        alert(`Successfully imported ${importCount} budget entries! Data is saved locally.`);
      } catch (error) {
        console.error('Import Error:', error);
        alert('Failed to parse the Excel file. Please ensure it is a valid budget spreadsheet.');
      }
    };
    reader.readAsBinaryString(file);
    // Reset file input so user can re-import the same file if needed
    e.target.value = null;
  };

  return (
    <div className="mx-auto max-w-2xl font-sans">
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="border-b border-white/5 px-6 py-4">
          <h2 className="text-lg font-medium text-white">General Settings</h2>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Theme Setting */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Appearance</p>
              <p className="text-xs text-slate-500">Switch between light and dark mode</p>
            </div>
            <div className="flex rounded-lg bg-black/40 p-1 border border-white/5">
              <button 
                onClick={() => setTheme('light')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${theme === 'light' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Light
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${theme === 'dark' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Dark
              </button>
            </div>
          </div>

          {/* Currency Setting */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Base Currency</p>
              <p className="text-xs text-slate-500">Display all values in this currency</p>
            </div>
            <select 
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
            >
              <option value="USD" className="bg-[#0a0a0c]">USD ($)</option>
              <option value="KRW" className="bg-[#0a0a0c]">KRW (₩)</option>
            </select>
          </div>

          {/* Exchange Rate Setting */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Manual Exchange Rate</p>
              <p className="text-xs text-slate-500">1 USD = ? KRW</p>
            </div>
            <input 
              type="number" 
              value={exchangeRate}
              onChange={(e) => setExchangeRate(Number(e.target.value))}
              className="w-32 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white text-right focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl">
        <h3 className="text-sm font-semibold text-white">Data Portability</h3>
        <p className="mt-1 text-xs text-slate-500">Import or export your financial data as an Excel file.</p>
        <div className="mt-4 flex gap-3">
          <button 
            onClick={exportData}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-indigo-400 hover:bg-white/5 hover:text-indigo-300 transition-colors"
          >
            <Download size={16} />
            Export Data
          </button>
          
          <label className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-emerald-400 hover:bg-white/5 hover:text-emerald-300 transition-colors cursor-pointer">
            <Upload size={16} />
            Import Data
            <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={importData} />
          </label>
        </div>
      </div>
    </div>
  );
};

export default Settings;
