"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { navLinks, profile } from "@/lib/data";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = navLinks
      .map((l) => document.querySelector(l.href))
      .filter(Boolean) as Element[];

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(`#${e.target.id}`);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div
          className={`transition-all duration-500 ${
            scrolled
              ? "border-b border-line/80 bg-night/70 backdrop-blur-xl backdrop-saturate-150"
              : "border-b border-transparent"
          }`}
        >
          <nav className="container-x flex h-16 items-center justify-between md:h-[72px]">
            <a href="#top" className="group flex items-center gap-2.5" aria-label="Home">
              <span className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-line-strong bg-surface">
                <span className="font-mono text-[13px] font-bold text-accent">S</span>
                <span className="absolute inset-0 rounded-lg bg-accent/10 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />
              </span>
              <span className="hidden text-sm font-medium tracking-tight text-ink sm:block">
                {profile.name}
              </span>
            </a>

            <ul className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`relative rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors duration-300 ${
                      active === link.href ? "text-ink" : "text-ink-dim hover:text-ink"
                    }`}
                  >
                    {active === link.href && (
                      <motion.span
                        layoutId="nav-pill"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        className="absolute inset-0 -z-10 rounded-full border border-line-strong bg-surface/80"
                      />
                    )}
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2">
              <a
                href={profile.resumeUrl}
                download
                className="hidden items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-ink-dim transition-colors duration-300 hover:text-ink sm:inline-flex"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Résumé
              </a>

              <button
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-line-strong bg-surface md:hidden"
              >
                <span className="sr-only">Menu</span>
                <span
                  className={`absolute h-px w-4 bg-ink transition-transform duration-300 ${
                    open ? "translate-y-0 rotate-45" : "-translate-y-1"
                  }`}
                />
                <span
                  className={`absolute h-px w-4 bg-ink transition-transform duration-300 ${
                    open ? "translate-y-0 -rotate-45" : "translate-y-1"
                  }`}
                />
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="fixed inset-0 z-40 bg-night/95 backdrop-blur-xl md:hidden"
          >
            <div className="container-x flex h-full flex-col justify-center gap-1">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i + 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-baseline gap-4 border-b border-line py-5 text-3xl font-semibold tracking-tight text-ink"
                >
                  <span className="font-mono text-xs text-accent">0{i + 1}</span>
                  {link.label}
                </motion.a>
              ))}
              <motion.a
                href={profile.resumeUrl}
                download
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42, duration: 0.45 }}
                className="mt-8 inline-flex w-fit items-center gap-2 border-b border-line-strong pb-1 text-sm font-medium text-ink-dim"
              >
                Download résumé
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
