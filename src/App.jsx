import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import AssetTracker from './features/assets/AssetTracker.jsx';
import MoneyManagement from './features/budget/DailySpending.jsx';
import Settings from './components/Settings.jsx';
import Dashboard from './features/dashboard/Dashboard.jsx';
import Login from './components/Login.jsx';
import { useAppContext } from './context/AppContext.jsx';
import { supabase } from './lib/supabaseClient';
import { Eye, EyeOff, LogOut, Menu } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!session) return <Navigate to="/login" replace />;

  return children;
};

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, privacyMode, togglePrivacyMode } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Assets', path: '/assets', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { name: 'Money Management', path: '/money-management', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16V15' },
    { name: 'Settings', path: '/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  const currentPageTitle = navLinks.find(link => location.pathname.includes(link.path))?.name || 'Dashboard';

  return (
    <div className={`flex h-screen font-sans transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className={`fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden ${isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={() => setIsSidebarOpen(false)} />

      <aside className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-slate-900 text-slate-300 transition-transform lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-center border-b border-slate-800 px-6">
          <span className="text-xl font-semibold tracking-tight text-white">Global Wealth</span>
        </div>
        <nav className="mt-6 px-4">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => {
                navigate(link.path);
                setIsSidebarOpen(false);
              }}
              className={`flex w-full items-center rounded-lg px-4 py-3 transition-colors hover:bg-slate-800 hover:text-white ${location.pathname.includes(link.path) ? 'bg-slate-800 text-white' : ''}`}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon}></path>
              </svg>
              <span className="ml-3 font-medium">{link.name}</span>
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full border-t border-slate-800 p-4">
          <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-slate-400 hover:text-white transition-colors">
            <LogOut size={20} />
            <span className="ml-3 font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6">
          <button className="text-slate-500 focus:outline-none lg:hidden" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="flex items-center">
            <h1 className="text-lg font-medium text-slate-800 dark:text-white">{currentPageTitle}</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={togglePrivacyMode} className={`p-2 rounded-lg transition-all ${privacyMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              {privacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            <span className="text-sm text-slate-500 dark:text-slate-400">May 3, 2026</span>
          </div>
        </header>
        <main className={`flex-1 overflow-y-auto p-6 transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0a0a0c] text-white' : 'bg-slate-50 text-slate-900'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/assets" element={<ProtectedRoute><Layout><AssetTracker /></Layout></ProtectedRoute>} />
      <Route path="/money-management" element={<ProtectedRoute><Layout><MoneyManagement /></Layout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
    </Routes>
  );
};

export default App;
