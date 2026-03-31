import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { HudPanel } from './HudPanel';
import { useSyntheticTelemetry } from '../hooks/useSyntheticTelemetry';
import { useHabitHudData } from '../hooks/useHabitHudData';
import { getMonthDates } from '../../../utils/dates';

const describeArc = (cx: number, cy: number, radius: number, startAngle: number, endAngle: number) => {
  const toPoint = (angle: number) => {
    const radians = (angle - 90) * (Math.PI / 180);
    return {
      x: cx + radius * Math.cos(radians),
      y: cy + radius * Math.sin(radians),
    };
  };

  const start = toPoint(endAngle);
  const end = toPoint(startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
};

function Gauge({ label, value }: { label: string; value: number }) {
  const start = -120;
  const end = 120;
  const angle = start + ((end - start) * value) / 100;
  const radians = (angle - 90) * (Math.PI / 180);
  const needleX = 48 + 24 * Math.cos(radians);
  const needleY = 48 + 24 * Math.sin(radians);

  return (
    <div style={{ display: 'grid', gap: '6px', justifyItems: 'center', height: '100%', alignItems: 'end' }}>
      <svg viewBox="0 0 96 64" style={{ width: '100%', maxWidth: '135px', height: '70px', overflow: 'visible' }}>
        <path
          d={describeArc(48, 48, 33, start, end)}
          fill="none"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="1.5"
        />

        {Array.from({ length: 15 }, (_, index) => {
          const tickAngle = start + ((end - start) * index) / 14;
          const outerRadians = (tickAngle - 90) * (Math.PI / 180);
          const innerRadius = index % 2 === 0 ? 25 : 28;
          const outerRadius = 33;
          const x1 = 48 + innerRadius * Math.cos(outerRadians);
          const y1 = 48 + innerRadius * Math.sin(outerRadians);
          const x2 = 48 + outerRadius * Math.cos(outerRadians);
          const y2 = 48 + outerRadius * Math.sin(outerRadians);

          return (
            <line
              key={tickAngle}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1"
            />
          );
        })}

        <line
          x1="48"
          y1="48"
          x2={needleX}
          y2={needleY}
          stroke="rgba(255,255,255,0.84)"
          strokeWidth="1.6"
        />
        <circle cx="48" cy="48" r="2.5" fill="rgba(255,255,255,0.82)" />
      </svg>

      <div style={{ display: 'grid', gap: '2px', justifyItems: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,0.48)', fontSize: '9px', letterSpacing: '0.18em' }}>{label}</span>
        <span style={{ color: 'rgba(255,255,255,0.84)', fontSize: '10px', letterSpacing: '0.14em' }}>{value}%</span>
      </div>
    </div>
  );
}

// Calculate month completion
function calculateMonthCompletion(
  habits: any[],
  completions: Record<string, string[]>
): number {
  const activeHabits = habits.filter((h) => h.isActive);
  const totalPossible = activeHabits.length || 1;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
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

// Holographic shader material
class HolographicBrainMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        time: { value: 0 },
        fresnelOpacity: { value: 0.85 },
        fresnelAmount: { value: 0.5 },
        scanlineSize: { value: 8.0 },
        hologramBrightness: { value: 0.1 },
        signalSpeed: { value: 0.45 },
        hologramColor: { value: new THREE.Color('#ffffff') },
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

// Brain mesh
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
    const scale = 0.8;
    const offsetY = 0.3;
    const mat = new HolographicBrainMaterial();
    return { geometry: geo, scale, offsetY, material: mat };
  }, [gltf]);

  useFrame((state) => {
    if (meshRef.current && meshRef.current.material instanceof HolographicBrainMaterial) {
      const mat = meshRef.current.material as HolographicBrainMaterial;
      mat.uniforms.time.value = state.clock.elapsedTime;
      mat.uniforms.completionPct.value = pct;
    }
  });

  if (!geometry) return null;

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

// Brain wireframe
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
    const wireframeColor = new THREE.Color('#ffffff');
    for (let i = 0; i < positions.length; i += 3) {
      colors.push(wireframeColor.r, wireframeColor.g, wireframeColor.b);
    }
    wfGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.1,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    return { lineSegmentsGeometry: wfGeo, material: mat, scale: 0.8, offsetY: 0.3 };
  }, [gltf]);

  useFrame(() => {
    if (lineSegmentsRef.current && lineSegmentsRef.current.material instanceof THREE.LineBasicMaterial) {
      (lineSegmentsRef.current.material as THREE.LineBasicMaterial).opacity = 0.05 + pct * 0.1;
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

// Brain scene
const BrainScene: React.FC<{ pct: number }> = ({ pct }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.3, 0]}>
      <Suspense fallback={null}>
        <BrainMesh pct={pct} />
        <BrainWireframe pct={pct} />
      </Suspense>
    </group>
  );
};

// Compact brain gauge
function BrainGauge() {
  const habitHudData = useHabitHudData();
  const pct = calculateMonthCompletion(habitHudData.habits, habitHudData.completions) / 100;

  return (
    <div style={{ display: 'grid', gap: '6px', justifyItems: 'center', height: '100%', width: '100%', alignItems: 'end' }}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 30 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent', width: '100%', maxWidth: '135px', height: '105px' }}
      >
        <Suspense fallback={null}>
          <BrainScene pct={pct} />
          <EffectComposer>
            <Bloom intensity={pct * 0.1} luminanceThreshold={0.2} luminanceSmoothing={0.9} radius={0.3} />
          </EffectComposer>
        </Suspense>
      </Canvas>
      <div style={{ display: 'grid', gap: '2px', justifyItems: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,0.84)', fontSize: '10px', letterSpacing: '0.14em' }}>{Math.round(pct * 100)}%</span>
      </div>
    </div>
  );
}

export function RingGaugesPanel() {
  const { gauges } = useSyntheticTelemetry();
  const otherGauges = gauges.slice(1); // Get gauges 2 and 3

  return (
    <HudPanel title="RING GAUGES" meta="BRAIN / NET / IO" className="video-exact-fill" bodyClassName="video-exact-fill" compact>
      <div
        style={{
          display: 'grid',
          gap: '6px',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          height: '100%',
          alignItems: 'end',
        }}
      >
        <BrainGauge />
        {otherGauges.map((gauge) => (
          <Gauge key={gauge.id} label={gauge.label} value={gauge.value} />
        ))}
      </div>
    </HudPanel>
  );
}
