import React, { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-6">
      <div className="w-full max-w-md p-8 rounded-[2.5rem] bg-[#0f0f12] border border-white/[0.05] shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">GlobalWealth</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Institutional Grade Portfolio</p>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#6366f1',
                  brandAccent: '#4f46e5',
                  inputBackground: 'rgba(255, 255, 255, 0.03)',
                  inputText: 'white',
                  inputBorder: 'rgba(255, 255, 255, 0.1)',
                  inputBorderFocus: '#6366f1',
                  inputBorderHover: 'rgba(255, 255, 255, 0.2)',
                },
                borderWidths: {
                  buttonBorderWidth: '1px',
                  inputBorderWidth: '1px',
                },
                radii: {
                  borderRadiusButton: '12px',
                  buttonBorderRadius: '12px',
                  inputBorderRadius: '12px',
                },
              },
            },
          }}
          theme="dark"
          providers={[]}
          redirectTo={window.location.origin + '/Global-Wealth/dashboard'}
        />

        <div className="mt-8 pt-6 border-t border-white/[0.05] flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secure Financial Cloud</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
