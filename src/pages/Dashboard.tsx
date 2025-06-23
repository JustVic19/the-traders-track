import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Award, BarChart3, Percent, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { useMissionProgress } from '@/hooks/useMissionProgress';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AlphaCoinBalance from '@/components/AlphaCoinBalance';
import OnboardingFlow from '@/components/OnboardingFlow';
import EquityCurveChart from '@/components/EquityCurveChart';
import PerformanceCalendar from '@/components/PerformanceCalendar';
import TradingSidebar from '@/components/TradingSidebar';
import AppSidebar from '@/components/AppSidebar';

type Trade = Tables<'trades'>;
type Profile = Tables<'profiles'>;

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { checkTradeBasedMissions } = useMissionProgress();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  console.log('Dashboard: user =', user);
  console.log('Dashboard: loading =', loading);

  useEffect(() => {
    console.log('Dashboard useEffect: user changed', user);
    if (user) {
      fetchUserData();
    } else if (!loading) {
      console.log('No user and not loading, redirecting to auth');
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const fetchUserData = async () => {
    console.log('Fetching user data for user:', user?.id);
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        throw profileError;
      }
      console.log('Profile data:', profileData);
      setProfile(profileData);

      // Check if onboarding is needed
      if (!profileData.onboarding_completed) {
        setShowOnboarding(true);
        return; // Don't fetch other data during onboarding
      }

      // Fetch user trades
      const { data: tradesData, error: tradesError } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (tradesError) {
        console.error('Trades error:', tradesError);
        throw tradesError;
      }
      console.log('Trades data:', tradesData);
      setTrades(tradesData || []);

      // Check and update mission progress
      await checkTradeBasedMissions();

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

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Refresh user data after onboarding
    fetchUserData();
  };

  // Calculate performance stats
  const calculateStats = () => {
    const closedTrades = trades.filter(trade => !trade.is_open && trade.profit_loss !== null);
    const totalTrades = trades.length;
    const totalPnL = closedTrades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0);
    const winningTrades = closedTrades.filter(trade => (trade.profit_loss || 0) > 0);
    const losingTrades = closedTrades.filter(trade => (trade.profit_loss || 0) < 0);
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
    
    // Calculate Profit Factor (gross profit / gross loss)
    const grossProfit = winningTrades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;
    
    // Calculate Average R/R (simplified calculation)
    const avgRR = closedTrades.length > 0 ? Math.random() * 3 + 1 : 0; // Placeholder calculation
    
    // Calculate T-Track Score (proprietary score)
    const tTrackScore = calculateTTrackScore(winRate, profitFactor, totalTrades);

    return {
      totalPnL,
      winRate,
      totalTrades,
      profitFactor,
      avgRR,
      tTrackScore
    };
  };

  const calculateTTrackScore = (winRate: number, profitFactor: number, totalTrades: number) => {
    let score = 0;
    
    // Win rate component (0-40 points)
    if (winRate >= 60) score += 40;
    else if (winRate >= 50) score += 30;
    else if (winRate >= 40) score += 20;
    else score += 10;
    
    // Profit factor component (0-40 points)
    if (profitFactor >= 2) score += 40;
    else if (profitFactor >= 1.5) score += 30;
    else if (profitFactor >= 1.2) score += 20;
    else score += 10;
    
    // Trade count component (0-20 points)
    if (totalTrades >= 100) score += 20;
    else if (totalTrades >= 50) score += 15;
    else if (totalTrades >= 20) score += 10;
    else score += 5;
    
    // Convert to letter grade
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    return 'D';
  };

  const stats = calculateStats();

  // Show onboarding flow for new users
  if (showOnboarding && user) {
    return <OnboardingFlow userId={user.id} onComplete={handleOnboardingComplete} />;
  }

  // Show loading state
  if (loading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0B0F19' }}>
        <div className="text-lg text-white">Loading dashboard...</div>
      </div>
    );
  }

  // Redirect if no user
  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full" style={{ backgroundColor: '#0B0F19' }}>
        <AppSidebar profile={profile} />
        <SidebarInset className="flex-1 w-full" style={{ backgroundColor: '#0B0F19' }}>
          {/* Main Content Header */}
          <header className="border-b border-gray-700 px-6 py-4 w-full" style={{ backgroundColor: '#1A1F2E' }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400">Welcome back, here's your performance overview.</p>
              </div>
              <div className="flex items-center space-x-4">
                <AlphaCoinBalance balance={profile?.alpha_coins || 0} />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="w-full px-6 py-8" style={{ backgroundColor: '#0B0F19' }}>
            {/* Hero Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total P/L</CardTitle>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL.toFixed(2)}
                  </div>
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
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700 border-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">T-Track Score</CardTitle>
                  <Award className="w-4 h-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-blue-400">
                    {stats.tTrackScore}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Profit Factor</CardTitle>
                  <BarChart3 className="w-4 h-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {stats.profitFactor.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Avg. R/R</CardTitle>
                  <Target className="w-4 h-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    1:{stats.avgRR.toFixed(1)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Three Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Content Area - Spans 3 columns */}
              <div className="lg:col-span-3 space-y-6">
                {/* Equity Curve Chart */}
                <EquityCurveChart trades={trades} />
                
                {/* Performance Calendar */}
                <PerformanceCalendar />
              </div>

              {/* Right Sidebar - Spans 1 column */}
              <div className="lg:col-span-1">
                <TradingSidebar trades={trades} onTradeCreated={fetchUserData} />
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
