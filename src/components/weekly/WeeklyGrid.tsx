import { getDayName } from '../../utils/dates';
import { CATEGORIES } from '../../utils/constants';
import { parseLocalDate } from '../../utils/timezone';

export const WeeklyGrid = ({ habits, completions, weekDates, toggleHabitCompletion, currentDate }) => {
  const activeHabits = habits.filter((h: any) => h.isActive);
  const today = parseLocalDate(currentDate.today);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-mono-sm">
        <thead>
          <tr className="border-b border-border-subtle">
            <th className="text-left py-2 px-2 text-text-muted sticky left-0 bg-surface w-32">HABIT</th>
            {weekDates.map((date) => {
              const cellDate = parseLocalDate(date);
              const isToday = date === currentDate.today;
              return (
                <th
                  key={date}
                  className="text-center py-2 px-2 text-xs min-w-12 transition"
                  style={{
                    backgroundColor: isToday ? 'rgba(67, 191, 77, 0.1)' : 'transparent',
                    borderBottom: isToday ? '2px solid var(--accent-3)' : '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ color: isToday ? 'var(--text-accent)' : 'var(--text-muted)' }}>
                    {getDayName(date).toUpperCase()}
                  </div>
                  <div style={{ color: isToday ? 'var(--text-accent)' : 'var(--text-muted)' }}>
                    {cellDate.getDate()}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {activeHabits.map((habit: any) => {
            const categoryColor = CATEGORIES[habit.category].hex;
            return (
              <tr key={habit.id} className="border-b border-border-subtle hover:bg-bg-elevated hover:bg-opacity-30 transition">
                <td className="text-left py-2 px-2 text-text-primary sticky left-0 bg-surface text-body truncate">
                  {habit.name}
                </td>
                {weekDates.map((date) => {
                  const dayCompletions = completions[date] || [];
                  const isCompleted = dayCompletions.includes(habit.id);
                  const cellDate = parseLocalDate(date);
                  const isFuture = cellDate > today;
                  const isToday = date === currentDate.today;

                  return (
                    <td
                      key={`${habit.id}-${date}`}
                      className="text-center py-2 px-2"
                      style={{
                        backgroundColor: isToday ? 'rgba(67, 191, 77, 0.05)' : 'transparent',
                      }}
                    >
                      <button
                        onClick={() => !isFuture && toggleHabitCompletion(habit.id, date)}
                        disabled={isFuture}
                        className="inline-flex items-center justify-center w-6 h-6 rounded-sm transition-all duration-150 font-mono-sm"
                        style={{
                          backgroundColor: isCompleted ? categoryColor : 'transparent',
                          border: `1.5px solid ${isCompleted ? categoryColor : 'var(--border-subtle)'}`,
                          color: isCompleted ? '#fff' : 'var(--text-muted)',
                          opacity: isFuture ? 0.4 : 1,
                          cursor: isFuture ? 'not-allowed' : 'pointer',
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
  );
};
