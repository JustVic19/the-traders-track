
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Calendar, Award, ArrowLeft } from 'lucide-react';

type Mission = Tables<'missions'>;
type UserMission = Tables<'user_missions'>;
type Profile = Tables<'profiles'>;

interface MissionWithProgress extends Mission {
  userProgress?: UserMission;
}

const Missions = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [missions, setMissions] = useState<MissionWithProgress[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMissionsAndProgress();
    } else if (!loading) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const fetchMissionsAndProgress = async () => {
    try {
      // Fetch all missions
      const { data: missionsData, error: missionsError } = await supabase
        .from('missions')
        .select('*')
        .order('created_at', { ascending: true });

      if (missionsError) throw missionsError;

      // Fetch user's mission progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_missions')
        .select('*')
        .eq('user_id', user?.id);

      if (progressError) throw progressError;

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      // Combine missions with progress
      const missionsWithProgress = missionsData.map(mission => ({
        ...mission,
        userProgress: progressData?.find(p => p.mission_id === mission.id)
      }));

      setMissions(missionsWithProgress);
      setProfile(profileData);
    } catch (error: any) {
      console.error('Error fetching missions:', error);
      toast({
        title: "Error",
        description: "Failed to load missions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const claimReward = async (mission: MissionWithProgress) => {
    if (!mission.userProgress || !mission.userProgress.is_completed || mission.userProgress.is_claimed) {
      return;
    }

    try {
      // Update user mission as claimed
      const { error: updateError } = await supabase
        .from('user_missions')
        .update({
          is_claimed: true,
          claimed_at: new Date().toISOString()
        })
        .eq('id', mission.userProgress.id);

      if (updateError) throw updateError;

      // Update user's XP
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          xp: (profile?.xp || 0) + mission.xp_reward
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      toast({
        title: "Reward Claimed!",
        description: `You earned ${mission.xp_reward} XP for completing "${mission.title}"`,
      });

      // Refresh data
      fetchMissionsAndProgress();
    } catch (error: any) {
      console.error('Error claiming reward:', error);
      toast({
        title: "Error",
        description: "Failed to claim reward",
        variant: "destructive",
      });
    }
  };

  const getMissionIcon = (type: string) => {
    switch (type) {
      case 'daily':
        return <Calendar className="w-5 h-5" />;
      case 'weekly':
        return <Target className="w-5 h-5" />;
      case 'achievement':
        return <Trophy className="w-5 h-5" />;
      default:
        return <Award className="w-5 h-5" />;
    }
  };

  const renderMissionCard = (mission: MissionWithProgress) => {
    const progress = mission.userProgress?.current_progress || 0;
    const progressPercentage = Math.min((progress / mission.target_value) * 100, 100);
    const isCompleted = mission.userProgress?.is_completed || false;
    const isClaimed = mission.userProgress?.is_claimed || false;

    return (
      <Card key={mission.id} className="bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center space-x-2 flex-1">
            <div className="text-blue-400">
              {getMissionIcon(mission.type)}
            </div>
            <div>
              <CardTitle className="text-white text-sm">{mission.title}</CardTitle>
              <CardDescription className="text-gray-400 text-xs">
                {mission.description}
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="text-yellow-500 font-bold text-sm">
              +{mission.xp_reward} XP
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Progress</span>
                <span>{progress} / {mission.target_value}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            
            {isCompleted && !isClaimed && (
              <Button
                onClick={() => claimReward(mission)}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Award className="w-4 h-4 mr-2" />
                Claim Reward
              </Button>
            )}
            
            {isClaimed && (
              <div className="text-center text-green-400 text-sm font-medium">
                ✓ Reward Claimed
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-lg text-white">Loading missions...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const dailyMissions = missions.filter(m => m.type === 'daily');
  const weeklyMissions = missions.filter(m => m.type === 'weekly');
  const achievements = missions.filter(m => m.type === 'achievement');

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Missions & Achievements</h1>
              <p className="text-gray-400 text-sm">Complete missions to earn XP and level up</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
            <TabsTrigger value="daily" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700">
              Daily
            </TabsTrigger>
            <TabsTrigger value="weekly" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700">
              Weekly
            </TabsTrigger>
            <TabsTrigger value="achievements" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700">
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-6">
            <div className="grid gap-4">
              {dailyMissions.length > 0 ? (
                dailyMissions.map(renderMissionCard)
              ) : (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center text-gray-400">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No daily missions available</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="mt-6">
            <div className="grid gap-4">
              {weeklyMissions.length > 0 ? (
                weeklyMissions.map(renderMissionCard)
              ) : (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center text-gray-400">
                      <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No weekly missions available</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="mt-6">
            <div className="grid gap-4">
              {achievements.length > 0 ? (
                achievements.map(renderMissionCard)
              ) : (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center text-gray-400">
                      <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No achievements available</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Missions;
