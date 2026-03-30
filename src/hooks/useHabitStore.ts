import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { DEFAULT_HABITS, SETTINGS_DEFAULTS, CATEGORIES } from '../utils/constants';
import { generateId } from '../utils/ids';

const createDefaultState = () => ({
  habits: DEFAULT_HABITS.map((h, idx) => ({
    id: generateId(),
    name: h.name,
    category: h.category,
    isActive: true,
    sortOrder: idx,
    createdAt: new Date().toISOString(),
  })),
  completions: {},
  settings: SETTINGS_DEFAULTS,
  createdAt: new Date().toISOString(),
});

export const useHabitStore = () => {
  const [state, setState] = useLocalStorage('habitTracker', createDefaultState());

  const addHabit = useCallback((name, category = 'custom') => {
    setState((prev) => ({
      ...prev,
      habits: [
        ...prev.habits,
        {
          id: generateId(),
          name,
          category,
          isActive: true,
          sortOrder: prev.habits.length,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
  }, [setState]);

  const removeHabit = useCallback((habitId) => {
    setState((prev) => ({
      ...prev,
      habits: prev.habits.filter(h => h.id !== habitId),
      completions: Object.keys(prev.completions).reduce((acc, date) => {
        acc[date] = prev.completions[date].filter(id => id !== habitId);
        return acc;
      }, {}),
    }));
  }, [setState]);

  const toggleHabitCompletion = useCallback((habitId, dateStr) => {
    setState((prev) => {
      const dayCompletions = prev.completions[dateStr] || [];
      const isCompleted = dayCompletions.includes(habitId);

      return {
        ...prev,
        completions: {
          ...prev.completions,
          [dateStr]: isCompleted
            ? dayCompletions.filter(id => id !== habitId)
            : [...dayCompletions, habitId],
        },
      };
    });
  }, [setState]);

  const updateHabit = useCallback((habitId, updates) => {
    setState((prev) => ({
      ...prev,
      habits: prev.habits.map(h =>
        h.id === habitId ? { ...h, ...updates } : h
      ),
    }));
  }, [setState]);

  const clearAllData = useCallback(() => {
    setState(createDefaultState());
  }, [setState]);

  const importData = useCallback((jsonString) => {
    try {
      const imported = JSON.parse(jsonString);
      setState(imported);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }, [setState]);

  return {
    // State
    habits: state.habits,
    completions: state.completions,
    settings: state.settings,

    // Actions
    addHabit,
    removeHabit,
    toggleHabitCompletion,
    updateHabit,
    clearAllData,
    importData,
  };
};
