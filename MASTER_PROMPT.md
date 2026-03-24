# HabitTracker Command Center — Claude Code Build Spec

> **Target:** Claude Code (terminal agent)
> **Scope:** v1 — Monthly Dashboard + Weekly Habit Tracker (2 views)
> **Stack:** React 18 + Vite + Tailwind CSS + Recharts + Lucide React
> **Persistence:** localStorage (no backend)
> **Viewport:** Desktop-first, 1280px+ (no responsive in v1)

---

## 0. Project Scaffolding

```bash
npm create vite@latest habit-command-center -- --template react
cd habit-command-center
npm install tailwindcss @tailwindcss/vite recharts lucide-react uuid
```

Use the Vite React template. Configure Tailwind via the Vite plugin (`@tailwindcss/vite`). Add `@import "tailwindcss"` to `index.css`. All custom CSS variables go in `:root` in `index.css`.

### File Structure

```
src/
  components/
    layout/
      StatusBar.jsx          # Top HUD bar
      TabNav.jsx             # View switcher (Monthly Dashboard | Weekly Tracker)
      Panel.jsx              # Reusable panel wrapper with green top border
    monthly/
      MonthlyDashboard.jsx   # Main monthly overview view
      SummaryRings.jsx       # Donut/ring indicators per week
      DailyHabitCountChart.jsx  # Grouped bar chart (days × categories)
      CategoryBreakdown.jsx  # Horizontal stacked bars by category
      MonthlyHabitGrid.jsx   # The big habits × days dot matrix
      ProgressBars.jsx       # Per-habit horizontal progress bars
    weekly/
      WeeklyTracker.jsx      # Main weekly detail view
      WeeklyGrid.jsx         # 7-day checkmark grid per habit
      WeeklyCompletionBars.jsx  # Color-coded % bars per day
      WeeklyStats.jsx        # Weekly summary stats
    settings/
      HabitManager.jsx       # Add/edit/remove/reorder habits
      SettingsPanel.jsx      # Theme, export/import, reset
    shared/
      DonutChart.jsx         # Reusable ring/donut progress indicator
      EmptyState.jsx         # Placeholder for no-data states
  hooks/
    useLocalStorage.js       # Generic localStorage hook with JSON serialization
    useHabitStore.js         # All habit state + mutations
    useCurrentDate.js        # Today's date, current week, current month
  utils/
    scoring.js               # Pure scoring/streak functions
    dates.js                 # Week/month boundary helpers, formatters
    constants.js             # Categories, colors, defaults, demo habits
    ids.js                   # UUID generation wrapper
  App.jsx
  index.css                  # CSS variables, @font-face imports, global resets
  main.jsx
```

