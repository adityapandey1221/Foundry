import { getDayName } from '../../utils/dates';
import { calculatePercentage, getPercentageColor } from '../../utils/scoring';

export const WeeklyCompletionBars = ({ habits, completions, weekDates }) => {
  const activeHabits = habits.filter(h => h.isActive);

  return (
    <div className="space-y-3">
      {weekDates.map(date => {
        const dayCompletions = completions[date] || [];
        const completed = dayCompletions.filter(id => activeHabits.find(h => h.id === id)).length;
        const percentage = calculatePercentage(completed, activeHabits.length);
        const color = getPercentageColor(percentage);

        return (
          <div key={date} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-body uppercase font-display text-text-primary">{getDayName(date)}</span>
              <span className="text-mono-lg font-bold" style={{ color }}>{percentage}%</span>
            </div>
            <div className="w-full bg-bg-input rounded-sm h-3 overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
