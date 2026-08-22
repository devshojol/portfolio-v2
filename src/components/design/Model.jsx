"use client";
import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

/**
 * Orbital Instrument — signature 3D piece for a single-page "desktop" portfolio.
 *
 * Install first:
 *   npm install three @react-three/fiber
 *
 * Usage (drop near the root of your app, behind your desktop icons/windows):
 *   <OrbitalInstrument />
 *
 * It renders fixed, full-viewport, and pointer-events: none, so it never
 * blocks clicks on your icons/popups — but it still tracks the cursor
 * anywhere on screen (via a window listener, not canvas hover), so it feels
 * alive even when the mouse is over other UI.
 */

// ---- palette (kept out of the components so it's easy to retune) ----
const COLOR_CORE = "#FFEFD6"; // warm ivory glow
const COLOR_A = "#E8A94A"; // molten amber
const COLOR_B = "#6C8EAD"; // cold steel blue
const BG = "#1E1E1E";

// Tracks the cursor across the whole window, independent of canvas hover,
// so the rig reacts even when the pointer is over other UI on top of it.
function useWindowPointer() {
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const handleMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);
  return pointer;
}

function Core() {
  const ref = useRef();
  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.15;
    ref.current.rotation.x += delta * 0.08;
  });
  return (
    <group ref={ref}>
      <mesh>
        <icosahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial
          color="#171717"
          emissive={COLOR_CORE}
          emissiveIntensity={0.18}
          roughness={0.25}
          metalness={0.85}
        />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.565, 0]} />
        <meshBasicMaterial
          color={COLOR_CORE}
          wireframe
          transparent
          opacity={0.45}
        />
      </mesh>
    </group>
  );
}

function Ring({ radius, tiltX, tiltZ, color, opacity = 0.3 }) {
  return (
    <mesh rotation={[tiltX, 0, tiltZ]}>
      <torusGeometry args={[radius, 0.008, 8, 128]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

// A shard riding fixed on its ring's tilted plane, drifting around it.
function Shard({ radius, tiltX, tiltZ, speed, offset, color, size }) {
  const orbit = useRef();
  const spin = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + offset;
    orbit.current.position.set(Math.cos(t) * radius, 0, Math.sin(t) * radius);
    spin.current.rotation.x += 0.01;
    spin.current.rotation.y += 0.015;
  });
  return (
    <group rotation={[tiltX, 0, tiltZ]}>
      <group ref={orbit}>
        <mesh ref={spin}>
          <tetrahedronGeometry args={[size, 0]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.7}
            roughness={0.3}
            metalness={0.6}
          />
        </mesh>
      </group>
    </group>
  );
}

// The whole rig tilts toward the cursor (like a compass needle) and spins
// faster the closer the cursor sits to screen-center ("magnetism").
function InstrumentRig({ pointerRef, children }) {
  const group = useRef();
  useFrame((_, delta) => {
    const { x, y } = pointerRef.current;
    group.current.rotation.x += (y * 0.5 - group.current.rotation.x) * 0.04;
    group.current.rotation.y += (x * 0.7 - group.current.rotation.y) * 0.04;
    const pull = Math.hypot(x, y);
    group.current.rotation.y += delta * (0.05 + (1 - pull) * 0.08);
  });
  return <group ref={group}>{children}</group>;
}

export default function OrbitalInstrument() {
  const pointerRef = useWindowPointer();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none", // never blocks clicks on icons/popups above it
        zIndex: 0,
        background: BG,
      }}
    >
      <div style={{ width: "56vmin", height: "56vmin" }}>
        <Canvas
          camera={{ position: [0, 0, 4], fov: 45 }}
          gl={{ alpha: true, antialias: true }}
        >
          <ambientLight intensity={0.3} />
          <pointLight position={[3, 3, 3]} intensity={1.3} color={COLOR_A} />
          <pointLight position={[-3, -2, -3]} intensity={0.7} color={COLOR_B} />

          <InstrumentRig pointerRef={pointerRef}>
            <Core />

            <Ring
              radius={1.1}
              tiltX={0.3}
              tiltZ={0.1}
              color={COLOR_A}
              opacity={0.35}
            />
            <Ring
              radius={1.4}
              tiltX={-0.5}
              tiltZ={0.6}
              color={COLOR_B}
              opacity={0.22}
            />
            <Ring
              radius={1.7}
              tiltX={1.1}
              tiltZ={-0.3}
              color={COLOR_CORE}
              opacity={0.12}
            />

            <Shard
              radius={1.1}
              tiltX={0.3}
              tiltZ={0.1}
              speed={0.6}
              offset={0}
              color={COLOR_A}
              size={0.06}
            />
            <Shard
              radius={1.4}
              tiltX={-0.5}
              tiltZ={0.6}
              speed={-0.4}
              offset={2}
              color={COLOR_B}
              size={0.05}
            />
            <Shard
              radius={1.7}
              tiltX={1.1}
              tiltZ={-0.3}
              speed={0.25}
              offset={4}
              color={COLOR_CORE}
              size={0.045}
            />
          </InstrumentRig>
        </Canvas>
      </div>
    </div>
  );
}
