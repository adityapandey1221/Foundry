# Video-Exact HUD Rebuild: Ticket-Driven Build Spec

This document turns [VIDEO_EXACT_IMPLEMENTATION_SPEC.md](/Users/adityapandey/Desktop/HabitTracker/VIDEO_EXACT_IMPLEMENTATION_SPEC.md) into a concrete, parallelizable implementation plan for multiple AI subagents.

## Branch Decision

Use the current branch: `video-exact-hud-rebuild`.

Reasoning:

- the branch name already matches the intended work
- the current uncommitted state is only new reference/spec artifacts, not risky in-progress app edits
- the existing UI code is useful as a data/store source, but the visual layer should be rebuilt in a separate feature path rather than modified panel-by-panel

Implementation rule:

- preserve existing store/date/business logic where useful
- build the new HUD under a new feature namespace
- keep integration into `src/App.tsx` as a final step

## External References

These are not templates to copy wholesale. They are reference points for production-grade implementation discipline.

### Visual density and panel systems

- Bloomberg DASH product page: <https://www.bloomberg.com/professional/products/bloomberg-terminal/collaboration-tools/dash/>
- Tabler repo: <https://github.com/tabler/tabler>

Why:

- Bloomberg is the correct reference for institutional density and information hierarchy
- Tabler is useful for mature panel spacing, table rhythm, and dashboard layout discipline, even though the visual language here must be much darker and harsher

### Terminal/HUD styling references

- React Terminal UI: <https://github.com/jonmbake/react-terminal-ui>

Why:

- useful reference for terminal typography, line-height discipline, and constrained text presentation

### Rendering and motion references

- React Three Fiber: <https://github.com/pmndrs/react-three-fiber>
- Drei: <https://github.com/pmndrs/drei>
- TradingView Lightweight Charts: <https://github.com/tradingview/lightweight-charts>

Why:

- `react-three-fiber` is the right foundation for the helix terrain panel
- `drei` is useful for scene helpers, but should stay secondary to custom geometry
- Lightweight Charts is a strong reference for high-performance canvas rendering discipline even if the final HUD panels are custom SVG/canvas instead of TradingView charts

## Repo Strategy

Build the new UI in a clean namespace with isolated write scopes.

Target structure:

```text
src/
  features/video-exact/
    components/
      VideoExactDashboard.tsx
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
      useTickerTape.ts
      useRadarSweep.ts
      useSpectrumBands.ts
      useWaveformState.ts
    utils/
      seededRandom.ts
      panelData.ts
      geometry.ts
      motion.ts
    styles/
      videoExact.css
```

Integration points kept narrow:

- `src/App.tsx`
- optionally `src/index.css` only for font import and global reset adjustments

## Parallelization Rules

To avoid merge conflicts, subagents must have disjoint write ownership.

### Shared rules

- only the integration owner edits `src/App.tsx`
- only the foundation owner edits `src/features/video-exact/styles/videoExact.css` until base tokens and shell are merged
- panel workers may edit only their assigned component files and their own local hooks/utilities
- common utility files must be assigned explicitly, never shared casually

### Parallel waves

Wave 1:

- foundation shell
- synthetic telemetry/data engine

Wave 2:

- left rail panels
- right rail panels
- center lower panels
- telemetry strip

Wave 3:

- helix core panel
- polish/effects

Wave 4:

- app integration
- QA/perf pass

## Dependency Plan

Add only what directly improves exactness.

Required or likely:

- `@react-three/fiber`
- `three`
- `@react-three/drei`
- `d3-shape`
- `simplex-noise`
- optionally `motion`

Do not add:

- generic admin UI kits
- chart libraries for the main HUD visuals unless a specific panel truly benefits

## Ticket Format

Each ticket includes:

- purpose
- ownership
- write scope
- dependencies
- parallelization notes
- acceptance criteria

## Epic 0: Foundation

### HUD-001: Create feature shell and route-isolated dashboard entry

Purpose:

- create the new feature namespace and base component scaffold

Owner:

- Foundation worker

Write scope:

- `src/features/video-exact/components/VideoExactDashboard.tsx`
- `src/features/video-exact/components/HudPanel.tsx`
- `src/features/video-exact/styles/videoExact.css`
- `src/features/video-exact/index.ts` if needed

Dependencies:

- none

Parallel:

- can run with HUD-002 only if file ownership is respected

Acceptance criteria:

- `VideoExactDashboard` renders a blank 16:9 HUD stage
- stage is centered and matte-black
- panel chrome system exists
- no old theme classes are reused for core shell styling

### HUD-002: Build deterministic synthetic telemetry engine

Purpose:

- create stable pseudo-random data generators so all panels animate consistently

Owner:

- Data worker

Write scope:

