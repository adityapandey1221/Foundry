import { useState, useEffect } from 'react';
import { generateId } from '../utils/ids';

// Type definitions
export interface DayEvent {
  id: string;
  time: string;
  title: string;
  color?: string;
}

export interface DayTask {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface DayPlan {
  date: string;
  events: DayEvent[];
  tasks: DayTask[];
}

export interface WeeklyHabit {
  id: string;
  title: string;
  completed: boolean;
}

export interface WeeklyTodo {
  id: string;
  title: string;
  completed: boolean;
}

export interface WeekPlan {
  weekStart: string;
  days: DayPlan[];
  weeklyHabits: WeeklyHabit[];
  weeklyTodos: WeeklyTodo[];
}


export const useWeeklyPlan = (weekStart: string) => {
  const [weekPlan, setWeekPlan] = useState<WeekPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage
    const key = `weekPlan:${weekStart}`;
    const stored = localStorage.getItem(key);

    if (stored) {
      setWeekPlan(JSON.parse(stored));
    } else {
      // Create empty week plan
      const emptyPlan: WeekPlan = {
        weekStart,
        days: Array(7).fill(null).map((_, i) => {
          const date = new Date(weekStart);
          date.setDate(date.getDate() + i);
          return {
            date: date.toISOString().split('T')[0],
            events: [],
            tasks: []
          };
        }),
        weeklyHabits: [],
        weeklyTodos: []
      };
      setWeekPlan(emptyPlan);
      localStorage.setItem(key, JSON.stringify(emptyPlan));
    }

    setLoading(false);
  }, [weekStart]);

  const updateWeekPlan = (updates: Partial<WeekPlan>) => {
    setWeekPlan(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem(`weekPlan:${weekStart}`, JSON.stringify(updated));
      return updated;
    });
  };

  const updateDay = (dayIndex: number, dayPlan: DayPlan) => {
    setWeekPlan(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        days: prev.days.map((d, i) => i === dayIndex ? dayPlan : d)
      };
      localStorage.setItem(`weekPlan:${weekStart}`, JSON.stringify(updated));
      return updated;
    });
  };

  const addDayTask = (dayIndex: number, title: string) => {
    const day = weekPlan?.days[dayIndex];
    if (!day) return;

    const newTask: DayTask = {
      id: generateId(),
      title,
      completed: false,
      order: day.tasks.length
    };

    const updated = {
      ...day,
      tasks: [...day.tasks, newTask]
    };
    updateDay(dayIndex, updated);
  };

  const toggleDayTask = (dayIndex: number, taskId: string) => {
    const day = weekPlan?.days[dayIndex];
    if (!day) return;

    const updated = {
      ...day,
      tasks: day.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    };
    updateDay(dayIndex, updated);
  };

  const deleteDayTask = (dayIndex: number, taskId: string) => {
    const day = weekPlan?.days[dayIndex];
    if (!day) return;

    const updated = {
      ...day,
      tasks: day.tasks.filter(t => t.id !== taskId)
    };
    updateDay(dayIndex, updated);
  };

  const sortEventsByTime = (events: DayEvent[]): DayEvent[] => {
    return [...events].sort((a, b) => {
      // Parse time strings to comparable format (HH:MM in 24-hour format)
      const parseTime = (timeStr: string): number => {
        // Remove extra spaces and convert to lowercase
        const normalized = timeStr.trim().toLowerCase();

        // Match formats like "9:30 AM", "9:30AM", "14:30", "9:30", "9 AM"
        const match = normalized.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
        if (!match) return 0;

        let hours = parseInt(match[1], 10);
        const minutes = match[2] ? parseInt(match[2], 10) : 0;
        const meridiem = match[3];

        // Convert to 24-hour format
        if (meridiem === 'pm' && hours !== 12) {
          hours += 12;
        } else if (meridiem === 'am' && hours === 12) {
          hours = 0;
        }

        return hours * 60 + minutes;
      };

      return parseTime(a.time) - parseTime(b.time);
    });
  };

  const addDayEvent = (dayIndex: number, time: string, title: string) => {
    const day = weekPlan?.days[dayIndex];
    if (!day) return;

    const newEvent: DayEvent = {
      id: generateId(),
      time,
      title
    };

    const updated = {
      ...day,
      events: sortEventsByTime([...day.events, newEvent])
    };
    updateDay(dayIndex, updated);
  };

  const deleteDayEvent = (dayIndex: number, eventId: string) => {
    const day = weekPlan?.days[dayIndex];
    if (!day) return;

    const updated = {
      ...day,
      events: day.events.filter(e => e.id !== eventId)
    };
    updateDay(dayIndex, updated);
  };

  const toggleWeeklyHabit = (habitId: string) => {
    setWeekPlan(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        weeklyHabits: prev.weeklyHabits.map(h =>
          h.id === habitId ? { ...h, completed: !h.completed } : h
        )
      };
      localStorage.setItem(`weekPlan:${weekStart}`, JSON.stringify(updated));
      return updated;
    });
  };

  const addWeeklyHabit = (title: string) => {
    setWeekPlan(prev => {
      if (!prev) return prev;
      const newHabit: WeeklyHabit = {
        id: generateId(),
        title,
        completed: false
      };
      const updated = {
        ...prev,
        weeklyHabits: [...prev.weeklyHabits, newHabit]
      };
      localStorage.setItem(`weekPlan:${weekStart}`, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteWeeklyHabit = (habitId: string) => {
    setWeekPlan(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        weeklyHabits: prev.weeklyHabits.filter(h => h.id !== habitId)
      };
      localStorage.setItem(`weekPlan:${weekStart}`, JSON.stringify(updated));
      return updated;
    });
  };

  const toggleWeeklyTodo = (todoId: string) => {
    setWeekPlan(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        weeklyTodos: prev.weeklyTodos.map(t =>
          t.id === todoId ? { ...t, completed: !t.completed } : t
        )
      };
      localStorage.setItem(`weekPlan:${weekStart}`, JSON.stringify(updated));
      return updated;
    });
  };

  const addWeeklyTodo = (title: string) => {
    setWeekPlan(prev => {
      if (!prev) return prev;
      const newTodo: WeeklyTodo = {
        id: generateId(),
        title,
        completed: false
      };
      const updated = {
        ...prev,
        weeklyTodos: [...prev.weeklyTodos, newTodo]
      };
      localStorage.setItem(`weekPlan:${weekStart}`, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteWeeklyTodo = (todoId: string) => {
    setWeekPlan(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        weeklyTodos: prev.weeklyTodos.filter(t => t.id !== todoId)
      };
      localStorage.setItem(`weekPlan:${weekStart}`, JSON.stringify(updated));
      return updated;
    });
  };

  const editDayTask = (dayIndex: number, taskId: string, newTitle: string) => {
    const day = weekPlan?.days[dayIndex];
    if (!day) return;

    const updated = {
      ...day,
      tasks: day.tasks.map(t => t.id === taskId ? { ...t, title: newTitle } : t)
    };
    updateDay(dayIndex, updated);
  };

  const editDayEvent = (dayIndex: number, eventId: string, newTime: string, newTitle: string) => {
    const day = weekPlan?.days[dayIndex];
    if (!day) return;

    const updated = {
      ...day,
      events: sortEventsByTime(day.events.map(e => e.id === eventId ? { ...e, time: newTime, title: newTitle } : e))
    };
    updateDay(dayIndex, updated);
  };

  return {
    weekPlan,
    loading,
    updateWeekPlan,
    updateDay,
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
    deleteWeeklyTodo
  };
};
