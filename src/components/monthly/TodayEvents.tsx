import { useMemo, memo } from 'react';
import { useWeeklyPlan } from '../../hooks/useWeeklyPlan';
import { getWeekStart, getWeekDates } from '../../utils/dates';
import { parseLocalDate } from '../../utils/timezone';
import { getThemeColor, getThemeDimColor } from '../../utils/theme';
import { parseTimeToMinutes } from '../../utils/time';

interface TodayEventsProps {
  currentDate: any;
  theme?: 'matrix' | 'jarvis' | 'tactical';
}

const TodayEventsComponent = ({ currentDate, theme = 'matrix' }: TodayEventsProps) => {
  const today = currentDate.today;
  const weekStart = getWeekStart(today);
  const { weekPlan } = useWeeklyPlan(weekStart);

  // Theme-aware colors
  const accentColor = getThemeColor(theme);
  const mutedColor = getThemeDimColor(theme);
  const successColor = accentColor;

  const todayEvents = useMemo(() => {
    if (!weekPlan) return [];

    // Find today's day in the week plan
    const todayDay = weekPlan.days.find(d => d.date === today);
    if (!todayDay || !todayDay.events) return [];

    return [...todayDay.events].sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
  }, [weekPlan, today]);

  const getCurrentTime = (): number => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  };

  const isEventUpcoming = (timeStr: string): boolean => {
    return parseTimeToMinutes(timeStr) > getCurrentTime();
  };

  if (!weekPlan) {
    return (
      <div style={{ fontSize: '11px', color: mutedColor }}>
        Loading...
      </div>
    );
  }

  if (todayEvents.length === 0) {
    return (
      <div style={{ fontSize: '11px', color: mutedColor, textAlign: 'center', padding: '8px 0' }}>
        No events scheduled
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div style={{ fontSize: '9px', color: accentColor, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Today's Schedule
      </div>
      <div className="space-y-1">
        {todayEvents.map(event => {
          const upcoming = isEventUpcoming(event.time);
          const color = event.color || accentColor;

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
                <div style={{ fontSize: '10px', color: accentColor, marginTop: '1px' }}>
                  {event.title}
                </div>
              </div>
              {upcoming && (
                <div style={{ fontSize: '8px', color: successColor, whiteSpace: 'nowrap' }}>
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
