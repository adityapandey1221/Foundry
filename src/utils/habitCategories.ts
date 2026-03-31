/**
 * Habit category management utilities
 */

export const HABIT_CATEGORIES = {
  productivity: { label: 'Productivity', emoji: '📊' },
  health: { label: 'Health', emoji: '🏥' },
  fitness: { label: 'Fitness', emoji: '💪' },
  learning: { label: 'Learning', emoji: '📚' },
  mindfulness: { label: 'Mindfulness', emoji: '🧘' },
  social: { label: 'Social', emoji: '👥' },
  creative: { label: 'Creative', emoji: '🎨' },
  custom: { label: 'Custom', emoji: '⭐' },
} as const;

export type HabitCategory = keyof typeof HABIT_CATEGORIES;

/**
 * Get all available categories
 */
export const getCategories = () => {
  return Object.entries(HABIT_CATEGORIES).map(([key, value]) => ({
    value: key,
    label: value.label,
  }));
};

/**
 * Get display label for a category
 */
export const getCategoryLabel = (categoryKey: string): string => {
  return HABIT_CATEGORIES[categoryKey as HabitCategory]?.label || categoryKey;
};

/**
 * Get emoji for a category
 */
export const getCategoryEmoji = (categoryKey: string): string => {
  return HABIT_CATEGORIES[categoryKey as HabitCategory]?.emoji || '⭐';
};

/**
 * Check if a category is valid
 */
export const isValidCategory = (categoryKey: string): boolean => {
  return categoryKey in HABIT_CATEGORIES;
};

/**
 * Validate habit name
 */
export const isValidHabitName = (name: string): boolean => {
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= 100;
};

/**
 * Parse and validate time format
 * Supports: "9:30 AM", "9:30AM", "14:30", "9:30", "9 AM"
 */
export const parseTimeString = (timeStr: string): { hours: number; minutes: number } | null => {
  const normalized = timeStr.trim().toLowerCase();

  // Match formats like "9:30 AM", "9:30AM", "14:30", "9:30", "9 AM"
  const match = normalized.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const meridiem = match[3];

  // Validate hours and minutes
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  // Convert to 24-hour format if meridiem provided
  if (meridiem) {
    if (meridiem === 'pm' && hours !== 12) {
      hours += 12;
    } else if (meridiem === 'am' && hours === 12) {
      hours = 0;
    }
  }

  // Validate converted hours
  if (hours < 0 || hours > 23) {
    return null;
  }

  return { hours, minutes };
};

/**
 * Format time to "HH:MM" or "H:MM AM/PM"
 */
export const formatTime = (hours: number, minutes: number, use12Hour = false): string => {
  const padZero = (n: number) => String(n).padStart(2, '0');

  if (!use12Hour) {
    return `${padZero(hours)}:${padZero(minutes)}`;
  }

  const isPM = hours >= 12;
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const meridiem = isPM ? 'PM' : 'AM';

  return `${displayHours}:${padZero(minutes)} ${meridiem}`;
};
