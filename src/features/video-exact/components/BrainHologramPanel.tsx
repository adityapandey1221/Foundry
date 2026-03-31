import React, { useRef, useMemo, Suspense, memo } from 'react';
import { useFrame, useLoader, Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { HudPanel } from './HudPanel';
import { useHabitHudData } from '../hooks/useHabitHudData';
import { getMonthDates } from '../../../utils/dates';
import { getThemeColor } from '../../../utils/theme';

// ─── Holographic shader material ─────────────────────────────────────────────
class HolographicBrainMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        time: { value: 0 },
        fresnelOpacity: { value: 0.85 },
        fresnelAmount: { value: 0.5 },
        scanlineSize: { value: 8.0 },
        hologramBrightness: { value: 0.8 },
        signalSpeed: { value: 0.45 },
        hologramColor: { value: new THREE.Color('#5fb3ff') },
        hologramOpacity: { value: 1.0 },
        completionPct: { value: 0.75 },
      },
      vertexShader: `
        #define STANDARD
        varying vec3 vViewPosition;
        varying vec2 vUv;
        varying vec4 vPos;
        varying vec3 vNormalW;
        varying vec3 vPositionW;

        #include <common>
        #include <uv_pars_vertex>
        #include <color_pars_vertex>
        #include <fog_pars_vertex>
        #include <morphtarget_pars_vertex>
        #include <skinning_pars_vertex>
        #include <logdepthbuf_pars_vertex>
        #include <clipping_planes_pars_vertex>

        void main() {
          #include <uv_vertex>
          #include <color_vertex>
          #include <morphcolor_vertex>
          #include <begin_vertex>
          #include <morphtarget_vertex>
          #include <skinning_vertex>
          #include <project_vertex>
          #include <logdepthbuf_vertex>
          #include <clipping_planes_vertex>
          #include <worldpos_vertex>
          #include <fog_vertex>

          mat4 modelViewProjectionMatrix = projectionMatrix * modelViewMatrix;
          vUv = uv;
          vPos = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
          vPositionW = vec3(vec4(transformed, 1.0) * modelMatrix);
          vNormalW = normalize(vec3(vec4(normal, 0.0) * modelMatrix));
          gl_Position = modelViewProjectionMatrix * vec4(transformed, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vPositionW;
        varying vec4 vPos;
        varying vec3 vNormalW;

        uniform float time;
        uniform float fresnelOpacity;
        uniform float scanlineSize;
        uniform float fresnelAmount;
        uniform float signalSpeed;
        uniform float hologramBrightness;
        uniform float hologramOpacity;
        uniform vec3 hologramColor;
        uniform float completionPct;

        float flicker(float amt, float t) {
          return clamp(fract(cos(t) * 43758.5453123), amt, 1.0);
        }
        float random(in float a, in float b) {
          return fract(cos(dot(vec2(a, b), vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
          vec2 vCoords = vPos.xy / vPos.w * 0.5 + 0.5;
          vec2 myUV = fract(vCoords);

          float brightness = mix(0.0, hologramBrightness * 0.6, completionPct);
          vec4 hColor = vec4(hologramColor, mix(brightness, vUv.y, 0.3));

          float scanlines = 10.0;
          scanlines += 20.0 * sin(time * signalSpeed * 20.8 - myUV.y * 60.0 * scanlineSize);
          scanlines *= smoothstep(1.3 * cos(time * signalSpeed + myUV.y * scanlineSize), 0.78, 0.9);
          scanlines *= max(0.25, sin(time * signalSpeed) * 1.0);
          scanlines *= completionPct;

          float r = random(vUv.x, vUv.y);
          float g = random(vUv.y * 20.2, vUv.y * 0.2);
          float b = random(vUv.y * 0.9, vUv.y * 0.2);
          hColor += vec4(r * scanlines, b * scanlines, r, 1.0) / 84.0;
          vec4 scanlineMix = mix(vec4(0.0), hColor, hColor.a);

          vec3 viewDir = normalize(cameraPosition - vPositionW);
          float fresnelEffect = dot(viewDir, vNormalW) * (1.6 - fresnelOpacity / 2.0);
          fresnelEffect = clamp(fresnelAmount - fresnelEffect, 0.0, fresnelOpacity);
          fresnelEffect *= mix(0.3, 1.0, completionPct);

          float blink = flicker(0.6 - signalSpeed, time * signalSpeed * 0.02);

          vec3 finalColor = scanlineMix.rgb * blink + fresnelEffect;
          gl_FragColor = vec4(finalColor, hologramOpacity * mix(0.05, 0.7, completionPct));
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }
}

// ─── Brain mesh rendering ───────────────────────────────────────────────────
const BrainMesh: React.FC<{ pct: number }> = ({ pct }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const gltf = useLoader(GLTFLoader, '/brain.glb');

  const { geometry, scale, offsetY, material } = useMemo(() => {
    let geo: THREE.BufferGeometry | null = null;
    gltf.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && !geo) {
        geo = (child as THREE.Mesh).geometry.clone();
      }
    });
    const scale = 1.1;
    const offsetY = 0.3;
    const mat = new HolographicBrainMaterial();
    mat.uniforms.hologramColor.value.set(getThemeColor('video-exact'));
    return { geometry: geo, scale, offsetY, material: mat };
  }, [gltf]);

  useFrame((state) => {
    if (meshRef.current && meshRef.current.material instanceof HolographicBrainMaterial) {
      const mat = meshRef.current.material as HolographicBrainMaterial;
      mat.uniforms.time.value = state.clock.elapsedTime;
      mat.uniforms.completionPct.value = pct;
    }
  });

  if (!geometry) {
    return null;
  }

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      scale={[scale, scale, scale]}
      position={[0, offsetY, 0]}
      rotation={[-1 * Math.PI / 2, 0, 0]}
    />
  );
};

// ─── Wireframe overlay ──────────────────────────────────────────────────────
const BrainWireframe: React.FC<{ pct: number }> = ({ pct }) => {
  const gltf = useLoader(GLTFLoader, '/brain.glb');

  const lineSegmentsRef = useRef<THREE.LineSegments>(null);

  const { lineSegmentsGeometry, material, scale, offsetY } = useMemo(() => {
    let srcGeo: THREE.BufferGeometry | null = null;
    gltf.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && !srcGeo) {
        srcGeo = (child as THREE.Mesh).geometry;
      }
    });
    if (!srcGeo) return { lineSegmentsGeometry: null, material: null, scale: 1, offsetY: 0 };

    const wfGeo = new THREE.WireframeGeometry(srcGeo);
    const positions = wfGeo.attributes.position.array;
    const colors: number[] = [];
    const wireframeColor = new THREE.Color(getThemeColor('video-exact'));
    for (let i = 0; i < positions.length; i += 3) {
      colors.push(wireframeColor.r, wireframeColor.g, wireframeColor.b);
    }
    wfGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    return { lineSegmentsGeometry: wfGeo, material: mat, scale: 1.1, offsetY: 0.3 };
  }, [gltf]);

  useFrame(() => {
    if (lineSegmentsRef.current && lineSegmentsRef.current.material instanceof THREE.LineBasicMaterial) {
      (lineSegmentsRef.current.material as THREE.LineBasicMaterial).opacity = 0.4 + pct * 0.5;
    }
  });

  if (!lineSegmentsGeometry || !material) return null;

  return (
    <lineSegments
      ref={lineSegmentsRef}
      geometry={lineSegmentsGeometry}
      material={material}
      scale={[scale, scale, scale]}
      position={[0, offsetY, 0]}
      rotation={[-1 * Math.PI / 2, 0, 0]}
    />
  );
};

// ─── Brain scene ────────────────────────────────────────────────────────────
const BrainScene: React.FC<{ pct: number }> = ({ pct }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.4, 0]}>
      <Suspense fallback={null}>
        <BrainMesh pct={pct} />
        <BrainWireframe pct={pct} />
      </Suspense>
    </group>
  );
};

// ─── Calculate month completion ─────────────────────────────────────────────
function calculateMonthCompletion(
  habits: any[],
  completions: Record<string, string[]>,
  year: number,
  month: number
): number {
  const activeHabits = habits.filter((h) => h.isActive);
  const totalPossible = activeHabits.length || 1;
  const monthDates = getMonthDates(year, month);

  let totalCompleted = 0;
  monthDates.forEach((date) => {
    const dayCompletions = completions[date] || [];
    dayCompletions.forEach((habitId) => {
      if (activeHabits.find((h) => h.id === habitId)) {
        totalCompleted++;
      }
    });
  });

  const totalMonthPossible = totalPossible * monthDates.length;
  return totalMonthPossible === 0 ? 0 : Math.round((totalCompleted / totalMonthPossible) * 100);
}

// ─── Main component ────────────────────────────────────────────────────────
const BrainHologramPanelComponent: React.FC = () => {
  const habitHudData = useHabitHudData();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const pct = calculateMonthCompletion(
    habitHudData.habits,
    habitHudData.completions,
    year,
    month
  ) / 100;

  return (
    <HudPanel title="COGNITION" meta="HOLOGRAM">
      <div style={{ width: '100%', height: '270px' }}>
        <Canvas
          camera={{ position: [0, 0, 3.5], fov: 40 }}
          gl={{ alpha: true, antialias: true }}
          style={{ background: 'transparent', width: '100%', height: '100%' }}
        >
          <Suspense fallback={null}>
            <BrainScene pct={pct} />
            <EffectComposer>
              <Bloom
                intensity={pct * 1.2}
                luminanceThreshold={0.2}
                luminanceSmoothing={0.9}
                radius={0.6}
              />
            </EffectComposer>
          </Suspense>
        </Canvas>
        <div
          style={{
            textAlign: 'center',
            fontFamily: '"IBM Plex Mono", "Space Mono", ui-monospace, monospace',
            fontSize: '11px',
            fontWeight: 'bold',
            color: 'rgba(95, 179, 255, 0.8)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginTop: '4px',
          }}
        >
          {Math.round(pct * 100)}%
        </div>
      </div>
    </HudPanel>
  );
};

export const BrainHologramPanel = memo(BrainHologramPanelComponent);
