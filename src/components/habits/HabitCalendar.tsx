import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface CalendarDay {
  date: string;
  count: number;
  isComplete: boolean;
}

interface HabitCalendarProps {
  data: CalendarDay[];
  className?: string;
}

export function HabitCalendar({ data, className }: HabitCalendarProps) {
  const { i18n } = useTranslation();
  const isVi = i18n.language === 'vi';
  
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const todayStr = today.toISOString().split('T')[0];

  const daysOfWeek = isVi 
    ? ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
    : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const monthName = isVi
    ? `Tháng ${currentMonth + 1}`
    : today.toLocaleString('en-US', { month: 'long' });

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get day of week for first day (0 = Sunday, adjust for Monday start)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    const days: { day: number | null; date: string | null; data: CalendarDay | null }[] = [];

    // Add empty slots for days before the 1st
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ day: null, date: null, data: null });
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = data.find(d => d.date === date) || null;
      days.push({ day, date, data: dayData });
    }

    return days;
  }, [currentYear, currentMonth, data]);

  const getStatusColor = (dayInfo: { day: number | null; date: string | null; data: CalendarDay | null }) => {
    if (!dayInfo.day || !dayInfo.date) return '';
    
    const isToday = dayInfo.date === todayStr;
    const isFuture = dayInfo.date > todayStr;
    
    if (isFuture) return 'bg-muted/30 text-muted-foreground/50';
    if (dayInfo.data?.isComplete) return 'bg-green-500 text-white';
    if (dayInfo.data && dayInfo.data.count > 0) return 'bg-green-500/40 text-green-700 dark:text-green-300';
    if (isToday) return 'bg-primary/20 text-primary ring-2 ring-primary';
    return 'bg-muted/50 text-muted-foreground';
  };

  return (
    <div className={cn('rounded-xl border bg-white/5 backdrop-blur-sm p-4', className)}>
      <h4 className="font-medium mb-3 text-sm text-center">{monthName} {currentYear}</h4>
      
      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map((day, i) => (
          <div key={i} className="text-center text-xs text-muted-foreground font-medium py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dayInfo, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.01 }}
            className={cn(
              'aspect-square flex items-center justify-center text-xs font-medium rounded-lg transition-all',
              dayInfo.day ? getStatusColor(dayInfo) : ''
            )}
            title={dayInfo.data ? `${dayInfo.data.count}/7 habits` : ''}
          >
            {dayInfo.day}
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>{isVi ? 'Hoàn thành' : 'Complete'}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500/40" />
          <span>{isVi ? 'Một phần' : 'Partial'}</span>
        </div>
      </div>
    </div>
  );
}