### Google Fonts — Add to `index.html` `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap" rel="stylesheet">
```

---

## 1. Visual Reference (What We're Cloning)

The product is a Google Sheets habit tracker with a dark theme. Here's exactly what the screenshots show:

### Screenshot A — Monthly Dashboard (the hero view)

**Header row:**
- Top-left: Logo icon + "STACK" bold + "january" light + "— HABIT TRACKER —" subtitle
- Center: SUMMARY section — large donut/ring showing `404 / 534` (completions / total possible)
- Right: 5 circular ring indicators labeled WEEK 1 through WEEK 5, each showing a completion percentage (67%, 65%, 65%, 65%, 82%). Rings are color-coded — rings transition from pink/red at low % to green/teal at high %.

**Charts row (spans full width, two charts side by side):**
- Left chart: "DAILY HABIT COUNT" — a grouped bar chart. X-axis = each day of the month (1–31). Y-axis = 0–100%. Each day has multiple thin bars stacked/grouped, one per category, color-coded (pink for Productivity, green for Fitness, purple for Career, blue for Sleep, etc.). This shows which categories were completed each day.
- Right chart: "HABIT COUNT BY CATEGORY" — horizontal stacked bar chart. Each row = a category (Sleep, Productivity, Fitness, Career, Study, Family). Bar shows completed (saturated) vs not completed (desaturated/dark) portions. Legend: "Completed" and "Not Completed".

**Main grid (bottom-left, takes ~65% of width):**
- Title: "DAILY HABITS"
- Column headers: `Habits | Category | Week Log | WEEK 1 [7 day cols] | WEEK 2 [7 day cols] | WEEK 3 | WEEK 4 | WEEK 5`
- ~14 habit rows:
  - WAKE UP ON TIME (Sleep)
  - NO SCROLLING (Productivity)
  - MORNING PLANNING (Productivity)
  - DAILY MOVEMENT (Fitness)
  - 2L OF WATER (Health)
  - DEEP WORK BLOCKS (Career)
  - NO EATING IN FRONT OF SCREEN (Health)
  - EAT HEALTHY FOOD (Health)
  - READ 10 PAGES (Learning)
  - COMPLETE TASKS (Productivity)
  - JOURNAL — 3 LINES (Mindset)
  - EVENING REFLECTION (Mindset)
  - PLAN NEXT WEEK (Productivity)
  - GO TO BED ON TIME (Sleep)
- Each day cell: **colored dot** when completed (color matches the habit's category), empty/dark when not
- "Week Log" column: appears to show a mini sparkline or condensed week summary
- Bottom of grid: legend row "Daily Completed ● | Daily Not Completed ○" with total "404 / 534"

**Progress panel (bottom-right, ~35% width):**
- Title: "PROGRESS"
- Horizontal bar chart: one bar per habit showing overall monthly completion %
- Bars are green, filled proportionally
- "GOALS" label at the far right

### Screenshot B — Weekly Habit Tracker (the detail/input view)

This is the Google Sheets "Weekly Habit Tracker" tab:
- Dark theme spreadsheet
- Top: circular numbered indicators (week selector)
- Columns: WEEK 1 | WEEK 2 | WEEK 3, each subdivided into 7 day columns (Thu 01, Fri 02, Sat 03, Sun 04, Mon 05, etc.)
- Habit rows with checkbox/checkmark cells (✓ when done)
- Below the grid: a summary section per week:
  - "Completed" row: counts
  - "Hours" row
  - "Completion %" row — **color-coded horizontal bars** (100% = green, 70% = orange, 40% = red, 0% = dark/empty)
  - "Weekly Completion %" label with per-week bar visualization
- Below that: a "Progress" section listing habits (50+ Steps, All the Gym, 50 grams of protein, Read 10 Pages, No Alcohol, No Oven) with percentage bars
- **Placeholder for v2:** Glowing green wireframe human body figures appear below the weekly completion bars, intensity varying by week. SKIP THESE IN V1 — leave a reserved `<Panel>` with title "NEURAL MAP" and "BODY MAP" and an `<EmptyState>` message: "Body & brain visualizations coming in v2."

---

## 2. Design System

### 2.1 Color System

All colors defined as CSS custom properties in `:root`. This is the single source of truth — components reference these variables, never raw hex values.

```css
:root {
  /* === FOUNDATION (Palantir Blueprint-derived darks) === */
  --bg-void: #0a0a0a;          /* Page background. Pure flat dark. */
  --bg-surface: #111418;       /* Panel/card backgrounds */
  --bg-elevated: #1C2127;      /* Elevated surfaces, modals, dropdowns */
  --bg-input: #252A31;         /* Input fields, interactive surfaces */
  --border-subtle: #2F343C;    /* Panel borders, dividers */
  --border-default: #383E47;   /* Stronger borders, active panel edges */

  /* === ACCENT — Military HUD Green (primary) === */
  --accent-1: #1D7324;         /* Darkest — active state backgrounds */
  --accent-2: #238C2C;         /* Dark — active element borders */
  --accent-3: #29A634;         /* PRIMARY — buttons, active indicators */
  --accent-4: #43BF4D;         /* Bright — hover states, emphasis */
  --accent-5: #62D96B;         /* Brightest — streak counters, glow source */

  /* === CATEGORY COLORS (from the product screenshots) === */
  --cat-sleep: #5B8FF9;        /* Blue */
  --cat-productivity: #E866A0;  /* Pink/magenta */
  --cat-fitness: #43BF4D;      /* Green (same as accent-4) */
  --cat-career: #9B72F2;       /* Purple */
  --cat-health: #29A634;       /* Green (accent-3) */
  --cat-learning: #F7C948;     /* Gold/yellow */
  --cat-mindset: #36CFC9;      /* Teal/cyan */
  --cat-custom: #8F99A8;       /* Gray (neutral) */

  /* === SEMANTIC === */
  --status-success: #29A634;
  --status-warning: #D1980B;
  --status-danger: #CD4246;
  --status-info: #147EB3;

  /* === TEXT === */
  --text-primary: #E5E8EB;
  --text-secondary: #8F99A8;
  --text-muted: #5F6B7C;
  --text-heading: #F6F7F9;
  --text-accent: #43BF4D;

  /* === GLOW EFFECTS (signature visual — use sparingly) === */
  --glow-sm: 0 0 6px rgba(67, 191, 77, 0.3);
  --glow-md: 0 0 14px rgba(67, 191, 77, 0.4);
  --glow-lg: 0 0 28px rgba(67, 191, 77, 0.25);
  --glow-text: 0 0 10px rgba(67, 191, 77, 0.6);

  /* === TYPOGRAPHY === */
  --font-display: 'Orbitron', sans-serif;
  --font-body: 'Rajdhani', sans-serif;
  --font-mono: 'Share Tech Mono', monospace;
}
```

### 2.2 Typography Rules

| Level | Size | Weight | Font | Letter Spacing | Usage |
|-------|------|--------|------|----------------|-------|
| Display | 1.75rem (28px) | 700 | `--font-display` | 0.15em | Main app title |
| H1 | 1.25rem (20px) | 700 | `--font-display` | 0.12em | Panel section titles |
| H2 | 1rem (16px) | 600 | `--font-display` | 0.1em | Sub-section headers |
| Body | 0.875rem (14px) | 500 | `--font-body` | 0.02em | Habit names, task text |
| Body-sm | 0.8125rem (13px) | 500 | `--font-body` | 0.02em | Descriptions, secondary |
| Caption | 0.75rem (12px) | 400 | `--font-body` | 0.04em | Timestamps, labels |
| Mono-lg | 1.5rem (24px) | 400 | `--font-mono` | 0.08em | Streak counter, big numbers |
| Mono | 0.8125rem (13px) | 400 | `--font-mono` | 0.05em | Data values, dates |
| Mono-sm | 0.6875rem (11px) | 400 | `--font-mono` | 0.05em | Tooltips, fine data |

**Critical rules:**
- ALL panel headers and labels: `text-transform: uppercase`. Non-negotiable for the ops-center feel.
- Body text (habit names, descriptions) is mixed case.
- Numbers and data values ALWAYS use `--font-mono` for tabular alignment.

### 2.3 Panel Component (Reusable Wrapper)

Every content block uses this consistent anatomy:

```
┌─ 2px accent-3 top border ──────────────────────┐
│ HEADER BAR                                       │
│  [●] PANEL TITLE (green, Orbitron)  [ACTION BTN] │
├──────────────────────────────────────────────────┤
│  CONTENT AREA (children)                         │
└──────────────────────────────────────────────────┘
```

CSS spec:
```css
.panel {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-top: 2px solid var(--accent-3);  /* Signature green top bar */
  border-radius: 2px;                     /* Sharp corners. Not a consumer app. */
}
.panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.panel-header-title {
  font-family: var(--font-display);
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-accent);
}
.panel-header-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--accent-4);
  box-shadow: var(--glow-sm);
  margin-right: 10px;
  animation: pulse 3s ease-in-out infinite;
}
```

### 2.4 Animations

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Habit checkbox toggle | Scale 1→1.15→1 + glow fade-in | 200ms | ease-out |
| Streak counter increment | Number tick-up + glow pulse | 300ms | ease-out |
| Panel on load | Opacity 0→1 + translateY(4px→0) | 200ms | ease-out, staggered 50ms |
| Heatmap cell hover | Border brightens + tooltip fade-in | 100ms | ease |
| Status dot (panel header) | Slow pulse opacity 0.4→1→0.4 | 3000ms | infinite |
| Progress bar fill | Width transition | 400ms | ease-out |

```css
@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 6px rgba(67, 191, 77, 0.2); }
  50% { box-shadow: 0 0 14px rgba(67, 191, 77, 0.5); }
}
```

---

## 3. Data Model

### 3.1 TypeScript-Style Interfaces (implement as JSDoc or PropTypes)

```typescript
// === Core Entities ===

