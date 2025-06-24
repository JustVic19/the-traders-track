
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tables } from '@/integrations/supabase/types';

type Trade = Tables<'trades'>;

interface EquityCurveChartProps {
  trades: Trade[];
}

interface EquityDataPoint {
  date: string;
  pnl: number;
  rmultiple: number;
  tradeNumber: number;
}

const EquityCurveChart = ({ trades }: EquityCurveChartProps) => {
  const [viewMode, setViewMode] = useState<'pnl' | 'rmultiple'>('pnl');
  const [xAxisMode, setXAxisMode] = useState<'trade' | 'date'>('trade');

  // Generate equity curve data from real trades
  const equityData = useMemo((): EquityDataPoint[] => {
    if (!trades.length) return [];

    // Filter and sort closed trades by exit date
    const closedTrades = trades
      .filter(trade => !trade.is_open && trade.profit_loss !== null && trade.exit_date)
      .sort((a, b) => new Date(a.exit_date!).getTime() - new Date(b.exit_date!).getTime());

    if (closedTrades.length === 0) return [];

    let runningPnL = 0;
    let runningRMultiple = 0;

    return closedTrades.map((trade, index) => {
      runningPnL += trade.profit_loss || 0;
      
      // Calculate R-multiple (risk:reward ratio)
      // Assume 2% risk of entry price as default risk amount if not specified in notes
      const entryPrice = trade.entry_price || 0;
      const riskAmount = entryPrice * 0.02; // 2% of entry price as risk
      const rMultiple = riskAmount > 0 ? (trade.profit_loss || 0) / riskAmount : 0;
      runningRMultiple += rMultiple;

      return {
        date: new Date(trade.exit_date!).toLocaleDateString(),
        pnl: runningPnL,
        rmultiple: runningRMultiple,
        tradeNumber: index + 1,
      };
    });
  }, [trades]);

  const formatTooltipLabel = (label: string, payload: any[]) => {
    if (xAxisMode === 'trade') {
      return `Trade #${label}`;
    }
    return label;
  };

  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'pnl') {
      return [`$${value.toFixed(2)}`, 'Cumulative P/L'];
    }
    if (name === 'rmultiple') {
      return [`${value.toFixed(2)}R`, 'Cumulative R-Multiple'];
    }
    return [value, name];
  };

  const handleViewModeChange = (mode: 'pnl' | 'rmultiple') => {
    setViewMode(mode);
  };

  const handleXAxisModeChange = (mode: 'trade' | 'date') => {
    setXAxisMode(mode);
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Equity Curve</CardTitle>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={viewMode === 'pnl' ? 'default' : 'outline'}
              onClick={() => handleViewModeChange('pnl')}
              className={viewMode === 'pnl' ? 'bg-blue-600 text-white' : 'border-gray-600 text-gray-300 hover:bg-gray-700'}
            >
              P/L ($)
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'rmultiple' ? 'default' : 'outline'}
              onClick={() => handleViewModeChange('rmultiple')}
              className={viewMode === 'rmultiple' ? 'bg-blue-600 text-white' : 'border-gray-600 text-gray-300 hover:bg-gray-700'}
            >
              R-Multiple
            </Button>
            <Button
              size="sm"
              variant={xAxisMode === 'trade' ? 'default' : 'outline'}
              onClick={() => handleXAxisModeChange('trade')}
              className={xAxisMode === 'trade' ? 'bg-blue-600 text-white' : 'border-gray-600 text-gray-300 hover:bg-gray-700'}
            >
              By Trade
            </Button>
            <Button
              size="sm"
              variant={xAxisMode === 'date' ? 'default' : 'outline'}
              onClick={() => handleXAxisModeChange('date')}
              className={xAxisMode === 'date' ? 'bg-blue-600 text-white' : 'border-gray-600 text-gray-300 hover:bg-gray-700'}
            >
              By Date
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {equityData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={equityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey={xAxisMode === 'trade' ? 'tradeNumber' : 'date'}
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
                  labelFormatter={formatTooltipLabel}
                  formatter={formatTooltipValue}
                />
                <Line
                  type="monotone"
                  dataKey={viewMode}
                  stroke={viewMode === 'pnl' ? 
                    (equityData[equityData.length - 1]?.[viewMode] >= 0 ? '#10B981' : '#EF4444') : 
                    '#3B82F6'
                  }
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div className="text-lg mb-2">No Trade Data Available</div>
                <div className="text-sm">Complete some trades to see your equity curve</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EquityCurveChart;
