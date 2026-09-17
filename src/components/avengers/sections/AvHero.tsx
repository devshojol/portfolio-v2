'use client';

import { useRef } from 'react';
import { gsap, useGSAP, SplitText } from '../gsap';
import { profile, stats } from '@/lib/data';

/**
 * Opening section. `hero.mp4` runs underneath for its full length across this
 * wrapper's scroll distance, so the section is deliberately tall: the sticky
 * panel stays put while the footage advances.
 *
 * On arrival only the title and one line of copy are up. Everything else —
 * summary, stats, links — is revealed by scrolling, on the same scrub as the
 * video.
 */
export default function AvHero({ started }: { started: boolean }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || !started) return;

      const title = root.querySelector<HTMLElement>('[data-hero-title]');
      const split = title ? SplitText.create(title, { type: 'words,chars', mask: 'words' }) : null;

      /* Entrance — plays once, right after the loading screen shatters. */
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      intro
        .from('[data-hero-kicker]', { opacity: 0, x: -24, duration: 0.6 })
        .from('[data-hero-rule]', { scaleX: 0, duration: 0.7 }, '<')
        .from(
          split ? split.chars : [],
          { yPercent: 120, opacity: 0, duration: 1, stagger: 0.028 },
          '-=0.35'
        )
        .from('[data-hero-lede]', { opacity: 0, y: 26, duration: 0.8 }, '-=0.6');

      /* Scroll — the rest of the dossier arrives, then the panel clears out
         before the clip cuts to the battle. */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      /* The block below the title is laid out from the start but invisible, so
         at rest the panel is pushed down by half its height — that keeps the
         title optically centred instead of jammed under the HUD, and it rides
         back up as the rest of the dossier arrives. */
      const more = root.querySelector<HTMLElement>('[data-hero-more]');
      /* Stamped now rather than when the scrub arrives: a staggered tween
         leaves its later targets untouched until their turn comes. */
      const moreItems = more ? Array.from(more.children) : [];
      gsap.set(moreItems, { opacity: 0, y: 42 });

      tl.fromTo(
        '[data-hero-panel]',
        { y: () => (more?.offsetHeight ?? 0) / 2 },
        { y: 0, duration: 0.4, ease: 'none' },
        0
      )
        /* `fromTo`, because a plain `to` would record its start value while the
           intro above still had the hint at zero and then animate nowhere. */
        .fromTo('[data-hero-hint]', { opacity: 1, y: 0 }, { opacity: 0, y: -10, duration: 0.08 }, 0)
        .to('[data-hero-lede-wrap]', { y: -26, scale: 0.95, duration: 0.4 }, 0)
        .fromTo(
          moreItems,
          { opacity: 0, y: 42 },
          { opacity: 1, y: 0, duration: 0.3, stagger: 0.06, ease: 'power3.out' },
          0.06
        )
        .to({}, { duration: 0.28 })
        /* Clears the frame right at the end of the sticky stretch, just as the
           clip cuts over to the battle. */
        .to('[data-hero-panel]', { opacity: 0, y: -70, filter: 'blur(8px)', duration: 0.18 }, 0.82);

      return () => {
        intro.kill();
        split?.revert();
      };
    },
    { scope: ref, dependencies: [started] }
  );

  return (
    <section id="assemble" ref={ref} className="relative h-[320vh]">
      <div className="sticky top-0 flex h-svh items-center overflow-hidden pt-20 pb-14 sm:pt-24 sm:pb-16">
        <div data-hero-panel className="container-x w-full">
          <div className="max-w-3xl" data-hero-lede-wrap>
            <div data-hero-kicker className="av-label flex items-center gap-3">
              <span className="av-blip block h-1.5 w-1.5 rotate-45 bg-(--gamma)" />
              File 00 — Assemble
            </div>

            <div
              data-hero-rule
              className="mt-4 h-px w-28 origin-left bg-linear-to-r from-(--gamma) to-transparent"
            />

            <h1
              data-hero-title
              className="av-title av-glow mt-5 text-[clamp(2.5rem,11vw,8.5rem)] text-(--paper) sm:mt-6"
            >
              Shojol Islam
            </h1>

            <p
              data-hero-lede
              className="av-mono mt-6 max-w-xl text-[13px] leading-relaxed tracking-[0.16em] text-(--paper-dim) uppercase sm:text-[14px]"
            >
              {profile.role} · {profile.location}
              <span className="mt-2 block text-(--gamma-soft)">{profile.tagline}</span>
            </p>
          </div>

          {/* revealed on scroll */}
          <div data-hero-more className="mt-6 max-w-3xl space-y-5 sm:mt-8 sm:space-y-6">
            <p className="hidden max-w-xl text-[15px] leading-relaxed text-(--paper)/85 sm:block sm:text-base">
              {profile.summary}
            </p>

            <div className="grid max-w-xl grid-cols-2 gap-px bg-(--gamma)/15 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="bg-[#04070a]/70 px-4 py-3.5 backdrop-blur-[2px]">
                  <div className="av-mono text-2xl font-semibold text-(--gamma)">
                    {s.value}
                    {s.suffix}
                  </div>
                  <div className="av-mono mt-1 text-[9px] leading-tight tracking-[0.2em] text-(--paper-dim) uppercase">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#comms"
                className="av-mono border border-(--gamma)/70 bg-(--gamma)/12 px-5 py-2.5 text-[11px] tracking-[0.24em] text-(--gamma-soft) uppercase transition-all duration-300 hover:bg-(--gamma) hover:text-[#04070a]"
              >
                Open comms
              </a>
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="av-mono border border-white/20 px-5 py-2.5 text-[11px] tracking-[0.24em] text-(--paper) uppercase transition-all duration-300 hover:border-(--gamma)/60 hover:text-(--gamma-soft)"
              >
                Résumé
              </a>
              <span className="av-mono flex items-center gap-2 text-[10px] tracking-[0.2em] text-(--paper-dim) uppercase">
                <span className="av-blip block h-1.5 w-1.5 rounded-full bg-(--gamma)" />
                {profile.availability}
              </span>
            </div>
          </div>
        </div>

        <div
          data-hero-hint
          className="av-mono absolute bottom-12 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.32em] text-(--paper-dim) uppercase"
        >
          Scroll to advance the footage — or press play for the cut with sound
        </div>
      </div>
    </section>
  );
}
