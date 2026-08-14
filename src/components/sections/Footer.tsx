"use client";

import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { profile, socials } from "@/lib/data";

const WORDMARK = "SHOJOL";

/**
 * Oversized wordmark that lights up under the cursor — same spotlight
 * behaviour as the project cards, just painted onto the letterforms.
 */
function Wordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(-600);
  const my = useMotionValue(-600);

  const sx = useSpring(mx, { stiffness: 320, damping: 34, mass: 0.5 });
  const sy = useSpring(my, { stiffness: 320, damping: 34, mass: 0.5 });

  const spotlight = useMotionTemplate`radial-gradient(240px circle at ${sx}px ${sy}px, #000 0%, #000 32%, transparent 72%)`;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  };

  const type =
    "flex justify-center whitespace-nowrap text-[clamp(3rem,14vw,10.5rem)] font-semibold leading-[0.85] tracking-[-0.05em]";

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      className="group relative cursor-default select-none overflow-hidden pt-10"
    >
      {/* resting state: cold outline */}
      <div
        className={`${type} mask-fade-b text-transparent [-webkit-text-stroke:1px_#1f3557]`}
      >
        {WORDMARK}
      </div>

      {/* lit state: revealed only where the cursor is */}
      <motion.div
        aria-hidden
        style={{ maskImage: spotlight, WebkitMaskImage: spotlight }}
        className={`${type} mask-fade-b pointer-events-none absolute inset-0 top-10 text-transparent opacity-0 transition-opacity duration-300 [-webkit-text-stroke:1px_#22d3ee] [filter:drop-shadow(0_0_6px_#22d3ee55)] group-hover:opacity-100`}
      >
        {WORDMARK}
      </motion.div>
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-line bg-void/60">
      <div className="container-x">
        <Wordmark />
      </div>

      <div className="container-x flex flex-col items-center gap-5 pb-10 pt-6 sm:flex-row sm:justify-between">
        <p className="font-mono text-[11px] text-ink-faint">
          © {year} {profile.name}.
        </p>

        <div className="flex items-center gap-5">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target={s.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="text-[12px] text-ink-dim transition-colors duration-300 hover:text-accent"
            >
              {s.label}
            </a>
          ))}
          <a
            href="#top"
            className="text-[12px] text-ink-dim transition-colors hover:text-accent"
          >
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
