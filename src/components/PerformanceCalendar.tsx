
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PerformanceCalendar = () => {
  const generateCalendarData = () => {
    const daysInMonth = 30;
    const calendarDays = [];
    
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

  const calendarData = generateCalendarData();
  const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Performance Calendar</CardTitle>
        <div className="text-center text-white font-semibold">June 2025</div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekdays.map((day) => (
            <div key={day} className="text-center text-gray-400 text-sm font-medium p-1">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarData.map((day) => (
            <div
              key={day.day}
              className={`aspect-square flex items-center justify-center text-white text-sm font-medium rounded ${day.className} cursor-pointer hover:opacity-80 transition-opacity`}
            >
              {day.day}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceCalendar;
