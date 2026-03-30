/**
 * Calculate completion percentage for a set of days
 */
export const calculatePercentage = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

/**
 * Get color for a percentage value (0-100)
 */
export const getPercentageColor = (percentage) => {
  if (percentage >= 80) return '#43BF4D'; // Green
  if (percentage >= 60) return '#F7C948'; // Yellow
  if (percentage >= 40) return '#E866A0'; // Pink/Orange
  return '#CD4246'; // Red
};

/**
 * Calculate week summary from habits and completions
 */
export const calculateWeekSummary = (weekDates, habits, completions) => {
  const summary = {
    weekStart: weekDates[0],
    weekEnd: weekDates[6],
    dayDates: weekDates,
    perHabit: {},
    overallPercentage: 0,
    totalCompleted: 0,
    totalPossible: 0,
  };

  const activeHabits = habits.filter(h => h.isActive);
  summary.totalPossible = activeHabits.length * 7;

  activeHabits.forEach(habit => {
    const completedDays = weekDates.filter(date => {
      const dayCompletions = completions[date] || [];
      return dayCompletions.includes(habit.id);
    }).length;

    summary.perHabit[habit.id] = {
      completedDays,
      percentage: calculatePercentage(completedDays, 7),
    };

    summary.totalCompleted += completedDays;
  });

  summary.overallPercentage = calculatePercentage(summary.totalCompleted, summary.totalPossible);

  return summary;
};

/**
 * Calculate the best (longest) streak from all completion history
 */
export const calculateBestStreak = (habits, completions) => {
  const activeHabits = habits.filter(h => h.isActive);
  if (activeHabits.length === 0) return 0;

  const sortedDates = Object.keys(completions).sort().reverse();
  let bestStreak = 0;
  let currentStreak = 0;

  for (const dateStr of sortedDates) {
    const dayCompletions = completions[dateStr] || [];
    const completed = dayCompletions.filter(id => activeHabits.some(h => h.id === id)).length;

    if (completed === activeHabits.length) {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return bestStreak;
};

/**
 * Calculate N-day sparkline data (daily completion percentages)
 */
export const calculateNDaySparkline = (habits, completions, endDate, n = 7, habitId = null) => {
  const activeHabits = habitId
    ? habits.filter(h => h.isActive && h.id === habitId)
    : habits.filter(h => h.isActive);

  if (activeHabits.length === 0) return Array(n).fill(0);

  const data: number[] = [];
  const endDateObj = new Date(endDate + 'T00:00:00');

  for (let i = n - 1; i >= 0; i--) {
    const checkDate = new Date(endDateObj);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;

    const dayCompletions = completions[dateStr] || [];
    const completed = dayCompletions.filter(id => activeHabits.some(h => h.id === id)).length;
    const percentage = Math.round((completed / activeHabits.length) * 100);

    data.push(percentage);
  }

  return data;
};

/**
 * Calculate delta between two values with direction and formatting
 */
export const calculateDelta = (current, previous) => {
  if (previous === 0) return { value: 0, direction: 'flat', formatted: '—' };

  const delta = current - previous;
  const pctChange = Math.round((delta / Math.max(previous, 1)) * 100);
  const direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  const sign = delta > 0 ? '+' : '';

  return {
    value: delta,
    direction,
    formatted: `${sign}${pctChange}%`,
  };
};
