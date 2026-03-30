# Video-Exact Dashboard Implementation Spec

This spec defines how to reproduce the dashboard shown in `xXpmmzZhdEY70Kin.mp4` as closely as possible inside this project.

The reference is a monochrome terminal-HUD dashboard with dense paneling, hairline borders, animated scientific graphics, and zero consumer-app styling. The implementation should match that visual language exactly, not reinterpret it as a modern SaaS dashboard.

## Implementation Standard

Primary rule:

- match the reference composition, spacing, motion, panel hierarchy, and typography as literally as possible

Do not introduce:

- gradients beyond subtle phosphor bloom
- colorful accents
- rounded consumer UI cards
- soft shadows
- glassmorphism
- big iconography
- oversized spacing
- generic Tailwind dashboard patterns

This is a dark military-terminal composition, not a product marketing UI.

## Reference Summary

The reference frame is a fixed-ratio widescreen control surface with:

- a thin top telemetry strip
- a 3-column body layout
- dense nested panel frames
- mostly grayscale rendering
- thin gridlines and scanline texture
- animated charts that feel synthetic, not financial
- a central hero visualization with a DNA-like helix on a wireframe terrain

The reference reads like:

- old CRT terminal
- Bloomberg terminal density
- sci-fi laboratory telemetry
- monochrome command center

## Exact Visual Language

### Palette

Use a strict grayscale palette with only tiny luminosity variation.

CSS tokens:

```css
:root {
  --bg-0: #020202;
  --bg-1: #050505;
  --bg-2: #090909;
  --panel: #0d0d0d;
  --panel-2: #111111;
  --line-soft: rgba(255, 255, 255, 0.08);
  --line-mid: rgba(255, 255, 255, 0.15);
  --line-strong: rgba(255, 255, 255, 0.24);
  --text-dim: rgba(255, 255, 255, 0.42);
  --text-mid: rgba(255, 255, 255, 0.64);
  --text-strong: rgba(255, 255, 255, 0.88);
  --phosphor: rgba(255, 255, 255, 0.96);
  --glow-soft: rgba(255, 255, 255, 0.06);
}
```

Constraints:

- background remains nearly black
- panel interiors are matte, not glossy
- strokes do most of the visual work
- bright white is reserved for active traces and key readouts

### Typography

Typography must feel terminal-grade, condensed, uppercase, and grid-aligned.

Recommended font stack:

- `IBM Plex Mono`
- fallback `Space Mono`
- fallback `monospace`

Rules:

- all section labels uppercase
- small type only
- strong letter spacing
- weights stay between 400 and 600
- headers are not large; density is the point

Approximate scale system:

- telemetry strip: 10px
- panel titles: 11px
- numeric data: 11px to 13px
- hero panel labels: 10px
- large values should still stay under 15px

### Surface Treatment

Every panel should use:

- outer 1px stroke
- inner inset 1px stroke
- subtle top label bar
- faint internal grid or plotting guides where appropriate
- optional scanline overlay at 2px to 3px intervals with ultra-low opacity

No panel should look soft or card-like.

## Exact Layout Specification

The dashboard should render as a locked widescreen stage, centered in the viewport, preserving the reference aspect before any responsive degradation.

### Stage

- target aspect ratio: `16:9`
- desktop target size: `1365 x 768` equivalent proportions
- outer padding: `8px`
- inter-panel gutters: `8px`
- border thickness: `1px`

### Main Grid

Use a 3-column shell:

- left column: `24%`
- center column: `45%`
- right column: `31%`

Use CSS Grid for overall composition. Do not simulate the shell with flexbox.

```css
grid-template-columns: 24fr 45fr 31fr;
grid-template-rows: auto 1fr;
```

### Top Telemetry Strip

Height:

- `34px` to `38px`

Layout:

- left-aligned system banner
- right-aligned UTC, latency, packets, and mode readouts

Content style:

- tiny uppercase mono text
- muted gray labels with slightly brighter values
- no icons

### Left Column

Use a 3-row layout:

- markets table
- flow ladder horizontal bars
- market logs terminal block

Approximate height split:

- markets: `28%`
- flow ladder: `38%`
- market logs: `34%`

#### Markets panel

Header:

- left title `MARKETS`
- right metadata `LIVE BASKET`

Body:

- compact table with columns matching the reference:
  - market
  - yes
  - no
  - vol
  - trend

Rows:

- 6 visible rows
- each row ends with a tiny sparkline
- values are right-aligned except the market name

Styling:

- row dividers at very low opacity
- no zebra striping
- tiny cell padding

#### Flow Ladder panel

Header:

- left title `FLOW LADDER`
- right metadata `MICRO DEPTH`

