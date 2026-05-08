import React from 'react';
import { useRecurringInvestments } from '../../../hooks/useRecurringInvestments';
import { Trash2, Repeat, Clock, Calendar } from 'lucide-react';

const RecurringPlans = () => {
  const { getPlans, removePlan } = useRecurringInvestments();
  const plans = getPlans();

  if (plans.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 px-2">
        <Repeat size={18} className="text-indigo-400" />
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Active Recurring Plans</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="p-6 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-2xl relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Repeat size={48} />
            </div>

            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-white text-sm">{plan.name}</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{plan.type} Investment</p>
              </div>
              <button 
                onClick={() => removePlan(plan.id)}
                className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all border border-rose-500/20"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-indigo-400" />
                <span className="text-xs font-bold text-slate-300 capitalize">{plan.frequency}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-white">
                  {plan.type === 'Rental' ? `₩${plan.amount.toLocaleString()}` : `${plan.quantity} Shares`}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                <Calendar size={10} />
                <span>Last Sync: {new Date(plan.lastExecuted).toLocaleDateString()}</span>
              </div>
              <div className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">
                Live Engine Active
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecurringPlans;
