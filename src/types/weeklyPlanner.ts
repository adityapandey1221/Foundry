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
