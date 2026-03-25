import { CalendarEvent } from '../hooks/useCalendarStore';

export function parseIcsFile(fileContent: string): CalendarEvent[] {
  // For now, return empty - we'll add ical.js later
  return [];
}

export function getEventsForDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
  const dateStr = date.toISOString().split('T')[0];
  return events.filter(e => e.startTime.startsWith(dateStr)).sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export function getEventsForWeek(events: CalendarEvent[], weekStart: string): CalendarEvent[] {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return events.filter(e => {
    const eventDate = new Date(e.startTime);
    return eventDate >= start && eventDate < end;
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));
}
