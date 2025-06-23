
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

type UserSkill = Tables<'user_skills'>;
type Profile = Tables<'profiles'>;

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

      // Fetch user skills
      const { data: skillsData, error: skillsError } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', user?.id);

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

  const skillCategories = [
    {
      name: "Risk Management",
      icon: "🛡️",
      skills: [
        { name: "Position Sizing", level: 2, maxLevel: 5, xp: 150, maxXp: 250 },
        { name: "Stop Loss Mastery", level: 1, maxLevel: 5, xp: 80, maxXp: 200 },
        { name: "Risk/Reward Optimization", level: 0, maxLevel: 5, xp: 0, maxXp: 150 },
      ]
    },
    {
      name: "Technical Analysis",
      icon: "📊",
      skills: [
        { name: "Chart Pattern Recognition", level: 3, maxLevel: 5, xp: 280, maxXp: 300 },
        { name: "Indicator Mastery", level: 2, maxLevel: 5, xp: 180, maxXp: 250 },
        { name: "Support & Resistance", level: 1, maxLevel: 5, xp: 120, maxXp: 200 },
      ]
    },
    {
      name: "Psychology",
      icon: "🧠",
      skills: [
        { name: "Emotional Control", level: 1, maxLevel: 5, xp: 90, maxXp: 200 },
        { name: "Discipline Mastery", level: 2, maxLevel: 5, xp: 170, maxXp: 250 },
        { name: "FOMO Resistance", level: 0, maxLevel: 5, xp: 0, maxXp: 150 },
      ]
    }
  ];

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-900">
          <AppSidebar profile={profile} />
          <SidebarInset className="flex-1 flex items-center justify-center">
            <div className="text-lg text-white">Loading skill tree...</div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-900">
        <AppSidebar profile={profile} />
        <SidebarInset className="flex-1">
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
                  <p className="text-xl font-bold text-blue-400">5</p>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="container mx-auto px-6 py-8">
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
                              ) : skill.level > 0 ? (
                                <Star className="w-5 h-5 text-yellow-500" />
                              ) : (
                                <Lock className="w-5 h-5 text-gray-500" />
                              )}
                              <span>{skill.name}</span>
                            </CardTitle>
                            <Badge 
                              variant={skill.level > 0 ? "default" : "secondary"}
                              className={skill.level > 0 ? "bg-blue-600" : ""}
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
                                disabled={skill.level === 0}
                                variant={skill.level > 0 ? "default" : "secondary"}
                              >
                                {skill.level === 0 ? "Locked" : "Upgrade (1 SP)"}
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
