export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
  location?: string;
  isAllDay: boolean;
}

const STORAGE_KEY = 'habitTracker:calendarEvents';

export const useCalendarStore = {
  load: (): CalendarEvent[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error('Failed to load calendar events:', err);
      return [];
    }
  },

  save: (events: CalendarEvent[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (err) {
      console.error('Failed to save calendar events:', err);
    }
  },

  add: (newEvents: CalendarEvent[]): void => {
    const existing = useCalendarStore.load();
    const existingIds = new Set(existing.map(e => e.id));
    const toAdd = newEvents.filter(e => !existingIds.has(e.id));
    const merged = [...existing, ...toAdd];
    useCalendarStore.save(merged);
  },

  clear: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },

  remove: (eventId: string): void => {
    const existing = useCalendarStore.load();
    const filtered = existing.filter(e => e.id !== eventId);
    useCalendarStore.save(filtered);
  },

  count: (): number => {
    return useCalendarStore.load().length;
  },
};
