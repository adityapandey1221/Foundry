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
  focus: string;
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
            focus: '',
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
      events: [...day.events, newEvent]
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

  const updateDayFocus = (dayIndex: number, focus: string) => {
    const day = weekPlan?.days[dayIndex];
    if (!day) return;

    const updated = { ...day, focus };
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

  return {
    weekPlan,
    loading,
    updateWeekPlan,
    updateDay,
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
  };
};
