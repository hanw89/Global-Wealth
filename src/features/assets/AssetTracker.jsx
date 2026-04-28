import React from 'react';
import GlobalAssetList from './components/GlobalAssetList.jsx';
import KoreanAssetList from './components/KoreanAssetList.jsx';
import RentalTrackerForm from './components/RentalTrackerForm.jsx';
import { useAppContext } from '../../context/AppContext.jsx';
import { formatCurrency } from '../../utils/currencyFormatter.js';

const AssetTracker = () => {
  const { currency } = useAppContext();

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Asset Inventory</h1>
          <p className="text-slate-500 dark:text-slate-400">Comprehensive view of your global and local holdings.</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors">
            + Add Asset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <GlobalAssetList />
        <KoreanAssetList />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <div className="rounded-xl bg-slate-900 p-8 text-white shadow-lg dark:bg-slate-800 border border-slate-700 h-full flex flex-col justify-center">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-medium text-slate-300">Total Asset Value</h3>
                <p className="mt-2 text-4xl font-bold">{formatCurrency(285400, currency)}</p>
              </div>
              <div className="flex flex-wrap gap-4 justify-center md:justify-end">
                <div className="text-center px-6 py-3 bg-slate-800 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Equity</p>
                  <p className="text-xl font-bold">72%</p>
                </div>
                <div className="text-center px-6 py-3 bg-slate-800 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Cash</p>
                  <p className="text-xl font-bold">18%</p>
                </div>
                <div className="text-center px-6 py-3 bg-slate-800 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Real Estate</p>
                  <p className="text-xl font-bold">10%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-5">
          <RentalTrackerForm />
        </div>
      </div>
    </div>
  );
};

export default AssetTracker;
