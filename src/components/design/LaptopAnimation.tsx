'use client';

import { Environment, ScrollControls, useGLTF, useScroll, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

const MODEL_URL = '/mac.glb';
const MATTE_TEXTURE_URL = '/red.jpg';

// Sequential scroll phases: [start, distance] in 0..1 of the total scroll.
// Each one only starts moving once the previous has finished.
const PHASE_SPIN_Y = [0, 0.5] as const;
const PHASE_OPEN_LID = [0.5, 0.5] as const;

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function isStandardMesh(
  object: THREE.Object3D | undefined | null
): object is THREE.Mesh & { material: THREE.MeshStandardMaterial } {
  return (
    !!object &&
    (object as THREE.Mesh).isMesh === true &&
    (object as THREE.Mesh).material instanceof THREE.MeshStandardMaterial
  );
}

function Laptop() {
  const { scene } = useGLTF(MODEL_URL);
  const loadedTexture = useTexture(MATTE_TEXTURE_URL);

  const matteMap = useMemo(() => {
    const map = loadedTexture.clone();
    map.flipY = false;
    map.colorSpace = THREE.SRGBColorSpace;
    map.needsUpdate = true;
    return map;
  }, [loadedTexture]);

  const data = useScroll();

  const screenRef = useRef<THREE.Object3D | null>(null);
  const laptopRef = useRef<THREE.Group | null>(null);

  useLayoutEffect(() => {
    screenRef.current = scene.getObjectByName('screen') ?? null;

    const matte = scene.getObjectByName('matte');
    if (!isStandardMesh(matte)) return;

    matte.material.map = matteMap;
    matte.material.metalness = 0;
    matte.material.roughness = 0;
    matte.material.emissiveIntensity = 0;
    matte.material.needsUpdate = true;
  }, [scene, matteMap]);

  useFrame(() => {
    const screen = screenRef.current;
    const laptop = laptopRef.current;
    if (!screen || !laptop || !data) return;

    // range() clamps: 0 before its window, 1 after it — that is what makes the
    // phases run one after the other instead of all at once.
    const spinY = easeInOutCubic(data.range(...PHASE_SPIN_Y));
    const openLid = easeInOutCubic(data.range(...PHASE_OPEN_LID));

    // Phase 1 — turn to face the camera.
    laptop.rotation.y = THREE.MathUtils.lerp(THREE.MathUtils.degToRad(-50), 0, spinY);

    // Phase 2 — lid swings open.
    screen.rotation.x = THREE.MathUtils.degToRad(180 - openLid * 90);
  });

  return (
    <group ref={laptopRef} position={[0, -10, 20]}>
      <primitive object={scene} />
    </group>
  );
}

export default function LaptopAnimation() {
  return (
    <>
      <Environment
        files={['https://dl.polyhaven.org/file/ph-assets/HDRIs/exr/4k/studio_small_09_4k.exr']}
      />
      <ScrollControls pages={2}>
        <Laptop />
      </ScrollControls>
    </>
  );
}

useGLTF.preload(MODEL_URL);
