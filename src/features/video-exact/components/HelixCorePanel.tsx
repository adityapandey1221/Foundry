import { useMemo, useRef } from 'react';
import { Canvas, type ThreeElements, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HudPanel } from './HudPanel';

export type HelixCorePanelProps = {
  seed?: string;
  className?: string;
};

const TERRAIN_ROWS = 14;
const TERRAIN_COLUMNS = 34;
const TERRAIN_WIDTH = 132;
const TERRAIN_DEPTH = 84;
const TERRAIN_HALF_WIDTH = TERRAIN_WIDTH / 2;
const TERRAIN_HALF_DEPTH = TERRAIN_DEPTH / 2;
const HELIX_HEIGHT = 90;
const HELIX_SEGMENTS = 160;
const RUNG_COUNT = 20;
const PARTICLE_COUNT = 120;
const HELIX_CENTER_Y = 2;
const GRID_COLOR = new THREE.Color('#5f5f5f');
const LINE_COLOR = new THREE.Color('#cfcfcf');
const CORE_COLOR = new THREE.Color('#f5f5f5');

const setPositionArray = (target: Float32Array, points: THREE.Vector3[]) => {
  for (let index = 0; index < points.length; index += 1) {
    const point = points[index];
    const offset = index * 3;
    target[offset] = point.x;
    target[offset + 1] = point.y;
    target[offset + 2] = point.z;
  }
};

const buildTerrainPoint = (column: number, row: number, time: number) => {
  const u = column / (TERRAIN_COLUMNS - 1);
  const v = row / (TERRAIN_ROWS - 1);
  const x = -TERRAIN_HALF_WIDTH + (u * TERRAIN_WIDTH);
  const z = -TERRAIN_HALF_DEPTH + (v * TERRAIN_DEPTH);
  const mountain = Math.exp(-Math.pow((u - 0.5) * 3.2, 2)) * 22;
  const shoulder = Math.exp(-Math.pow((u - 0.18) * 5.2, 2)) * 9;
  const shoulderRight = Math.exp(-Math.pow((u - 0.82) * 5.2, 2)) * 9;
  const rowFalloff = 1 - Math.pow(Math.abs(v - 0.5) * 1.6, 1.4);
  const rolling =
    Math.sin((u * 7.6) + (time * 0.55) + (row * 0.28)) * 2.8 +
    Math.cos((u * 3.4) - (time * 0.24) + (row * 0.17)) * 1.9;

  const y = ((mountain + shoulder + shoulderRight) * rowFalloff) + rolling + ((v - 0.5) * 2.4);

  return new THREE.Vector3(x, y, z);
};

const buildHelixPoint = (t: number, time: number, phaseOffset: number) => {
  const centered = (t - 0.5) * HELIX_HEIGHT;
  const envelope = 9 + (1 - Math.pow(Math.abs(t - 0.5) * 2, 1.4)) * 5;
  const angle = (t * Math.PI * 18) + (time * 1.05) + phaseOffset;
  const x = Math.cos(angle) * envelope;
  const z = Math.sin(angle) * (envelope * 0.56);
  const y = centered + HELIX_CENTER_Y;

  return new THREE.Vector3(x, y, z);
};

