'use client';

import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';

const SAMPLES = 28;
/** Floats per sample: two world points (outer edge, inner edge) of the ribbon. */
const FLOATS_PER_SAMPLE = 6;

/**
 * A gap this large between two frames is a scroll jump, not a swing — someone
 * threw the scrollbar. Smearing a ribbon across it would paint a sheet of
 * light over the whole frame, so the history restarts instead.
 */
const TELEPORT_DISTANCE = 2.5;

export type BladeTrailHandle = {
  /**
   * Records where the blade is this frame. `strength` is the emission
   * brightness — the rig feeds it tip speed, so slow moves leave nothing and
   * a cut leaves a bright arc. `dt` ages the samples already stored.
   */
  push: (outer: THREE.Vector3, inner: THREE.Vector3, strength: number, dt: number) => void;
};

/**
 * The swipe ribbon behind a cut.
 *
 * Every frame the rig hands over two points on the blade; the newest pair is
 * written to the head of a fixed-length history and the rest shifts back one
 * slot, so the mesh is a strip stretched between the blade's last ~half second
 * of positions. Emission strength is stored *per sample* rather than read from
 * the current frame, which is what lets the arc keep its shape as it fades
 * instead of dimming all at once.
 *
 * Positions are world-space, so this has to live on an untransformed group.
 */
const BladeTrail = forwardRef<BladeTrailHandle, { color?: THREE.ColorRepresentation }>(
  function BladeTrail({ color = '#bfe9ff' }, ref) {
    const geometry = useMemo(() => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(SAMPLES * FLOATS_PER_SAMPLE), 3)
      );
      // itemSize 4 — the alpha channel carries the fade, which additive
      // blending honours through the source-alpha factor.
      geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(SAMPLES * 8), 4));

      const indices: number[] = [];
      for (let i = 0; i < SAMPLES - 1; i++) {
        const a = i * 2;
        indices.push(a, a + 1, a + 3, a, a + 3, a + 2);
      }
      geo.setIndex(indices);
      return geo;
    }, []);

    /** Emission strength at the moment each sample was recorded. */
    const emitted = useMemo(() => new Float32Array(SAMPLES), []);
    const seeded = useRef(false);
    const rgb = useMemo(() => new THREE.Color(color), [color]);

    useImperativeHandle(ref, () => ({
      push(outer, inner, strength, dt) {
        const position = geometry.getAttribute('position') as THREE.BufferAttribute;
        const colors = geometry.getAttribute('color') as THREE.BufferAttribute;
        const pos = position.array as Float32Array;
        const col = colors.array as Float32Array;

        const jumped =
          seeded.current &&
          Math.abs(outer.x - pos[0]) + Math.abs(outer.y - pos[1]) + Math.abs(outer.z - pos[2]) >
            TELEPORT_DISTANCE;

        if (!seeded.current || jumped) {
          for (let i = 0; i < SAMPLES; i++) {
            const o = i * FLOATS_PER_SAMPLE;
            pos[o] = outer.x;
            pos[o + 1] = outer.y;
            pos[o + 2] = outer.z;
            pos[o + 3] = inner.x;
            pos[o + 4] = inner.y;
            pos[o + 5] = inner.z;
          }
          emitted.fill(0);
          seeded.current = true;
        } else {
          pos.copyWithin(FLOATS_PER_SAMPLE, 0, pos.length - FLOATS_PER_SAMPLE);
          emitted.copyWithin(1, 0, emitted.length - 1);
          pos[0] = outer.x;
          pos[1] = outer.y;
          pos[2] = outer.z;
          pos[3] = inner.x;
          pos[4] = inner.y;
          pos[5] = inner.z;
        }

        // Ageing by time, not by frame, so a stalled or throttled loop lets the
        // arc fade out instead of leaving it hanging in mid-air.
        const decay = Math.pow(0.05, dt);
        for (let i = 1; i < SAMPLES; i++) emitted[i] *= decay;
        emitted[0] = strength;

        for (let i = 0; i < SAMPLES; i++) {
          const age = 1 - i / (SAMPLES - 1);
          const alpha = Math.pow(age, 1.7) * emitted[i];
          const o = i * 8;
          col[o] = rgb.r;
          col[o + 1] = rgb.g;
          col[o + 2] = rgb.b;
          col[o + 3] = alpha;
          col[o + 4] = rgb.r;
          col[o + 5] = rgb.g;
          col[o + 6] = rgb.b;
          // The inner edge is dimmer, so the ribbon reads as a glint coming off
          // the edge rather than a flat sheet of light.
          col[o + 7] = alpha * 0.18;
        }

        position.needsUpdate = true;
        colors.needsUpdate = true;
      },
    }));

    return (
      <mesh geometry={geometry} frustumCulled={false} renderOrder={2}>
        <meshBasicMaterial
          vertexColors
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    );
  }
);

export default BladeTrail;
