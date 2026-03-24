import { getMonthDates } from '../../utils/dates';
import { calculatePercentage, getPercentageColor, calculateNDaySparkline } from '../../utils/scoring';
import { CATEGORIES } from '../../utils/constants';
import { Sparkline } from '../shared/Sparkline';

export const ProgressBars = ({ habits, completions, currentDate }) => {
  const monthDates = getMonthDates(currentDate.year, currentDate.month);
  const activeHabits = habits.filter(h => h.isActive);

  return (
    <div className="space-y-2.5">
      {activeHabits.map(habit => {
        const completedDays = monthDates.filter(date => {
          const dayCompletions = completions[date] || [];
          return dayCompletions.includes(habit.id);
        }).length;

        const percentage = calculatePercentage(completedDays, monthDates.length);
        const color = getPercentageColor(percentage);
        const sparklineData = calculateNDaySparkline(habits, completions, currentDate.today, 30, habit.id);

        return (
          <div key={habit.id} className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-caption text-text-primary truncate flex-1">{habit.name}</p>
              <div className="flex items-center gap-2">
                <p className="text-mono-sm text-text-muted">{percentage}%</p>
                <Sparkline data={sparklineData} width={40} height={14} color={color} showDot={false} />
              </div>
            </div>
            <div className="w-full bg-bg-input rounded-sm h-1.5 overflow-hidden">
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
