
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, BookOpen, BarChart3, TrendingUp, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import BacktestingInterface from '@/components/BacktestingInterface';

interface TradingStrategy {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  description: string;
  tags: string[];
}

interface StrategyLessonProps {
  strategy: TradingStrategy;
  onBack: () => void;
}

const StrategyLesson: React.FC<StrategyLessonProps> = ({ strategy, onBack }) => {
  const [lessonContent, setLessonContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lesson');
  const { toast } = useToast();

  useEffect(() => {
    generateLessonContent();
  }, [strategy]);

  const generateLessonContent = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('generate-strategy-lesson', {
        body: { 
          strategyName: strategy.name,
          strategyDescription: strategy.description,
          difficulty: strategy.difficulty,
          tags: strategy.tags
        }
      });
      
      if (error) {
        console.error('Error generating lesson:', error);
        toast({
          title: "Error",
          description: "Failed to generate lesson content. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      setLessonContent(data.lesson);
      
    } catch (error: any) {
      console.error('Error in generateLessonContent:', error);
      toast({
        title: "Error",
        description: "Failed to generate lesson content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0F19' }}>
      {/* Header */}
      <header className="border-b border-gray-700 px-6 py-4 w-full" style={{ backgroundColor: '#1A1F2E' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Academy
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">{strategy.name}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={`${getDifficultyColor(strategy.difficulty)} text-xs`}>
                  {strategy.difficulty}
                </Badge>
                <span className="text-gray-400 text-sm">{strategy.category}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
            <TabsTrigger 
              value="lesson" 
              className="text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Learn Strategy
            </TabsTrigger>
            <TabsTrigger 
              value="backtest" 
              className="text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Backtest Strategy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lesson" className="mt-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Strategy Lesson
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="ml-2 text-gray-400">Generating personalized lesson...</span>
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none">
                    <div 
                      className="text-gray-300 leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: lessonContent.replace(/\n/g, '<br/>') }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backtest" className="mt-6">
            <BacktestingInterface strategy={strategy} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StrategyLesson;
