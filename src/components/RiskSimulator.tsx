
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Calculator, TrendingDown } from 'lucide-react';

const RiskSimulator: React.FC = () => {
  const [portfolioValue, setPortfolioValue] = useState('10000');
  const [riskPercentage, setRiskPercentage] = useState('2');
  const [stopLossPercentage, setStopLossPercentage] = useState('5');
  const [results, setResults] = useState<any>(null);

  const calculateRisk = () => {
    const portfolio = parseFloat(portfolioValue);
    const riskPercent = parseFloat(riskPercentage) / 100;
    const stopLoss = parseFloat(stopLossPercentage) / 100;

    const maxRisk = portfolio * riskPercent;
    const positionSize = maxRisk / stopLoss;
    const sharesAffordable = Math.floor(positionSize / 100); // Assuming $100 per share

    setResults({
      maxRisk: maxRisk.toFixed(2),
      positionSize: positionSize.toFixed(2),
      sharesAffordable,
      riskRewardRatio: (stopLoss * 2).toFixed(2) // 2:1 target
    });
  };

  return (
    <Card className="bg-gray-800 border-gray-700 border-l-4 border-l-yellow-500">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Calculator className="w-5 h-5 mr-2 text-yellow-400" />
          Risk Simulator
          <span className="ml-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded">PRO</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="portfolio" className="text-gray-400">Portfolio Value ($)</Label>
            <Input
              id="portfolio"
              value={portfolioValue}
              onChange={(e) => setPortfolioValue(e.target.value)}
              className="bg-gray-900 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="risk" className="text-gray-400">Risk per Trade (%)</Label>
            <Input
              id="risk"
              value={riskPercentage}
              onChange={(e) => setRiskPercentage(e.target.value)}
              className="bg-gray-900 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="stopLoss" className="text-gray-400">Stop Loss (%)</Label>
            <Input
              id="stopLoss"
              value={stopLossPercentage}
              onChange={(e) => setStopLossPercentage(e.target.value)}
              className="bg-gray-900 border-gray-600 text-white"
            />
          </div>
        </div>

        <Button 
          onClick={calculateRisk}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold"
        >
          Calculate Position Size
        </Button>

        {results && (
          <div className="bg-gray-900 p-4 rounded-lg space-y-3">
            <h4 className="text-white font-bold flex items-center">
              <TrendingDown className="w-4 h-4 mr-2" />
              Risk Analysis Results
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Max Risk Amount:</span>
                <p className="text-red-400 font-bold">${results.maxRisk}</p>
              </div>
              <div>
                <span className="text-gray-400">Position Size:</span>
                <p className="text-blue-400 font-bold">${results.positionSize}</p>
              </div>
              <div>
                <span className="text-gray-400">Shares to Buy:</span>
                <p className="text-green-400 font-bold">{results.sharesAffordable}</p>
              </div>
              <div>
                <span className="text-gray-400">Target R:R Ratio:</span>
                <p className="text-purple-400 font-bold">1:{results.riskRewardRatio}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RiskSimulator;
