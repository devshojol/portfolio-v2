'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { profile } from '@/lib/data';
import HeroDim from './HeroDim';
import { MOODS, MoodFigure } from './Doodles';
import FitText from './FitText';
import { navLinks, wordmark, wordmarkLines } from './data';
import { onJump } from './jump';

/**
 * Full-bleed accent panel, pinned so the black sections scroll up over it.
 * Clicking anywhere swaps the figure — the "mood" the caption promises.
 */
export default function Hero() {
  const [mood, setMood] = useState(0);
  const shift = () => setMood((m) => (m + 1) % MOODS.length);

  return (
    <section
      id="v2-home"
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
        <p className="text-black/45">Mood isn&rsquo;t fixed</p>
        <p className="font-semibold text-black">click anywhere to shift it.</p>
      </div>

      <div>
        <div className="v2-container relative">
          {/* Sits over the wordmark's baseline, as in the reference. Anchored
              to the gutter, not the window, so it lines up with the nav above. */}
          <div className="pointer-events-none absolute right-5 bottom-[2.5rem] z-10 w-[24vw] max-w-[270px] min-w-[110px] md:right-10 md:bottom-[3rem]">
            <AnimatePresence mode="wait">
              <motion.div
                key={mood}
                initial={{ opacity: 0, y: 18, rotate: -4 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: -14, rotate: 4 }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              >
                <MoodFigure index={mood} className="h-auto w-full" />
              </motion.div>
            </AnimatePresence>
          </div>

          <h1>
            {/* Only one of these is ever displayed, so screen readers still
                see the name once. */}
            <span className="block md:hidden">
              {/* <FitText text={['SH', 'OJOL']} maxVh={46} /> */}
              <FitText text={wordmarkLines} maxVh={46} />
            </span>
            <span className="hidden md:block">
              <FitText text={wordmark} />
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
