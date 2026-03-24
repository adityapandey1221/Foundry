/**
 * Get ISO date string for today (YYYY-MM-DD)
 * @deprecated Use getTodayLocal from utils/timezone.ts instead
 */
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Get the start of the week (Monday) for a given date
 */
export const getWeekStart = (dateStr, weekStartsOn = 'monday') => {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = weekStartsOn === 'monday' ? d.getDate() - day + (day === 0 ? -6 : 1) : d.getDate() - day;
  d.setDate(diff);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Get the end of the week (Sunday) for a given date
 */
export const getWeekEnd = (dateStr) => {
  const start = new Date(dateStr + 'T00:00:00');
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
};

/**
 * Get all 7 dates in a week (Mon-Sun)
 */
export const getWeekDates = (dateStr) => {
  const start = new Date(dateStr + 'T00:00:00');
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  return dates;
};

/**
 * Get all weeks in a month
 */
export const getMonthWeeks = (year, month) => {
  const weeks: string[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let current = new Date(firstDay);
  // Back to Monday
  current.setDate(current.getDate() - (current.getDay() === 0 ? 6 : current.getDay() - 1));

  while (current <= lastDay) {
    const weekStart = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
    weeks.push(weekStart);
    current.setDate(current.getDate() + 7);
  }

  return weeks;
};

/**
 * Get all dates in a month
 */
export const getMonthDates = (year, month) => {
  const dates: string[] = [];
  const lastDay = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= lastDay; day++) {
    const d = new Date(year, month, day);
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  return dates;
};

/**
 * Format a date string to readable format
 */
export const formatDate = (dateStr, format = 'short') => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  if (format === 'short') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  if (format === 'long') {
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
  if (format === 'full') {
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }
  return dateStr;
};

/**
 * Get the current month and year
 */
export const getCurrentMonth = () => {
  const d = new Date();
  return { month: d.getMonth(), year: d.getFullYear() };
};

/**
 * Get day name from date string
 * Uses timezone-safe parsing
 */
export const getDayName = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
};

/**
 * Get Monday of the week containing the given date
 */
export const getMonday = (year, month, date) => {
  const d = new Date(year, month, date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return { year: d.getFullYear(), month: d.getMonth(), date: d.getDate() };
};

/**
 * Format a week range as "Mar 23 – Mar 29, 2026"
 */
export const formatWeekRange = (weekStartStr) => {
  const [year, month, day] = weekStartStr.split('-').map(Number);
  const start = new Date(year, month - 1, day);
  const end = new Date(year, month - 1, day + 6);

  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const startDay = start.getDate();
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const endDay = end.getDate();
  const endYear = end.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} – ${endDay}, ${endYear}`;
  }
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${endYear}`;
};
