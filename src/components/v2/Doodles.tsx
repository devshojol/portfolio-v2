/**
 * Hand-drawn-feeling line art, in the same register as the reference's
 * white-on-accent figures. Everything is stroked with the same weight and
 * round joins so the set reads as one hand.
 */

const S = {
  fill: '#ffffff',
  stroke: '#000000',
  strokeWidth: 5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

/** Shirt, shorts, legs and shoes — identical across every mood. */
const BODY = (
  <>
    <path d="M100 74c-19 0-28 11-28 26l-2 36c0 9 9 13 30 13s30-4 30-13l-2-36c0-15-9-26-28-26z" />
    <path d="M72 148l-2 30h21l9-20 9 20h21l-2-30z" />
    <path fill="none" d="M85 178v54M115 178v54" />
    <path d="M73 232h20v12H71zM107 232h20v12h-22z" />
  </>
);

const HEAD = (
  <>
    <circle cx="100" cy="46" r="21" />
    <path fill="none" d="M86 33c6-8 22-8 28 0" />
  </>
);

/** Mood 0 — hands on hips. */
function Hips() {
  return (
    <g {...S}>
      {HEAD}
      {BODY}
      <path fill="none" d="M74 92l-20 26 20 22" />
      <path fill="none" d="M126 92l20 26-20 22" />
    </g>
  );
}

/** Mood 1 — phone up. */
function OnPhone() {
  return (
    <g {...S}>
      {HEAD}
      {BODY}
      <path fill="none" d="M74 92l-12 44" />
      <path fill="none" d="M126 92l24 14" />
      <rect x="142" y="80" width="24" height="36" rx="5" />
      <path fill="none" d="M150 88h8" />
    </g>
  );
}

/** Mood 2 — coffee. */
function Coffee() {
  return (
    <g {...S}>
      {HEAD}
      {BODY}
      <path fill="none" d="M74 92l-12 44" />
      <path fill="none" d="M126 92l22 26" />
      <path d="M136 116h30l-4 28h-22z" />
      <path fill="none" d="M166 122c9 0 11 12 1 13" />
      <path fill="none" d="M144 106c4-6-2-9 2-15M156 106c4-6-2-9 2-15" />
    </g>
  );
}

/** Mood 3 — stretch. */
function Stretch() {
  return (
    <g {...S}>
      {HEAD}
      {BODY}
      <path fill="none" d="M74 92L56 46" />
      <path fill="none" d="M126 92l18-46" />
      <path fill="none" d="M44 34h-8M50 22l-5-6M62 30l-2-9" />
      <path fill="none" d="M156 34h8M150 22l5-6M138 30l2-9" />
    </g>
  );
}

export const MOODS = [Hips, OnPhone, Coffee, Stretch];

export function MoodFigure({ index, className }: { index: number; className?: string }) {
  const Scene = MOODS[index % MOODS.length];
  return (
    <svg viewBox="0 0 200 260" className={className} aria-hidden="true">
      <Scene />
    </svg>
  );
}

/* ── Marquee objects ───────────────────────────────────── */

const O = {
  fill: 'none',
  stroke: '#000000',
  strokeWidth: 5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const OBJECTS = [
  // laptop
  <g key="laptop" {...O}>
    <path d="M14 12h44v30H14zM6 42h60l4 10H2z" />
  </g>,
  // phone
  <g key="phone" {...O}>
    <rect x="22" y="6" width="28" height="48" rx="6" />
    <path d="M32 14h8" />
  </g>,
  // braces
  <g key="braces" {...O}>
    <path d="M28 8c-8 0-8 10-8 14s-6 8-6 8 6 2 6 8 0 14 8 14M44 8c8 0 8 10 8 14s6 8 6 8-6 2-6 8 0 14-8 14" />
  </g>,
  // coffee cup
  <g key="cup" {...O}>
    <path d="M16 18h32l-4 34H20zM48 24c10 0 12 14 0 15" />
    <path d="M26 10c3-5-2-7 1-9M38 10c3-5-2-7 1-9" />
  </g>,
  // git branch
  <g key="git" {...O}>
    <circle cx="20" cy="14" r="7" />
    <circle cx="20" cy="48" r="7" />
    <circle cx="52" cy="28" r="7" />
    <path d="M20 21v20M20 34h18c8 0 14-3 14-6" />
  </g>,
  // cursor arrow
  <g key="cursor" {...O}>
    <path d="M22 8l26 30h-14l-4 16z" />
  </g>,
  // terminal
  <g key="terminal" {...O}>
    <rect x="8" y="12" width="52" height="38" rx="4" />
    <path d="M20 26l8 6-8 6M34 40h14" />
  </g>,
  // spark
  <g key="spark" {...O}>
    <path d="M34 4l7 20 20 7-20 7-7 20-7-20-20-7 20-7z" />
  </g>,
];

/** One pass of the object set; the strip renders two for a seamless loop. */
export function DoodleRow() {
  return (
    <>
      {OBJECTS.map((obj, i) => (
        <svg
          key={i}
          viewBox="0 0 68 60"
          className="h-10 w-12 shrink-0 md:h-12 md:w-14"
          aria-hidden="true"
        >
          {obj}
        </svg>
      ))}
    </>
  );
}
