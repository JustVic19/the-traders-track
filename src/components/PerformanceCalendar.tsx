
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Settings, Info } from 'lucide-react';

const PerformanceCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState('May 2025');
  
  const generateCalendarData = () => {
    const daysInMonth = 31;
    const calendarDays = [];
    const startDay = 4; // May 1st starts on Thursday (0=Sun, 1=Mon, etc.)
    
    // Add empty cells for days before the month starts
    for (let i = 0; i < startDay; i++) {
      calendarDays.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const performance = Math.random() - 0.5; // Random performance between -0.5 and 0.5
      calendarDays.push({
        day: i,
        performance,
        className: performance > 0.2 ? 'bg-green-600' : 
                  performance > 0 ? 'bg-green-500' : 
                  performance > -0.2 ? 'bg-red-500' : 'bg-red-600'
      });
    }
    
    return calendarDays;
  };

  const generateWeeklyStats = () => {
    return [
      { week: 1, earnings: 0, days: 0 },
      { week: 2, earnings: 0, days: 0 },
      { week: 3, earnings: 0, days: 0 },
      { week: 4, earnings: 0, days: 0 },
      { week: 5, earnings: 0, days: 0 }
    ];
  };

  const calendarData = generateCalendarData();
  const weeklyStats = generateWeeklyStats();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    // Add month navigation logic here
    console.log(`Navigate ${direction}`);
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="text-gray-400 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-semibold text-white">{currentMonth}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="text-gray-400 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white bg-gray-700 px-3 py-1 text-xs"
            >
              This month
            </Button>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <span className="text-gray-400 text-sm">Monthly stats: </span>
              <span className="text-white font-semibold">£0</span>
              <span className="text-gray-400 text-sm ml-4">0 days</span>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Info className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4">
          {/* Calendar Grid */}
          <div className="flex-1">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekdays.map((day) => (
                <div key={day} className="text-center text-gray-400 text-sm font-medium p-2">
                  {day}
                </div>
              ))}
            </div>
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarData.map((day, index) => (
                <div
                  key={index}
                  className={`aspect-square flex items-center justify-center text-white text-sm font-medium border border-gray-700 ${
                    day ? `${day.className} cursor-pointer hover:opacity-80 transition-opacity` : 'bg-gray-800'
                  }`}
                >
                  {day?.day || ''}
                </div>
              ))}
            </div>
          </div>
          
          {/* Weekly Stats Sidebar */}
          <div className="w-24 space-y-1">
            {weeklyStats.map((week) => (
              <div key={week.week} className="bg-gray-700 p-3 rounded text-center">
                <div className="text-white text-sm font-medium mb-1">Week {week.week}</div>
                <div className="text-white font-semibold">£{week.earnings}</div>
                <div className="text-gray-400 text-xs">{week.days} days</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceCalendar;
