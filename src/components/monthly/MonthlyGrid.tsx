import { memo, useMemo, useState } from 'react';
import { getMonthDates } from '../../utils/dates';
import { parseLocalDate } from '../../utils/timezone';
import { CATEGORIES } from '../../utils/constants';
import { HabitEditModal } from '../shared/HabitEditModal';

const MonthlyGridContent = ({ habits, completions, toggleHabitCompletion, currentDate, updateHabit, removeHabit, theme = 'matrix' }) => {
  const monthDates = getMonthDates(currentDate.year, currentDate.month);
  const activeHabits = habits.filter((h: any) => h.isActive);
  const today = parseLocalDate(currentDate.today);
  const [lastBurst, setLastBurst] = useState<string | null>(null);
  const [editingHabit, setEditingHabit] = useState<any>(null);

  const accentColor = theme === 'jarvis' ? '#00FFFF' : '#39FF14';

  // Calculate daily completion percentages
  const dailyPercentages = useMemo(() => {
    if (activeHabits.length === 0) return [];

    return monthDates.map(date => {
      const dayCompletions = completions[date] || [];
      const completed = activeHabits.filter(h => dayCompletions.includes(h.id)).length;
      const percentage = Math.round((completed / activeHabits.length) * 100);
      return { date, percentage };
    });
  }, [activeHabits, completions, monthDates]);

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return accentColor;
    if (percentage >= 50) return '#FFD700';
    return '#FF4444';
  };

  const handleToggle = (habitId: string, date: string) => {
    const dayCompletions = completions[date] || [];
    const wasCompleted = dayCompletions.includes(habitId);

    // Trigger burst animation only when completing (not un-completing)
    if (!wasCompleted) {
      setLastBurst(`${habitId}-${date}`);
      setTimeout(() => setLastBurst(null), 400);
    }

    toggleHabitCompletion(habitId, date);
  };

  return (
    <>
    <div className="overflow-x-auto">
      <table className="w-full text-mono-sm">
        <thead>
          <tr className="border-b border-border-subtle">
            <th className="text-left py-2 px-2 text-text-muted sticky left-0 bg-surface w-24">HABIT</th>
            {monthDates.map((date) => {
              const cellDate = parseLocalDate(date);
              const isToday = date === currentDate.today;
              return (
                <th
                  key={date}
                  className="text-center py-2 px-1 text-xs min-w-8 transition"
                  style={{
                    backgroundColor: isToday ? 'rgba(67, 191, 77, 0.1)' : 'transparent',
                    borderBottom: isToday ? '2px solid var(--accent-3)' : '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ color: isToday ? 'var(--text-accent)' : 'var(--text-muted)' }}>
                    {cellDate.getDate()}
                  </div>
                </th>
              );
            })}
          </tr>
          {dailyPercentages.length > 0 && (
            <tr className="border-b border-border-subtle">
              <th className="text-left py-2 px-2 sticky left-0 bg-surface w-24"></th>
              {dailyPercentages.map(({ date, percentage }) => {
                const percentColor = getPercentageColor(percentage);
                const isToday = date === currentDate.today;
                return (
                  <th
                    key={`pct-${date}`}
                    className="text-center py-1 px-1 text-xs min-w-8 font-bold font-mono transition"
                    style={{
                      backgroundColor: isToday ? `${percentColor}15` : `${percentColor}08`,
                      color: percentColor,
                      borderBottom: isToday ? `2px solid ${percentColor}` : `1px solid ${percentColor}40`,
                      fontSize: '10px',
                    }}
                  >
                    {percentage}%
                  </th>
                );
              })}
            </tr>
          )}
        </thead>
        <tbody>
          {activeHabits.map((habit: any) => {
            const categoryColor = CATEGORIES[habit.category].hex;
            return (
              <tr key={habit.id} className="border-b border-border-subtle hover:bg-bg-elevated hover:bg-opacity-30 transition">
                <td className="text-left py-2 px-2 text-text-primary sticky left-0 bg-surface text-body flex items-center gap-2">
                  <span className="truncate flex-1 text-xs">{habit.name}</span>
                  <button
                    onClick={() => setEditingHabit(habit)}
                    className="flex-shrink-0 px-1.5 py-0.5 rounded text-xs font-bold uppercase transition"
                    style={{
                      backgroundColor: 'rgba(57, 255, 20, 0.1)',
                      color: '#39FF14',
                      border: '1px solid rgba(57, 255, 20, 0.5)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(57, 255, 20, 0.2)';
                      e.currentTarget.style.boxShadow = '0 0 8px rgba(57, 255, 20, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(57, 255, 20, 0.1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    E
                  </button>
                </td>
                {monthDates.map((date) => {
                  const dayCompletions = completions[date] || [];
                  const isCompleted = dayCompletions.includes(habit.id);
                  const isPastOrToday = date <= currentDate.today;
                  const isToday = date === currentDate.today;

                  return (
                    <td
                      key={`${habit.id}-${date}`}
                      className="text-center py-2 px-1"
                      style={{
                        backgroundColor: isToday ? 'rgba(67, 191, 77, 0.05)' : 'transparent',
                      }}
                    >
                      <button
                        onClick={() => isPastOrToday && handleToggle(habit.id, date)}
                        disabled={!isPastOrToday}
                        className={`inline-flex items-center justify-center w-5 h-5 rounded-sm transition-all duration-150 font-mono-sm text-xs ${
                          lastBurst === `${habit.id}-${date}` ? 'animate-burst' : ''
                        }`}
                        style={{
                          backgroundColor: isCompleted ? categoryColor : 'transparent',
                          border: `1px solid ${isCompleted ? categoryColor : 'rgba(57, 255, 20, 0.5)'}`,
                          color: isCompleted ? '#fff' : 'var(--text-muted)',
                          opacity: isPastOrToday ? 1 : 0.4,
                          cursor: isPastOrToday ? 'pointer' : 'not-allowed',
                        }}
                      >
                        {isCompleted ? '✓' : ''}
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {editingHabit && (
      <HabitEditModal
        habit={editingHabit}
        isOpen={!!editingHabit}
        onClose={() => setEditingHabit(null)}
        onSave={updateHabit}
        onDelete={removeHabit}
      />
    )}
    </>
  );
};

export const MonthlyGrid = memo(MonthlyGridContent);