interface Habit {
  id: string;                    // UUID v4
  name: string;                  // "WAKE UP ON TIME"
  category: CategoryKey;         // "sleep" | "productivity" | etc.
  isActive: boolean;
  sortOrder: number;
  createdAt: string;             // ISO date
}

type CategoryKey =
  | "sleep"
  | "productivity"
  | "fitness"
  | "career"
  | "health"
  | "learning"
  | "mindset"
  | "custom";

interface CategoryDef {
  key: CategoryKey;
  label: string;                 // "SLEEP"
  color: string;                 // CSS variable name: "--cat-sleep"
  hex: string;                   // "#5B8FF9" (for Recharts which needs raw hex)
}

// === Completion Data ===

// The core data structure: a sparse map of date strings to completed habit IDs
// Key format: "2026-03-23" → Set of habit IDs completed that day
interface CompletionStore {
  [dateString: string]: string[];  // date → array of completed habit IDs
}

// === Derived / Computed (not stored — calculated on render) ===

interface WeekSummary {
  weekStart: string;             // ISO Monday date
  weekEnd: string;               // ISO Sunday date
  dayDates: string[];            // 7 date strings [Mon, Tue, ..., Sun]
  perHabit: {
    [habitId: string]: {
      completedDays: number;     // 0–7
      percentage: number;        // 0–100
    };
  };
  overallPercentage: number;     // 0–100
  totalCompleted: number;        // raw count of checkmarks
  totalPossible: number;         // activeHabits × 7
}

