import React, { useState } from 'react';
import { VideoExactInput } from './VideoExactInput';
import { VideoExactButton } from './VideoExactButton';
import { VideoExactConfirm } from './VideoExactConfirm';
import { formatLocalDate, parseLocalDate } from '../../../utils/timezone';

export type WeeklyPlannerSidebarProps = {
  weekStart: string;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  weeklyHabits: Array<{ id: string; title: string; completed: boolean }>;
  weeklyTodos: Array<{ id: string; title: string; completed: boolean }>;
  onToggleHabit: (habitId: string) => void;
  onAddHabit: (title: string) => void;
  onDeleteHabit: (habitId: string) => void;
  onToggleTodo: (todoId: string) => void;
  onAddTodo: (title: string) => void;
  onDeleteTodo: (todoId: string) => void;
};

export const WeeklyPlannerSidebar: React.FC<WeeklyPlannerSidebarProps> = ({
  weekStart,
  onPreviousWeek,
  onNextWeek,
  weeklyHabits,
  weeklyTodos,
  onToggleHabit,
  onAddHabit,
  onDeleteHabit,
  onToggleTodo,
  onAddTodo,
  onDeleteTodo,
}) => {
  const [addingHabit, setAddingHabit] = useState(false);
  const [habitInput, setHabitInput] = useState('');
  const [addingTodo, setAddingTodo] = useState(false);
  const [todoInput, setTodoInput] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingType, setDeletingType] = useState<'habit' | 'todo' | null>(null);

  const weekStartDate = parseLocalDate(weekStart);
  const weekEnd = new Date(weekStartDate);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const weekLabel = `${formatLocalDate(weekStartDate).toUpperCase()} - ${formatLocalDate(weekEnd).toUpperCase()}`;

  const handleAddHabit = () => {
    if (habitInput.trim()) {
      onAddHabit(habitInput.trim());
      setHabitInput('');
      setAddingHabit(false);
    }
  };

  const handleAddTodo = () => {
    if (todoInput.trim()) {
      onAddTodo(todoInput.trim());
      setTodoInput('');
      setAddingTodo(false);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingId && deletingType) {
      if (deletingType === 'habit') {
        onDeleteHabit(deletingId);
      } else {
        onDeleteTodo(deletingId);
      }
      setDeletingId(null);
      setDeletingType(null);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '8px',
        width: '200px',
        minWidth: '200px',
        maxWidth: '200px',
        height: '100%',
        overflow: 'auto',
        borderRight: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* Week Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          justifyContent: 'space-between',
        }}
      >
        <VideoExactButton variant="text" size="sm" onClick={onPreviousWeek}>
          &lt;
        </VideoExactButton>
        <div
          style={{
            flex: 1,
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.68)',
            fontSize: '10px',
            letterSpacing: '0.08em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {weekLabel}
        </div>
        <VideoExactButton variant="text" size="sm" onClick={onNextWeek}>
          &gt;
        </VideoExactButton>
      </div>

      {/* Weekly Habits */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div
          style={{
            color: 'rgba(255, 255, 255, 0.48)',
            fontSize: '11px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}
        >
          HABITS
        </div>

        {weeklyHabits.length === 0 ? (
          <div
            style={{
              color: 'rgba(255, 255, 255, 0.26)',
              fontSize: '8px',
            }}
          >
            None
          </div>
        ) : (
          weeklyHabits.map((habit) => (
            <div
              key={habit.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 6px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '2px',
              }}
            >
              <input
                type="checkbox"
                checked={habit.completed}
                onChange={() => onToggleHabit(habit.id)}
                style={{
                  width: '12px',
                  height: '12px',
                  cursor: 'pointer',
                  accentColor: 'rgba(255, 255, 255, 0.6)',
                }}
              />
              <span
                style={{
                  flex: 1,
                  fontSize: '10px',
                  color: habit.completed ? 'rgba(255, 255, 255, 0.34)' : 'rgba(255, 255, 255, 0.68)',
                  textDecoration: habit.completed ? 'line-through' : 'none',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {habit.title}
              </span>
              <button
                onClick={() => {
                  setDeletingId(habit.id);
                  setDeletingType('habit');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.34)',
                  cursor: 'pointer',
                  fontSize: '8px',
                  padding: '0 2px',
                }}
              >
                ✕
              </button>
            </div>
          ))
        )}

        {!addingHabit ? (
          <VideoExactButton
            variant="outline"
            size="sm"
            onClick={() => setAddingHabit(true)}
          >
            + HABIT
          </VideoExactButton>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <VideoExactInput
              value={habitInput}
              onChange={setHabitInput}
              placeholder="Habit name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddHabit();
                if (e.key === 'Escape') setAddingHabit(false);
              }}
            />
            <div style={{ display: 'flex', gap: '4px' }}>
              <div style={{ flex: 1 }}>
                <VideoExactButton
                  variant="filled"
                  size="sm"
                  onClick={handleAddHabit}
                >
                  ADD
                </VideoExactButton>
              </div>
              <div style={{ flex: 1 }}>
                <VideoExactButton
                  variant="outline"
                  size="sm"
                  onClick={() => setAddingHabit(false)}
                >
                  CANCEL
                </VideoExactButton>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Weekly Todos */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div
          style={{
            color: 'rgba(255, 255, 255, 0.48)',
            fontSize: '8px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}
        >
          TODOS
        </div>

        {weeklyTodos.length === 0 ? (
          <div
            style={{
              color: 'rgba(255, 255, 255, 0.26)',
              fontSize: '8px',
            }}
          >
            None
          </div>
        ) : (
          weeklyTodos.map((todo) => (
            <div
              key={todo.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 6px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '2px',
              }}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggleTodo(todo.id)}
                style={{
                  width: '12px',
                  height: '12px',
                  cursor: 'pointer',
                  accentColor: 'rgba(255, 255, 255, 0.6)',
                }}
              />
              <span
                style={{
                  flex: 1,
                  fontSize: '8px',
                  color: todo.completed ? 'rgba(255, 255, 255, 0.34)' : 'rgba(255, 255, 255, 0.68)',
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {todo.title}
              </span>
              <button
                onClick={() => {
                  setDeletingId(todo.id);
                  setDeletingType('todo');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.34)',
                  cursor: 'pointer',
                  fontSize: '8px',
                  padding: '0 2px',
                }}
              >
                ✕
              </button>
            </div>
          ))
        )}

        {!addingTodo ? (
          <VideoExactButton
            variant="outline"
            size="sm"
            onClick={() => setAddingTodo(true)}
          >
            + TODO
          </VideoExactButton>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <VideoExactInput
              value={todoInput}
              onChange={setTodoInput}
              placeholder="Todo"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTodo();
                if (e.key === 'Escape') setAddingTodo(false);
              }}
            />
            <div style={{ display: 'flex', gap: '4px' }}>
              <div style={{ flex: 1 }}>
                <VideoExactButton
                  variant="filled"
                  size="sm"
                  onClick={handleAddTodo}
                >
                  ADD
                </VideoExactButton>
              </div>
              <div style={{ flex: 1 }}>
                <VideoExactButton
                  variant="outline"
                  size="sm"
                  onClick={() => setAddingTodo(false)}
                >
                  CANCEL
                </VideoExactButton>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deletingId && deletingType && (
        <VideoExactConfirm
          message={
            deletingType === 'habit' ? 'Delete habit?' : 'Delete todo?'
          }
          isOpen={!!deletingId}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setDeletingId(null);
            setDeletingType(null);
          }}
          confirmLabel="DELETE"
          cancelLabel="CANCEL"
        />
      )}
    </div>
  );
};
