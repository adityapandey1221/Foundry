import { useMemo } from 'react';
import { useHabitStore } from '../../../hooks/useHabitStore';
import { useCurrentDate } from '../../../hooks/useCurrentDate';
import { buildHabitHudData } from '../utils/habitHudData';

export const useHabitHudData = () => {
  const store = useHabitStore();
  const currentDate = useCurrentDate();

  const habitHudData = useMemo(
    () => buildHabitHudData(store.habits, store.completions, currentDate),
    [currentDate, store.completions, store.habits]
  );

  return {
    ...store,
    currentDate,
    ...habitHudData,
  };
};

