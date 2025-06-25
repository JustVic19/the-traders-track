
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Award, Coins, BarChart3, ArrowRight, Play, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  if (user) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">The Traders Track</div>
            <div className="flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
              <Link to="/auth">
                <Button variant="outline" className="border-gray-600 text-white hover:bg-white hover:text-black">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full border border-gray-700 text-sm text-gray-300 mb-8">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Now Available
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
            Level Up Your
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Trading Game
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Transform your trading journey with our gamified journal. Track trades, earn XP, 
            unlock achievements, and master the markets like never before.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200 px-8 py-4 text-lg font-semibold">
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-gray-600 text-white hover:bg-gray-800 px-8 py-4 text-lg">
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 -z-10"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to
              <br />
              <span className="text-gray-400">Master Trading</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Our comprehensive platform combines journaling, analytics, and gamification 
              to accelerate your trading education.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-gray-900/50 border-gray-800 p-8 hover:bg-gray-900/70 transition-all duration-300">
              <CardContent className="p-0">
                <div className="mb-6">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Smart Journal</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Track every trade with detailed analytics, P&L calculations, and performance insights.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 p-8 hover:bg-gray-900/70 transition-all duration-300">
              <CardContent className="p-0">
                <div className="mb-6">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Award className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Level System</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Gain XP, unlock achievements, and level up as you improve your trading skills.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 p-8 hover:bg-gray-900/70 transition-all duration-300">
              <CardContent className="p-0">
                <div className="mb-6">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Coins className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Alpha Coins</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Earn rewards for successful trades and unlock premium features and content.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 p-8 hover:bg-gray-900/70 transition-all duration-300">
              <CardContent className="p-0">
                <div className="mb-6">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Advanced Analytics</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Deep insights into your performance with detailed statistics and trend analysis.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gray-900/30">
        <div className="max-w-7xl mx-auto text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-gray-400">Active Traders</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1M+</div>
              <div className="text-gray-400">Trades Logged</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-gray-400">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-gray-400">Market Coverage</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                Why Choose
                <br />
                <span className="text-gray-400">The Traders Track?</span>
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Gamified Learning</h3>
                    <p className="text-gray-400">Transform tedious journaling into an engaging experience with levels, achievements, and rewards.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">AI-Powered Insights</h3>
                    <p className="text-gray-400">Get personalized feedback and identify patterns in your trading with advanced AI analysis.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Community & Guilds</h3>
                    <p className="text-gray-400">Join trading guilds, share strategies, and learn from successful traders worldwide.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-8 border border-gray-800">
                <div className="text-center">
                  <div className="text-6xl font-bold mb-4">95%</div>
                  <div className="text-xl text-gray-300 mb-2">of users improve</div>
                  <div className="text-gray-400">their trading performance within 30 days</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Level Up?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of traders who are already improving their performance with our platform.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-white text-black hover:bg-gray-200 px-8 py-4 text-lg font-semibold">
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold mb-4">The Traders Track</div>
            <p className="text-gray-400 mb-6">Level up your trading game.</p>
            <div className="text-sm text-gray-500">
              © 2024 The Traders Track. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
