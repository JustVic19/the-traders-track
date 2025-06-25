
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useAIInsights = () => {
  const { user } = useAuth();
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateInsight = async (trades?: any[]) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('generate-quick-insights', {
        body: { user_id: user.id }
      });
      
      if (error) {
        console.error('Error generating quick insight:', error);
        setInsight('Unable to generate insight at the moment. Please try again later.');
        return;
      }
      
      setInsight(data.insight);
      
    } catch (error: any) {
      console.error('Error in generateInsight:', error);
      setInsight('Unable to generate insight at the moment. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const generatePlaybookInsight = async (tradeId: string) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('generate-playbook-insights', {
        body: { 
          user_id: user.id,
          trade_data: { trade_id: tradeId }
        }
      });
      
      if (error) {
        console.error('Error generating playbook insight:', error);
        setInsight('Unable to generate insight at the moment. Please try again later.');
        return;
      }
      
      setInsight(data.insight);
      
    } catch (error: any) {
      console.error('Error in generatePlaybookInsight:', error);
      setInsight('Unable to generate insight at the moment. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return {
    insight,
    loading,
    generateInsight,
    generatePlaybookInsight
  };
};
