'use client';

import { Environment, ScrollControls, useGLTF, useScroll, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

const MODEL_URL = '/mac.glb';
const MATTE_TEXTURE_URL = '/red.jpg';

/**
 * `traverse` hands back plain `Object3D`s, which have no `material`. This
 * narrows to the one shape we actually want to write to — a mesh whose
 * material is a single standard material, not an array of them.
 */
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

  // Configured on a clone, not on what `useTexture` handed back: that cache is
  // keyed by URL and shared, so flipping settings on it would follow the
  // texture to every other consumer.
  const matteMap = useMemo(() => {
    const map = loadedTexture.clone();
    // glTF meshes carry un-flipped UVs, and a colour map has to be tagged as
    // sRGB or it renders washed out.
    map.flipY = false;
    map.colorSpace = THREE.SRGBColorSpace;
    map.needsUpdate = true;
    return map;
  }, [loadedTexture]);
  // Real value rather than null: this component only ever renders as a child
  // of <ScrollControls>, which is what provides the context.
  const data = useScroll();

  // Looked up once and held in a ref — `getObjectByName` walks the graph, so
  // calling it per frame would re-traverse the whole model 60 times a second.
  const screenRef = useRef<THREE.Object3D | null>(null);

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
    if (!screen) return;
    // Closed at 180°, opening to 90° across the full scroll.
    screen.rotation.x = THREE.MathUtils.degToRad(180 - data.offset * 90);
  });

  return (
    <group position={[0, -10, 20]}>
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
      {/* `useScroll` reads context, so anything using it must be a child of
          this — not the component that renders it. */}
      <ScrollControls pages={3}>
        <Laptop />
      </ScrollControls>
    </>
  );
}

useGLTF.preload(MODEL_URL);
