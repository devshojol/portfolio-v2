'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import SwordAnimation from './SwordAnimation';
import { CAMERA_DISTANCE, CAMERA_FOV, MOVES, moveIndexAt } from './choreography';

/**
 * The window body for the Sword folder.
 *
 * The captions are driven from a ref the scene writes every frame rather than
 * from React state: `ScrollControls` lives inside the canvas, so the offset is
 * only available there, and re-rendering this tree sixty times a second to
 * move a progress bar would be paying React for something a transform does for
 * free. State is only touched when the *move* changes.
 */
function Sword() {
  // Matches the other 3D folders: the canvas waits for the window's open
  // animation to settle before it starts measuring itself.
  const [showModel, setShowModel] = useState(false);
  const [moveIndex, setMoveIndex] = useState(0);

  const offset = useRef(0);
  const bar = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLParagraphElement>(null);

  const handleProgress = useCallback((value: number) => {
    offset.current = value;
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowModel(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showModel) return;

    let frame = 0;
    const tick = () => {
      const value = offset.current;
      if (bar.current) bar.current.style.transform = `scaleX(${value})`;
      if (hint.current) hint.current.style.opacity = value > 0.015 ? '0' : '1';
      // Same index bails out of the render, so this stays a cheap rAF loop.
      setMoveIndex((previous) => {
        const next = moveIndexAt(value);
        return next === previous ? previous : next;
      });
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [showModel]);

  const move = MOVES[moveIndex];

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#05070d]">
      {showModel && (
        <Canvas
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          camera={{ fov: CAMERA_FOV, position: [0, 0, CAMERA_DISTANCE] }}
          resize={{ offsetSize: true }}
        >
          <Suspense fallback={null}>
            <SwordAnimation onProgress={handleProgress} />
          </Suspense>
        </Canvas>
      )}

      {/* The HUD sits above the canvas but must not eat the scroll gesture that
          drives the whole animation. */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-8 sm:p-12">
        <header>
          <p className="text-ink-faint font-mono text-[0.65rem] tracking-[0.4em] uppercase">
            Chevalier Sword
          </p>
          <h2 className="animate-shimmer mt-2 bg-[linear-gradient(100deg,var(--color-ink-faint)_0%,#ffffff_18%,var(--color-accent-soft)_32%,var(--color-accent)_46%,#ffffff_60%,var(--color-indigo)_78%,var(--color-ink-faint)_100%)] bg-[length:200%_100%] bg-clip-text font-serif text-3xl font-semibold tracking-tight text-transparent sm:text-5xl">
            Iaido — 抜刀
          </h2>
        </header>

        <footer className="flex flex-col gap-4">
          {/* key on the label so each move's caption fades in on its own */}
          <div key={move.label} className="animate-rise">
            <p className="text-accent-soft font-serif text-2xl sm:text-3xl">{move.jp}</p>
            <p className="text-ink-dim mt-1 font-mono text-xs tracking-[0.2em] uppercase">
              {move.label}
            </p>
          </div>

          <div className="bg-line/60 h-px w-full overflow-hidden">
            <div
              ref={bar}
              className="from-accent-deep via-accent to-accent-soft h-px w-full origin-left scale-x-0 bg-gradient-to-r"
            />
          </div>

          <p
            ref={hint}
            className="text-ink-faint font-mono text-[0.65rem] tracking-[0.3em] uppercase transition-opacity duration-500"
          >
            Scroll to draw the blade
          </p>
        </footer>
      </div>
    </div>
  );
}

export default Sword;
