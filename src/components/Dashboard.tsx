
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, User, LogOut, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type Trade = Tables<'trades'>;

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchTrades();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile for user:', user?.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      console.log('Profile fetch result:', { data, error });
      
      if (error) {
        console.error('Profile fetch error:', error);
        throw error;
      }
      
      // If no profile exists, create one
      if (!data && user?.id) {
        console.log('No profile found, creating one...');
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: user.email,
            level: 1,
            xp: 0,
            alpha_coins: 100,
            skill_points: 0,
            onboarding_completed: false
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Profile creation error:', createError);
          throw createError;
        }
        
        console.log('Created new profile:', newProfile);
        setProfile(newProfile);
      } else {
        setProfile(data);
      }
    } catch (error: any) {
      console.error('Error in fetchProfile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    }
  };

  const fetchTrades = async () => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrades(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load trades",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading your trading dashboard...</div>
      </div>
    );
  }

  const openTrades = trades.filter(trade => trade.is_open);
  const closedTrades = trades.filter(trade => !trade.is_open);
  const totalPnL = closedTrades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              The Traders Track
            </h1>
            <p className="text-gray-600">Welcome back, {profile?.username || user?.email}</p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Level</CardTitle>
              <User className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.level || 1}</div>
              <p className="text-xs text-muted-foreground">
                {profile?.xp || 0}/1000 XP
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alpha Coins</CardTitle>
              <Coins className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.alpha_coins || 0}</div>
              <p className="text-xs text-muted-foreground">
                Earn more by trading
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trades.length}</div>
              <p className="text-xs text-muted-foreground">
                {openTrades.length} open, {closedTrades.length} closed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${totalPnL.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                From closed trades
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Trades */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Trades</CardTitle>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Trade
            </Button>
          </CardHeader>
          <CardContent>
            {trades.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No trades yet. Start your trading journey!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {trades.slice(0, 5).map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge variant={trade.trade_type === 'buy' ? 'default' : 'secondary'}>
                        {trade.trade_type.toUpperCase()}
                      </Badge>
                      <div>
                        <p className="font-medium">{trade.symbol}</p>
                        <p className="text-sm text-gray-500">
                          {trade.quantity} @ ${trade.entry_price}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={trade.is_open ? 'outline' : 'default'}>
                        {trade.is_open ? 'Open' : 'Closed'}
                      </Badge>
                      {!trade.is_open && trade.profit_loss && (
                        <p className={`text-sm ${trade.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
      </div>
    </div>
  );
};

export default Dashboard;
