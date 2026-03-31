import {
  getDayName,
  getWeekDates,
  getWeekStart,
  getWeekEnd,
  getMonthDates,
  formatDate,
  getCurrentMonth,
} from '../../../utils/dates';
import { formatLocalDate, parseLocalDate } from '../../../utils/timezone';

export type HabitHudHabit = {
  id: string;
  name: string;
  category: string;
  isActive: boolean;
  sortOrder: number;
};

export type HabitHudCompletionMap = Record<string, string[]>;

export type HabitHudCurrentDate = {
  today: string;
  weekStart: string;
  weekEnd: string;
  month: number;
  year: number;
};

export type HabitHudChecklistRow = {
  habitId: string;
  name: string;
  category: string;
  isCompleted: boolean;
};

export type HabitHudSummary = {
  completedCount: number;
  activeCount: number;
  completionPct: number;
};

export type HabitHudWeeklyPoint = {
  date: string;
  label: string;
  completionPct: number;
  completedCount: number;
  activeCount: number;
  isToday: boolean;
};

export type HabitHudHeatmapCell = {
  date: string;
  weekdayIndex: number;
  weekIndex: number;
  completedCount: number;
  activeCount: number;
  completionPct: number;
  intensityBand: number;
  isToday: boolean;
};

export type HabitHudHeatmapWeek = {
  weekStart: string;
  weekLabel: string;
  days: HabitHudHeatmapCell[];
};

export type HabitHudMonthlyChecklistDay = {
  day: number;
  date: string;
  completionPct: number;
  isToday: boolean;
};

export type HabitHudMonthlyChecklistRow = {
  habitId: string;
  name: string;
  category: string;
  completions: Record<string, boolean>; // date -> isCompleted
};

export type HabitHudMonthlyPoint = {
  day: number;
  date: string;
  label: string;
  completionPct: number;
  completedCount: number;
  activeCount: number;
};

export type HabitHudData = {
  checklistRows: HabitHudChecklistRow[];
  todaySummary: HabitHudSummary;
  weeklyProgressSeries: HabitHudWeeklyPoint[];
  comparisonWeeklyProgressSeries: HabitHudWeeklyPoint[];
  monthlyProgressSeries: HabitHudMonthlyPoint[];
  heatmapWeeks: HabitHudHeatmapWeek[];
  monthlyChecklistDays: HabitHudMonthlyChecklistDay[];
  monthlyChecklistRows: HabitHudMonthlyChecklistRow[];
};

/**
 * Shift an ISO date string by N days
 */
export const shiftIsoDate = (dateStr: string, days: number): string => {
  const date = parseLocalDate(dateStr);
  date.setDate(date.getDate() + days);
  return formatLocalDate(date);
};

const countCompletedHabits = (
  habits: HabitHudHabit[],
  completions: HabitHudCompletionMap,
  date: string
) => {
  const activeHabits = habits.filter((habit) => habit.isActive);
  const completedIds = new Set(completions[date] ?? []);
  const completedCount = activeHabits.reduce(
    (count, habit) => count + (completedIds.has(habit.id) ? 1 : 0),
    0
  );

  return {
    activeCount: activeHabits.length,
    completedCount,
  };
};

const toPct = (completedCount: number, activeCount: number) => {
  if (activeCount <= 0) return 0;
  return Math.round((completedCount / activeCount) * 100);
};

const getIntensityBand = (pct: number) => {
  if (pct === 0) return 0;
  if (pct < 25) return 1;
  if (pct < 50) return 2;
  if (pct < 75) return 3;
  return 4;
};

/**
 * Format a week start date as "Mar 23" or similar
 */
const weekLabel = (dateStr: string): string => {
  return formatDate(dateStr, 'short');
};

