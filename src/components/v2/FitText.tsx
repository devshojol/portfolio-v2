'use client';

import { useLayoutEffect, useRef } from 'react';

/**
 * Scales a wordmark to exactly fill its container's width.
 *
 * The display stack resolves to a condensed Helvetica on macOS and to Inter
 * everywhere else, and those two have very different advance widths — a
 * hardcoded `vw` size that fills the viewport on one would overflow or
 * underfill on the other. Measuring sidesteps the whole problem.
 *
 * Pass an array to break the word across lines, which is what the layout
 * wants on a phone: one shared size, chosen so the widest line fills the
 * measure and the rest stay ragged.
 */
export default function FitText({
  text,
  className = '',
  /** Ceiling on the rendered block, as a share of viewport height. */
  maxVh = 52,
}: {
  text: string | readonly string[];
  className?: string;
  maxVh?: number;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const block = useRef<HTMLSpanElement>(null);

  const lines = typeof text === 'string' ? [text] : [...text];
  const key = lines.join('\n');

  useLayoutEffect(() => {
    const box = wrap.current;
    const el = block.current;
    if (!box || !el) return;

    const fit = () => {
      // Measure at a known size, then scale that ratio onto the container.
      el.style.fontSize = '100px';
      const natural = Array.from(el.children).reduce(
        (widest, child) => Math.max(widest, (child as HTMLElement).scrollWidth),
        0
      );
      const available = box.clientWidth;
      // A hidden variant measures zero; the observer re-runs this when it shows.
      if (!natural || !available) return;

      const cs = getComputedStyle(el);
      // The cap is on how tall the block ends up, so it has to divide out both
      // the line-height ratio and the number of lines.
      const ratio = parseFloat(cs.lineHeight) / parseFloat(cs.fontSize) || 0.8;
      const rows = el.children.length || 1;
      const byWidth = (available / natural) * 100 * 0.998;
      const byHeight = (window.innerHeight * maxVh) / 100 / (ratio * rows);
      el.style.fontSize = `${Math.min(byWidth, byHeight)}px`;
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    // The observer only sees the container's own box, which doesn't change on a
    // height-only resize — but `maxVh` depends on viewport height, so that
    // alone would leave the size stale after a rotate or a window drag.
    window.addEventListener('resize', fit, { passive: true });
    // Fallback metrics win the first pass; re-fit once the real face lands.
    document.fonts?.ready.then(fit).catch(() => {});
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, [key, maxVh]);

  return (
    <div ref={wrap} className={`w-full overflow-hidden ${className}`}>
      <span ref={block} className="v2-display inline-block text-[25vw]">
        {lines.map((line) => (
          <span key={line} className="block whitespace-nowrap">
            {line}
          </span>
        ))}
      </span>
    </div>
  );
}
