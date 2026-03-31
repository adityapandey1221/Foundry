# Body Hologram Integration Spec

## Overview
Replace the IO gauge (rightmost gauge in RingGaugesPanel) with a holographic body visualization that displays daily habit completion metrics using the same design patterns established for the brain hologram integration.

## Design Principles
- **Visual Consistency**: Match brain hologram styling and sizing (135px max width, 105px canvas height)
- **Data Metric**: Display daily completion percentage (habits completed today / total active habits * 100)
- **Theme Alignment**: Use video-exact color theme (white hologram with minimal brightness, monochrome aesthetic)
- **Rendering**: Three.js + React Three Fiber with holographic shader material

## Component Structure

### BodyHologramPanel.tsx
A dedicated component similar to BrainHologramPanel.tsx:
- **HolographicBodyMaterial**: Custom THREE.ShaderMaterial (reuse shader logic from brain with body-specific parameters)
- **BodyMesh**: Loads and renders body geometry from `/body.glb`
- **BodyWireframe**: Overlays wireframe visualization (optional, matches brain implementation)
- **BodyScene**: Manages rotation animation and scene composition
- **calculateDayCompletion()**: Helper function to compute daily completion percentage
- **BodyHologramPanelComponent**: Main render component wrapping Canvas

### Integration into RingGaugesPanel.tsx
- Create a **BodyGauge** component wrapper function (similar to BrainGauge)
- Update grid layout to use:
  - Column 1: BrainGauge (monthly completion)
  - Column 2: NET Gauge (existing synthetic telemetry)
  - Column 3: BodyGauge (daily completion)

## Technical Specifications

### Data Source
- **Metric**: Daily completion = (habits completed today / total active habits) × 100
- **Calculation**: Inspect completions for today's date, count matching active habits
- **Update**: Real-time via `useHabitHudData()` hook

### 3D Rendering Parameters
- **Canvas**: 135px max-width, 105px height, transparent background
- **Camera**: position [0, 0, 3], fov 30 (consistent with brain hologram)
- **Scene Position**: y offset -0.3 (consistent with brain)
- **Rotation**: y-axis rotation based on elapsed time (0.5 * time + 0.1 * delta)
- **Bloom Effect**: intensity = pct * 0.1, luminanceThreshold 0.2, radius 0.3

### Shader Material
- **Color**: White hologram (#ffffff) or theme color
- **Brightness**: 0.1 (minimal, monochrome aesthetic)
- **Scanlines**: Animated based on time
- **Fresnel Effect**: Based on view angle
- **Completion Opacity**: Dynamic based on daily completion percentage

### Display Format
- **Below Canvas**: Daily completion percentage (e.g., "45%")
- **Typography**: 10px, monospace, letter-spacing 0.14em, white at 0.84 opacity
- **Container**: Centered, aligned with other gauges using grid baseline

## Model Asset
- **File**: `/body.glb` (to be placed in public directory)
- **Alternative**: If body.glb unavailable, may reuse brain.glb with different styling
- **Scale**: Sized to fit 135px × 105px container while maintaining proportions

## Layout Integration
- **Panel Title**: "RING GAUGES" (unchanged)
- **Meta Label**: "BRAIN / NET / BODY" (updated from "BRAIN / NET / IO")
- **Grid**: 3-column layout with equal spacing
- **Alignment**: All gauges bottom-aligned using flexbox baseline

## Animation & Interactivity
- **Continuous Rotation**: Body slowly rotates on y-axis in 3D space
- **Shader Animation**: Scanlines and Fresnel effects based on elapsed time
- **Completion Responsiveness**: Bloom intensity, opacity, and brightness respond to completion %

## Success Criteria
✅ Body hologram renders in place of IO gauge
✅ Daily completion percentage displayed accurately
✅ Sized and aligned identically to brain hologram
✅ Smooth 3D rotation and shader animations
✅ Theme-consistent coloring (white/minimal brightness)
✅ No scroll blocking or layout issues
✅ Performance: <60ms per frame on standard hardware
