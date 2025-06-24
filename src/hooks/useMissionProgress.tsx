
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDynamicMissions } from '@/hooks/useDynamicMissions';

export const useMissionProgress = () => {
  const { user } = useAuth();
  const { checkAndUpdateMissionsProgress } = useDynamicMissions();

  // Legacy function for backward compatibility - now redirects to dynamic missions
  const updateMissionProgress = async (missionKey: string, progressToAdd: number = 1) => {
    console.log('Legacy mission progress update called, updating dynamic missions instead');
    await checkAndUpdateMissionsProgress();
  };

  const checkTradeBasedMissions = async () => {
    if (!user) return;
    
    console.log('Checking trade-based missions for dynamic missions system');
    await checkAndUpdateMissionsProgress();
  };

  return {
    updateMissionProgress,
    checkTradeBasedMissions
  };
};
