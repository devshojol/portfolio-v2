'use client';

import type { ReactNode } from 'react';
import { useSectionChoreography } from './choreography';

/**
 * A tall wrapper with a sticky, viewport-height panel inside it. The extra
 * height is the scroll budget the footage burns while the panel sits still.
 *
 * `exit` is opt-out for the last section, where the content should stay put
 * instead of clearing the frame.
 */
export default function SectionShell({
  id,
  file,
  label,
  title,
  kicker,
  height = 'h-[200vh]',
  exit = true,
  children,
}: {
  id: string;
  file: string;
  label: string;
  title: ReactNode;
  kicker?: string;
  height?: string;
  exit?: boolean;
  children: ReactNode;
}) {
  const ref = useSectionChoreography<HTMLElement>();

  return (
    <section id={id} ref={ref} className={`relative ${height}`}>
      <div className="av-slot sticky top-0 flex h-svh items-center overflow-hidden pt-20 pb-14 sm:pt-28 sm:pb-20">
        <div {...(exit ? { 'data-av-stage': '' } : {})} className="container-x w-full">
          <header className="av-head mb-5 sm:mb-10">
            <div data-av-side className="av-label flex items-center gap-3">
              <span className="block h-1.5 w-1.5 rotate-45 bg-(--gamma)" />
              File {file} — {label}
            </div>

            <div
              data-av-rule
              className="mt-3.5 h-px w-24 origin-left bg-linear-to-r from-(--gamma) to-transparent"
            />

            <h2
              data-av-split
              className="av-title av-glow mt-4 text-[clamp(1.8rem,6.2vw,4.4rem)] text-(--paper) sm:mt-5"
            >
              {title}
            </h2>

            {kicker ? (
              <p
                data-av-up
                className="av-mono mt-3 max-w-xl text-[11px] leading-relaxed tracking-[0.16em] text-(--paper-dim) uppercase sm:mt-4 sm:text-[12px]"
              >
                {kicker}
              </p>
            ) : null}
          </header>

          {children}
        </div>
      </div>
    </section>
  );
}
