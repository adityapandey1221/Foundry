# HabitTracker MVP — Implementation Tickets

Each ticket produces a runnable prototype (`npm run dev`).

---

## Ticket 1: Project Scaffold + Dashboard UI Shell (Dummy Data)
**Goal:** Get the full dashboard layout on screen with the Gotham aesthetic, populated with hardcoded dummy data. No interactivity yet — pure visual.

**Scope:**
- Scaffold Vite + React + TypeScript + Tailwind CSS project
- Set up Gotham dark theme (colors, fonts, glow effects) in Tailwind config
- Build the master dashboard layout (CSS Grid, 4-panel structure)
- **Header** — current date, dummy streak count, quick stats
- **Today's Habits panel** — list of 5-6 dummy habits with checkboxes (non-functional)
- **Today's Tasks panel** — list of 5-6 dummy tasks with priority badges (non-functional)
- **Habit Heatmap** — GitHub-style grid with dummy completion data (past 6 months)
- **Weekly Calendar Strip** — 7-day strip with dummy events
- All dummy data lives in a single `dummyData.ts` file

**Runnable output:** `npm run dev` → full dashboard visible with dummy content, correct layout and styling.

---

## Ticket 2: Data Layer + localStorage Persistence
**Goal:** Replace dummy data with a real data layer backed by localStorage.

**Scope:**
- Define TypeScript types for Habit, Task, CalendarEvent
- Build a storage service (`storage.ts`) with CRUD helpers for each entity
- Create React context/hooks: `useHabits()`, `useTasks()`, `useCalendarEvents()`
- Seed localStorage with the dummy data on first load (so UI still looks populated)
- Wire dashboard panels to read from the hooks instead of dummy imports

**Runnable output:** Dashboard looks the same, but data comes from localStorage. Refreshing the page preserves state.

---

## Ticket 3: Habit Tracking — Check Off + Streaks
**Goal:** Make the habits panel interactive.

**Scope:**
- Toggle habit completion for today (click checkbox → updates localStorage)
- Visual feedback: completed habits get a cyan glow/strikethrough
- Calculate current streak (consecutive days with all daily habits done)
- Calculate best streak (all-time record)
- Display live streak counter in header
- Streak counter glows when active

**Runnable output:** Can check/uncheck habits, streak updates live, persists across refresh.

---

## Ticket 4: Task Management — Add, Complete, Prioritize
**Goal:** Make the tasks panel fully interactive.

**Scope:**
- Inline quick-add: click "+" → input field → enter to create task
- Set priority on creation (default: medium)
- Click task to mark done → moves to "completed" section with strikethrough
- Tasks sorted by priority (urgent → high → medium → low)
- Optional due date (shows amber badge if due today, red if overdue)

**Runnable output:** Can add tasks, mark them done, see them sorted by priority with due date indicators.

---

## Ticket 5: Habit Management — Add, Edit, Archive
**Goal:** Full habit CRUD from the dashboard + a `/habits` detail page.

**Scope:**
- Inline quick-add for habits on dashboard (name + frequency picker)
- `/habits` detail page: list all habits, edit name/frequency, archive habits
- React Router setup (`/` and `/habits`)
- Navigation: clickable "Habits" header on dashboard → `/habits`, back button to `/`
- Archived habits hidden from dashboard but visible on detail page

**Runnable output:** Can add/edit/archive habits, navigate between dashboard and habits page.

---

## Ticket 6: Interactive Heatmap
**Goal:** Make the heatmap dynamic and informative.

**Scope:**
- Heatmap reads real completion data from habits
- Color intensity = number of habits completed that day (0 = empty, all = full cyan)
- Hover tooltip: date + "X/Y habits completed"
- Month labels along top
- Day-of-week labels along left

**Runnable output:** Heatmap reflects actual habit data, hover shows details.

---

## Ticket 7: Calendar — Events + Weekly Strip + Month View
**Goal:** Standalone calendar functionality.

**Scope:**
- Weekly strip on dashboard: click day to see events, click "+" to add event
- Add event form: title, date, start/end time, color
- `/calendar` detail page: full month grid view with events shown on their days
- Navigation between months
- Click event to edit/delete

**Runnable output:** Can create/view/edit/delete calendar events from dashboard strip and month view.

---

## Ticket 8: Task Detail Page + Filtering
**Goal:** Full `/tasks` page with filtering and sorting.

**Scope:**
- `/tasks` page: all tasks (active + completed)
- Filter by: status (todo/in_progress/done), priority, tags
- Sort by: priority, due date, created date
- Edit task details (name, description, priority, due date, tags)
- Delete tasks
- Navigation from dashboard "Tasks" header → `/tasks`

**Runnable output:** Full task management page with filters, sorting, edit, and delete.

---

## Implementation Order Summary

| Order | Ticket | What you get |
|-------|--------|-------------|
| 1 | Scaffold + UI Shell | See the full dashboard with dummy data |
| 2 | Data Layer | Real persistence, same look |
| 3 | Habit Check-off + Streaks | Interactive habits, streaks work |
| 4 | Task Add/Complete | Interactive tasks |
| 5 | Habit CRUD + Detail Page | Full habit management |
| 6 | Interactive Heatmap | Heatmap shows real data |
| 7 | Calendar | Events + month view |
| 8 | Task Detail Page | Full task management |
