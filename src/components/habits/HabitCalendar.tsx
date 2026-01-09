import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

interface HabitCalendarProps {
  calendar: Record<string, 'full' | 'partial' | 'none'>;
}

export function HabitCalendar({ calendar }: HabitCalendarProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'vi' ? vi : enUS;
  const now = new Date();

  const { days, weekDays, startOffset } = useMemo(() => {
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startOffset = getDay(monthStart);
    
    const weekDays = i18n.language === 'vi' 
      ? ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
      : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return { days, weekDays, startOffset };
  }, [now, i18n.language]);

  return (
    <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-4">
      {/* Month Header */}
      <h4 className="text-sm font-medium text-center mb-3">
        {format(now, 'MMMM yyyy', { locale })}
      </h4>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs text-muted-foreground font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="h-8" />
        ))}

        {/* Day cells */}
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const status = calendar[key] || 'none';
          const isCurrentDay = isToday(day);
          const isFuture = day > now;

          return (
            <div
              key={key}
              className={`
                relative flex h-8 w-full items-center justify-center rounded-md text-xs
                transition-colors
                ${isCurrentDay ? 'ring-2 ring-primary ring-offset-1' : ''}
                ${isFuture ? 'text-muted-foreground/50' : ''}
              `}
            >
              {/* Status indicator */}
              {status === 'full' && !isFuture && (
                <div className="absolute inset-1 rounded-md bg-green-500" />
              )}
              {status === 'partial' && !isFuture && (
                <div className="absolute inset-1 rounded-md bg-green-300 dark:bg-green-700" />
              )}
              
              {/* Day number */}
              <span 
                className={`
                  relative z-10
                  ${status === 'full' ? 'text-white font-semibold' : ''}
                  ${status === 'partial' ? 'text-green-900 dark:text-green-100 font-medium' : ''}
                `}
              >
                {format(day, 'd')}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-green-500" />
          <span className="text-muted-foreground">{t('habits.allComplete')}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-green-300 dark:bg-green-700" />
          <span className="text-muted-foreground">{t('habits.partial')}</span>
        </div>
      </div>
    </div>
  );
}
