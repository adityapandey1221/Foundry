# Feature Spec: Weekly Task Planner View

## Overview

A weekly planner that displays 7 day-columns side by side with a planning sidebar on the left. Each day column has three stacked sections: a single-line **daily focus/intention**, **time-blocked events**, and a **task checklist**. The left sidebar contains the week-level context: mini calendars, weekly recurring habits, and a weekly to-do backlog.

The layout mimics a physical planner opened to the current week — everything for the week visible at a glance, no scrolling between days.

---

## Data Model

```typescript
interface WeekPlan {
  weekStart: string;              // ISO Monday date, e.g. "2026-03-23"
  days: DayPlan[];                // length 7, index 0 = Monday
  weeklyHabits: WeeklyHabit[];
  weeklyTodos: WeeklyTodo[];
}

interface DayPlan {
  date: string;                   // ISO date
  focus: string;                  // Single-line daily intention, e.g. "deep work — finish API integration"
  events: DayEvent[];
  tasks: DayTask[];
}

interface DayEvent {
  id: string;
  time: string;                   // Display string, e.g. "4:00 PM" or "10:30 AM"
  title: string;                  // e.g. "dentist appointment"
  color?: string;                 // Optional accent color for the left-border pip
}

interface DayTask {
  id: string;
  title: string;                  // e.g. "finish client proposal"
  completed: boolean;
  order: number;
}

interface WeeklyHabit {
  id: string;
  title: string;                  // e.g. "clean apartment & kitchen"
  completed: boolean;
}

interface WeeklyTodo {
  id: string;
  title: string;                  // e.g. "renew passport"
  completed: boolean;
}
```

---

## Layout

```
┌──────────────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┐
│              │ MON  │ TUE  │ WED  │ THU  │ FRI  │ SAT  │ SUN  │
│  SIDEBAR     │  9   │  10  │  11  │  12  │  13  │  14  │  15  │
│              ├──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│  Weekly Plan │focus │focus │focus │focus │focus │focus │focus │
│  ──────────  ├──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│  Mini Cals   │events│events│events│events│events│events│events│
│  ──────────  ├──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│  Weekly      │      │      │      │      │      │      │      │
│  Habits      │tasks │tasks │tasks │tasks │tasks │tasks │tasks │
│  (checklist  │      │      │      │      │      │      │      │
│   + % bar)   │      │      │      │      │      │      │      │
│  ──────────  │      │      │      │      │      │      │      │
│  Weekly      │      │      │      │      │      │      │      │
│  To-Do List  │      │      │      │      │      │      │      │
│  (checklist  │      │      │      │      │      │      │      │
│   + % bar)   │      │      │      │      │      │      │      │
└──────────────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┘
```

The sidebar is fixed-width (~200–220px). The 7 day columns share the remaining width equally.

---

## Left Sidebar

### Section 1: Weekly Plan Header

- Week date range: "Jun 9 – Jun 15, 2025" (or dynamically the selected week)
- Navigation: ◄ ► arrows to move between weeks
- Two **mini month calendars** (current month and next month), small 7-column grids showing dates. The current week's dates are highlighted. These are read-only visual context, not interactive.

### Section 2: Weekly Habits

A checklist of recurring habits that apply to the whole week (not day-specific). Examples: "clean apartment & kitchen", "laundry (wash + fold)", "take out garbage + compost", "meal prep".

- Each item: checkbox + label
- Below the list: a **horizontal progress bar** showing `completedCount / totalCount` as a percentage. Bar fills proportionally, color-coded (green when >70%, yellow when 40–70%, red when <40%).
- User can add/remove items from this list.

### Section 3: Weekly To-Do List

A backlog of one-off tasks for the week that aren't assigned to a specific day. Examples: "renew passport", "schedule dentist", "return Amazon package".

- Same format: checkbox + label
- Same progress bar below
- These are distinct from daily tasks — they're week-scoped items the user wants to complete sometime this week but hasn't slotted into a specific day.

---

## Day Columns

Each of the 7 day columns is a vertical stack of three sections. All 7 columns share identical structure.

### Column Header

- **Day name**: "MONDAY", "TUESDAY", etc. — bold, uppercase
- **Date**: "Jun 9, 2025" — smaller text below the day name
- **Header background color**: Each day gets a **distinct soft/pastel color** as its column header background. The screenshot uses a palette like:
  - Monday: soft coral/salmon
  - Tuesday: soft peach/orange
  - Wednesday: soft yellow
  - Thursday: soft lavender
  - Friday: soft pink
  - Saturday: soft mint/green
  - Sunday: soft blue
  
  These are purely decorative — they help visually distinguish days at a glance. Use the app's design system colors if these don't fit the theme; the key behavior is that each day is visually distinct.

- **Today's column** should have an additional visual indicator (brighter border, subtle background highlight, or a "TODAY" badge) so the user's eye is immediately drawn to it.

### Section A: Today's Focus (single line)

- Label: "today's focus" — small, muted, italic or lowercase to feel intentional rather than aggressive
- Value: a single editable line of text. Short intention for the day, e.g. "deep work — finish API integration", "zero inbox day", "no-spend day", "grocery run + stay under budget"
- This is NOT a task — it's a mindset framing. One line max, no checkbox.
- If empty, show placeholder: "set your intention..."

