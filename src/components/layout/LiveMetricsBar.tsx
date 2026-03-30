import { useMemo } from 'react';
import {
  calculateWeekSummary,
  calculateBestStreak,
  calculatePercentage,
  calculateDelta,
} from '../../utils/scoring';
import { getWeekDates, getMonthDates } from '../../utils/dates';
import { parseLocalDate, formatLocalDate } from '../../utils/timezone';
import { getThemeColor } from '../../utils/theme';

interface LiveMetricsBarProps {
  habits: any[];
  completions: any;
  currentDate: any;
  weekStart: string;
  theme: 'matrix' | 'jarvis' | 'tactical';
}

export const LiveMetricsBar = ({
  habits,
  completions,
  currentDate,
  weekStart,
  theme,
}: LiveMetricsBarProps) => {
  const accentColor = getThemeColor(theme);
  const warningColor = '#FFD700';
  const criticalColor = '#FF4444';

  const getThresholdColor = (value: number, goodThreshold: number, warnThreshold: number) => {
    if (value >= goodThreshold) return accentColor;
    if (value >= warnThreshold) return warningColor;
    return criticalColor;
  };

  const data = useMemo(() => {
    const activeHabits = habits.filter(h => h.isActive);
    if (activeHabits.length === 0) {
      return {
        todayPct: 0,
        todayColor: criticalColor,
        streak: 0,
        streakColor: criticalColor,
        bestStreak: 0,
        weekPct: 0,
        weekColor: criticalColor,
        monthPct: 0,
        monthColor: criticalColor,
        weekDelta: { value: 0, direction: 'flat', formatted: '—' },
        deltaTrendColor: warningColor,
        activeCount: 0,
      };
    }

    const today = currentDate.today;

    // Today's completion
    const todayCompletions = (completions[today] || []).filter(id =>
      activeHabits.some(h => h.id === id)
    );
    const todayPct = calculatePercentage(todayCompletions.length, activeHabits.length);
    const todayColor = getThresholdColor(todayPct, 80, 50);

    // Current streak
    let streak = 0;
    const currentDateObj = parseLocalDate(today);
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(currentDateObj);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = formatLocalDate(checkDate);
      const completed = (completions[dateStr] || []).filter(id =>
        activeHabits.some(h => h.id === id)
      ).length;
      if (completed === activeHabits.length) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    const streakColor = getThresholdColor(streak, 7, 1);

    // Best streak
    const bestStreak = calculateBestStreak(habits, completions);

    // Week summary
    const weekDates = getWeekDates(weekStart);
    const weekSummary = calculateWeekSummary(weekDates, habits, completions);
    const weekPct = Math.round(weekSummary.overallPercentage * 100);
    const weekColor = getThresholdColor(weekPct, 80, 50);

    // Previous week delta
    const prevWeekStart = new Date(weekStart + 'T00:00:00');
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekStartStr = `${prevWeekStart.getFullYear()}-${String(prevWeekStart.getMonth() + 1).padStart(2, '0')}-${String(prevWeekStart.getDate()).padStart(2, '0')}`;
    const prevWeekDates = getWeekDates(prevWeekStartStr);
    const prevWeekSummary = calculateWeekSummary(prevWeekDates, habits, completions);
    const weekDelta = calculateDelta(weekSummary.overallPercentage, prevWeekSummary.overallPercentage);
    const deltaTrendColor = weekDelta.direction === 'up' ? accentColor : weekDelta.direction === 'down' ? criticalColor : warningColor;

    // Month summary
    const monthDates = getMonthDates(currentDate.year, currentDate.month);
    let monthPct = 0;
    if (monthDates.length > 0) {
      const monthCompleted = monthDates.reduce((acc, date) => {
        const dayCompletions = completions[date] || [];
        return acc + dayCompletions.filter(id => activeHabits.some(h => h.id === id)).length;
      }, 0);
      monthPct = calculatePercentage(monthCompleted, activeHabits.length * monthDates.length);
    }
    const monthColor = getThresholdColor(monthPct, 80, 50);

    return {
      todayPct,
      todayColor,
      streak,
      streakColor,
      bestStreak,
      weekPct,
      weekColor,
      monthPct,
      monthColor,
      weekDelta,
      deltaTrendColor,
      activeCount: activeHabits.length,
    };
  }, [habits, completions, currentDate, weekStart, accentColor, warningColor, criticalColor]);

  const Metric = ({ label, value, color, isPulsing = false }: any) => (
    <div className="flex items-center gap-2">
      <div
        className={isPulsing && color !== accentColor ? 'pulse-glow' : ''}
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: color,
          boxShadow: `0 0 4px ${color}`,
        }}
      />
      <span
        className="text-xs uppercase tracking-widest font-mono"
        style={{ color: '#999', minWidth: '45px' }}
      >
        {label}
      </span>
      <span
        className="text-xs font-bold font-mono"
        style={{ color, minWidth: '40px' }}
      >
        {value}
      </span>
    </div>
  );

  const Separator = () => (
    <div style={{ color: '#444', fontSize: '10px', margin: '0 4px' }}>│</div>
  );

  return (
    <div
      className="bg-black border-b border-neutral-800 px-6 py-2 flex gap-4 items-center justify-start overflow-x-auto"
      style={{ scrollBehavior: 'smooth' }}
    >
      <Metric
        label="TODAY"
        value={`${data.todayPct}%`}
        color={data.todayColor}
        isPulsing={data.todayPct < 80}
      />
      <Separator />
      <Metric
        label="STREAK"
        value={`${data.streak}d`}
        color={data.streakColor}
        isPulsing={data.streak === 0}
      />
      <Separator />
      <Metric label="BEST" value={`${data.bestStreak}d`} color={accentColor} />
      <Separator />
      <Metric
        label="WEEK"
        value={`${data.weekPct}%`}
        color={data.weekColor}
        isPulsing={data.weekPct < 80}
      />
      <Separator />
      <Metric label="MONTH" value={`${data.monthPct}%`} color={data.monthColor} />
      <Separator />
      <Metric
        label="WEEK Δ"
        value={data.weekDelta.formatted}
        color={data.deltaTrendColor}
      />
      <Separator />
      <Metric label="HABITS" value={`${data.activeCount}`} color={accentColor} />
    </div>
  );
};
