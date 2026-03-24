import { useState, useEffect } from 'react';
import { useWeeklyPlan } from '../../hooks/useWeeklyPlan';
import { getWeekDates } from '../../utils/dates';
import { getMondayOfWeek, formatLocalDate, getTodayLocal, getUserTimezone, parseLocalDate } from '../../utils/timezone';
import { Sidebar } from './Sidebar';
import { DayColumn } from './DayColumn';

export const WeeklyPlannerView = ({ currentDate }) => {
  // Use currentDate.today as single source of truth (passed from App)
  const todayStr = currentDate.today;
  const todayDate = parseLocalDate(todayStr);
  const monday = getMondayOfWeek(todayDate);
  const weekStartStr = formatLocalDate(monday);

  const [selectedWeekStart, setSelectedWeekStart] = useState(weekStartStr);
  const [debugTime, setDebugTime] = useState(new Date().toLocaleString());

  useEffect(() => {
    const interval = setInterval(() => {
      setDebugTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const {
    weekPlan,
    loading,
    addDayTask,
    toggleDayTask,
    deleteDayTask,
    addDayEvent,
    deleteDayEvent,
    updateDayFocus,
    toggleWeeklyHabit,
    addWeeklyHabit,
    deleteWeeklyHabit,
    toggleWeeklyTodo,
    addWeeklyTodo,
    deleteWeeklyTodo
  } = useWeeklyPlan(selectedWeekStart);

  const handlePreviousWeek = () => {
    const date = new Date(selectedWeekStart);
    date.setDate(date.getDate() - 7);
    const newWeekStart = date.toISOString().split('T')[0];
    setSelectedWeekStart(newWeekStart);
  };

  const handleNextWeek = () => {
    const date = new Date(selectedWeekStart);
    date.setDate(date.getDate() + 7);
    const newWeekStart = date.toISOString().split('T')[0];
    setSelectedWeekStart(newWeekStart);
  };

  if (loading || !weekPlan) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  const weekDates = getWeekDates(selectedWeekStart);
  const dayNames = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  return (
    <div className="flex flex-col h-full bg-black overflow-hidden">
      {/* Debug display */}
      <div className="px-4 py-2 border-b border-neutral-800 text-xs" style={{ color: '#39FF14' }}>
        <div>Current Time: {debugTime} | Timezone: {getUserTimezone()}</div>
        <div>App thinks today is: {todayStr} | Week starts: {weekStartStr}</div>
      </div>

      <div className="flex flex-1 gap-4 p-4 overflow-hidden">
      <Sidebar
        weekStart={selectedWeekStart}
        weekPlan={weekPlan}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        onToggleHabit={toggleWeeklyHabit}
        onAddHabit={addWeeklyHabit}
        onDeleteHabit={deleteWeeklyHabit}
        onToggleTodo={toggleWeeklyTodo}
        onAddTodo={addWeeklyTodo}
        onDeleteTodo={deleteWeeklyTodo}
      />

      <div className="flex-1 flex gap-2 overflow-x-auto pb-4">
        {weekPlan.days.map((day, dayIndex) => (
          <DayColumn
            key={day.date}
            day={day}
            dayIndex={dayIndex}
            dayName={dayNames[dayIndex]}
            isToday={day.date === todayStr}
            onAddTask={(title) => addDayTask(dayIndex, title)}
            onToggleTask={(taskId) => toggleDayTask(dayIndex, taskId)}
            onDeleteTask={(taskId) => deleteDayTask(dayIndex, taskId)}
            onAddEvent={(time, title) => addDayEvent(dayIndex, time, title)}
            onDeleteEvent={(eventId) => deleteDayEvent(dayIndex, eventId)}
            onUpdateFocus={(focus) => updateDayFocus(dayIndex, focus)}
          />
        ))}
      </div>
      </div>
    </div>
  );
};
