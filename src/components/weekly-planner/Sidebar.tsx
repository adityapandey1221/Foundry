import { useState } from 'react';
import type { WeekPlan } from '../../hooks/useWeeklyPlan';
import { formatWeekRange } from '../../utils/dates';

interface SidebarProps {
  weekStart: string;
  weekPlan: WeekPlan;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToggleHabit: (id: string) => void;
  onAddHabit: (title: string) => void;
  onDeleteHabit: (id: string) => void;
  onToggleTodo: (id: string) => void;
  onAddTodo: (title: string) => void;
  onDeleteTodo: (id: string) => void;
}

export const Sidebar = ({
  weekStart,
  weekPlan,
  onPreviousWeek,
  onNextWeek,
  onToggleHabit,
  onAddHabit,
  onDeleteHabit,
  onToggleTodo,
  onAddTodo,
  onDeleteTodo
}: SidebarProps) => {
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newTodoTitle, setNewTodoTitle] = useState('');

  const weekRange = formatWeekRange(weekStart);
  const completedHabits = weekPlan.weeklyHabits.filter(h => h.completed).length;
  const habitPercentage = weekPlan.weeklyHabits.length > 0
    ? Math.round((completedHabits / weekPlan.weeklyHabits.length) * 100)
    : 0;

  const completedTodos = weekPlan.weeklyTodos.filter(t => t.completed).length;
  const todoPercentage = weekPlan.weeklyTodos.length > 0
    ? Math.round((completedTodos / weekPlan.weeklyTodos.length) * 100)
    : 0;

  const getProgressColor = (percentage: number) => {
    if (percentage > 70) return '#39FF14'; // terminal green
    if (percentage >= 40) return '#FFD700'; // yellow
    return '#FF6B6B'; // red
  };

  return (
    <div className="w-48 flex flex-col gap-4 overflow-y-auto pr-2 flex-shrink-0">
      {/* Week Navigation */}
      <div className="panel p-4">
        <div className="flex items-center justify-between mb-2">
          <button onClick={onPreviousWeek} className="btn btn-ghost text-sm p-1">◄</button>
          <h2 className="text-sm font-bold text-center flex-1">{weekRange}</h2>
          <button onClick={onNextWeek} className="btn btn-ghost text-sm p-1">►</button>
        </div>
      </div>

      {/* Weekly Habits */}
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-header-title text-xs">Weekly Habits</h3>
        </div>
        <div className="panel-content space-y-2">
          {weekPlan.weeklyHabits.map(habit => (
            <div key={habit.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={habit.completed}
                onChange={() => onToggleHabit(habit.id)}
                className="cursor-pointer w-4 h-4 accent-green-500"
              />
              <span
                className={`text-xs flex-1 ${
                  habit.completed ? 'line-through opacity-50' : ''
                }`}
                style={{ color: '#39FF14' }}
              >
                {habit.title}
              </span>
              <button
                onClick={() => onDeleteHabit(habit.id)}
                className="btn btn-ghost text-xs px-1 py-0 opacity-0 hover:opacity-100"
              >
                ×
              </button>
            </div>
          ))}
          <input
            type="text"
            value={newHabitTitle}
            onChange={(e) => setNewHabitTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newHabitTitle.trim()) {
                onAddHabit(newHabitTitle);
                setNewHabitTitle('');
              }
            }}
            placeholder="Add habit..."
            className="w-full text-xs"
          />
        </div>
        <div className="px-4 py-2 border-t border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full transition-all"
                style={{ width: `${habitPercentage}%`, backgroundColor: getProgressColor(habitPercentage) }}
              />
            </div>
            <span className="text-xs" style={{ color: '#39FF14' }}>
              {habitPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Weekly Todos */}
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-header-title text-xs">Weekly To-Do</h3>
        </div>
        <div className="panel-content space-y-2">
          {weekPlan.weeklyTodos.map(todo => (
            <div key={todo.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggleTodo(todo.id)}
                className="cursor-pointer w-4 h-4 accent-green-500"
              />
              <span
                className={`text-xs flex-1 ${
                  todo.completed ? 'line-through opacity-50' : ''
                }`}
                style={{ color: '#39FF14' }}
              >
                {todo.title}
              </span>
              <button
                onClick={() => onDeleteTodo(todo.id)}
                className="btn btn-ghost text-xs px-1 py-0 opacity-0 hover:opacity-100"
              >
                ×
              </button>
            </div>
          ))}
          <input
            type="text"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newTodoTitle.trim()) {
                onAddTodo(newTodoTitle);
                setNewTodoTitle('');
              }
            }}
            placeholder="Add to-do..."
            className="w-full text-xs"
          />
        </div>
        <div className="px-4 py-2 border-t border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full transition-all"
                style={{ width: `${todoPercentage}%`, backgroundColor: getProgressColor(todoPercentage) }}
              />
            </div>
            <span className="text-xs" style={{ color: '#39FF14' }}>
              {todoPercentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
