'use client';

import { profile, socials } from '@/lib/data';
import ContactForm from './ContactForm';
import { DoodleRow } from './Doodles';
import FitText from './FitText';
import { wordmark } from './data';

/**
 * The closing panel, pinned to the bottom of the viewport for the whole page
 * and uncovered as the dark content slides up off it — the mirror of the hero,
 * which is pinned to the top and covered on the way in.
 *
 * It is held to one viewport (`h-svh`) because a sticky-bottom element taller
 * than the screen would push its own top off the top edge, permanently hiding
 * the marquee and the heading.
 */
export default function Contact() {
  return (
    <section
      id="v2-contact"
      className="sticky bottom-0 z-0 flex h-svh flex-col justify-between overflow-hidden bg-(--v2-accent) text-black"
    >
      {/* Two identical halves so the -50% loop is seamless. The clip sits on
          an inner box with no padding of its own, so the strip runs out at the
          gutter rather than under it. */}
      <div className="v2-container mt-8 md:mt-12">
        <div className="overflow-hidden">
          <div className="v2-drift flex w-max gap-10 md:gap-14" aria-hidden="true">
            <div className="flex gap-10 md:gap-14">
              <DoodleRow />
            </div>
            <div className="flex gap-10 md:gap-14">
              <DoodleRow />
            </div>
          </div>
        </div>
      </div>

      <div className="v2-container grid gap-10 md:grid-cols-[1.35fr_1fr]">
        <div>
          <h2 className="v2-display text-[clamp(2.2rem,6.4vw,5.5rem)]">
            Let&rsquo;s work
            <br />
            together.
          </h2>

          <div className="mt-6 flex flex-col gap-1 md:mt-8">
            <a href={`mailto:${profile.email}`} className="v2-underline w-fit text-sm md:text-base">
              {profile.email}
            </a>
            <a
              href={`tel:${profile.phoneHref}`}
              className="v2-underline w-fit text-sm md:text-base"
            >
              {profile.phone}
            </a>
          </div>

          <div className="mt-5 flex gap-6">
            {socials
              .filter((s) => s.href.startsWith('http'))
              .map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="v2-label v2-underline text-black/70 hover:text-black"
                >
                  {s.label}
                </a>
              ))}
          </div>
        </div>

        <ContactForm />
      </div>

      {/* Closing lockup, cropped at the baseline the way the reference is. */}
      <div className="v2-container">
        <div className="-mb-[0.1em]">
          <FitText text={wordmark} maxVh={43} />
        </div>
      </div>
    </section>
  );
}
