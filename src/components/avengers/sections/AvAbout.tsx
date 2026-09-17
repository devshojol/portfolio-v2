'use client';

import SectionShell from '../SectionShell';
import { certifications, education, profile } from '@/lib/data';

const facts = [
  { k: 'Based in', v: 'Dhaka, BD' },
  { k: 'Web', v: 'React · Next.js' },
  { k: 'Mobile', v: 'React Native · Expo' },
  { k: 'Behind it', v: 'Node · Express · MongoDB' },
];

export default function AvAbout() {
  return (
    <SectionShell
      id="operative"
      file="01"
      label="Operative"
      title="Who's on the ground"
      kicker={`${profile.location} · ${profile.availability}`}
      height="h-[190vh]"
    >
      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
        <div>
          <p
            data-av-up
            className="max-w-xl text-[15px] leading-[1.7] text-(--paper)/90 sm:text-[17px] sm:leading-[1.75]"
          >
            {profile.summary}
          </p>
          <p
            data-av-up
            className="mt-4 hidden max-w-xl text-[15px] leading-[1.75] text-(--paper-dim) sm:block"
          >
            Day job is WebAppick — React on the web, React Native and Expo on mobile, and the
            Express/MongoDB bits when a screen needs an API behind it. Studying for a BBA on the
            side.
          </p>

          <div
            data-av-stagger
            /* Hidden on phones: the location already reads in the kicker and
               the stack has a file of its own two sections down. */
            className="mt-6 hidden grid-cols-2 gap-px bg-(--gamma)/12 sm:mt-7 sm:grid sm:grid-cols-4"
          >
            {facts.map((f) => (
              <div key={f.k} className="bg-[#04070a]/70 px-3.5 py-3 backdrop-blur-[2px]">
                <div className="av-mono text-[9px] tracking-[0.2em] text-(--gamma) uppercase">
                  {f.k}
                </div>
                <div className="mt-1.5 text-[13px] leading-snug text-(--paper)">{f.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div data-av-up className="av-panel av-bracket p-5 sm:p-6">
          <div className="av-label">Education</div>
          {education.map((e) => (
            <div key={e.title} className="mt-4 border-l border-(--gamma)/30 pl-4">
              <div className="text-[14px] font-medium text-(--paper)">{e.title}</div>
              <div className="mt-1 text-[13px] text-(--paper-dim)">{e.org}</div>
              <div className="av-mono mt-1 text-[10px] tracking-[0.14em] text-(--paper-dim)/70">
                {e.period}
              </div>
            </div>
          ))}

          <div className="av-label mt-7">Certifications</div>
          <ul data-av-stagger className="mt-4 space-y-3">
            {certifications.map((c) => (
              <li key={c.title} className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rotate-45 border border-(--gamma)" />
                <span>
                  <span className="block text-[13.5px] leading-snug text-(--paper)">
                    {c.title}
                  </span>
                  <span className="av-mono text-[10px] tracking-[0.16em] text-(--paper-dim) uppercase">
                    {c.org}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionShell>
  );
}
