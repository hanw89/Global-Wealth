import React from 'react';
import { useAppContext } from '../../../context/AppContext.jsx';
import { formatCurrency } from '../../../utils/currencyFormatter.js';

const KoreanAssetList = () => {
  const { currency, convertAmount } = useAppContext();

  const assets = [
    { name: 'KB Kookmin Savings', type: 'Cash', valueKrw: 15000000 },
    { name: 'Samsung Electronics', type: 'Equity', valueKrw: 8200000 },
    { name: 'Gangnam Wolse Deposit', type: 'Real Estate Deposit', valueKrw: 50000000 },
  ];

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 dark:border-slate-700 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50">
        <h2 className="text-lg font-medium text-slate-800 dark:text-white">Korean Assets (KRW)</h2>
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
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{asset.name}</td>
                <td className="px-6 py-4">{asset.type}</td>
                <td className="px-6 py-4 text-right tabular-nums">
                  {formatCurrency(convertAmount(asset.valueKrw, 'KRW', currency), currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KoreanAssetList;
