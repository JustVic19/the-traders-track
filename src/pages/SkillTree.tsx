
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GitBranch, Star, Lock, CheckCircle, Coins } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';

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
    if (!profile || profile.skill_points < 1) {
      toast({
        title: "Insufficient Skill Points",
        description: "You need at least 1 skill point to upgrade a skill.",
        variant: "destructive",
      });
      return;
    }

    const skillToUpgrade = userSkills.find(skill => skill.skill_name === skillName);
    if (!skillToUpgrade) return;

    if (skillToUpgrade.skill_level >= 5) {
      toast({
        title: "Skill Maxed",
        description: "This skill is already at maximum level.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update skill level and current_xp using direct update with type assertion
      const { error: skillError } = await supabase
        .from('user_skills')
        .update({ 
          skill_level: skillToUpgrade.skill_level + 1,
          current_xp: 0 
        } as any)
        .eq('id', skillToUpgrade.id);

      if (skillError) throw skillError;

      // Decrease skill points
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ skill_points: profile.skill_points - 1 })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // Refresh data
      await fetchData();

      toast({
        title: "Skill Upgraded!",
        description: `${skillName} has been upgraded to level ${skillToUpgrade.skill_level + 1}.`,
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
          maxXp: (userSkill?.skill_level || 1) * 100 // XP requirement increases with level
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
                <div key={categoryIndex}>
                  <div className="flex items-center space-x-3 mb-6">
                    <span className="text-2xl">{category.icon}</span>
                    <h2 className="text-xl font-bold text-white">{category.name}</h2>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {category.skills.map((skill, skillIndex) => (
                      <Card key={skillIndex} className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-white flex items-center space-x-2">
                              {skill.level === skill.maxLevel ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : skill.level > 1 ? (
                                <Star className="w-5 h-5 text-yellow-500" />
                              ) : (
                                <Lock className="w-5 h-5 text-gray-500" />
                              )}
                              <span>{skill.name}</span>
                            </CardTitle>
                            <Badge 
                              variant={skill.level > 1 ? "default" : "secondary"}
                              className={skill.level > 1 ? "bg-blue-600" : ""}
                            >
                              Level {skill.level}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Progress</span>
                                <span className="text-white">{skill.xp}/{skill.maxXp} XP</span>
                              </div>
                              <Progress 
                                value={(skill.xp / skill.maxXp) * 100} 
                                className="h-2"
                              />
                            </div>
                            
                            {skill.level < skill.maxLevel && (
                              <Button 
                                className="w-full"
                                disabled={!profile || profile.skill_points < 1}
                                onClick={() => upgradeSkill(skill.name)}
                              >
                                {!profile || profile.skill_points < 1 ? "No Skill Points" : "Upgrade (1 SP)"}
                              </Button>
                            )}
                            
                            {skill.level === skill.maxLevel && (
                              <div className="text-center text-green-400 font-medium">
                                ✨ Mastered
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default SkillTree;
