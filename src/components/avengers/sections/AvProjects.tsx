'use client';

import { useRef, useState } from 'react';
import SectionShell from '../SectionShell';
import { gsap, useGSAP } from '../gsap';
import { projects } from '@/lib/data';

/**
 * Both deployments share one sticky frame: the first card holds the screen for
 * the first half of the section's scroll, then hands over to the second.
 */
function Deck() {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useGSAP(
    () => {
      const section = document.getElementById('deployments');
      if (!section) return;

      gsap.set('[data-card="0"]', { opacity: 0, y: 46 });
      gsap.set('[data-card="1"]', { opacity: 0, y: 62, filter: 'blur(6px)' });

      /* Card one arrives on the same approach as the section heading — the
         trigger element is passed directly because `useGSAP` would scope a
         selector string to this component, which sits inside that section. */
      gsap.fromTo(
        '[data-card="0"]',
        { opacity: 0, y: 46 },
        {
          opacity: 1,
          y: 0,
          ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 60%', end: 'top top', scrub: 0.6 },
        }
      );

      /* The handover happens halfway through the stretch where the panel is
         parked, so each card gets a screenful of scroll to itself. */
      const swap = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          onUpdate: (self) => setIndex(self.progress < 0.5 ? 0 : 1),
        },
      });

      swap
        .to('[data-card="0"]', { opacity: 0, y: -54, filter: 'blur(6px)', duration: 0.12 }, 0.4)
        .fromTo(
          '[data-card="1"]',
          { opacity: 0, y: 62, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.14, ease: 'power3.out' },
          0.5
        )
        .set({}, {}, 1);
    },
    { scope: ref }
  );

  return (
    <div ref={ref}>
      <div className="av-deck grid">
        {projects.map((p, i) => (
          <article
            key={p.id}
            data-card={i}
            style={{ gridArea: '1 / 1' }}
            className={i === index ? '' : 'pointer-events-none'}
          >
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="av-mono text-[11px] tracking-[0.24em] text-[var(--gamma)]">
                  0{i + 1}
                </span>
                <span className="h-px w-10 bg-[var(--gamma)]/40" />
                <span className="av-mono text-[11px] tracking-[0.2em] text-[var(--paper-dim)]">
                  {p.year} · Shipped
                </span>
              </div>

              <h3 className="av-title mt-4 text-[clamp(1.9rem,5vw,3.2rem)] text-[var(--paper)]">
                {p.name}
              </h3>
              <p className="av-mono mt-2 text-[11px] tracking-[0.2em] text-[var(--gamma-soft)] uppercase">
                {p.subtitle}
              </p>

              <p className="mt-5 max-w-xl text-[14.5px] leading-relaxed text-[var(--paper)]/85">
                {p.blurb}
              </p>

              <ul className="mt-5 space-y-2">
                {p.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-3 text-[13.5px] text-[var(--paper-dim)]"
                  >
                    <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rotate-45 bg-[var(--gamma)]/80" />
                    {h}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap gap-2">
                {p.stack.map((t) => (
                  <span key={t} className="av-chip">
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {p.links.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="av-mono group inline-flex items-center gap-2 border border-[var(--gamma)]/40 px-4 py-2 text-[11px] tracking-[0.2em] text-[var(--paper)] uppercase transition-all duration-300 hover:border-[var(--gamma)] hover:bg-[var(--gamma)]/12 hover:text-[var(--gamma-soft)]"
                  >
                    {l.label}
                    <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                      ↗
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* deck position */}
      <div className="av-deck-progress mt-8 flex items-center gap-4">
        <span className="av-mono text-[10px] tracking-[0.24em] text-[var(--paper-dim)]">
          0{index + 1} / 0{projects.length}
        </span>
        <span className="relative h-px max-w-40 flex-1 bg-white/15">
          <span
            className="absolute inset-y-0 left-0 bg-[var(--gamma)] transition-[width] duration-500"
            style={{ width: `${((index + 1) / projects.length) * 100}%` }}
          />
        </span>
        <a
          href="https://github.com/devshojol"
          target="_blank"
          rel="noreferrer"
          className="av-mono text-[10px] tracking-[0.2em] text-[var(--paper-dim)] uppercase transition-colors hover:text-[var(--gamma)]"
        >
          More on GitHub ↗
        </a>
      </div>
    </div>
  );
}

export default function AvProjects() {
  return (
    <SectionShell
      id="deployments"
      file="03"
      label="Deployments"
      title="Two apps, live"
      kicker="Both out on the Play Store and the App Store."
      height="h-[300vh]"
    >
      <Deck />
    </SectionShell>
  );
}
