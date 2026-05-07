import React from 'react';
import { useAppContext } from '../../../context/AppContext.js';
import { usePortfolio } from '../../../hooks/usePortfolio.js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';
import { Trash2, Loader2 } from 'lucide-react';

const GlobalAssetList = () => {
  const { exchangeRate } = useAppContext();
  const queryClient = useQueryClient();
  const { data: portfolio, isLoading, error } = usePortfolio(exchangeRate);

  const assets = portfolio?.dbAssets?.filter(a => a.type === 'Stock' || a.type === 'Crypto') || [];

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-unified'] });
    },
    onError: (error) => {
      alert(`Delete failed: ${error.message}`);
    }
  });

  if (isLoading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading global assets...</div>;
  if (error) return (
    <div className="p-8 text-center rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-500 text-xs font-bold">
      Failed to sync assets: {error.message}
    </div>
  );

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-2xl overflow-hidden">
      <div className="border-b border-white/[0.05] px-6 py-4 bg-white/[0.02]">
        <h2 className="text-lg font-medium text-white">Global Assets (US/Intl)</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-slate-400">
              <th className="px-6 py-3">Asset</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3 text-right">Price/Date</th>
              <th className="px-6 py-3 text-right">Value</th>
              <th className="px-6 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {assets.length > 0 ? assets.map((asset, i) => (
              <tr key={i} className="text-sm text-slate-300 hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-white">{asset.name || asset.ticker}</div>
                  <div className="text-xs text-slate-500 font-mono">{asset.ticker}</div>
                </td>
                <td className="px-6 py-4">{asset.type}</td>
                <td className="px-6 py-4 text-right">
                  <div className="text-white font-bold">${asset.avg_buy_price?.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-500">{new Date(asset.created_at).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 text-right tabular-nums text-white">
                  {asset.quantity} units
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this asset?')) {
                        deleteMutation.mutate(asset.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="p-2 rounded-lg text-slate-500 hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                  >
                    {deleteMutation.isPending && deleteMutation.variables === asset.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-slate-500 italic">No assets registered yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GlobalAssetList;
