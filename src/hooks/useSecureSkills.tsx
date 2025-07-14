
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { rateLimiter, RATE_LIMITS } from '@/utils/rateLimiting';
import { secureLog } from '@/utils/secureLogging';

interface Skill {
  id: string;
  skill_key: string;
  skill_level: number;
  current_xp: number;
  max_xp: number;
  user_id: string;
  created_at: string;
  unlocked_at: string;
}

export const useSecureSkills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchSkills = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Data now includes skill_level, current_xp, and max_xp from the database
      setSkills(data || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const investFocusPoints = async (skillKey: string, points: number) => {
    if (!user) {
      toast.error('User not authenticated');
      return false;
    }

    // Rate limiting check
    if (!rateLimiter.check(user.id, RATE_LIMITS.SKILL_INVESTMENT)) {
      toast.error('Too many skill investment attempts. Please wait a moment.');
      return false;
    }

    // Client-side validation
    if (points < 1 || points > 1000) {
      toast.error('Points amount must be between 1 and 1000');
      return false;
    }

    if (!skillKey || skillKey.trim().length === 0) {
      toast.error('Invalid skill selected');
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('invest_focus_points', {
        skill_key_param: skillKey,
        points_amount: points
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string };
      
      if (!result.success) {
        toast.error(result.error || 'Failed to invest focus points');
        return false;
      }

      toast.success(result.message || 'Focus points invested successfully');
      await fetchSkills(); // Refresh skills data
      return true;
    } catch (error) {
      console.error('Error investing focus points:', error);
      toast.error('Failed to invest focus points');
      return false;
    }
  };

  const upgradeSkill = async (skillKey: string) => {
    if (!user) {
      toast.error('User not authenticated');
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('upgrade_skill', {
        user_profile_id: user.id,
        skill_key_param: skillKey
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string };
      
      if (!result.success) {
        toast.error(result.error || 'Failed to upgrade skill');
        return false;
      }

      toast.success(result.message || 'Skill upgraded successfully');
      await fetchSkills(); // Refresh skills data
      return true;
    } catch (error) {
      console.error('Error upgrading skill:', error);
      toast.error('Failed to upgrade skill');
      return false;
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [user]);

  return {
    skills,
    loading,
    investFocusPoints,
    upgradeSkill,
    refetch: fetchSkills
  };
};
