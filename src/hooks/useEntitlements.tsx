
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSkills } from '@/hooks/useSkills';
import { Tables } from '@/integrations/supabase/types';

type StoreItem = Tables<'store_items'>;
type UserInventory = Tables<'user_inventory'>;

interface EntitlementCheck {
  hasAdvancedDashboard: boolean;
  hasRiskSimulator: boolean;
  hasPremiumCharts: boolean;
  hasAdvancedAnalytics: boolean;
  loading: boolean;
}

export const useEntitlements = (): EntitlementCheck => {
  const { user } = useAuth();
  const { hasSkill, loading: skillsLoading } = useSkills();
  const [inventory, setInventory] = useState<(UserInventory & { store_item: StoreItem })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && !skillsLoading) {
      fetchUserInventory();
    }
  }, [user, skillsLoading]);

  const fetchUserInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('user_inventory')
        .select(`
          *,
          store_item:store_items(*)
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error fetching user inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasStoreItem = (itemKey: string): boolean => {
    return inventory.some(item => 
      item.store_item && item.store_item.item_key === itemKey
    );
  };

  return {
    hasAdvancedDashboard: hasStoreItem('advanced_analytics_dashboard'),
    hasRiskSimulator: hasSkill('risk_simulator') || hasStoreItem('risk_simulator_pro'),
    hasPremiumCharts: hasStoreItem('premium_charts') || hasSkill('advanced_charting'),
    hasAdvancedAnalytics: hasStoreItem('advanced_analytics') || hasSkill('analytics_mastery'),
    loading: loading || skillsLoading,
  };
};