Body:

- 8 to 10 horizontal rows
- leftmost numeric price level
- center grayscale bars
- right compact dual numeric columns

Visual behavior:

- bars vary by width only
- no color coding
- slight shimmer allowed

#### Market Logs panel

Header:

- left title `15M MARKET LOGS`
- right metadata `DAY DIRECTION`

Body:

- terminal text block
- timestamp on each row
- ticker and directional statement
- wrap exactly like a command log, not like prose

## Center Column

Use a 3-row stack:

- helix core engine
- signal waveform
- frequency spectrum

Approximate height split:

- hero engine: `60%`
- waveform: `20%`
- spectrum: `20%`

#### Helix Core Engine panel

Header:

- left title `HELIX CORE ENGINE`
- right metadata `DNA / ATTRACTOR`

Body:

- animated wireframe terrain
- centered luminous vertical helix
- subtle particle noise in background
- faint plotting points scattered across the field

Implementation detail:

- the terrain must be line-based, not shaded geometry
- the helix must be brighter than the terrain
- the composition must preserve the exact visual hierarchy:
  - terrain as context
  - helix as focal point

#### Signal Waveform panel

Header:

- left title `SIGNAL WAVEFORM`
- right metadata `MULTI-LAYER`

Body:

- dark graph field with vertical and horizontal guides
- 3 to 4 thin sine-like traces
- traces move slowly and independently

Styling:

- one line near bright white
- the others slightly dimmer
- no filled area under the curves

#### Frequency Spectrum panel

Header:

- left title `FREQUENCY SPECTRUM`
- right metadata `64 BANDS`

Body:

- dense vertical bars spanning full width
- each bar white to gray
- low amplitude jitter over time
- bottom anchor remains stable

## Right Column

Use a 3-row stack:

- radar sweep
- numeric lattice
- ring gauges

Approximate height split:

- radar: `46%`
- lattice: `31%`
- gauges: `23%`

#### Radar Sweep panel

Header:

- left title `RADAR SWEEP`
- right metadata `RINGS + AZIMUTH`

Body:

- circular radar with concentric rings
- ticks around circumference
- multiple target dots
- sweeping illuminated wedge
- one stronger active return cluster near the sweep head

Rules:

- radar remains monochrome
- sweep glow is soft but visible
- concentric geometry must be mathematically crisp

#### Numeric Lattice panel

Header:

- left title `NUMERIC LATTICE`
- right metadata `GRAPH FIELD`

Body:

- rectangular matrix grid
- some cells softly lit
- scattered digits overlayed inside cells
- values remain sparse and irregular

Visual behavior:

- cells pulse gently
- digits update asynchronously
- effect should feel computational, not playful

#### Ring Gauges panel

Header:

- left title `RING GAUGES`
- right metadata `CPU / NET / IO`

Body:

- 3 equal gauge cells
- semi-circular dials
- thin tick marks
- needle indicator
- tiny label and percentage under each gauge

Values in reference:

- roughly high-50s / high-40s / mid-50s

## Motion Specification

Motion is essential. The reference is alive almost everywhere.

### Global motion

- no large transitions
- no springy UI motion
- no panel enter animations
- all animation should feel like continuous instrumentation drift

### Motion by panel

Markets:

- sparklines crawl slowly
- numbers may update in place with tiny flicker

Flow ladder:

- bar widths shift subtly

Market logs:

- occasional line replacement or scroll by one row

Helix engine:

- terrain undulates slowly
- helix rotates or phase-shifts gently
- background points twinkle minimally

Signal waveform:

- traces phase-shift continuously

Frequency spectrum:

- bars jitter within a controlled range

Radar:

- sweep rotates continuously
- dots pulse softly

Numeric lattice:

- random cell values update every 500ms to 1500ms
- illuminated cells move slowly across the grid

Gauges:

- needles micro-adjust slowly, not jump

### Animation constraints

- all loops must be smooth and perpetual
- no abrupt resets
- no neon glitch gimmicks
- no high-saturation cyberpunk effects

## Recommended Tech Stack

Use the current React + Vite foundation, but add fit-for-purpose libraries where they materially improve exactness.

### Core

- React 19
- TypeScript
- Vite

### Rendering and animation

- `@react-three/fiber` for the central helix terrain scene
- `three` for custom line geometry and particle layers
- `@react-three/drei` for scene helpers only where they reduce boilerplate
- `motion` for minimal numeric and needle interpolation if needed
- `d3-shape` for waveform path generation if SVG paths become easier than canvas

### Charts and panel rendering