interface MonthSummary {
  month: number;                 // 0-indexed
  year: number;
  weeks: WeekSummary[];          // 4–5 weeks
  perHabit: {
    [habitId: string]: {
      completedDays: number;
      totalDays: number;         // days in month
      percentage: number;
    };
  };
  perCategory: {
    [category: string]: {
      completed: number;
      total: number;
      percentage: number;
    };
  };
  overallCompleted: number;
  overallTotal: number;
  overallPercentage: number;
}

// === Settings ===

interface Settings {
  weekStartsOn: "monday" | "sunday";  // default: "monday"
  streakThreshold: number;             // default: 80 (percent)
}

// === Root State (persisted to localStorage) ===

interface HabitTrackerState {
  habits: Habit[];
  completions: CompletionStore;
  settings: Settings;
  createdAt: string;
}
```

### 3.2 localStorage Keys

- `"habitTracker"` — the single root state object (JSON stringified)
- Wrap ALL reads/writes through `useLocalStorage` hook
- Debounce writes by 100ms to handle rapid checkbox clicks

### 3.3 Default / Demo Data

On first run (no localStorage data found), present a setup flow OR auto-populate with these demo habits:

```javascript
const DEFAULT_HABITS = [
  { name: "Wake Up On Time",       category: "sleep" },
  { name: "No Scrolling",          category: "productivity" },
  { name: "Morning Planning",      category: "productivity" },
  { name: "Daily Movement",        category: "fitness" },
  { name: "2L of Water",           category: "health" },
  { name: "Deep Work Blocks",      category: "career" },
  { name: "Eat Healthy Food",      category: "health" },
  { name: "Read 10 Pages",         category: "learning" },
  { name: "Complete Tasks",        category: "productivity" },
  { name: "Journal — 3 Lines",     category: "mindset" },
  { name: "Evening Reflection",    category: "mindset" },
  { name: "Go To Bed On Time",     category: "sleep" },
];
```

Also generate 3–4 weeks of **randomized demo completion data** so the dashboard is visually rich on first load. Use ~70% fill rate with some variance per category to make charts interesting.

---

## 4. Hooks

### 4.1 `useLocalStorage(key, initialValue)`

Standard generic hook. JSON serialize/deserialize. Return `[value, setValue]`. Handle errors gracefully (corrupt data → reset to initialValue).

### 4.2 `useHabitStore()`

The main state manager. Returns:

```javascript
const {
  // State
  habits,           // Habit[] — active habits only (sorted by sortOrder)
  allHabits,        // Habit[] — including inactive
  completions,      // CompletionStore
  settings,         // Settings

  // Mutations
  toggleCompletion, // (habitId: string, dateString: string) => void
  addHabit,         // (name: string, category: CategoryKey) => void
  removeHabit,      // (habitId: string) => void — sets isActive=false
  reactivateHabit,  // (habitId: string) => void
  reorderHabits,    // (orderedIds: string[]) => void
  updateSettings,   // (partial: Partial<Settings>) => void
  exportData,       // () => string (JSON)
  importData,       // (json: string) => void
  resetAll,         // () => void

  // Computed
  getMonthSummary,  // (year: number, month: number) => MonthSummary
  getWeekSummary,   // (weekStartDate: string) => WeekSummary
  getStreak,        // () => { current: number, best: number }
  isCompleted,      // (habitId: string, dateString: string) => boolean
} = useHabitStore();
```

**`toggleCompletion` logic:**
```javascript
function toggleCompletion(habitId, dateString) {
  setCompletions(prev => {
    const dayCompletions = prev[dateString] || [];
    if (dayCompletions.includes(habitId)) {
      return { ...prev, [dateString]: dayCompletions.filter(id => id !== habitId) };
    } else {
      return { ...prev, [dateString]: [...dayCompletions, habitId] };
    }
  });
}
```

**`getStreak` logic:**
Walk backwards from the current week. For each week, compute `overallPercentage`. If ≥ `settings.streakThreshold`, increment streak. Stop at first week below threshold. Track best streak by scanning all historical weeks.

### 4.3 `useCurrentDate()`

```javascript
const {
  today,            // "2026-03-23" (ISO date string)
  todayIndex,       // 0–6 (day within current week, 0=Monday)
  currentWeekStart, // "2026-03-16" (Monday)
  currentMonth,     // 2 (0-indexed March)
  currentYear,      // 2026
  selectedMonth,    // state: which month the dashboard is viewing
  setSelectedMonth, // navigate between months
  selectedWeekStart,// state: which week the tracker is viewing
  setSelectedWeekStart,
} = useCurrentDate();
```

---

## 5. View 1 — Monthly Dashboard

This is the default landing view. It replicates the "hero" screenshot.

### 5.1 Layout (CSS Grid)

```
┌──────────────────────────────────────────────────────────┐
│                    STATUS BAR (52px)                      │
├──────────────────────────────────────────────────────────┤
│ MONTH SELECTOR ◄ JANUARY 2026 ►    SUMMARY ◉ 404/534    │
│          WEEK 1 (ring) WEEK 2 (ring) ... WEEK 5 (ring)  │
├───────────────────────────────┬──────────────────────────┤
│  DAILY HABIT COUNT            │  HABIT COUNT BY CATEGORY │
│  (grouped bar chart)          │  (horizontal bars)       │
│  ~200px height                │  ~200px height           │
├───────────────────────────────┴──────────────────────────┤
│  DAILY HABITS GRID                          │  PROGRESS  │
│  Habits × Days dot matrix (full month)      │  (bars)    │
│  ~400px+ height, scrollable if needed       │  per-habit │
└─────────────────────────────────────────────┴────────────┘
```

### 5.2 Component: StatusBar

The persistent top bar across both views.

```
┌──────────────────────────────────────────────────────────┐
│ ◉ COMMAND CENTER     MON 23 MAR 2026     ▲14  ◆ 8/12 ■4 │
└──────────────────────────────────────────────────────────┘
```

- Left: "COMMAND CENTER" — Orbitron 700, 20px, `--accent-5`, `text-shadow: var(--glow-text)`
- Center: Date — Share Tech Mono, 13px, `--text-secondary`, uppercase, format: `MON 23 MAR 2026`
- Right: Quick stats in compact badges:
  - `▲14` — Current streak (weeks). Mono 18px. If >0: `--accent-5` + glow. If 0: `--status-danger`.
  - `◆ 8/12` — Habits completed today / total active. `--text-secondary`.
  - `■ 4` — (reserved for tasks in v2, show placeholder or omit)
- Height: 52px. Background: `--bg-surface`. Bottom border: 1px `--accent-2`.

### 5.3 Component: SummaryRings

A row of donut/ring progress indicators, one per week of the current month, plus a large summary donut.

**Summary donut (left, larger):**
- ~80px diameter SVG donut chart
- Shows `totalCompleted / totalPossible` (e.g., "404 / 534")
- Ring color: `--accent-3` (filled portion), `--border-subtle` (empty portion)
- Center text: two lines — large number top ("404"), smaller label bottom ("/ 534") in `--font-mono`

**Week rings (right, smaller, ~50px each):**
- One ring per week (4–5 depending on month)
- Label below: "WEEK 1", "WEEK 2", etc. (Orbitron 10px uppercase)
- Percentage inside ring (mono, 12px): "67%", "82%", etc.
- Ring color varies by percentage:
  - <40%: `--status-danger` (red)
  - 40–69%: `--status-warning` (amber)
  - 70–89%: `--accent-3` (green)
  - ≥90%: `--accent-5` (bright green) + `box-shadow: var(--glow-sm)`

### 5.4 Component: DailyHabitCountChart

Recharts `<BarChart>` grouped bar chart.

- X-axis: each day of the month (1–31), labeled with day number
- Y-axis: count of habits completed (0 to max habits)
- One bar per category per day, grouped (use `<Bar>` components with category fill colors)
- Bar colors: use each category's hex color from `CategoryDef`
- Background: transparent (panel background shows through)
- Grid lines: `--border-subtle` at 20% opacity
- Tooltip: dark background (`--bg-elevated`), mono font, shows day + per-category counts
- Animate on mount: `isAnimationActive={true}`, `animationDuration={600}`

### 5.5 Component: CategoryBreakdown

Recharts `<BarChart layout="vertical">` horizontal stacked bars.

- Y-axis: category names (Orbitron 11px uppercase)
- X-axis: count of completions
- Each bar has two segments: "Completed" (category color, full opacity) and "Not Completed" (same color, 20% opacity)
- Legend: small dots + "Completed" / "Not Completed" labels (Caption size)

### 5.6 Component: MonthlyHabitGrid (THE core component)

This is the most visually important component — the big dot matrix of habits × days.

**Structure:**
```
           WEEK 1                    WEEK 2                   ...
