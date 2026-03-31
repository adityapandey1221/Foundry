# Brain Hologram Integration Spec

## Overview
Replace the RingGaugesPanel (bottom-right of dashboard) with an animated holographic brain that displays monthly habit completion percentage. The brain should match the video-exact design theme's monochrome, opacity-based aesthetic while maintaining the holographic effect from the main branch.

## Design Principles
- **Color Scheme**: Video-exact uses monochrome opacity hierarchy. Brain hologram should use a bluish-cyan color (`#5fb3ff` or similar) that fits the minimal aesthetic
- **Opacity Animation**: The hologram's brightness/opacity should vary based on completion percentage
- **Size**: Fixed height of 270px to fit the right rail's bottom section
- **Font**: Match dashboard typography (IBM Plex Mono)
- **Glitch/Scan Effects**: Keep the holographic scanlines but reduce intensity to fit the more minimal theme

## Current State
- **RingGaugesPanel**: Three SVG speedometer gauges showing synthetic telemetry data
- **Location**: Right rail, third row (bottom section)
- **Grid Size**: 23fr height allocation

## Implementation Requirements

### 1. Create BrainHologramPanel Component
- Wrap BrainHologram (from main) with HudPanel
- Title: "SYSTEM" or "NEURAL" or "COGNITION"
- Meta: "HOLOGRAM"
- Display monthly completion percentage in center
- Integrate useHabitHudData hook for actual habit data

### 2. Color Customization
- Add "video-exact" theme to theme.ts
- Primary color: `#5fb3ff` (soft cyan, matches opacity aesthetic)
- Dim color: `#2d4a6f` (darker muted blue)
- Brightness multiplier: Reduce hologram brightness to 0.8x (less intense than matrix/jarvis)

### 3. Hologram Behavior
- Display current month's completion percentage
- Brain rotates continuously at gentle speed
- Wireframe opacity increases with completion %
- Scanline intensity increases with completion %
- Glow/bloom effect scaled to match current month data

### 4. Integration Points
- Replace third element in right rail RailShell
- Use useHabitHudData for monthly data
- Pass theme prop as "video-exact"

## File Structure
```
src/features/video-exact/components/
  ├── BrainHologramPanel.tsx (new)
  ├── VideoExactDashboard.tsx (modify import)

src/utils/
  └── theme.ts (add video-exact theme)
```

## Success Criteria
- Brain hologram displays in place of ring gauges
- Color matches video-exact monochrome aesthetic
- Completion percentage displayed below brain
- Brain rotates smoothly with subtle animation
- Hologram glow/scanlines respond to completion percentage
- No console errors or Three.js warnings
