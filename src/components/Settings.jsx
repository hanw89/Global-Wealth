import React from 'react';

const Settings = ({ theme, setTheme, currency, setCurrency }) => {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 dark:border-slate-700 px-8 py-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">App Settings</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Personalize your dashboard experience.</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Theme Setting */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Appearance</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Switch between light and dark themes.</p>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setTheme('light')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${theme === 'light' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${theme === 'dark' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Dark
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-700"></div>

          {/* Currency Setting */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Default Currency</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Set your preferred base currency for all tabs.</p>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${currency === 'USD' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrency('KRW')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${currency === 'KRW' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                KRW (₩)
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 px-8 py-6 border-t border-slate-100 dark:border-slate-700">
          <div className="flex gap-3">
            <div className="text-blue-600 dark:text-blue-400 mt-0.5">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              These settings are saved locally in your browser. Changing the currency will automatically convert values using the current reference rates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
