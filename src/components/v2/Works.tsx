'use client';

import Image from 'next/image';
import Link from 'next/link';
import Reveal from './Reveal';
import SwapButton from './SwapButton';
import { onJump } from './jump';
import SectionRail from './SectionRail';
import { works, type Work } from './data';

/**
 * Sticky card stack: every card pins a little lower than the one before, so
 * scrolling deals them onto each other and leaves the edges visible.
 */
export default function Works({ year }: { year: number }) {
  return (
    <section id="v2-works" className="relative z-10 bg-(--v2-paper) pb-32 md:pb-48">
      <div className="v2-container">
        <SectionRail index="02" label="Works" year={year} />

        <div className="mt-8 grid gap-10 pt-8 md:mt-0 md:grid-cols-[1fr_minmax(0,440px)_1fr] md:gap-8">
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

          <div className="mx-auto flex w-full max-w-110 flex-col">
            {works.map((work, i) => (
              <WorkCard key={work.id} work={work} index={i} />
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

function WorkCard({ work, index }: { work: Work; index: number }) {
  const external = work.href.startsWith('http');

  return (
    <Reveal
      y={40}
      // Fixed offsets rather than viewport units, matching the reference: each
      // card pins 40px below the one before so the stack fans out by its edges.
      // Same on phones, where the card is sized to leave room for the fan.
      style={{ top: `${50 + index * 40}px` }}
      className="sticky"
    >
      <Link
        href={work.href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="group block bg-(--v2-paper) pb-6"
      >
        <div className="relative h-85 w-full overflow-hidden border border-white/10 sm:h-100 md:h-110">
          <Image
            src={work.image}
            alt={`${work.name} — ${work.category}`}
            fill
            sizes="(max-width: 768px) 100vw, 440px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
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
    </Reveal>
  );
}
