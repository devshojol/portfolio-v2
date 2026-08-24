"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useHasFinePointer, usePrefersReducedMotion } from "@/lib/media";

/**
 * A two-part cursor: a small dot that tracks 1:1 and a larger ring that
 * lags behind and swells over interactive elements. It stays hidden until
 * the pointer first moves, and is skipped entirely on touch devices or
 * when reduced motion is requested.
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
  const enabled = finePointer && !reduced && !pathname?.startsWith("/design");

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
        if (wrapRef.current) wrapRef.current.style.opacity = "1";
      }

      const el = e.target as HTMLElement | null;
      const interactive = !!el?.closest?.(
        'a, button, input, textarea, [role="button"], [data-cursor="grow"]',
      );
      targetScale = interactive ? 2.1 : 1;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.x - 3}px, ${pos.y - 3}px, 0)`;
      }
    };

    const loop = () => {
      ring.x += (pos.x - ring.x) * 0.16;
      ring.y += (pos.y - ring.y) * 0.16;
      scale += (targetScale - scale) * 0.14;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x - 18}px, ${ring.y - 18}px, 0) scale(${scale.toFixed(3)})`;
      }
      frame = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    frame = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onMove);
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
        className="absolute left-0 top-0 h-9 w-9 rounded-full border border-accent/60 mix-blend-screen will-change-transform"
      />
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-accent will-change-transform"
      />
    </div>
  );
}
