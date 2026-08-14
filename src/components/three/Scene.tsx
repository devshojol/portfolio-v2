"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents, Preload } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/lib/media";
import Core from "./Core";
import Starfield from "./Starfield";
import Shards from "./Shards";

/** Eases the camera toward the pointer for a parallax feel. */
function CameraRig({ reduced }: { reduced: boolean }) {
  const { camera, pointer } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    if (reduced) return;
    const k = 1 - Math.pow(0.0015, delta);
    camera.position.x += (pointer.x * 1.5 - camera.position.x) * k;
    camera.position.y += (pointer.y * 0.9 - camera.position.y) * k;
    camera.lookAt(target.current);
  });

  return null;
}

/**
 * Pushes the centrepiece to the right on wide screens so the headline
 * on the left always sits on clean, dark background.
 */
function Composition({ reduced }: { reduced: boolean }) {
  const { viewport } = useThree();
  const wide = viewport.aspect > 1.15;
  const offsetX = wide ? viewport.width * 0.24 : viewport.width * 0.1;
  const offsetY = wide ? 0 : viewport.height * 0.14;
  const scale = wide ? 1 : Math.min(0.72, viewport.width / 5.6);

  return (
    <group position={[offsetX, offsetY, 0]} scale={scale}>
      <Core reduced={reduced} />
      <Shards reduced={reduced} />
    </group>
  );
}

function SceneContents({ reduced }: { reduced: boolean }) {
  return (
    <>
      <color attach="background" args={["#04070d"]} />
      <fog attach="fog" args={["#04070d", 9, 22]} />

      <ambientLight intensity={0.25} />
      <pointLight position={[5, 4, 5]} intensity={55} color="#22d3ee" distance={30} decay={2} />
      <pointLight position={[-6, -3, 2]} intensity={40} color="#4f7dff" distance={30} decay={2} />
      <pointLight position={[0, 6, -6]} intensity={22} color="#ffffff" distance={30} decay={2} />
      <directionalLight position={[2, 3, 4]} intensity={0.6} color="#cfeaff" />

      <Composition reduced={reduced} />
      <Starfield reduced={reduced} />

      <CameraRig reduced={reduced} />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.55} luminanceThreshold={0.32} luminanceSmoothing={0.4} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.2} darkness={0.9} />
      </EffectComposer>

      <Preload all />
    </>
  );
}

export default function Scene() {
  const reduced = usePrefersReducedMotion();
  const [visible, setVisible] = useState(true);
  const wrap = useRef<HTMLDivElement>(null);

  // Pause rendering once the hero scrolls out of view.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 7.4], fov: 45 }}
        frameloop={visible ? "always" : "demand"}
      >
        <Suspense fallback={null}>
          <SceneContents reduced={reduced} />
        </Suspense>
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </Canvas>
    </div>
  );
}
