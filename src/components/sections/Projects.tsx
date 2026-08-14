"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import TiltCard from "@/components/ui/TiltCard";
import PhoneMock from "@/components/ui/PhoneMock";
import { projects } from "@/lib/data";

export default function Projects() {
  return (
    <section id="projects" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_45%_at_85%_10%,#12294822,transparent_70%)]" />
      <div className="container-x">
        <SectionHeading
          index="03"
          title="Projects"
          kicker="Two apps I helped build. Both are out there now."
        />

        <div className="space-y-8">
          {projects.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.06}>
              <TiltCard intensity={4} glow={p.accent} className="rounded-2xl">
                <article className="relative overflow-hidden rounded-2xl border border-line bg-linear-to-b from-surface/70 to-night/60 p-6 backdrop-blur-sm transition-colors duration-500 hover:border-line-strong sm:p-9">
                  {/* corner accent */}
                  <div
                    className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full opacity-25 blur-3xl"
                    style={{ background: p.accent }}
                  />

                  <div className="relative grid items-center gap-10 md:grid-cols-[1fr_auto] md:gap-14">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className="font-mono text-[11px] uppercase tracking-[0.2em]"
                          style={{ color: p.accent }}
                        >
                          0{i + 1}
                        </span>
                        <span className="h-px w-8 bg-line-strong" />
                        <span className="font-mono text-[11px] text-ink-faint">{p.year}</span>
                      </div>

                      <h3 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                        {p.name}
                      </h3>
                      <p className="mt-1.5 text-[15px] text-ink-dim">{p.subtitle}</p>

                      <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-dim">
                        {p.blurb}
                      </p>

                      <ul className="mt-6 space-y-2.5">
                        {p.highlights.map((h) => (
                          <li key={h} className="flex items-start gap-2.5 text-[14px] text-ink-dim">
                            <svg
                              className="mt-1.25 shrink-0"
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke={p.accent}
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {h}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-7 flex flex-wrap gap-2">
                        {p.stack.map((t) => (
                          <span
                            key={t}
                            className="rounded-md border border-line bg-void/50 px-2.5 py-1 font-mono text-[11px] text-ink-dim"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="mt-7 flex flex-wrap gap-3">
                        {p.links.map((l) => (
                          <a
                            key={l.label}
                            href={l.href}
                            target="_blank"
                            rel="noreferrer"
                            className="group inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-[13px] font-medium text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/60 hover:text-accent-soft"
                          >
                            {l.label}
                            <svg
                              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden
                            >
                              <path d="M7 17 17 7" />
                              <path d="M7 7h10v10" />
                            </svg>
                          </a>
                        ))}
                      </div>
                    </div>

                    <PhoneMock variant={p.id as "gonit" | "chintu"} />
                  </div>
                </article>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <a
            href="https://github.com/devshojol"
            target="_blank"
            rel="noreferrer"
            className="group mt-8 flex items-center justify-between rounded-2xl border border-dashed border-line-strong px-6 py-7 transition-colors duration-400 hover:border-accent/50 sm:px-9"
          >
            <div>
              <div className="text-lg font-medium text-ink">More on GitHub</div>
              <div className="mt-1 text-[13px] text-ink-dim">
                Side projects, half-finished ideas, and things I broke while learning.
              </div>
            </div>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line-strong text-ink-dim transition-all duration-300 group-hover:border-accent/60 group-hover:text-accent">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M7 17 17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