Habit    │ M  T  W  T  F  S  S │ M  T  W  T  F  S  S │ ...  │ Score
─────────┼──────────────────────┼──────────────────────┼──────┤
Wake Up  │ ●  ●  ●  ○  ●  ●  ● │ ●  ●  ○  ●  ●  ○  ● │      │ 82%
No Scroll│ ●  ○  ●  ●  ●  ○  ● │ ●  ●  ●  ●  ○  ●  ● │      │ 78%
...
```

**Implementation details:**
- Sticky left column: Habit name (Rajdhani 500, 13px) + Category badge (pill: category color background at 15% opacity, category color text, Orbitron 9px uppercase)
- Day columns: each cell is a clickable circle
  - Completed: filled circle (10px diameter), filled with the habit's category color, no border
  - Not completed: hollow circle (10px diameter), 1px `--border-subtle` border, transparent fill
  - Today's column: subtle background highlight `rgba(41, 166, 52, 0.06)`, column header in `--text-accent`
  - Future days: cells are disabled (no hover, 30% opacity, not clickable)
  - Past days: clickable (users may retroactively fill in yesterday)
- Week group headers above the day columns: "WEEK 1", "WEEK 2", etc. (Orbitron 10px, `--text-muted`)
- Day-of-week sub-headers: "M T W T F S S" (Mono 10px, `--text-muted`)
- Right column: per-habit monthly score as percentage (Mono 13px), color-coded:
  - ≥90%: `--accent-5` + glow
  - 70–89%: `--accent-3`
  - 40–69%: `--status-warning`
  - <40%: `--status-danger`
- Bottom row: daily totals — count completed / total habits for each day column
- Far bottom-right: grand total "404 / 534" (Mono-lg)

**Click interaction:**
- Clicking a dot toggles completion for that habit × day
- On completion: brief scale animation (1→1.15→1, 200ms) + color fill
- On un-completion: color drains out (150ms)

**Horizontal scroll:**
If month has 5 weeks (35 columns), the grid should be horizontally scrollable with the Habit name column sticky-positioned on the left.

### 5.7 Component: ProgressBars

Vertical list of per-habit horizontal progress bars.

- Each row: habit name (left, truncated if long) + bar + percentage label (right)
- Bar height: 16px
- Bar fill color: `--accent-3` (or gradient from `--accent-1` to `--accent-4`)
- Bar background: `--bg-elevated`
- Bar border-radius: 1px
- Fill width transitions: 400ms ease-out on value change
- Sort order: by completion percentage descending (best habits on top)

---

## 6. View 2 — Weekly Habit Tracker

The detailed input view for a single week. Users will mostly interact here for daily check-ins.

### 6.1 Layout

```
┌──────────────────────────────────────────────────────────┐
│                    STATUS BAR (52px)                      │
├──────────────────────────────────────────────────────────┤
│ ◄ WEEK ► selector      WEEK 12: MAR 16 – MAR 22, 2026  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  WEEKLY HABIT GRID                                       │
│  (full-width table: Habit × 7 days, checkmark cells)    │
│                                                          │
├────────────────────────────────────┬─────────────────────┤
│  DAILY COMPLETION BARS             │  WEEKLY STATS       │
│  (7 color-coded % bars, one/day)   │  summary numbers    │
├────────────────────────────────────┤                     │
│  PER-HABIT WEEKLY PROGRESS         │                     │
│  (horizontal bars for this week)   │                     │
├────────────────────────────────────┴─────────────────────┤
│  [NEURAL MAP placeholder]  │  [BODY MAP placeholder]    │
│  "Coming in v2"            │  "Coming in v2"            │
└──────────────────────────────────────────────────────────┘
```

### 6.2 Week Navigator

- Left/right arrows (`ChevronLeft`, `ChevronRight` from lucide-react)
- Center: "WEEK 12" (Orbitron 600 16px) + "MAR 16 – MAR 22, 2026" (Mono 13px `--text-secondary`)
- Arrows disabled at boundaries (can't go past the current week into the future)

### 6.3 Component: WeeklyGrid

Full-width table, similar to the monthly grid but for a single week with more detail.

```
             │  MON 16  │  TUE 17  │  WED 18  │  THU 19  │  FRI 20  │  SAT 21  │  SUN 22  │  SCORE
