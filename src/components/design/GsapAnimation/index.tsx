'use client';

import { useMemo, useState, type ComponentType } from 'react';
import { ScrollerContext } from './scrollerContext';
import { snippets } from './snippets';
import { cn } from '@/utils/cn';

import GsapTo from './GsapTo';
import GsapFrom from './GsapFrom';
import GsapFromTo from './GsapFromTo';
import GsapTimeline from './GsapTimeline';
import GsapStagger from './GsapStagger';
import GsapScrollTrigger from './GsapScrollTrigger';
import GsapText from './GsapText';

type Demo = {
  title: string;
  description: string;
  Component: ComponentType;
};

/**
 * The same list the original `Home` screen linked to, minus the routing —
 * `react-router-dom` isn't in this project and Next wouldn't use it anyway.
 * The titles drive the top bar instead, and one demo renders at a time.
 */
const demos: Demo[] = [
  {
    title: 'GSAP To',
    description:
      'The to() method is used to animate a single element from a starting state to an ending state.',
    Component: GsapTo,
  },
  {
    title: 'GSAP From',
    description:
      'The from() method is used to animate a single element from an ending state to a starting state.',
    Component: GsapFrom,
  },
  {
    title: 'GSAP FromTo',
    description:
      'The fromTo() method is used to animate a single element from a starting state to an ending state and vice versa.',
    Component: GsapFromTo,
  },
  {
    title: 'GSAP Timeline',
    description:
      'The timeline() method is used to create a timeline to manage multiple animations.',
    Component: GsapTimeline,
  },
  {
    title: 'GSAP Stagger',
    description: 'The stagger() method is used to animate multiple elements with a stagger effect.',
    Component: GsapStagger,
  },
  {
    title: 'GSAP ScrollTrigger',
    description:
      'The ScrollTrigger plugin is used to trigger animations based on the scroll position.',
    Component: GsapScrollTrigger,
  },
  {
    title: 'GSAP Text',
    description: 'Learn how to animate text with GSAP.',
    Component: GsapText,
  },
];

export default function GsapAnimation() {
  const [active, setActive] = useState(0);
  const [showCode, setShowCode] = useState(true);
  // Held in state, not a plain ref: the demos read this on their first render
  // to build ScrollTrigger, and refs attach child-first, so a ref would still
  // be null by the time they looked.
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const scrollRef = useMemo(() => ({ current: scrollEl as HTMLElement | null }), [scrollEl]);

  const demo = demos[active];
  const Active = demo.Component;

  return (
    <div className="flex h-full w-full flex-col">
      {/* ── Top bar ───────────────────────────────────────────────── */}
      <nav className="border-line-strong bg-elevated/60 flex shrink-0 items-center gap-1.5 overflow-x-auto border-b px-3 py-2.5">
        {demos.map((item, i) => (
          <button
            key={item.title}
            type="button"
            title={item.description}
            onClick={() => {
              setActive(i);
              // Each demo starts from the top, or ScrollTrigger's demo opens
              // already scrolled past its own trigger points.
              scrollEl?.scrollTo({ top: 0 });
            }}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-medium whitespace-nowrap transition-colors',
              i === active
                ? 'border-accent/60 bg-accent/15 text-accent'
                : 'border-line text-ink-dim hover:border-line-strong hover:text-ink'
            )}
          >
            {item.title}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setShowCode((v) => !v)}
          aria-pressed={showCode}
          className={cn(
            'ml-auto shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-medium whitespace-nowrap transition-colors',
            showCode
              ? 'border-accent/60 bg-accent/15 text-accent'
              : 'border-line text-ink-dim hover:border-line-strong hover:text-ink'
          )}
        >
          {showCode ? 'Hide code' : 'Show code'}
        </button>
      </nav>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* ── Demo ────────────────────────────────────────────────── */}
        <div
          ref={setScrollEl}
          // Lenis preventDefault()s wheel events globally, which would
          // otherwise starve this container.
          data-lenis-prevent
          className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-6 py-8 sm:px-10"
        >
          {scrollEl && (
            <ScrollerContext.Provider value={scrollRef}>
              {/* Keyed on the code panel too: opening it resizes this pane, and
                  ScrollTrigger caches its measurements — remounting re-runs
                  GSAP against the new size instead of leaving it stale. */}
              <Active key={`${demo.title}:${showCode}`} />
            </ScrollerContext.Provider>
          )}
        </div>

        {/* ── Code ────────────────────────────────────────────────── */}
        {showCode && (
          <aside
            data-lenis-prevent
            className="border-line-strong bg-void/60 min-h-0 flex-1 overflow-auto border-t lg:max-w-[46%] lg:border-t-0 lg:border-l"
          >
            <div className="border-line-strong bg-elevated/40 text-ink-faint sticky top-0 border-b px-4 py-2 font-mono text-[11px] tracking-[0.15em] uppercase backdrop-blur">
              {demo.title}
            </div>
            <pre className="text-ink-dim overflow-x-auto p-4 font-mono text-[12px] leading-relaxed">
              <code>{snippets[demo.title]}</code>
            </pre>
          </aside>
        )}
      </div>
    </div>
  );
}
