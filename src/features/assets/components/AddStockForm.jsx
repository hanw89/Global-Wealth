import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';
import { Loader2, TrendingUp, Save } from 'lucide-react';

const AddStockForm = () => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  const mutation = useMutation({
    mutationFn: async (data) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('assets')
        .insert({
          user_id: user.id,
          type: 'Stock',
          ticker: data.ticker.toUpperCase(),
          quantity: parseFloat(data.quantity),
          avg_buy_price: 0,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-unified'] });
      queryClient.refetchQueries({ queryKey: ['portfolio-unified'] });
      reset();
      alert('Stock portfolio synchronized.');
    },
    onError: (error) => {
      console.error('Stock Sync Error:', error);
      alert(`Failed to sync stock: ${error.message}`);
    },
  });

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-[#0f0f12] border border-slate-200 dark:border-white/[0.05] shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
          <TrendingUp size={18} />
        </div>
        <h3 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-widest">Add US Equity</h3>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Ticker</label>
            <input
              {...register('ticker', { required: true })}
              placeholder="e.g. AAPL"
              className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all uppercase"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Quantity</label>
            <input
              {...register('quantity', { required: true })}
              type="number"
              step="any"
              placeholder="0.00"
              className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>Sync Stock Holding</span>
        </button>
      </form>
    </div>
  );
};

export default AddStockForm;
