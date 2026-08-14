import { marqueeWords } from "@/lib/data";

export default function Marquee() {
  const row = [...marqueeWords, ...marqueeWords];

  return (
    <div className="relative border-y border-line bg-void/60 py-4">
      <div className="mask-fade-x flex overflow-hidden">
        <div className="animate-marquee flex shrink-0 items-center gap-10 pr-10">
          {row.map((word, i) => (
            <span key={word + i} className="flex shrink-0 items-center gap-10">
              <span className="font-mono text-[13px] uppercase tracking-[0.2em] text-ink transition-colors duration-300 hover:text-accent">
                {word}
              </span>
              <span className="h-1 w-1 shrink-0 rotate-45 bg-accent/50" />
            </span>
          ))}
        </div>
        <div
          aria-hidden
          className="animate-marquee flex shrink-0 items-center gap-10 pr-10"
        >
          {row.map((word, i) => (
            <span
              key={`b-${word}-${i}`}
              className="flex shrink-0 items-center gap-10"
            >
              <span className="font-mono text-[13px] uppercase tracking-[0.2em] text-ink-faint">
                {word}
              </span>
              <span className="h-1 w-1 shrink-0 rotate-45 bg-accent/50" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
