"use client";

import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { profile, socials, stats } from "@/lib/data";
import Magnetic from "@/components/ui/Magnetic";
import { useCanRenderScene, usePrefersReducedMotion } from "@/lib/media";

const Scene = dynamic(() => import("@/components/three/Scene"), {
  ssr: false,
  // Same painted backdrop while the chunk loads, so there is no flash of a
  // different placeholder before the canvas takes over.
  loading: () => <HeroBackdrop />,
});

/**
 * Painted stand-in for the WebGL hero, used on phones, tablets and for
 * reduced-motion visitors. Same palette and focal point as the 3D core, but
 * it is pure CSS — no shaders, no render loop, no main-thread cost.
 */
function HeroBackdrop() {
  return (
    <div className="absolute inset-0 bg-void">
      <div className="absolute inset-0 bg-[radial-gradient(58%_44%_at_62%_32%,#0b3a4f5c_0%,#08243a2e_46%,transparent_72%)]" />
      <div className="absolute left-[62%] top-[32%] h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
    </div>
  );
}

/** Two fixed lines so the headline never breaks awkwardly. */
const headline = [
  { words: ["I", "build", "interfaces"], accent: false },
  { words: ["that", "feel", "right."], accent: true },
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const canRenderScene = useCanRenderScene();
  const reduced = usePrefersReducedMotion();
  const showScene = canRenderScene && !reduced;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section id="top" ref={ref} className="relative min-h-svh overflow-hidden">
      {/* 3D layer — only on large pointer-driven screens; see useCanRenderScene */}
      <motion.div className="absolute inset-0">
        {showScene ? <Scene /> : <HeroBackdrop />}
      </motion.div>

      {/* readability + depth overlays */}
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-[0.45] mask-fade-b" />
      {/* desktop: dark scrim on the left so the copy always sits on a clean field */}
      <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(95deg,#04070d_0%,#04070df2_30%,#04070dad_50%,#04070d33_68%,transparent_82%)] lg:block" />
      {/* mobile / tablet: soft vignette instead */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_62%_26%,#04070d8c_0%,#04070de6_42%,#060a12f5_78%,#060a12_100%)] lg:hidden" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-linear-to-t from-night via-night/70 to-transparent" />

      {/* content */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="container-x relative z-10 flex min-h-svh flex-col justify-center pb-24 pt-28"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mb-7 inline-flex w-fit items-center gap-2.5 rounded-full border border-line-strong bg-surface/60 px-3.5 py-1.5 backdrop-blur-md"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-400" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          <span className="font-mono text-[11px] tracking-[0.14em] text-ink-dim uppercase">
            {profile.availability}
          </span>
        </motion.div>

        <h1 className="max-w-4xl text-[clamp(2.1rem,6.1vw,4.5rem)] font-semibold leading-[1.06] tracking-[-0.03em]">
          {headline.map((line, li) => (
            <span key={li} className="block">
              {line.words.map((word, wi) => (
                <span
                  key={word + wi}
                  className="mr-[0.26em] inline-block overflow-hidden pb-[0.08em] align-bottom"
                >
                  <motion.span
                    initial={{ y: "108%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 0.9,
                      delay: 0.28 + (li * 4 + wi) * 0.075,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={`inline-block ${line.accent ? "text-accent-soft" : "text-ink"}`}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85 }}
          className="mt-7 max-w-xl text-[15px] leading-relaxed text-ink-dim sm:text-base"
        >
          I&apos;m <span className="text-ink">Shojol</span> — a frontend
          developer. I turn ideas into polished, responsive experiences that{" "}
          <span className="text-accent-soft">
            look right, feel right, and work
          </span>{" "}
          reliably across web and mobile.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <Magnetic strength={0.25}>
            <a
              href="#projects"
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-linear-to-r from-accent to-sky px-6 py-3 text-sm font-semibold text-[#03151c] shadow-[0_0_30px_-8px_#22d3ee]"
            >
              <span className="relative z-10">See my work</span>
              <svg
                className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
              <span className="absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-500 group-hover:translate-x-0" />
            </a>
          </Magnetic>

          <Magnetic strength={0.25}>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface/60 px-6 py-3 text-sm font-medium text-ink backdrop-blur-md transition-colors duration-300 hover:border-accent/50 hover:text-accent-soft"
            >
              Get in touch
            </a>
          </Magnetic>

          <div className="ml-1 flex items-center gap-1.5">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                aria-label={s.label}
                className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink-dim transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:text-accent"
              >
                <SocialIcon name={s.label} />
              </a>
            ))}
          </div>
        </motion.div>

        {/* stat strip */}
        <motion.dl
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.15 }}
          className="mt-14 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line/60 sm:grid-cols-4"
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-night/70 px-4 py-4 backdrop-blur-sm"
            >
              <dt className="font-mono text-2xl font-semibold text-ink">
                {s.value}
                <span className="text-accent">{s.suffix}</span>
              </dt>
              <dd className="mt-1 text-[11px] uppercase tracking-[0.12em] text-ink-faint">
                {s.label}
              </dd>
            </div>
          ))}
        </motion.dl>
      </motion.div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        style={{ opacity: contentOpacity }}
        className="pointer-events-none absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink-faint">
          Scroll
        </span>
        <span className="relative h-9 w-px overflow-hidden bg-line-strong">
          <motion.span
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-x-0 h-4 bg-accent"
          />
        </span>
      </motion.div>
    </section>
  );
}

function SocialIcon({ name }: { name: string }) {
  if (name === "GitHub") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M12 .5C5.73.5.9 5.33.9 11.6c0 4.9 3.17 9.05 7.57 10.52.55.1.75-.24.75-.53v-1.9c-3.08.67-3.73-1.3-3.73-1.3-.5-1.3-1.23-1.64-1.23-1.64-1-.7.08-.68.08-.68 1.1.08 1.7 1.14 1.7 1.14.99 1.7 2.6 1.2 3.23.92.1-.72.39-1.2.7-1.48-2.46-.28-5.05-1.24-5.05-5.5 0-1.22.43-2.21 1.14-2.99-.11-.28-.5-1.42.1-2.96 0 0 .93-.3 3.05 1.14a10.5 10.5 0 0 1 5.56 0c2.12-1.44 3.05-1.14 3.05-1.14.6 1.54.22 2.68.11 2.96.71.78 1.14 1.77 1.14 2.99 0 4.27-2.6 5.21-5.07 5.49.4.35.76 1.03.76 2.08v3.08c0 .3.2.64.76.53a11.11 11.11 0 0 0 7.56-10.52C23.1 5.33 18.27.5 12 .5Z" />
      </svg>
    );
  }
  if (name === "LinkedIn") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14Zm1.78 13.02H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
      </svg>
    );
  }
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  );
}
