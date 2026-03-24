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

const DEMO_WEEK_START = '2026-03-23'; // Monday of demo week

const DEMO_DATA: WeekPlan = {
  weekStart: DEMO_WEEK_START,
  days: [
    {
      date: '2026-03-23',
      focus: 'weekly cleaning chores',
      events: [{ id: 'e1', time: '1:00 PM', title: 'dentist appointment' }],
      tasks: [
        { id: 't1', title: 'clean apartment', completed: false, order: 0 },
        { id: 't2', title: 'do laundry', completed: true, order: 1 },
        { id: 't3', title: 'take out garbage', completed: false, order: 2 },
        { id: 't4', title: 'mop floors', completed: false, order: 3 },
        { id: 't5', title: 'wipe counters', completed: false, order: 4 },
        { id: 't6', title: 'vacuum', completed: false, order: 5 },
      ]
    },
    {
      date: '2026-03-24',
      focus: 'catch up on work for the week',
      events: [{ id: 'e2', time: '12:00 PM', title: 'team meeting' }],
      tasks: [
        { id: 't7', title: 'finish client proposal', completed: false, order: 0 },
        { id: 't8', title: 'pay phone bill', completed: true, order: 1 },
        { id: 't9', title: 'pay credit card', completed: false, order: 2 },
        { id: 't10', title: 'send follow-up emails', completed: false, order: 3 },
        { id: 't11', title: 'sort pantry items', completed: false, order: 4 },
        { id: 't12', title: 'respond to emails', completed: false, order: 5 },
      ]
    },
    {
      date: '2026-03-25',
      focus: 'finish organizing pantry',
      events: [
        { id: 'e3', time: '4:00 PM', title: 'yoga class' }
      ],
      tasks: [
        { id: 't13', title: 'prep social media posts', completed: false, order: 0 },
        { id: 't14', title: 'organize shelves', completed: false, order: 1 },
        { id: 't15', title: 'restock snacks', completed: true, order: 2 },
        { id: 't16', title: 'create grocery list', completed: false, order: 3 },
        { id: 't17', title: 'stick to budget', completed: false, order: 4 },
        { id: 't18', title: 'prep ingredients for Saturday', completed: false, order: 5 },
      ]
    },
    {
      date: '2026-03-26',
      focus: 'grocery run + stay under budget',
      events: [
        { id: 'e4', time: '6:00 PM', title: 'grocery delivery window' },
        { id: 'e5', time: '7:00 PM', title: 'batch cook for the week' }
      ],
      tasks: [
        { id: 't19', title: 'check weekly deals', completed: false, order: 0 },
        { id: 't20', title: 'stick to budget ($50)', completed: false, order: 1 },
        { id: 't21', title: 'prep ingredients', completed: false, order: 2 },
        { id: 't22', title: 'respond to emails', completed: false, order: 3 },
        { id: 't23', title: 'relax in the afternoon', completed: false, order: 4 },
        { id: 't24', title: 'catch up on reading', completed: false, order: 5 },
      ]
    },
    {
      date: '2026-03-27',
      focus: 'zero inbox day',
      events: [],
      tasks: [
        { id: 't25', title: 'deep clean guest bathroom', completed: false, order: 0 },
        { id: 't26', title: 'put out flowers', completed: false, order: 1 },
        { id: 't27', title: 'bake muffins', completed: false, order: 2 },
        { id: 't28', title: 'final email responses', completed: true, order: 3 },
        { id: 't29', title: 'review calendar for next week', completed: false, order: 4 },
      ]
    },
    {
      date: '2026-03-28',
      focus: 'no-spend day',
      events: [
        { id: 'e6', time: '10:30 AM', title: 'breakfast with friend' },
        { id: 'e7', time: '6:00 PM', title: 'dinner with Cally' }
      ],
      tasks: [
        { id: 't30', title: 'set table for dinner', completed: false, order: 0 },
        { id: 't31', title: 'brew coffee + chill juice', completed: false, order: 1 },
        { id: 't32', title: 'relax in the afternoon', completed: false, order: 2 },
        { id: 't33', title: 'catch up on reading', completed: false, order: 3 },
      ]
    },
    {
      date: '2026-03-29',
      focus: 'rest + reset',
      events: [],
      tasks: [
        { id: 't34', title: 'meal prep for the week', completed: false, order: 0 },
        { id: 't35', title: 'review goals', completed: false, order: 1 },
        { id: 't36', title: 'lay out clothes for Monday', completed: false, order: 2 },
      ]
    },
  ],
  weeklyHabits: [
    { id: 'h1', title: 'clean apartment & kitchen', completed: true },
    { id: 'h2', title: 'laundry (wash + fold)', completed: false },
    { id: 'h3', title: 'take out garbage + compost', completed: false },
    { id: 'h4', title: 'meal prep', completed: false },
    { id: 'h5', title: 'grocery shopping', completed: true },
    { id: 'h6', title: 'pay bills', completed: true },
    { id: 'h7', title: 'water plants', completed: false },
    { id: 'h8', title: 'vacuum + mop', completed: false },
    { id: 'h9', title: 'trim email response queue', completed: false },
    { id: 'h10', title: 'review calendar for next week', completed: false },
    { id: 'h11', title: 'weekly planning session', completed: false },
  ],
  weeklyTodos: [
    { id: 'w1', title: 'renew passport', completed: false },
    { id: 'w2', title: 'schedule dentist', completed: false },
    { id: 'w3', title: 'return Amazon package', completed: false },
    { id: 'w4', title: 'update resume', completed: false },
    { id: 'w5', title: 'organize photos', completed: false },
    { id: 'w6', title: 'research vacation flights', completed: false },
    { id: 'w7', title: 'cancel old subscription', completed: true },
  ]
};

export const useWeeklyPlan = (weekStart: string) => {
  const [weekPlan, setWeekPlan] = useState<WeekPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage
    const key = `weekPlan:${weekStart}`;
    const stored = localStorage.getItem(key);

    if (stored) {
      setWeekPlan(JSON.parse(stored));
    } else if (weekStart === DEMO_WEEK_START) {
      // Initialize demo data for the demo week
      setWeekPlan(DEMO_DATA);
      localStorage.setItem(key, JSON.stringify(DEMO_DATA));
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
