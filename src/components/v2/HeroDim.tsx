'use client';

import { useEffect, useRef } from 'react';
import { clamp01, onFrame } from './scrollDriver';
import { prefersReducedMotion } from './slant';

/**
 * Darkens the pinned hero as the dark panel rides up over it.
 *
 * Measured off the reference, which fades its hero's opacity with scroll:
 * full until about a quarter of a viewport in, then linearly to nothing at
 * ~1.4 viewports. Sampled at 768px tall it read 1.0 / 0.773 / 0.545 / 0.318 at
 * 200 / 400 / 600 / 800px of scroll, which those two constants reproduce.
 *
 * This is an overlay rather than `opacity` on the hero itself, because the
 * contact panel is pinned behind the hero for the whole page — fading the hero
 * out would reveal *that*, not the dark beneath it.
 */

/** Scroll offset where the fade begins, as a fraction of viewport height. */
const START = 0.26;
/** Where it would reach full dark. The panel covers the hero well before this. */
const END = 1.41;

export default function HeroDim() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Purely a scroll effect with no static reading, so it simply doesn't run.
    if (prefersReducedMotion()) return;

    let last = -1;
    return onFrame(() => {
      const vh = window.innerHeight;
      const p = clamp01((window.scrollY - START * vh) / ((END - START) * vh));
      if (p !== last) {
        last = p;
        el.style.opacity = p.toFixed(4);
      }
    });
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 bg-(--v2-paper) opacity-0"
    />
  );
}
