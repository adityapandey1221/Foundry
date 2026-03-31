import React, { useState } from 'react';
import { InlineEventForm } from './InlineEventForm';
import { InlineTaskForm } from './InlineTaskForm';
import { VideoExactButton } from './VideoExactButton';
import { VideoExactInput } from './VideoExactInput';
import { VideoExactConfirm } from './VideoExactConfirm';

export type DayTask = {
  id: string;
  title: string;
  completed: boolean;
};

export type DayEvent = {
  id: string;
  time: string;
  title: string;
};

export type WeeklyPlannerDayColumnProps = {
  date: string;
  dayName: string;
  isToday: boolean;
  events: DayEvent[];
  tasks: DayTask[];
  completedCount: number;
  totalHabits: number;
  onAddTask: (title: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string, newTitle: string) => void;
  onAddEvent: (time: string, title: string) => void;
  onDeleteEvent: (eventId: string) => void;
  onEditEvent: (eventId: string, newTime: string, newTitle: string) => void;
};

export const WeeklyPlannerDayColumn: React.FC<WeeklyPlannerDayColumnProps> = ({
  date,
  dayName,
  isToday,
  events,
  tasks,
  completedCount,
  totalHabits,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onAddEvent,
  onDeleteEvent,
  onEditEvent,
}) => {
  const [showEventForm, setShowEventForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editEventTime, setEditEventTime] = useState('');
  const [editEventTitle, setEditEventTitle] = useState('');
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  const completionPct = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;
  const dateNum = new Date(`${date}T00:00:00`).getDate();

  const handleStartEditTask = (task: DayTask) => {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
  };

  const handleSaveEditTask = () => {
    if (editingTaskId && editTaskTitle.trim()) {
      onEditTask(editingTaskId, editTaskTitle.trim());
      setEditingTaskId(null);
    }
  };

  const handleStartEditEvent = (event: DayEvent) => {
    setEditingEventId(event.id);
    setEditEventTime(event.time);
    setEditEventTitle(event.title);
  };

  const handleSaveEditEvent = () => {
    if (editingEventId && editEventTitle.trim() && editEventTime.trim()) {
      onEditEvent(editingEventId, editEventTime, editEventTitle.trim());
      setEditingEventId(null);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flex: '1 1 160px',
        minWidth: '160px',
        width: '160px',
        padding: '8px',
        borderRight: '1px solid rgba(255, 255, 255, 0.06)',
        background: isToday ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
        overflow: 'auto',
        minHeight: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '8px',
          paddingBottom: '6px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div>
          <div
            style={{
              color: isToday ? 'rgba(255, 255, 255, 0.88)' : 'rgba(255, 255, 255, 0.68)',
              fontSize: '12px',
              letterSpacing: '0.08em',
              fontWeight: 500,
            }}
          >
            {dayName} {dateNum}
          </div>
          {isToday && (
            <div
              style={{
                fontSize: '7px',
                color: 'rgba(255, 255, 255, 0.38)',
                letterSpacing: '0.08em',
              }}
            >
              TODAY
            </div>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: 'rgba(255, 255, 255, 0.48)',
            fontSize: '7px',
            letterSpacing: '0.08em',
          }}
        >
          <span>✓</span>
          <span>{completionPct}%</span>
        </div>
      </div>

      {/* Events Section */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <div
          style={{
            color: 'rgba(255, 255, 255, 0.38)',
            fontSize: '10px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}
        >
          EVENTS
        </div>

        {events.map((event) =>
          editingEventId === event.id ? (
            <div
              key={event.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '4px',
                borderRadius: '2px',
              }}
            >
              <div style={{ display: 'flex', gap: '4px' }}>
                <div style={{ flex: '0 0 50px' }}>
                  <VideoExactInput
                    value={editEventTime}
                    onChange={setEditEventTime}
                    placeholder="Time"
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <VideoExactInput
                    value={editEventTitle}
                    onChange={setEditEventTitle}
                    placeholder="Title"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '2px' }}>
                <div style={{ flex: 1 }}>
                  <VideoExactButton
                    variant="filled"
                    size="sm"
                    onClick={handleSaveEditEvent}
                  >
                    SAVE
                  </VideoExactButton>
                </div>
                <div style={{ flex: 1 }}>
                  <VideoExactButton
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingEventId(null)}
                  >
                    CANCEL
                  </VideoExactButton>
                </div>
              </div>
            </div>
          ) : (
            <div
              key={event.id}
              style={{
                display: 'flex',
                gap: '4px',
                alignItems: 'flex-start',
                padding: '4px 6px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '2px',
                cursor: 'pointer',
                transition: 'border-color 150ms ease-out',
              }}
              onClick={() => handleStartEditEvent(event)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
              }}
            >
              <div
                style={{
                  flex: '0 0 auto',
                  color: 'rgba(255, 255, 255, 0.48)',
                  fontSize: '10px',
                  letterSpacing: '0.08em',
                  whiteSpace: 'nowrap',
                }}
              >
                {event.time}
              </div>
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: '10px',
                  color: 'rgba(255, 255, 255, 0.68)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {event.title}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletingEventId(event.id);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.26)',
                  cursor: 'pointer',
                  fontSize: '7px',
                  padding: '0 2px',
                }}
              >
                ✕
              </button>
            </div>
          )
        )}

        {!showEventForm ? (
          <VideoExactButton
            variant="text"
            size="sm"
            onClick={() => setShowEventForm(true)}
          >
            + EVENT
          </VideoExactButton>
        ) : (
          <InlineEventForm
            onAddEvent={(time, title) => {
              onAddEvent(time, title);
            }}
            onClose={() => setShowEventForm(false)}
          />
        )}
      </div>

      {/* Tasks Section */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <div
          style={{
            color: 'rgba(255, 255, 255, 0.38)',
            fontSize: '7px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}
        >
          TASKS
        </div>

        {tasks.map((task) =>
          editingTaskId === task.id ? (
            <div
              key={task.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '4px',
                borderRadius: '2px',
              }}
            >
              <VideoExactInput
                value={editTaskTitle}
                onChange={setEditTaskTitle}
                placeholder="Task title"
                autoFocus
              />
              <div style={{ display: 'flex', gap: '2px' }}>
                <div style={{ flex: 1 }}>
                  <VideoExactButton
                    variant="filled"
                    size="sm"
                    onClick={handleSaveEditTask}
                  >
                    SAVE
                  </VideoExactButton>
                </div>
                <div style={{ flex: 1 }}>
                  <VideoExactButton
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingTaskId(null)}
                  >
                    CANCEL
                  </VideoExactButton>
                </div>
              </div>
            </div>
          ) : (
            <div
              key={task.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 6px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '2px',
                cursor: 'pointer',
                transition: 'border-color 150ms ease-out',
              }}
              onClick={() => handleStartEditTask(task)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
              }}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggleTask(task.id)}
                style={{
                  width: '12px',
                  height: '12px',
                  cursor: 'pointer',
                  accentColor: 'rgba(255, 255, 255, 0.6)',
                  flex: '0 0 auto',
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <span
                style={{
                  flex: 1,
                  fontSize: '10px',
                  color: task.completed ? 'rgba(255, 255, 255, 0.34)' : 'rgba(255, 255, 255, 0.68)',
                  textDecoration: task.completed ? 'line-through' : 'none',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {task.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletingTaskId(task.id);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.26)',
                  cursor: 'pointer',
                  fontSize: '7px',
                  padding: '0 2px',
                }}
              >
                ✕
              </button>
            </div>
          )
        )}

        {!showTaskForm ? (
          <VideoExactButton
            variant="text"
            size="sm"
            onClick={() => setShowTaskForm(true)}
          >
            + TASK
          </VideoExactButton>
        ) : (
          <InlineTaskForm
            onAddTask={(title) => {
              onAddTask(title);
            }}
            onClose={() => setShowTaskForm(false)}
          />
        )}
      </div>

      {/* Delete Confirmations */}
      {deletingTaskId && (
        <VideoExactConfirm
          message="Delete task?"
          isOpen={!!deletingTaskId}
          onConfirm={() => {
            onDeleteTask(deletingTaskId);
            setDeletingTaskId(null);
          }}
          onCancel={() => setDeletingTaskId(null)}
          confirmLabel="DELETE"
          cancelLabel="CANCEL"
        />
      )}

      {deletingEventId && (
        <VideoExactConfirm
          message="Delete event?"
          isOpen={!!deletingEventId}
          onConfirm={() => {
            onDeleteEvent(deletingEventId);
            setDeletingEventId(null);
          }}
          onCancel={() => setDeletingEventId(null)}
          confirmLabel="DELETE"
          cancelLabel="CANCEL"
        />
      )}
    </div>
  );
};