### Section B: Events (time-blocked)

- Label: "EVENTS" — small header
- Each event: `[time] [title]` — e.g., "4:00 PM – grocery delivery window", "10:30 AM – breakfast with friend"
- Events have a small **colored left-border pip** (3px left border) to visually distinguish them. Colors can be user-assigned or auto-cycled.
- Events are display items, not checkable (they're time commitments, not tasks).
- User can add events inline: click to add, type time + title.
- If no events, show subtle placeholder: "no events"

### Section C: Tasks (the main content area)

- Label: "TASKS" — small header, with a colored background strip/banner that differs slightly from the column header color (the screenshot shows task sections with their own pastel header bar)
- Each task: `[checkbox] [title]`
  - Unchecked: normal text
  - Checked: text gets a subtle strikethrough or reduced opacity (NOT deleted — still visible)
- Tasks are the bulk of each day's content. A typical day has 5–12 tasks.
- User can:
  - **Add a task**: click/press Enter at the bottom of the list to add a new task inline
  - **Check/uncheck**: toggle the checkbox
  - **Reorder**: drag to reorder within the day
  - **Move between days**: drag a task from one day column to another (stretch goal — implement if straightforward, otherwise skip)
  - **Delete**: swipe or click an X icon on hover
- **Bottom of task section**: a row of small completion dots or a mini progress indicator showing how many tasks in that day are done (e.g., 7 small circles, filled for each completed task)

---

## Interactions

### Adding Content
- **Focus line**: Click to edit, blur or Enter to save. Single line, no multiline.
- **Events**: "Add event" link/button at bottom of events section. Inline form: time input + title input. Enter to save.
- **Daily tasks**: "Add task" link/button or empty row at bottom. Type and Enter to create. Auto-focuses next row for rapid entry.
- **Weekly habits / todos**: Same pattern — inline add at bottom of list.

### Checking Off
- Clicking a task/habit checkbox toggles `completed`.
- Completed items stay in place (don't move to bottom or disappear).
- Visual treatment: strikethrough + reduced opacity (0.5) is sufficient.

### Week Navigation
- ◄ ► arrows in the sidebar header move the entire view to the previous/next week.
- Navigating to a new week loads that week's data (or creates an empty `WeekPlan` if none exists).
- The current week should be the default landing state.

### Persistence
- Each `WeekPlan` is stored independently, keyed by `weekStart` date.
- localStorage key pattern: `"weekPlan:2026-03-23"` — one key per week.
- On week navigation, load the target week's data or initialize empty.

---

## Completion Tracking

Two progress bars in the sidebar and a subtle per-day indicator drive accountability:

### Weekly Habits Progress Bar
- `completedHabits / totalHabits * 100`
- Horizontal bar, fills left to right
- Color: green (>70%), yellow (40–70%), red (<40%)
- Label: "55%" or "6/11" next to the bar

### Weekly To-Do Progress Bar
- Same formula and visual treatment
- Separate bar below the to-do list

### Per-Day Completion (bottom of each task column)
- Small row of dots (one per task) or a fraction like "7/10"
- Muted, not prominent — just enough to see at a glance which days are done

---

## Demo Data

On first load, populate one demo week with realistic data so the view looks full. Use this content or similar:

**Monday**: Focus "weekly cleaning chores". Events: "1:00 PM – dentist appointment". Tasks: clean apartment, do laundry, take out garbage, mop floors, wipe counters, vacuum.

**Tuesday**: Focus "catch up on work for the week". Events: "12:00 PM – team meeting". Tasks: finish client proposal, pay phone bill, pay credit card, send follow-up emails, sort pantry items, respond to emails.

**Wednesday**: Focus "finish organizing pantry". Events: "4:00 PM – yoga class". Tasks: prep social media posts, organize shelves, restock snacks, create grocery list, stick to budget, prep ingredients for Saturday.

**Thursday**: Focus "grocery run + stay under budget". Events: "6:00 PM – grocery delivery window", "7:00 PM – batch sprouts of tofu". Tasks: check weekly deals, stick to budget ($50), prep ingredients, respond to emails, relax in the afternoon, catch up on reading.

**Friday**: Focus "zero inbox day". Tasks: deep clean guest bathroom, put out flowers, bake muffins, final email responses, review calendar for next week.

**Saturday**: Focus "no-spend day". Events: "10:30 AM – breakfast with friend", "6:00 PM – dinner with Cally". Tasks: set table for dinner, brew coffee + chill juice, relax in the afternoon, catch up on reading.

**Sunday**: Focus "rest + reset". Tasks: meal prep for the week, review goals, lay out clothes for Monday.

**Weekly Habits**: clean apartment & kitchen, laundry (wash + fold), take out garbage + compost, meal prep, grocery shopping, pay bills, water plants, vacuum + mop, trim email response queue, review calendar for next week (mark ~55% completed).

**Weekly To-Do**: renew passport, schedule dentist, return Amazon package, update resume, organize photos, research vacation flights, cancel old subscription (mark ~15% completed).
