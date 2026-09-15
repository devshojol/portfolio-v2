'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Button whose label swaps on hover: the resting label slides up out of a
 * masked box while a second copy rises into its place, as the fill sweeps up
 * behind it. Two stacked copies inside `overflow-hidden` — the same
 * construction the reference uses for VIEW ALL and VIEW RESUME.
 *
 * `tone` picks which panel it is sitting on: "dark" on the paper sections,
 * "light" on the accent field, where the fill and the swapped label invert.
 */
const TONES = {
  dark: {
    frame: 'border-white/25 text-white hover:border-(--v2-accent)',
    fill: 'bg-(--v2-accent)',
    swapped: 'text-black',
  },
  light: {
    frame: 'border-black/30 text-black hover:border-black',
    fill: 'bg-black',
    swapped: 'text-(--v2-accent)',
  },
} as const;

const EASE = 'duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]';

export default function SwapButton({
  href,
  submit,
  disabled,
  tone = 'dark',
  children,
  external,
  className = '',
  lead,
}: {
  href?: string;
  /** Render a submit button instead of a link. */
  submit?: boolean;
  disabled?: boolean;
  tone?: keyof typeof TONES;
  children: ReactNode;
  external?: boolean;
  className?: string;
  /** Optional mark before the label, e.g. the accent dot. */
  lead?: ReactNode;
}) {
  const t = TONES[tone];

  const body = (
    <>
      <span
        className={`pointer-events-none absolute inset-0 origin-bottom scale-y-0 ${t.fill} transition-transform ${EASE} group-hover:scale-y-100`}
      />
      {lead ? <span className="relative z-10">{lead}</span> : null}
      {/* Masked label stack: both copies move together, one out, one in. */}
      <span className="relative z-10 block h-[1.1em] overflow-hidden leading-[1.1]">
        <span
          className={`block leading-[1.1] transition-transform ${EASE} group-hover:-translate-y-full`}
        >
          {children}
        </span>
        <span
          aria-hidden="true"
          className={`block leading-[1.1] ${t.swapped} transition-transform ${EASE} group-hover:-translate-y-full`}
        >
          {children}
        </span>
      </span>
    </>
  );

  const cls = `v2-label group relative inline-flex w-fit items-center gap-3 overflow-hidden border px-7 py-4 transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${t.frame} ${className}`;

  if (submit) {
    return (
      <button type="submit" disabled={disabled} className={cls}>
        {body}
      </button>
    );
  }
  if (external) {
    return (
      <a href={href!} target="_blank" rel="noopener noreferrer" className={cls}>
        {body}
      </a>
    );
  }
  return (
    <Link href={href!} className={cls}>
      {body}
    </Link>
  );
}
