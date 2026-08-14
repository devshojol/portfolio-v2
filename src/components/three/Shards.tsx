"use client";

import { useMemo } from "react";
import { Float } from "@react-three/drei";
import { createRng } from "@/lib/rng";

type Shard = {
  position: [number, number, number];
  scale: number;
  kind: 0 | 1 | 2;
  color: string;
  speed: number;
};

/** Small geometric shards floating around the core, seeded deterministically. */
export default function Shards({ reduced = false }: { reduced?: boolean }) {
  const shards = useMemo<Shard[]>(() => {
    const rand = createRng(7);
    const palette = ["#22d3ee", "#4f7dff", "#67e8f9", "#2f7fa8"];

    // Kept on a tight ring around the core so they never drift under the copy.
    return Array.from({ length: 14 }, () => {
      const angle = rand() * Math.PI * 2;
      const radius = 2.5 + rand() * 1.9;
      return {
        position: [
          Math.cos(angle) * radius,
          (rand() - 0.5) * 3.4,
          Math.sin(angle) * radius - 1.2,
        ] as [number, number, number],
        scale: 0.06 + rand() * 0.16,
        kind: Math.floor(rand() * 3) as 0 | 1 | 2,
        color: palette[Math.floor(rand() * palette.length)],
        speed: 0.6 + rand() * 1.4,
      };
    });
  }, []);

  return (
    <group>
      {shards.map((s, i) => (
        <Float
          key={i}
          speed={reduced ? 0 : s.speed}
          rotationIntensity={reduced ? 0 : 1.4}
          floatIntensity={reduced ? 0 : 1.8}
        >
          <mesh position={s.position} scale={s.scale}>
            {s.kind === 0 ? (
              <octahedronGeometry args={[1, 0]} />
            ) : s.kind === 1 ? (
              <tetrahedronGeometry args={[1, 0]} />
            ) : (
              <icosahedronGeometry args={[1, 0]} />
            )}
            <meshStandardMaterial
              color={s.color}
              emissive={s.color}
              emissiveIntensity={1.15}
              roughness={0.3}
              metalness={0.6}
              transparent
              opacity={0.72}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}
