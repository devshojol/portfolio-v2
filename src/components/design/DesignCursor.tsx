'use client';

import { useEffect, useRef } from 'react';
import { useHasFinePointer, usePrefersReducedMotion } from '@/lib/media';

/**
 * A targeting-reticle cursor for the design sandbox: four corner brackets
 * that spin continuously and snap wider over anything interactive, plus a
 * tight center dot that tracks 1:1. Scoped to this page only — the site's
 * main dot-and-ring Cursor stays in charge everywhere else (see Cursor.tsx,
 * which hides itself specifically on /design).
 */
export default function DesignCursor() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const finePointer = useHasFinePointer();
  const reduced = usePrefersReducedMotion();
  const enabled = finePointer && !reduced;

  useEffect(() => {
    if (!enabled) return;

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const reticle = { x: pos.x, y: pos.y };
    let rotation = 0;
    let scale = 1;
    let targetScale = 1;
    let shown = false;
    let frame = 0;

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;

      if (!shown) {
        shown = true;
        reticle.x = pos.x;
        reticle.y = pos.y;
        if (wrapRef.current) wrapRef.current.style.opacity = '1';
      }

      const el = e.target as HTMLElement | null;
      const interactive = !!el?.closest?.(
        'a, button, input, textarea, [role="button"], [data-cursor="grow"]'
      );
      targetScale = interactive ? 1.7 : 1;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.x - 2}px, ${pos.y - 2}px, 0)`;
      }
    };

    const loop = () => {
      reticle.x += (pos.x - reticle.x) * 0.22;
      reticle.y += (pos.y - reticle.y) * 0.22;
      scale += (targetScale - scale) * 0.18;
      rotation += 0.7;
      if (reticleRef.current) {
        reticleRef.current.style.transform = `translate3d(${reticle.x - 16}px, ${reticle.y - 16}px, 0) scale(${scale.toFixed(3)}) rotate(${rotation.toFixed(1)}deg)`;
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
      className="pointer-events-none fixed inset-0 z-100 hidden transition-opacity duration-300 md:block"
    >
      <div ref={reticleRef} className="absolute top-0 left-0 h-8 w-8 will-change-transform">
        <svg viewBox="0 0 32 32" className="h-full w-full">
          <path
            d="M2 10V4a2 2 0 0 1 2-2h6"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M30 10V4a2 2 0 0 0-2-2h-6"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M2 22v6a2 2 0 0 0 2 2h6"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M30 22v6a2 2 0 0 1-2 2h-6"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div
        ref={dotRef}
        className="bg-accent absolute top-0 left-0 h-1 w-1 rounded-full will-change-transform"
      />
    </div>
  );
}
