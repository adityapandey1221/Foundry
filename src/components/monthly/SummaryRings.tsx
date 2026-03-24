import { getMonthDates } from '../../utils/dates';
import { calculatePercentage } from '../../utils/scoring';

export const SummaryRings = ({ habits, completions, currentDate }) => {
  const monthDates = getMonthDates(currentDate.year, currentDate.month);
  const activeHabits = habits.filter(h => h.isActive);

  const totalCompleted = Object.values(completions).reduce((sum, dayCompletes: any) => {
    return sum + dayCompletes.filter((id: any) => activeHabits.find((h: any) => h.id === id)).length;
  }, 0);

  const totalPossible = activeHabits.length * monthDates.length;
  const percentage = calculatePercentage(totalCompleted, totalPossible);

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative w-32 h-32 mb-4">
        <svg className="w-full h-full" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle cx="60" cy="60" r="55" fill="none" stroke="#404040" strokeWidth="8" />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r="55"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="8"
            strokeDasharray={`${(percentage / 100) * 2 * Math.PI * 55} ${2 * Math.PI * 55}`}
            strokeDashoffset="0"
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dasharray 0.4s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <p className="text-white text-xl font-bold font-mono">{String(totalCompleted)}</p>
          <p className="text-neutral-400 text-sm font-mono">/ {String(totalPossible)}</p>
        </div>
      </div>
      <p className="text-white text-2xl font-bold font-mono">{percentage}%</p>
      <p className="text-neutral-400 text-xs uppercase tracking-wider">Completion</p>
    </div>
  );
};
