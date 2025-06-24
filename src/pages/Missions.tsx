
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Star, RefreshCw, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import { useDynamicMissions } from '@/hooks/useDynamicMissions';

type UserGeneratedMission = Tables<'user_generated_missions'>;
type Profile = Tables<'profiles'>;

const Missions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { generateDailyMissions, checkAndUpdateMissionsProgress, loading: missionLoading } = useDynamicMissions();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userMissions, setUserMissions] = useState<UserGeneratedMission[]>([]);
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

      // Fetch user generated missions
      const { data: missionsData, error: missionsError } = await supabase
        .from('user_generated_missions')
        .select('*')
        .eq('user_id', user?.id)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (missionsError) throw missionsError;
      setUserMissions(missionsData || []);

      // Update mission progress based on current trades
      await checkAndUpdateMissionsProgress();

      // Refetch missions after progress update
      const { data: updatedMissions } = await supabase
        .from('user_generated_missions')
        .select('*')
        .eq('user_id', user?.id)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      setUserMissions(updatedMissions || []);

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

  const claimReward = async (missionId: string, xpReward: number) => {
    try {
      // Mark mission as claimed
      const { error: missionError } = await supabase
        .from('user_generated_missions')
        .update({ is_claimed: true, claimed_at: new Date().toISOString() })
        .eq('id', missionId);

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

  const handleGenerateNewMissions = async () => {
    await generateDailyMissions();
    fetchData(); // Refresh the missions list
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }
    return `${minutes}m left`;
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full" style={{ backgroundColor: '#0B0F19' }}>
          <AppSidebar profile={profile} />
          <SidebarInset className="flex-1 flex items-center justify-center">
            <div className="text-lg text-white">Loading missions...</div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  const activeMissions = userMissions.filter(m => !m.is_completed);
  const completedMissions = userMissions.filter(m => m.is_completed);
  const totalRewards = completedMissions.reduce((sum, m) => sum + m.xp_reward, 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full" style={{ backgroundColor: '#0B0F19' }}>
        <AppSidebar profile={profile} />
        <SidebarInset className="flex-1" style={{ backgroundColor: '#0B0F19' }}>
          {/* Header */}
          <header className="border-b border-gray-700 px-6 py-4" style={{ backgroundColor: '#1A1F2E' }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Daily Missions</h1>
                <p className="text-gray-400">Complete challenges to earn Focus Points and level up.</p>
              </div>
              <Button 
                onClick={handleGenerateNewMissions}
                disabled={missionLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${missionLoading ? 'animate-spin' : ''}`} />
                Generate New Missions
              </Button>
            </div>
          </header>

          {/* Content */}
          <main className="px-6 py-8" style={{ backgroundColor: '#0B0F19' }}>
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
                  <CardTitle className="text-sm font-medium text-gray-300">Completed Today</CardTitle>
                  <Trophy className="w-4 h-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{completedMissions.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Focus Points Earned</CardTitle>
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
                    {activeMissions.map((mission) => (
                      <Card key={mission.id} className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Target className="w-5 h-5 text-blue-500" />
                              <div>
                                <CardTitle className="text-white">{mission.title}</CardTitle>
                                <p className="text-gray-400 text-sm">{mission.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-blue-400 border-blue-400">
                                {mission.xp_reward} FP
                              </Badge>
                              <div className="flex items-center text-xs text-gray-400">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatTimeRemaining(mission.expires_at)}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Progress</span>
                              <span className="text-white">
                                {mission.current_progress}/{mission.target_value}
                              </span>
                            </div>
                            <Progress 
                              value={(mission.current_progress / mission.target_value) * 100} 
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
                    {completedMissions.map((mission) => (
                      <Card key={mission.id} className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Trophy className="w-5 h-5 text-yellow-500" />
                              <div>
                                <CardTitle className="text-white">{mission.title}</CardTitle>
                                <p className="text-gray-400 text-sm">{mission.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-green-400 border-green-400">
                                Completed
                              </Badge>
                              {!mission.is_claimed && (
                                <Button 
                                  size="sm"
                                  onClick={() => claimReward(mission.id, mission.xp_reward)}
                                  className="bg-yellow-600 hover:bg-yellow-700"
                                >
                                  Claim {mission.xp_reward} FP
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
                    <h3 className="text-lg font-medium text-white mb-2">No missions available</h3>
                    <p className="text-gray-400 mb-4">Generate your daily missions to get started!</p>
                    <Button 
                      onClick={handleGenerateNewMissions}
                      disabled={missionLoading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${missionLoading ? 'animate-spin' : ''}`} />
                      Generate Daily Missions
                    </Button>
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
