# HUD Habit Feature Integration Spec

This spec defines how to integrate the core habit-tracker features into the new `video-exact` HUD without breaking the current visual system.

## Goal

Bring the following real habit-tracker features into the rebuilt HUD:

- checklist
- weekly progress line graph
- GitHub-style heatmap

Panel mapping:

- `NUMERIC LATTICE` -> habit heatmap
- `SIGNAL WAVEFORM` -> weekly progress line graph
- `FREQUENCY SPECTRUM` -> habit checklist dashboard

## Current Codebase Reality

### Real habit data already exists

The actual app state still lives in:

- [useHabitStore.ts](/Users/adityapandey/Desktop/HabitTracker/src/hooks/useHabitStore.ts)
- [useCurrentDate.ts](/Users/adityapandey/Desktop/HabitTracker/src/hooks/useCurrentDate.ts)

These provide:

- habits
- completions
- toggle action
- update action
- remove action
- current day/week/month context

### The new HUD is currently synthetic

The rebuilt `video-exact` dashboard currently renders with synthetic data in:

- [useSyntheticTelemetry.ts](/Users/adityapandey/Desktop/HabitTracker/src/features/video-exact/hooks/useSyntheticTelemetry.ts)

That is correct for the decorative/ambient panels, but wrong for the three product features you want to preserve.

### Existing product feature references

The old implementations worth reusing conceptually are:

- checklist: [MonthlyGrid.tsx](/Users/adityapandey/Desktop/HabitTracker/src/components/monthly/MonthlyGrid.tsx)
- line graph: [MonthlyCompletionLineGraph.tsx](/Users/adityapandey/Desktop/HabitTracker/src/components/monthly/MonthlyCompletionLineGraph.tsx)
- heatmap: [DailyHabitHeatmap.tsx](/Users/adityapandey/Desktop/HabitTracker/src/components/monthly/DailyHabitHeatmap.tsx)

These should not be copied directly. Their logic should be adapted into the new HUD panels and visual system.

## Product Interpretation

Assumption:

- “put the dashboard on the frequency spectrum” means the checklist/dashboard view should replace the current synthetic spectrum bars in the lower-center panel

If that assumption is wrong, the only ambiguity is the destination of the checklist. Everything else is clear.

## Design Direction

### 1. Numeric Lattice -> Heatmap

The new heatmap must preserve the current `NUMERIC LATTICE` panel language:

- same panel chrome
- same dense cell grid feel
- same monochrome flicker behavior
- same low-light contrast hierarchy

But the content becomes habit completion density instead of random digits.

#### Visual model

- keep the existing lattice cell geometry
- cells represent days, grouped as a GitHub-style week-by-column heatmap
- active cells should still flicker subtly like the current lattice
- optional sparse tiny digits may remain as a ghosted overlay only if they do not reduce readability

#### Data model

For each day:

- count active habits
- count completed active habits
- compute completion percentage

Map completion percentage to 5 intensity bands:

- 0%
- 1-24%
- 25-49%
- 50-74%
- 75-100%

#### Layout model

Recommended:

- show the last 12 to 16 weeks, not the entire year
- use 7 rows for days of week
- use week columns left-to-right

This is a better fit for the current lattice panel than the older “12 months side-by-side” version.

#### Interaction

- hover title can show exact date + completion fraction
- no modal behavior in this panel
- no editing directly from heatmap

### 2. Signal Waveform -> Weekly Progress Line Graph

The current `SIGNAL WAVEFORM` panel is already structurally close to the desired feature. It should stop using synthetic waveform layers and become a real weekly completion line graph.

#### Visual model

- preserve the monochrome graph field and internal guides
- replace the four synthetic traces with one primary weekly progress line
- optionally keep one or two faint ghost traces for prior week comparison, but only if they help
- no area fill
- no bright modern chart styling

#### Data model

Primary series:

- current week, 7 points
- daily percentage completion

Optional comparison series:

- previous week
- 4-week rolling mean

Recommended first implementation:

