/**
 * Get user's timezone from browser
 */
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Parse a date string (YYYY-MM-DD) as a local date, handling timezone properly
 */
export const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0);
  return date;
};

/**
 * Format a Date object as YYYY-MM-DD in local timezone
 */
export const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get today's date as YYYY-MM-DD in local timezone
 * DEPRECATED: Use useTodayLocal hook instead for consistent app-wide date
 */
export const getTodayLocal = (): string => {
  return formatLocalDate(new Date());
};

/**
 * Get the Monday of the week containing the given date (local timezone)
 */
export const getMondayOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
};
