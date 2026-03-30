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
 * Get all weeks in a given year
 */
export const getYearWeeks = (year) => {
  const weeks: string[] = [];
  let current = new Date(year, 0, 1);

  // Back to Monday of week 1
  current.setDate(current.getDate() - (current.getDay() === 0 ? 6 : current.getDay() - 1));

  // Continue until we've covered all of this year
  while (current.getFullYear() <= year) {
    // Stop if we've gone into next year and passed the first week of next year
    if (current.getFullYear() > year && getISOWeekNumber(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`) > 1) {
      break;
    }

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
 * Get ISO week number for a given date string
 */
export const getISOWeekNumber = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);

  // Copy date so we don't modify the original
  const date = new Date(d);

  // ISO week date system: week 1 is the week with Jan 4 in it
  // Set to nearest Thursday
  date.setDate(date.getDate() + (4 - date.getDay()));

  // Get Jan 1
  const jan1 = new Date(date.getFullYear(), 0, 1);

  // Calculate diff in ms and convert to days
  const daysDiff = (date.getTime() - jan1.getTime()) / (24 * 60 * 60 * 1000);

  // Week number (starting from 0, so add 1)
  return Math.floor(daysDiff / 7) + 1;
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
