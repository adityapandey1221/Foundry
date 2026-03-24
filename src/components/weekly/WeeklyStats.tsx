import { calculatePercentage } from '../../utils/scoring';

export const WeeklyStats = ({ habits, completions, weekDates }) => {
  const activeHabits = habits.filter(h => h.isActive);

  let totalCompleted = 0;
  weekDates.forEach(date => {
    const dayCompletions = completions[date] || [];
    dayCompletions.forEach(id => {
      if (activeHabits.find(h => h.id === id)) {
        totalCompleted += 1;
      }
    });
  });

  const totalPossible = activeHabits.length * 7;
  const percentage = calculatePercentage(totalCompleted, totalPossible);

  return (
    <div className="space-y-4">
      <div className="border-b border-border-subtle pb-4">
        <p className="text-caption text-text-muted uppercase tracking-wider mb-2">COMPLETED</p>
        <p className="font-mono-lg text-text-accent">{totalCompleted}</p>
      </div>

      <div className="border-b border-border-subtle pb-4">
        <p className="text-caption text-text-muted uppercase tracking-wider mb-2">TOTAL</p>
        <p className="font-mono-lg text-text-secondary">{totalPossible}</p>
      </div>

      <div>
        <p className="text-caption text-text-muted uppercase tracking-wider mb-2">COMPLETION %</p>
        <p className="font-mono-lg text-text-accent">{percentage}%</p>
      </div>
    </div>
  );
};
