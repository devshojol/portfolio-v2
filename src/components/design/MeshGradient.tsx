'use client';

import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/lib/media';

type Blob = {
  color: string;
  /**
   * Diameter in vmax — sized against the *larger* viewport axis so the field
   * still fills a tall phone screen, where vw alone leaves it tiny.
   */
  size: number;
  top: string;
  left: string;
  opacity: number;
  /** Tailwind animation utility for the idle wander. */
  drift: string;
  /** Pointer-parallax travel in px at full deflection. */
  parallax: number;
};

// Cyan / indigo family only, so the field stays cohesive instead of turning
// into a rainbow. Colours are the theme tokens' literal values — CSS vars
// can't be interpolated inside a gradient stop list.
const BLOBS: Blob[] = [
  {
    color: '#0e7490',
    size: 50,
    top: '-14%',
    left: '-8%',
    opacity: 0.62,
    drift: 'animate-drift-a',
    parallax: 70,
  },
  {
    color: '#1e3a8a',
    size: 46,
    top: '14%',
    left: '54%',
    opacity: 0.6,
    drift: 'animate-drift-b',
    parallax: 115,
  },
  {
    color: '#075985',
    size: 44,
    top: '54%',
    left: '0%',
    opacity: 0.58,
    drift: 'animate-drift-c',
    parallax: 160,
  },
  {
    color: '#0369a1',
    size: 34,
    top: '-6%',
    left: '64%',
    opacity: 0.44,
    drift: 'animate-drift-b',
    parallax: 95,
  },
  // A deep violet keeps the field from reading as one flat teal wash.
  {
    color: '#4c1d95',
    size: 40,
    top: '56%',
    left: '58%',
    opacity: 0.5,
    drift: 'animate-drift-a',
    parallax: 140,
  },
];

export default function MeshGradient() {
  const reduced = usePrefersReducedMotion();
  const parallaxRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;

    const target = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };
    // Start the cursor blob off-centre so it eases in rather than snapping
    // from the middle on first move.
    const cursor = { x: 0.5, y: 0.4 };
    const cursorTarget = { x: 0.5, y: 0.4 };
    let frame = 0;

    const handleMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
      cursorTarget.x = e.clientX / window.innerWidth;
      cursorTarget.y = e.clientY / window.innerHeight;
    };

    const loop = () => {
      eased.x += (target.x - eased.x) * 0.1;
      eased.y += (target.y - eased.y) * 0.1;
      cursor.x += (cursorTarget.x - cursor.x) * 0.13;
      cursor.y += (cursorTarget.y - cursor.y) * 0.13;

      // Parallax lives on a wrapper so it never fights the CSS drift
      // animation, which owns the inner element's transform.
      parallaxRefs.current.forEach((el, i) => {
        if (!el) return;
        const p = BLOBS[i].parallax;
        el.style.transform = `translate3d(${(-eased.x * p).toFixed(1)}px, ${(-eased.y * p * 0.85).toFixed(1)}px, 0)`;
      });

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(calc(${(cursor.x * 100).toFixed(2)}vw - 50%), calc(${(cursor.y * 100).toFixed(2)}vh - 50%), 0)`;
      }

      frame = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    frame = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return (
    <div className="bg-void pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {BLOBS.map((blob, i) => (
        <div
          key={`${blob.color}-${i}`}
          ref={(el) => {
            parallaxRefs.current[i] = el;
          }}
          className="absolute will-change-transform"
          style={{ top: blob.top, left: blob.left }}
        >
          <div
            className={`rounded-full mix-blend-screen blur-[130px] motion-reduce:animate-none ${blob.drift}`}
            style={{
              width: `${blob.size}vmax`,
              height: `${blob.size}vmax`,
              background: `radial-gradient(circle, ${blob.color} 0%, ${blob.color}00 70%)`,
              opacity: blob.opacity,
            }}
          />
        </div>
      ))}

      {/* Light that follows the pointer. */}
      <div
        ref={cursorRef}
        className="absolute top-0 left-0 h-[34vmax] w-[34vmax] rounded-full mix-blend-screen blur-[120px] will-change-transform"
        style={{
          background: 'radial-gradient(circle, #046480 0%, #0891b200 70%)',
          opacity: 0.45,
          transform: 'translate3d(calc(50vw - 50%), calc(40vh - 50%), 0)',
        }}
      />

      {/* Sink the edges back toward the void so the blobs never wash out the
          UI sitting on top. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,#04070d99_80%,#04070d_100%)]" />
      <div className="from-void/80 absolute inset-x-0 top-0 h-40 bg-linear-to-b to-transparent" />
    </div>
  );
}
