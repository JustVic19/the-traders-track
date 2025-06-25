
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useMistakePatternInsights = () => {
  const { user } = useAuth();
  const [mistakeInsight, setMistakeInsight] = useState<string | null>(null);
  const [insightDate, setInsightDate] = useState<string | null>(null);
  const [patternType, setPatternType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchMistakeInsights();
  }, [user]);

  const fetchMistakeInsights = async () => {
    try {
      setLoading(true);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('mistake_pattern_insight, mistake_pattern_date, mistake_pattern_type')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching mistake insights:', error);
        return;
      }

      setMistakeInsight(profile?.mistake_pattern_insight || null);
      setInsightDate(profile?.mistake_pattern_date || null);
      setPatternType(profile?.mistake_pattern_type || null);
    } catch (error) {
      console.error('Error in fetchMistakeInsights:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateManualInsight = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('analyze-mistake-patterns', {
        body: { user_id: user?.id }
      });
      
      if (error) throw error;
      
      // Refresh the insights after generation
      await fetchMistakeInsights();
      
      return { success: true };
    } catch (error: any) {
      console.error('Error generating manual insight:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    mistakeInsight,
    insightDate,
    patternType,
    loading,
    generateManualInsight,
    refetch: fetchMistakeInsights
  };
};
