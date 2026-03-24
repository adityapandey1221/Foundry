import React, { Suspense, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface AmbientParticlesProps {
  completionPercent?: number;
}

interface Particle {
  id: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  char: string;
}

const MATRIX_CHARS = '日月火水木金土年月日ⲦⲎⲦⲦⲈⲦⲀⲠⲦⲀⲤⲈⲜ ⸖⸗⸘⸙⸚⸛⸜⸝⸞⸟0123456789ﾊﾐﾆﾏﾒﾊﾐﾆﾏﾒﾊﾐﾆﾏﾒﾊﾐﾆﾏﾒ';

const ParticleField = ({ completionPercent = 50 }: AmbientParticlesProps) => {
  const particleCount = useMemo(() => {
    return Math.floor(50 + (completionPercent / 100) * 150);
  }, [completionPercent]);

  const particlesRef = useRef<Particle[]>([]);
  const particleGroupRef = useRef<THREE.Group>(null);

  // Initialize particles once
  useEffect(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: `particle-${i}`,
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 10
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          0.01 + Math.random() * 0.02,
          (Math.random() - 0.5) * 0.01
        ),
        char: MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)],
      });
    }
    particlesRef.current = newParticles;
  }, [particleCount]);

  useFrame(() => {
    if (!particleGroupRef.current) return;

    const particles = particlesRef.current;

    particles.forEach(particle => {
      particle.position.add(
        particle.velocity.clone().multiplyScalar(0.5)
      );

      // Wrap around
      if (particle.position.y > 12) {
        particle.position.y = -10;
        particle.char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
      }

      if (particle.position.x > 10) particle.position.x = -10;
      if (particle.position.x < -10) particle.position.x = 10;
      if (particle.position.z > 5) particle.position.z = -5;
      if (particle.position.z < -5) particle.position.z = 5;
    });

    // Update positions on the mesh instances
    if (particleGroupRef.current.children.length > 0) {
      particles.forEach((particle, i) => {
        const mesh = particleGroupRef.current?.children[i] as any;
        if (mesh) {
          mesh.position.copy(particle.position);
        }
      });
    }
  });

  return (
    <group ref={particleGroupRef}>
      {particlesRef.current.map(particle => (
        <Text
          key={particle.id}
          position={particle.position.toArray()}
          fontSize={0.3}
          color="#39FF14"
          anchorX="center"
          anchorY="middle"
          letterSpacing={-0.05}
          outlineWidth={0.02}
          outlineColor="#39FF14"
        >
          {particle.char}
        </Text>
      ))}
    </group>
  );
};

export const AmbientParticles = ({ completionPercent = 50 }: AmbientParticlesProps) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
        frameloop="always"
      >
        <Suspense fallback={null}>
          <ParticleField completionPercent={completionPercent} />
          <fog attach="fog" args={['#000000', 5, 20]} />
        </Suspense>
      </Canvas>
    </div>
  );
};
