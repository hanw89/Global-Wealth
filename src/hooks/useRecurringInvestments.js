import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook to handle recurring investment logic.
 * Manages plans in localStorage and executes them on mount.
 */
export const useRecurringInvestments = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const executePlans = async () => {
      const plans = JSON.parse(localStorage.getItem('recurring_plans') || '[]');
      if (plans.length === 0) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let executedAny = false;
      const updatedPlans = await Promise.all(plans.map(async (plan) => {
        const lastExecuted = new Date(plan.lastExecuted);
        const now = new Date();
        const diffTime = Math.abs(now - lastExecuted);
        
        let intervalsToExecute = 0;
        const oneDay = 1000 * 60 * 60 * 24;

        if (plan.frequency === 'daily') {
          intervalsToExecute = Math.floor(diffTime / oneDay);
        } else if (plan.frequency === 'weekly') {
          intervalsToExecute = Math.floor(diffTime / (oneDay * 7));
        } else if (plan.frequency === 'biweekly') {
          intervalsToExecute = Math.floor(diffTime / (oneDay * 14));
        } else if (plan.frequency === 'monthly') {
          // Simplified monthly calculation
          intervalsToExecute = Math.floor(diffTime / (oneDay * 30));
        }

        if (intervalsToExecute > 0) {
          executedAny = true;
          for (let i = 1; i <= intervalsToExecute; i++) {
            const executionDate = new Date(lastExecuted.getTime() + (i * (diffTime / intervalsToExecute)));
            
            if (plan.type === 'Rental') {
              await supabase.from('rental_income').insert({
                user_id: user.id,
                property_name: plan.propertyName,
                monthly_amount_krw: plan.amount,
                next_payment_date: executionDate.toISOString().split('T')[0]
              });
            } else {
              await supabase.from('assets').insert({
                user_id: user.id,
                type: plan.type, // 'Stock' or 'Crypto'
                ticker: plan.ticker,
                quantity: plan.quantity,
                avg_buy_price: plan.price,
                created_at: executionDate.toISOString()
              });
            }
          }
          
          // Update last executed to the latest theoretical execution time
          return { ...plan, lastExecuted: now.toISOString() };
        }
        return plan;
      }));

      if (executedAny) {
        localStorage.setItem('recurring_plans', JSON.stringify(updatedPlans));
        queryClient.invalidateQueries({ queryKey: ['portfolio-unified'] });
        console.log('Executed recurring plans successfully.');
      }
    };

    executePlans();
  }, [queryClient]);

  const addPlan = (plan) => {
    const plans = JSON.parse(localStorage.getItem('recurring_plans') || '[]');
    const newPlan = {
      id: Date.now(),
      ...plan,
      lastExecuted: new Date().toISOString()
    };
    localStorage.setItem('recurring_plans', JSON.stringify([...plans, newPlan]));
  };

  const removePlan = (id) => {
    const plans = JSON.parse(localStorage.getItem('recurring_plans') || '[]');
    localStorage.setItem('recurring_plans', JSON.stringify(plans.filter(p => p.id !== id)));
  };

  const getPlans = () => JSON.parse(localStorage.getItem('recurring_plans') || '[]');

  return { addPlan, removePlan, getPlans };
};
