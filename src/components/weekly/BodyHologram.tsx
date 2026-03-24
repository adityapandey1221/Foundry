import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

interface BodyHologramProps {
  completionPercent?: number;
  position?: [number, number, number];
  isCurrentWeek?: boolean;
  index?: number;
}

// ─── Holographic shader material ─────────────────────────────────────────────
class HolographicBodyMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        time: { value: 0 },
        fresnelOpacity: { value: 0.85 },
        fresnelAmount: { value: 0.5 },
        scanlineSize: { value: 8.0 },
        hologramBrightness: { value: 1.4 },
        signalSpeed: { value: 0.45 },
        hologramColor: { value: new THREE.Color('#39FF14') },
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

          // Base hologram color — mix(0.05, brightness, pct) so 0% is ghost
          float brightness = mix(0.05, hologramBrightness, completionPct);
          vec4 hColor = vec4(hologramColor, mix(brightness, vUv.y, 0.5));

          // Scanlines (from ektogamat)
          float scanlines = 10.0;
          scanlines += 20.0 * sin(time * signalSpeed * 20.8 - myUV.y * 60.0 * scanlineSize);
          scanlines *= smoothstep(1.3 * cos(time * signalSpeed + myUV.y * scanlineSize), 0.78, 0.9);
          scanlines *= max(0.25, sin(time * signalSpeed) * 1.0);

          float r = random(vUv.x, vUv.y);
          float g = random(vUv.y * 20.2, vUv.y * 0.2);
          float b = random(vUv.y * 0.9, vUv.y * 0.2);
          hColor += vec4(r * scanlines, b * scanlines, r, 1.0) / 84.0;
          vec4 scanlineMix = mix(vec4(0.0), hColor, hColor.a);

          // Fresnel rim glow
          vec3 viewDir = normalize(cameraPosition - vPositionW);
          float fresnelEffect = dot(viewDir, vNormalW) * (1.6 - fresnelOpacity / 2.0);
          fresnelEffect = clamp(fresnelAmount - fresnelEffect, 0.0, fresnelOpacity);
          fresnelEffect *= mix(0.3, 1.0, completionPct);

          // Blink
          float blink = flicker(0.6 - signalSpeed, time * signalSpeed * 0.02);

          vec3 finalColor = scanlineMix.rgb * blink + fresnelEffect;
          gl_FragColor = vec4(finalColor, hologramOpacity * mix(0.35, 1.0, completionPct));
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }
}

// ─── OBJ body mesh (solid faces with holographic shader) ────────────────────
const BodyMesh: React.FC<{ pct: number }> = ({ pct }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const obj = useLoader(OBJLoader, '/body.obj');

  const { geometry, scale, offsetY, material } = useMemo(() => {
    let geo: THREE.BufferGeometry | null = null;
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && !geo) {
        geo = (child as THREE.Mesh).geometry;
      }
    });
    // body.obj Y range ≈ -10..55; center at ~22, total height ~65 units → scale to ~1.9 world units
    const scale = 1.9 / 65;
    const offsetY = -22 * scale;
    const mat = new HolographicBodyMaterial();
    return { geometry: geo!, scale, offsetY, material: mat };
  }, [obj]);

  useFrame((state) => {
    if (meshRef.current && meshRef.current.material instanceof HolographicBodyMaterial) {
      const mat = meshRef.current.material as HolographicBodyMaterial;
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
    />
  );
};

// ─── OBJ wireframe overlay (LineSegments with uniform green) ────────────────
const BodyWireframe: React.FC<{ pct: number }> = ({ pct }) => {
  const obj = useLoader(OBJLoader, '/body.obj');

  const { lineSegmentsGeometry, material, scale, offsetY } = useMemo(() => {
    let srcGeo: THREE.BufferGeometry | null = null;
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && !srcGeo) {
        srcGeo = (child as THREE.Mesh).geometry;
      }
    });
    if (!srcGeo) return { lineSegmentsGeometry: null, material: null, scale: 1, offsetY: 0 };

    const wfGeo = new THREE.WireframeGeometry(srcGeo!);

    // Uniform green vertex colors
    const positions = wfGeo.attributes.position.array;
    const colors: number[] = [];
    const green = new THREE.Color('#39FF14');
    for (let i = 0; i < positions.length; i += 3) {
      colors.push(green.r, green.g, green.b);
    }
    wfGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.15 + pct * 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const scale = 1.9 / 65;
    const offsetY = -22 * scale;

    return { lineSegmentsGeometry: wfGeo, material: mat, scale, offsetY };
  }, [obj, pct]);

  if (!lineSegmentsGeometry || !material) return null;

  return (
    <lineSegments
      geometry={lineSegmentsGeometry}
      material={material}
      scale={[scale, scale, scale]}
      position={[0, offsetY, 0]}
    />
  );
};

// ─── Main BodyHologram component ─────────────────────────────────────────────
export const BodyHologram: React.FC<BodyHologramProps> = ({
  completionPercent = 75,
  position = [0, 0, 0],
  isCurrentWeek = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const pct = Math.max(0, Math.min(100, completionPercent)) / 100;

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
      // Current week spins slightly faster
      if (isCurrentWeek) {
        groupRef.current.rotation.y += delta * 0.2;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <React.Suspense fallback={null}>
        <BodyMesh pct={pct} />
        <BodyWireframe pct={pct} />
      </React.Suspense>
    </group>
  );
};
