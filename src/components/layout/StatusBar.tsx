import { useMemo } from 'react';

export const StatusBar = ({ date, habits, completions }) => {
  const dateObj = new Date(date.today);
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
    const currentDate = new Date(date.today);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(currentDate);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-display text-text-accent">
            STACK
            <span className="ml-2 font-light text-text-secondary">{monthName}</span>
          </h1>
          <p className="text-caption text-text-muted uppercase tracking-widest mt-1">
            — HABIT TRACKER —
          </p>
        </div>

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
