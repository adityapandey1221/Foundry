# HabitTracker Command Center — Design Specification

## Aesthetic Direction

**Military ops-center × Iron Man HUD × hacker terminal** — adapted for a personal self-development command center. Every element should feel like it belongs on a classified workstation or inside Tony Stark's helmet. No decorative fluff — every visual element communicates function. The interface should feel like it's *running* something, not displaying something.

The key tension: this is a *habit tracker*, not a weapons system. The ops-center aesthetic should serve the data, not overwhelm it. HUD elements (arcs, scan lines, wireframe overlays) appear where they reinforce information hierarchy — not sprinkled randomly for cool factor.

---

## 1. Color System

### Foundation (from Palantir Blueprint, adapted)

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-void` | `#0a0a0a` | Page background. Pure flat dark, no gradients. |
| `--bg-surface` | `#111418` | Panel/card backgrounds (Blueprint BLACK) |
| `--bg-elevated` | `#1C2127` | Elevated surfaces, modals, dropdowns (Blueprint DARK_GRAY1) |
| `--bg-input` | `#252A31` | Input fields, interactive surface (Blueprint DARK_GRAY2) |
| `--border-subtle` | `#2F343C` | Panel borders, dividers (Blueprint DARK_GRAY3) |
| `--border-default` | `#383E47` | Stronger borders, active panel edges (Blueprint DARK_GRAY4) |

### Accent — Green (Primary)

The green is *not* neon-bright. It's the muted, slightly desaturated green of a military heads-up display — visible but not blinding.

| Token | Hex | Usage |
|-------|-----|-------|
| `--accent-1` | `#1D7324` | Darkest green — backgrounds of active states |
| `--accent-2` | `#238C2C` | Dark green — borders of active elements |
| `--accent-3` | `#29A634` | **Primary accent** — buttons, active indicators, primary actions |
| `--accent-4` | `#43BF4D` | Bright green — hover states, emphasis |
| `--accent-5` | `#62D96B` | Brightest — streak counters, critical highlights, glow source |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--status-success` | `#29A634` | Completed habits, done tasks (same as accent-3) |
| `--status-warning` | `#D1980B` | Due today, approaching deadlines (Blueprint GOLD3) |
| `--status-danger` | `#CD4246` | Overdue, missed habits, broken streaks (Blueprint RED3) |
| `--status-info` | `#147EB3` | Informational, calendar events (Blueprint CERULEAN3) |

### Text Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--text-primary` | `#E5E8EB` | Primary body text (Blueprint LIGHT_GRAY3) |
| `--text-secondary` | `#8F99A8` | Secondary labels, descriptions (Blueprint GRAY3) |
| `--text-muted` | `#5F6B7C` | Disabled text, timestamps, subtle labels (Blueprint GRAY1) |
| `--text-heading` | `#F6F7F9` | Panel headers, titles (Blueprint LIGHT_GRAY5) |
| `--text-accent` | `#43BF4D` | Accent text, active values, streak numbers |

### Glow Effects

Green glow is the signature visual. Used sparingly — only on:
- Active streak counter
- Completed habit checkmarks
- Heatmap cells (intensity varies)
- Panel headers on hover
- The brain/body visualizations

```css
--glow-sm: 0 0 6px rgba(67, 191, 77, 0.3);
--glow-md: 0 0 14px rgba(67, 191, 77, 0.4);
--glow-lg: 0 0 28px rgba(67, 191, 77, 0.25);
--glow-text: 0 0 10px rgba(67, 191, 77, 0.6);
```

---

## 2. Typography

### Font Stack

**Display / Headers:** `'Orbitron', sans-serif`
- Angular, geometric, sci-fi. Used for panel titles, the "COMMAND CENTER" header, streak numbers, and section labels. This is the font that sells the aesthetic. Weight 700 for titles, 500 for labels.
- Google Fonts: `Orbitron:wght@400;500;600;700`

**Body / UI:** `'Rajdhani', sans-serif`
- Technical, slightly condensed, high readability at small sizes. Feels military-adjacent without being a novelty font. Used for habit names, task descriptions, calendar events, button labels.
- Google Fonts: `Rajdhani:wght@400;500;600;700`

**Data / Monospace:** `'Share Tech Mono', monospace`
- Clean monospace for numbers, dates, timestamps, streak counters, heatmap tooltips, code-like elements. Feels like reading a terminal or HUD readout.
- Google Fonts: `Share+Tech+Mono`

