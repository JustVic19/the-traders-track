
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import SkillBranch from '@/components/SkillBranch';

// Define the actual user_skills structure from our migration
interface UserSkill {
  id: string;
  user_id: string;
  skill_name: string;
  skill_level: number;
  current_xp: number;
  created_at: string;
  updated_at: string;
}

// Define the response type for the upgrade_skill function
interface UpgradeSkillResponse {
  success: boolean;
  error?: string;
  message?: string;
}

type Profile = Tables<'profiles'>;

interface SkillData {
  name: string;
  level: number;
  maxLevel: number;
  xp: number;
  maxXp: number;
}

interface SkillCategory {
  name: string;
  icon: string;
  skills: SkillData[];
}

const SkillTree = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch user skills - using any type to bypass TypeScript issues with the auto-generated types
      const { data: skillsData, error: skillsError } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', user?.id) as { data: UserSkill[] | null, error: any };

      if (skillsError) throw skillsError;
      setUserSkills(skillsData || []);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load skill tree",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const upgradeSkill = async (skillName: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    try {
      // Call the secure backend function
      const { data, error } = await supabase.rpc('upgrade_skill', {
        user_profile_id: user.id,
        skill_name_param: skillName
      });

      if (error) throw error;

      // Type assertion to handle the JSON response - convert to unknown first, then to our interface
      const result = data as unknown as UpgradeSkillResponse;

      // Check the result from the function
      if (!result.success) {
        toast({
          title: "Upgrade Failed",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      // Success - refresh data to show updated values
      await fetchData();

      toast({
        title: "Skill Upgraded!",
        description: `${skillName} has been upgraded successfully.`,
        variant: "default",
      });

    } catch (error: any) {
      console.error('Error upgrading skill:', error);
      toast({
        title: "Error",
        description: "Failed to upgrade skill",
        variant: "destructive",
      });
    }
  };

  const getSkillCategories = (): SkillCategory[] => {
    const categories = [
      {
        name: "Risk Management",
        icon: "🛡️",
        skillNames: ["Position Sizing", "Stop Loss Mastery", "Risk/Reward Optimization"]
      },
      {
        name: "Technical Analysis", 
        icon: "📊",
        skillNames: ["Chart Pattern Recognition", "Indicator Mastery", "Support & Resistance"]
      },
      {
        name: "Psychology",
        icon: "🧠", 
        skillNames: ["Emotional Control", "Discipline Mastery", "FOMO Resistance"]
      }
    ];

    return categories.map(category => ({
      name: category.name,
      icon: category.icon,
      skills: category.skillNames.map(skillName => {
        const userSkill = userSkills.find(skill => skill.skill_name === skillName);
        return {
          name: skillName,
          level: userSkill?.skill_level || 1,
          maxLevel: 5,
          xp: userSkill?.current_xp || 0,
          maxXp: (userSkill?.skill_level || 1) * 100
        };
      })
    }));
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-900">
          <AppSidebar profile={profile} />
          <SidebarInset className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#0B0F19' }}>
            <div className="text-lg text-white">Loading skill tree...</div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  const skillCategories = getSkillCategories();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-900">
        <AppSidebar profile={profile} />
        <SidebarInset className="flex-1" style={{ backgroundColor: '#0B0F19' }}>
          {/* Header */}
          <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Skill Tree</h1>
                <p className="text-gray-400">Develop your trading skills and unlock new abilities.</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-400">Available Skill Points</p>
                  <p className="text-xl font-bold text-blue-400">{profile?.skill_points || 0}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="container mx-auto px-6 py-8" style={{ backgroundColor: '#0B0F19' }}>
            <div className="space-y-8">
              {skillCategories.map((category, categoryIndex) => (
                <SkillBranch
                  key={categoryIndex}
                  categoryName={category.name}
                  categoryIcon={category.icon}
                  skills={category.skills}
                  skillPoints={profile?.skill_points || 0}
                  onUpgrade={upgradeSkill}
                />
              ))}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default SkillTree;
