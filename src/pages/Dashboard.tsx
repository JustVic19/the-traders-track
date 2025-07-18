import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Award, BarChart3, Percent, Target, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { useMissionProgress } from '@/hooks/useMissionProgress';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useEntitlements } from '@/hooks/useEntitlements';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AlphaCoinBalance from '@/components/AlphaCoinBalance';
import OnboardingFlow from '@/components/OnboardingFlow';
import EquityCurveChart from '@/components/EquityCurveChart';
import PerformanceCalendar from '@/components/PerformanceCalendar';
import TradingSidebar from '@/components/TradingSidebar';
import AppSidebar from '@/components/AppSidebar';
import PremiumDashboardFeatures from '@/components/PremiumDashboardFeatures';
import RiskSimulator from '@/components/RiskSimulator';

type Profile = Tables<'profiles'>;

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { checkTradeBasedMissions } = useMissionProgress();
  const { trades, metrics, dailyTradeData, loading: metricsLoading, refetch } = useDashboardMetrics();
  const { hasAdvancedDashboard, hasRiskSimulator, loading: entitlementsLoading } = useEntitlements();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  console.log('Dashboard: user =', user);
  console.log('Dashboard: loading =', loading);
  console.log('Dashboard: metrics =', metrics);
  console.log('Dashboard: hasAdvancedDashboard =', hasAdvancedDashboard);
  console.log('Dashboard: hasRiskSimulator =', hasRiskSimulator);

  useEffect(() => {
    console.log('Dashboard useEffect: user changed', user);
    if (user) {
      fetchProfile();
    } else if (!loading) {
      console.log('No user and not loading, redirecting to auth');
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const fetchProfile = async () => {
    console.log('Fetching profile for user:', user?.id);
    try {
      setProfileLoading(true);
      
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
        return;
      }

      // Check and update mission progress
      await checkTradeBasedMissions();

    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    fetchProfile();
  };

  const handleTradeCreated = () => {
    // Refetch metrics to update T-Track Score and all other metrics
    refetch();
    checkTradeBasedMissions();
  };

  const handleDateSelect = (date: string | null) => {
    setSelectedDate(date);
  };

  // Show onboarding flow for new users
  if (showOnboarding && user) {
    return <OnboardingFlow userId={user.id} onComplete={handleOnboardingComplete} />;
  }

  // Show loading state
  if (loading || profileLoading || metricsLoading || entitlementsLoading) {
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
                <h1 className="text-2xl font-bold text-white flex items-center">
                  Dashboard
                  {hasAdvancedDashboard && (
                    <Crown className="w-6 h-6 ml-2 text-yellow-400" />
                  )}
                </h1>
                <p className="text-gray-400">
                  {hasAdvancedDashboard 
                    ? "Welcome to your Advanced Analytics Dashboard" 
                    : "Welcome back, here's your performance overview."
                  }
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <AlphaCoinBalance balance={profile?.alpha_coins || 0} />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="w-full px-6 py-8 flex-1" style={{ backgroundColor: '#0B0F19' }}>
            <div className="h-full space-y-8">
              {/* Hero Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">Total P/L</CardTitle>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${metrics.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {metrics.totalPnL >= 0 ? '+' : ''}${metrics.totalPnL.toFixed(2)}
                    </div>
                    <p className="text-xs text-gray-500">
                      {metrics.closedTrades} closed trades
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">Win Rate</CardTitle>
                    <Percent className="w-4 h-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {metrics.winRate.toFixed(1)}%
                    </div>
                    <p className="text-xs text-gray-500">
                      {metrics.winningTrades}W / {metrics.losingTrades}L
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700 border-blue-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">T-Track Score</CardTitle>
                    <Award className="w-4 h-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-blue-400">
                      {metrics.tTrackScore}
                    </div>
                    <p className="text-xs text-gray-500">
                      Performance grade
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">Profit Factor</CardTitle>
                    <BarChart3 className="w-4 h-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {metrics.profitFactor === 999 ? '∞' : metrics.profitFactor.toFixed(2)}
                    </div>
                    <p className="text-xs text-gray-500">
                      ${metrics.grossProfit.toFixed(0)} / ${metrics.grossLoss.toFixed(0)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">Avg. R/R</CardTitle>
                    <Target className="w-4 h-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      1:{metrics.avgRR === 999 ? '∞' : metrics.avgRR.toFixed(1)}
                    </div>
                    <p className="text-xs text-gray-500">
                      Risk to reward ratio
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Premium Features Section - Only show if user has advanced dashboard */}
              {hasAdvancedDashboard && (
                <div>
                  <PremiumDashboardFeatures trades={trades} metrics={metrics} />
                </div>
              )}

              {/* Risk Simulator - Only show if user has the entitlement */}
              {hasRiskSimulator && (
                <div>
                  <RiskSimulator />
                </div>
              )}

              {/* Three Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
                {/* Main Content Area - Spans 3 columns */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Equity Curve Chart with real data */}
                  <EquityCurveChart trades={trades} />
                  
                  {/* Performance Calendar with real daily trade data and date selection */}
                  <PerformanceCalendar 
                    dailyData={dailyTradeData} 
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                  />
                </div>

                {/* Right Sidebar - Spans 1 column */}
                <div className="lg:col-span-1">
                  <TradingSidebar 
                    trades={trades} 
                    selectedDate={selectedDate}
                    onTradeCreated={handleTradeCreated} 
                    onClearDate={() => setSelectedDate(null)}
                  />
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
