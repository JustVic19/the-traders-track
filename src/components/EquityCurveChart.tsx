
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EquityCurveChartProps {
  trades: any[];
}

const EquityCurveChart = ({ trades }: EquityCurveChartProps) => {
  const [viewMode, setViewMode] = useState<'pnl' | 'rmultiple'>('pnl');

  // Generate sample data for the equity curve
  const generateEquityData = () => {
    const data = [];
    let runningPnL = 0;
    let runningRMultiple = 0;
    
    for (let i = 0; i < 30; i++) {
      const pnlChange = (Math.random() - 0.4) * 200;
      const rMultipleChange = (Math.random() - 0.4) * 0.5;
      
      runningPnL += pnlChange;
      runningRMultiple += rMultipleChange;
      
      data.push({
        date: `Day ${i + 1}`,
        pnl: runningPnL,
        rmultiple: runningRMultiple
      });
    }
    
    return data;
  };

  const data = generateEquityData();

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Equity Curve</CardTitle>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={viewMode === 'pnl' ? 'default' : 'outline'}
              onClick={() => setViewMode('pnl')}
              className={viewMode === 'pnl' ? 'bg-blue-600 text-white' : 'border-gray-600 text-gray-300'}
            >
              P/L ($)
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'rmultiple' ? 'default' : 'outline'}
              onClick={() => setViewMode('rmultiple')}
              className={viewMode === 'rmultiple' ? 'bg-blue-600 text-white' : 'border-gray-600 text-gray-300'}
            >
              R-Multiple
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-gray-600 text-gray-300"
            >
              By Trade
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-gray-600 text-gray-300"
            >
              By Date
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
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
              />
              <Line
                type="monotone"
                dataKey={viewMode}
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {data.length === 0 && (
          <div className="flex items-center justify-center h-80 text-gray-400">
            (Equity Chart Placeholder)
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EquityCurveChart;
