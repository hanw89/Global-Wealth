import React from 'react';
import { useAppContext } from '../../../context/AppContext.js';
import { formatCurrency } from '../../../utils/currencyFormatter.js';
import { usePortfolio } from '../../../hooks/usePortfolio.js';

const KoreanAssetList = () => {
  const { currency, convertAmount, exchangeRate } = useAppContext();
  const { data: portfolio, isLoading, error } = usePortfolio(exchangeRate);

  const rentals = portfolio?.dbRentals || [];

  if (isLoading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading rental assets...</div>;
  if (error) return (
    <div className="p-8 text-center rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-500 text-xs font-bold">
      Failed to sync rentals: {error.message}
    </div>
  );
return (
  <div className="rounded-3xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] backdrop-blur-xl shadow-sm overflow-hidden">
    <div className="border-b border-slate-100 dark:border-white/[0.05] px-6 py-4 bg-slate-50/50 dark:bg-white/[0.02]">
      <h2 className="text-lg font-medium text-slate-800 dark:text-white">Korean Assets (KRW)</h2>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 dark:bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <th className="px-6 py-3">Property/Asset</th>
            <th className="px-6 py-3">Type</th>
            <th className="px-6 py-3 text-right">Rent/Income</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
          {rentals.map((prop, i) => (
            <tr key={i} className="text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">

                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{rental.property_name}</td>
                <td className="px-6 py-4 text-right tabular-nums">
                  {formatCurrency(convertAmount(rental.monthly_amount_krw, 'KRW', currency), currency)}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="2" className="px-6 py-8 text-center text-slate-400 italic">No rental properties added yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KoreanAssetList;
