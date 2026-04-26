import React, { useState } from 'react';

const DailySpending = () => {
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  
  // Mock spending data
  const spendingData = [
    { category: 'Groceries', amount: 1250.45, icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
    { category: 'Housing', amount: 3200.00, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { category: 'Kids (Education/Activities)', amount: 850.00, icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { category: 'Maintenance', amount: 420.12, icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  const totalSpending = spendingData.reduce((acc, curr) => acc + curr.amount, 0);

  const formatAmount = (amount) => {
    if (isPrivacyMode) return '$X,XXX.XX';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Daily Spending</h2>
          <p className="text-slate-500 text-sm">Track your monthly essential outflows.</p>
        </div>
        
        <button 
          onClick={() => setIsPrivacyMode(!isPrivacyMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
            isPrivacyMode 
            ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105' 
            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
          }`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isPrivacyMode ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.074m9.474 9.474l.582-.582m0 0a4.992 4.992 0 01-3.046-3.046m0 0l-.582.582m0 0L8.122 13.122m7.756 7.756l1.581 1.581m-1.581-1.581l1.581-1.581m-1.581 1.581A9.955 9.955 0 0112 19c4.478 0 8.268-2.943 9.543-7a10.025 10.025 0 00-4.132-5.411m0 0L21 3m-3 3L3 18" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            )}
          </svg>
          <span className="text-sm font-bold">{isPrivacyMode ? 'Privacy On' : 'Privacy Mode'}</span>
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl overflow-hidden relative">
        <div className="relative z-10">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Monthly Spending</p>
          <h3 className={`text-4xl font-black tracking-tight transition-all duration-300 ${isPrivacyMode ? 'blur-md' : ''}`}>
            {formatAmount(totalSpending)}
          </h3>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/5 to-transparent"></div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {spendingData.map((item) => (
          <div key={item.category} className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-md transition-all flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-50 text-slate-900 rounded-xl">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{item.category}</h4>
                <p className="text-xs text-slate-500">Monthly Allocation</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold text-slate-900 transition-all duration-300 ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>
                {formatAmount(item.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Public Testing Note */}
      {isPrivacyMode && (
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center gap-3">
          <div className="text-blue-500">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-xs text-blue-700 font-medium">
            Privacy Mode is active. Financial values are masked for public demonstration.
          </p>
        </div>
      )}
    </div>
  );
};

export default DailySpending;
