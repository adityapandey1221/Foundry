import { useState } from 'react';
import { useWeeklyPlan } from '../../hooks/useWeeklyPlan';
import { getMonday, getWeekDates } from '../../utils/dates';
import { Sidebar } from './Sidebar';
import { DayColumn } from './DayColumn';

export const WeeklyPlannerView = ({ currentDate }) => {
  // Get Monday of the current week
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today);
  monday.setDate(diff);
  const weekStartStr = monday.toISOString().split('T')[0];

  const [selectedWeekStart, setSelectedWeekStart] = useState(weekStartStr);

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
    <div className="flex h-full gap-4 p-4 bg-black overflow-hidden">
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
            isToday={day.date === today.toISOString().split('T')[0]}
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
  );
};
