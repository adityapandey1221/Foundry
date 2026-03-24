import { useState, useEffect } from 'react';
import { today, getWeekStart, getWeekEnd, getCurrentMonth } from '../utils/dates';

export const useCurrentDate = () => {
  const [date, setDate] = useState(() => ({
    today: today(),
    weekStart: getWeekStart(today()),
    weekEnd: getWeekEnd(getWeekStart(today())),
    month: getCurrentMonth().month,
    year: getCurrentMonth().year,
  }));

  useEffect(() => {
    const timer = setInterval(() => {
      setDate({
        today: today(),
        weekStart: getWeekStart(today()),
        weekEnd: getWeekEnd(getWeekStart(today())),
        month: getCurrentMonth().month,
        year: getCurrentMonth().year,
      });
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  return date;
};
