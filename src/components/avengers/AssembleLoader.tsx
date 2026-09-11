'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from './gsap';
import { CLIPS } from './config';
import { usePrefersReducedMotion } from '@/lib/media';

type Phase = 'playing' | 'holding' | 'leaving';

export default function AssembleLoader({
  progress,
  ready,
  onComplete,
}: {
  progress: number;
  ready: boolean;
  onComplete: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);

  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>('playing');
  const percent = Math.round(progress * 100);

  /* Autoplay is muted + inline so it is allowed everywhere, but a blocked or
     broken clip must not strand the visitor on a loading screen. */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {});
    const bail = window.setTimeout(
      () => setPhase((p) => (p === 'playing' ? 'holding' : p)),
      (CLIPS.loading.duration + 3) * 1000
    );
    return () => window.clearTimeout(bail);
  }, []);

  /* The clip is over — but the page only opens once the rest of the footage is
     in memory, otherwise the hero would arrive on a black frame. */
  useEffect(() => {
    if (phase !== 'holding' || !ready) return;
    const raf = requestAnimationFrame(() => setPhase('leaving'));
    return () => cancelAnimationFrame(raf);
  }, [phase, ready]);

  /* Hand-off. The frame pushes in while the readout drops away and the screen
     closes to a letterbox band, the way a shot is cut rather than broken. */
  useEffect(() => {
    if (phase !== 'leaving') return;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.to(rootRef.current, {
          opacity: 0,
          duration: 0.45,
          ease: 'power1.inOut',
          onComplete,
        });
        return;
      }

      gsap
        .timeline({ onComplete })
        .to(hudRef.current, { opacity: 0, y: 12, duration: 0.28, ease: 'power2.in' }, 0)
        .to(videoRef.current, { scale: 1.09, duration: 1.05, ease: 'power2.inOut' }, 0)
        .to(
          rootRef.current,
          {
            clipPath: 'inset(50% 0% 50% 0%)',
            duration: 0.72,
            ease: 'power3.inOut',
          },
          0.18
        )
        .to(rootRef.current, { opacity: 0, duration: 0.22, ease: 'power1.out' }, '-=0.18');
    }, rootRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, reduced]);

  const status =
    phase === 'playing'
      ? 'Gamma signature detected'
      : ready
        ? 'Signal locked'
        : 'Buffering footage';

  return (
    <div
      ref={rootRef}
      className="av fixed inset-0 z-[120] overflow-hidden bg-black"
      style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      role="status"
      aria-live="polite"
      aria-label={`Loading — ${percent}%`}
    >
      <video
        ref={videoRef}
        src={CLIPS.loading.url}
        muted
        playsInline
        autoPlay
        preload="auto"
        disablePictureInPicture
        /* Untouchable, and re-started if something stops it anyway: a click
           delivered to a video element is a play/pause toggle in some
           browsers, and this clip has to reach its last frame. */
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        style={{ filter: 'brightness(0.92) contrast(1.04) saturate(0.98)' }}
        onEnded={() => setPhase((p) => (p === 'playing' ? 'holding' : p))}
        onError={() => setPhase((p) => (p === 'playing' ? 'holding' : p))}
        onPause={(e) => {
          const video = e.currentTarget;
          if (phase === 'playing' && !video.ended) video.play().catch(() => {});
        }}
      />

      {/* grade + grain so the clip reads as part of the page, not a drop-in */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(125%_95%_at_50%_50%,transparent_45%,#04070acc_100%)]" />
      <div className="av-scan pointer-events-none absolute inset-0 opacity-35" />

      {/* HUD */}
      <div ref={hudRef} className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10">
        <div className="flex items-start justify-between">
          <div className="av-label flex items-center gap-2 whitespace-nowrap">
            <span className="block h-1.5 w-1.5 rotate-45 bg-[var(--gamma)]" />
            Avengers protocol
          </div>
          <div className="av-mono text-right text-[10px] tracking-[0.3em] whitespace-nowrap text-[var(--paper-dim)] uppercase">
            Shojol Islam
            {/* the second line has nowhere to go on a phone */}
            <span className="hidden text-[var(--gamma)] sm:block">Portfolio // 2012 New York</span>
          </div>
        </div>

        <div className="mx-auto w-full max-w-xl">
          <div className="flex items-end justify-between">
            <span className="av-label">{status}</span>
            <span className="av-mono text-2xl font-semibold text-[var(--paper)] tabular-nums sm:text-3xl">
              {String(percent).padStart(3, '0')}
              <span className="text-[var(--gamma)]">%</span>
            </span>
          </div>

          <div className="relative mt-3 h-[3px] w-full overflow-hidden bg-white/15">
            <div
              className="absolute inset-y-0 left-0 bg-[var(--gamma)] transition-[width] duration-200 ease-out"
              style={{ width: `${percent}%`, boxShadow: '0 0 14px 2px rgba(163,255,60,0.6)' }}
            />
          </div>

          <div className="av-mono mt-3 flex justify-between gap-4 text-[10px] tracking-[0.22em] text-[var(--paper-dim)] uppercase">
            <span>Decrypting 47.6 MB of footage</span>
            <span>{phase === 'playing' ? 'Stand by' : ready ? 'Ready' : 'Holding'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
