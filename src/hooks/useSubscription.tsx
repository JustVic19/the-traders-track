
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionStatus {
  subscribed: boolean;
  plan: 'free' | 'pro';
  loading: boolean;
  checkSubscription: () => Promise<void>;
}

export const useSubscription = (): SubscriptionStatus => {
  const { user } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [plan, setPlan] = useState<'free' | 'pro'>('free');
  const [loading, setLoading] = useState(true);

  const checkSubscription = async () => {
    if (!user) {
      setSubscribed(false);
      setPlan('free');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setSubscribed(data.subscribed || false);
      setPlan(data.plan || 'free');
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscribed(false);
      setPlan('free');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user]);

  return {
    subscribed,
    plan,
    loading,
    checkSubscription,
  };
};
