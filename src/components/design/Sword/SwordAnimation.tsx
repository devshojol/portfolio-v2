'use client';

import { Environment, ScrollControls, useGLTF, useScroll } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { usePrefersReducedMotion } from '@/lib/media';
import BladeTrail, { type BladeTrailHandle } from './BladeTrail';
import { Finale, Motes, SlashMarks } from './Effects';
import {
  BLADE_TIP,
  createShot,
  createSwordPose,
  evaluateShot,
  evaluateSword,
  fitToViewport,
  IMPACTS,
  impactPulse,
  TRAIL_INNER,
} from './choreography';
import { getGlowTexture } from './textures';

const MODEL_URL = '/sword.glb';
const HDRI_URL = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/exr/4k/studio_small_09_4k.exr';

/**
 * Lifts the model so the *hand* sits at the origin. The GLB runs the blade
 * down +Z with the pommel at -1 and the tip at +1, so a quarter turn about X
 * stands it up and this offset drops the middle of the grip onto the pivot.
 */
const GRIP_TO_ORIGIN = 0.75;

/** Tip speed (world units/second) a swing has to beat before it leaves a trail. */
const TRAIL_THRESHOLD = 2.4;
const TRAIL_RANGE = 14;
/**
 * How far the tip may travel in one frame, as a share of the blade's length,
 * before the ribbon is treated as a flick rather than a swing. A cut moves the
 * tip a fraction of the blade per frame; a thrown scrollbar moves it further
 * than the sword is long, and stretching a lit ribbon across that gap paints a
 * sheet of light over the frame instead of a smear.
 */
const MAX_STEP_SHARE = 0.35;

function SwordModel() {
  const { scene } = useGLTF(MODEL_URL);

  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;
      const source = mesh.material as THREE.MeshStandardMaterial;
      if (!(source instanceof THREE.MeshStandardMaterial)) return;

      // Cloned so the tuning below cannot leak into another scene sharing this GLB.
      const material = source.clone();
      // Polished steel: the GLB ships fairly rough, which reads as grey plastic
      // once there is an HDRI to reflect.
      material.roughness = Math.min(source.roughness * 0.5, 0.38);
      material.metalness = 1;
      material.envMapIntensity = 2.1;
      mesh.material = material;
    });
    return clone;
  }, [scene]);

  return (
    <group position={[0, GRIP_TO_ORIGIN, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <primitive object={model} />
    </group>
  );
}

/**
 * The camera rides its own track around the sword — orbiting, tilting the
 * horizon, and taking a kick on every impact. The radius never changes, so the
 * frame stays solvable: all of the apparent zoom is the sword's own scale.
 */
function CameraRig() {
  const data = useScroll();
  const { camera } = useThree();
  const reduced = usePrefersReducedMotion();

  const shot = useMemo(() => createShot(), []);
  const jolt = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!data) return;

    evaluateShot(data.offset, shot);
    camera.position.copy(shot.position);
    camera.up.set(0, 1, 0);
    camera.lookAt(shot.target);
    camera.rotateZ(shot.roll);

    if (reduced) return;

    // One kick per impact, strongest on the slam, decaying with the scroll so
    // that scrubbing back through a hit shakes the frame again.
    let kick = 0;
    for (const impact of IMPACTS) {
      const weight = impact.kind === 'slam' ? 1 : impact.kind === 'thrust' ? 0.55 : 0.7;
      kick = Math.max(kick, impactPulse(data.offset, impact.t, 0.02) * weight);
    }
    if (kick <= 0) return;

    jolt.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
    camera.position.addScaledVector(jolt, kick * 0.14);
    camera.lookAt(shot.target);
    camera.rotateZ(shot.roll + (Math.random() - 0.5) * kick * 0.05);
  });

  return null;
}

