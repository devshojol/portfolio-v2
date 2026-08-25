'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { LuFolder, LuMaximize, LuMinimize, LuMinus, LuX } from 'react-icons/lu';
import DragAble from './DragAble';
import { cn } from '@/utils/cn';

/** Matches the feel of the Pokopia example: a soft spring, no overshoot wobble. */
const SPRING = { type: 'spring', stiffness: 260, damping: 30, mass: 0.9 } as const;

const noopSubscribe = () => () => {};

/**
 * False through SSR and the first client render, true after hydration — the
 * portal needs a real `document`, and flipping it in an effect would be a
 * cascading render.
 */
function useIsClient() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

type TrafficLight = {
  label: string;
  /** macOS keeps these three hues even in dark mode — they *are* the affordance. */
  color: string;
  icon: React.ReactNode;
  onClick: () => void;
};

/**
 * A macOS-style window that grows out of the folder it was opened from.
 *
 * The morph is a shared `layoutId` with the folder icon — the folder unmounts
 * as this mounts, so Motion treats them as one element and tweens the box
 * between them. That is why this has to be portalled: `DragAble` puts a
 * transform on an ancestor, and a transformed ancestor becomes the containing
 * block for `position: fixed`, which would trap the window inside the folder's
 * corner of the page.
 */
export default function FolderWindow({
  open,
  onClose,
  name,
  layoutId,
  children,
}: {
  open: boolean;
  onClose: () => void;
  name: string;
  layoutId: string;
  /** Whatever this window is for — rendered as the entire window body. */
  children?: React.ReactNode;
}) {
  const mounted = useIsClient();
  const [full, setFull] = useState(false);

  const toggleFull = () => setFull((v) => !v);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // Escape backs out one step at a time, the way a Mac window does.
      if (full) setFull(false);
      else onClose();
    };

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, full, onClose]);

  if (!mounted) return null;

  const lights: TrafficLight[] = [
    { label: 'Close', color: '#ff5f57', icon: <LuX />, onClick: onClose },
    // Minimising drops the window back into the folder it came from, which is
    // the same layout morph as closing — so it runs the same handler.
    { label: 'Minimise', color: '#febc2e', icon: <LuMinus />, onClick: onClose },
    {
      label: full ? 'Exit full screen' : 'Full screen',
      color: '#28c840',
      icon: full ? <LuMinimize /> : <LuMaximize />,
      onClick: toggleFull,
    },
  ];

  // `cursor-hidden` is repeated on the portal root: it lands outside <main>,
  // so the page's cursor rule doesn't reach it and the native arrow would
  // come back over every button in the window.
  const shell = (
    <div
      className={cn(
        'cursor-hidden fixed inset-0 z-120 flex justify-center',
        full ? 'items-start p-0' : 'items-center p-6'
      )}
    >
      <motion.div
        className="bg-void/70 absolute inset-0 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      />

      <DragAble disabled={full} className={cn('relative', full && 'h-full w-full')}>
        <motion.div
          layoutId={layoutId}
          transition={SPRING}
          className={cn(
            'bg-surface/85 border-line-strong relative flex flex-col overflow-hidden border shadow-[0_40px_120px_-24px_rgba(0,0,0,0.9)] backdrop-blur-2xl',
            full
              ? 'h-full w-full rounded-none'
              : 'h-[min(36rem,82vh)] w-[min(64rem,92vw)] rounded-2xl'
          )}
        >
          {/* ── Title bar ─────────────────────────────────────────── */}
          <div
            className="border-line-strong bg-elevated/70 relative flex h-11 shrink-0 items-center border-b px-3"
            onDoubleClick={toggleFull}
          >
            <div className="group/lights flex items-center gap-2">
              {lights.map((light) => (
                <button
                  key={light.label}
                  type="button"
                  onClick={light.onClick}
                  aria-label={light.label}
                  title={light.label}
                  className="grid h-3 w-3 place-items-center rounded-full text-[8px] text-black/55"
                  style={{ backgroundColor: light.color }}
                >
                  {/* Glyphs only on hover, exactly like the real thing. */}
                  <span className="opacity-0 transition-opacity group-hover/lights:opacity-100">
                    {light.icon}
                  </span>
                </button>
              ))}
            </div>

            <div className="text-ink-dim pointer-events-none absolute inset-x-0 flex items-center justify-center gap-2 text-[13px] font-medium">
              <LuFolder className="text-accent" />
              {name}
            </div>
          </div>

          {/* ── Body ──────────────────────────────────────────────── */}
          <motion.div
            className="min-h-0 flex-1 overflow-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12, duration: 0.25 }}
          >
            {children}
          </motion.div>
        </motion.div>
      </DragAble>
    </div>
  );

  return createPortal(
    <AnimatePresence onExitComplete={() => setFull(false)}>{open && shell}</AnimatePresence>,
    document.body
  );
}
