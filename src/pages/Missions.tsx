
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Star, Coins } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';

type UserMission = Tables<'user_missions'> & {
  mission: Tables<'missions'>;
};
type Profile = Tables<'profiles'>;

const Missions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userMissions, setUserMissions] = useState<UserMission[]>([]);
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

      // Fetch user missions with mission details
      const { data: missionsData, error: missionsError } = await supabase
        .from('user_missions')
        .select(`
          *,
          mission:missions(*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (missionsError) throw missionsError;
      setUserMissions(missionsData as UserMission[] || []);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load missions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async (userMissionId: string, xpReward: number) => {
    try {
      // Mark mission as claimed
      const { error: missionError } = await supabase
        .from('user_missions')
        .update({ is_claimed: true, claimed_at: new Date().toISOString() })
        .eq('id', userMissionId);

      if (missionError) throw missionError;

      // Grant focus points by updating the profile directly
      const { error: focusError } = await supabase
        .from('profiles')
        .update({ 
          focus_points: (profile?.focus_points || 0) + xpReward,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (focusError) throw focusError;

      toast({
        title: "Reward Claimed!",
        description: `You gained ${xpReward} Focus Points!`,
      });

      fetchData(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to claim reward",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-900">
          <AppSidebar profile={profile} />
          <SidebarInset className="flex-1 flex items-center justify-center">
            <div className="text-lg text-white">Loading missions...</div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  const completedMissions = userMissions.filter(m => m.is_completed);
  const activeMissions = userMissions.filter(m => !m.is_completed);
  const totalRewards = completedMissions.reduce((sum, m) => sum + (m.mission?.xp_reward || 0), 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-900">
        <AppSidebar profile={profile} />
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Missions</h1>
                <p className="text-gray-400">Complete challenges to earn Focus Points and level up.</p>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="container mx-auto px-6 py-8 bg-gray-900">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Active Missions</CardTitle>
                  <Target className="w-4 h-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{activeMissions.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Completed</CardTitle>
                  <Trophy className="w-4 h-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{completedMissions.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Focus Points Earned</CardTitle>
                  <Star className="w-4 h-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-400">{totalRewards} FP</div>
                </CardContent>
              </Card>
            </div>

            {/* Missions List */}
            <div className="space-y-6">
              {/* Active Missions */}
              {activeMissions.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Active Missions</h2>
                  <div className="grid gap-4">
                    {activeMissions.map((userMission) => (
                      <Card key={userMission.id} className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Target className="w-5 h-5 text-blue-500" />
                              <div>
                                <CardTitle className="text-white">{userMission.mission?.title}</CardTitle>
                                <p className="text-gray-400 text-sm">{userMission.mission?.description}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-blue-400 border-blue-400">
                              {userMission.mission?.xp_reward} FP
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Progress</span>
                              <span className="text-white">
                                {userMission.current_progress}/{userMission.mission?.target_value}
                              </span>
                            </div>
                            <Progress 
                              value={(userMission.current_progress / (userMission.mission?.target_value || 1)) * 100} 
                              className="h-2"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Missions */}
              {completedMissions.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Completed Missions</h2>
                  <div className="grid gap-4">
                    {completedMissions.map((userMission) => (
                      <Card key={userMission.id} className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Trophy className="w-5 h-5 text-yellow-500" />
                              <div>
                                <CardTitle className="text-white">{userMission.mission?.title}</CardTitle>
                                <p className="text-gray-400 text-sm">{userMission.mission?.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-green-400 border-green-400">
                                Completed
                              </Badge>
                              {!userMission.is_claimed && (
                                <Button 
                                  size="sm"
                                  onClick={() => claimReward(userMission.id, userMission.mission?.xp_reward || 0)}
                                  className="bg-yellow-600 hover:bg-yellow-700"
                                >
                                  Claim {userMission.mission?.xp_reward} FP
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {userMissions.length === 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="text-center py-8">
                    <Target className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No missions yet</h3>
                    <p className="text-gray-400">Start trading to unlock your first missions!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Missions;
