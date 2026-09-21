'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/media';

/**
 * Radial accent picker, pinned to the corner.
 *
 * The swatches fan out from the button along a quarter arc — up and to the
 * left, so nothing is ever clipped by the viewport edge the way a full ring
 * would be in a fixed corner.
 *
 * Picking writes `--v2-accent-pick` on the root element. `.v2` reads it as the
 * source for `--v2-accent`, so one variable repaints the hero field, the
 * contact panel, every rule of the skills diagram and all the small accents
 * at once.
 */

const STORAGE_KEY = 'v2-accent';

/** All light enough to keep the black display type legible on a full-bleed field. */
export const ACCENTS = [
  { name: 'Lime', value: '#a7c957' },
  { name: 'Citron', value: '#eeea22' },
  { name: 'Spring', value: '#22ee39' },
  { name: 'Cyan', value: '#22d3ee' },
  { name: 'Amber', value: '#ffb703' },
  { name: 'Orchid', value: '#c77dff' },
] as const;

/**
 * The saved pick, read through `useSyncExternalStore` rather than an effect:
 * the server snapshot is the primary, so the first client render matches the
 * HTML and React swaps in the stored value straight after hydration.
 */
let listeners: Array<() => void> = [];

function subscribe(onChange: () => void) {
  listeners.push(onChange);
  // Keeps other tabs in step.
  window.addEventListener('storage', onChange);
  return () => {
    listeners = listeners.filter((l) => l !== onChange);
    window.removeEventListener('storage', onChange);
  };
}

function readStored(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && ACCENTS.some((a) => a.value === saved) ? saved : ACCENTS[0].value;
  } catch {
    return ACCENTS[0].value;
  }
}

const serverSnapshot = () => ACCENTS[0].value;

const RADIUS = 150;
/** 90° is straight up, 180° straight left. */
const FROM = 90;
const STEP = 18;

function seat(i: number) {
  const rad = ((FROM + i * STEP) * Math.PI) / 180;
  return { x: Math.cos(rad) * RADIUS, y: -Math.sin(rad) * RADIUS };
}

export default function ThemeFab() {
  const [open, setOpen] = useState(false);
  const accent = useSyncExternalStore(subscribe, readStored, serverSnapshot);
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLDivElement>(null);

  const apply = useCallback((value: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Private mode — the pick just won't survive a reload.
    }
    listeners.forEach((l) => l());
  }, []);

  // Push the chosen accent at the document. Syncing an external system is
  // what an effect is for, and it runs for the restored value too.
  useEffect(() => {
    document.documentElement.style.setProperty('--v2-accent-pick', accent);
  }, [accent]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  return (
    <div ref={root} className="fixed right-5 bottom-16 z-50 md:right-8">
      <AnimatePresence>
        {open &&
          ACCENTS.map((swatch, i) => {
            const { x, y } = seat(i);
            const active = swatch.value === accent;
            return (
              <motion.button
                key={swatch.value}
                type="button"
                onClick={() => apply(swatch.value)}
                aria-label={`${swatch.name} accent`}
                aria-pressed={active}
                initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                animate={{ x, y, scale: 1, opacity: 1 }}
                exit={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                transition={
                  reduced
                    ? { duration: 0.12, delay: 0 }
                    : {
                        type: 'spring',
                        stiffness: 460,
                        damping: 26,
                        mass: 0.7,
                        delay: i * 0.035,
                      }
                }
                whileHover={reduced ? undefined : { scale: 1.16 }}
                whileTap={reduced ? undefined : { scale: 0.94 }}
                style={{ backgroundColor: swatch.value }}
                className={`absolute right-2 bottom-2 h-10 w-10 cursor-pointer rounded-full shadow-lg shadow-black/40 transition-[box-shadow] focus-visible:outline-hidden ${
                  active ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''
                }`}
              />
            );
          })}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close accent picker' : 'Change accent colour'}
        aria-expanded={open}
        whileHover={reduced ? undefined : { scale: 1.06 }}
        whileTap={reduced ? undefined : { scale: 0.94 }}
        className="relative flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-white text-black shadow-xl ring-1 shadow-black/50 ring-black/15 focus-visible:outline-hidden"
      >
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 22 }}
          className="flex items-center justify-center"
        >
          {open ? (
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path
                d="M4 4l10 10M14 4L4 14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              {/* Three dabs on a palette — reads as "colour" at 20px. */}
              <path
                d="M10 2.5a7.5 7.5 0 100 15c1 0 1.6-.7 1.6-1.5 0-.5-.2-.8-.5-1.1-.3-.3-.5-.7-.5-1.1 0-.8.7-1.5 1.5-1.5h1.3A4.6 4.6 0 0018 7.7C18 4.8 14.4 2.5 10 2.5z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <circle cx="6.6" cy="8.2" r="1.05" fill="currentColor" />
              <circle cx="10" cy="6.1" r="1.05" fill="currentColor" />
              <circle cx="13.4" cy="8.2" r="1.05" fill="currentColor" />
            </svg>
          )}
        </motion.span>
      </motion.button>
    </div>
  );
}