### Type Scale

All sizes in `rem`. Base = 16px.

| Level | Size | Weight | Font | Letter Spacing | Usage |
|-------|------|--------|------|----------------|-------|
| Display | 1.75rem (28px) | 700 | Orbitron | 0.15em | "COMMAND CENTER" title |
| H1 | 1.25rem (20px) | 700 | Orbitron | 0.12em | Panel section titles |
| H2 | 1rem (16px) | 600 | Orbitron | 0.1em | Sub-section headers |
| Body | 0.875rem (14px) | 500 | Rajdhani | 0.02em | Habit names, task text |
| Body-sm | 0.8125rem (13px) | 500 | Rajdhani | 0.02em | Descriptions, secondary |
| Caption | 0.75rem (12px) | 400 | Rajdhani | 0.04em | Timestamps, labels |
| Mono-lg | 1.5rem (24px) | 400 | Share Tech Mono | 0.08em | Streak counter, big numbers |
| Mono | 0.8125rem (13px) | 400 | Share Tech Mono | 0.05em | Data values, dates |
| Mono-sm | 0.6875rem (11px) | 400 | Share Tech Mono | 0.05em | Heatmap tooltips, fine data |

**Critical rule:** ALL panel headers and labels are `text-transform: uppercase`. This is non-negotiable for the ops-center feel. Body text (habit names, descriptions) is mixed case.

---

## 3. Panel System

### Panel Structure

Every content block is a **panel** — a self-contained card with a consistent anatomy:

```
┌─ BORDER-TOP (2px accent line) ──────────────────┐
│ HEADER BAR                                       │
│  [STATUS DOT] PANEL TITLE          [ACTION BTN]  │
├──────────────────────────────────────────────────┤
│                                                  │
│  CONTENT AREA                                    │
│                                                  │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Panel CSS Spec

```css
.panel {
  background: var(--bg-surface);         /* #111418 */
  border: 1px solid var(--border-subtle); /* #2F343C */
  border-top: 2px solid var(--accent-3);  /* #29A634 — the signature green top bar */
  border-radius: 2px;                     /* Sharp corners. This isn't a consumer app. */
  padding: 0;                             /* Content handles its own padding */
}

.panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-header-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.8125rem;                  /* 13px — compact */
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-accent);             /* Green title */
}

.panel-header-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-4);
  box-shadow: var(--glow-sm);
  margin-right: 10px;
  animation: pulse 3s ease-in-out infinite;
}

.panel-content {
  padding: 12px 16px;
}
```

### Panel States
- **Default:** Green top border, subtle side/bottom borders
- **Active/Focused:** Border brightens to `--accent-4`, faint green glow (`--glow-lg`) on the entire panel
- **Alert (overdue items inside):** Top border shifts to `--status-danger` red

---

## 4. Component Specifications

### 4.1 Habit Checklist Item

```
┌──────────────────────────────────────────────────┐
│ [■] Morning Meditation                    ✓ 14d  │
│     10 minutes · Daily                           │
└──────────────────────────────────────────────────┘
```

- **Checkbox:** Custom. 16×16px square with 1px `--border-default` border. When checked: filled with `--accent-3`, checkmark in `--bg-void`, `box-shadow: var(--glow-sm)`.
- **Habit name:** Rajdhani 500, 14px, `--text-primary`. When completed: color shifts to `--accent-4` (not strikethrough — we're celebrating completion, not crossing things off).
- **Streak badge:** Share Tech Mono, 11px, `--text-accent`. Shows current consecutive days like `14d`. Glows when ≥7 days.
- **Description row:** Rajdhani 400, 12px, `--text-muted`.
- **Row background:** Transparent default. On hover: `--bg-elevated`. On complete: faint `rgba(29, 115, 36, 0.08)` background.
- **Transition:** All color/background changes: `150ms ease`.

### 4.2 Task Item

```
┌──────────────────────────────────────────────────┐
│ ● Finish Q2 planning doc           [URGENT] 0d  │
│   Complete the quarterly planning doc            │
└──────────────────────────────────────────────────┘
```

- **Priority indicator:** Left dot, 8px. Colors:
  - Urgent: `--status-danger` (#CD4246) + `box-shadow: 0 0 8px rgba(205, 66, 70, 0.5)`
  - High: `--status-warning` (#D1980B)
  - Medium: `--status-info` (#147EB3)
  - Low: `--text-muted` (#5F6B7C)
- **Priority badge:** Orbitron 600, 10px, uppercase. Background: priority color at 15% opacity. Text: priority color.
- **Due date:** Share Tech Mono, 11px. Color-coded:
  - Overdue: `--status-danger`
  - Due today: `--status-warning`
  - Future: `--text-muted`
- **Completed tasks:** Opacity 0.4, text gets subtle line-through in `--text-muted`.

### 4.3 Heatmap

GitHub-style contribution graph, but ops-center themed.

- **Cell size:** 12×12px
- **Cell gap:** 3px
- **Cell border-radius:** 1px (nearly square)
- **Cell border:** 1px solid `--border-subtle`
- **Intensity levels (5 stops):**
  - 0 completions: `#111418` (surface) — empty cell
  - 1–25%: `#0a3d12` — barely there
  - 26–50%: `#1D7324` — accent-1
  - 51–75%: `#238C2C` — accent-2
  - 76–99%: `#29A634` — accent-3
  - 100%: `#43BF4D` + `box-shadow: var(--glow-sm)` — full completion, glows