function TerrainLines() {
  const rowRefs = useRef<THREE.Line[]>([]);
  const columnRefs = useRef<THREE.Line[]>([]);

  const rowArrays = useMemo(
    () => Array.from({ length: TERRAIN_ROWS }, () => new Float32Array(TERRAIN_COLUMNS * 3)),
    []
  );
  const columnArrays = useMemo(
    () => Array.from({ length: TERRAIN_COLUMNS }, () => new Float32Array(TERRAIN_ROWS * 3)),
    []
  );

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;

    for (let row = 0; row < TERRAIN_ROWS; row += 1) {
      const rowPoints = Array.from({ length: TERRAIN_COLUMNS }, (_, column) =>
        buildTerrainPoint(column, row, time)
      );
      const rowArray = rowArrays[row];
      setPositionArray(rowArray, rowPoints);

      const rowGeometry = rowRefs.current[row]?.geometry as THREE.BufferGeometry | undefined;
      const rowAttribute = rowGeometry?.attributes.position as THREE.BufferAttribute | undefined;
      if (rowAttribute) {
        rowAttribute.needsUpdate = true;
      }
    }

    for (let column = 0; column < TERRAIN_COLUMNS; column += 1) {
      const columnPoints = Array.from({ length: TERRAIN_ROWS }, (_, row) =>
        buildTerrainPoint(column, row, time)
      );
      const columnArray = columnArrays[column];
      setPositionArray(columnArray, columnPoints);

      const columnGeometry = columnRefs.current[column]?.geometry as THREE.BufferGeometry | undefined;
      const columnAttribute = columnGeometry?.attributes.position as THREE.BufferAttribute | undefined;
      if (columnAttribute) {
        columnAttribute.needsUpdate = true;
      }
    }
  });

  return (
    <group position={[0, -12, 0]} rotation-x={-0.66}>
      {rowArrays.map((array, index) => (
        <line
          key={`terrain-row-${index}`}
          ref={(node) => {
            if (node) rowRefs.current[index] = node;
          }}
        >
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[array, 3]} />
          </bufferGeometry>
          <lineBasicMaterial
            color={LINE_COLOR}
            transparent
            opacity={index < 3 ? 0.34 : 0.2}
          />
        </line>
      ))}

      {columnArrays.map((array, index) => (
        <line
          key={`terrain-column-${index}`}
          ref={(node) => {
            if (node) columnRefs.current[index] = node;
          }}
        >
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[array, 3]} />
          </bufferGeometry>
          <lineBasicMaterial
            color={GRID_COLOR}
            transparent
            opacity={index % 4 === 0 ? 0.24 : 0.12}
          />
        </line>
      ))}
    </group>
  );
}

