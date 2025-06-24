
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Star, TrendingUp } from 'lucide-react';

interface GuildMember {
  id: string;
  guild_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles: {
    id: string;
    username: string | null;
    level: number;
    xp: number;
    alpha_coins: number;
  } | null;
}

interface GuildMembersListProps {
  members: GuildMember[];
}

const GuildMembersList = ({ members }: GuildMembersListProps) => {
  // Calculate T-Track Score (simple formula: level * 10 + xp/100)
  const membersWithScore = useMemo(() => {
    return members
      .map(member => ({
        ...member,
        tTrackScore: member.profiles ? 
          (member.profiles.level * 10 + Math.floor(member.profiles.xp / 100)) : 0
      }))
      .sort((a, b) => b.tTrackScore - a.tTrackScore);
  }, [members]);

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <CardTitle className="text-white">Member Leaderboard (T-Track Score)</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {membersWithScore.map((member, index) => (
            <div key={member.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500 text-black' :
                  index === 1 ? 'bg-gray-400 text-black' :
                  index === 2 ? 'bg-orange-500 text-black' :
                  'bg-gray-600 text-white'
                }`}>
                  {index + 1}
                </div>
                
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {member.profiles?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="text-white font-semibold">
                      {member.profiles?.username || `User ${member.user_id.slice(0, 8)}`}
                    </p>
                    {member.role === 'owner' && (
                      <Star className="w-4 h-4 text-yellow-500" />
                    )}
                    <Badge 
                      variant={member.role === 'owner' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {member.role}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>Level {member.profiles?.level || 1}</span>
                    <span>{member.profiles?.xp || 0} XP</span>
                    <span>{member.profiles?.alpha_coins || 0} AC</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <p className="text-white font-bold text-lg">
                    {member.tTrackScore}
                  </p>
                </div>
                <p className="text-gray-400 text-xs">T-Track Score</p>
              </div>
            </div>
          ))}
          
          {members.length === 0 && (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No members found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GuildMembersList;
