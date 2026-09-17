'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/media';
import SectionRail from './SectionRail';
import { useArrived } from './Reveal';
import { clamp01, onFrame } from './scrollDriver';
import { skillClusters, type SkillCluster } from './data';

/* ── Timing, as fractions of the section's scroll ──────── */

/** The three routes draw over the opening of the scroll. */
const DRAW_END = 0.24;
/** Then the chips come in, one after another, over the rest. */
const CHIPS_FROM = 0.28;
const CHIPS_TO = 0.96;
/** How much of that window a single chip takes; the rest is its stagger. */
const CHIP_SPAN = 0.22;

const LARGE = '(min-width: 1024px)';

/** Breathing room kept above and below the pinned diagram, in total. */
const SHELL = 64;
/** Never shrink past this — below it the labels stop being readable. */
const MIN_SCALE = 0.62;

/** True once there's room for the branching diagram. */
function useLarge() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(LARGE);
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    },
    () => window.matchMedia(LARGE).matches,
    () => false
  );
}

/**
 * Skills as a branching map.
 *
 * On large screens the section pins and the scroll itself becomes the
 * timeline: the three routes draw out of the hub, then every chip fades up in
 * turn as you keep scrolling. Below `lg` there is no room to branch and
 * pinning a tall section on a phone is miserable, so it falls back to normal
 * flow with the same sequence played once on arrival.
 */
