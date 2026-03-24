import { getMonthDates } from '../../utils/dates';
import { calculatePercentage, getPercentageColor } from '../../utils/scoring';
import { CATEGORIES } from '../../utils/constants';

export const ProgressBars = ({ habits, completions, currentDate }) => {
  const monthDates = getMonthDates(currentDate.year, currentDate.month);
  const activeHabits = habits.filter(h => h.isActive);

  return (
    <div className="space-y-3">
      {activeHabits.map(habit => {
        const completedDays = monthDates.filter(date => {
          const dayCompletions = completions[date] || [];
          return dayCompletions.includes(habit.id);
        }).length;

        const percentage = calculatePercentage(completedDays, monthDates.length);
        const color = getPercentageColor(percentage);

        return (
          <div key={habit.id} className="space-y-1">
            <p className="text-caption text-text-primary truncate">{habit.name}</p>
            <div className="w-full bg-bg-input rounded-sm h-2 overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: color,
                }}
              />
            </div>
            <p className="text-mono-sm text-text-muted text-right">{percentage}%</p>
          </div>
        );
      })}
    </div>
  );
};
