'use client';

import Link from 'next/link';
import { profile, socials } from '@/lib/data';

/** Tail of the page — the last of `all_section.mp4` plays out behind it. */
export default function AvOutro() {
  return (
    <footer className="relative flex h-[85vh] items-end">
      <div className="container-x w-full pb-16">
        <div className="h-px w-full bg-linear-to-r from-(--gamma)/50 via-white/10 to-transparent" />

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="av-label">End of transmission</div>
            <p className="av-title mt-3 text-[clamp(1.5rem,4vw,2.6rem)] text-(--paper)">
              {profile.name}
            </p>
            <p className="av-mono mt-2 text-[10px] tracking-[0.24em] text-(--paper-dim) uppercase">
              {profile.role} · {profile.location}
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="flex flex-wrap gap-4">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  className="av-mono text-[10px] tracking-[0.22em] text-(--paper-dim) uppercase transition-colors hover:text-(--gamma)"
                >
                  {s.label}
                </a>
              ))}
            </div>
            <Link
              href="/"
              className="av-mono text-[10px] tracking-[0.22em] text-(--gamma) uppercase transition-opacity hover:opacity-70"
            >
              ← Back to the standard portfolio
            </Link>
            <a
              href="#assemble"
              className="av-mono text-[10px] tracking-[0.22em] text-(--paper-dim) uppercase transition-colors hover:text-(--gamma)"
            >
              Replay from the top ↑
            </a>
          </div>
        </div>

        <p className="av-mono mt-8 text-[9px] tracking-[0.2em] text-(--paper-dim)/60 uppercase">
          Footage: The Avengers (2012), Marvel Studios — used here as a personal, non-commercial
          motion study. Audio muted throughout.
        </p>
      </div>
    </footer>
  );
}
