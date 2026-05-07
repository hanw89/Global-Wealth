import React from 'react';
import { useAppContext } from '../../../context/AppContext.js';
import { formatCurrency } from '../../../utils/currencyFormatter.js';
import { usePortfolio } from '../../../hooks/usePortfolio.js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';
import { Trash2, Loader2 } from 'lucide-react';

const KoreanAssetList = () => {
  const { currency, convertAmount, exchangeRate } = useAppContext();
  const queryClient = useQueryClient();
  const { data: portfolio, isLoading, error } = usePortfolio(exchangeRate);

  const rentals = portfolio?.dbRentals || [];

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('rental_income')
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

  if (isLoading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading rental assets...</div>;
  if (error) return (
    <div className="p-8 text-center rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-500 text-xs font-bold">
      Failed to sync rentals: {error.message}
    </div>
  );

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-2xl overflow-hidden">
      <div className="border-b border-white/[0.05] px-6 py-4 bg-white/[0.02]">
        <h2 className="text-lg font-medium text-white">Korean Assets (KRW)</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-slate-400">
              <th className="px-6 py-3">Property/Asset</th>
              <th className="px-6 py-3">Reg. Date</th>
              <th className="px-6 py-3 text-right">Rent/Income</th>
              <th className="px-6 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {rentals.length > 0 ? rentals.map((rental, i) => (
              <tr key={i} className="text-sm text-slate-300 hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 font-medium text-white">{rental.property_name}</td>
                <td className="px-6 py-4 text-xs text-slate-500">
                  {rental.next_payment_date ? new Date(rental.next_payment_date).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 text-right tabular-nums text-white font-bold">
                  {formatCurrency(convertAmount(rental.monthly_amount_krw, 'KRW', currency), currency)}
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this rental?')) {
                        deleteMutation.mutate(rental.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="p-2 rounded-lg text-slate-500 hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                  >
                    {deleteMutation.isPending && deleteMutation.variables === rental.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-slate-500 italic">No rental properties added yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KoreanAssetList;
