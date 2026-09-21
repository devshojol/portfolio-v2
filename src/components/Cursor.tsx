'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useHasFinePointer, usePrefersReducedMotion } from '@/lib/media';

/**
 * A two-part cursor: a square that tracks 1:1 and a larger frame that lags
 * behind, swells and turns 45° over anything interactive. It stays hidden
 * until the pointer first moves, and is skipped entirely on touch devices or
 * when reduced motion is requested.
 *
 * Both parts paint in `--cursor-accent`, so on the home page they follow the
 * theme picker. A dark halo rides under them: the accent is also the hero's
 * background colour, and without it the cursor would vanish the moment it
 * crossed onto the accent field.
 */
export default function Cursor() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const finePointer = useHasFinePointer();
  const reduced = usePrefersReducedMotion();
  // The /design sandbox has its own DesignCursor (a reticle) — two custom
  // cursors rendered at once would fight each other visually.
  const pathname = usePathname();
  const enabled = finePointer && !reduced && !pathname?.startsWith('/design');

  useEffect(() => {
    if (!enabled) return;

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: pos.x, y: pos.y };
    let scale = 1;
    let targetScale = 1;
    let shown = false;
    let frame = 0;

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;

      if (!shown) {
        shown = true;
        ring.x = pos.x;
        ring.y = pos.y;
        if (wrapRef.current) wrapRef.current.style.opacity = '1';
      }

      const el = e.target as HTMLElement | null;
      const interactive = !!el?.closest?.(
        'a, button, input, textarea, [role="button"], [data-cursor="grow"]'
      );
      targetScale = interactive ? 2.1 : 1;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.x - 4}px, ${pos.y - 4}px, 0)`;
      }
    };

    const loop = () => {
      ring.x += (pos.x - ring.x) * 0.16;
      ring.y += (pos.y - ring.y) * 0.16;
      scale += (targetScale - scale) * 0.14;
      // The turn is derived from the swell, so the two never disagree.
      const turn = ((scale - 1) / 1.1) * 45;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x - 18}px, ${ring.y - 18}px, 0) rotate(${turn.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      }
      if (dotRef.current) {
        // The dot gives way as the frame takes over.
        dotRef.current.style.opacity = String(Math.max(0, 1 - (scale - 1) * 1.4));
      }
      frame = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    frame = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={wrapRef}
      aria-hidden
      style={{ opacity: 0 }}
      className="pointer-events-none fixed inset-0 z-70 hidden transition-opacity duration-300 md:block"
    >
      <div
        ref={ringRef}
        style={{
          borderColor: 'var(--cursor-accent)',
          boxShadow: '0 0 0 1.5px rgb(0 0 0 / 0.8), inset 0 0 0 1.5px rgb(0 0 0 / 0.8)',
        }}
        className="absolute top-0 left-0 h-9 w-9 border will-change-transform"
      />
      <div
        ref={dotRef}
        style={{
          backgroundColor: 'var(--cursor-accent)',
          boxShadow: '0 0 0 2px rgb(0 0 0 / 0.85)',
        }}
        className="absolute top-0 left-0 h-2 w-2 will-change-transform"
      />
    </div>
  );
}
