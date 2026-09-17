'use client';

import SectionShell from '../SectionShell';
import { experience } from '@/lib/data';

export default function AvExperience() {
  const job = experience[0];

  return (
    <SectionShell
      id="field-record"
      file="02"
      label="Field record"
      title="Where the work happens"
      kicker={`${job.company} · ${job.period} · ${job.location}`}
      height="h-[200vh]"
    >
      <div className="relative pl-7 sm:pl-10">
        {/* rail */}
        <span className="absolute top-2 left-0 h-[calc(100%-0.5rem)] w-px bg-linear-to-b from-(--gamma) via-(--gamma)/30 to-transparent" />
        <span className="av-blip absolute top-1.5 -left-[3px] block h-[7px] w-[7px] rotate-45 bg-(--gamma)" />

        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h3
            data-av-up
            className="text-xl font-semibold tracking-tight text-(--paper) sm:text-2xl"
          >
            {job.role}
            <span className="text-(--gamma)"> · {job.company}</span>
          </h3>
          <span
            data-av-up
            className="av-mono text-[10px] tracking-[0.2em] text-(--paper-dim) uppercase"
          >
            {job.current ? 'Active duty' : 'Closed'} · {job.period}
          </span>
        </div>

        <ul data-av-stagger className="mt-7 max-w-2xl space-y-4">
          {job.points.map((p) => (
            <li key={p} className="flex gap-4">
              <span className="mt-2.5 h-px w-5 shrink-0 bg-(--gamma)/55" />
              <span className="text-[14.5px] leading-relaxed text-(--paper)/85">{p}</span>
            </li>
          ))}
        </ul>

        <div data-av-stagger className="mt-8 flex flex-wrap gap-2">
          {job.stack.map((t) => (
            <span key={t} className="av-chip">
              {t}
            </span>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
