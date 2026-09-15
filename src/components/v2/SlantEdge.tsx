'use client';

import { useEffect, useRef } from 'react';
import { clamp01, onFrame } from './scrollDriver';
import { MAX_TAN, RAMP, prefersReducedMotion } from './slant';

/**
 * The wedge where the dark panel meets the hero.
 *
 * The reference doesn't cut a fixed diagonal — the edge starts flat and the
 * angle grows as you scroll, so the panel appears to tilt as it rides up over
 * the hero. Measured off the original: it skews the dark block on the Y axis,
 * ramping linearly from 0 to tan ≈ 0.12 (about 7°) across roughly the first
 * viewport of scroll, then holding.
 *
 * Skewing the panel itself would skew the type inside it, so this is a
 * decorative block of the same colour pinned to the panel's top edge. At rest
 * it sits flush and is invisible; as it skews about its top-left corner the
 * right side lifts, covering more of the hero and opening the wedge.
 */

export default function SlantEdge() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const maxDeg = Math.atan(MAX_TAN) * (180 / Math.PI);

    // Without motion the angle would be the only thing moving on the page, so
    // hold it at its end state rather than animating or flattening it.
    if (prefersReducedMotion()) {
      el.style.transform = `skewY(${-maxDeg}deg)`;
      return;
    }

    let last = -1;
    return onFrame(() => {
      const p = clamp01(window.scrollY / (window.innerHeight * RAMP));
      if (p !== last) {
        last = p;
        el.style.transform = `skewY(${-(p * maxDeg).toFixed(3)}deg)`;
      }
    });
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      // Tall enough that the skewed bottom edge never rises above the panel's
      // own top: the lift is MAX_TAN * 100vw, this is comfortably more.
      className="pointer-events-none absolute inset-x-0 top-0 h-[22vw] origin-top-left bg-(--v2-paper) will-change-transform"
    />
  );
}
