# Feature Spec: Holographic Body Visualization (Three.js, Procedural)

## Overview

A glowing, translucent, front-facing human body figure that acts as a completion indicator. One figure per week, arranged in a horizontal row. Glow intensity is driven by that week's habit completion percentage — 100% = full radiance, 0% = barely-visible ghost.

Built entirely in `react-three-fiber` with a procedurally generated body (no external model files, no Blender, no image assets). The body is constructed from basic Three.js geometries (capsules, spheres, cylinders) composed into a recognizable human form, then rendered with a custom holographic emission shader + bloom post-processing.

---

## Dependencies

```bash
npm install @react-three/fiber @react-three/drei @react-three/postprocessing three
```

- `@react-three/fiber` — React renderer for Three.js
- `@react-three/drei` — helpers (Float, MeshTransmissionMaterial, etc.)
- `@react-three/postprocessing` — bloom/glow post-processing
- `three` — core Three.js library

---

## Procedural Body Construction

The body is NOT loaded from a file. It's built from ~12 primitive meshes arranged into a human figure. This is intentional — the simplified geometric construction reinforces the "wireframe HUD scan" aesthetic. It should look like a body assembled from geometric primitives on a military display, not a photorealistic human.

### Body Part Tree

All parts are children of a single `<group>` so the whole figure can be positioned/scaled as one unit. Y=0 is at the feet. Total height ~2.0 units.

```
Body (group, centered at origin)
├── Head          — sphere, radius 0.12, position [0, 1.75, 0]
├── Neck          — cylinder, radius 0.04, height 0.08, position [0, 1.62, 0]
├── Torso Upper   — capsule or tapered cylinder, radiusTop 0.18, radiusBottom 0.15, height 0.35, position [0, 1.38, 0]
├── Torso Lower   — capsule or tapered cylinder, radiusTop 0.15, radiusBottom 0.13, height 0.25, position [0, 1.08, 0]
├── Hip           — sphere (flattened), radius 0.14, scaleY 0.5, position [0, 0.93, 0]
├── Left Upper Arm  — cylinder, radius 0.04, height 0.28, position [-0.24, 1.38, 0], rotateZ ~15°
├── Left Forearm    — cylinder, radius 0.035, height 0.25, position [-0.30, 1.10, 0], rotateZ ~10°
├── Right Upper Arm — (mirror of left)
├── Right Forearm   — (mirror of left)
├── Left Thigh      — cylinder, radius 0.065, height 0.38, position [-0.09, 0.62, 0]
├── Left Shin       — cylinder, radius 0.045, height 0.35, position [-0.09, 0.27, 0]
├── Right Thigh     — (mirror of left)
├── Right Shin      — (mirror of left)
├── Left Foot       — box, 0.06 × 0.03 × 0.12, position [-0.09, 0.04, 0.03]
└── Right Foot      — (mirror of left)
```

**Geometry notes:**
- Use `CylinderGeometry` or `CapsuleGeometry` for limbs and torso (capsule looks more organic)
- Use `SphereGeometry` for the head and hips
- All meshes: low segment count (8–12 radial segments) — this is deliberate. The low-poly faceting is part of the HUD wireframe aesthetic. Do NOT smooth these to high-poly.
- All parts share the same holographic material (see below)

### Wireframe Overlay

In addition to the solid meshes, add a second render pass of the entire body group using `<meshBasicMaterial wireframe={true}>` at low opacity (0.15–0.25). This creates the visible edge lines that make it read as "wireframe scan" rather than "solid mannequin."

Implementation: duplicate the body `<group>`, apply `wireframe: true` material, set `depthWrite: false` and `transparent: true` so it overlays cleanly on the solid meshes.

---

## Holographic Shader Material

A custom `ShaderMaterial` applied to all body parts. This is the core of the visual effect.

### Uniforms

```javascript
uniforms: {
  uCompletionPct: { value: 0.75 },      // 0.0–1.0, drives everything
  uTime:          { value: 0.0 },        // elapsed time for animations
  uBaseColor:     { value: new THREE.Color('#29A634') },  // --accent-3 green
  uBrightColor:   { value: new THREE.Color('#62D96B') },  // --accent-5 bright green
}
```

### Vertex Shader

Standard pass-through. Compute `vWorldPosition` and `vNormal` for the fragment shader. Also pass `vUv` for scan line calculation.

