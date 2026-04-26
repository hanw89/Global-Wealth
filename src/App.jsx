import React, { useState } from 'react';
import AssetTracker from './components/AssetTracker';
import DailySpending from './components/DailySpending';

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('Dashboard');

  const navLinks = [
    { name: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Assets', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { name: 'Spending', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16V15' },
    { name: 'Education', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  ];

  const renderContent = () => {
    switch (currentTab) {
      case 'Dashboard':
        return (
          <div className="mx-auto max-w-7xl">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Net Worth</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-slate-900">$219,000.21</h3>
                  <span className="text-sm font-medium text-emerald-600">+1.2%</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">vs. last month</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Equity Allocation</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-slate-900">65.0%</h3>
                  <span className="text-sm font-medium text-slate-400">Target: 65%</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">Balanced Portfolio</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Time Horizon</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-slate-900">18 Years</h3>
                </div>
                <p className="mt-1 text-xs text-slate-400">To Retirement Goal</p>
              </div>
            </div>

            {/* Tables / Content */}
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h2 className="text-lg font-medium text-slate-800">Core Holdings</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <th className="px-6 py-3">Asset</th>
                        <th className="px-6 py-3">Ticker</th>
                        <th className="px-6 py-3">Alloc.</th>
                        <th className="px-6 py-3 text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { name: 'Total World Stock', ticker: 'VT', allocation: '65.0%', value: '$142,350' },
                        { name: 'Intermediate Treasury', ticker: 'VGIT', allocation: '25.0%', value: '$54,750' },
                        { name: 'Intl Bond ETF', ticker: 'BNDX', allocation: '10.0%', value: '$21,900' },
                      ].map((item, i) => (
                        <tr key={i} className="text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                          <td className="px-6 py-4"><span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">{item.ticker}</span></td>
                          <td className="px-6 py-4">{item.allocation}</td>
                          <td className="px-6 py-4 text-right tabular-nums">{item.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h2 className="text-lg font-medium text-slate-800">Recent Activity</h2>
                </div>
                <div className="p-6">
                  <ul className="space-y-4">
                    {[
                      { type: 'Dividend Reinvestment', date: 'Apr 20, 2026', amount: '+$342.12', asset: 'VT' },
                      { type: 'Monthly Contribution', date: 'Apr 15, 2026', amount: '+$5,000.00', asset: 'Portfolio' },
                      { type: 'Portfolio Rebalance', date: 'Mar 31, 2026', amount: 'N/A', asset: 'Global' },
                    ].map((activity, i) => (
                      <li key={i} className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{activity.type}</p>
                          <p className="text-xs text-slate-500">{activity.date}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${activity.amount.startsWith('+') ? 'text-emerald-600' : 'text-slate-800'}`}>{activity.amount}</p>
                          <p className="text-xs text-slate-400">{activity.asset}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <button className="mt-6 w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                    View All Activity
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Assets':
        return <AssetTracker />;
      case 'Spending':
        return <DailySpending />;
      default:
        return <div className="p-12 text-center text-slate-400">Module Coming Soon</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar for mobile */}
      <div 
        className={`fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden ${isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-slate-900 text-slate-300 transition-transform lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-center border-b border-slate-800 px-6">
          <span className="text-xl font-semibold tracking-tight text-white">Global Wealth</span>
        </div>
        
        <nav className="mt-6 px-4">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => {
                setCurrentTab(link.name);
                setIsSidebarOpen(false);
              }}
              className={`flex w-full items-center rounded-lg px-4 py-3 transition-colors hover:bg-slate-800 hover:text-white ${currentTab === link.name ? 'bg-slate-800 text-white' : ''}`}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon}></path>
              </svg>
              <span className="ml-3 font-medium">{link.name}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-slate-800 p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">HW</div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">H. Wang</p>
              <p className="text-xs text-slate-500">Premium Member</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <button 
            className="text-slate-500 focus:outline-none lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          
          <div className="flex items-center">
            <h1 className="text-lg font-medium text-slate-800">{currentTab}</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">April 26, 2026</span>
            <div className="relative">
              <button className="flex items-center text-slate-500 hover:text-slate-700">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
