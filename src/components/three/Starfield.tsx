"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createRng } from "@/lib/rng";

/** A drifting shell of particles surrounding the core. */
export default function Starfield({
  count = 1800,
  reduced = false,
}: {
  count?: number;
  reduced?: boolean;
}) {
  const points = useRef<THREE.Points>(null);

  const { positions, colors, sizes } = useMemo(() => {
    const rand = createRng(1337);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const cyan = new THREE.Color("#67e8f9");
    const blue = new THREE.Color("#4f7dff");
    const pale = new THREE.Color("#d8ecff");

    for (let i = 0; i < count; i++) {
      // uniform-ish distribution in a spherical shell
      const r = 4.2 + Math.pow(rand(), 0.6) * 8.5;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.65;
      // flattened + pushed back so nothing drifts close enough to the
      // camera to render as an oversized sprite
      positions[i * 3 + 2] = r * Math.cos(phi) * 0.45 - 2.5;

      const mix = rand();
      const c = mix < 0.55 ? cyan : mix < 0.85 ? blue : pale;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      sizes[i] = rand() * 0.05 + 0.012;
    }

    return { positions, colors, sizes };
  }, [count]);

  // Soft round sprite — without this, points render as hard squares.
  const sprite = useMemo(() => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.55)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  useEffect(() => () => sprite.dispose(), [sprite]);

  useFrame((state, delta) => {
    if (!points.current || reduced) return;
    points.current.rotation.y += delta * 0.018;
    points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.06;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        map={sprite}
        alphaTest={0.01}
        size={0.075}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
