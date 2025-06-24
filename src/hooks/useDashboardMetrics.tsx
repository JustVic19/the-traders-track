
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Trade = Tables<'trades'>;

export interface DashboardMetrics {
  totalPnL: number;
  winRate: number;
  totalTrades: number;
  profitFactor: number;
  avgRR: number;
  tTrackScore: string;
  openTrades: number;
  closedTrades: number;
  grossProfit: number;
  grossLoss: number;
  winningTrades: number;
  losingTrades: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
}

export interface DailyTradeData {
  date: string;
  pnl: number;
  tradeCount: number;
  winRate: number;
  performance: 'excellent' | 'good' | 'neutral' | 'poor' | 'terrible';
}

export const useDashboardMetrics = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch trades data
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchTrades();
  }, [user]);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user?.id)
        .order('entry_date', { ascending: false });

      if (fetchError) throw fetchError;

      setTrades(data || []);
    } catch (err: any) {
      console.error('Error fetching trades:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load trade data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate comprehensive metrics
  const metrics = useMemo((): DashboardMetrics => {
    if (!trades.length) {
      return {
        totalPnL: 0,
        winRate: 0,
        totalTrades: 0,
        profitFactor: 0,
        avgRR: 0,
        tTrackScore: 'N/A',
        openTrades: 0,
        closedTrades: 0,
        grossProfit: 0,
        grossLoss: 0,
        winningTrades: 0,
        losingTrades: 0,
        avgWin: 0,
        avgLoss: 0,
        largestWin: 0,
        largestLoss: 0,
      };
    }

    const openTrades = trades.filter(trade => trade.is_open);
    const closedTrades = trades.filter(trade => !trade.is_open && trade.profit_loss !== null);
    const totalTrades = trades.length;

    // Basic P/L calculations
    const totalPnL = closedTrades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0);
    const winningTrades = closedTrades.filter(trade => (trade.profit_loss || 0) > 0);
    const losingTrades = closedTrades.filter(trade => (trade.profit_loss || 0) < 0);

    // Win rate calculation
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;

    // Profit/Loss calculations
    const grossProfit = winningTrades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0));

    // Profit factor calculation
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 999 : 0);

    // Average win/loss calculations
    const avgWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0;

    // Average R/R calculation (simplified - using avg win / avg loss)
    const avgRR = avgLoss > 0 ? avgWin / avgLoss : (avgWin > 0 ? 999 : 0);

    // Largest win/loss
    const largestWin = winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.profit_loss || 0)) : 0;
    const largestLoss = losingTrades.length > 0 ? Math.abs(Math.min(...losingTrades.map(t => t.profit_loss || 0))) : 0;

    // T-Track Score calculation using the new formula
    const tTrackScore = calculateTTrackScore(winRate, profitFactor);

    return {
      totalPnL,
      winRate,
      totalTrades,
      profitFactor,
      avgRR,
      tTrackScore,
      openTrades: openTrades.length,
      closedTrades: closedTrades.length,
      grossProfit,
      grossLoss,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      avgWin,
      avgLoss,
      largestWin,
      largestLoss,
    };
  }, [trades]);

  // Group trades by day for calendar heatmap
  const dailyTradeData = useMemo((): DailyTradeData[] => {
    if (!trades.length) return [];

    const dailyMap = new Map<string, { pnl: number; trades: Trade[] }>();

    // Group trades by date
    trades.forEach(trade => {
      if (!trade.is_open && trade.profit_loss !== null && trade.exit_date) {
        const date = new Date(trade.exit_date).toISOString().split('T')[0];
        
        if (!dailyMap.has(date)) {
          dailyMap.set(date, { pnl: 0, trades: [] });
        }
        
        const dayData = dailyMap.get(date)!;
        dayData.pnl += trade.profit_loss;
        dayData.trades.push(trade);
      }
    });

    // Convert to array and calculate performance metrics
    return Array.from(dailyMap.entries()).map(([date, data]) => {
      const winningTrades = data.trades.filter(t => (t.profit_loss || 0) > 0);
      const dayWinRate = data.trades.length > 0 ? (winningTrades.length / data.trades.length) * 100 : 0;
      
      // Determine performance level based on P/L and win rate
      let performance: DailyTradeData['performance'] = 'neutral';
      
      if (data.pnl > 0) {
        if (dayWinRate >= 70) performance = 'excellent';
        else if (dayWinRate >= 50) performance = 'good';
        else performance = 'neutral';
      } else if (data.pnl < 0) {
        if (dayWinRate < 30) performance = 'terrible';
        else if (dayWinRate < 50) performance = 'poor';
        else performance = 'neutral';
      }

      return {
        date,
        pnl: data.pnl,
        tradeCount: data.trades.length,
        winRate: dayWinRate,
        performance,
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [trades]);

  return {
    trades,
    metrics,
    dailyTradeData,
    loading,
    error,
    refetch: fetchTrades,
  };
};

// T-Track Score calculation function with the new formula
const calculateTTrackScore = (winRate: number, profitFactor: number): string => {
  // Win Rate Score: (user's win rate % / 100) * 50
  const winRateScore = (winRate / 100) * 50;
  
  // Profit Factor Score: (min(profit factor, 2.0) / 2.0) * 50
  // Cap profit factor at 2.0 for scoring purposes
  const cappedProfitFactor = Math.min(profitFactor, 2.0);
  const profitFactorScore = (cappedProfitFactor / 2.0) * 50;
  
  // Total Score is the sum of both scores
  const totalScore = winRateScore + profitFactorScore;
  
  // Convert to letter grade
  if (totalScore >= 90) return 'A';
  if (totalScore >= 80) return 'B';
  if (totalScore >= 70) return 'C';
  if (totalScore >= 60) return 'D';
  return 'F';
};
