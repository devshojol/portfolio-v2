'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { motion, useMotionTemplate, useScroll, useTransform } from 'motion/react';
import PhoneMock from '@/components/ui/PhoneMock';
import { projects } from '@/lib/data';
import { usePrefersReducedMotion } from '@/lib/media';
import { cn } from '@/utils/cn';

type Project = (typeof projects)[number];
type ScrollRootRef = React.RefObject<HTMLDivElement | null>;

/**
 * Every scroll-linked hook below has to measure against *this* element, not
 * the browser viewport — the whole component is designed to live inside the
 * folder window, which is its own scroll container. `useScroll` and
 * `whileInView` both fall back to the viewport when this is null, so the
 * component still works if it's ever dropped straight onto a page.
 */
const ScrollRoot = createContext<ScrollRootRef | null>(null);

const EASE = [0.16, 1, 0.3, 1] as const;

/* ────────────────────────────────────────────────────────────────────────
   Animation primitives
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Plain enter-on-scroll: fade and lift. Used for text blocks.
 *
 * No `viewport.root`, on purpose: an IntersectionObserver already clips the
 * target against every scrolling ancestor on the way up, so something
 * scrolled out of the folder window reads as off screen against the default
 * viewport anyway. Skipping it also means this doesn't depend on the
 * container ref being populated before the observer is built.
 */
function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Scroll image reveal: a mask wipes up off the content while the content
 * itself settles back from a slight overscale, so the frame and the thing
 * inside it move at different rates. Driven by scroll position rather than a
 * one-shot trigger, so scrubbing back up plays it in reverse.
 */
function ScrollImageReveal({
  children,
  className,
  variant = 'media',
}: {
  children: ReactNode;
  className?: string;
  /**
   * Media settles back from an overscale, the way the Motion example does it.
   * Text lifts instead — zooming a paragraph reads as a rendering glitch, and
   * a scaled block of prose also pushes past its own box sideways.
   */
  variant?: 'media' | 'text';
}) {
  const root = useContext(ScrollRoot);
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    container: root ?? undefined,
    target: ref,
    offset: ['start 0.95', 'end 0.55'],
  });

  const wipe = useTransform(scrollYProgress, [0, 1], [100, 0]);
  // Built as a template rather than interpolating two inset() strings, so the
  // value is always a well-formed clip-path.
  const clipPath = useMotionTemplate`inset(${wipe}% 0% 0% 0%)`;
  const scale = useTransform(scrollYProgress, [0, 1], [1.16, 1]);
  const y = useTransform(scrollYProgress, [0, 1], ['12%', '0%']);

  const reduced = usePrefersReducedMotion();
  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div ref={ref} className={cn('overflow-hidden', className)} style={{ clipPath }}>
      <motion.div style={variant === 'media' ? { scale } : { y }}>{children}</motion.div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Horizontal gallery
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Vertical scroll drives the strip sideways. The section is three container
 * heights tall and the sticky viewport is a third of that, so one screen of
 * gallery costs three screens of scrolling.
 *
 * Those are percentages rather than `vh` because inside the folder window a
 * viewport unit means the whole browser, not the window. Percentages only
 * resolve against a definite height, which is why `ProductChapter` returns a
 * fragment — this section has to be a direct child of the scroll container.
 */
