
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, Plus, Settings } from 'lucide-react';
import CreateGuildModal from '@/components/CreateGuildModal';
import JoinGuildModal from '@/components/JoinGuildModal';
import GuildDashboard from '@/components/GuildDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Guilds = () => {
  const { user } = useAuth();
  const [selectedGuildId, setSelectedGuildId] = useState<string | null>(null);

  // Fetch user's guilds
  const { data: userGuilds, isLoading: guildsLoading, refetch: refetchGuilds } = useQuery({
    queryKey: ['userGuilds', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('guild_members')
        .select(`
          guild_id,
          role,
          joined_at,
          guilds (
            id,
            name,
            description,
            created_by,
            max_members,
            is_private,
            created_at
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch current tournament data
  const { data: currentTournament } = useQuery({
    queryKey: ['currentTournament'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guild_tournaments')
        .select('*')
        .eq('status', 'active')
        .order('week_start', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  // Fetch tournament results for leaderboard
  const { data: tournamentResults } = useQuery({
    queryKey: ['tournamentResults', currentTournament?.id],
    queryFn: async () => {
      if (!currentTournament?.id) return [];
      
      const { data, error } = await supabase
        .from('guild_tournament_results')
        .select(`
          *,
          guilds (
            name
          )
        `)
        .eq('tournament_id', currentTournament.id)
        .order('rank', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!currentTournament?.id,
  });

  if (guildsLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] p-6">
        <div className="text-white">Loading guilds...</div>
      </div>
    );
  }

  if (selectedGuildId) {
    return (
      <GuildDashboard 
        guildId={selectedGuildId} 
        onBack={() => setSelectedGuildId(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Trading Guilds</h1>
            <p className="text-gray-400">Join or create a guild to compete with other traders</p>
          </div>
          <div className="flex space-x-3">
            <JoinGuildModal onSuccess={refetchGuilds} />
            <CreateGuildModal onSuccess={refetchGuilds} />
          </div>
        </div>

        <Tabs defaultValue="my-guilds" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="my-guilds" className="data-[state=active]:bg-blue-600">
              My Guilds
            </TabsTrigger>
            <TabsTrigger value="tournament" className="data-[state=active]:bg-blue-600">
              Weekly Tournament
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-guilds" className="space-y-4">
            {userGuilds && userGuilds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userGuilds.map((membership) => (
                  <Card key={membership.guild_id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-lg">
                          {membership.guilds?.name}
                        </CardTitle>
                        <Badge variant={membership.role === 'owner' ? 'default' : 'secondary'}>
                          {membership.role}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {membership.guilds?.description || 'No description'}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-400 text-sm">
                          <Users className="w-4 h-4" />
                          <span>Max {membership.guilds?.max_members} members</span>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => setSelectedGuildId(membership.guild_id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          View Dashboard
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Guilds Yet</h3>
                  <p className="text-gray-400 mb-6">Join an existing guild or create your own to start competing!</p>
                  <div className="flex justify-center space-x-3">
                    <JoinGuildModal onSuccess={refetchGuilds} />
                    <CreateGuildModal onSuccess={refetchGuilds} />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tournament" className="space-y-4">
            {currentTournament ? (
              <div className="space-y-4">
                {/* Tournament Info */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <CardTitle className="text-white">Weekly Guild Tournament</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Week:</span>
                        <p className="text-white font-semibold">
                          {new Date(currentTournament.week_start).toLocaleDateString()} - {new Date(currentTournament.week_end).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Prize:</span>
                        <p className="text-yellow-500 font-semibold">1000 Alpha Coins per member</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tournament Leaderboard */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Guild Rankings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tournamentResults && tournamentResults.length > 0 ? (
                      <div className="space-y-3">
                        {tournamentResults.map((result, index) => (
                          <div key={result.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                result.rank === 1 ? 'bg-yellow-500 text-black' :
                                result.rank === 2 ? 'bg-gray-400 text-black' :
                                result.rank === 3 ? 'bg-orange-500 text-black' :
                                'bg-gray-600 text-white'
                              }`}>
                                {result.rank}
                              </div>
                              <div>
                                <p className="text-white font-semibold">{result.guilds?.name}</p>
                                <p className="text-gray-400 text-sm">{result.members_count} members</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-semibold">
                                {result.combined_profit_factor.toFixed(2)}x
                              </p>
                              <p className="text-gray-400 text-sm">
                                {result.total_trades} trades
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">No tournament results yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="py-12 text-center">
                  <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Active Tournament</h3>
                  <p className="text-gray-400">Check back later for the next weekly tournament!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Guilds;
