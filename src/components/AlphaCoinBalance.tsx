
import React from 'react';
import { Coins } from 'lucide-react';

interface AlphaCoinBalanceProps {
  balance: number;
  className?: string;
}

const AlphaCoinBalance = ({ balance, className = '' }: AlphaCoinBalanceProps) => {
  return (
    <div className={`flex items-center space-x-2 bg-gray-700 px-3 py-2 rounded-lg ${className}`}>
      <Coins className="w-4 h-4 text-yellow-500" />
      <span className="text-white font-bold">{balance}</span>
      <span className="text-gray-400 text-sm">Alpha Coins</span>
    </div>
  );
};

export default AlphaCoinBalance;
