# HabitTracker Command Center — MVP Spec

## Overview
A single-page dark dashboard for tracking habits, tasks, and calendar — styled after Palantir Gotham's command center aesthetic. React + Vite, localStorage for persistence.

## Tech Stack (MVP)
- **Frontend:** React 18 + Vite + TypeScript
- **Styling:** Tailwind CSS (fast to build, easy dark theme)
- **Storage:** localStorage (migrate to cloud later)
- **Routing:** React Router (dashboard + detail pages)
- **Charts/Heatmap:** Lightweight custom components (no heavy libs)

## Design Language
- **Background:** Near-black (#06080d)
- **Surfaces:** Dark panels (#0d1117) with subtle borders (#1b2332)
- **Primary accent:** Cyan (#00d4ff) — active states, streaks, progress
- **Secondary accent:** Amber (#ffb800) — warnings, due dates
- **Success:** Green (#00ff88) — completed items
- **Danger:** Red (#ff4757) — missed/overdue
- **Typography:** Inter (UI) + JetBrains Mono (data/numbers)
- **Effects:** Subtle glow on accents, no gratuitous animation
- **Layout:** CSS Grid, data-dense panels, minimal whitespace

## Information Architecture

### Master Dashboard (`/`)
One screen, four panels:

```
┌─────────────────────────────────────────────┐
│  HEADER: Date, streak count, quick stats    │
├──────────────────────┬──────────────────────┤
│                      │                      │
│   TODAY'S HABITS     │   TODAY'S TASKS      │
│   (checklist)        │   (priority list)    │
│                      │                      │
├──────────────────────┴──────────────────────┤
│         HABIT HEATMAP (GitHub-style)        │
├─────────────────────────────────────────────┤
│         WEEKLY CALENDAR STRIP               │
└─────────────────────────────────────────────┘
```

### Detail Pages
- `/habits` — Manage all habits (create, edit, archive, view history)
- `/tasks` — Full task list with filtering/sorting
- `/calendar` — Month view with events

## Data Models

### Habit
```ts
{
  id: string
  name: string
  description?: string
  frequency: 'daily' | 'weekly' | { days: number[] } // 0=Sun..6=Sat
  targetPerWeek?: number
  createdAt: string
  archivedAt?: string
  completions: string[]         // array of ISO date strings
  color?: string
}
```

### Task
```ts
{
  id: string
  name: string
  description?: string
  dueDate?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'todo' | 'in_progress' | 'done'
  createdAt: string
  completedAt?: string
  tags?: string[]
}
```

### CalendarEvent
```ts
{
  id: string
  title: string
  date: string
  startTime?: string
  endTime?: string
  description?: string
  color?: string
}
```

## Key Interactions
- **Check off habit** → checkbox toggles completion for today, streak counter updates live
- **Complete task** → click to mark done, moves to completed section
- **Add habit/task** → inline quick-add at top of each panel (+ button → input field)
- **Heatmap** → hovering a cell shows date + completion count
- **Calendar strip** → click a day to see that day's events, click "+" to add event

## Streaks (Basic Gamification)
- **Current streak:** consecutive days with all daily habits completed
- **Best streak:** all-time record
- Displayed prominently in header
- Streak counter glows cyan when active

## Future Features (NOT in MVP)
- Google/Apple Calendar sync
- XP/leveling/achievements/badges
- Combo multipliers
- Cloud backend + multi-device sync
- Mobile-responsive / PWA
- Data export
- Habit frequency targets ("4x/week" tracking)
- Notifications/reminders