- `src/features/video-exact/hooks/useSyntheticTelemetry.ts`
- `src/features/video-exact/hooks/useTickerTape.ts`
- `src/features/video-exact/hooks/useRadarSweep.ts`
- `src/features/video-exact/hooks/useSpectrumBands.ts`
- `src/features/video-exact/hooks/useWaveformState.ts`
- `src/features/video-exact/utils/seededRandom.ts`
- `src/features/video-exact/utils/panelData.ts`
- `src/features/video-exact/utils/motion.ts`

Dependencies:

- none

Parallel:

- safe with HUD-001

Acceptance criteria:

- market table data, flow rows, logs, spectrum bands, radar targets, lattice cells, and gauges all derive from deterministic seeds
- animation state updates smoothly over time
- no panel requires ad hoc local `Math.random()` calls

## Epic 1: Shell and Chrome

### HUD-003: Implement exact stage layout and top telemetry strip

Purpose:

- reproduce the fixed-ratio stage and top instrumentation row

Owner:

- Shell worker

Write scope:

- `src/features/video-exact/components/VideoExactDashboard.tsx`
- `src/features/video-exact/components/TelemetryStrip.tsx`

Dependencies:

- HUD-001

Parallel:

- safe before panel work begins

Acceptance criteria:

- stage uses the target 3-column layout
- top strip matches the video hierarchy
- gutters, padding, and border density align with the spec

### HUD-004: Implement shared panel chrome and grid overlays

Purpose:

- make every panel inherit the same production-quality frame treatment

Owner:

- Foundation worker

Write scope:

- `src/features/video-exact/components/HudPanel.tsx`
- `src/features/video-exact/styles/videoExact.css`

Dependencies:

- HUD-001

Parallel:

- must land before most panel tickets are finalized

Acceptance criteria:

- outer frame, inset line, top label bar, and optional grid overlay are reusable
- panel chrome has no rounded-card or consumer-dashboard feel

## Epic 2: Left Rail

### HUD-101: Markets table panel

Purpose:

- build the compact top-left market table with sparkline column

Owner:

- Left-rail worker A

Write scope:

- `src/features/video-exact/components/MarketsPanel.tsx`

Dependencies:

- HUD-002
- HUD-004

Parallel:

- safe with HUD-102 and HUD-103

Acceptance criteria:

- 6 rows visible
- correct column rhythm
- right-aligned numerics
- tiny sparklines match the terminal look

### HUD-102: Flow ladder panel

Purpose:

- build the horizontal micro-depth bar panel

Owner:

- Left-rail worker B

Write scope:

- `src/features/video-exact/components/FlowLadderPanel.tsx`

Dependencies:

- HUD-002
- HUD-004

Parallel:

- safe with HUD-101 and HUD-103

Acceptance criteria:

- 8 to 10 price rows
- bar widths vary smoothly
- numeric columns remain crisp and compact

### HUD-103: Market logs panel

Purpose:

- build the terminal-style lower-left log block

Owner:

- Left-rail worker C

Write scope:

- `src/features/video-exact/components/MarketLogsPanel.tsx`

Dependencies:

- HUD-002
- HUD-004

Parallel:

- safe with HUD-101 and HUD-102

Acceptance criteria:

- logs read like institutional market telemetry
- timestamps and tokens align to a mono grid
- occasional line replacement animates without obvious jumps

## Epic 3: Center Lower Panels

### HUD-201: Signal waveform panel

Purpose:

- build the middle-lower multi-line waveform panel

Owner:

- Center worker A

Write scope:

- `src/features/video-exact/components/SignalWaveformPanel.tsx`

Dependencies:

- HUD-002
- HUD-004

Parallel:

- safe with HUD-202 and all left/right rail tickets

Acceptance criteria:

- 3 to 4 moving traces
- no fills
- subtle grid guides
- motion feels like instrumentation drift

### HUD-202: Frequency spectrum panel

Purpose:

- build the lower-center 64-band spectrum panel

Owner:

- Center worker B

Write scope:

- `src/features/video-exact/components/FrequencySpectrumPanel.tsx`

Dependencies:

- HUD-002
- HUD-004

Parallel:

- safe with HUD-201 and all left/right rail tickets

Acceptance criteria:

- dense vertical bars span nearly full width
- bars jitter subtly over time
- bottom anchoring is stable

## Epic 4: Right Rail

### HUD-301: Radar sweep panel

Purpose:

- build the large circular radar panel with rotating sweep

Owner:

- Right-rail worker A

Write scope:

- `src/features/video-exact/components/RadarSweepPanel.tsx`
- optionally `src/features/video-exact/utils/geometry.ts` if assigned exclusively

Dependencies:

- HUD-002
- HUD-004

Parallel:

- safe with HUD-302 and HUD-303

Acceptance criteria:

- concentric rings and ticks are crisp
- sweep rotates continuously
- target dots pulse softly
- overall panel stays monochrome

### HUD-302: Numeric lattice panel

Purpose:

- build the matrix grid with sparse digits and cell glow

