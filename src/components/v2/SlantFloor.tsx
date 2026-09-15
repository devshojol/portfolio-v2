'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { clamp01, onFrame } from './scrollDriver';
import { MAX_TAN, prefersReducedMotion } from './slant';

/**
 * The dark block's bottom edge — the one that travels up to uncover the pinned
 * contact panel.
 *
 * Same behaviour as the wedge at the top (SlantEdge): flat when the reveal
 * begins, opening to the full angle as the block rides up off the footer.
 *
 * It has to be a clip rather than a skewed decorative block, though. Up at the
 * hero the wedge is made by *adding* dark above the panel, which a block can
 * do; down here the edge has to *remove* dark to let the cyan through, and
 * nothing painted on top of an opaque background can subtract from it. So the
 * angle is driven into a custom property that the clip-path reads, one write
 * per frame.
 */
export default function SlantFloor({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const set = (px: number) => el.style.setProperty('--v2-slant-now', `${px.toFixed(1)}px`);

    if (prefersReducedMotion()) {
      set(MAX_TAN * window.innerWidth);
      return;
    }

    let last = -1;
    return onFrame(() => {
      // 0 when the block's bottom edge sits at the foot of the viewport (the
      // reveal is just starting), 1 once it has climbed out of the top.
      const bottom = el.getBoundingClientRect().bottom;
      const p = clamp01((window.innerHeight - bottom) / window.innerHeight);
      if (p !== last) {
        last = p;
        set(p * MAX_TAN * window.innerWidth);
      }
    });
  }, []);

  return (
    <div ref={ref} className={`v2-slant-bottom ${className}`}>
      {children}
    </div>
  );
}
