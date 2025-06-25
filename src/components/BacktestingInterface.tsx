
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, TrendingDown, Play, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TradingStrategy {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  description: string;
  tags: string[];
}

interface BacktestResult {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalReturn: number;
  maxDrawdown: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
}

interface BacktestingInterfaceProps {
  strategy: TradingStrategy;
}

const BacktestingInterface: React.FC<BacktestingInterfaceProps> = ({ strategy }) => {
  const [timeframe, setTimeframe] = useState('1y');
  const [symbol, setSymbol] = useState('SPY');
  const [initialCapital, setInitialCapital] = useState('10000');
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const runBacktest = async () => {
    setLoading(true);
    
    // Simulate backtesting with realistic results based on strategy
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate simulated results based on strategy characteristics
    const generateResults = (): BacktestResult => {
      const baseWinRate = strategy.difficulty === 'Beginner' ? 0.65 : 
                         strategy.difficulty === 'Intermediate' ? 0.58 : 0.52;
      
      const totalTrades = Math.floor(Math.random() * 100) + 50;
      const winningTrades = Math.floor(totalTrades * (baseWinRate + (Math.random() - 0.5) * 0.1));
      const losingTrades = totalTrades - winningTrades;
      const winRate = (winningTrades / totalTrades) * 100;
      
      const averageWin = 150 + Math.random() * 200;
      const averageLoss = 80 + Math.random() * 120;
      const totalReturn = (winningTrades * averageWin - losingTrades * averageLoss) / parseInt(initialCapital) * 100;
      const maxDrawdown = Math.random() * 25 + 5;
      const profitFactor = (winningTrades * averageWin) / (losingTrades * averageLoss);
      
      return {
        totalTrades,
        winningTrades,
        losingTrades,
        winRate: Math.round(winRate * 100) / 100,
        totalReturn: Math.round(totalReturn * 100) / 100,
        maxDrawdown: Math.round(maxDrawdown * 100) / 100,
        profitFactor: Math.round(profitFactor * 100) / 100,
        averageWin: Math.round(averageWin * 100) / 100,
        averageLoss: Math.round(averageLoss * 100) / 100
      };
    };
    
    const results = generateResults();
    setBacktestResult(results);
    setLoading(false);
    
    toast({
      title: "Backtest Complete",
      description: `Analyzed ${results.totalTrades} trades over the selected period.`,
    });
  };

  const getReturnColor = (value: number) => {
    return value >= 0 ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Backtest Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-gray-300">Symbol</Label>
              <Select value={symbol} onValueChange={setSymbol}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="SPY">SPY (S&P 500)</SelectItem>
                  <SelectItem value="QQQ">QQQ (NASDAQ)</SelectItem>
                  <SelectItem value="AAPL">AAPL</SelectItem>
                  <SelectItem value="TSLA">TSLA</SelectItem>
                  <SelectItem value="MSFT">MSFT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-gray-300">Time Period</Label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="3m">3 Months</SelectItem>
                  <SelectItem value="6m">6 Months</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                  <SelectItem value="2y">2 Years</SelectItem>
                  <SelectItem value="5y">5 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-gray-300">Initial Capital ($)</Label>
              <Input
                value={initialCapital}
                onChange={(e) => setInitialCapital(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="10000"
              />
            </div>
          </div>
          
          <Button 
            onClick={runBacktest} 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Backtest...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Backtest
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Panel */}
      {backtestResult && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Backtest Results
              </span>
              <Badge 
                className={`${backtestResult.totalReturn >= 0 ? 'bg-green-600' : 'bg-red-600'} text-white`}
              >
                {backtestResult.totalReturn >= 0 ? 'Profitable' : 'Unprofitable'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-white">{backtestResult.totalTrades}</div>
                <div className="text-sm text-gray-400">Total Trades</div>
              </div>
              
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-white">{backtestResult.winRate}%</div>
                <div className="text-sm text-gray-400">Win Rate</div>
              </div>
              
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className={`text-2xl font-bold ${getReturnColor(backtestResult.totalReturn)}`}>
                  {backtestResult.totalReturn > 0 ? '+' : ''}{backtestResult.totalReturn}%
                </div>
                <div className="text-sm text-gray-400">Total Return</div>
              </div>
              
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-white">{backtestResult.profitFactor}</div>
                <div className="text-sm text-gray-400">Profit Factor</div>
              </div>
              
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-green-400">${backtestResult.averageWin}</div>
                <div className="text-sm text-gray-400">Avg Win</div>
              </div>
              
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-red-400">${backtestResult.averageLoss}</div>
                <div className="text-sm text-gray-400">Avg Loss</div>
              </div>
              
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-red-400">{backtestResult.maxDrawdown}%</div>
                <div className="text-sm text-gray-400">Max Drawdown</div>
              </div>
              
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-white">
                  {backtestResult.winningTrades}/{backtestResult.losingTrades}
                </div>
                <div className="text-sm text-gray-400">W/L Ratio</div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-900 bg-opacity-30 rounded-lg border border-blue-700">
              <p className="text-blue-300 text-sm">
                <strong>Disclaimer:</strong> These backtest results are simulated and for educational purposes only. 
                Past performance does not guarantee future results. Always do your own research and consider risk management.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BacktestingInterface;
