'use client';

import { useEffect, useMemo, useRef } from 'react';
import { usePrefersReducedMotion } from '@/lib/media';

const VB_W = 1920;
const VB_H = 900;

/** Deterministic PRNG so the ridges are identical on server, client and reload. */
function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smoothly interpolated value noise over `lattice` cells, sampled at t in [0,1]. */
function makeNoise(seed: number, lattice: number) {
  const rand = mulberry32(seed);
  const values = Array.from({ length: lattice + 2 }, () => rand());
  return (t: number) => {
    const x = t * lattice;
    const i = Math.floor(x);
    const f = x - i;
    const smooth = f * f * (3 - 2 * f);
    const a = values[i] ?? 0;
    const b = values[i + 1] ?? 0;
    return a + (b - a) * smooth;
  };
}

type LayerSpec = {
  seed: number;
  /** Horizontal position of the massif's summit, 0–1 across the frame. */
  peakX: number;
  height: number;
  spread: number;
  baseline: number;
  /** Segment count — kept low so ridges stay faceted rather than smooth. */
  steps: number;
  fill: string;
  /** Parallax travel in viewBox units at full pointer deflection. */
  shift: number;
  rim?: boolean;
};

// Back to front. Distant ranges sit lighter (atmospheric haze against the
// near-black sky); the foreground hills drop darker again to frame the page.
const LAYERS: LayerSpec[] = [
  // Far range — the tall central massif, palest against the sky.
  { seed: 11, peakX: 0.47, height: 430, spread: 0.31, baseline: 720, steps: 150, fill: '#101c31', shift: 14, rim: true },
  // Second summit, slightly right and lower.
  { seed: 27, peakX: 0.61, height: 350, spread: 0.24, baseline: 745, steps: 140, fill: '#0d1727', shift: 23, rim: true },
  // Mid shoulder sweeping left.
  { seed: 43, peakX: 0.33, height: 250, spread: 0.34, baseline: 780, steps: 130, fill: '#0b1220', shift: 35 },
  // Near hills, low and wide.
  { seed: 59, peakX: 0.12, height: 150, spread: 0.42, baseline: 830, steps: 120, fill: '#080e19', shift: 48 },
  // Foreground lip that grounds the bottom of the frame.
  { seed: 71, peakX: 0.74, height: 105, spread: 0.48, baseline: 880, steps: 110, fill: '#050910', shift: 64 },
];

/** Builds the top polyline and the closed fill path for one range. */
function buildLayer(spec: LayerSpec) {
  const coarse = makeNoise(spec.seed, 9);
  const mid = makeNoise(spec.seed + 101, 24);
  const fine = makeNoise(spec.seed + 202, 60);

  const points: string[] = [];
  for (let i = 0; i <= spec.steps; i++) {
    const t = i / spec.steps;
    const d = (t - spec.peakX) / spec.spread;
    const envelope = Math.exp(-d * d * 2.1);
    // Ridged noise (folded around its midpoint) gives sharp crests instead of
    // the rounded blobs plain value noise produces.
    const ridged = 1 - Math.abs(2 * mid(t) - 1);
    const h = envelope * (0.6 + 0.4 * (0.5 * coarse(t) + 0.5 * ridged)) + 0.07 * fine(t);
    const x = t * VB_W;
    const y = spec.baseline - spec.height * h;
    points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
  }

  const line = points.join(' ');
  return { line, fill: `${line} L${VB_W},${VB_H} L0,${VB_H} Z` };
}

export default function MountainBackdrop() {
  const reduced = usePrefersReducedMotion();
  const layerRefs = useRef<(SVGGElement | null)[]>([]);
  const glowRef = useRef<SVGCircleElement>(null);

  const layers = useMemo(() => LAYERS.map((spec) => ({ spec, path: buildLayer(spec) })), []);

  useEffect(() => {
    if (reduced) return;

    const target = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };
    let frame = 0;

    const handleMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const loop = () => {
      eased.x += (target.x - eased.x) * 0.09;
      eased.y += (target.y - eased.y) * 0.09;

      layerRefs.current.forEach((g, i) => {
        if (!g) return;
        const shift = LAYERS[i].shift;
        // Ranges slide against the pointer, nearest travelling furthest.
        g.setAttribute(
          'transform',
          `translate(${(-eased.x * shift).toFixed(2)} ${(-eased.y * shift * 0.32).toFixed(2)})`
        );
      });

      if (glowRef.current) {
        glowRef.current.setAttribute('cx', (((eased.x + 1) / 2) * VB_W).toFixed(1));
        glowRef.current.setAttribute('cy', (((eased.y + 1) / 2) * VB_H).toFixed(1));
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
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        // "slice" would crop this very wide viewBox down to a fragment on
        // portrait screens; stretching instead keeps the whole silhouette in
        // frame at every aspect ratio, and on an abstract range the squash
        // just reads as steeper peaks.
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="mb-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#04070d" />
            <stop offset="70%" stopColor="#070c16" />
            <stop offset="100%" stopColor="#0a1120" />
          </linearGradient>
          <radialGradient id="mb-glow">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.13" />
            <stop offset="60%" stopColor="var(--color-accent)" stopOpacity="0.04" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="mb-haze" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--color-accent)" stopOpacity="0.05" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect width={VB_W} height={VB_H} fill="url(#mb-sky)" />

        {/* Soft accent glow that drifts with the pointer, lighting the sky
            behind the peaks. */}
        <circle ref={glowRef} cx={VB_W / 2} cy={VB_H * 0.35} r={620} fill="url(#mb-glow)" />

        {layers.map(({ spec, path }, i) => (
          <g
            key={spec.seed}
            ref={(el) => {
              layerRefs.current[i] = el;
            }}
          >
            <path d={path.fill} fill={spec.fill} />
            {spec.rim && (
              <path
                d={path.line}
                fill="none"
                stroke="var(--color-accent)"
                strokeOpacity="0.1"
                strokeWidth="1.5"
                // Keeps the ridge light a hairline instead of thickening with
                // the SVG's scale — which is extreme on small screens.
                vectorEffect="non-scaling-stroke"
              />
            )}
          </g>
        ))}

        {/* Faint band of haze sitting across the mid-slopes. */}
        <rect y={VB_H * 0.63} width={VB_W} height={120} fill="url(#mb-haze)" />
      </svg>
    </div>
  );
}
