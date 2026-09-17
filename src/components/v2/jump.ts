import type { MouseEvent } from 'react';
import { getLenis } from '@/components/SmoothScroll';

/**
 * Resolves an in-page target to a scroll position.
 *
 * The hero and the contact panel are both `position: sticky`, so their
 * bounding rects report where they are currently *pinned*, not where they sit
 * in the document. Lenis's element-based `scrollTo` therefore resolves both to
 * roughly wherever you already are — which is why Contact and Contact Now
 * appeared to do nothing. Both are addressed by document position instead: the
 * hero is the top of the page, and the contact panel is uncovered by reaching
 * the end of it.
 */
function targetFor(href: string): number | null {
  const bottom = document.documentElement.scrollHeight - window.innerHeight;
  if (href === '#v2-home') return 0;
  if (href === '#v2-contact') return bottom;
  const el = document.querySelector(href);
  if (!el) return null;
  return Math.min(el.getBoundingClientRect().top + window.scrollY, bottom);
}

/**
 * How long the glide takes, in seconds.
 *
 * A fixed duration has to cover both a short hop and the whole page, so it
 * ends up lurching through the long ones — Contact from the top is nearly
 * 5000px, which at a flat 1.25s is a blur. Pacing it by distance keeps the
 * apparent speed roughly constant, with a floor so short hops still read as a
 * movement and a ceiling so the longest trip never drags.
 */
const PACE = 1600; // px per second of travel
const MIN = 1.1;
const MAX = 3.4;

const durationFor = (distance: number) => Math.min(MAX, Math.max(MIN, distance / PACE));

/**
 * Slow at both ends rather than only at the finish.
 *
 * Lenis's own default is an expo-out — it leaves at full speed, which is what
 * made the jump feel thrown rather than travelled.
 */
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Click handler for a v2 in-page link.
 *
 * `preventDefault` both suppresses the native jump and tells SmoothScroll's
 * document-level anchor handler that this click is already dealt with, so the
 * two don't animate to different places.
 */
export function onJump(href: string) {
  return (e: MouseEvent) => {
    if (!href.startsWith('#')) return;
    // Let modified clicks (new tab, download) behave normally.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    const y = targetFor(href);
    if (y === null) return;

    e.preventDefault();

    const lenis = getLenis();
    if (lenis) {
      // Lenis clamps the target against dimensions it caches, and those can
      // still be pre-hydration on an early click — the skills section grows by
      // ~1900px once it pins, and a Contact jump taken before Lenis notices
      // stopped short of the footer. Recomputing first costs nothing.
      lenis.resize();
      lenis.scrollTo(y, {
        duration: durationFor(Math.abs(y - window.scrollY)),
        easing: easeInOutCubic,
      });
    } else {
      // Reduced motion turns Lenis off entirely; honour that rather than
      // hand-rolling an animation it asked us not to play.
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };
}