- **Today's cell:** 2px border in `--accent-5`, pulsing glow animation
- **Hover tooltip:** `--bg-elevated` background, 1px `--border-default` border, Share Tech Mono 11px. Shows: `"MAR 23 · 5/6 COMPLETE"` (uppercase, monospace)
- **Month labels:** Orbitron 600, 10px, `--text-muted`, uppercase, `letter-spacing: 0.1em`
- **Day labels (M/W/F):** Share Tech Mono 10px, `--text-muted`

### 4.4 Weekly Calendar Strip

7 day-columns, today highlighted.

```
┌───┬───┬───┬───┬───┬───┬───┐
│MON│TUE│WED│THU│FRI│SAT│SUN│
│ 17│ 18│ 19│ 20│ 21│ 22│ 23│
│   │ ● │   │●● │ ● │   │   │
└───┴───┴───┴───┴───┴───┴───┘
```

- **Day column:** 1px `--border-subtle` border. Width: flexible, equal columns.
- **Day label:** Orbitron 500, 10px, `--text-muted`, uppercase.
- **Day number:** Share Tech Mono, 18px, `--text-secondary`. Today: `--text-accent` + glow.
- **Today column:** Left + right border: 1px `--accent-3`. Background: `rgba(29, 115, 36, 0.06)`.
- **Event dots:** 6px circles. Color from event's assigned color. Max 3 visible, then `+N` label.
- **Selected day:** Background `--bg-elevated`, events list expands below the strip.
- **Event list item:** Left 3px border in event color. Rajdhani 500 13px for title, Share Tech Mono 11px for time.

### 4.5 Header / Status Bar

The top bar of the entire app. Feels like a HUD status strip.

```
┌──────────────────────────────────────────────────────────┐
│ ◉ COMMAND CENTER     MON 23 MAR 2026     ▲14  ◆6  ■4   │
└──────────────────────────────────────────────────────────┘
```

- **Background:** `--bg-surface` with a `border-bottom: 1px solid var(--accent-2)`
- **Left: App title** — "COMMAND CENTER" in Orbitron 700, 20px, `--accent-5`, `letter-spacing: 0.15em`. Green glow on the text: `text-shadow: var(--glow-text)`.
- **Center: Date** — Share Tech Mono, 13px, `--text-secondary`, uppercase. Format: `MON 23 MAR 2026`.
- **Right: Quick stats** as compact badges:
  - `▲14` — Current streak (days). Share Tech Mono 18px. If active (>0): `--accent-5` + glow. If broken (0): `--status-danger`.
  - `◆6` — Habits tracked today (completed/total). `--text-secondary`.
  - `■4` — Tasks remaining. `--text-secondary`.
- **Height:** 52px. Compact but readable.

### 4.6 Buttons

- **Primary:** Background `--accent-3`, text `--bg-void`, Rajdhani 600, 13px, uppercase, `letter-spacing: 0.08em`. Hover: `--accent-4` + `box-shadow: var(--glow-md)`. Border-radius: 2px.
- **Secondary/Ghost:** Transparent background, 1px `--accent-3` border, text `--accent-4`. Hover: background `rgba(41, 166, 52, 0.1)`.
- **Danger:** Same pattern but with `--status-danger` colors.
- **Height:** 32px (default), 28px (compact). Padding: 0 12px.
- **Icon buttons:** 28×28px, same color rules, centered icon.

