import { useState } from 'react';
import { CATEGORIES } from '../../utils/constants';

export const HabitManager = ({ habits, onAddHabit, onRemoveHabit, onUpdateHabit }) => {
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('productivity');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      onAddHabit(newHabitName, newHabitCategory);
      setNewHabitName('');
      setNewHabitCategory('productivity');
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Habit list */}
      <div className="max-h-80 overflow-y-auto space-y-2">
        {habits.filter((h: any) => h.isActive).map((habit: any) => (
          <div
            key={habit.id}
            className="flex items-center justify-between p-3 bg-bg-elevated border border-border-subtle rounded-sm hover:border-border-default transition"
          >
            <div className="flex-1">
              <div className="text-body text-text-primary">{habit.name}</div>
              <div className="text-caption text-text-muted">
                {CATEGORIES[habit.category]?.label || habit.category}
              </div>
            </div>
            <button
              onClick={() => onRemoveHabit(habit.id)}
              className="ml-3 px-3 py-1 text-caption bg-status-danger hover:bg-opacity-80 text-white rounded-sm transition"
            >
              REMOVE
            </button>
          </div>
        ))}

        {habits.filter((h: any) => h.isActive).length === 0 && (
          <div className="text-text-muted text-body text-center py-4">
            No active habits yet
          </div>
        )}
      </div>

      {/* Add habit form */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-2 text-body text-accent-3 border border-accent-3 hover:bg-accent-1 hover:bg-opacity-20 rounded-sm transition uppercase font-display"
        >
          + ADD HABIT
        </button>
      )}

      {isAdding && (
        <div className="p-3 bg-bg-elevated border border-border-default rounded-sm space-y-3">
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="Habit name..."
            className="w-full px-2 py-2 rounded-sm border focus:outline-none transition"
            style={{
              backgroundColor: 'var(--bg-input)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-3)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddHabit();
              if (e.key === 'Escape') setIsAdding(false);
            }}
            autoFocus
          />

          <select
            value={newHabitCategory}
            onChange={(e) => setNewHabitCategory(e.target.value)}
            className="w-full px-2 py-2 rounded-sm border focus:outline-none transition"
            style={{
              backgroundColor: 'var(--bg-input)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-3)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            {Object.entries(CATEGORIES).map(([key, cat]: any) => (
              <option key={key} value={key} style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                {cat.label}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={handleAddHabit}
              className="flex-1 py-2 text-body bg-accent-3 text-bg-void hover:bg-accent-4 rounded-sm transition uppercase font-display font-bold"
            >
              ADD
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="flex-1 py-2 text-body bg-border-subtle hover:bg-border-default text-text-primary rounded-sm transition uppercase font-display"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
