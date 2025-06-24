
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Calendar, X } from 'lucide-react';
import TradeModal from '@/components/TradeModal';
import { useAIInsights } from '@/hooks/useAIInsights';

interface TradingSidebarProps {
  trades: any[];
  selectedDate?: string | null;
  onTradeCreated: () => void;
  onClearDate?: () => void;
}

const TradingSidebar = ({ trades, selectedDate, onTradeCreated, onClearDate }: TradingSidebarProps) => {
  const { insight, loading, generateInsight } = useAIInsights();

  const handleGenerateInsight = () => {
    generateInsight(trades);
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
          <CardTitle className="text-white">Coach Vega's Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {insight ? (
            <div className="p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
              <p className="text-blue-100 text-sm leading-relaxed">{insight}</p>
            </div>
          ) : (
            <p className="text-gray-300 text-sm">
              Click the button below to generate a personalized insight based on your recent trades.
            </p>
          )}
          <Button 
            variant="outline" 
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
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
                Generate AI Insight
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingSidebar;
