import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';
import { Loader2, Zap, Save } from 'lucide-react';

const AddCryptoForm = () => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  const mutation = useMutation({
    mutationFn: async (data) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('assets')
        .upsert({
          user_id: user.id,
          type: 'Crypto',
          ticker: data.symbol.toUpperCase(),
          quantity: parseFloat(data.quantity),
          avg_buy_price: 0,
        }, { onConflict: 'user_id,ticker,type' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketData'] });
      reset();
      alert('Crypto ledger updated.');
    },
  });

  return (
    <div className="p-6 rounded-3xl bg-[#0f0f12] border border-white/[0.05] shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
          <Zap size={18} />
        </div>
        <h3 className="font-bold text-white uppercase text-xs tracking-widest">Add Digital Asset</h3>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Symbol</label>
            <input
              {...register('symbol', { required: true })}
              placeholder="e.g. BTC"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all uppercase"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Quantity</label>
            <input
              {...register('quantity', { required: true })}
              type="number"
              step="any"
              placeholder="0.00"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>Sync Crypto Ledger</span>
        </button>
      </form>
    </div>
  );
};

export default AddCryptoForm;
