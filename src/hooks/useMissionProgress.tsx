
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useMissionProgress = () => {
  const { user } = useAuth();

  const updateMissionProgress = async (missionKey: string, progressToAdd: number = 1) => {
    if (!user) return;

    try {
      // Get the mission
      const { data: mission, error: missionError } = await supabase
        .from('missions')
        .select('*')
        .eq('mission_key', missionKey)
        .single();

      if (missionError || !mission) return;

      // Get or create user mission progress
      const { data: existingProgress, error: progressError } = await supabase
        .from('user_missions')
        .select('*')
        .eq('user_id', user.id)
        .eq('mission_id', mission.id)
        .maybeSingle();

      if (progressError) return;

      const currentProgress = existingProgress?.current_progress || 0;
      const newProgress = Math.min(currentProgress + progressToAdd, mission.target_value);
      const isCompleted = newProgress >= mission.target_value;

      if (existingProgress) {
        // Update existing progress
        await supabase
          .from('user_missions')
          .update({
            current_progress: newProgress,
            is_completed: isCompleted,
            completed_at: isCompleted && !existingProgress.is_completed ? new Date().toISOString() : existingProgress.completed_at
          })
          .eq('id', existingProgress.id);
      } else {
        // Create new progress entry
        await supabase
          .from('user_missions')
          .insert({
            user_id: user.id,
            mission_id: mission.id,
            current_progress: newProgress,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null
          });
      }
    } catch (error) {
      console.error('Error updating mission progress:', error);
    }
  };

  const checkTradeBasedMissions = async () => {
    if (!user) return;

    try {
      // Get user's trades
      const { data: trades, error: tradesError } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id);

      if (tradesError || !trades) return;

      const totalTrades = trades.length;
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const todayTrades = trades.filter(trade => 
        new Date(trade.created_at) >= todayStart
      ).length;

      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekTrades = trades.filter(trade => 
        new Date(trade.created_at) >= weekStart
      ).length;

      const profitableTrades = trades.filter(trade => 
        !trade.is_open && (trade.profit_loss || 0) > 0
      ).length;

      // Update mission progress based on current stats
      await updateMissionProgressDirectly('first_trade', Math.min(totalTrades, 1));
      await updateMissionProgressDirectly('log_5_trades', Math.min(totalTrades, 5));
      await updateMissionProgressDirectly('daily_trade', Math.min(todayTrades, 1));
      await updateMissionProgressDirectly('active_day', Math.min(todayTrades, 3));
      await updateMissionProgressDirectly('weekly_10_trades', Math.min(weekTrades, 10));
      await updateMissionProgressDirectly('profit_3_trades', Math.min(profitableTrades, 3));
    } catch (error) {
      console.error('Error checking trade-based missions:', error);
    }
  };

  const updateMissionProgressDirectly = async (missionKey: string, newProgress: number) => {
    if (!user) return;

    try {
      const { data: mission, error: missionError } = await supabase
        .from('missions')
        .select('*')
        .eq('mission_key', missionKey)
        .single();

      if (missionError || !mission) return;

      const { data: existingProgress } = await supabase
        .from('user_missions')
        .select('*')
        .eq('user_id', user.id)
        .eq('mission_id', mission.id)
        .maybeSingle();

      const isCompleted = newProgress >= mission.target_value;

      if (existingProgress) {
        if (existingProgress.current_progress < newProgress) {
          await supabase
            .from('user_missions')
            .update({
              current_progress: newProgress,
              is_completed: isCompleted,
              completed_at: isCompleted && !existingProgress.is_completed ? new Date().toISOString() : existingProgress.completed_at
            })
            .eq('id', existingProgress.id);
        }
      } else {
        await supabase
          .from('user_missions')
          .insert({
            user_id: user.id,
            mission_id: mission.id,
            current_progress: newProgress,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null
          });
      }
    } catch (error) {
      console.error('Error updating mission progress directly:', error);
    }
  };

  return {
    updateMissionProgress,
    checkTradeBasedMissions
  };
};
