'use client';

import { useLayoutEffect, useRef } from 'react';

/**
 * Scales a single line of text to exactly fill its container's width.
 *
 * The display stack resolves to a condensed Helvetica on macOS and to Inter
 * everywhere else, and those two have very different advance widths — a
 * hardcoded `vw` size that fills the viewport on one would overflow or
 * underfill on the other. Measuring sidesteps the whole problem.
 */
export default function FitText({
  text,
  className = '',
  /** Ceiling as a share of viewport height, so short windows aren't swamped. */
  maxVh = 52,
}: {
  text: string;
  className?: string;
  maxVh?: number;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const box = wrap.current;
    const el = line.current;
    if (!box || !el) return;

    const fit = () => {
      // Measured inline-block, so scrollWidth is the text's own width rather
      // than the container's. Scale that ratio onto the available width.
      el.style.fontSize = '100px';
      const natural = el.scrollWidth;
      const available = box.clientWidth;
      if (!natural || !available) return;
      // The cap is on how tall the line ends up, so it has to divide out the
      // line-height ratio — at 0.8 a font size and its block height differ by 25%.
      const ratio =
        parseFloat(getComputedStyle(el).lineHeight) / parseFloat(getComputedStyle(el).fontSize) ||
        0.8;
      const byWidth = (available / natural) * 100 * 0.998;
      const byHeight = (window.innerHeight * maxVh) / 100 / ratio;
      el.style.fontSize = `${Math.min(byWidth, byHeight)}px`;
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    // Fallback metrics win the first pass; re-fit once the real face lands.
    document.fonts?.ready.then(fit).catch(() => {});
    return () => ro.disconnect();
  }, [text, maxVh]);

  return (
    <div ref={wrap} className={`w-full overflow-hidden ${className}`}>
      <span ref={line} className="v2-display inline-block text-[25vw] whitespace-nowrap">
        {text}
      </span>
    </div>
  );
}
