import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, TrendingUp, Trophy, MessageSquare } from 'lucide-react';
import GuildEquityCurve from '@/components/GuildEquityCurve';
import GuildMembersList from '@/components/GuildMembersList';
import GuildChat from '@/components/GuildChat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GuildDashboardProps {
  guildId: string;
  onBack: () => void;
}

interface GuildMetrics {
  member_count: number;
  total_trades: number;
  winning_trades: number;
  win_rate: number;
  total_profit: number;
  total_loss: number;
  combined_pnl: number;
  combined_profit_factor: number;
}

const GuildDashboard = ({ guildId, onBack }: GuildDashboardProps) => {
  const { user } = useAuth();

  // Fetch guild details
  const { data: guild, isLoading: guildLoading } = useQuery({
    queryKey: ['guild', guildId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guilds')
        .select('*')
        .eq('id', guildId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch guild members with profiles
  const { data: members } = useQuery({
    queryKey: ['guildMembers', guildId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guild_members')
        .select(`
          *,
          profiles (
            id,
            username,
            level,
            xp,
            alpha_coins
          )
        `)
        .eq('guild_id', guildId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Fetch guild combined metrics
  const { data: guildMetrics } = useQuery({
    queryKey: ['guildMetrics', guildId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('calculate_guild_metrics', {
        guild_id_param: guildId
      });

      if (error) throw error;
      
      // Safely parse the Json response to GuildMetrics
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        return data as unknown as GuildMetrics;
      }
      
      // Return default metrics if data is invalid
      return {
        member_count: 0,
        total_trades: 0,
        winning_trades: 0,
        win_rate: 0,
        total_profit: 0,
        total_loss: 0,
        combined_pnl: 0,
        combined_profit_factor: 0
      } as GuildMetrics;
    },
  });

  // Fetch guild trades for equity curve
  const { data: guildTrades } = useQuery({
    queryKey: ['guildTrades', guildId],
    queryFn: async () => {
      if (!members) return [];
      
      const memberIds = members.map(m => m.user_id);
      
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .in('user_id', memberIds)
        .eq('is_open', false)
        .not('profit_loss', 'is', null)
        .not('exit_date', 'is', null)
        .order('exit_date', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!members,
  });

  if (guildLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] p-6">
        <div className="text-white">Loading guild...</div>
      </div>
    );
  }

  if (!guild) {
    return (
      <div className="min-h-screen bg-[#0B0F19] p-6">
        <div className="text-white">Guild not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">{guild.name}</h1>
              <p className="text-gray-400">{guild.description}</p>
            </div>
          </div>
        </div>

        {/* Guild Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {members?.length || 0}
                  </p>
                  <p className="text-gray-400 text-sm">Members</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {guildMetrics?.total_trades || 0}
                  </p>
                  <p className="text-gray-400 text-sm">Total Trades</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {guildMetrics?.win_rate || 0}%
                  </p>
                  <p className="text-gray-400 text-sm">Win Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {guildMetrics?.combined_profit_factor?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-gray-400 text-sm">Profit Factor</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts and Members */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guild Equity Curve */}
            <GuildEquityCurve trades={guildTrades || []} />

            {/* Members Leaderboard */}
            <GuildMembersList members={members || []} />
          </div>

          {/* Right Column - Chat */}
          <div className="lg:col-span-1">
            <GuildChat guildId={guildId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuildDashboard;
