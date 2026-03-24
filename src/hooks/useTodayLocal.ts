import { useMemo } from 'react';
import { formatLocalDate } from '../utils/timezone';

/**
 * Single source of truth for "today" across the entire app.
 * All components should use this hook instead of calculating today independently.
 *
 * This ensures consistent date handling in all parts of the application.
 */
export const useTodayLocal = (): string => {
  return useMemo(() => {
    return formatLocalDate(new Date());
  }, []);
};
