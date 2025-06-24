
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type UserGeneratedMission = Tables<'user_generated_missions'>;

export const useDynamicMissions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const generateDailyMissions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.rpc('generate_daily_missions_for_user', {
        target_user_id: user.id
      });

      if (error) throw error;

      toast({
        title: "New Missions Generated!",
        description: "Your daily missions have been refreshed.",
      });
    } catch (error: any) {
      console.error('Error generating missions:', error);
      toast({
        title: "Error",
        description: "Failed to generate new missions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMissionProgress = async (missionId: string, progressToAdd: number = 1) => {
    if (!user) return;

    try {
      // Get current mission
      const { data: mission, error: missionError } = await supabase
        .from('user_generated_missions')
        .select('*')
        .eq('id', missionId)
        .eq('user_id', user.id)
        .single();

      if (missionError || !mission) return;

      const newProgress = Math.min(mission.current_progress + progressToAdd, mission.target_value);
      const isCompleted = newProgress >= mission.target_value;

      await supabase
        .from('user_generated_missions')
        .update({
          current_progress: newProgress,
          is_completed: isCompleted,
          completed_at: isCompleted && !mission.is_completed ? new Date().toISOString() : mission.completed_at
        })
        .eq('id', missionId);

    } catch (error) {
      console.error('Error updating mission progress:', error);
    }
  };

  const checkAndUpdateMissionsProgress = async () => {
    if (!user) return;

    try {
      // Get user's trades
      const { data: trades, error: tradesError } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id);

      if (tradesError || !trades) return;

      // Get active missions
      const { data: missions, error: missionsError } = await supabase
        .from('user_generated_missions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .gte('expires_at', new Date().toISOString());

      if (missionsError || !missions) return;

      // Calculate stats
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

      // Update each mission based on type
      for (const mission of missions) {
        let targetProgress = 0;
        
        if (mission.mission_type === 'achievement') {
          if (mission.title.includes('Trade Logger')) {
            targetProgress = Math.min(totalTrades, mission.target_value);
          } else if (mission.title.includes('Profit Seeker')) {
            targetProgress = Math.min(profitableTrades, mission.target_value);
          } else if (mission.title.includes('First Trade')) {
            targetProgress = Math.min(totalTrades, 1);
          }
        } else if (mission.mission_type === 'daily') {
          targetProgress = Math.min(todayTrades, mission.target_value);
        } else if (mission.mission_type === 'weekly') {
          targetProgress = Math.min(weekTrades, mission.target_value);
        }

        if (targetProgress > mission.current_progress) {
          const isCompleted = targetProgress >= mission.target_value;
          await supabase
            .from('user_generated_missions')
            .update({
              current_progress: targetProgress,
              is_completed: isCompleted,
              completed_at: isCompleted && !mission.is_completed ? new Date().toISOString() : mission.completed_at
            })
            .eq('id', mission.id);
        }
      }
    } catch (error) {
      console.error('Error updating missions progress:', error);
    }
  };

  return {
    generateDailyMissions,
    updateMissionProgress,
    checkAndUpdateMissionsProgress,
    loading
  };
};
