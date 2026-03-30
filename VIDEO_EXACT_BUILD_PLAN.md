# Video-Exact HUD Build Plan

This document converts [VIDEO_EXACT_IMPLEMENTATION_SPEC.md](/Users/adityapandey/Desktop/HabitTracker/VIDEO_EXACT_IMPLEMENTATION_SPEC.md) into a practical execution plan for this repo.

Current implementation branch:

- `video-exact-hud-rebuild`

This branch was created off the current `trading-theme` head instead of rebuilding from `main`. That is the correct base because the existing branch already contains useful scene and panel experimentation, but the new branch isolates the much larger rewrite needed for the video-exact target.

## Branch Decision

Recommendation:

- continue from current `HEAD`
- do the rebuild on `video-exact-hud-rebuild`
- do not continue directly on `trading-theme`

Reasoning:

- the current branch already has relevant dependencies installed:
  - `@react-three/fiber`
  - `three`
  - `@react-three/drei`
  - `@react-three/postprocessing`
- recent commits already explored the right visual territory:
  - `a314506 Build production-grade trading terminal dashboard with helix core engine`
  - `7a44d2f Implement particle-based spiral galaxy in Helix Core Engine`
  - `6ffe11c Replace ring gauges with high-DPI canvas speedometers`
- the branch name `trading-theme` is too tied to the prior direction and should not remain the active working branch for the video-exact implementation
- this repo already has a modular component structure that can host a parallel feature path without forcing a destructive rewrite on day one

Risks:

- existing global styles are strongly opinionated toward a green terminal theme and will actively fight the monochrome reference
- some existing dashboard components are close enough to tempt reuse, but visually they are still the wrong product category
- if we try to adapt the current monthly dashboard panel by panel, we will ship compromises instead of the reference

Conclusion:

- reuse technical groundwork
- do not reuse the existing visual layer as-is

## External Reference Research

The best references are useful for one of three things:

- production-grade dashboard composition
- terminal-grade information density
- production-ready WebGL and motion infrastructure

### Reference set

#### Grafana

- Repo: <https://github.com/grafana/grafana>
- Live dashboards: <https://grafana.com/dashboards>

Why it matters:

- excellent reference for dense panel composition
- proven patterns for grid-driven information layouts
- useful benchmark for dashboard legibility under high data density

What to copy:

- strict panel hierarchy
- visual scannability
- disciplined data density

What not to copy:

- colorful observability styling
- standard app chrome
- plugin-heavy panel semantics

#### React Three Fiber

- Repo: <https://github.com/pmndrs/react-three-fiber>
- Docs: <https://docs.pmnd.rs/react-three-fiber>

Why it matters:

- production-grade React integration for Three.js
- right foundation for the helix terrain scene
- lets the 3D hero panel stay isolated as a self-contained scene component

What to copy:

- scene isolation as reusable components
- render-loop ownership in dedicated scene modules
- declarative composition around a Three.js scene

#### Drei

- Repo: <https://github.com/pmndrs/drei>
- Docs: <https://docs.pmnd.rs/drei>

Why it matters:

- useful helpers for line rendering, performance controls, and scene glue
- can reduce boilerplate in the helix panel without forcing visual compromise

What to copy:

- lightweight utilities only where they simplify infra

What not to copy:

- decorative shortcuts that change the exact look

#### Motion

- Docs: <https://motion.dev/docs/animate>

Why it matters:

- useful for subtle numeric drift, needle motion, and SVG path animation
- better fit than spring-heavy UI animation libraries for this build

What to copy:

- controlled numeric interpolation
- path and value animation for SVG instrumentation

What not to copy:

- cinematic or high-energy motion language

#### Three.js line primitives

- Docs: <https://threejs.org/docs/pages/LineSegments.html>

Why it matters:

- the hero scene should be fundamentally line-based
- the reference depends on crisp wireframe geometry, not shaded meshes

#### gh-dash

- Repo: <https://github.com/dlvhdr/gh-dash>
- Live site: <https://www.gh-dash.dev/>

Why it matters:

- good reference for terminal-grade density and typography discipline
- useful benchmark for small mono text, compact spacing, and visually structured lists

What to copy:

- dense scan-friendly text layout
- unapologetically compact information display

What not to copy:

- colorful theme presets
- actual TUI interaction patterns

#### xterm.js

- Repo: <https://github.com/xtermjs/xterm.js>
- Site: <https://xtermjs.org/>

Why it matters:

- a production reference for browser terminal rendering

Decision:

- do not adopt it for this project right now

Reason:

- the market log panel in the reference is terminal-like but not a real shell
- a bespoke text panel is cheaper, lighter, and easier to tune visually

## Build Strategy

The right strategy is not “refactor the current dashboard into the reference.”

The right strategy is:

1. create a parallel video-exact feature path
2. build the full shell and panel chrome first
3. replace content panel by panel
4. wire the exact theme into the app only after the shell is visually correct

This avoids contamination from the old theme and makes visual regression obvious.

## Keep vs Replace

### Keep

- React + Vite + TypeScript base
- `@react-three/fiber`
- `three`
- `@react-three/drei`
- existing app boot path in `src/App.tsx`
- existing habit store only if needed later for real data mapping

### Replace or bypass

- current global green theme in [src/index.css](/Users/adityapandey/Desktop/HabitTracker/src/index.css)
- generic `Panel` chrome where it conflicts with the reference
- existing monthly dashboard composition in [src/components/monthly/MonthlyDashboard.tsx](/Users/adityapandey/Desktop/HabitTracker/src/components/monthly/MonthlyDashboard.tsx)
- current status bar and live metrics bar when the video-exact shell lands
- existing ring gauge implementation

