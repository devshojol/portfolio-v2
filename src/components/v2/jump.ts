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
  if (href === '#v2-home') return 0;
  if (href === '#v2-contact') return document.documentElement.scrollHeight;
  const el = document.querySelector(href);
  return el ? el.getBoundingClientRect().top + window.scrollY : null;
}

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
    if (lenis) lenis.scrollTo(y, { duration: 1.25 });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  };
}
