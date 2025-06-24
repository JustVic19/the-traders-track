
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tables } from '@/integrations/supabase/types';

type Trade = Tables<'trades'>;

interface GuildEquityCurveProps {
  trades: Trade[];
}

interface EquityDataPoint {
  date: string;
  pnl: number;
  tradeNumber: number;
}

const GuildEquityCurve = ({ trades }: GuildEquityCurveProps) => {
  // Generate combined equity curve data from all guild member trades
  const equityData = useMemo((): EquityDataPoint[] => {
    if (!trades.length) return [];

    // Sort all trades by exit date
    const sortedTrades = [...trades].sort((a, b) => 
      new Date(a.exit_date!).getTime() - new Date(b.exit_date!).getTime()
    );

    let runningPnL = 0;

    return sortedTrades.map((trade, index) => {
      runningPnL += trade.profit_loss || 0;

      return {
        date: new Date(trade.exit_date!).toLocaleDateString(),
        pnl: runningPnL,
        tradeNumber: index + 1,
      };
    });
  }, [trades]);

  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'pnl') {
      return [`$${value.toFixed(2)}`, 'Combined P/L'];
    }
    return [value, name];
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Guild Combined Equity Curve</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {equityData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={equityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="tradeNumber"
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    color: '#F9FAFB'
                  }}
                  labelFormatter={(label) => `Trade #${label}`}
                  formatter={formatTooltipValue}
                />
                <Line
                  type="monotone"
                  dataKey="pnl"
                  stroke={equityData[equityData.length - 1]?.pnl >= 0 ? '#10B981' : '#EF4444'}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div className="text-lg mb-2">No Guild Trade Data</div>
                <div className="text-sm">Guild members need to complete trades to see the combined equity curve</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GuildEquityCurve;
