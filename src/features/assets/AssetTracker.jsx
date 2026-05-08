import React from 'react';
import GlobalAssetList from './components/GlobalAssetList.jsx';
import KoreanAssetList from './components/KoreanAssetList.jsx';
import AddStockForm from './components/AddStockForm.jsx';
import AddCryptoForm from './components/AddCryptoForm.jsx';
import AddRentalForm from './components/AddRentalForm.jsx';
import RecurringPlans from './components/RecurringPlans.jsx';
import { useRecurringInvestments } from '../../hooks/useRecurringInvestments';
import { Activity } from 'lucide-react';

const AssetTracker = () => {
  // Initialize recurring execution engine
  useRecurringInvestments();

  return (
    <div className="mx-auto max-w-7xl space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Asset Inventory</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Real-time Global Ledger</p>
        </div>
      </div>

      {/* Asset Management Suite */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <Activity size={18} className="text-indigo-400" />
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Management Suite</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AddStockForm />
          <AddCryptoForm />
          <AddRentalForm />
        </div>
      </section>

      {/* Recurring Engine Status & Plans */}
      <RecurringPlans />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <GlobalAssetList />
        <KoreanAssetList />
      </div>
    </div>
  );
};

export default AssetTracker;