- prefer `SVG` or `Canvas` for all non-3D panels
- do not use a generic charting library for the main aesthetic panels if it compromises exactness
- `recharts` may remain for hidden data prep patterns, but should not drive the final HUD visuals

### Typography and effects

- `next/font` is not applicable here; use direct font loading in Vite
- add `IBM Plex Mono` via package or local asset
- optional `simplex-noise` for terrain modulation and subtle randomization

### Layout

- CSS Grid for stage and panel composition
- CSS custom properties for the visual system
- avoid Tailwind-only implementation for panel fidelity

Tailwind can coexist for utility spacing, but the final shell and HUD skin should be authored with dedicated CSS modules or a themed stylesheet.

## Architecture Plan

Create a separate theme path instead of mutating the existing dashboard piecemeal.

Recommended structure:

```text
src/
  features/videoExact/
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
      useTickerTape.ts
      useRadarSweep.ts
      useSpectrumBands.ts
      useSyntheticTelemetry.ts
    styles/
      videoExact.css
    utils/
      panelData.ts
      geometry.ts
      motion.ts
```

## Panel-by-Panel Implementation Notes

### Shared `HudPanel`

Responsibilities:

- exact frame treatment
- title bar layout
- internal padding normalization
- optional grid overlay
- optional scanline overlay

Requirements:

- accept `title`
- accept `meta`
- accept `variant`
- expose content slot only

### `HelixCorePanel`

Use `react-three-fiber`.

Requirements:

- orthographic or lightly telephoto camera
- black background
- line-only terrain mesh
- additive or screen-like glow used sparingly on helix lines
- performance target 60fps desktop

Avoid:

- filled meshes
- thick bloom
- colored lights
- cinematic camera movement

### `RadarSweepPanel`

Preferred implementation:

- SVG for rings, ticks, dots, and sweep mask

Requirements:

- mathematically crisp circles
- rotating sweep arm
- radial gradient wedge kept monochrome
- layered target dots with opacity pulsing

### `NumericLatticePanel`

Preferred implementation:

- CSS Grid or SVG grid with absolutely positioned digits

Requirements:

- each cell locked to square ratio
- sparse digits
- no full random flood
- maintain large black negative space

### `RingGaugesPanel`

Preferred implementation:

- SVG arcs and line needles

Requirements:

- 3 equal gauges
- top arc only, not full donut
- tick marks evenly distributed
- tiny labels under each gauge

## Responsive Rules

Desktop exactness is the priority. Do not degrade the main composition prematurely.

### Breakpoints

- `>= 1280px`: preserve full 3-column exact composition
- `1024px - 1279px`: preserve 3 columns with reduced gutters and type scale
- `768px - 1023px`: stack into 2 columns but preserve panel order and aspect constraints
- `< 768px`: single-column fallback, still using the same panel styling

Important:

- the desktop design should be exact first
- mobile adaptation should not influence the desktop layout decisions

## Data Model Strategy

The reference visuals are synthetic telemetry, not business analytics. The implementation should use controlled synthetic data generators unless a real dataset is intentionally mapped later.

Use deterministic pseudo-random generators for:

- market yes/no values
- flow ladder widths
- waveform phase offsets
- spectrum amplitudes
- lattice digits
- gauge percentages
- radar targets

This allows animation stability and exact visual tuning.

## Acceptance Criteria

The implementation is correct only if all of the following are true:

- the stage reads as monochrome terminal instrumentation at first glance
- the 3-column composition matches the reference hierarchy
- the central helix terrain is the visual focal point
- all supporting panels are denser and smaller than the center panel
- no panel looks like a modern card UI
- all motion feels like instrumentation drift, not UI choreography
- the right radar panel has a true rotating sweep
- the frequency spectrum spans nearly the full width with dense bars
- the lower gauges are semi-circular and understated
- typography stays small, mono, uppercase, and grid-like

## Non-Negotiable Implementation Rules

- do not use generic dashboard components from UI kits
- do not use bright accent colors
- do not use rounded corners above `2px`
- do not use blurred glass panels
- do not use drop shadows as a primary depth cue
- do not replace the helix scene with a static image
- do not use off-the-shelf chart defaults

## Delivery Sequence

Implement in this order:

1. stage shell and shared panel chrome
2. telemetry strip
3. left column table, ladder, and logs
4. right column radar, lattice, and gauges
5. center waveform and spectrum
6. central helix engine with exact tuning
7. global polish: scanlines, flicker restraint, text tuning

## Definition of Done

Done means:

- a paused screenshot from the app is visually very close to the video frame
- an animated recording from the app preserves the same slow-living dashboard behavior
- the dashboard feels denser, darker, and more technical than the current implementation
- no part of the UI reads like a compromise toward ordinary productivity software

