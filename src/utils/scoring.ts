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
 * Calculate month summary from habits and completions
 */
export const calculateMonthSummary = (year, month, habits, completions, getMonthDates, getMonthWeeks, calculateWeekSummary) => {
  const monthDates = getMonthDates(year, month);
  const weekStarts = getMonthWeeks(year, month);

  const summary = {
    month,
    year,
    weeks: [],
    perHabit: {},
    perCategory: {},
    overallCompleted: 0,
    overallTotal: 0,
    overallPercentage: 0,
  };

  // Calculate per-habit stats
  const activeHabits = habits.filter(h => h.isActive);

  activeHabits.forEach(habit => {
    const completedDays = monthDates.filter(date => {
      const dayCompletions = completions[date] || [];
      return dayCompletions.includes(habit.id);
    }).length;

    summary.perHabit[habit.id] = {
      completedDays,
      totalDays: monthDates.length,
      percentage: calculatePercentage(completedDays, monthDates.length),
    };

    summary.overallCompleted += completedDays;
  });

  summary.overallTotal = activeHabits.length * monthDates.length;

  // Calculate per-category stats
  const categoryMap = {};
  activeHabits.forEach(habit => {
    if (!categoryMap[habit.category]) {
      categoryMap[habit.category] = { completed: 0, total: 0 };
    }
    categoryMap[habit.category].total += monthDates.length;
    categoryMap[habit.category].completed += summary.perHabit[habit.id].completedDays;
  });

  Object.keys(categoryMap).forEach(cat => {
    summary.perCategory[cat] = {
      completed: categoryMap[cat].completed,
      total: categoryMap[cat].total,
      percentage: calculatePercentage(categoryMap[cat].completed, categoryMap[cat].total),
    };
  });

  summary.overallPercentage = calculatePercentage(summary.overallCompleted, summary.overallTotal);

  return summary;
};
