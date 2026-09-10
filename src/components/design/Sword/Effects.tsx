'use client';

import { useScroll } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { createRng } from '@/lib/rng';
import {
  BLADE_TIP,
  createSwordPose,
  evaluateSword,
  fitToViewport,
  IMPACTS,
  impactPulse,
  SLAM_T,
} from './choreography';
import { getGlowTexture, getStreakTexture } from './textures';

/** How far in front of the lens the cut marks hang. */
const MARK_DEPTH = 3.4;
/** Seconds the finale takes to play out. */
const FINALE_SECONDS = 1.5;
const SPARKS = 140;

const CUTS = IMPACTS.filter((impact) => impact.kind === 'cut');

/**
 * The three cuts leave their marks in the air.
 *
 * Each mark is a streak held at a fixed angle in front of the lens, so it
 * reads as the path the edge just took rather than an object in the scene, and
 * the three of them cross into an X with a bar through it. Opacity comes
 * straight from the scroll offset — scrub back up and the marks unmake
 * themselves in the same order they were drawn.
 */
export function SlashMarks() {
  const data = useScroll();
  const { camera } = useThree();
  const texture = useMemo(() => getStreakTexture(), []);
  const marks = useRef<(THREE.Mesh | null)[]>([]);
  const forward = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!data) return;

    camera.getWorldDirection(forward);

    CUTS.forEach((cut, i) => {
      const mesh = marks.current[i];
      if (!mesh) return;

      const pulse = impactPulse(data.offset, cut.t);
      mesh.visible = pulse > 0.01;
      if (!mesh.visible) return;

      mesh.position.copy(camera.position).addScaledVector(forward, MARK_DEPTH);
      mesh.quaternion.copy(camera.quaternion);
      mesh.rotateZ(THREE.MathUtils.degToRad(cut.angle));
      // Stretching slightly as it dies sells the light spreading outwards.
      mesh.scale.setScalar(1 + (1 - pulse) * 0.12);
      (mesh.material as THREE.MeshBasicMaterial).opacity = pulse * 0.5;
    });
  });

  return (
    <>
      {CUTS.map((cut, i) => (
        <mesh
          key={cut.t}
          ref={(mesh) => {
            marks.current[i] = mesh;
          }}
          visible={false}
          renderOrder={5}
        >
          <planeGeometry args={[2.9, 0.22]} />
          <meshBasicMaterial
            map={texture}
            color="#dcefff"
            transparent
            depthWrite={false}
            depthTest={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  );
}

/**
 * The landing: a shockwave ring, a flash, and a shower of sparks off the tip.
 *
 * This one beat is driven by the clock rather than the scroll, because the
 * slam is the last thing in the sequence — there is no scroll left for it to
 * play out over. Crossing the slam latches the start; scrolling back above it
 * arms the whole thing again.
 */
export function Finale() {
  const data = useScroll();
  const { viewport, camera } = useThree();

  const glow = useMemo(() => getGlowTexture(), []);
  const ring = useRef<THREE.Mesh>(null);
  const flash = useRef<THREE.Sprite>(null);
  const sparks = useRef<THREE.Points>(null);

  const started = useRef(-1);
  const impact = useMemo(() => new THREE.Vector3(), []);

  /** Where the tip lands, in unscaled units. */
  const landing = useMemo(() => {
    const pose = evaluateSword(SLAM_T, createSwordPose());
    return pose.direction
      .clone()
      .multiplyScalar(BLADE_TIP * pose.scale)
      .add(pose.position);
  }, []);

  const { geometry, directions } = useMemo(() => {
    const rand = createRng(4231);
    const dirs: THREE.Vector3[] = [];
    for (let i = 0; i < SPARKS; i++) {
      const angle = rand() * Math.PI * 2;
      const lift = 0.15 + rand() * 0.95;
      const speed = 0.7 + rand() * 2.4;
      dirs.push(
        new THREE.Vector3(Math.cos(angle), lift, Math.sin(angle) * 0.6)
          .normalize()
          .multiplyScalar(speed)
      );
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SPARKS * 3), 3));
    return { geometry: geo, directions: dirs };
  }, []);

  useFrame(({ clock }) => {
    if (!data) return;

    const fit = fitToViewport(viewport.width, viewport.height);
    const landed = data.offset >= SLAM_T - 0.002;

    if (landed && started.current < 0) started.current = clock.elapsedTime;
    if (!landed) started.current = -1;

    const age = started.current < 0 ? -1 : (clock.elapsedTime - started.current) / FINALE_SECONDS;
    const alive = age >= 0 && age <= 1;

    impact.copy(landing).multiplyScalar(fit);

    if (ring.current) {
      ring.current.visible = alive;
      if (alive) {
        // Fast out of the gate, then coasting — the way a real shock front goes.
        const spread = 1 - Math.pow(1 - age, 3);
        ring.current.position.copy(impact);
        ring.current.quaternion.copy(camera.quaternion);
        ring.current.scale.setScalar((0.15 + spread * 2.6) * fit);
        (ring.current.material as THREE.MeshBasicMaterial).opacity = Math.pow(1 - age, 1.8) * 0.85;
      }
    }

    if (flash.current) {
      const punch = alive ? Math.pow(1 - Math.min(age * 3.4, 1), 2) : 0;
      flash.current.visible = punch > 0.01;
      flash.current.position.copy(impact);
      flash.current.scale.setScalar((0.4 + punch * 1.5) * fit);
      (flash.current.material as THREE.SpriteMaterial).opacity = punch * 0.9;
    }

    if (sparks.current) {
      sparks.current.visible = alive;
      if (alive) {
        const seconds = age * FINALE_SECONDS;
        const attribute = sparks.current.geometry.getAttribute('position');
        const array = attribute.array as Float32Array;

        for (let i = 0; i < SPARKS; i++) {
          const dir = directions[i];
          // Ballistic, and scaled with everything else so the shower keeps its
          // proportions in any window.
          array[i * 3] = impact.x + dir.x * seconds * fit;
          array[i * 3 + 1] = impact.y + (dir.y * seconds - 2.4 * seconds * seconds) * fit;
          array[i * 3 + 2] = impact.z + dir.z * seconds * fit;
        }

        attribute.needsUpdate = true;
        (sparks.current.material as THREE.PointsMaterial).opacity = Math.pow(1 - age, 1.4);
        (sparks.current.material as THREE.PointsMaterial).size = (0.07 - age * 0.035) * fit;
      }
    }
  });

  return (
    <>
      <mesh ref={ring} visible={false} renderOrder={4}>
        <ringGeometry args={[0.87, 1, 72]} />
        <meshBasicMaterial
          color="#cbeaff"
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <sprite ref={flash} visible={false} renderOrder={4}>
        <spriteMaterial
          map={glow}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>

      <points ref={sparks} geometry={geometry} visible={false} renderOrder={4}>
        <pointsMaterial
          color="#ffd9a0"
          transparent
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </>
  );
}

/** Slow motes, so the blade moves through something rather than through a void. */
export function Motes() {
  const points = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const rand = createRng(911);
    const count = 200;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rand() - 0.5) * 10;
      positions[i * 3 + 1] = (rand() - 0.5) * 6;
      positions[i * 3 + 2] = (rand() - 0.5) * 5 - 0.5;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    const mesh = points.current;
    if (!mesh) return;
    const t = clock.elapsedTime;
    mesh.rotation.y = t * 0.018;
    mesh.position.y = Math.sin(t * 0.11) * 0.16;
  });

  return (
    <points ref={points} geometry={geometry} renderOrder={1}>
      <pointsMaterial
        size={0.026}
        sizeAttenuation
        color="#9ec8ff"
        transparent
        opacity={0.45}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}