function SwordRig({ onProgress }: { onProgress?: (offset: number) => void }) {
  const data = useScroll();
  const { viewport } = useThree();

  const rig = useRef<THREE.Group>(null);
  const trail = useRef<BladeTrailHandle>(null);
  const flare = useRef<THREE.Sprite>(null);

  const pose = useMemo(() => createSwordPose(), []);
  const tip = useMemo(() => new THREE.Vector3(), []);
  const inner = useMemo(() => new THREE.Vector3(), []);
  const previousTip = useMemo(() => new THREE.Vector3(), []);
  const hasPreviousTip = useRef(false);
  /** Latched swing intensity: snaps up with the blade, decays on its own. */
  const cut = useRef(0);
  /** The same, but short-lived — the highlight on the edge at the moment of a cut. */
  const flash = useRef(0);
  const glow = useMemo(() => getGlowTexture(), []);

  useFrame((_, delta) => {
    const group = rig.current;
    if (!group || !data) return;

    const dt = THREE.MathUtils.clamp(delta, 1 / 240, 1 / 20);
    const fit = fitToViewport(viewport.width, viewport.height);

    evaluateSword(data.offset, pose);
    onProgress?.(data.offset);

    const scale = pose.scale * fit;
    group.position.copy(pose.position).multiplyScalar(fit);
    group.quaternion.copy(pose.quaternion);
    group.scale.setScalar(scale);

    tip
      .copy(pose.direction)
      .multiplyScalar(BLADE_TIP * scale)
      .add(group.position);
    inner
      .copy(pose.direction)
      .multiplyScalar(TRAIL_INNER * scale)
      .add(group.position);

    // Speed is measured, not authored — so the trail and the flare come for
    // free on every fast segment, and stay away on the slow ones. They also
    // answer to how hard the visitor is scrolling, which is the point.
    const speed = hasPreviousTip.current ? previousTip.distanceTo(tip) / dt : 0;
    previousTip.copy(tip);
    hasPreviousTip.current = true;

    const step = speed * dt;
    const stepLimit = BLADE_TIP * scale * MAX_STEP_SHARE;
    const flick = step > stepLimit ? stepLimit / step : 1;

    const target = THREE.MathUtils.clamp((speed - TRAIL_THRESHOLD) / TRAIL_RANGE, 0, 1) * flick;
    // Both rise instantly and fall on their own, but the flare is gone in a
    // fifth of a second while the ribbon lingers: a highlight is an instant, a
    // blur is a smear.
    cut.current = Math.max(target, cut.current * Math.pow(0.02, dt));
    flash.current = Math.max(target, flash.current * Math.pow(0.0004, dt));

    trail.current?.push(tip, inner, cut.current * 0.65, dt);

    const sprite = flare.current;
    if (sprite) {
      sprite.position
        .copy(pose.direction)
        .multiplyScalar(BLADE_TIP * 0.97 * scale)
        .add(group.position);
      sprite.scale.setScalar((0.12 + flash.current * 0.7) * Math.max(fit, 0.35));
      (sprite.material as THREE.SpriteMaterial).opacity = flash.current * 0.5;
      sprite.visible = flash.current > 0.01;
    }
  });

  return (
    <>
      <group ref={rig}>
        <SwordModel />
      </group>

      <BladeTrail ref={trail} />

      <sprite ref={flare} visible={false} renderOrder={3}>
        <spriteMaterial
          map={glow}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
    </>
  );
}

/** A dim pool of light well behind the blade, to keep the frame from going flat. */
function Backdrop() {
  const texture = useMemo(() => getGlowTexture(), []);
  return (
    <mesh position={[0, -0.2, -6]} renderOrder={0}>
      <planeGeometry args={[20, 13]} />
      <meshBasicMaterial
        map={texture}
        color="#1d4f7a"
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
}

export default function SwordAnimation({ onProgress }: { onProgress?: (offset: number) => void }) {
  return (
    <>
      <color attach="background" args={['#05070d']} />

      <Environment files={[HDRI_URL]} environmentIntensity={1.15} />
      <ambientLight intensity={0.4} />
      {/* Key from the front right, rim from behind and below — the pair of
          highlights that make a blade read as an edge rather than a bar. */}
      <directionalLight position={[4, 5, 6]} intensity={2.6} color="#eaf4ff" />
      <directionalLight position={[-5, 2, -4]} intensity={2} color="#6fb4ff" />
      <directionalLight position={[6, -2, -3]} intensity={1.3} color="#9fd0ff" />
      <spotLight position={[0, 7, 2]} angle={0.7} penumbra={1} intensity={50} color="#ffffff" />

      <Backdrop />
      <Motes />

      <ScrollControls pages={5} damping={0.2}>
        <CameraRig />
        <SwordRig onProgress={onProgress} />
        <SlashMarks />
        <Finale />
      </ScrollControls>

      <EffectComposer enableNormalPass={false}>
        <Bloom
          intensity={0.7}
          luminanceThreshold={0.45}
          luminanceSmoothing={0.35}
          mipmapBlur
          radius={0.78}
        />
        <Vignette eskil={false} offset={0.22} darkness={0.92} />
      </EffectComposer>
    </>
  );
}

useGLTF.preload(MODEL_URL);