─────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼───────
Wake Up      │    ✓     │    ✓     │    ✓     │          │    ✓     │          │    ✓     │  71%
No Scrolling │    ✓     │          │    ✓     │    ✓     │    ✓     │    ✓     │    ✓     │  86%
...
─────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼
COMPLETED    │   10/12  │   8/12   │  11/12   │   7/12   │  12/12   │   9/12   │  10/12   │  67/84
```

- Column headers: day name (Orbitron 10px) + date number (Mono 16px) stacked vertically
- Today's column: green border left + right (1px `--accent-3`), background `rgba(29, 166, 52, 0.06)`
- Check cells: larger than monthly view (16×16px squares)
  - Checked: filled `--accent-3` square with "✓" character in `--bg-void`, `box-shadow: var(--glow-sm)`
  - Unchecked: 1px `--border-default` border, hollow
  - Click animation: scale 1→1.15→1 + glow fade-in (200ms ease-out)
- Future day columns: grayed out, not interactive
- Score column: same color-coding as monthly (≥90% green glow, 70-89% green, 40-69% amber, <40% red)
- Bottom row: per-day totals "10/12" (Mono 12px)

### 6.4 Component: WeeklyCompletionBars

Seven horizontal bars, one per day, showing that day's completion percentage.

- Color-coded by value:
  - 100%: `--accent-5` (bright green) + glow
  - 70–99%: `--accent-3`
  - 40–69%: `--status-warning` (amber)
  - 1–39%: `--status-danger` (red)
  - 0%: `--bg-elevated` (empty)
- Percentage label inside or next to the bar (Mono 11px)
- Bar height: 20px
- Labels on left: day abbreviation (MON, TUE, etc.)

### 6.5 Component: WeeklyStats

Summary panel for the selected week:

- **Overall Completion:** large donut (same as SummaryRings) + "67 / 84" (Mono-lg)
- **Active Habits:** count (Mono 18px)
- **Best Day:** "FRI — 100%" (Mono 13px, green)
- **Worst Day:** "THU — 58%" (Mono 13px, red)
- **Week Streak:** "Week 12 of 14-week streak" or "Streak broken" if below threshold

### 6.6 Placeholder Panels for v2

Two side-by-side panels at the bottom:

```jsx
<Panel title="NEURAL MAP">
  <EmptyState message="Brain activity visualization — coming in v2" />
