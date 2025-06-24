
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, Trophy } from 'lucide-react';

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

interface GuildStatsCardsProps {
  memberCount: number;
  guildMetrics: GuildMetrics | undefined;
}

const GuildStatsCards = ({ memberCount, guildMetrics }: GuildStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-white">
                {memberCount || 0}
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
  );
};

export default GuildStatsCards;
