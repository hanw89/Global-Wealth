import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';
import { Loader2, Home, Save } from 'lucide-react';

const AddRentalForm = () => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  const mutation = useMutation({
    mutationFn: async (data) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('rental_income')
        .insert({
          user_id: user.id,
          property_name: data.propertyName,
          monthly_amount_krw: parseFloat(data.monthlyRent),
          next_payment_date: new Date().toISOString().split('T')[0], // Default
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-unified'] });
      queryClient.refetchQueries({ queryKey: ['portfolio-unified'] });
      reset();
      alert('Rental income stream registered.');
    },
    onError: (error) => {
      console.error('Rental Sync Error:', error);
      alert(`Failed to sync rental: ${error.message}`);
    },
  });

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.05] shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
          <Home size={18} />
        </div>
        <h3 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-widest">Add Rental Asset</h3>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Property Name</label>
            <input
              {...register('propertyName', { required: true })}
              placeholder="e.g. Gangnam Studio B"
              className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Monthly Rent (KRW)</label>
            <div className="relative">
              <input
                {...register('monthlyRent', { required: true })}
                type="number"
                placeholder="2,500,000"
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-9 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-xs">₩</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>Sync Rental Income</span>
        </button>
      </form>
    </div>
  );
};

export default AddRentalForm;