```glsl
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
  vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  vNormal = normalize(normalMatrix * normal);
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

### Fragment Shader

```glsl
uniform float uCompletionPct;
uniform float uTime;
uniform vec3 uBaseColor;
uniform vec3 uBrightColor;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
  // === Fresnel rim glow (brighter at edges, like a real hologram) ===
  vec3 viewDir = normalize(cameraPosition - vWorldPosition);
  float fresnel = 1.0 - dot(viewDir, vNormal);
  fresnel = pow(fresnel, 2.0);

  // === Scan line (horizontal bar sweeping vertically) ===
  float scanY = mod(uTime * 0.3, 2.2) - 0.1;  // sweeps over body height range
  float scanLine = smoothstep(0.02, 0.0, abs(vWorldPosition.y - scanY));
  scanLine *= 0.4;  // scan line intensity

  // === Height-based energy gradient (brighter at torso, dimmer at extremities) ===
  float heightFactor = smoothstep(0.0, 1.0, vWorldPosition.y) *
                       smoothstep(2.0, 1.0, vWorldPosition.y);
  // peaks ~1.0 at mid-body, fades at head and feet

  // === Composite base intensity ===
  float baseIntensity = mix(0.05, 0.5, uCompletionPct);   // 0% = ghost, 100% = bright
  float rimIntensity  = fresnel * mix(0.1, 0.8, uCompletionPct);
  float energyFill    = heightFactor * mix(0.0, 0.3, uCompletionPct);

  float totalIntensity = baseIntensity + rimIntensity + energyFill + scanLine;

  // === Color: mix base green toward bright green as intensity increases ===
  vec3 color = mix(uBaseColor, uBrightColor, totalIntensity);

  // === Output ===
  gl_FragColor = vec4(color, totalIntensity * 0.9);
  // Semi-transparent — the dark background bleeds through at low completion
}
```

**Key visual behaviors:**
- At 0% completion: the figure is a dim, barely-visible green ghost. Fresnel rim gives it just enough edge definition to be recognizable.
- At 50%: moderate glow, the torso core is clearly lit, limbs are dimmer.
- At 100%: bright emission from all surfaces, strong rim glow, the bloom post-processing makes it radiate light onto the surrounding black.
- The scan line sweeps vertically at all non-zero completion values, reinforcing the "active scan" feeling.

---

## Bloom Post-Processing

This is critical. Without bloom, the emission shader looks flat. With bloom, the figure appears to emit actual light. This is the difference between "colored mesh" and "hologram."

```jsx
import { EffectComposer, Bloom } from '@react-three/postprocessing';

<EffectComposer>
  <Bloom
    intensity={1.2}           // overall bloom strength
    luminanceThreshold={0.2}  // only bloom bright areas (the body emission)
    luminanceSmoothing={0.9}  // soft falloff
    radius={0.8}              // glow spread
  />
