import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AlphaCoinBalance from '@/components/AlphaCoinBalance';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const TRADER_AVATARS = [
  { id: 'scalper_sam', name: 'Scalper Sam', emoji: '⚡' },
  { id: 'swinging_sarah', name: 'Swinging Sarah', emoji: '📈' },
  { id: 'day_trader_dan', name: 'Day Trader Dan', emoji: '💼' },
  { id: 'crypto_chris', name: 'Crypto Chris', emoji: '₿' },
  { id: 'forex_fiona', name: 'Forex Fiona', emoji: '🌍' },
];

const Dashboard = () => {
  const { user, signOut } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const getAvatarDisplay = (avatarId: string | null) => {
    const avatar = TRADER_AVATARS.find(a => a.id === avatarId);
    return avatar || TRADER_AVATARS[0];
  };

  const calculateLevelProgress = (xp: number, level: number) => {
    const xpForCurrentLevel = (level - 1) * 100;
    const xpForNextLevel = level * 100;
    const progressInCurrentLevel = xp - xpForCurrentLevel;
    const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
    return Math.max(0, Math.min(100, (progressInCurrentLevel / xpNeededForLevel) * 100));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">No profile data found.</div>
      </div>
    );
  }

  const currentAvatar = getAvatarDisplay(profile?.trader_avatar);
  const levelProgress = calculateLevelProgress(profile?.xp || 0, profile?.level || 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Trading Dashboard
            </h1>
            <p className="text-gray-300">Welcome back, {currentAvatar.name}!</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <AlphaCoinBalance balance={profile?.alpha_coins || 0} />
            <div className="flex items-center space-x-2 bg-gray-700 px-3 py-2 rounded-lg">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-white font-bold">{profile?.skill_points || 0}</span>
              <span className="text-gray-400 text-sm">Skill Points</span>
            </div>
            <Link to="/profile">
              <Button variant="outline" size="sm" className="text-white border-gray-600 hover:bg-gray-700">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={signOut}
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Level</CardTitle>
              <CardDescription className="text-gray-400">Current Level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white">{profile?.level || 1}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Experience</CardTitle>
              <CardDescription className="text-gray-400">Progress to next level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{profile?.xp || 0} / {(profile?.level || 1) * 100} XP</div>
              <Progress value={levelProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Alpha Coins</CardTitle>
              <CardDescription className="text-gray-400">In-game currency</CardDescription>
            </CardHeader>
            <CardContent>
              <AlphaCoinBalance balance={profile?.alpha_coins || 0} className="bg-transparent p-0" />
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Recent Trades</h2>
          <p className="text-gray-300">Track your recent trading activity here.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
