import { useMemo } from 'react';
import { parseLocalDate, formatLocalDate } from '../../utils/timezone';

export const StatusBar = ({ date, habits, completions }) => {
  const dateObj = parseLocalDate(date.today);
  const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });

  // Calculate today's completion count
  const todayCompletions = useMemo(() => {
    const activeHabits = habits.filter((h: any) => h.isActive);
    const completedToday = (completions[date.today] || []).filter((id: string) =>
      activeHabits.some((h: any) => h.id === id)
    ).length;
    return { completed: completedToday, total: activeHabits.length };
  }, [habits, completions, date.today]);

  // Calculate current streak
  const currentStreak = useMemo(() => {
    const activeHabits = habits.filter((h: any) => h.isActive);
    if (activeHabits.length === 0) return 0;

    let streak = 0;
    const currentDate = parseLocalDate(date.today);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(currentDate);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = formatLocalDate(checkDate);

      const completed = (completions[dateStr] || []).filter((id: string) =>
        activeHabits.some((h: any) => h.id === id)
      ).length;

      if (completed === activeHabits.length) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  }, [habits, completions, date.today]);

  return (
    <div className="bg-surface border-b border-border-subtle px-6 py-3">
      <div className="relative flex items-center justify-between">
        <div>
          <p className="font-light text-3xl text-text-secondary">
            {monthName}
          </p>
          <p className="text-caption text-text-muted uppercase tracking-widest text-center mt-1">
            — HABIT TRACKER —
          </p>
        </div>
        <h1 className="text-6xl text-text-accent absolute left-1/2 transform -translate-x-1/2 top-0 font-black" style={{ fontFamily: 'Impact, Arial Black, sans-serif', WebkitTextStroke: '2px rgba(57, 255, 20, 0.5)', textShadow: '0 0 15px rgba(57, 255, 20, 0.4)' }}>
          GOTHAM
        </h1>

        <div className="flex items-center gap-8">
          {/* Today's completion */}
          <div className="text-center">
            <div className="text-mono-lg text-text-accent font-bold">
              {todayCompletions.completed}/{todayCompletions.total}
            </div>
            <p className="text-caption text-text-muted uppercase tracking-wide">TODAY</p>
          </div>

          {/* Streak counter */}
          <div className="text-center">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: currentStreak > 0 ? 'var(--accent-5)' : 'var(--border-default)',
                  boxShadow: currentStreak > 0 ? 'var(--glow-sm)' : 'none',
                }}
              />
              <div className="text-mono-lg text-text-accent font-bold">
                {currentStreak}
              </div>
            </div>
            <p className="text-caption text-text-muted uppercase tracking-wide">STREAK</p>
          </div>

          {/* Current date */}
          <div className="font-mono text-mono text-text-secondary">
            {dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
};