function HelixStructure() {
  const strandARef = useRef<THREE.Line>(null);
  const strandBRef = useRef<THREE.Line>(null);
  const glowRef = useRef<THREE.Line>(null);
  const thicknessRefA = useRef<THREE.Line>(null);
  const thicknessRefB = useRef<THREE.Line>(null);
  const rungRefs = useRef<THREE.Line[]>([]);

  const strandA = useMemo(() => new Float32Array(HELIX_SEGMENTS * 3), []);
  const strandB = useMemo(() => new Float32Array(HELIX_SEGMENTS * 3), []);
  const glow = useMemo(() => new Float32Array(HELIX_SEGMENTS * 3), []);
  const thicknessA = useMemo(() => new Float32Array(HELIX_SEGMENTS * 3), []);
  const thicknessB = useMemo(() => new Float32Array(HELIX_SEGMENTS * 3), []);
  const rungArrays = useMemo(
    () => Array.from({ length: RUNG_COUNT }, () => new Float32Array(2 * 3)),
    []
  );

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    const aPoints = Array.from({ length: HELIX_SEGMENTS }, (_, index) =>
      buildHelixPoint(index / (HELIX_SEGMENTS - 1), time, 0)
    );
    const bPoints = Array.from({ length: HELIX_SEGMENTS }, (_, index) =>
      buildHelixPoint(index / (HELIX_SEGMENTS - 1), time, Math.PI)
    );

    setPositionArray(strandA, aPoints);
    setPositionArray(strandB, bPoints);
    setPositionArray(glow, aPoints);
    setPositionArray(
      thicknessA,
      aPoints.map((point) => new THREE.Vector3(point.x + 0.85, point.y, point.z + 0.35))
    );
    setPositionArray(
      thicknessB,
      bPoints.map((point) => new THREE.Vector3(point.x - 0.85, point.y, point.z - 0.35))
    );

    const strandAAttribute = strandARef.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;
    const strandBAttribute = strandBRef.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;
    const glowAttribute = glowRef.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;
    const thicknessAAttribute = thicknessRefA.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;
    const thicknessBAttribute = thicknessRefB.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;

    if (strandAAttribute) strandAAttribute.needsUpdate = true;
    if (strandBAttribute) strandBAttribute.needsUpdate = true;
    if (glowAttribute) glowAttribute.needsUpdate = true;
    if (thicknessAAttribute) thicknessAAttribute.needsUpdate = true;
    if (thicknessBAttribute) thicknessBAttribute.needsUpdate = true;

    for (let index = 0; index < RUNG_COUNT; index += 1) {
      const t = index / (RUNG_COUNT - 1);
      const rungPoints = [
        buildHelixPoint(t, time, 0),
        buildHelixPoint(t, time, Math.PI),
      ];

      setPositionArray(rungArrays[index], rungPoints);
      const rungAttribute = rungRefs.current[index]?.geometry.attributes.position as THREE.BufferAttribute | undefined;
      if (rungAttribute) {
        rungAttribute.needsUpdate = true;
      }
    }
  });

  return (
    <group position={[0, 2, 0]}>
      <line ref={glowRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[glow, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={CORE_COLOR} transparent opacity={1} />
      </line>

      <line ref={thicknessRefA}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[thicknessA, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={CORE_COLOR} transparent opacity={0.42} />
      </line>

      <line ref={thicknessRefB}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[thicknessB, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={CORE_COLOR} transparent opacity={0.38} />
      </line>

      <line ref={strandARef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[strandA, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={CORE_COLOR} transparent opacity={1} />
      </line>

      <line ref={strandBRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[strandB, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={CORE_COLOR} transparent opacity={1} />
      </line>

      {rungArrays.map((array, index) => (
        <line
          key={`helix-rung-${index}`}
          ref={(node) => {
            if (node) rungRefs.current[index] = node;
          }}
        >
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[array, 3]} />
          </bufferGeometry>
          <lineBasicMaterial
            color={CORE_COLOR}
            transparent
            opacity={0.93 + ((1 - Math.abs((index / (RUNG_COUNT - 1)) - 0.5) * 2) * 0.07)}
          />
        </line>
      ))}
    </group>
  );
}

function ParticleField() {
  const positions = useMemo(() => {
    const array = new Float32Array(PARTICLE_COUNT * 3);

    for (let index = 0; index < PARTICLE_COUNT; index += 1) {
      const offset = index * 3;
      const spread = index % 2 === 0 ? 68 : 54;
      array[offset] = ((index * 17.17) % 1) * spread * 2 - spread;
      array[offset + 1] = (((index * 13.31) % 1) * 76) - 34;
      array[offset + 2] = (((index * 29.71) % 1) * 72) - 36;
    }

    return array;
  }, []);

  const materialRef = useRef<THREE.PointsMaterial>(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.opacity = 0.18 + (Math.sin(clock.elapsedTime * 0.35) * 0.04);
    }
  });

  return (
    <points position={[0, 8, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        color={CORE_COLOR}
        size={0.78}
        sizeAttenuation={false}
        transparent
        opacity={0.26}
      />
    </points>
  );
}

function FrameOverlay(props: ThreeElements['group']) {
  return (
    <group {...props}>
      <lineLoop position={[0, 8, -48]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([
                -73, 53, 0,
                73, 53, 0,
                73, -45, 0,
                -73, -45, 0,
              ]),
              3,
            ]}
          />
        </bufferGeometry>
        <lineBasicMaterial color={LINE_COLOR} transparent opacity={0.16} />
      </lineLoop>
    </group>
  );
}

function HelixScene() {
  return (
    <Canvas
      orthographic
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 120], zoom: 4.8, near: 0.1, far: 500 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#090909']} />
      <fog attach="fog" args={['#090909', 88, 170]} />
      <group>
        <TerrainLines />
        <HelixStructure />
        <ParticleField />
        <FrameOverlay position={[0, 0, 0]} />
      </group>
    </Canvas>
  );
}

export function HelixCorePanel({ className }: HelixCorePanelProps) {
  return (
    <HudPanel
      title="HELIX CORE ENGINE"
      meta="DNA / ATTRACTOR"
      compact
      className={className}
      bodyClassName="video-exact-fill"
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: 0,
          overflow: 'hidden',
          background:
            'radial-gradient(circle at 50% 42%, rgba(255,255,255,0.405), rgba(255,255,255,0.158) 18%, rgba(255,255,255,0.05) 34%, rgba(0,0,0,0) 60%)',
        }}
      >
        <HelixScene />
        <div
          aria-hidden="true"
          style={{
            pointerEvents: 'none',
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 50% 44%, rgba(255,255,255,0.34), rgba(255,255,255,0.115) 16%, rgba(255,255,255,0) 36%)',
            mixBlendMode: 'screen',
            opacity: 1,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            pointerEvents: 'none',
            position: 'absolute',
            inset: 0,
            background:
              'repeating-linear-gradient(180deg, rgba(255,255,255,0.026) 0, rgba(255,255,255,0.026) 1px, transparent 1px, transparent 3px)',
            opacity: 0.16,
            mixBlendMode: 'screen',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            pointerEvents: 'none',
            position: 'absolute',
            inset: 0,
            boxShadow: 'inset 0 0 56px rgba(0,0,0,0.38)',
          }}
        />
      </div>
    </HudPanel>
  );
}
