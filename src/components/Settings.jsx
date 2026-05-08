import React from 'react';
import { useAppContext } from '../context/AppContext.js';
import * as XLSX from 'xlsx';
import { DEFAULT_EXPENSES, DEFAULT_INCOME } from '../utils/budgetDefaults.js';
import { Download, Upload, Database, Coins } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Settings = () => {
  const { theme, setTheme, currency, setCurrency, exchangeRate, setExchangeRate, convertAmount } = useAppContext();

  const exportManagementData = () => {
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
    XLSX.writeFile(wb, `GlobalWealth_Management_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const importManagementData = (e) => {
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
        
        alert(`Successfully imported ${importCount} management entries! Data is saved locally.`);
      } catch (error) {
        console.error('Import Error:', error);
        alert('Failed to parse the Excel file. Please ensure it is a valid management spreadsheet.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  const exportAssetData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("You must be logged in to export assets.");
        return;
      }

      const { data: assets, error: assetsError } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id);
        
      if (assetsError) throw assetsError;

      const data = [
        ['Type', 'Ticker', 'Quantity', 'Avg Buy Price'],
        ...(assets || []).map(a => [a.type, a.ticker, a.quantity, a.avg_buy_price])
      ];
      
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Assets');
      XLSX.writeFile(wb, `GlobalWealth_Assets_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error exporting assets:', error);
      alert('Failed to export asset data.');
    }
  };

  const importAssetData = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be logged in to import assets.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (!data || data.length === 0) {
          alert('The excel file seems to be empty.');
          return;
        }

        let importCount = 0;
        for (const row of data) {
          const type = row['Type'] || row['type'];
          const ticker = row['Ticker'] || row['ticker'] || row['Symbol'] || row['symbol'];
          const quantity = parseFloat(row['Quantity'] || row['quantity'] || 0);
          const avgBuyPrice = parseFloat(row['Avg Buy Price'] || row['avg_buy_price'] || row['Price'] || 0);

          if (ticker && quantity > 0) {
            const { error } = await supabase
              .from('assets')
              .insert({
                user_id: user.id,
                type: type || 'Stock',
                ticker: ticker.toString().toUpperCase(),
                quantity: quantity,
                avg_buy_price: avgBuyPrice,
                created_at: new Date().toISOString(),
              });
            if (!error) importCount++;
          }
        }
        
        alert(`Successfully imported ${importCount} assets! Please refresh to see changes.`);
      } catch (error) {
        console.error('Import Error:', error);
        alert('Failed to parse or upload the Excel file.');
      }
    };
    reader.readAsBinaryString(file);
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

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-white">Data Portability</h3>
          <p className="mt-1 text-xs text-slate-500">Import or export your financial data as an Excel file.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Database size={16} className="text-indigo-400" />
              <h4 className="text-xs font-medium text-white">Management Data</h4>
            </div>
            <p className="text-[10px] text-slate-400 mb-4 h-8">Includes your budget, expenses, income, and transaction history.</p>
            <div className="flex gap-2">
              <button 
                onClick={exportManagementData}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-medium text-indigo-400 hover:bg-white/10 hover:text-indigo-300 transition-colors"
              >
                <Download size={14} />
                Export
              </button>
              
              <label className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-medium text-emerald-400 hover:bg-white/10 hover:text-emerald-300 transition-colors cursor-pointer">
                <Upload size={14} />
                Import
                <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={importManagementData} />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Coins size={16} className="text-orange-400" />
              <h4 className="text-xs font-medium text-white">Asset Data</h4>
            </div>
            <p className="text-[10px] text-slate-400 mb-4 h-8">Includes your global stock and cryptocurrency portfolio holdings.</p>
            <div className="flex gap-2">
              <button 
                onClick={exportAssetData}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-medium text-orange-400 hover:bg-white/10 hover:text-orange-300 transition-colors"
              >
                <Download size={14} />
                Export
              </button>
              
              <label className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-medium text-emerald-400 hover:bg-white/10 hover:text-emerald-300 transition-colors cursor-pointer">
                <Upload size={14} />
                Import
                <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={importAssetData} />
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;