### 4.7 Input Fields

- Background: `--bg-input`
- Border: 1px `--border-subtle`
- Focus: border `--accent-3`, `box-shadow: var(--glow-sm)`
- Text: Rajdhani 500, 14px, `--text-primary`
- Placeholder: `--text-muted`
- Height: 32px
- Border-radius: 2px

---

## 5. Brain & Body Visualizations (Signature Feature)

### 5.1 Brain Map

An SVG wireframe of a human brain, viewed from the side (lateral view). Drawn in thin green lines (`--accent-2`, 1px stroke) against the dark background. Different regions light up based on habit categories:

| Brain Region | Habit Category | Location |
|-------------|---------------|----------|
| Prefrontal cortex | Focus / Deep Work / Planning | Front-top |
| Amygdala area | Meditation / Stress Management | Center-deep |
| Hippocampus area | Learning / Reading | Center |
| Motor cortex | Exercise / Physical Activity | Top-center |
| Visual cortex | Screen Time / Social Media | Back |
| Temporal lobe | Social Goals / Communication | Side |
| Brain stem | Sleep / Cold Showers / Recovery | Bottom-back |

**Visual treatment:**
- Base wireframe: `--accent-1` (#1D7324), 1px stroke, low opacity (0.3)
- Active region (habit done today): Fill with radial gradient from `--accent-4` at 20% opacity to transparent. Stroke brightens to `--accent-4`. Glow effect: `filter: drop-shadow(0 0 8px rgba(67, 191, 77, 0.5))`.
- Inactive region: Base wireframe only, barely visible.
- Partially complete: gradient intensity proportional to weekly completion rate.
- **Tooltip on hover:** Region name, associated habits, completion rate this week. Orbitron header, Share Tech Mono data.

### 5.2 Body Map

An SVG wireframe of a human body (front view, anatomical position). Same thin-line green wireframe style. Muscle groups light up based on gym/exercise habit completions for the current week:

| Body Region | Muscle Group | Trigger |
|-------------|-------------|---------|
| Shoulders/traps | Delts, traps | Shoulder day |
| Chest | Pectorals | Chest day / Push |
| Arms (bicep/tricep) | Biceps, triceps | Arm day |
| Core/abs | Abdominals, obliques | Core work |
| Upper back | Lats, rhomboids | Pull / Back day |
| Lower back | Erectors | Deadlift / Back |
| Quads | Quadriceps | Leg day / Squat |
| Hamstrings | Hamstrings | Leg day |
| Calves | Gastrocnemius | Leg day / Calves |
| Glutes | Gluteus | Leg day / Squat |
| Cardio overlay | Heart icon | Cardio / Running |

**Visual treatment:**
- Same as brain: wireframe base at low opacity, regions light up with green glow when activated this week.
- Intensity = number of times hit this week (1x = dim glow, 3x+ = full bright + strong glow).
- Heart icon in chest area pulses with a slow animation if cardio was done today.
- **Tooltip on hover:** Muscle group, exercises logged, times hit this week.

### 5.3 Layout of Visualizations

Brain and body sit side by side on the dashboard, each in its own panel. They're the centerpiece — visually striking but compact enough to coexist with other panels.

```
┌─────────────┬─────────────┐
│  NEURAL MAP  │  BODY MAP   │
│   (brain)    │  (muscles)  │
│   [SVG]      │   [SVG]     │
│  4/7 active  │  3/6 groups │
└─────────────┴─────────────┘
```

Panel dimensions: roughly 300–400px wide each. SVGs are responsive, centered, with 20px padding. Below each SVG: a small summary row in Share Tech Mono showing `"4/7 REGIONS ACTIVE"` or `"CHEST · BACK · LEGS"`.

---

## 6. Animations & Motion

### Principles
- **Purposeful only.** Every animation communicates a state change or draws attention to new data. Zero decorative animations.
- **Fast.** Transitions are 100–200ms. Nothing sluggish.
- **Subtle.** The user should feel the interface is alive without being distracted.

### Specific Animations

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Habit checkbox check | Scale 1→1.15→1 + glow fade-in | 200ms | ease-out |
| Streak counter increment | Number ticks up (counter animation) + glow pulse | 300ms | ease-out |
| Panel on load | Opacity 0→1 + translateY(4px→0) | 200ms | ease-out, staggered 50ms per panel |
| Heatmap cell hover | Border brightens + tooltip fade-in | 100ms | ease |
| Brain/body region activate | Glow intensity 0→1 | 400ms | ease-in-out |
| Status dot (panel header) | Slow pulse (opacity 0.4→1→0.4) | 3000ms | ease-in-out, infinite |
| Today's heatmap cell | Slow pulse glow | 2000ms | ease-in-out, infinite |
| Task completion | Slide right 4px + opacity fade to 0.4 | 200ms | ease |

### CSS Keyframes

```css
@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 6px rgba(67, 191, 77, 0.2); }
  50% { box-shadow: 0 0 14px rgba(67, 191, 77, 0.5); }
}

@keyframes stagger-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## 7. Layout — Master Dashboard

### Grid System

The master dashboard uses CSS Grid. Full viewport, no scrollbar visible on initial load (everything above the fold on a 1080p+ screen).

```
┌──────────────────────────────────────────────────────────┐
│                    STATUS BAR (52px)                      │
├────────────────┬──────────────┬──────────────────────────┤
│                │              │                          │
│  HABITS PANEL  │  TASKS PANEL │   BRAIN + BODY MAPS     │
│  (checklist)   │  (priority)  │   (side by side)        │
│                │              │                          │
│                │              │                          │
├────────────────┴──────────────┴──────────────────────────┤
│                    HEATMAP (full width)                   │
├──────────────────────────────────────────────────────────┤
│                 WEEKLY CALENDAR STRIP                     │
└──────────────────────────────────────────────────────────┘
```

### Grid CSS

```css
.dashboard {
  display: grid;
  grid-template-rows: 52px 1fr auto auto;
  grid-template-columns: 1fr 1fr 1.2fr;
  gap: 12px;
  padding: 12px;
  height: 100vh;
  overflow: hidden;
}

.status-bar    { grid-column: 1 / -1; }
.habits-panel  { grid-column: 1; grid-row: 2; }
.tasks-panel   { grid-column: 2; grid-row: 2; }
.viz-panel     { grid-column: 3; grid-row: 2; }
.heatmap       { grid-column: 1 / -1; grid-row: 3; }
.calendar      { grid-column: 1 / -1; grid-row: 4; }
```

### Spacing

- **Grid gap:** 12px between all panels
- **Panel internal padding:** 12px–16px (compact)
- **List item padding:** 8px–10px vertical, 12px horizontal
- **No margin anywhere.** Gap handles all spacing.

---

## 8. Iconography

No icon library. Minimal icons, built with:
- **Unicode symbols** for status indicators: `◉ ▲ ◆ ■ ● ✓`
- **Simple SVG** for the brain and body maps
- **CSS shapes** for dots, lines, borders

If icons are needed later, use [Lucide](https://lucide.dev/) — clean, thin strokes that match the wireframe aesthetic. Stroke width: 1.5px. Size: 16px default.

---

## 9. Responsive Behavior (Future)

MVP is desktop-first (1280px+). No responsive breakpoints in v1. Minimum supported width: 1024px.

Future breakpoints:
- `< 1024px`: Stack viz panel below habits/tasks. 2-column layout.
- `< 768px`: Single column. Panels stack vertically. Calendar strip becomes scrollable.
- `< 480px`: Mobile. Everything stacks. Heatmap scrolls horizontally.

---

## 10. Anti-Patterns (What NOT to Do)

- **No rounded corners** beyond 2px. This is a military system, not a consumer app.
- **No white backgrounds.** Ever. Not even in modals.
- **No pastel colors.** Everything is dark + green (+ red/amber for semantics).
- **No emoji.** Use symbols and text.
- **No decorative illustrations.** The brain/body SVGs are data visualizations, not decorations.
- **No card shadows.** Borders define boundaries, not drop shadows. (Glow is the exception — and only on active/accent elements.)
- **No animation longer than 400ms** (except the slow infinite pulses on status dots).
- **No large text.** Nothing above 28px. Information density > visual drama.
- **No centered text** (except inside buttons and the header status badges). Everything left-aligned.
