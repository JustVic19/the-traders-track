
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useWeeklyInsights = () => {
  const { user } = useAuth();
  const [weeklyInsights, setWeeklyInsights] = useState<string | null>(null);
  const [insightsDate, setInsightsDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchWeeklyInsights();
  }, [user]);

  const fetchWeeklyInsights = async () => {
    try {
      setLoading(true);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('weekly_insights, weekly_insights_date')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching weekly insights:', error);
        return;
      }

      setWeeklyInsights(profile?.weekly_insights || null);
      setInsightsDate(profile?.weekly_insights_date || null);
    } catch (error) {
      console.error('Error in fetchWeeklyInsights:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateManualInsight = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('generate-weekly-insights');
      
      if (error) throw error;
      
      // Refresh the insights after generation
      await fetchWeeklyInsights();
      
      return { success: true };
    } catch (error: any) {
      console.error('Error generating manual insight:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    weeklyInsights,
    insightsDate,
    loading,
    generateManualInsight,
    refetch: fetchWeeklyInsights
  };
};
