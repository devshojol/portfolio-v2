'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import SectionRail from './SectionRail';
import { useArrived } from './Reveal';
import { skillClusters, type SkillCluster } from './data';

/**
 * Full-height skills map: a hub with three limbs branching down to the
 * clusters, drawn on arrival rather than just faded in.
 *
 * The tree only makes sense with room to spread, so the connectors are a
 * `md`-and-up affair; below that the clusters stack as plain labelled lists,
 * which is how the same information reads on a phone.
 *
 * Hovering a chip spotlights it — the rest of the board dims and its own limb
 * lights up — and the hub swaps to a readout naming the skill and its branch.
 */
export default function Skills({ year }: { year: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const state = useArrived(ref, 120);
  const on = state !== 'hidden';

  /** The hovered chip, as `[clusterId, skill]`. */
  const [hover, setHover] = useState<[string, string] | null>(null);
  const activeCluster = hover?.[0] ?? null;

  return (
    <section id="v2-skills" className="relative z-10 bg-(--v2-paper)">
      <div className="v2-container relative z-10 pt-16 pb-28 md:pt-24 md:pb-40">
        <SectionRail index="03" label="Skills" year={year} />

        <div
          ref={ref}
          onPointerLeave={() => setHover(null)}
          className="relative flex flex-col items-center md:min-h-[78vh] md:justify-center"
        >
          <Hub on={on} hover={hover} />

          <Branches on={on} active={activeCluster} />

          {/* Trunk continues past the two upper clusters to the third. */}
          <div className="relative w-full">
            <Limb
              on={on}
              active={activeCluster === 'craft'}
              className="absolute top-0 bottom-0 left-1/2 hidden w-px -translate-x-1/2 md:block"
              axis="y"
              delay={0.25}
            />

            <div className="grid gap-10 md:grid-cols-2 md:gap-24">
              <Cluster
                cluster={skillClusters[0]}
                on={on}
                hover={hover}
                setHover={setHover}
                baseDelay={0.5}
              />
              <Cluster
                cluster={skillClusters[1]}
                on={on}
                hover={hover}
                setHover={setHover}
                baseDelay={0.62}
              />
            </div>
          </div>

          <Limb
            on={on}
            active={activeCluster === 'craft'}
            className="hidden h-14 w-px md:block"
            axis="y"
            delay={0.3}
          />

          <div className="mt-10 w-full md:mt-0">
            <Cluster
              cluster={skillClusters[2]}
              on={on}
              hover={hover}
              setHover={setHover}
              baseDelay={0.74}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Hub ───────────────────────────────────────────────── */

function Hub({ on, hover }: { on: boolean; hover: [string, string] | null }) {
  const label = hover ? skillClusters.find((c) => c.id === hover[0])?.label : 'Hover to inspect';

  return (
    <div className="relative mb-10 md:mb-0">
      {/* Slow breathing glow, so the hub never sits completely still. */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-16 -z-10 rounded-full bg-(--v2-accent) blur-3xl"
        animate={{ opacity: [0.07, 0.16, 0.07], scale: [1, 1.1, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        initial={false}
        animate={on ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 18, scale: 0.96 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="border border-(--v2-accent)/40 bg-black/40 px-8 py-5 text-center backdrop-blur-sm md:px-12 md:py-6"
      >
        <h2 className="v2-display text-xl md:text-3xl">My Skills</h2>

        {/* Readout swaps in place; the box is fixed-height so nothing jumps. */}
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
      </motion.div>
    </div>
  );
}

/* ── Connectors ────────────────────────────────────────── */

/**
 * One rule of the tree. Scales from nothing along its own axis so the diagram
 * draws itself rather than fading in as a finished picture.
 */
function Limb({
  on,
  active,
  axis,
  delay,
  className,
}: {
  on: boolean;
  active: boolean;
  axis: 'x' | 'y';
  delay: number;
  className: string;
}) {
  return (
    <motion.span
      aria-hidden="true"
      className={`origin-top ${className}`}
      style={{ transformOrigin: axis === 'y' ? 'top' : 'center' }}
      initial={false}
      animate={{
        [axis === 'y' ? 'scaleY' : 'scaleX']: on ? 1 : 0,
        backgroundColor: active ? 'var(--v2-accent)' : 'rgba(255,255,255,0.14)',
      }}
      transition={{
        default: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] },
        backgroundColor: { duration: 0.25 },
      }}
    />
  );
}

function Branches({ on, active }: { on: boolean; active: string | null }) {
  return (
    <div aria-hidden="true" className="relative hidden h-28 w-full md:block">
      <Limb
        on={on}
        active={active !== null}
        axis="y"
        delay={0.05}
        className="absolute top-0 left-1/2 h-12 w-px -translate-x-1/2"
      />
      <Limb
        on={on}
        active={active === 'frontend' || active === 'backend'}
        axis="x"
        delay={0.18}
        className="absolute top-12 right-1/4 left-1/4 h-px"
      />
      <Limb
        on={on}
        active={active === 'frontend'}
        axis="y"
        delay={0.32}
        className="absolute top-12 left-1/4 h-16 w-px"
      />
      <Limb
        on={on}
        active={active === 'backend'}
        axis="y"
        delay={0.32}
        className="absolute top-12 right-1/4 h-16 w-px"
      />
    </div>
  );
}

/* ── Clusters ──────────────────────────────────────────── */

const listVariants: Variants = {
  hidden: {},
  show: (base: number) => ({ transition: { staggerChildren: 0.035, delayChildren: base } }),
};

const chipVariants: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.94 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] } },
};

function Cluster({
  cluster,
  on,
  hover,
  setHover,
  baseDelay,
}: {
  cluster: SkillCluster;
  on: boolean;
  hover: [string, string] | null;
  setHover: (v: [string, string] | null) => void;
  baseDelay: number;
}) {
  return (
    <div className="relative">
      <p className="v2-label mb-4 text-white/35">({cluster.label})</p>

      <motion.ul
        variants={listVariants}
        custom={baseDelay}
        initial={false}
        animate={on ? 'show' : 'hidden'}
        className="flex flex-wrap gap-2"
      >
        {cluster.items.map((skill) => {
          // Spotlight: anything that isn't the hovered chip steps back.
          const dimmed = hover !== null && hover[1] !== skill;
          return (
            <motion.li key={skill} variants={chipVariants}>
              <motion.button
                type="button"
                onHoverStart={() => setHover([cluster.id, skill])}
                onHoverEnd={() => setHover(null)}
                onFocus={() => setHover([cluster.id, skill])}
                onBlur={() => setHover(null)}
                animate={{ opacity: dimmed ? 0.28 : 1, y: hover?.[1] === skill ? -3 : 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="v2-label group relative block cursor-default overflow-hidden border border-white/15 px-3 py-2 text-white/70 transition-colors duration-300 hover:border-(--v2-accent) hover:text-black focus-visible:border-(--v2-accent) focus-visible:text-black focus-visible:outline-none"
              >
                {/* Accent sweeps up behind the label, as on the buttons. */}
                <span className="pointer-events-none absolute inset-0 origin-bottom scale-y-0 bg-(--v2-accent) transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100 group-focus-visible:scale-y-100" />
                <span className="relative z-10">{skill}</span>
              </motion.button>
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  );
}
