"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { experience } from "@/lib/data";

export default function Experience() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.7", "end 0.6"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="work" className="relative scroll-mt-24 py-14 sm:py-20 md:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_15%_0%,#0e2a4422,transparent_70%)]" />
      <div className="container-x">
        <SectionHeading
          index="02"
          title="Experience"
          kicker="Where I've been shipping, and what I actually did there."
        />

        <div ref={ref} className="relative pl-8 sm:pl-12">
          {/* rail */}
          <div className="absolute left-0.75 top-2 h-full w-px bg-line" />
          <motion.div
            style={{ scaleY: lineScale }}
            className="absolute left-0.75 top-2 h-full w-px origin-top bg-linear-to-b from-accent via-sky to-transparent"
          />

          {experience.map((job, i) => (
            <Reveal
              key={job.company}
              delay={i * 0.08}
              className="relative pb-4"
            >
              <span className="absolute -left-8 top-2 sm:-left-12">
                <span className="relative flex h-2.25 w-2.25 -translate-x-0.5">
                  {job.current && (
                    <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-accent" />
                  )}
                  <span className="relative inline-flex h-2.25 w-2.25 rounded-full border border-accent bg-night" />
                </span>
              </span>

              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                  {job.role}{" "}
                  <span className="text-accent">· {job.company}</span>
                </h3>
                <span className="font-mono text-[12px] text-ink-faint">
                  {job.period}
                </span>
              </div>
              <div className="mt-1 text-[13px] text-ink-dim">
                {job.location}
              </div>

              <ul className="mt-6 max-w-3xl space-y-3.5">
                {job.points.map((p) => (
                  <li
                    key={p}
                    className="flex gap-3 text-[15px] leading-relaxed text-ink-dim"
                  >
                    <span className="mt-2.25 h-px w-4 shrink-0 bg-line-strong" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap gap-2">
                {job.stack.map((t) => (
                  <span
                    key={t}
                    className="rounded-md border border-line bg-surface/60 px-2.5 py-1 font-mono text-[11px] text-ink-dim"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
