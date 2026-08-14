"use client";

import Reveal from "./Reveal";

export default function SectionHeading({
  index,
  title,
  kicker,
}: {
  index: string;
  title: string;
  kicker?: string;
}) {
  return (
    <div className="mb-12 md:mb-16">
      <Reveal>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs tracking-[0.28em] text-accent">{index}</span>
          <span className="h-px flex-1 max-w-24 bg-gradient-to-r from-accent/70 to-transparent" />
        </div>
      </Reveal>

      <Reveal delay={0.06}>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl md:text-[2.75rem]">
          {title}
        </h2>
      </Reveal>

      {kicker ? (
        <Reveal delay={0.12}>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-dim">{kicker}</p>
        </Reveal>
      ) : null}
    </div>
  );
}