</Panel>
<Panel title="BODY MAP">
  <EmptyState message="Muscle group visualization — coming in v2" />
</Panel>
```

EmptyState: centered text in Mono 12px `--text-muted`, with a simple wireframe brain/body outline in `--border-subtle` at 20% opacity (or just an icon placeholder).

---

## 7. Scoring & Logic (Pure Functions in `utils/scoring.js`)

```javascript
/**
 * Compute weekly summary for a given week start date.
 * @param {string} weekStartDate - ISO Monday date
 * @param {Habit[]} habits - active habits at time of that week
 * @param {CompletionStore} completions
 * @returns {WeekSummary}
 */
function computeWeekSummary(weekStartDate, habits, completions) { ... }

/**
 * Compute monthly summary.
 * @param {number} year
 * @param {number} month - 0-indexed
 * @param {Habit[]} habits
 * @param {CompletionStore} completions
 * @returns {MonthSummary}
 */
function computeMonthSummary(year, month, habits, completions) { ... }

/**
 * Compute current and best streak.
 * Walk backwards from current week. Week counts as "streak" if
 * overallPercentage >= threshold.
 * @returns {{ current: number, best: number }}
 */
function computeStreak(habits, completions, settings) { ... }

/**
 * Get all week start dates (Mondays) that fall within a given month.
 * A week belongs to a month if its Monday falls in that month.
 * @returns {string[]} - array of ISO Monday dates
 */
function getWeeksInMonth(year, month) { ... }

/**
 * Get the 7 date strings for a week starting on the given Monday.
 * @returns {string[]} - ["2026-03-16", "2026-03-17", ..., "2026-03-22"]
 */
function getWeekDates(mondayDate) { ... }

/**
 * Format a date string for display.
 * formatDate("2026-03-23", "short") → "MAR 23"
 * formatDate("2026-03-23", "full") → "MON 23 MAR 2026"
 */
function formatDate(dateString, format) { ... }
```

---

## 8. Tab Navigation

Simple horizontal tab bar below the StatusBar.

- Two tabs: "MONTHLY DASHBOARD" | "WEEKLY TRACKER"
- Active tab: `--text-accent` text + 2px `--accent-3` bottom border + faint glow
- Inactive tab: `--text-secondary` text, no border
- Tab labels: Orbitron 600, 12px, uppercase, `letter-spacing: 0.1em`
- Plus a settings gear icon (lucide `Settings`) on the far right that opens a slide-out or modal settings panel

### Settings Panel (modal or slide-out)

Triggered by the gear icon. Contains:

1. **Manage Habits** — opens `HabitManager`:
   - List of habits with drag handles, name, category, toggle active/inactive
   - "Add Habit" button → inline form (name text input + category dropdown)
   - Max 15 active habits enforced
2. **Export Data** — button → downloads JSON file
3. **Import Data** — file upload → parses JSON, replaces state (with confirmation)
4. **Reset All Data** — danger button → double-confirmation modal
5. **Streak Threshold** — slider 50%–100%, default 80%

---

## 9. Global Styles (`index.css`)

```css
@import "tailwindcss";

