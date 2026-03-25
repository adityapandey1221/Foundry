export interface CalendarEvent {
  id: string;                    // UID from .ics
  title: string;                 // SUMMARY field
  startTime: string;             // ISO 8601 datetime
  endTime: string;               // ISO 8601 datetime
  description?: string;          // DESCRIPTION field (optional)
  location?: string;             // LOCATION field (optional)
  isAllDay: boolean;             // true if no time component
}
