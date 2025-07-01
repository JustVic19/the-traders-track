
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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

      // Transform data to include default skill_level and current_xp values since they don't exist in the current schema
      const skillsWithDefaults = data.map(skill => ({
        ...skill,
        skill_level: 1, // Default skill level
        current_xp: 0, // Default current XP
        max_xp: 100 // Default max XP for level 1
      }));

      setSkills(skillsWithDefaults);
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

    // Client-side validation
    if (points < 1 || points > 1000) {
      toast.error('Points amount must be between 1 and 1000');
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
