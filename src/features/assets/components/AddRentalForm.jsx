import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';
import { Loader2, Home, Save, Repeat } from 'lucide-react';
import { useRecurringInvestments } from '../../../hooks/useRecurringInvestments';

const AddRentalForm = () => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm();
  const { addPlan } = useRecurringInvestments();
  const [isRecurring, setIsRecurring] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (isRecurring) {
        addPlan({
          type: 'Rental',
          propertyName: data.propertyName,
          amount: parseFloat(data.monthlyRent),
          frequency: data.frequency,
          name: `${data.propertyName} Monthly Collection`
        });
        return;
      }

      const { error } = await supabase
        .from('rental_income')
        .insert({
          user_id: user.id,
          property_name: data.propertyName,
          monthly_amount_krw: parseFloat(data.monthlyRent),
          next_payment_date: data.registrationDate || new Date().toISOString().split('T')[0],
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-unified'] });
      queryClient.refetchQueries({ queryKey: ['portfolio-unified'] });
      reset();
      setIsRecurring(false);
      alert(isRecurring ? 'Recurring rental income scheduled.' : 'Rental income stream registered.');
    },
    onError: (error) => {
      console.error('Rental Sync Error:', error);
      alert(`Failed to sync rental: ${error.message}`);
    },
  });

  return (
    <div className="p-6 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Home size={18} />
          </div>
          <h3 className="font-bold text-white uppercase text-xs tracking-widest">Add Rental Asset</h3>
        </div>
        <button 
          type="button"
          onClick={() => setIsRecurring(!isRecurring)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isRecurring ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-500 border border-white/5 hover:bg-white/10'}`}
        >
          <Repeat size={12} />
          {isRecurring ? 'Auto-Collect' : 'Manual Entry'}
        </button>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Property Name</label>
            <input
              {...register('propertyName', { required: true })}
              placeholder="e.g. Gangnam Studio B"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Monthly Rent (KRW)</label>
            <div className="relative">
              <input
                {...register('monthlyRent', { required: true })}
                type="number"
                placeholder="2,500,000"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-9 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-xs">₩</span>
            </div>
          </div>

          {isRecurring && (
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Collection Frequency</label>
              <select
                {...register('frequency', { required: isRecurring })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all appearance-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className={`w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition-all disabled:opacity-50 shadow-lg ${isRecurring ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/30' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'} text-white`}
        >
          {mutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>{isRecurring ? 'Schedule Auto-Collection' : 'Sync Rental Income'}</span>
        </button>
      </form>
    </div>
  );
};

export default AddRentalForm;
