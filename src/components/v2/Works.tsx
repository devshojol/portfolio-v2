'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import Reveal from './Reveal';
import SwapButton from './SwapButton';
import { onJump } from './jump';
import SectionRail from './SectionRail';
import { onFrame } from './scrollDriver';
import { works, type Work } from './data';

/* ── Deck geometry ─────────────────────────────────────── */

/** Where the front card pins, as a share of viewport height. */
const PIN = 0.2;
/** Each card behind the front shrinks by this much… */
const SHRINK = 0.06;
/** …and rises by this much, so its top edge peeks above the one in front. */
const LIFT = 28;
/** Cards further back than this stop receding, or they'd vanish. */
const MAX_DEPTH = 3;

/**
 * Works as a deck.
 *
 * Every card pins at the same height and the next one lands squarely on top;
 * what makes the stack readable is that a covered card *recedes* — it scales
 * down about its top edge and lifts, so its head shows above the card in
 * front. Flat sticky offsets (what this was) leave four identical slivers
 * instead of a deck with depth.
 */
export default function Works({ year }: { year: number }) {
  const column = useRef<HTMLDivElement>(null);
  /** How many cards have been dealt, as a continuous value. */
  const dealt = useMotionValue(0);

  useEffect(() => {
    return onFrame(() => {
      const col = column.current;
      const first = col?.firstElementChild as HTMLElement | null;
      if (!col || !first) return;
      // Cards sit back-to-back, so one card's height is one step of the deck.
      const step = first.offsetHeight;
      if (!step) return;
      const pin = window.innerHeight * PIN;
      const progress = (pin - col.getBoundingClientRect().top) / step;
      // Capped at the last index: past the end of the column the count would
      // keep climbing and start receding the front card too, dragging the whole
      // deck up off its pin.
      dealt.set(Math.min(works.length - 1, Math.max(0, progress)));
    });
  }, [dealt]);

  return (
    <section id="v2-works" className="relative z-10 bg-(--v2-paper) pb-32 md:pb-48">
      <div className="v2-container">
        <SectionRail index="02" label="Works" year={year} />

        <div className="mt-8 grid gap-10 pt-8 md:mt-0 md:grid-cols-[1fr_minmax(0,720px)_1fr] md:gap-8">
          <div className="md:sticky md:top-0 md:flex md:h-screen md:flex-col md:justify-center">
            <h2 className="v2-display text-[clamp(2.2rem,3.6vw,3.2rem)] text-white">
              Selected
              <br />
              Works<span className="text-(--v2-accent)">.</span>
            </h2>
            <a
              href="#v2-contact"
              onClick={onJump('#v2-contact')}
              className="v2-label v2-underline mt-6 inline-flex w-fit items-center gap-2 text-white/70 hover:text-white"
            >
              <span className="text-(--v2-accent)">&rarr;</span> Contact Now
            </a>
          </div>

          <div ref={column} className="mx-auto flex w-full flex-col">
            {works.map((work, i) => (
              <WorkCard key={work.id} work={work} index={i} dealt={dealt} />
            ))}
          </div>

          <div className="md:sticky md:top-0 md:flex md:h-screen md:items-center md:justify-end">
            <SwapButton href="/#projects">View All</SwapButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkCard({
  work,
  index,
  dealt,
}: {
  work: Work;
  index: number;
  dealt: MotionValue<number>;
}) {
  const external = work.href.startsWith('http');

  // 0 while this card is the front one, then 1, 2, 3 as later cards land on it.
  const depth = useTransform(dealt, (d) => Math.min(MAX_DEPTH, Math.max(0, d - index)));
  const scale = useTransform(depth, (d) => 1 - d * SHRINK);
  const y = useTransform(depth, (d) => -d * LIFT);

  return (
    <Reveal y={40} style={{ top: `${PIN * 100}vh` }} className="sticky">
      <motion.div style={{ scale, y, transformOrigin: 'top center' }}>
        <Link
          href={work.href}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="group block bg-(--v2-paper) pb-6"
        >
          <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-white/10 sm:h-80 md:h-110">
            {/* Backdrop: the same shot, blurred, so the card fills its frame
                whatever the artwork's own aspect is. Overscaled because a blur
                samples past its edges and would otherwise leave a halo. */}
            <Image
              src={work.image}
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 768px) 100vw, 720px"
              className="scale-125 object-cover blur-2xl"
            />
            <span className="absolute inset-0 bg-black/25" />

            {/* The real image, sharp and inset — and the only layer that moves
                on hover. */}
            <div className="absolute inset-0 flex items-center justify-center p-[7%]">
              <div className="relative h-full w-full overflow-hidden rounded-xl">
                <Image
                  src={work.image}
                  alt={`${work.name} — ${work.category}`}
                  fill
                  sizes="(max-width: 768px) 86vw, 620px"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-start justify-between">
            <div>
              <p className="text-sm text-white">
                <span className="v2-label mr-2 text-white/35">
                  ({String(index + 1).padStart(2, '0')})
                </span>
                {work.name}
                <span className="align-super text-[0.6em] text-(--v2-accent)">&reg;</span>
              </p>
              <p className="mt-1 text-xs text-white/45">{work.category}</p>
            </div>
            <p className="v2-label text-white/45">&copy; {work.year}</p>
          </div>
        </Link>
      </motion.div>
    </Reveal>
  );
}
