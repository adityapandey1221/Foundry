import { useMemo, memo } from 'react';
import { useWeeklyPlan } from '../../hooks/useWeeklyPlan';
import { getWeekStart, getWeekDates } from '../../utils/dates';
import { parseLocalDate } from '../../utils/timezone';

interface TodayEventsProps {
  currentDate: any;
}

const TodayEventsComponent = ({ currentDate }: TodayEventsProps) => {
  const today = currentDate.today;
  const weekStart = getWeekStart(today);
  const { weekPlan } = useWeeklyPlan(weekStart);

  const todayEvents = useMemo(() => {
    if (!weekPlan) return [];

    // Find today's day in the week plan
    const todayDay = weekPlan.days.find(d => d.date === today);
    if (!todayDay || !todayDay.events) return [];

    // Parse time and sort events
    const parseTime = (timeStr: string): number => {
      const normalized = timeStr.trim().toLowerCase();
      const match = normalized.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
      if (!match) return 0;

      let hours = parseInt(match[1], 10);
      const minutes = match[2] ? parseInt(match[2], 10) : 0;
      const meridiem = match[3];

      if (meridiem === 'pm' && hours !== 12) {
        hours += 12;
      } else if (meridiem === 'am' && hours === 12) {
        hours = 0;
      }

      return hours * 60 + minutes;
    };

    return [...todayDay.events].sort((a, b) => parseTime(a.time) - parseTime(b.time));
  }, [weekPlan, today]);

  const getCurrentTime = (): number => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  };

  const isEventUpcoming = (timeStr: string): boolean => {
    const parseTime = (s: string): number => {
      const normalized = s.trim().toLowerCase();
      const match = normalized.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
      if (!match) return 0;
      let h = parseInt(match[1], 10);
      const m = match[2] ? parseInt(match[2], 10) : 0;
      const mer = match[3];
      if (mer === 'pm' && h !== 12) h += 12;
      if (mer === 'am' && h === 12) h = 0;
      return h * 60 + m;
    };

    return parseTime(timeStr) > getCurrentTime();
  };

  if (!weekPlan) {
    return (
      <div style={{ fontSize: '11px', color: '#22AA44' }}>
        Loading...
      </div>
    );
  }

  if (todayEvents.length === 0) {
    return (
      <div style={{ fontSize: '11px', color: '#22AA44', textAlign: 'center', padding: '8px 0' }}>
        No events scheduled
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div style={{ fontSize: '9px', color: '#39FF14', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Today's Schedule
      </div>
      <div className="space-y-1">
        {todayEvents.map(event => {
          const upcoming = isEventUpcoming(event.time);
          const color = event.color || '#39FF14';

          return (
            <div
              key={event.id}
              className="flex items-start gap-2"
              style={{
                opacity: upcoming ? 1 : 0.6,
                padding: '4px 6px',
                borderLeft: `2px solid ${color}`,
                backgroundColor: upcoming ? `${color}10` : 'transparent',
                transition: 'all 200ms',
              }}
            >
              <div className="flex-shrink-0">
                <div
                  className="w-1.5 h-1.5 rounded-full mt-1"
                  style={{
                    backgroundColor: color,
                    boxShadow: upcoming ? `0 0 4px ${color}` : 'none',
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: '10px', fontWeight: 'bold', color }} >
                  {event.time}
                </div>
                <div style={{ fontSize: '10px', color: '#39FF14', marginTop: '1px' }}>
                  {event.title}
                </div>
              </div>
              {upcoming && (
                <div style={{ fontSize: '8px', color: '#43BF4D', whiteSpace: 'nowrap' }}>
                  UPCOMING
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const TodayEvents = memo(TodayEventsComponent);