/* === CSS Variables (paste the full :root block from Section 2.1) === */

/* === Global Resets === */
* { margin: 0; padding: 0; box-sizing: border-box; }

html, body, #root {
  height: 100%;
  background: var(--bg-void);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.02em;
  overflow: hidden;          /* Dashboard is viewport-locked, no page scroll */
  -webkit-font-smoothing: antialiased;
}

/* === Scrollbar (for grids that overflow) === */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--bg-void); }
::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--accent-2); }

/* === Selection === */
::selection { background: rgba(41, 166, 52, 0.3); color: var(--text-heading); }
```

---

## 10. Anti-Patterns (What NOT to Do)

Read this list before writing any component. Violations of these rules will require a rewrite.

- **No rounded corners** beyond 2px. This is a military system, not a consumer app.
- **No white backgrounds.** Ever. Not even in modals.
- **No pastel colors.** Everything is dark + green (+ semantic red/amber for warnings).
- **No emoji.** Use unicode symbols (◉ ▲ ◆ ■ ● ✓) and text.
- **No decorative illustrations.** Every visual element communicates function.
- **No card shadows.** Borders define boundaries. Glow is the only exception — and only on active/accent elements.
- **No animation longer than 400ms** (except infinite pulses on status dots).
- **No large text.** Nothing above 28px. Information density > visual drama.
- **No centered text** except inside buttons and the header status badges. Everything left-aligned.
- **No Inter, Roboto, Arial, or system fonts.** Only Orbitron, Rajdhani, Share Tech Mono.
- **No gradients on backgrounds.** Flat dark surfaces only. Gradients are allowed only on progress bar fills.
- **No placeholder "lorem ipsum" data.** Generate realistic demo data or show proper empty states.

---

## 11. Build Order (Suggested Sequence for Claude Code)

Execute in this order to have a working app at each stage:

1. **Scaffold project** — Vite + React + Tailwind + fonts + CSS variables + global styles
2. **Data layer** — `useLocalStorage`, `useHabitStore`, `useCurrentDate`, `utils/*`, demo data generation
3. **Shell layout** — `App.jsx` with `StatusBar` + `TabNav` + view routing (useState for active tab)
4. **Panel component** — reusable `<Panel title="..." />` wrapper
5. **Weekly Tracker view** — `WeeklyGrid` (this is the primary interaction surface; build it first so clicking works)
6. **Monthly Dashboard** — `MonthlyHabitGrid` → `SummaryRings` → `DailyHabitCountChart` → `CategoryBreakdown` → `ProgressBars`
7. **Settings/HabitManager** — modal with add/edit/delete habits + export/import
8. **Polish** — animations, hover states, glow effects, edge cases, empty states

At each stage, run `npm run dev` and verify in browser before proceeding.

---

## 12. Acceptance Criteria

The build is DONE when:

- [ ] App loads with demo data showing a visually rich dashboard (no blank screens)
- [ ] Monthly dashboard shows: summary donut, week rings, daily bar chart, category bars, habit grid, progress bars
- [ ] Weekly tracker shows: 7-day checkmark grid, daily completion bars, weekly stats
- [ ] Clicking any habit × day cell toggles completion with animation
- [ ] All data persists across page reloads (localStorage)
- [ ] StatusBar shows live streak counter and today's completion count
- [ ] User can add, remove, and toggle habits via settings
- [ ] Export/import JSON works
- [ ] All text uses the correct font (Orbitron for headers, Rajdhani for body, Share Tech Mono for data)
- [ ] No violations of the Anti-Patterns list
- [ ] Charts render with proper axes, tooltips, and animations
- [ ] Today's column is visually highlighted in both views
- [ ] Future days are disabled/non-interactive
- [ ] v2 placeholder panels exist for Neural Map and Body Map

---

## 13. v2 Roadmap (NOT in scope for this build)

For reference only — do NOT implement these:

- Brain wireframe SVG (neural map showing habit categories mapped to brain regions)
- Body wireframe SVG (muscle groups lighting up based on gym habits)
- Daily KPI view (third tab — detailed single-day breakdown)
- Monthly Completion % by Habits view (fourth tab — trend lines)
- Mobile responsive breakpoints
- Notifications / reminders
- Google Calendar integration
- Multi-month comparison charts
