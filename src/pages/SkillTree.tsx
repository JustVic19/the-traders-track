
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSkills } from '@/hooks/useSkills';
import { useEntitlements } from '@/hooks/useEntitlements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Crown, Unlock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import AppSidebar from '@/components/AppSidebar';
import SkillBranch from '@/components/SkillBranch';
import SkillCard from '@/components/SkillCard';

type Profile = Tables<'profiles'>;

const SkillTree = () => {
  const { user } = useAuth();
  const { userSkills, loading: skillsLoading } = useSkills();
  const { hasRiskSimulator, hasAdvancedDashboard } = useEntitlements();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || skillsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0B0F19' }}>
        <div className="text-lg text-white">Loading skill tree...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full" style={{ backgroundColor: '#0B0F19' }}>
        <AppSidebar profile={profile} />
        <SidebarInset className="flex-1 w-full" style={{ backgroundColor: '#0B0F19' }}>
          <header className="border-b border-gray-700 px-6 py-4 w-full" style={{ backgroundColor: '#1A1F2E' }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Skill Tree</h1>
                <p className="text-gray-400">Unlock powerful trading features and abilities</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Skill Points Available</p>
                <p className="text-2xl font-bold text-blue-400">{profile?.skill_points || 0}</p>
              </div>
            </div>
          </header>

          <main className="w-full px-6 py-8" style={{ backgroundColor: '#0B0F19' }}>
            {/* Unlocked Premium Features */}
            {(hasRiskSimulator || hasAdvancedDashboard) && (
              <Card className="bg-gray-800 border-gray-700 border-l-4 border-l-yellow-500 mb-8">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Crown className="w-5 h-5 mr-2 text-yellow-400" />
                    Unlocked Premium Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {hasRiskSimulator && (
                      <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                        <Unlock className="w-4 h-4 mr-1" />
                        Risk Simulator
                      </Badge>
                    )}
                    {hasAdvancedDashboard && (
                      <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                        <Unlock className="w-4 h-4 mr-1" />
                        Advanced Analytics Dashboard
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skill Branches */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <SkillBranch
                title="Risk Management"
                color="red"
                skills={[
                  {
                    name: "Position Sizing",
                    description: "Master optimal position sizing techniques",
                    level: 1,
                    maxLevel: 5,
                    xp: 0,
                    maxXp: 100,
                    unlocked: true
                  },
                  {
                    name: "Stop Loss Mastery",
                    description: "Advanced stop loss strategies",
                    level: 1,
                    maxLevel: 5,
                    xp: 0,
                    maxXp: 100,
                    unlocked: true
                  },
                  {
                    name: "Risk Simulator",
                    description: "Unlock advanced risk simulation tools",
                    level: hasRiskSimulator ? 1 : 0,
                    maxLevel: 1,
                    xp: hasRiskSimulator ? 100 : 0,
                    maxXp: 100,
                    unlocked: hasRiskSimulator,
                    isPremium: true
                  }
                ]}
                userSkills={userSkills}
                onSkillUpgrade={() => {}}
              />

              <SkillBranch
                title="Technical Analysis"
                color="blue"
                skills={[
                  {
                    name: "Chart Pattern Recognition",
                    description: "Identify profitable chart patterns",
                    level: 1,
                    maxLevel: 5,
                    xp: 0,
                    maxXp: 100,
                    unlocked: true
                  },
                  {
                    name: "Indicator Mastery",
                    description: "Master technical indicators",
                    level: 1,
                    maxLevel: 5,
                    xp: 0,
                    maxXp: 100,
                    unlocked: true
                  },
                  {
                    name: "Advanced Analytics",
                    description: "Unlock premium dashboard features",
                    level: hasAdvancedDashboard ? 1 : 0,
                    maxLevel: 1,
                    xp: hasAdvancedDashboard ? 100 : 0,
                    maxXp: 100,
                    unlocked: hasAdvancedDashboard,
                    isPremium: true
                  }
                ]}
                userSkills={userSkills}
                onSkillUpgrade={() => {}}
              />

              <SkillBranch
                title="Psychology"
                color="purple"
                skills={[
                  {
                    name: "Emotional Control",
                    description: "Control emotions during trading",
                    level: 1,
                    maxLevel: 5,
                    xp: 0,
                    maxXp: 100,
                    unlocked: true
                  },
                  {
                    name: "Discipline Mastery",
                    description: "Maintain trading discipline",
                    level: 1,
                    maxLevel: 5,
                    xp: 0,
                    maxXp: 100,
                    unlocked: true
                  },
                  {
                    name: "FOMO Resistance",
                    description: "Resist fear of missing out",
                    level: 1,
                    maxLevel: 5,
                    xp: 0,
                    maxXp: 100,
                    unlocked: true
                  }
                ]}
                userSkills={userSkills}
                onSkillUpgrade={() => {}}
              />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default SkillTree;