</EffectComposer>
```

The bloom bleeds the bright green emission outward, creating the ambient glow halo around the figure. At high completion %, this halo is clearly visible. At low %, it's subtle.

---

## React Component

### Single Figure

```jsx
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function BodyHologram({ completionPercent = 75, position = [0, 0, 0] }) {
  const groupRef = useRef();
  const materialRef = useRef();
  const pct = Math.max(0, Math.min(100, completionPercent)) / 100;

  // Custom shader material (shared definition, unique uniform instances)
  const hologramMaterial = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: VERTEX_SHADER,     // from above
    fragmentShader: FRAGMENT_SHADER, // from above
    uniforms: {
      uCompletionPct: { value: pct },
      uTime: { value: 0 },
      uBaseColor: { value: new THREE.Color('#29A634') },
      uBrightColor: { value: new THREE.Color('#62D96B') },
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), []);

  // Animate time uniform
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uCompletionPct.value = pct;
    }
  });

  // Store material ref
  useMemo(() => { materialRef.current = hologramMaterial; }, [hologramMaterial]);

  return (
    <group ref={groupRef} position={position} scale={[0.8, 0.8, 0.8]}>
      {/* === SOLID BODY (emissive hologram shader) === */}
      <group>
        {/* Head */}
        <mesh position={[0, 1.75, 0]} material={hologramMaterial}>
          <sphereGeometry args={[0.12, 10, 8]} />
        </mesh>
        {/* Neck */}
        <mesh position={[0, 1.62, 0]} material={hologramMaterial}>
          <cylinderGeometry args={[0.04, 0.04, 0.08, 8]} />
        </mesh>
        {/* Upper Torso */}
        <mesh position={[0, 1.38, 0]} material={hologramMaterial}>
          <capsuleGeometry args={[0.16, 0.30, 4, 8]} />
        </mesh>
        {/* Lower Torso */}
        <mesh position={[0, 1.05, 0]} material={hologramMaterial}>
          <capsuleGeometry args={[0.13, 0.20, 4, 8]} />
        </mesh>
        {/* Hips */}
        <mesh position={[0, 0.93, 0]} scale={[1, 0.5, 0.7]} material={hologramMaterial}>
          <sphereGeometry args={[0.15, 8, 6]} />
        </mesh>

        {/* Left Arm */}
        <mesh position={[-0.26, 1.38, 0]} rotation={[0, 0, 0.26]} material={hologramMaterial}>
          <capsuleGeometry args={[0.04, 0.26, 3, 6]} />
        </mesh>
        <mesh position={[-0.32, 1.08, 0]} rotation={[0, 0, 0.15]} material={hologramMaterial}>
          <capsuleGeometry args={[0.035, 0.24, 3, 6]} />
        </mesh>
        {/* Right Arm (mirrored) */}
        <mesh position={[0.26, 1.38, 0]} rotation={[0, 0, -0.26]} material={hologramMaterial}>
          <capsuleGeometry args={[0.04, 0.26, 3, 6]} />
        </mesh>
        <mesh position={[0.32, 1.08, 0]} rotation={[0, 0, -0.15]} material={hologramMaterial}>
          <capsuleGeometry args={[0.035, 0.24, 3, 6]} />
        </mesh>

        {/* Left Leg */}
        <mesh position={[-0.09, 0.62, 0]} material={hologramMaterial}>
          <capsuleGeometry args={[0.065, 0.34, 4, 6]} />
        </mesh>
        <mesh position={[-0.09, 0.26, 0]} material={hologramMaterial}>
          <capsuleGeometry args={[0.045, 0.30, 4, 6]} />
        </mesh>
        {/* Right Leg (mirrored) */}
        <mesh position={[0.09, 0.62, 0]} material={hologramMaterial}>
          <capsuleGeometry args={[0.065, 0.34, 4, 6]} />
        </mesh>
        <mesh position={[0.09, 0.26, 0]} material={hologramMaterial}>
          <capsuleGeometry args={[0.045, 0.30, 4, 6]} />
        </mesh>

        {/* Feet */}
        <mesh position={[-0.09, 0.04, 0.03]} material={hologramMaterial}>
          <boxGeometry args={[0.06, 0.03, 0.12]} />
        </mesh>
        <mesh position={[0.09, 0.04, 0.03]} material={hologramMaterial}>
          <boxGeometry args={[0.06, 0.03, 0.12]} />
        </mesh>
      </group>

      {/* === WIREFRAME OVERLAY === */}
      <group>
        {/* Duplicate the same meshes with wireframe material */}
        {/* Use a meshBasicMaterial with wireframe: true, color: #43BF4D,
            opacity: 0.15 + pct * 0.15, transparent: true, depthWrite: false */}
        {/* ... same geometry as above, different material ... */}
      </group>
    </group>
  );
}
```

### Row of Figures (one per week)

```jsx
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

