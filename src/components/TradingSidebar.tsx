
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import TradeModal from '@/components/TradeModal';

interface TradingSidebarProps {
  trades: any[];
  onTradeCreated: () => void;
}

const TradingSidebar = ({ trades, onTradeCreated }: TradingSidebarProps) => {
  return (
    <div className="space-y-6">
      {/* Log New Trade Button */}
      <TradeModal onTradeCreated={onTradeCreated} />

      {/* Recent Trades */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Trades</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trades.slice(0, 3).map((trade) => (
            <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div>
                  <p className="font-medium text-white">{trade.symbol}</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant={trade.trade_type === 'buy' ? 'default' : 'secondary'} className="text-xs">
                      {trade.trade_type === 'buy' ? 'Long' : 'Short'}
                    </Badge>
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
          {trades.length === 0 && (
            <div className="text-center py-4 text-gray-400">
              <p className="text-sm">No recent trades</p>
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
          <p className="text-gray-300 text-sm">
            Click the button below to generate a personalized insight based on your recent trades.
          </p>
          <Button 
            variant="outline" 
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate AI Insight
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingSidebar;
