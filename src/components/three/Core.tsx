"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

/**
 * The hero centrepiece: a slowly morphing metallic core wrapped in two
 * counter-rotating wireframe shells and a pair of tilted orbital rings.
 */
export default function Core({ reduced = false }: { reduced?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Mesh>(null);
  const shellA = useRef<THREE.Mesh>(null);
  const shellB = useRef<THREE.Mesh>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);

  const ringGeo = useMemo(() => new THREE.TorusGeometry(2.35, 0.008, 8, 220), []);
  const ringGeo2 = useMemo(() => new THREE.TorusGeometry(2.9, 0.005, 8, 220), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const d = reduced ? 0 : delta;

    if (group.current) {
      // gentle breathing bob
      group.current.position.y = Math.sin(t * 0.55) * 0.12;
    }
    if (inner.current) {
      inner.current.rotation.y += d * 0.14;
      inner.current.rotation.x += d * 0.05;
    }
    if (shellA.current) {
      shellA.current.rotation.y -= d * 0.22;
      shellA.current.rotation.z += d * 0.08;
    }
    if (shellB.current) {
      shellB.current.rotation.x += d * 0.16;
      shellB.current.rotation.y += d * 0.1;
    }
    if (ringA.current) ringA.current.rotation.z += d * 0.28;
    if (ringB.current) ringB.current.rotation.z -= d * 0.19;
  });

  return (
    <group ref={group}>
      {/* morphing metallic core */}
      <mesh ref={inner} castShadow={false}>
        <icosahedronGeometry args={[1.18, 12]} />
        <MeshDistortMaterial
          color="#0a1a2b"
          emissive="#0a5f75"
          emissiveIntensity={0.22}
          roughness={0.2}
          metalness={0.96}
          distort={reduced ? 0.12 : 0.34}
          speed={1.35}
        />
      </mesh>

      {/* inner wireframe shell */}
      <mesh ref={shellA} scale={1.62}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.22} />
      </mesh>

      {/* outer wireframe shell */}
      <mesh ref={shellB} scale={2.05}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#4f7dff" wireframe transparent opacity={0.14} />
      </mesh>

      {/* orbital rings */}
      <mesh ref={ringA} geometry={ringGeo} rotation={[Math.PI / 2.6, 0.35, 0]}>
        <meshBasicMaterial color="#67e8f9" transparent opacity={0.42} />
      </mesh>
      <mesh ref={ringB} geometry={ringGeo2} rotation={[Math.PI / 1.7, -0.5, 0.6]}>
        <meshBasicMaterial color="#4f7dff" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
