"use client";

import { motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { skillGroups } from "@/lib/data";

export default function Skills() {
  return (
    <section id="skills" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="container-x">
        <SectionHeading
          index="04"
          title="Skills & tools"
          kicker="What I actually reach for, most days."
        />

        <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line/70 sm:grid-cols-2">
          {skillGroups.map((group, gi) => (
            <Reveal key={group.title} delay={gi * 0.06} className="bg-night">
              <div className="group relative h-full overflow-hidden p-7 transition-colors duration-500 hover:bg-surface/40 sm:p-9">
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[11px] text-accent">0{gi + 1}</span>
                  <h3 className="text-lg font-medium tracking-tight text-ink">{group.title}</h3>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {group.items.map((item, i) => (
                    <motion.span
                      key={item}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.45, delay: i * 0.035, ease: [0.16, 1, 0.3, 1] }}
                      whileHover={{ y: -2 }}
                      className="cursor-default rounded-lg border border-line bg-surface/60 px-3 py-1.5 text-[13px] text-ink-dim transition-colors duration-300 hover:border-accent/45 hover:text-accent-soft"
                    >
                      {item}
                    </motion.span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
