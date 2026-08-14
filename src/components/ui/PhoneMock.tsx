"use client";

import { motion } from "framer-motion";

/**
 * A pure-CSS device frame with a stylised screen per project.
 * No screenshots needed — swap in real ones later by dropping an
 * <Image /> inside the screen div.
 */
export default function PhoneMock({ variant }: { variant: "gonit" | "chintu" }) {
  return (
    <div className="relative mx-auto w-47.5 shrink-0 sm:w-52.5">
      {/* glow */}
      <div
        className="absolute -inset-8 -z-10 rounded-[3rem] opacity-45 blur-3xl"
        style={{
          background:
            variant === "gonit"
              ? "radial-gradient(circle at 50% 35%, #22d3ee55, transparent 70%)"
              : "radial-gradient(circle at 50% 35%, #4f7dff55, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ rotateY: -14, rotateX: 6 }}
        whileHover={{ rotateY: -4, rotateX: 2, y: -6 }}
        transition={{ type: "spring", stiffness: 160, damping: 18 }}
        style={{ transformPerspective: 900 }}
        className="relative rounded-4xl border border-line-strong bg-linear-to-b from-[#131c2e] to-surface p-1.5 shadow-[0_30px_60px_-25px_#000]"
      >
        <div className="relative aspect-9/19 overflow-hidden rounded-[1.6rem] bg-[#050a14]">
          {/* notch */}
          <div className="absolute left-1/2 top-2 z-20 h-4.5 w-15.5 -translate-x-1/2 rounded-full bg-[#0a0f1a]" />

          {variant === "gonit" ? <GonitScreen /> : <ChintuScreen />}

          {/* screen sheen */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,#ffffff14,transparent_38%,transparent_62%,#ffffff08)]" />
        </div>
      </motion.div>
    </div>
  );
}

function GonitScreen() {
  return (
    <div className="flex h-full flex-col px-3.5 pb-3.5 pt-9">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-semibold tracking-wide text-accent">গণিত</span>
        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[7px] text-accent-soft">
          Class 6
        </span>
      </div>

      <div className="mt-3 rounded-lg border border-line bg-surface/80 p-2.5">
        <div className="text-[7px] uppercase tracking-wider text-ink-faint">Question 4 / 10</div>
        <div className="mt-1.5 font-mono text-[11px] leading-snug text-ink">
          If 3x + 7 = 25, what is x?
        </div>
      </div>

      <div className="mt-2.5 space-y-1.5">
        {[
          { t: "4", s: "idle" },
          { t: "6", s: "correct" },
          { t: "9", s: "idle" },
          { t: "12", s: "idle" },
        ].map((o, i) => (
          <motion.div
            key={o.t}
            animate={o.s === "correct" ? { scale: [1, 1.03, 1] } : {}}
            transition={{ duration: 1.6, repeat: Infinity, delay: 0.4 }}
            className={`flex items-center justify-between rounded-md border px-2 py-1.5 text-[9px] ${
              o.s === "correct"
                ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
                : "border-line bg-surface/50 text-ink-dim"
            }`}
          >
            <span className="font-mono">
              {String.fromCharCode(65 + i)}. {o.t}
            </span>
            {o.s === "correct" && (
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-auto">
        <div className="mb-1 flex justify-between text-[7px] text-ink-faint">
          <span>Progress</span>
          <span className="font-mono text-accent">40%</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-line">
          <motion.div
            initial={{ width: "12%" }}
            whileInView={{ width: "40%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
            className="h-full rounded-full bg-linear-to-r from-accent to-sky"
          />
        </div>
      </div>
    </div>
  );
}

function ChintuScreen() {
  return (
    <div className="flex h-full flex-col px-3.5 pb-3.5 pt-9">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-semibold text-indigo">চিন্তু</span>
        <div className="flex gap-0.75">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-0.75 w-0.75 rounded-full bg-ink-faint" />
          ))}
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border border-line bg-linear-to-br from-[#1a2340] to-[#101a30] p-3">
        <div className="text-[7px] uppercase tracking-wider text-indigo/80">গল্প</div>
        <div className="mt-1 text-[11px] font-semibold leading-tight text-ink">
          বনের রাজা ও ছোট্ট খরগোশ
        </div>
        <div className="mt-2 space-y-1">
          {[100, 88, 94, 70].map((w, i) => (
            <div key={i} className="h-0.75 rounded-full bg-line-strong" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-1.5">
        {["কবিতা", "কুইজ", "ছড়া", "শোনো"].map((label, i) => (
          <div
            key={label}
            className="rounded-md border border-line bg-surface/60 px-2 py-2.5 text-center text-[8px] text-ink-dim"
          >
            <div
              className="mx-auto mb-1 h-3.5 w-3.5 rounded"
              style={{
                background: ["#4f7dff33", "#22d3ee33", "#a78bfa33", "#34d39933"][i],
              }}
            />
            {label}
          </div>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-2 rounded-full border border-line bg-surface/70 px-2.5 py-1.5">
        <motion.span
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="grid h-4 w-4 place-items-center rounded-full bg-indigo/30 text-[6px] text-ink"
        >
          ▶
        </motion.span>
        <div className="h-0.75 flex-1 overflow-hidden rounded-full bg-line">
          <div className="h-full w-[58%] rounded-full bg-indigo" />
        </div>
      </div>
    </div>
  );
}
