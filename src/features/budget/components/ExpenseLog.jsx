import React, { useState } from 'react';
import { useAppContext } from '../../../context/AppContext.jsx';
import { formatCurrency } from '../../../utils/currencyFormatter.js';

const ExpenseLog = () => {
  const { currency, convertAmount } = useAppContext();
  const [expenses, setExpenses] = useState([
    { id: 1, date: '2026-04-27', description: 'Emart Grocery', category: 'Groceries', amountUsd: 85.20 },
    { id: 2, date: '2026-04-26', description: 'Monthly Rent', category: 'Housing', amountUsd: 3200.00 },
    { id: 3, date: '2026-04-25', description: 'Starbucks', category: 'Food', amountUsd: 6.50 },
    { id: 4, date: '2026-04-24', description: 'Gas Station', category: 'Transport', amountUsd: 55.00 },
  ]);

  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'Food' });

  const addExpense = (e) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount) return;

    const amountInUsd = currency === 'KRW' ? parseFloat(newExpense.amount) / 1350 : parseFloat(newExpense.amount);
    
    const expense = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      description: newExpense.description,
      category: newExpense.category,
      amountUsd: amountInUsd
    };

    setExpenses([expense, ...expenses]);
    setNewExpense({ description: '', amount: '', category: 'Food' });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Add New Expense</h3>
        <form onSubmit={addExpense} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Description"
            value={newExpense.description}
            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="number"
            placeholder={`Amount (${currency})`}
            value={newExpense.amount}
            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={newExpense.category}
            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Food">Food</option>
            <option value="Groceries">Groceries</option>
            <option value="Transport">Transport</option>
            <option value="Housing">Housing</option>
            <option value="Entertainment">Entertainment</option>
          </select>
          <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
            Add Expense
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 dark:border-slate-700 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="text-lg font-medium text-slate-800 dark:text-white">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {expenses.map((expense) => (
                <tr key={expense.id} className="text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{expense.date}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{expense.description}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums font-semibold">
                    {formatCurrency(convertAmount(expense.amountUsd, 'USD', currency), currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpenseLog;
