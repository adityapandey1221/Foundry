import { useState, useCallback, useRef, useEffect } from 'react';

const DEBOUNCE_DELAY = 100;

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('useLocalStorage read error:', error);
      return initialValue;
    }
  });

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        // Debounce writes
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }, DEBOUNCE_DELAY);
      } catch (error) {
        console.error('useLocalStorage write error:', error);
      }
    },
    [key, storedValue]
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return [storedValue, setValue];
};
