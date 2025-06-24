
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Settings, Info, X } from 'lucide-react';

interface DailyTradeData {
  date: string;
  pnl: number;
  tradeCount: number;
  winRate: number;
  performance: 'excellent' | 'good' | 'neutral' | 'poor' | 'terrible';
}

interface PerformanceCalendarProps {
  dailyData?: DailyTradeData[];
  selectedDate?: string | null;
  onDateSelect?: (date: string | null) => void;
}

const PerformanceCalendar: React.FC<PerformanceCalendarProps> = ({ 
  dailyData = [], 
  selectedDate = null, 
  onDateSelect 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const getPerformanceColor = (performance: string, pnl: number) => {
    if (pnl === 0) return 'bg-gray-700';
    
    switch (performance) {
      case 'excellent': return 'bg-green-600';
      case 'good': return 'bg-green-500';
      case 'neutral': return pnl > 0 ? 'bg-green-400' : 'bg-red-400';
      case 'poor': return 'bg-red-500';
      case 'terrible': return 'bg-red-600';
      default: return 'bg-gray-700';
    }
  };

  const handleDayClick = (date: string) => {
    if (onDateSelect) {
      // If clicking the same date, clear it; otherwise set it
      onDateSelect(selectedDate === date ? null : date);
    }
  };

  const handleClearSelection = () => {
    if (onDateSelect) {
      onDateSelect(null);
    }
  };

  const generateCalendarData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();
    
    const calendarDays = [];
    
    // Add empty cells for days before the month starts
    for (let i = 0; i < startDay; i++) {
      calendarDays.push(null);
    }
    
    // Create a map for quick lookup of daily data
    const dailyDataMap = new Map();
    dailyData.forEach(data => {
      dailyDataMap.set(data.date, data);
    });
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayData = dailyDataMap.get(dateStr);
      const isSelected = selectedDate === dateStr;
      
      calendarDays.push({
        day: i,
        date: dateStr,
        data: dayData,
        className: dayData ? getPerformanceColor(dayData.performance, dayData.pnl) : 'bg-gray-800',
        isSelected
      });
    }
    
    return calendarDays;
  };

  const generateWeeklyStats = () => {
    const weeks = [];
    const calendarData = generateCalendarData();
    
    // Group calendar data into weeks
    for (let i = 0; i < calendarData.length; i += 7) {
      const weekDays = calendarData.slice(i, i + 7);
      let weekPnL = 0;
      let weekTrades = 0;
      
      weekDays.forEach(day => {
        if (day?.data) {
          weekPnL += day.data.pnl;
          weekTrades += day.data.tradeCount;
        }
      });
      
      weeks.push({
        week: Math.floor(i / 7) + 1,
        earnings: weekPnL,
        days: weekDays.filter(day => day?.data?.tradeCount > 0).length
      });
    }
    
    return weeks;
  };

  const calendarData = generateCalendarData();
  const weeklyStats = generateWeeklyStats();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Group calendar data into weeks for proper alignment
  const calendarWeeks = [];
  for (let i = 0; i < calendarData.length; i += 7) {
    calendarWeeks.push(calendarData.slice(i, i + 7));
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  const currentMonthStr = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  // Calculate monthly stats
  const currentMonthData = dailyData.filter(data => {
    const dataDate = new Date(data.date);
    return dataDate.getMonth() === currentDate.getMonth() && 
           dataDate.getFullYear() === currentDate.getFullYear();
  });

  const monthlyPnL = currentMonthData.reduce((sum, data) => sum + data.pnl, 0);
  const monthlyDays = currentMonthData.filter(data => data.tradeCount > 0).length;

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
            <h2 className="text-lg font-semibold text-white">{currentMonthStr}</h2>
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
              onClick={goToCurrentMonth}
              className="text-gray-400 hover:text-white bg-gray-700 px-3 py-1 text-xs"
            >
              This month
            </Button>
            {selectedDate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="text-gray-400 hover:text-white bg-red-900/30 border border-red-700 px-3 py-1 text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Clear ({new Date(selectedDate).toLocaleDateString()})
              </Button>
            )}
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <span className="text-gray-400 text-sm">Monthly stats: </span>
              <span className={`font-semibold ${monthlyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {monthlyPnL >= 0 ? '+' : ''}${monthlyPnL.toFixed(2)}
              </span>
              <span className="text-gray-400 text-sm ml-4">{monthlyDays} days</span>
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
            <div className="flex items-center space-x-1 mb-2">
              <div className="grid grid-cols-7 gap-1 flex-1">
                {weekdays.map((day) => (
                  <div key={day} className="text-center text-gray-400 text-sm font-medium p-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="w-24 flex-shrink-0"></div>
            </div>
            
            {/* Calendar Weeks with Weekly Stats */}
            <div className="space-y-1">
              {calendarWeeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex items-center space-x-1">
                  {/* Calendar Days for this week */}
                  <div className="grid grid-cols-7 gap-1 flex-1">
                    {week.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`aspect-square flex items-center justify-center text-white text-sm font-medium border transition-all ${
                          day ? `${day.className} cursor-pointer hover:opacity-80 relative group ${
                            day.isSelected ? 'border-blue-400 border-2 shadow-lg shadow-blue-400/20' : 'border-gray-700'
                          }` : 'bg-gray-800 border-gray-700'
                        }`}
                        title={day?.data ? `${day.date}: $${day.data.pnl.toFixed(2)} (${day.data.tradeCount} trades)` : ''}
                        onClick={() => day?.data && handleDayClick(day.date)}
                      >
                        {day?.day || ''}
                        {day?.data && (
                          <div className="absolute inset-0 flex items-end justify-end p-1">
                            <div className="w-1 h-1 bg-white rounded-full opacity-60"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Weekly Stats aligned with this row */}
                  {weeklyStats[weekIndex] && (
                    <div className="w-24 bg-gray-700 p-3 rounded text-center flex-shrink-0">
                      <div className="text-white text-sm font-medium mb-1">Week {weeklyStats[weekIndex].week}</div>
                      <div className={`font-semibold ${weeklyStats[weekIndex].earnings >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {weeklyStats[weekIndex].earnings >= 0 ? '+' : ''}${weeklyStats[weekIndex].earnings.toFixed(2)}
                      </div>
                      <div className="text-gray-400 text-xs">{weeklyStats[weekIndex].days} days</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceCalendar;