- current week only
- optional current-day marker

#### Axes and labels

- x-axis: Mon-Sun
- y-axis: 0% to 100%
- labels remain tiny and restrained

#### Interaction

- hover can show exact daily completion percentage
- no click behavior required for first pass

### 3. Frequency Spectrum -> Checklist Dashboard

This panel should become the high-density actionable checklist surface.

#### Visual model

Keep the same panel footprint and terminal feel, but replace spectrum bars with a compact operational checklist.

The checklist should feel like:

- command center task board
- dense and scannable
- highly compact
- no consumer to-do app styling

#### Content

Recommended first-pass checklist scope:

- today’s active habits only
- one row per habit
- completion toggle
- compact status summary at top

Each row should include:

- tiny status box or marker
- habit name
- optional category shorthand
- completion state

#### Interaction

Required:

- click or keyboard toggle completion for `currentDate.today`

Optional later:

- edit habit
- remove habit
- sort/filter

For first pass, only toggling is necessary.

#### Summary strip inside panel

At the top of the checklist body, include:

- completed today / total active
- today percentage

This replaces the visual role the spectrum bars were playing as dense repeated marks.

## Architecture Changes

## 1. Reintroduce real habit state into the HUD

Right now [App.tsx](/Users/adityapandey/Desktop/HabitTracker/src/App.tsx) renders the HUD with no real store bindings.

That must change.

### App-level requirement

Restore these hooks in the new HUD app path:

- `useHabitStore`
- `useCurrentDate`

Then pass real data into `VideoExactDashboard`.

### New top-level contract

`VideoExactDashboard` should accept:

- `habits`
- `completions`
- `toggleHabitCompletion`
- `updateHabit`
- `removeHabit`
- `currentDate`

Decorative panels may continue using synthetic telemetry internally.

Product panels must use real data.

## 2. Create a real-data adapter layer for HUD panels

Do not put all habit math directly inside the panel components.

Add a HUD-specific adapter layer:

Suggested files:

```text
src/features/video-exact/hooks/
  useHabitHudData.ts
src/features/video-exact/utils/
  habitHudData.ts
```

Responsibilities:

- active habit filtering
- today completion summary
- weekly completion series
- recent heatmap matrix generation
- today checklist rows

This keeps the HUD panels presentation-focused.

## 3. Split synthetic vs product data cleanly

Rule:

- left rail, radar, helix, gauges can stay synthetic
- lattice, waveform, and checklist panels must use real habit data

This avoids contaminating product panels with fake telemetry.

## Panel-Level Implementation Spec

## HUD-701: Real-data adapter layer

Create:

- `useHabitHudData.ts`
- `habitHudData.ts`

Expose:

- `todayChecklistRows`
- `todaySummary`
- `weeklyProgressSeries`
- `heatmapWeeks`

### `todayChecklistRows`

Shape:

- `habitId`
- `name`
- `category`
- `isCompleted`

### `todaySummary`

Shape:

- `completedCount`
- `activeCount`
- `completionPct`

### `weeklyProgressSeries`

Shape:

- 7 day points for current week
- each point contains:
  - `date`
  - `label`
  - `completedCount`
  - `activeCount`
  - `completionPct`

### `heatmapWeeks`

Shape:

- array of weeks
- each week contains 7 day cells
- each cell contains:
  - `date`
  - `weekdayIndex`
  - `completedCount`
  - `activeCount`
  - `completionPct`
  - `intensityBand`
  - `isToday`

## HUD-702: Replace Numeric Lattice content with heatmap data

Target file:

- [NumericLatticePanel.tsx](/Users/adityapandey/Desktop/HabitTracker/src/features/video-exact/components/NumericLatticePanel.tsx)

Required changes:

- accept real habit heatmap data via props or consume `useHabitHudData`
- replace synthetic `latticeCells`
- maintain the same cell sizing and spacing language
- keep subtle flicker/opacity breathing driven from deterministic animation
- add `today` emphasis

Do not:

