import { getMonthDates } from '../../utils/dates';
import { calculatePercentage } from '../../utils/scoring';
import { CATEGORIES } from '../../utils/constants';

export const CategoryBreakdown = ({ habits, completions, currentDate }) => {
  const monthDates = getMonthDates(currentDate.year, currentDate.month);
  const activeHabits = habits.filter(h => h.isActive);

  // Calculate per-category stats
  const categoryStats = {};
  Object.keys(CATEGORIES).forEach(category => {
    categoryStats[category] = { completed: 0, total: 0 };
  });

  activeHabits.forEach(habit => {
    monthDates.forEach(date => {
      categoryStats[habit.category].total += 1;
      const dayCompletions = completions[date] || [];
      if (dayCompletions.includes(habit.id)) {
        categoryStats[habit.category].completed += 1;
      }
    });
  });

  return (
    <div className="space-y-3">
      {Object.keys(CATEGORIES).map(category => {
        if (categoryStats[category].total === 0) return null;

        const percentage = calculatePercentage(categoryStats[category].completed, categoryStats[category].total);

        return (
          <div key={category} className="space-y-1">
            <div className="flex justify-between text-caption text-text-muted uppercase">
              <span>{CATEGORIES[category].label}</span>
              <span className="font-mono">{percentage}%</span>
            </div>
            <div className="w-full bg-bg-input rounded-sm h-2 overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: CATEGORIES[category].hex,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
