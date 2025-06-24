
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Calendar, X, RefreshCw } from 'lucide-react';
import TradeModal from '@/components/TradeModal';
import { useAIInsights } from '@/hooks/useAIInsights';
import { useWeeklyInsights } from '@/hooks/useWeeklyInsights';
import { useToast } from '@/hooks/use-toast';

interface TradingSidebarProps {
  trades: any[];
  selectedDate?: string | null;
  onTradeCreated: () => void;
  onClearDate?: () => void;
}

const TradingSidebar = ({ trades, selectedDate, onTradeCreated, onClearDate }: TradingSidebarProps) => {
  const { insight, loading, generateInsight } = useAIInsights();
  const { weeklyInsights, insightsDate, loading: weeklyLoading, generateManualInsight } = useWeeklyInsights();
  const { toast } = useToast();

  const handleGenerateInsight = () => {
    generateInsight(trades);
  };

  const handleGenerateWeeklyInsight = async () => {
    const result = await generateManualInsight();
    if (result.success) {
      toast({
        title: "Weekly Insight Generated",
        description: "Coach Vega has analyzed your weekly performance.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to generate weekly insight. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter trades based on selected date
  const filteredTrades = useMemo(() => {
    if (!selectedDate) {
      return trades.slice(0, 3); // Show recent 3 trades when no date selected
    }

    // Filter trades for the selected date
    const selectedDateTrades = trades.filter(trade => {
      if (!trade.exit_date) return false;
      const tradeDate = new Date(trade.exit_date).toISOString().split('T')[0];
      return tradeDate === selectedDate;
    });

    return selectedDateTrades;
  }, [trades, selectedDate]);

  const getTradeHeaderTitle = () => {
    if (selectedDate) {
      const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      return `Trades for ${formattedDate}`;
    }
    return 'Recent Trades';
  };

  const formatInsightsDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Log New Trade Button */}
      <TradeModal onTradeCreated={onTradeCreated} />

      {/* Recent Trades */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">{getTradeHeaderTitle()}</CardTitle>
            {selectedDate && onClearDate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearDate}
                className="text-gray-400 hover:text-white h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
          {selectedDate && (
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>Showing {filteredTrades.length} trade{filteredTrades.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredTrades.map((trade) => (
            <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div>
                  <p className="font-medium text-white">{trade.symbol}</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant={trade.trade_type === 'buy' ? 'default' : 'secondary'} className="text-xs">
                      {trade.trade_type === 'buy' ? 'Long' : 'Short'}
                    </Badge>
                    {selectedDate && (
                      <span className="text-xs text-gray-400">
                        {trade.exit_date ? new Date(trade.exit_date).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : 'Open'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                {!trade.is_open && trade.profit_loss !== null && (
                  <p className={`text-sm font-medium ${trade.profit_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trade.profit_loss >= 0 ? '+' : ''}${trade.profit_loss.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          ))}
          {filteredTrades.length === 0 && (
            <div className="text-center py-4 text-gray-400">
              <p className="text-sm">
                {selectedDate ? 'No trades found for this date' : 'No recent trades'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coach Vega's Insights */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Coach Vega's Insights</CardTitle>
            {!weeklyLoading && weeklyInsights && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerateWeeklyInsight}
                className="text-gray-400 hover:text-white h-6 w-6 p-0"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            )}
          </div>
          {insightsDate && (
            <p className="text-xs text-gray-500">
              Weekly summary from {formatInsightsDate(insightsDate)}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {weeklyLoading ? (
            <div className="flex items-center space-x-2 text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading weekly insights...</span>
            </div>
          ) : weeklyInsights ? (
            <div className="p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
              <p className="text-blue-100 text-sm leading-relaxed">{weeklyInsights}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">
                Coach Vega analyzes your weekly performance automatically. Generate a manual insight or check back later for your weekly summary.
              </p>
              <Button 
                variant="outline" 
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={handleGenerateWeeklyInsight}
                disabled={weeklyLoading}
              >
                {weeklyLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Weekly Insight
                  </>
                )}
              </Button>
            </div>
          )}
          
          {/* Fallback to on-demand insights if no weekly insights */}
          {!weeklyInsights && !weeklyLoading && (
            <div className="border-t border-gray-600 pt-4">
              <p className="text-gray-400 text-xs mb-3">
                Or generate a quick insight based on recent trades:
              </p>
              {insight ? (
                <div className="p-3 bg-purple-900/30 border border-purple-700 rounded-lg mb-3">
                  <p className="text-purple-100 text-sm leading-relaxed">{insight}</p>
                </div>
              ) : (
                <p className="text-gray-400 text-xs mb-3">
                  Click below for a personalized insight based on your recent trades.
                </p>
              )}
              <Button 
                variant="outline" 
                size="sm"
                className="w-full border-gray-600 text-gray-400 hover:bg-gray-700"
                onClick={handleGenerateInsight}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Quick Insight
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingSidebar;
