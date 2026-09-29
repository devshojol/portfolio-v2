'use client';

import { useEffect, useRef, useState } from 'react';
import { profile } from '@/lib/data';
import HeroDim from './HeroDim';
import { HERO_MOODS, HeroMood } from './HeroMood';
import FitText from './FitText';
import { navLinks, wordmark, wordmarkLines } from './data';
import { onJump } from './jump';
import './hero-moods.css';

/**
 * Full-bleed accent panel, pinned so the black sections scroll up over it.
 * Clicking anywhere swaps the figure — the "mood" the caption promises.
 */
export default function Hero() {
  const [mood, setMood] = useState(0);
  const [visible, setVisible] = useState(true);
  const hero = useRef<HTMLElement>(null);
  const shift = () => setMood((m) => (m + 1) % HERO_MOODS.length);

  useEffect(() => {
    const el = hero.current;
    if (!el) return;
    // Sticky elements remain intersecting while covered. Use the scroll position
    // as well to stop the loops once the following section covers the hero.
    const update = () => setVisible(!document.hidden && window.scrollY < el.offsetHeight);
    update();
    window.addEventListener('scroll', update, { passive: true });
    document.addEventListener('visibilitychange', update);
    return () => {
      window.removeEventListener('scroll', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  const figure = <HeroMood mood={mood} playing={visible} />;

  return (
    <section
      id="v2-home"
      ref={hero}
      data-moods-visible={visible}
      onClick={shift}
      className="sticky top-0 flex h-screen w-full flex-col justify-between overflow-hidden bg-(--v2-accent) text-black select-none"
    >
      {/* Darkens everything in the hero, nav included, as the panel covers it. */}
      <HeroDim />

      {/* Nav rides inside the hero: the black panel slides over it rather
          than the nav floating above the whole page. */}
      <header
        onClick={(e) => e.stopPropagation()}
        className="v2-container flex justify-between pt-6 md:items-center md:pt-8"
      >
        <a href="#v2-home" onClick={onJump('#v2-home')} className="v2-display text-xl md:text-2xl">
          {wordmark}
        </a>
        <nav className="flex flex-col items-end gap-1.5 md:flex-row md:items-center md:gap-12">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={onJump(l.href)}
              {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="v2-label v2-underline text-[0.6rem] tracking-[0.08em] text-black/90 hover:text-black md:text-[0.6875rem] md:tracking-[0.14em]"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </header>

      <div className="v2-container text-sm">
        <p className="text-black/65">Mood isn&rsquo;t fixed</p>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            shift();
          }}
          className="mood-trigger block py-1 text-left font-semibold text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
          aria-label={`Current mood: ${HERO_MOODS[mood]}. Change to ${HERO_MOODS[(mood + 1) % HERO_MOODS.length]}`}
        >
          click anywhere to shift it.
        </button>
        <p
          className="mt-3 font-mono text-[10px] tracking-[0.12em] text-black/65 uppercase"
          aria-live="polite"
          aria-atomic="true"
        >
          {String(mood + 1).padStart(2, '0')} / 04 &nbsp; {HERO_MOODS[mood]}
        </p>
      </div>

      <div>
        <div className="v2-container relative">
          <h1 aria-label={wordmark}>
            {/* Only one of these is ever displayed, so screen readers still
                see the name once. */}
            <span className="block md:hidden">
              <FitText text={wordmarkLines} maxVh={46} endAdornment={figure} />
            </span>
            <span className="hidden md:block">
              <FitText text={wordmark} endAdornment={figure} />
            </span>
          </h1>
        </div>

        <div className="v2-container flex items-end justify-between pb-6 md:pb-8">
          <p className="v2-label text-black">{profile.location}</p>
          <p className="v2-label hidden text-black/45 md:block">{profile.role}</p>
        </div>
      </div>
    </section>
  );
}
