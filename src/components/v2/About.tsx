'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import Reveal from './Reveal';
import SwapButton from './SwapButton';
import { certifications, education, experience, profile } from '@/lib/data';
import SectionRail from './SectionRail';
import SlantEdge from './SlantEdge';
import WordFade from './WordFade';
import { bio, keywords, statement } from './data';

/**
 * Heading across the top, then a 2×2 of panels: portrait and short
 * description above, education and experience below. Sharp corners and
 * hairline rules rather than rounded cards, to stay in the same register as
 * the work cards and the section rails.
 */
export default function About({ year }: { year: number }) {
  return (
    <section id="v2-about" className="relative z-10 bg-(--v2-paper)">
      <SlantEdge />
      <div className="v2-container relative z-10 pt-16 pb-28 md:pt-24 md:pb-40">
        <SectionRail index="01" label="About Me" year={year} />

        {/* Indented opening line, as in the reference — the paragraph starts
            mid-measure and runs to the right edge. */}
        <Reveal
          y={24}
          offset={80}
          className="mt-14 indent-[12%] text-[clamp(1.6rem,4.3vw,3.6rem)] leading-[1.06] font-normal tracking-[-0.024em] text-white md:mt-20"
        >
          <p>
            {statement}
            <span className="align-super text-[0.45em] text-(--v2-accent)">&reg;</span>
          </p>
        </Reveal>

        <div className="mt-16 grid gap-4 md:mt-24 md:grid-cols-2 md:gap-6">
          {/* The portrait fills its panel, so it carries no padding of its own. */}
          <Reveal
            y={24}
            offset={80}
            className="relative min-h-80 overflow-hidden border border-white/10 bg-white/5 md:min-h-105"
          >
            <Image
              src="/v2/portrait.png"
              alt={`${profile.name}, ${profile.role}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </Reveal>

          <Panel label="Career Snapshot" delay={0.08}>
            <WordFade text={bio} className="text-base leading-relaxed text-white" />

            <p className="v2-label mt-8 text-white/40">(Keywords)</p>
            <ul className="mt-3 grid grid-cols-2 gap-x-8 gap-y-2">
              {keywords.map((k) => (
                <li key={k} className="border-b border-white/10 pb-2 text-sm text-white/75">
                  {k}
                </li>
              ))}
            </ul>

            <SwapButton
              href={profile.resumeUrl}
              external
              className="mt-8"
              lead={
                <span className="block h-1.5 w-1.5 rounded-full bg-(--v2-accent) transition-colors duration-300 group-hover:bg-black" />
              }
            >
              View Resume
            </SwapButton>
          </Panel>

          <Panel label="Education" delay={0.08}>
            {education.map((e) => (
              <div key={e.title}>
                <p className="text-lg text-white">{e.title}</p>
                <p className="mt-1 text-sm text-white/55">{e.org}</p>
                <p className="v2-label mt-2 text-(--v2-accent)">{e.period}</p>
              </div>
            ))}

            <p className="v2-label mt-8 text-white/40">(Certifications)</p>
            <ul className="mt-3 flex flex-col gap-2">
              {certifications.map((c) => (
                <li
                  key={c.title}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-white/10 pb-2"
                >
                  <span className="text-sm text-white/85">{c.title}</span>
                  <span className="v2-label text-white/40">{c.org}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel label="Experience" delay={0.16}>
            {experience.map((job) => (
              <div key={job.company}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <p className="text-lg text-white">{job.company}</p>
                  <p className="v2-label text-(--v2-accent)">{job.period}</p>
                </div>
                <p className="mt-1 text-sm text-white/55">
                  {job.role} &middot; {job.location}
                </p>

                <ul className="mt-5 flex flex-col gap-2">
                  {job.points.map((point) => (
                    <li key={point} className="flex gap-3 text-sm leading-relaxed text-white/75">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-px w-3 shrink-0 bg-(--v2-accent)"
                      />
                      {point}
                    </li>
                  ))}
                </ul>

                <ul className="mt-6 flex flex-wrap gap-2">
                  {job.stack.map((tech) => (
                    <li
                      key={tech}
                      className="v2-label border border-(--v2-accent)/30 bg-(--v2-accent)/12 px-3 py-1.5 text-(--v2-accent)/90"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </section>
  );
}

/** One bordered cell of the 2×2, with its own corner label. */
function Panel({ label, delay, children }: { label: string; delay: number; children: ReactNode }) {
  return (
    <Reveal y={24} offset={80} delay={delay} className="border border-white/10">
      <div className="flex h-full flex-col p-6 md:p-8">
        <p className="v2-label mb-6 text-white/35">({label})</p>
        {children}
      </div>
    </Reveal>
  );
}