function BodyHologramRow({ weekSummaries, currentWeekStart }) {
  const count = weekSummaries.length;
  const spacing = 1.8; // distance between figures
  const offsetX = -(count - 1) * spacing / 2; // center the row

  return (
    <div style={{ width: '100%', height: '280px', background: 'transparent' }}>
      <Canvas
        camera={{ position: [0, 1.0, 4.5], fov: 40 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        {/* No lights needed — emission shader is self-lit */}

        {weekSummaries.map((week, i) => (
          <BodyHologram
            key={week.weekStart}
            completionPercent={week.overallPercentage}
            position={[offsetX + i * spacing, 0, 0]}
          />
        ))}

        <EffectComposer>
          <Bloom
            intensity={1.2}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            radius={0.8}
          />
        </EffectComposer>
      </Canvas>

      {/* HTML labels below the canvas (positioned with flexbox) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        padding: '8px 0',
      }}>
        {weekSummaries.map((week, i) => (
          <div key={week.weekStart} style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}>
              WEEK {i + 1}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '14px',
              color: week.overallPercentage >= 70
                ? 'var(--text-accent)'
                : 'var(--text-secondary)',
            }}>
              {Math.round(week.overallPercentage)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Integration into Dashboard

```jsx
<Panel title="WEEKLY COMPLETION %">
  <BodyHologramRow
    weekSummaries={monthSummary.weeks}
    currentWeekStart={currentWeekStart}
  />
</Panel>
```

---

## Camera & Scene Setup

- Camera: perspective, FOV 40°, positioned at `[0, 1.0, 4.5]` (eye level with the figures' torsos, a few meters back)
- Background: transparent (`gl={{ alpha: true }}`) — the panel's dark background shows through
- No scene lights. The figures are entirely self-illuminated via the emission shader. Adding ambient or directional lights would wash out the holographic effect.
- No orbit controls. The camera is fixed. These are dashboard indicators, not 3D models to rotate.

---

## Animation Details

### Scan Line
Handled in the fragment shader via `uTime`. The scan line sweeps from feet (y=0) to head (y=2.0) and wraps. Speed: ~0.3 units/second = one full sweep every ~7 seconds. Slow and mechanical.

### Current-Week Breathing Pulse
For the figure whose `weekStart === currentWeekStart`, add a slow oscillation to `uCompletionPct`:

```javascript
useFrame((state) => {
  if (isCurrentWeek) {
    const breathe = Math.sin(state.clock.elapsedTime * 1.2) * 0.08;
    materialRef.current.uniforms.uCompletionPct.value = pct + breathe;
  }
});
```

This makes the current week's figure subtly pulse brighter and dimmer (~±8% intensity), distinguishing it from completed past weeks that glow at a fixed intensity.

### Mount Animation
On component mount, each figure fades in with staggered timing:

```jsx
const [mounted, setMounted] = useState(false);
useEffect(() => {
  const timer = setTimeout(() => setMounted(true), index * 150);
  return () => clearTimeout(timer);
}, []);

// In the group:
<group scale={mounted ? [0.8, 0.8, 0.8] : [0, 0, 0]}
       // Use spring animation via @react-three/drei's useSpring or manual lerp
>
```

---

## Visual Intensity Reference

| Completion % | Body Appearance | Bloom Halo | Wireframe |
|---|---|---|---|
| 0% | Barely visible dark green ghost | None | Faint edges only |
| 25% | Dim green, edges more visible than fill | Minimal | Visible |
| 50% | Medium glow, torso clearly lit, limbs dimmer | Soft green halo | Clear |
| 75% | Bright, strong rim glow, scan line obvious | Prominent halo | Bright |
| 100% | Full radiance, entire body emitting, hot core | Strong bloom spill | Vivid |

---

## Performance Notes

- The entire row (4–5 figures) is one `<Canvas>` with one `EffectComposer`. This means one WebGL context and one bloom pass for all figures — not one per figure.
- Low-poly geometry (~12 meshes × ~100 faces each = ~1,200 total triangles for all 5 figures) — trivial for any GPU.
- Shader is simple (no texture lookups, no raymarching). Fragment shader cost is negligible.
- Bloom is the most expensive part. With `radius: 0.8` on a 280px tall canvas, it's fast.
- Total bundle addition: ~150–200KB gzipped for Three.js + postprocessing. Acceptable for a desktop dashboard.

---

## Acceptance Criteria

- [ ] Body is recognizable as a human figure at the rendered size (~100–120px wide per figure)
- [ ] At 0%, figure is a barely-visible ghost — NOT invisible, NOT bright
- [ ] At 100%, figure radiates visible green light with bloom halo on the black background
- [ ] Scan line sweeps vertically through the body continuously
- [ ] Current week's figure visibly pulses/breathes, others are static
- [ ] Figures load with staggered fade-in
- [ ] 4–5 figures fit in a single panel row without crowding
- [ ] Labels (WEEK 1, 82%) appear below each figure, styled per the design system
- [ ] No external model files — body is built from Three.js primitives in code
- [ ] Canvas background is transparent (panel background shows through)
- [ ] No performance issues — 60fps on a 2020+ laptop

---

## v2 Extensions (NOT in scope)

- Per-muscle-group activation (separate materials per body part, driven by specific habit categories)
- Hover interaction: mouse over a body part → tooltip showing associated habits
- Brain wireframe (second figure using the same shader pipeline, different geometry)
- Comparison mode: side-by-side current week vs best week
