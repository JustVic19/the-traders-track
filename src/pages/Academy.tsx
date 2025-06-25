
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import { BookOpen, TrendingUp, BarChart3, Play } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import StrategyLesson from '@/components/StrategyLesson';

type Profile = Tables<'profiles'>;

interface TradingStrategy {
  id: string;
  name: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  tags: string[];
}

const tradingStrategies: TradingStrategy[] = [
  {
    id: 'golden-cross',
    name: 'Golden Cross',
    category: 'Moving Averages',
    difficulty: 'Beginner',
    description: 'A bullish signal when a short-term moving average crosses above a long-term moving average.',
    tags: ['Moving Averages', 'Bullish', 'Trend Following']
  },
  {
    id: 'supply-demand',
    name: 'Supply & Demand',
    category: 'Price Action',
    difficulty: 'Intermediate',
    description: 'Trading based on identifying zones where supply and demand imbalances occur.',
    tags: ['Price Action', 'Support/Resistance', 'Zone Trading']
  },
  {
    id: 'rsi-divergence',
    name: 'RSI Divergence',
    category: 'Oscillators',
    difficulty: 'Intermediate',
    description: 'Identifying potential reversals when price and RSI momentum diverge.',
    tags: ['RSI', 'Divergence', 'Reversal']
  },
  {
    id: 'breakout-trading',
    name: 'Breakout Trading',
    category: 'Price Action',
    difficulty: 'Beginner',
    description: 'Trading when price breaks through key support or resistance levels with volume.',
    tags: ['Breakout', 'Volume', 'Momentum']
  },
  {
    id: 'fibonacci-retracement',
    name: 'Fibonacci Retracements',
    category: 'Technical Analysis',
    difficulty: 'Intermediate',
    description: 'Using Fibonacci levels to identify potential support and resistance areas.',
    tags: ['Fibonacci', 'Retracement', 'Support/Resistance']
  },
  {
    id: 'bollinger-squeeze',
    name: 'Bollinger Band Squeeze',
    category: 'Volatility',
    difficulty: 'Advanced',
    description: 'Trading periods of low volatility that precede explosive price movements.',
    tags: ['Bollinger Bands', 'Volatility', 'Squeeze']
  }
];

const Academy = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<TradingStrategy | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  React.useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    }
  };

  const categories = ['All', ...Array.from(new Set(tradingStrategies.map(s => s.category)))];
  const filteredStrategies = selectedCategory === 'All' 
    ? tradingStrategies 
    : tradingStrategies.filter(s => s.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (selectedStrategy) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full" style={{ backgroundColor: '#0B0F19' }}>
          <AppSidebar profile={profile} />
          <SidebarInset className="flex-1 w-full" style={{ backgroundColor: '#0B0F19' }}>
            <StrategyLesson 
              strategy={selectedStrategy} 
              onBack={() => setSelectedStrategy(null)} 
            />
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full" style={{ backgroundColor: '#0B0F19' }}>
        <AppSidebar profile={profile} />
        <SidebarInset className="flex-1 w-full" style={{ backgroundColor: '#0B0F19' }}>
          {/* Header */}
          <header className="border-b border-gray-700 px-6 py-4 w-full" style={{ backgroundColor: '#1A1F2E' }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <BookOpen className="w-6 h-6 mr-3" />
                  Trading Academy
                </h1>
                <p className="text-gray-400">Master proven trading strategies with AI-powered lessons</p>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="w-full px-6 py-8 flex-1" style={{ backgroundColor: '#0B0F19' }}>
            {/* Category Filter */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className={`${
                      selectedCategory === category 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Strategy Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStrategies.map((strategy) => (
                <Card key={strategy.id} className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg mb-2">{strategy.name}</CardTitle>
                        <Badge className={`${getDifficultyColor(strategy.difficulty)} text-xs`}>
                          {strategy.difficulty}
                        </Badge>
                      </div>
                      <div className="text-gray-400">
                        {strategy.category === 'Moving Averages' && <TrendingUp className="w-5 h-5" />}
                        {strategy.category === 'Price Action' && <BarChart3 className="w-5 h-5" />}
                        {strategy.category === 'Oscillators' && <BarChart3 className="w-5 h-5" />}
                        {strategy.category === 'Technical Analysis' && <BarChart3 className="w-5 h-5" />}
                        {strategy.category === 'Volatility' && <TrendingUp className="w-5 h-5" />}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-400 text-sm leading-relaxed">{strategy.description}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      {strategy.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button
                      onClick={() => setSelectedStrategy(strategy)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Learn Strategy
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Academy;