Owner:

- Right-rail worker B

Write scope:

- `src/features/video-exact/components/NumericLatticePanel.tsx`

Dependencies:

- HUD-002
- HUD-004

Parallel:

- safe with HUD-301 and HUD-303

Acceptance criteria:

- cell field is rectangular and dense
- digits remain sparse and irregular
- lighted cells pulse gently without becoming noisy

### HUD-303: Ring gauges panel

Purpose:

- build the 3 low-profile semicircular gauges

Owner:

- Right-rail worker C

Write scope:

- `src/features/video-exact/components/RingGaugesPanel.tsx`

Dependencies:

- HUD-002
- HUD-004

Parallel:

- safe with HUD-301 and HUD-302

Acceptance criteria:

- 3 equal gauge cells
- semi-circular arcs only
- thin needles and understated labels
- values interpolate smoothly

## Epic 5: Helix Hero Panel

### HUD-401: Helix core engine scene

Purpose:

- build the central hero panel with wireframe terrain and vertical helix

Owner:

- R3F worker

Write scope:

- `src/features/video-exact/components/HelixCorePanel.tsx`
- `src/features/video-exact/utils/geometry.ts` if reserved for this worker

Dependencies:

- HUD-001
- HUD-002
- HUD-004

Parallel:

- safe while left/right/center lower panels are built

Acceptance criteria:

- terrain is line-based, not shaded
- helix is the brightest element in the whole dashboard
- motion is slow and continuous
- scene remains performant on desktop

## Epic 6: Assembly

### HUD-501: Assemble all panels into final dashboard composition

Purpose:

- compose the completed panel set into the exact 3-column layout

Owner:

- Integration worker

Write scope:

- `src/features/video-exact/components/VideoExactDashboard.tsx`

Dependencies:

- HUD-003
- HUD-101
- HUD-102
- HUD-103
- HUD-201
- HUD-202
- HUD-301
- HUD-302
- HUD-303
- HUD-401

Parallel:

- should wait until all panel tickets are merged

Acceptance criteria:

- full dashboard matches the frame hierarchy
- panel proportions match the spec
- no placeholder components remain

### HUD-502: Integrate new dashboard into app entry

Purpose:

- wire the new dashboard into the running app safely

Owner:

- Integration worker

Write scope:

- `src/App.tsx`
- optionally `src/index.css`

Dependencies:

- HUD-501

Parallel:

- should run after assembly

Acceptance criteria:

- app renders the new video-exact dashboard path
- no broken imports from removed old components
- existing store logic still compiles

## Epic 7: Polish, QA, and Performance

### HUD-601: Global visual polish pass

Purpose:

- align typography, scanlines, micro-contrast, and motion restraint to the video

Owner:

- Polish worker

Write scope:

- `src/features/video-exact/styles/videoExact.css`
- small touch-ups in individual panel files only if assigned clearly

Dependencies:

- HUD-501

Parallel:

- can overlap lightly with HUD-602 if write ownership is clear

Acceptance criteria:

- no panel looks too bright, too rounded, or too soft
- typography is small, mono, and uppercase throughout
- panel chrome feels consistent

### HUD-602: Performance and regression pass

Purpose:

- verify render performance and stabilize animation behavior

Owner:

- QA worker

Write scope:

- only minimal targeted fixes in offending panel files

Dependencies:

- HUD-501

Parallel:

- okay with HUD-601 if fixes are coordinated

Acceptance criteria:

- no obvious dropped-frame behavior on normal desktop hardware
- no runaway rerenders
- no animation jitter from uncontrolled timers

### HUD-603: Screenshot parity review against reference video

Purpose:

- compare the built dashboard against extracted video frames

Owner:

- QA worker

Write scope:

- no required code ownership; can produce review notes

Dependencies:

- HUD-601

Parallel:

- final gate before sign-off

Acceptance criteria:

- a paused app screenshot is visually close to the reference
- any remaining deviations are explicitly documented

## Suggested Subagent Assignment Plan

### Wave 1

- Worker 1: HUD-001 and HUD-004
- Worker 2: HUD-002
- Main agent: HUD-003 after shell exists

### Wave 2

- Worker 3: HUD-101
- Worker 4: HUD-102
- Worker 5: HUD-103
- Worker 6: HUD-201
- Worker 7: HUD-202
- Worker 8: HUD-301
- Worker 9: HUD-302
- Worker 10: HUD-303
- Worker 11: HUD-401

### Wave 3

- Main agent: HUD-501 and HUD-502
- Worker 12: HUD-601
- Worker 13: HUD-602

## Definition of Done

The rebuild is done when:

- the new dashboard lives under the `video-exact` feature namespace
- the app renders the rebuilt HUD on `video-exact-hud-rebuild`
- the visual hierarchy matches the reference video
- the implementation remains modular enough for multiple agents to keep extending safely
