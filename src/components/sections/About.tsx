"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { certifications, education, profile } from "@/lib/data";

const paragraph =
  "Hi, I'm Shojol Islam—a frontend developer at WebAppick and a first-year BBA student. I build modern web and mobile experiences with React, React Native, and TypeScript, backend by Node.js and MongoDB. What I'm good at is turning a design into a screen that feels right and doesn't break.";

export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.32"],
  });

  const words = paragraph.split(" ");

  return (
    <section id="about" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="container-x">
        <SectionHeading index="01" title="About" kicker={profile.location} />

        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          {/* scroll-lit paragraph */}
          <div ref={ref}>
            <p className="text-lg leading-[1.75] tracking-[-0.01em] sm:text-xl md:text-[1.4rem] md:leading-[1.7]">
              {words.map((word, i) => (
                <Word
                  key={i}
                  progress={scrollYProgress}
                  range={[i / words.length, (i + 1.6) / words.length]}
                >
                  {word}
                </Word>
              ))}
            </p>

            <Reveal delay={0.1}>
              <div className="mt-10 flex flex-wrap gap-3">
                {[
                  { k: "Based in", v: "Dhaka, BD" },
                  { k: "Web", v: "React · Next.js" },
                  { k: "Mobile", v: "React Native · Expo" },
                  { k: "Behind it", v: "Node · Express · MongoDB" },
                ].map((item) => (
                  <div
                    key={item.k}
                    className="rounded-xl border border-line bg-surface/50 px-4 py-3 backdrop-blur-sm"
                  >
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                      {item.k}
                    </div>
                    <div className="mt-1 text-sm text-ink">{item.v}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* education + certifications */}
          <div className="space-y-10">
            <Reveal direction="left">
              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">
                  Education
                </h3>
                <div className="mt-5 space-y-5">
                  {education.map((e) => (
                    <div
                      key={e.title}
                      className="border-l border-line-strong pl-4"
                    >
                      <div className="text-[15px] font-medium text-ink">
                        {e.title}
                      </div>
                      <div className="mt-1 text-[13px] text-ink-dim">
                        {e.org}
                      </div>
                      <div className="mt-1 font-mono text-[11px] text-ink-faint">
                        {e.period}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal direction="left" delay={0.08}>
              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">
                  Certifications
                </h3>
                <div className="mt-5 space-y-4">
                  {certifications.map((c) => (
                    <div key={c.title} className="group flex items-start gap-3">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 border border-accent/60 transition-colors duration-300 group-hover:bg-accent" />
                      <div>
                        <div className="text-[14px] text-ink">{c.title}</div>
                        <div className="text-[12px] text-ink-faint">
                          {c.org}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <span className="relative mr-[0.28em] inline-block">
      <motion.span style={{ opacity }}>{children}</motion.span>
    </span>
  );
}