- switch to green GitHub colors
- add large month labels
- turn it into a standard contribution graph widget

## HUD-703: Replace Signal Waveform content with weekly progress graph

Target file:

- [SignalWaveformPanel.tsx](/Users/adityapandey/Desktop/HabitTracker/src/features/video-exact/components/SignalWaveformPanel.tsx)

Required changes:

- replace synthetic waveform traces with a real weekly line path
- use actual completion percentage data
- keep the current graph guides and monochrome rendering style
- add weekday labels and subtle y-axis percentages

Nice-to-have:

- previous-week ghost line

## HUD-704: Replace Frequency Spectrum content with checklist dashboard

Target file:

- [FrequencySpectrumPanel.tsx](/Users/adityapandey/Desktop/HabitTracker/src/features/video-exact/components/FrequencySpectrumPanel.tsx)

Required changes:

- rename or replace internals, but the panel may temporarily keep the file name for stability
- render a compact actionable checklist
- support toggling today’s completion
- show a top summary strip

Recommended row layout:

- status box
- habit name
- category shorthand
- completion token

Behavior:

- clicking row or status box toggles completion for `currentDate.today`

## HUD-705: Wire real habit data into VideoExactDashboard

Target files:

- [App.tsx](/Users/adityapandey/Desktop/HabitTracker/src/App.tsx)
- [VideoExactDashboard.tsx](/Users/adityapandey/Desktop/HabitTracker/src/features/video-exact/components/VideoExactDashboard.tsx)

Required changes:

- restore `useHabitStore`
- restore `useCurrentDate`
- pass data/actions into the new HUD
- send real data only to the three product panels

## Proposed File-Level Changes

### New files

- `src/features/video-exact/hooks/useHabitHudData.ts`
- `src/features/video-exact/utils/habitHudData.ts`

### Modified files

- [App.tsx](/Users/adityapandey/Desktop/HabitTracker/src/App.tsx)
- [VideoExactDashboard.tsx](/Users/adityapandey/Desktop/HabitTracker/src/features/video-exact/components/VideoExactDashboard.tsx)
- [NumericLatticePanel.tsx](/Users/adityapandey/Desktop/HabitTracker/src/features/video-exact/components/NumericLatticePanel.tsx)
- [SignalWaveformPanel.tsx](/Users/adityapandey/Desktop/HabitTracker/src/features/video-exact/components/SignalWaveformPanel.tsx)
- [FrequencySpectrumPanel.tsx](/Users/adityapandey/Desktop/HabitTracker/src/features/video-exact/components/FrequencySpectrumPanel.tsx)
- optionally [src/features/video-exact/index.ts](/Users/adityapandey/Desktop/HabitTracker/src/features/video-exact/index.ts)

## Interaction and UX Rules

- product panels must remain monochrome
- keep uppercase micro-typography
- preserve panel density
- avoid colorful feedback
- avoid modal-heavy interactions in this first integration
- checklist toggles must feel immediate
- hover states should be subtle and technical, not app-like

## Acceptance Criteria

The integration is correct if:

- the lattice panel shows real habit completion history as a HUD-styled heatmap
- the waveform panel shows the current week’s actual completion trend
- the lower-center panel becomes a real checklist for today’s habits
- toggling the checklist updates both the checklist and the other real-data panels
- synthetic telemetry remains in decorative panels only
- no panel loses the video-exact monochrome design language

## Implementation Order

1. build HUD real-data adapter layer
2. wire real store/date into `App.tsx`
3. update `VideoExactDashboard` props
4. replace waveform with weekly progress graph
5. replace lattice with heatmap
6. replace spectrum with checklist dashboard
7. do a polish pass for density, flicker restraint, and interaction clarity

## Suggested Next Ticket Breakdown

- `HUD-701` real-data adapter layer
- `HUD-702` waveform panel -> weekly progress line graph
- `HUD-703` numeric lattice -> heatmap
- `HUD-704` frequency spectrum -> checklist dashboard
- `HUD-705` app wiring and integration