export default function Skills({ year }: { year: number }) {
  const large = useLarge();
  const reduced = usePrefersReducedMotion();
  const pinned = large && !reduced;

  const trackRef = useRef<HTMLDivElement>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const arrival = useArrived(diagramRef, 120);

  /** 0 → 1 across the section. Drives everything; never re-renders React. */
  const progress = useMotionValue(0);

  useEffect(() => {
    if (!pinned) {
      // Nothing to scrub against — play the same sequence once on arrival.
      const controls = animate(progress, arrival === 'hidden' ? 0 : 1, {
        duration: 1.8,
        ease: 'easeOut',
      });
      return () => controls.stop();
    }
    return onFrame(() => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      progress.set(travel > 0 ? clamp01(-rect.top / travel) : 1);
    });
  }, [pinned, arrival, progress]);

  /** The hovered chip, as `[clusterIndex, skill]`. */
  const [hover, setHover] = useState<[number, string] | null>(null);

  /**
   * Fit the pinned diagram to the viewport.
   *
   * At narrower desktops the three columns are tight enough that the side
   * panels wrap to six rows, and the whole map grows taller than the screen —
   * which clipped the bottom box off at 1024. Rather than let it overflow, it
   * scales down just enough to fit and rides up toward the top; when there is
   * room again the scale returns to 1 and it sits where it was.
   *
   * `offsetHeight` is a layout value and ignores the transform, so measuring
   * the thing we are scaling can't feed back on itself.
   */
  const fitRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 1, height: 0 });

  const applyFit = useCallback(() => {
    const el = fitRef.current;
    const natural = el?.offsetHeight ?? 0;
    if (!natural) return;
    const room = window.innerHeight - SHELL;
    const scale = Math.min(1, Math.max(MIN_SCALE, room / natural));
    setFit({ scale, height: natural * scale });
  }, []);

  useLayoutEffect(() => {
    if (!pinned) return;
    applyFit();
    const el = fitRef.current;
    if (!el) return;
    const ro = new ResizeObserver(applyFit);
    ro.observe(el);
    window.addEventListener('resize', applyFit, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', applyFit);
    };
  }, [pinned, applyFit]);

  // Chips are numbered across the whole board, not per cluster, so the stagger
  // runs as one sequence instead of restarting three times.
  const offsets = skillClusters.map((_, i) =>
    skillClusters.slice(0, i).reduce((n, c) => n + c.items.length, 0)
  );
  const total = skillClusters.reduce((n, c) => n + c.items.length, 0);

  return (
    <section id="v2-skills" className="relative z-10 bg-(--v2-paper)">
      <div ref={trackRef} className={pinned ? 'relative h-[300vh]' : 'relative'}>
        <div
          className={
            pinned ? 'sticky top-0 flex h-screen flex-col justify-center' : 'flex flex-col'
          }
        >
          <div className="v2-container relative py-16 lg:py-0">
            {/* Reserves exactly the scaled height, so the sticky screen still
                centres the diagram rather than centring its unscaled box. */}
            <div style={pinned && fit.height ? { height: fit.height } : undefined}>
              <div
                ref={fitRef}
                style={
                  pinned
                    ? { transform: `scale(${fit.scale})`, transformOrigin: 'top center' }
                    : undefined
                }
              >
                <SectionRail index="03" label="Skills" year={year} />

                <div
                  ref={diagramRef}
                  onPointerLeave={() => setHover(null)}
                  className="relative mt-10 lg:mt-14"
                >
                  <Hub progress={progress} hover={hover} />

                  <Routes
                    progress={progress}
                    active={hover?.[0] ?? null}
                    enabled={large}
                    hubRef={diagramRef}
                  />

                  <div className="mt-12 grid gap-6 lg:mt-20 lg:grid-cols-3 lg:gap-8">
                    {skillClusters.map((cluster, i) => (
                      <Panel
                        key={cluster.id}
                        cluster={cluster}
                        clusterIndex={i}
                        baseIndex={offsets[i]}
                        total={total}
                        progress={progress}
                        hover={hover}
                        setHover={setHover}
                        // frontend left, backend right, tools centred below.
                        className={
                          i === 0
                            ? 'lg:col-start-1 lg:row-start-1'
                            : i === 1
                              ? 'lg:col-start-3 lg:row-start-1'
                              : 'lg:col-start-2 lg:row-start-2'
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Hub ───────────────────────────────────────────────── */

function Hub({
  progress,
  hover,
}: {
  progress: MotionValue<number>;
  hover: [number, string] | null;
}) {
  const opacity = useTransform(progress, [0, 0.06], [0, 1]);
  const y = useTransform(progress, [0, 0.06], [16, 0]);
  const label = hover ? skillClusters[hover[0]].label : 'Hover to inspect';

  return (
    <motion.div style={{ opacity, y }} className="relative mx-auto w-fit">
      {/* Slow breathing glow, so the hub never sits completely still. */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-16 -z-10 rounded-full bg-(--v2-accent) blur-3xl"
        animate={{ opacity: [0.07, 0.16, 0.07], scale: [1, 1.1, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div
        data-hub
        className="border border-(--v2-accent)/40 bg-black/40 px-10 py-5 text-center backdrop-blur-sm"
      >
        <h2 className="v2-display text-xl md:text-3xl">My Skills</h2>
        {/* Fixed-height slot so a swapping readout can't shift the diagram. */}
        <div className="mt-2 flex h-4 items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={hover ? hover[1] : 'idle'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="v2-label whitespace-nowrap"
            >
              {hover ? (
                <>
                  <span className="text-(--v2-accent)">{hover[1]}</span>
                  <span className="text-white/35"> — {label}</span>
                </>
              ) : (
                <span className="text-white/25">{label}</span>
              )}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Connector routes ──────────────────────────────────── */

type Route = { d: string; id: string };

/**
 * One stroked path per branch, measured off the real boxes rather than laid
 * out in percentages — that way each arrow lands on its panel at any width,
 * and hovering a cluster can light its own route and nothing else.
 */
function Routes({
  progress,
  active,
  enabled,
  hubRef,
}: {
  progress: MotionValue<number>;
  active: number | null;
  enabled: boolean;
  hubRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [routes, setRoutes] = useState<Route[]>([]);

  const measure = useCallback(() => {
    const root = hubRef.current;
    if (!root) return;
    const hub = root.querySelector('[data-hub]');
    const panels = [...root.querySelectorAll('[data-panel]')];
    if (!hub || panels.length < 3) return;

    const base = root.getBoundingClientRect();
    const rel = (r: DOMRect) => ({ x: r.left - base.left, y: r.top - base.top });

    const h = hub.getBoundingClientRect();
    const from = { x: rel(h).x + h.width / 2, y: rel(h).y + h.height };

    const tops = panels.map((p) => {
      const r = p.getBoundingClientRect();
      return { x: rel(r).x + r.width / 2, y: rel(r).y };
    });

    // The crossbar sits partway down the gap between hub and the side panels.
    const rail = from.y + (Math.min(tops[0].y, tops[1].y) - from.y) * 0.45;
    // Arrowhead, drawn as part of the same stroke so it inherits the colour.
    const head = (x: number, y: number) => ` M ${x - 7} ${y - 10} L ${x} ${y} L ${x + 7} ${y - 10}`;

    setBox({ w: base.width, h: base.height });
    setRoutes([
      {
        id: 'frontend',
        d: `M ${from.x} ${from.y} L ${from.x} ${rail} L ${tops[0].x} ${rail} L ${tops[0].x} ${tops[0].y}${head(tops[0].x, tops[0].y)}`,
      },
      {
        id: 'backend',
        d: `M ${from.x} ${from.y} L ${from.x} ${rail} L ${tops[1].x} ${rail} L ${tops[1].x} ${tops[1].y}${head(tops[1].x, tops[1].y)}`,
      },
      {
        id: 'tools',
        d: `M ${from.x} ${from.y} L ${tops[2].x} ${tops[2].y}${head(tops[2].x, tops[2].y)}`,
      },
    ]);
  }, [hubRef]);

  useLayoutEffect(() => {
    // Below `lg` the diagram isn't rendered at all, so there is nothing to
    // measure and no state to clear — the early return below handles it.
    if (!enabled) return;
    measure();
    const root = hubRef.current;
    if (!root) return;
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    // Web fonts land after first paint and change the boxes under us.
    document.fonts?.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, [enabled, measure, hubRef]);

  if (!enabled || routes.length === 0) return null;

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      viewBox={`0 0 ${box.w} ${box.h}`}
      fill="none"
    >
      {routes.map((route, i) => (
        <RoutePath key={route.id} d={route.d} progress={progress} active={active === i} order={i} />
      ))}
    </svg>
  );
}

function RoutePath({
  d,
  progress,
  active,
  order,
}: {
  d: string;
  progress: MotionValue<number>;
  active: boolean;
  order: number;
}) {
  // Routes start together but finish apart, so the map unfolds rather than
  // snapping into place all at once.
  const from = order * 0.03;
  const pathLength = useTransform(progress, [from, DRAW_END + from], [0, 1]);

  return (
    <motion.path
      d={d}
      style={{ pathLength }}
      strokeWidth={1}
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={{ stroke: active ? 'var(--v2-accent)' : 'rgba(255,255,255,0.18)' }}
      transition={{ duration: 0.25 }}
    />
  );
}

/* ── Clusters ──────────────────────────────────────────── */

function Panel({
  cluster,
  clusterIndex,
  baseIndex,
  total,
  progress,
  hover,
  setHover,
  className,
}: {
  cluster: SkillCluster;
  clusterIndex: number;
  baseIndex: number;
  total: number;
  progress: MotionValue<number>;
  hover: [number, string] | null;
  setHover: (v: [number, string] | null) => void;
  className: string;
}) {
  const active = hover?.[0] === clusterIndex;

  return (
    <motion.div
      data-panel
      animate={{ borderColor: active ? 'var(--v2-accent)' : 'rgba(255,255,255,0.12)' }}
      transition={{ duration: 0.25 }}
      className={`border p-5 lg:p-6 ${className}`}
    >
      <p className="v2-label mb-4 text-white/35">({cluster.label})</p>
      <ul className="flex flex-wrap gap-2">
        {cluster.items.map((skill, i) => (
          <Chip
            key={skill}
            skill={skill}
            clusterIndex={clusterIndex}
            step={(baseIndex + i) / Math.max(1, total - 1)}
            progress={progress}
            dimmed={hover !== null && hover[1] !== skill}
            lifted={hover?.[1] === skill}
            setHover={setHover}
          />
        ))}
      </ul>
    </motion.div>
  );
}

function Chip({
  skill,
  clusterIndex,
  step,
  progress,
  dimmed,
  lifted,
  setHover,
}: {
  skill: string;
  clusterIndex: number;
  step: number;
  progress: MotionValue<number>;
  dimmed: boolean;
  lifted: boolean;
  setHover: (v: [number, string] | null) => void;
}) {
  // Each chip owns a slice of the chip window, offset by its place in the run.
  const start = CHIPS_FROM + step * (CHIPS_TO - CHIPS_FROM - CHIP_SPAN);
  const opacity = useTransform(progress, [start, start + CHIP_SPAN], [0, 1]);
  const y = useTransform(progress, [start, start + CHIP_SPAN], [14, 0]);
  const scale = useTransform(progress, [start, start + CHIP_SPAN], [0.92, 1]);

  return (
    // Reveal rides the outer element and the spotlight the inner one, so the
    // two opacities multiply instead of fighting over the same property.
    <motion.li style={{ opacity, y, scale }}>
      <motion.button
        type="button"
        onHoverStart={() => setHover([clusterIndex, skill])}
        onHoverEnd={() => setHover(null)}
        onFocus={() => setHover([clusterIndex, skill])}
        onBlur={() => setHover(null)}
        animate={{ opacity: dimmed ? 0.28 : 1, y: lifted ? -3 : 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="v2-label group relative block cursor-default overflow-hidden border border-white/15 px-3 py-2 text-white/70 transition-colors duration-300 hover:border-(--v2-accent) hover:text-black focus-visible:border-(--v2-accent) focus-visible:text-black focus-visible:outline-hidden"
      >
        {/* Accent sweeps up behind the label, as on the buttons. */}
        <span className="pointer-events-none absolute inset-0 origin-bottom scale-y-0 bg-(--v2-accent) transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100 group-focus-visible:scale-y-100" />
        <span className="relative z-10">{skill}</span>
      </motion.button>
    </motion.li>
  );
}
