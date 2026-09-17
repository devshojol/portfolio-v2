'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { gsap, useGSAP, ScrollTrigger } from './gsap';
import { SECTIONS } from './config';

const timecode = (progress: number) => {
  const total = 65;
  const s = Math.round(progress * total);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

/** Fixed readout that frames the footage: file rail, progress, timecode. */
export default function Hud({
  visible,
  cinema,
  soundBlocked,
  onToggleCinema,
  onEnableSound,
}: {
  visible: boolean;
  cinema: boolean;
  soundBlocked: boolean;
  onToggleCinema: () => void;
  onEnableSound: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useGSAP(
    () => {
      /* Resolved against the document, not the hook's scope: `useGSAP` scopes
         selector strings to the HUD element, which contains none of the
         sections — a string here would silently fall back to the whole page. */
      const triggers = SECTIONS.map((section, i) =>
        ScrollTrigger.create({
          trigger: document.getElementById(section.id) ?? undefined,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => {
            if (self.isActive) setActive(i);
          },
          /* Triggers are first measured behind the loading screen, where the
             document has no scroll distance at all; re-assert the reading once
             the real measurements land. */
          onRefresh: (self) => {
            if (self.isActive) setActive(i);
          },
        })
      );

      const page = ScrollTrigger.create({
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          setProgress(self.progress);
          gsap.set(barRef.current, { scaleX: self.progress });
        },
      });

      return () => {
        triggers.forEach((t) => t.kill());
        page.kill();
      };
    },
    { scope: rootRef }
  );

  const current = SECTIONS[active];
  /* While a cut is playing the readout gets out of the way — bars in, chrome
     out — and only the transport stays up. */
  const chrome = cinema ? 'opacity-0' : 'opacity-100';

  return (
    <div
      ref={rootRef}
      aria-hidden={!visible}
      className="pointer-events-none fixed inset-0 z-40 transition-opacity duration-700"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {/* letterbox */}
      <div
        className="absolute inset-x-0 top-0 bg-black transition-[height] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ height: cinema ? '5vh' : 0 }}
      />
      <div
        className="absolute inset-x-0 bottom-0 bg-black transition-[height] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ height: cinema ? '5vh' : 0 }}
      />

      {/* identity */}
      <div
        className={`av-hud-id absolute top-5 left-5 transition-opacity duration-500 sm:top-7 sm:left-8 ${chrome}`}
      >
        <Link
          href="/"
          className="group pointer-events-auto inline-flex items-center gap-2.5"
          title="Back to the main portfolio"
        >
          <span className="av-blip block h-1.5 w-1.5 rotate-45 bg-(--gamma)" />
          <span className="av-mono text-[11px] tracking-[0.26em] text-(--paper) uppercase transition-colors group-hover:text-(--gamma)">
            Shojol Islam
          </span>
        </Link>
        <div className="av-mono mt-1.5 pl-4 text-[9px] tracking-[0.3em] text-(--paper-dim) uppercase">
          Frontend developer
        </div>
      </div>

      {/* current file */}
      <div
        className={`absolute top-5 right-5 text-right transition-opacity duration-500 sm:top-7 sm:right-8 ${chrome}`}
      >
        <div className="av-label">File {current.file}</div>
        <div className="av-mono mt-1 text-[11px] tracking-[0.2em] text-(--paper) uppercase">
          {current.label}
        </div>
      </div>

      {/* section rail */}
      <nav
        className={`pointer-events-auto absolute top-1/2 right-6 hidden -translate-y-1/2 flex-col items-end gap-3.5 transition-opacity duration-500 lg:flex ${chrome}`}
      >
        {SECTIONS.map((section, i) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="group flex items-center gap-3"
            aria-current={i === active ? 'true' : undefined}
          >
            <span
              className="av-mono text-[9px] tracking-[0.22em] uppercase opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ color: 'var(--gamma)' }}
            >
              {section.label}
            </span>
            <span
              className="block h-px transition-all duration-500"
              style={{
                width: i === active ? 30 : 14,
                backgroundColor: i === active ? 'var(--gamma)' : 'rgba(238,244,233,0.32)',
                boxShadow: i === active ? '0 0 10px rgba(163,255,60,0.7)' : 'none',
              }}
            />
          </a>
        ))}
      </nav>

      {/* transport + progress */}
      <div
        className="absolute inset-x-0 bottom-0 transition-[bottom] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ bottom: cinema ? '5vh' : 0 }}
      >
        <div className="flex items-end justify-between gap-4 px-5 pb-3 sm:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onToggleCinema}
              aria-pressed={cinema}
              disabled={!visible}
              className="av-mono pointer-events-auto inline-flex items-center gap-2 border border-(--gamma)/60 bg-[#04070a]/70 px-3 py-1.5 text-[10px] tracking-[0.2em] text-(--gamma-soft) uppercase backdrop-blur-[3px] transition-all duration-300 hover:bg-(--gamma) hover:text-[#04070a]"
            >
              <span aria-hidden>{cinema ? '■' : '▶'}</span>
              {cinema ? 'Stop · Esc' : 'Play with sound'}
            </button>

            {cinema && soundBlocked && (
              <button
                type="button"
                onClick={onEnableSound}
                className="av-mono pointer-events-auto inline-flex items-center gap-2 border border-white/25 bg-[#04070a]/70 px-3 py-1.5 text-[10px] tracking-[0.2em] text-(--paper) uppercase backdrop-blur-[3px] transition-all duration-300 hover:border-(--gamma)/70 hover:text-(--gamma-soft)"
              >
                <span aria-hidden>🔊</span>
                Sound
              </button>
            )}

            <span className="av-mono hidden text-[10px] tracking-[0.26em] text-(--paper-dim) uppercase sm:inline">
              <span className="text-(--gamma)">REC</span> {timecode(progress)} / 01:05
            </span>
          </div>

          <div className="av-mono text-right text-[10px] tracking-[0.26em] text-(--paper-dim) uppercase">
            {cinema
              ? soundBlocked
                ? 'Playing · silent'
                : 'Playing · sound on'
              : 'Battle of New York · Muted'}
          </div>
        </div>

        <div className="h-[2px] w-full bg-white/10">
          <div
            ref={barRef}
            className="h-full w-full origin-left bg-(--gamma)"
            style={{ transform: 'scaleX(0)', boxShadow: '0 0 12px rgba(163,255,60,0.65)' }}
          />
        </div>
      </div>
    </div>
  );
}
