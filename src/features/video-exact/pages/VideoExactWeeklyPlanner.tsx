import React, { useState, useMemo } from 'react';
import { useWeeklyPlan } from '../../../hooks/useWeeklyPlan';
import { useCurrentDate } from '../../../hooks/useCurrentDate';
import { getWeekStart, getWeekDates } from '../../../utils/dates';
import { useHabitStore } from '../../../hooks/useHabitStore';
import { WeeklyPlannerSidebar } from '../components/WeeklyPlannerSidebar';
import { WeeklyPlannerDayColumn } from '../components/WeeklyPlannerDayColumn';

const dayNames = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export const VideoExactWeeklyPlanner: React.FC = () => {
  try {
    const currentDate = useCurrentDate();
    const habitStore = useHabitStore();

    const defaultWeekStart = currentDate?.today ? getWeekStart(currentDate.today) : '2026-03-30';
    const [selectedWeekStart, setSelectedWeekStart] = useState(defaultWeekStart);

    const {
      weekPlan,
      addDayTask,
      toggleDayTask,
      deleteDayTask,
      editDayTask,
      addDayEvent,
      deleteDayEvent,
      editDayEvent,
      toggleWeeklyHabit,
      addWeeklyHabit,
      deleteWeeklyHabit,
      toggleWeeklyTodo,
      addWeeklyTodo,
      deleteWeeklyTodo,
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

    const weekDates = getWeekDates(selectedWeekStart);

    // Calculate completion stats per day
    const dayStats = useMemo(() => {
      const activeHabits = habitStore.habits.filter((h) => h.isActive);
      return weekDates.map((date) => {
        const completions = habitStore.completions[date] || [];
        const completedCount = activeHabits.filter((h) => completions.includes(h.id)).length;
        return {
          date,
          completedCount,
          totalHabits: activeHabits.length,
        };
      });
    }, [weekDates, habitStore.habits, habitStore.completions]);

    if (!weekPlan) {
      return (
        <div style={{ color: '#0f0', padding: '40px', fontSize: '18px' }}>
          Loading week plan...
        </div>
      );
    }

    return (
      <div
        style={{
          background: '#020202',
          color: 'rgba(255, 255, 255, 0.88)',
          fontFamily:
            '"IBM Plex Mono", "Space Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
          height: '100%',
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {/* Sidebar */}
        <WeeklyPlannerSidebar
          weekStart={selectedWeekStart}
          onPreviousWeek={handlePreviousWeek}
          onNextWeek={handleNextWeek}
          weeklyHabits={weekPlan.weeklyHabits}
          weeklyTodos={weekPlan.weeklyTodos}
          onToggleHabit={toggleWeeklyHabit}
          onAddHabit={addWeeklyHabit}
          onDeleteHabit={deleteWeeklyHabit}
          onToggleTodo={toggleWeeklyTodo}
          onAddTodo={addWeeklyTodo}
          onDeleteTodo={deleteWeeklyTodo}
        />

        {/* Day Columns */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            minWidth: 0,
            overflow: 'auto',
          }}
        >
          {weekPlan.days.map((day, dayIndex) => {
            const stats = dayStats[dayIndex];
            return (
              <WeeklyPlannerDayColumn
                key={day.date}
                date={day.date}
                dayName={dayNames[dayIndex]}
                isToday={day.date === currentDate?.today}
                events={day.events}
                tasks={day.tasks}
                completedCount={stats?.completedCount || 0}
                totalHabits={stats?.totalHabits || 0}
                onAddTask={(title) => addDayTask(dayIndex, title)}
                onToggleTask={(taskId) => toggleDayTask(dayIndex, taskId)}
                onDeleteTask={(taskId) => deleteDayTask(dayIndex, taskId)}
                onEditTask={(taskId, newTitle) => editDayTask(dayIndex, taskId, newTitle)}
                onAddEvent={(time, title) => addDayEvent(dayIndex, time, title)}
                onDeleteEvent={(eventId) => deleteDayEvent(dayIndex, eventId)}
                onEditEvent={(eventId, newTime, newTitle) =>
                  editDayEvent(dayIndex, eventId, newTime, newTitle)
                }
              />
            );
          })}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Planner error:', error);
    return (
      <div style={{ color: '#f00', padding: '40px', fontSize: '18px', fontWeight: 'bold' }}>
        ERROR: {String(error)}
        <div style={{ fontSize: '12px', marginTop: '20px', color: '#fff' }}>
          Check console for details
        </div>
      </div>
    );
  }
};
