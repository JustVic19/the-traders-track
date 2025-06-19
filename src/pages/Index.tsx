
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Award, Coins, BarChart3 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (user) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          The Traders Track
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Level up your trading game with our gamified journal. Track trades, earn XP, and unlock your trading potential.
        </p>
        <Link to="/auth">
          <Button size="lg" className="text-lg px-8 py-3">
            Start Your Trading Journey
          </Button>
        </Link>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>Trade Journal</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track every trade with detailed entry and exit points, profit/loss calculations.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Award className="w-12 h-12 mx-auto text-purple-600 mb-4" />
              <CardTitle>Level System</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Gain XP and level up as you improve your trading skills and consistency.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Coins className="w-12 h-12 mx-auto text-yellow-600 mb-4" />
              <CardTitle>Alpha Coins</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Earn Alpha Coins for successful trades and unlock premium features.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Analyze your performance with detailed statistics and insights.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
