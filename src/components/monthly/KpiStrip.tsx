import { useMemo } from 'react';
import { Sparkline } from '../shared/Sparkline';
import {
  calculateBestStreak,
  calculateHabitScore,
  getGradeFromScore,
  calculateNDaySparkline,
  calculateDelta,
  calculateWeekSummary,
  calculatePercentage,
} from '../../utils/scoring';
import { getWeekDates, getMonthDates } from '../../utils/dates';
import { parseLocalDate } from '../../utils/timezone';

interface KpiStripProps {
  habits: any[];
  completions: any;
  currentDate: any;
  selectedWeekStart: string;
}

export const KpiStrip = ({
  habits,
  completions,
  currentDate,
  selectedWeekStart,
}: KpiStripProps) => {
  const data = useMemo(() => {
    const activeHabits = habits.filter(h => h.isActive);
    const today = currentDate.today;

    // Today's completion
    const todayCompletions = (completions[today] || []).filter(id =>
      activeHabits.some(h => h.id === id)
    );
    const todayPct = calculatePercentage(todayCompletions.length, activeHabits.length);

    // Yesterday's completion
    const yesterday = new Date(today + 'T00:00:00');
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    const yesterdayCompletions = (completions[yesterdayStr] || []).filter(id =>
      activeHabits.some(h => h.id === id)
    );
    const yesterdayPct = calculatePercentage(yesterdayCompletions.length, activeHabits.length);
    const todayDelta = calculateDelta(todayPct, yesterdayPct);

    // Week summary
    const weekDates = getWeekDates(selectedWeekStart);
    const weekSummary = calculateWeekSummary(weekDates, habits, completions);

    // Previous week
    const prevWeekStart = new Date(selectedWeekStart + 'T00:00:00');
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekStartStr = `${prevWeekStart.getFullYear()}-${String(prevWeekStart.getMonth() + 1).padStart(2, '0')}-${String(prevWeekStart.getDate()).padStart(2, '0')}`;
    const prevWeekDates = getWeekDates(prevWeekStartStr);
    const prevWeekSummary = calculateWeekSummary(prevWeekDates, habits, completions);
    const weekDelta = calculateDelta(weekSummary.overallPercentage, prevWeekSummary.overallPercentage);

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

    // Previous month
    const prevMonth = currentDate.month === 0 ? 11 : currentDate.month - 1;
    const prevYear = currentDate.month === 0 ? currentDate.year - 1 : currentDate.year;
    const prevMonthDates = getMonthDates(prevYear, prevMonth);
    let prevMonthPct = 0;
    if (prevMonthDates.length > 0) {
      const prevMonthCompleted = prevMonthDates.reduce((acc, date) => {
        const dayCompletions = completions[date] || [];
        return acc + dayCompletions.filter(id => activeHabits.some(h => h.id === id)).length;
      }, 0);
      prevMonthPct = calculatePercentage(prevMonthCompleted, activeHabits.length * prevMonthDates.length);
    }
    const monthDelta = calculateDelta(monthPct, prevMonthPct);

    // Streak
    let streak = 0;
    const currentDateObj = parseLocalDate(today);
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(currentDateObj);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      const completed = (completions[dateStr] || []).filter(id =>
        activeHabits.some(h => h.id === id)
      ).length;
      if (completed === activeHabits.length) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    const bestStreak = calculateBestStreak(habits, completions);

    // Habit score
    const habitScore = calculateHabitScore(weekSummary.overallPercentage, monthPct, streak, bestStreak);
    const grade = getGradeFromScore(habitScore);

    // Sparklines
    const todaySparkline = calculateNDaySparkline(habits, completions, today, 7);
    const weekSparkline = calculateNDaySparkline(habits, completions, selectedWeekStart, 7);
    const monthSparkline = calculateNDaySparkline(habits, completions, today, 30);

    return {
      todayPct,
      todayDelta,
      todaySparkline,
      weekPct: weekSummary.overallPercentage,
      weekDelta,
      weekSparkline,
      monthPct,
      monthDelta,
      monthSparkline,
      streak,
      bestStreak,
      habitScore,
      grade,
    };
  }, [habits, completions, currentDate, selectedWeekStart]);

  const StatCard = ({ label, value, delta, sparkline }: any) => (
    <div className="flex flex-col gap-1">
      <div className="text-xs uppercase tracking-widest opacity-60" style={{ color: '#22AA44' }}>
        {label}
      </div>
      <div className="flex items-center justify-between">
        <div
          className="text-lg font-bold"
          style={{ color: '#39FF14' }}
        >
          {value}
        </div>
        {delta && (
          <div
            className="text-xs font-bold ml-2"
            style={{
              color: delta.direction === 'up' ? '#43BF4D' : delta.direction === 'down' ? '#CD4246' : '#22AA44',
            }}
          >
            {delta.formatted}
          </div>
        )}
      </div>
      {sparkline && (
        <div style={{ marginTop: '2px' }}>
          <Sparkline data={sparkline} width={50} height={16} color="#39FF14" />
        </div>
      )}
    </div>
  );

  return (
    <div
      className="grid gap-2"
      style={{
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
      }}
    >
      <StatCard label="TODAY" value={`${data.todayPct}%`} delta={data.todayDelta} sparkline={data.todaySparkline} />
      <StatCard label="STREAK" value={data.streak} sparkline={null} />
      <StatCard label="BEST" value={data.bestStreak} sparkline={null} />
      <StatCard label="WEEK" value={`${data.weekPct}%`} delta={data.weekDelta} sparkline={data.weekSparkline} />
      <StatCard label="MONTH" value={`${data.monthPct}%`} delta={data.monthDelta} sparkline={data.monthSparkline} />
      <StatCard label="SCORE" value={data.habitScore} sparkline={null} />
      <StatCard
        label="RANK"
        value={data.grade.grade}
        delta={null}
        sparkline={null}
      />
    </div>
  );
};
