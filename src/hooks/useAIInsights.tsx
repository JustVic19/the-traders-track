
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Trade = Tables<'trades'>;

interface AIInsight {
  insight: string;
  loading: boolean;
  error: string | null;
}

export const useAIInsights = () => {
  const [insights, setInsights] = useState<AIInsight>({
    insight: '',
    loading: false,
    error: null
  });
  const { toast } = useToast();

  const generateInsight = async (trades: Trade[]) => {
    if (trades.length === 0) {
      toast({
        title: "No Trade Data",
        description: "You need some trades logged to generate insights.",
        variant: "destructive",
      });
      return;
    }

    setInsights({ insight: '', loading: true, error: null });

    try {
      // Prepare trade data for analysis
      const recentTrades = trades.slice(0, 10); // Last 10 trades
      const tradeAnalysis = recentTrades.map(trade => ({
        symbol: trade.symbol,
        type: trade.trade_type,
        pnl: trade.profit_loss,
        isOpen: trade.is_open,
        notes: trade.notes
      }));

      const { data, error } = await supabase.functions.invoke('generate-ai-insights', {
        body: { trades: tradeAnalysis }
      });

      if (error) throw error;

      setInsights({
        insight: data.insight,
        loading: false,
        error: null
      });

      toast({
        title: "AI Insight Generated",
        description: "Coach Vega has analyzed your recent trades.",
      });

    } catch (error: any) {
      console.error('Error generating AI insight:', error);
      setInsights({
        insight: '',
        loading: false,
        error: error.message
      });

      toast({
        title: "Error",
        description: "Failed to generate AI insight. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    ...insights,
    generateInsight
  };
};
