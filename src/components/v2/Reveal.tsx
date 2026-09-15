'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { motion } from 'framer-motion';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

type Pending = { el: HTMLElement; offset: number; show: () => void };

/**
 * One rAF loop for every element still waiting to be revealed, running only
 * while something is pending.
 *
 * Two cheaper approaches don't hold up here. `whileInView`'s
 * IntersectionObserver misses elements that cross the whole viewport inside a
 * single frame — it reports "not intersecting" on both sides of the jump, and
 * the element stays at opacity 0 for the rest of the session. Listening for
 * `scroll` misses them too, because Lenis drives the page from its own rAF
 * loop and emits only a handful of native scroll events per gesture, so a
 * reveal can sit un-fired until the visitor happens to scroll again.
 *
 * Polling a few rects per frame costs nothing next to the scrolling itself,
 * and the loop shuts down for good once the last element has arrived.
 */
const pending = new Set<Pending>();
let frame = 0;

function tick() {
  frame = 0;
  for (const p of pending) {
    if (p.el.getBoundingClientRect().top < window.innerHeight - p.offset) {
      pending.delete(p);
      p.show();
    }
  }
  if (pending.size) frame = requestAnimationFrame(tick);
}

function watch(p: Pending) {
  pending.add(p);
  if (!frame) frame = requestAnimationFrame(tick);
  return () => {
    pending.delete(p);
  };
}

type Arrival = 'idle' | 'hidden' | 'shown';

/**
 * Reports when an element has reached the viewport, using the loop above.
 *
 * Split out of `Reveal` so a component can drive its own animation from the
 * same robust trigger — the skills grid staggers dozens of chips off one
 * observation rather than giving each its own.
 *
 * Starts `idle`, meaning "render normally": the server HTML is readable with
 * JavaScript off, and the hidden state is set in a layout effect before paint,
 * so nothing flashes.
 */
export function useArrived(ref: RefObject<HTMLElement | null>, offset = 60): Arrival {
  const [state, setState] = useState<Arrival>('idle');

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (el.getBoundingClientRect().top < window.innerHeight - offset) {
      setState('shown');
      return;
    }
    setState('hidden');
    return watch({ el, offset, show: () => setState('shown') });
  }, [ref, offset]);

  return state;
}

/**
 * Fades and lifts its children in when they reach the viewport.
 */
export default function Reveal({
  children,
  className,
  style,
  y = 32,
  delay = 0,
  /** How far into the viewport the element must reach to count as arrived. */
  offset = 60,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  y?: number;
  delay?: number;
  offset?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const state = useArrived(ref, offset);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={false}
      animate={state === 'hidden' ? { opacity: 0, y } : { opacity: 1, y: 0 }}
      transition={
        state === 'shown' ? { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] } : { duration: 0 }
      }
    >
      {children}
    </motion.div>
  );
}
