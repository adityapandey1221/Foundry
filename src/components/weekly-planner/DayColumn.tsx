import { useState } from 'react';
import type { DayPlan } from '../../hooks/useWeeklyPlan';
import { parseLocalDate } from '../../utils/timezone';

interface DayColumnProps {
  day: DayPlan;
  dayIndex: number;
  dayName: string;
  isToday: boolean;
  onAddTask: (title: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onAddEvent: (time: string, title: string) => void;
  onDeleteEvent: (eventId: string) => void;
}

const DAY_COLORS = [
  '#FFB6C1', // Monday: light pink
  '#FFD4A3', // Tuesday: light peach
  '#FFFFE0', // Wednesday: light yellow
  '#E6D5FA', // Thursday: light lavender
  '#FFB3D9', // Friday: light pink
  '#B3E5B3', // Saturday: light mint
  '#ADD8E6', // Sunday: light blue
];

export const DayColumn = ({
  day,
  dayIndex,
  dayName,
  isToday,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onAddEvent,
  onDeleteEvent
}: DayColumnProps) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventTitle, setNewEventTitle] = useState('');

  const bgColor = DAY_COLORS[dayIndex];
  const completedTasks = day.tasks.filter(t => t.completed).length;

  return (
    <div className="flex flex-col gap-2 w-40 flex-shrink-0">
      {/* Day Header */}
      <div
        className={`p-3 rounded-md border ${isToday ? 'border-2 border-green-500 shadow-lg' : 'border border-neutral-800'}`}
        style={{ backgroundColor: `${bgColor}30` }}
      >
        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: '#39FF14' }}>
          {dayName}
        </div>
        {isToday && <div className="text-xs" style={{ color: '#39FF14' }}>TODAY</div>}
        <div className="text-xs text-neutral-400">
          {parseLocalDate(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Events Section */}
      <div className="card-lg p-3">
        <div className="text-xs font-bold mb-2 uppercase" style={{ color: '#39FF14' }}>events</div>
        <div className="space-y-1">
          {day.events.length === 0 ? (
            <div className="text-xs opacity-50" style={{ color: '#39FF14' }}>no events</div>
          ) : (
            day.events.map(event => (
              <div key={event.id} className="flex items-start gap-2 group">
                <div
                  className="w-1 h-4 rounded-full flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: event.color || '#39FF14' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs" style={{ color: '#39FF14' }}>
                    <span className="font-bold">{event.time}</span> — {event.title}
                  </div>
                </div>
                <button
                  onClick={() => onDeleteEvent(event.id)}
                  className="btn btn-ghost text-xs px-1 py-0 opacity-0 group-hover:opacity-100 flex-shrink-0"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
        <input
          type="text"
          value={newEventTime}
          onChange={(e) => setNewEventTime(e.target.value)}
          placeholder="Time"
          className="w-full text-xs mt-2 mb-1"
        />
        <input
          type="text"
          value={newEventTitle}
          onChange={(e) => setNewEventTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newEventTime && newEventTitle) {
              onAddEvent(newEventTime, newEventTitle);
              setNewEventTime('');
              setNewEventTitle('');
            }
          }}
          placeholder="Event"
          className="w-full text-xs"
        />
      </div>

      {/* Tasks Section */}
      <div className="card-lg p-3 flex-1 flex flex-col">
        <div className="text-xs font-bold mb-2 uppercase" style={{ color: '#39FF14' }}>tasks</div>
        <div className="space-y-1 flex-1 overflow-y-auto">
          {day.tasks.map(task => (
            <div key={task.id} className="flex items-start gap-2 group">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggleTask(task.id)}
                className="mt-0.5 w-3 h-3 cursor-pointer accent-green-500 flex-shrink-0"
              />
              <span
                className={`text-xs flex-1 ${
                  task.completed ? 'line-through opacity-50' : ''
                }`}
                style={{ color: '#39FF14' }}
              >
                {task.title}
              </span>
              <button
                onClick={() => onDeleteTask(task.id)}
                className="btn btn-ghost text-xs px-1 py-0 opacity-0 group-hover:opacity-100 flex-shrink-0"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newTaskTitle.trim()) {
              onAddTask(newTaskTitle);
              setNewTaskTitle('');
            }
          }}
          placeholder="Add task..."
          className="w-full text-xs mt-2"
        />
        <div className="flex gap-1 mt-2 justify-center">
          {day.tasks.map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: i < completedTasks ? '#39FF14' : '#404040'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
