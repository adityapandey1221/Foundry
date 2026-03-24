import { calculatePercentage } from '../../utils/scoring';

export const SummaryRings = ({ habits, completions, weekDates }) => {
  const activeHabits = habits.filter(h => h.isActive);

  const totalCompleted = weekDates.reduce((sum, date) => {
    const dayCompletes = completions[date] || [];
    return sum + dayCompletes.filter((id: any) => activeHabits.find((h: any) => h.id === id)).length;
  }, 0);

  const totalPossible = activeHabits.length * weekDates.length;
  const percentage = calculatePercentage(totalCompleted, totalPossible);

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative w-32 h-32 mb-4">
        <svg className="w-full h-full" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle cx="60" cy="60" r="55" fill="none" stroke="#22AA44" strokeWidth="8" opacity="0.3" />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r="55"
            fill="none"
            stroke="#39FF14"
            strokeWidth="8"
            strokeDasharray={`${(percentage / 100) * 2 * Math.PI * 55} ${2 * Math.PI * 55}`}
            strokeDashoffset="0"
            transform="rotate(-90 60 60)"
            style={{
              transition: 'stroke-dasharray 0.4s ease-out',
              filter: 'drop-shadow(0 0 8px rgba(57, 255, 20, 0.5))'
            }}
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
