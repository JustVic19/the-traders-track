
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface TournamentCountdownProps {
  endDate: string;
}

const TournamentCountdown = ({ endDate }: TournamentCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate).getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-500" />
          <CardTitle className="text-white">Tournament Ends In</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="text-2xl font-bold text-white">{timeLeft.days}</div>
            <div className="text-gray-400 text-sm">Days</div>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="text-2xl font-bold text-white">{timeLeft.hours}</div>
            <div className="text-gray-400 text-sm">Hours</div>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="text-2xl font-bold text-white">{timeLeft.minutes}</div>
            <div className="text-gray-400 text-sm">Minutes</div>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="text-2xl font-bold text-white">{timeLeft.seconds}</div>
            <div className="text-gray-400 text-sm">Seconds</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TournamentCountdown;
