
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Award, Coins, BarChart3, LogOut, Plus, Percent } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Trade = Tables<'trades'>;
type Profile = Tables<'profiles'>;

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch user trades
      const { data: tradesData, error: tradesError } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (tradesError) throw tradesError;
      setTrades(tradesData || []);

    } catch (error: any) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
    } finally {
      setStatsLoading(false);
    }
  };

  // Calculate performance stats
  const calculateStats = () => {
    const closedTrades = trades.filter(trade => !trade.is_open && trade.profit_loss !== null);
    const totalTrades = trades.length;
    const totalPnL = closedTrades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0);
    const winningTrades = closedTrades.filter(trade => (trade.profit_loss || 0) > 0);
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;

    return {
      totalPnL,
      winRate,
      totalTrades
    };
  };

  const stats = calculateStats();

  if (loading || statsLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-lg text-white">Loading dashboard...</div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-lg font-bold text-white">TT</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">The Traders Track</h1>
              <p className="text-gray-400 text-sm">Welcome back, {profile?.username || user.email}</p>
            </div>
          </div>
          <Button 
            onClick={handleSignOut}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Performance Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total P/L</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${stats.totalPnL.toFixed(2)}
              </div>
              <p className="text-xs text-gray-400">From closed trades</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Win Rate</CardTitle>
              <Percent className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.winRate.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-400">Winning trades percentage</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Trades</CardTitle>
              <BarChart3 className="w-4 h-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalTrades}</div>
              <p className="text-xs text-gray-400">Trades logged</p>
            </CardContent>
          </Card>
        </div>

        {/* User Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Level</CardTitle>
              <Award className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{profile?.level || 1}</div>
              <p className="text-xs text-gray-400">Trader Level</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">XP</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{profile?.xp || 0}</div>
              <p className="text-xs text-gray-400">Experience Points</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Alpha Coins</CardTitle>
              <Coins className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{profile?.alpha_coins || 0}</div>
              <p className="text-xs text-gray-400">Reward Currency</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Trades */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Trades</CardTitle>
              <CardDescription className="text-gray-400">
                Your latest trading activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trades.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No trades recorded yet</p>
                  <p className="text-sm">Start logging your trades to see them here!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trades.slice(0, 5).map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          trade.trade_type === 'buy' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                          {trade.trade_type.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{trade.symbol}</p>
                          <p className="text-sm text-gray-400">
                            {trade.quantity} @ ${trade.entry_price}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded text-xs ${
                          trade.is_open ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
                        }`}>
                          {trade.is_open ? 'Open' : 'Closed'}
                        </div>
                        {!trade.is_open && trade.profit_loss !== null && (
                          <p className={`text-sm mt-1 ${trade.profit_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${trade.profit_loss.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription className="text-gray-400">
                Common actions to get you started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Log New Trade
              </Button>
              <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
              <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 justify-start">
                <Award className="w-4 h-4 mr-2" />
                View Achievements
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
