import React from 'react';
import { useAppContext } from '../../../context/AppContext.jsx';
import { formatCurrency } from '../../../utils/currencyFormatter.js';

const GlobalAssetList = () => {
  const { currency, convertAmount } = useAppContext();

  const assets = [
    { name: 'Total World Stock', ticker: 'VT', type: 'Equity', valueUsd: 142350 },
    { name: 'Intermediate Treasury', ticker: 'VGIT', type: 'Fixed Income', valueUsd: 54750 },
    { name: 'Intl Bond ETF', ticker: 'BNDX', type: 'Fixed Income', valueUsd: 21900 },
  ];

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 dark:border-slate-700 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50">
        <h2 className="text-lg font-medium text-slate-800 dark:text-white">Global Assets (US/Intl)</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="px-6 py-3">Asset</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3 text-right">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {assets.map((asset, i) => (
              <tr key={i} className="text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 dark:text-white">{asset.name}</div>
                  <div className="text-xs text-slate-400 font-mono">{asset.ticker}</div>
                </td>
                <td className="px-6 py-4">{asset.type}</td>
                <td className="px-6 py-4 text-right tabular-nums">
                  {formatCurrency(convertAmount(asset.valueUsd, 'USD', currency), currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GlobalAssetList;
