
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TradingPlan {
  id: string;
  title: string;
  entry_rules: string;
  exit_rules: string;
  risk_management_rules: string;
  created_at: string;
  updated_at: string;
}

export const useTradingPlans = () => {
  const { user } = useAuth();
  const [tradingPlans, setTradingPlans] = useState<TradingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTradingPlans = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trading_plans')
        .select('*')
        .order('title', { ascending: true });

      if (error) throw error;
      setTradingPlans(data || []);
    } catch (error) {
      console.error('Error fetching trading plans:', error);
      setTradingPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTradingPlans();
  }, [user]);

  return {
    tradingPlans,
    loading,
    refetch: fetchTradingPlans
  };
};