function HorizontalGallery({ project }: { project: Project }) {
  const root = useContext(ScrollRoot);
  const reduced = usePrefersReducedMotion();

  const sectionRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;

    // Measured rather than guessed at with a percentage: the card widths are
    // responsive, so the exact travel is only knowable at runtime. The
    // observer fires once on observe, which doubles as the initial measure.
    const observer = new ResizeObserver(() => {
      setDistance(Math.max(0, track.scrollWidth - viewport.clientWidth));
    });
    observer.observe(track);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    container: root ?? undefined,
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  const cards = galleryCards(project);

  // Reduced motion gets an ordinary swipeable strip — no scroll hijacking,
  // no three-screen-tall section to get past.
  if (reduced) {
    return (
      <section className="py-10">
        <GalleryHeading project={project} />
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:px-8 md:px-12">
          {cards.map((card) => (
            <div key={card.key} className="snap-center">
              {card.node}
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative h-[300%]">
      <div ref={viewportRef} className="sticky top-0 flex h-[33.3333%] flex-col justify-center">
        <GalleryHeading project={project} />

        <div className="overflow-hidden">
          <motion.div
            ref={trackRef}
            style={{ x }}
            className="flex w-max gap-4 px-5 sm:gap-6 sm:px-8 md:px-12"
          >
            {cards.map((card) => (
              <div key={card.key}>{card.node}</div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function GalleryHeading({ project }: { project: Project }) {
  return (
    <Reveal className="mb-5 px-5 sm:px-8 md:px-12">
      <p className="text-ink-faint font-mono text-[11px] tracking-[0.2em] uppercase">Gallery</p>
      <p className="text-ink-dim mt-1 text-sm">Inside {project.name} — scroll to pan</p>
    </Reveal>
  );
}

const CARD =
  'relative flex h-[20rem] w-[15rem] shrink-0 flex-col overflow-hidden rounded-2xl border p-5 sm:h-[24rem] sm:w-[18rem] md:w-[21rem]';

function galleryCards(project: Project) {
  const cards: { key: string; node: ReactNode }[] = [
    {
      key: 'device',
      node: (
        <article
          className={cn(CARD, 'border-line-strong bg-surface/60 items-center justify-center')}
          style={{ boxShadow: `inset 0 0 80px -40px ${project.accent}` }}
        >
          <div className="scale-[0.7] sm:scale-[0.82]">
            <PhoneMock variant={project.id as 'gonit' | 'chintu'} />
          </div>
        </article>
      ),
    },
  ];

  project.highlights.forEach((highlight, i) => {
    cards.push({
      key: highlight,
      node: (
        <article className={cn(CARD, 'border-line bg-surface/40 justify-end')}>
          <div
            className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full opacity-30 blur-3xl"
            style={{ background: project.accent }}
          />
          <span
            className="relative font-mono text-5xl font-semibold sm:text-6xl"
            style={{ color: project.accent }}
          >
            0{i + 1}
          </span>
          <p className="text-ink relative mt-3 text-lg leading-snug font-medium sm:text-xl">
            {highlight}
          </p>
        </article>
      ),
    });
  });

  cards.push({
    key: 'stack',
    node: (
      <article className={cn(CARD, 'border-line bg-void/50 justify-center')}>
        <p className="text-ink-faint font-mono text-[11px] tracking-[0.2em] uppercase">
          Built with
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="border-line bg-surface/60 text-ink-dim rounded-md border px-2.5 py-1 font-mono text-[11px]"
            >
              {tech}
            </span>
          ))}
        </div>
      </article>
    ),
  });

  return cards;
}

/* ────────────────────────────────────────────────────────────────────────
   Product chapter
   ──────────────────────────────────────────────────────────────────────── */

function ProductChapter({ project, index }: { project: Project; index: number }) {
  return (
    <>
      {/* ── Name + subtitle ─────────────────────────────────────────── */}
      <header className="relative overflow-hidden px-5 pt-16 sm:px-8 sm:pt-24 md:px-12">
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[36rem] max-w-full -translate-x-1/2 opacity-25 blur-3xl"
          style={{ background: `radial-gradient(circle, ${project.accent}, transparent 70%)` }}
        />

        <Reveal>
          <div className="flex items-center gap-3">
            <span
              className="font-mono text-[11px] tracking-[0.2em] uppercase"
              style={{ color: project.accent }}
            >
              0{index + 1}
            </span>
            <span className="bg-line-strong h-px w-10" />
            <span className="text-ink-faint font-mono text-[11px]">{project.year}</span>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <h2 className="text-ink mt-4 text-4xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
            {project.name}
          </h2>
        </Reveal>

        <Reveal delay={0.16}>
          <p className="text-ink-dim mt-2 text-base sm:text-xl md:text-2xl">{project.subtitle}</p>
        </Reveal>
      </header>

      {/* ── Description ─────────────────────────────────────────────── */}
      <section className="relative px-5 py-12 sm:px-8 sm:py-16 md:px-12">
        <ScrollImageReveal variant="text">
          <p className="text-ink-dim max-w-2xl text-lg leading-relaxed sm:text-xl md:text-2xl">
            {project.blurb}
          </p>
        </ScrollImageReveal>
      </section>

      {/* ── Gallery ─────────────────────────────────────────────────── */}
      <HorizontalGallery project={project} />

      {/* ── Links ───────────────────────────────────────────────────── */}
      <section className="relative px-5 py-14 sm:px-8 sm:py-20 md:px-12">
        <Reveal>
          <p className="text-ink-faint font-mono text-[11px] tracking-[0.2em] uppercase">
            Get the app
          </p>
        </Reveal>

        <div className="mt-4 flex flex-wrap gap-3">
          {project.links.map((link, i) => (
            <Reveal key={link.label} delay={0.08 * (i + 1)}>
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="group border-line-strong text-ink hover:border-accent/60 hover:text-accent-soft inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5"
              >
                {link.label}
                <svg
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M7 17 17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="via-line-strong mx-5 h-px bg-gradient-to-r from-transparent to-transparent sm:mx-8 md:mx-12" />
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Root
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Fills its parent and scrolls internally — sized for the folder window,
 * where the parent has a definite height.
 *
 * The content is held back until the scroll container is on screen. React
 * attaches refs child-first, so a plain `useRef` here would still be null when
 * the children's effects run, and every `useScroll` / `whileInView` inside
 * would bind to the browser viewport instead of this element — which is what
 * left the whole panel frozen at opacity 0.
 */
export default function Projects() {
  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);
  const rootRef = useMemo(() => ({ current: rootEl }), [rootEl]);

  return (
    <div
      ref={setRootEl}
      // Keeps the wheel from being swallowed by the page's Lenis instance.
      data-lenis-prevent
      className="relative h-full overflow-x-hidden overflow-y-auto overscroll-contain"
    >
      {rootEl && (
        <ScrollRoot.Provider value={rootRef}>
          {projects.map((project, i) => (
            <ProductChapter key={project.id} project={project} index={i} />
          ))}

          <Reveal className="px-5 py-16 sm:px-8 md:px-12">
            <p className="text-ink-faint text-sm">
              {projects.length} products — both shipped and live on the stores.
            </p>
          </Reveal>
        </ScrollRoot.Provider>
      )}
    </div>
  );
}
