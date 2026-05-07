import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Bitcoin, 
  Home, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  BarChart3,
  CreditCard,
  RefreshCw,
  Clock,
  Globe
} from 'lucide-react';
import { usePortfolio } from '../../hooks/usePortfolio.js';
import { usePriceTracker } from '../../hooks/usePriceTracker.js';
import CashFlowChart from './components/CashFlowChart.jsx';
import CashFlowSummary from './components/CashFlowSummary.jsx';
import ForexAnalyzer from './components/ForexAnalyzer.jsx';
import AssetAllocation from './components/AssetAllocation.jsx';
import MarketWatchTable from '../market-watch/components/MarketWatchTable.jsx';

import HoldingsTable from '../assets/components/HoldingsTable.jsx';
import { useAppContext } from '../../context/AppContext.js';

import { formatCurrency } from '../../utils/currencyFormatter.js';
import { exportToCSV } from '../../utils/exportUtils.js';

const Dashboard = () => {
  const { privacyMode, exchangeRate, rateLastUpdated } = useAppContext();
  const { data: portfolio, isLoading: isPortfolioLoading } = usePortfolio(exchangeRate);
  const { prices, lastUpdated, loading: isPricesLoading, error, refresh } = usePriceTracker({
    stocks: [],
    cryptos: ['bitcoin', 'ethereum']
  });

  const loading = isPortfolioLoading || isPricesLoading;

  const formatUSD = (val) => formatCurrency(val, 'USD', { privacyMode });
  const formatKRW = (val) => formatCurrency(val, 'KRW', { privacyMode });

  // Calculate values based on live data
  const totalNetWorth = portfolio?.totalValue || 0;
  const totalRentUsd = portfolio?.monthlyCashFlow || 0;
  const exchangeRateUsed = portfolio?.exchangeRateUsed || exchangeRate;

  // Fintech Feature: Tax Projections (15% Capital Gains)
  const estimatedCapitalGainsTax = totalNetWorth * 0.15;

  const bitcoinPrice = prices.cryptos.bitcoin?.usd || 0;
  const bitcoinChange = prices.cryptos.bitcoin?.usd_24h_change || 0;

  const handleTaxExport = () => {
    const exportData = [];
    exportToCSV(exportData, `GlobalWealth_Tax_Report_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Market Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span>{loading ? 'Fetching Markets...' : 'Markets Live'}</span>
            </div>
            
            {/* Forex Live Sync Status */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Globe size={10} />
              <span>USD/KRW: {exchangeRate.toFixed(2)}</span>
              {rateLastUpdated ? (
                <span className="opacity-60 font-medium">Sync: {new Date(rateLastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              ) : null}
            </div>

            {lastUpdated && (
              <div className="flex items-center gap-1.5">
                <Clock size={12} />
                <span>Last Updated: {lastUpdated.toLocaleTimeString()}</span>
              </div>
            )}
            {error && <span className="text-rose-500 font-black">Error: {error}</span>}
          </div>
          <button 
            onClick={refresh}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Top Row: Bento Box Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Net Worth */}
          <div className="relative overflow-hidden group p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
              <DollarSign size={48} className="text-emerald-500" />
            </div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Total Net Worth</p>
            <h2 className={`text-3xl font-bold text-white mb-1 ${privacyMode ? 'blur-md select-none' : ''}`}>
              {formatUSD(totalNetWorth)}
            </h2>
            <div className="flex items-center gap-1 text-slate-500 text-sm font-medium">
              <span>{portfolio?.dbAssets?.length || 0} Assets Registered</span>
            </div>
          </div>

          {/* Crypto Price */}
          <div className="relative overflow-hidden group p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
              <Bitcoin size={48} className="text-orange-500" />
            </div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">BTC Price (USD)</p>
            <h2 className={`text-3xl font-bold text-white mb-1 ${privacyMode ? 'blur-md select-none' : ''}`}>
              {formatUSD(bitcoinPrice)}
            </h2>
            <div className={`flex items-center gap-1 text-sm font-medium ${bitcoinChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {bitcoinChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              <span>{bitcoinChange.toFixed(2)}% (24h)</span>
            </div>
          </div>

          {/* Tax Projection Card */}
          <div className="relative overflow-hidden group p-6 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 backdrop-blur-xl">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
              <BarChart3 size={48} className="text-indigo-400" />
            </div>
            <div className="flex justify-between items-start mb-2">
              <p className="text-indigo-300 text-xs font-semibold uppercase tracking-wider">Est. Tax Liability (15%)</p>
              <button 
                onClick={handleTaxExport}
                className="text-[10px] bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-200 px-2 py-1 rounded-lg transition-colors border border-indigo-500/30"
              >
                Export CSV
              </button>
            </div>
            <h2 className={`text-3xl font-bold text-white mb-1 ${privacyMode ? 'blur-md select-none' : ''}`}>
              {formatUSD(estimatedCapitalGainsTax)}
            </h2>
            <p className="text-indigo-400 text-xs font-medium">Unrealized Capital Gains Tax</p>
          </div>
        </div>

        {/* Cash Flow Summary Section */}
        <section className="mt-12">
          <CashFlowSummary />
        </section>

        {/* Main Content: 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Comprehensive Portfolio Ledger */}
          <div className="lg:col-span-12 space-y-8">
            <HoldingsTable />
          </div>

          {/* Asset Allocation & Real Estate Section */}
          <div className="lg:col-span-7">
             <MarketWatchTable />
          </div>

          {/* Right Column: Korean Real Estate */}
          <div className="lg:col-span-5 space-y-4">

            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2">KR Real Estate</h3>
            <div className="p-6 rounded-3xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-2xl">
              <div className="space-y-6">
                {portfolio?.dbRentals?.length > 0 ? portfolio.dbRentals.map((prop, idx) => (
                  <div key={idx} className="pb-6 border-b border-white/[0.05] last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-white">{prop.property_name}</h4>
                        <span className="inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold uppercase tracking-wider">
                          Real Estate
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Deposit</p>
                        <p className={`text-xs text-slate-300 font-mono ${privacyMode ? 'blur-sm select-none' : ''}`}>
                          {formatKRW(0)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 bg-black/40 p-4 rounded-2xl border border-white/[0.03]">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Monthly Flow</p>
                        <p className={`text-lg font-black text-emerald-400 ${privacyMode ? 'blur-sm select-none' : ''}`}>
                          {formatKRW(prop.monthly_amount_krw)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">USD Eq.</p>
                        <p className={`text-lg font-black text-white ${privacyMode ? 'blur-sm select-none' : ''}`}>
                          {formatUSD(prop.monthly_amount_krw / exchangeRateUsed)}
                        </p>
                      </div>
                    </div>
                    {/* IRS Reporting Note */}
                    <div className="mt-3 flex items-start gap-2 px-1">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                      <p className="text-[9px] text-slate-500 leading-tight">
                        Requires <span className="text-amber-400/80 font-bold">IRS Schedule E</span> reporting (Foreign Real Estate Income).
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="py-8 text-center">
                    <Home size={32} className="mx-auto text-slate-600 mb-3 opacity-20" />
                    <p className="text-xs text-slate-500 font-medium">No real estate assets added</p>
                  </div>
                )}
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-3 text-slate-400">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <BarChart3 size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-300">Total KR Cash Flow</p>
                    <p className="text-[10px]">Aggregated Monthly</p>
                  </div>
                </div>
                <div className="text-right">
                    <p className={`text-xl font-black text-white ${privacyMode ? 'blur-sm select-none' : ''}`}>
                      {formatUSD(totalRentUsd)}
                    </p>
                    <p className="text-[10px] text-slate-500">Net after fees</p>
                </div>
              </div>
            </div>

            {/* Quick Actions / Integration Info */}
            <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-between group cursor-pointer hover:bg-indigo-600/20 transition-all">
                <div className="flex items-center gap-3">
                    <CreditCard size={18} className="text-indigo-400" />
                    <span className="text-sm font-medium text-indigo-300">Connect Korean Bank (API)</span>
                </div>
                <ArrowUpRight size={16} className="text-indigo-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>

        </div>

        {/* Forex Strategy Section */}
        <section className="mt-12">
          <ForexAnalyzer />
        </section>

        {/* Portfolio Analytics Section */}
        <section className={`mt-12 transition-all duration-500 ${privacyMode ? 'opacity-20 blur-xl pointer-events-none grayscale' : 'opacity-100'}`}>
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Global Portfolio Analytics</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AssetAllocation />
            <CashFlowChart />
          </div>
        </section>

      </div>
  );
};

export default Dashboard;