export const buildHabitHudData = (
  habits: HabitHudHabit[],
  completions: HabitHudCompletionMap,
  currentDate: HabitHudCurrentDate
): HabitHudData => {
  const activeHabits = habits.filter((habit) => habit.isActive);

  const checklistRows: HabitHudChecklistRow[] = activeHabits.map((habit) => ({
    habitId: habit.id,
    name: habit.name,
    category: habit.category,
    isCompleted: (completions[currentDate.today] ?? []).includes(habit.id),
  }));

  const todayStats = countCompletedHabits(habits, completions, currentDate.today);
  const todaySummary: HabitHudSummary = {
    ...todayStats,
    completionPct: toPct(todayStats.completedCount, todayStats.activeCount),
  };

  const currentWeekDates = getWeekDates(currentDate.weekStart);
  const weeklyProgressSeries: HabitHudWeeklyPoint[] = currentWeekDates.map((date) => {
    const stats = countCompletedHabits(habits, completions, date);
    return {
      date,
      label: getDayName(date).toUpperCase(),
      completionPct: toPct(stats.completedCount, stats.activeCount),
      completedCount: stats.completedCount,
      activeCount: stats.activeCount,
      isToday: date === currentDate.today,
    };
  });

  const comparisonWeekStart = shiftIsoDate(currentDate.weekStart, -7);
  const comparisonWeekDates = getWeekDates(comparisonWeekStart);
  const comparisonWeeklyProgressSeries: HabitHudWeeklyPoint[] = comparisonWeekDates.map((date) => {
    const stats = countCompletedHabits(habits, completions, date);
    return {
      date,
      label: getDayName(date).toUpperCase(),
      completionPct: toPct(stats.completedCount, stats.activeCount),
      completedCount: stats.completedCount,
      activeCount: stats.activeCount,
      isToday: false,
    };
  });

  // Generate daily progress for the current month
  const monthDates = getMonthDates(currentDate.year, currentDate.month);

  const monthlyProgressSeries: HabitHudMonthlyPoint[] = monthDates.map((date) => {
    const stats = countCompletedHabits(habits, completions, date);
    const completionPct = toPct(stats.completedCount, stats.activeCount);
    const dateObj = parseLocalDate(date);

    return {
      day: dateObj.getDate(),
      date,
      label: dateObj.getDate().toString(),
      completionPct,
      completedCount: stats.completedCount,
      activeCount: stats.activeCount,
    };
  });

  // Generate weeks for the current calendar year (Jan 1 - Dec 31)
  const year = currentDate.year;
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;
  const heatmapWeeks: HabitHudHeatmapWeek[] = [];
  let currentWeekStart = yearStart;

  while (currentWeekStart <= yearEnd) {
    const weekDates = getWeekDates(currentWeekStart);
    const days = weekDates
      .filter((date) => date >= yearStart && date <= yearEnd)
      .map((date, weekdayIndex) => {
        const stats = countCompletedHabits(habits, completions, date);
        const completionPct = toPct(stats.completedCount, stats.activeCount);
        return {
          date,
          weekdayIndex,
          weekIndex: heatmapWeeks.length,
          completedCount: stats.completedCount,
          activeCount: stats.activeCount,
          completionPct,
          intensityBand: getIntensityBand(completionPct),
          isToday: date === currentDate.today,
        };
      });

    if (days.length > 0) {
      heatmapWeeks.push({
        weekStart: currentWeekStart,
        weekLabel: weekLabel(currentWeekStart),
        days,
      });
    }

    currentWeekStart = shiftIsoDate(currentWeekStart, 7);
  }

  // Generate monthly checklist (reuse monthDates)
  const monthlyChecklistDays: HabitHudMonthlyChecklistDay[] = monthDates.map((date) => {
    const stats = countCompletedHabits(habits, completions, date);
    const completionPct = toPct(stats.completedCount, stats.activeCount);
    const dateObj = parseLocalDate(date);

    return {
      day: dateObj.getDate(),
      date,
      completionPct,
      isToday: date === currentDate.today,
    };
  });

  const monthlyChecklistRows: HabitHudMonthlyChecklistRow[] = activeHabits.map((habit) => {
    const completions_map: Record<string, boolean> = {};
    monthDates.forEach((date) => {
      completions_map[date] = (completions[date] ?? []).includes(habit.id);
    });

    return {
      habitId: habit.id,
      name: habit.name,
      category: habit.category,
      completions: completions_map,
    };
  });

  return {
    checklistRows,
    todaySummary,
    weeklyProgressSeries,
    comparisonWeeklyProgressSeries,
    monthlyProgressSeries,
    heatmapWeeks,
    monthlyChecklistDays,
    monthlyChecklistRows,
  };
};