### Defer

- mapping the HUD to real habit analytics
- settings integration
- weekly and planner views

The first milestone should be a visually exact synthetic dashboard.

## Proposed File Structure

```text
src/
  features/
    video-exact/
      VideoExactDashboard.tsx
      components/
        TelemetryStrip.tsx
        HudPanel.tsx
        MarketsPanel.tsx
        FlowLadderPanel.tsx
        MarketLogsPanel.tsx
        HelixCorePanel.tsx
        SignalWaveformPanel.tsx
        FrequencySpectrumPanel.tsx
        RadarSweepPanel.tsx
        NumericLatticePanel.tsx
        RingGaugesPanel.tsx
      hooks/
        useSyntheticTelemetry.ts
        useRadarState.ts
        useWaveformState.ts
        useSpectrumState.ts
      styles/
        videoExact.css
      utils/
        seededRandom.ts
        panelData.ts
        geometry.ts
```

## Concrete Phase Plan

## Phase 0: Environment and visual reset

Goal:

- establish a clean surface for the rebuild

Tasks:

- add the new feature folder structure
- add a dedicated `videoExact.css`
- add monochrome HUD tokens
- load `IBM Plex Mono`
- isolate the new dashboard route or temporary render path in `App.tsx`

Done when:

- the app can render a black stage with the correct aspect ratio and no inherited green terminal chrome

## Phase 1: Shell and panel chrome

Goal:

- reproduce the frame geometry before building internal graphics

Tasks:

- implement the fixed-ratio stage
- implement the top telemetry strip
- implement the 3-column body grid
- implement a shared `HudPanel`
- match border thickness, inset lines, title bars, gutters, and spacing exactly

Done when:

- a screenshot of empty panels already matches the reference composition closely

## Phase 2: Right and left utility panels

Goal:

- fill the non-hero panels with exact structural behavior

Tasks:

- build `MarketsPanel`
- build `FlowLadderPanel`
- build `MarketLogsPanel`
- build `RadarSweepPanel`
- build `NumericLatticePanel`
- build `RingGaugesPanel`

Implementation choices:

- SVG for radar and gauges
- HTML/CSS grid for market table and logs
- canvas or div bars for flow ladder
- CSS grid or SVG for numeric lattice

Done when:

- left and right columns feel dense, alive, and terminal-grade even before the center hero scene is finished

## Phase 3: Center analytical panels

Goal:

- fill the center stack except the 3D hero

Tasks:

- build `SignalWaveformPanel`
- build `FrequencySpectrumPanel`
- add controlled subtle motion

Implementation choices:

- SVG or canvas
- synthetic deterministic data
- path updates driven by requestAnimationFrame or Motion where helpful

Done when:

- the center column has the correct supporting motion language

## Phase 4: Helix Core Engine

Goal:

- reproduce the central focal point accurately

Tasks:

- build a line-based terrain scene in R3F
- build the luminous central helix
- tune camera, scale, and line density
- add faint point noise
- tune animation speed to instrumentation drift

Implementation choices:

- custom line geometry with `three`
- minimal use of postprocessing
- no filled meshes
- no colorful lighting

Done when:

- the center panel is unmistakably the focal element and closely matches the video still

## Phase 5: Global polish

Goal:

- make the build feel like the video instead of a collection of similar panels

Tasks:

- add scanline overlay
- add restrained phosphor flicker
- tune text luminance hierarchy
- tune panel spacing against screenshot comparison
- align all labels and metadata text

Done when:

- side-by-side paused screenshots look materially similar

## Phase 6: Integration cleanup

Goal:

- make the new dashboard maintainable inside the repo

Tasks:

- remove dead visual paths only after the new shell is stable
- document theme boundaries
- decide whether old monthly dashboard remains as a secondary mode or is retired

## Dependency Plan

Add now:

- `motion`
- `@fontsource/ibm-plex-mono`
- `simplex-noise`

Optional later:

- `d3-shape` if waveform generation becomes cleaner with path math

Do not add yet:

- `xterm.js`
- a generic admin UI kit
- another charting library

## Implementation Order in Code

1. wire `VideoExactDashboard` into [src/App.tsx](/Users/adityapandey/Desktop/HabitTracker/src/App.tsx) behind a temporary toggle or direct replacement
2. author `videoExact.css`
3. create `HudPanel`
4. implement stage shell and telemetry strip
5. build left and right columns
6. build center waveform and spectrum
7. build helix core scene
8. polish typography and motion

## Testing and Verification Plan

### Visual verification

- capture full-app screenshots at desktop width
- compare against the extracted video frame
- verify panel proportions, spacing, and text density

### Interaction verification

- confirm animation loops are smooth
- verify no panel jumps or rerenders excessively
- verify radar sweep and spectrum motion remain steady

### Performance verification

- maintain smooth desktop rendering
- avoid unnecessary React rerenders in animated panels
- isolate R3F scene updates from static panel text where possible

## Hard Rules During Implementation

- desktop exactness first
- synthetic data first
- no generic admin-style shortcuts
- no partial reuse of old green theme chrome
- no broad refactor outside the new feature path unless it directly unblocks the rebuild

## First Concrete Task

The first implementation task should be:

- create `src/features/video-exact/`
- build the fixed-ratio stage
- build `HudPanel`
- replace the current monthly view with a static shell matching the video panel geometry

That is the highest-leverage milestone because it validates the composition before time is spent on animation details.
