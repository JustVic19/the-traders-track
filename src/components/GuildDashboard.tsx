
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import GuildEquityCurve from '@/components/GuildEquityCurve';
import GuildMembersList from '@/components/GuildMembersList';
import GuildChat from '@/components/GuildChat';
import GuildHeader from '@/components/GuildHeader';
import GuildStatsCards from '@/components/GuildStatsCards';

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
        <GuildHeader 
          guildName={guild.name}
          guildDescription={guild.description}
          onBack={onBack}
        />

        {/* Guild Stats */}
        <GuildStatsCards 
          memberCount={members?.length || 0}
          guildMetrics={guildMetrics}
        />

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
