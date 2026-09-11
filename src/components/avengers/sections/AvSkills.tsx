'use client';

import SectionShell from '../SectionShell';
import { marqueeWords, skillGroups } from '@/lib/data';

export default function AvSkills() {
  return (
    <SectionShell
      id="arsenal"
      file="04"
      label="Arsenal"
      title="What I reach for"
      kicker="The tools that actually get used, most days."
      height="h-[200vh]"
    >
      <div data-av-stagger className="grid gap-px bg-[var(--gamma)]/12 sm:grid-cols-2">
        {skillGroups.map((group, i) => (
          <div
            key={group.title}
            className="av-bracket relative bg-[#04070a]/72 p-5 backdrop-blur-[3px] transition-colors duration-500 hover:bg-[#0a1206]/80 sm:p-6"
          >
            <div className="flex items-baseline gap-3">
              <span className="av-mono text-[10px] tracking-[0.24em] text-[var(--gamma)]">
                0{i + 1}
              </span>
              <h3 className="av-mono text-[12px] tracking-[0.22em] text-[var(--paper)] uppercase">
                {group.title}
              </h3>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[12px] text-[var(--paper)]/80 transition-colors duration-300 hover:border-[var(--gamma)]/50 hover:text-[var(--gamma-soft)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ticker — same word list as the home page marquee */}
      <div data-av-up className="mask-fade-x mt-7 hidden overflow-hidden sm:block">
        <div className="animate-marquee flex w-max gap-8">
          {[...marqueeWords, ...marqueeWords].map((word, i) => (
            <span
              key={`${word}-${i}`}
              className="av-mono text-[11px] tracking-[0.28em] whitespace-nowrap text-[var(--paper-dim)]/70 uppercase"
            >
              {word}
              <span className="ml-8 text-[var(--gamma)]/60">/</span>
            </span>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
