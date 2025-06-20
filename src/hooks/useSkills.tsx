
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tables } from '@/integrations/supabase/types';

type UserSkill = Tables<'user_skills'>;

export const useSkills = () => {
  const { user } = useAuth();
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserSkills();
    }
  }, [user]);

  const fetchUserSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setUserSkills(data || []);
    } catch (error) {
      console.error('Error fetching user skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasSkill = (skillKey: string) => {
    return userSkills.some(skill => skill.skill_key === skillKey);
  };

  const getSkillByKey = (skillKey: string) => {
    return userSkills.find(skill => skill.skill_key === skillKey);
  };

  return {
    userSkills,
    loading,
    hasSkill,
    getSkillByKey,
    refetch: fetchUserSkills,
  };
};
