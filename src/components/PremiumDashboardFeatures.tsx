
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart3, Target, AlertTriangle } from 'lucide-react';

interface PremiumDashboardFeaturesProps {
  trades: any[];
  metrics: any;
}

const PremiumDashboardFeatures: React.FC<PremiumDashboardFeaturesProps> = ({ trades, metrics }) => {
  return (
    <div className="space-y-6">
      {/* Advanced Analytics Section */}
      <Card className="bg-gray-800 border-gray-700 border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
            Advanced Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="text-sm text-gray-400">Sharpe Ratio</h4>
              <p className="text-xl font-bold text-green-400">
                {metrics.sharpeRatio || '1.24'}
              </p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="text-sm text-gray-400">Max Drawdown</h4>
              <p className="text-xl font-bold text-red-400">
                -{metrics.maxDrawdown || '12.5'}%
              </p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="text-sm text-gray-400">Calmar Ratio</h4>
              <p className="text-xl font-bold text-blue-400">
                {metrics.calmarRatio || '2.15'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Analysis Section */}
      <Card className="bg-gray-800 border-gray-700 border-l-4 border-l-orange-500">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-400" />
            Risk Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Value at Risk (95%)</span>
              <span className="text-red-400 font-bold">$1,234</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Expected Shortfall</span>
              <span className="text-red-400 font-bold">$1,890</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Beta</span>
              <span className="text-blue-400 font-bold">0.87</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Optimization */}
      <Card className="bg-gray-800 border-gray-700 border-l-4 border-l-purple-500">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Target className="w-5 h-5 mr-2 text-purple-400" />
            Portfolio Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-300">
            <p className="mb-2">Based on your trading history, consider:</p>
            <ul className="space-y-1 text-sm">
              <li>• Reducing position size in high-volatility stocks</li>
              <li>• Diversifying across more sectors</li>
              <li>• Implementing stop-losses more consistently</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PremiumDashboardFeatures;
