'use client';

import { useEffect, useImperativeHandle, useRef, type Ref } from 'react';
import { gsap, useGSAP, ScrollTrigger } from './gsap';
import { getLenis } from '@/components/SmoothScroll';
import { CLIPS } from './config';

/**
 * The two background clips, pinned behind everything and driven by scroll
 * position rather than by a clock.
 *
 * `hero.mp4` runs across the opening section; the moment its last frame lands
 * the stage cross-cuts to `all_section.mp4`, which covers every remaining
 * section. Both are muted.
 *
 * The `<video>` elements themselves are kept off-screen and the frames are
 * painted into a canvas instead. A seeked, paused video sitting under
 * semi-transparent overlays is at the mercy of the compositor — it can fail to
 * repaint, or drop out of the layer entirely — whereas a canvas is just
 * ordinary page content. Both clips are 960×540, so one canvas serves both and
 * CSS stretches it to cover.
 */
export type StageHandle = {
  /** Unlock the clips for audible playback. Must be called inside a gesture. */
  armSound: () => void;
  /** Turn the sound on mid-cut, after a blocked start. */
  enableSound: () => void;
};

export default function VideoStage({
  heroSrc,
  allSrc,
  cinema,
  onCinemaEnd,
  onSoundBlocked,
  ref,
}: {
  heroSrc?: string;
  allSrc?: string;
  cinema: boolean;
  onCinemaEnd: () => void;
  onSoundBlocked: () => void;
  ref?: Ref<StageHandle>;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLVideoElement>(null);
  const allRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  /* Read inside the frame loop, which must not be rebuilt when this flips. */
  const cinemaRef = useRef(false);
  /* Which clip currently owns the sound, for a late unmute. */
  const audibleRef = useRef<HTMLVideoElement | null>(null);
  /* A short window during which the frame loop leaves the clips alone, so the
     play that unlocks them isn't aborted before it has begun. */
  const armUntilRef = useRef(0);

  useImperativeHandle(ref, () => ({
    /* Autoplay policies grant audible playback to a page that has been
       interacted with, so what this has to achieve is a play that begins
       inside the gesture. It stays muted while doing it: an audible play here
       takes audio focus, and Chrome answers that by pausing whatever else is
       running — which, at this point, is the loading clip the visitor is
       watching. */
    armSound: () => {
      armUntilRef.current = performance.now() + 600;
      [heroRef.current, allRef.current].forEach((video) => {
        if (!video) return;
        video
          .play()
          .then(() => video.pause())
          .catch(() => {});
      });
    },
    enableSound: () => {
      const video = audibleRef.current;
      if (video) video.muted = false;
    },
  }));

  useGSAP(
    () => {
      const heroVideo = heroRef.current;
      const allVideo = allRef.current;
      const canvas = canvasRef.current;
      const opening = document.getElementById('assemble');
      const story = document.getElementById('av-story');
      if (!heroVideo || !allVideo || !canvas || !opening || !story || !heroSrc || !allSrc) return;

      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      /* Scroll writes the wanted playhead here; the frame loop below is what
         actually moves the videos. */
      const state = { hero: 0, all: 0, mix: 0 };

      /* Assigning `currentTime` again while a seek is still running cancels
         that seek, so writing it on every tick — the usual way a scrubbed hero
         video is wired up — means a long, fast scroll never lets a single
         decode finish: the picture sticks for the whole gesture and only
         catches up once the writes stop. Instead each seek is allowed to
         land, and the next one goes straight to the newest position, which is
         both the smoothest and the fastest way to follow the scroll. */
      const seek = (video: HTMLVideoElement, time: number) => {
        if (video.seeking || !video.duration) return;
        const clamped = Math.min(Math.max(time, 0), video.duration - 0.05);
        if (Math.abs(video.currentTime - clamped) > 0.01) video.currentTime = clamped;
      };

      /* Whether a clip has ever decoded a frame — which is the real question
         for `drawImage`, and the only one worth asking. `readyState` is not:
         while a video is being seeked continuously it sits at HAVE_METADATA,
         so gating the paint on HAVE_CURRENT_DATA meant nothing was drawn for
         the whole length of a fast scroll, and the picture only resumed once
         the scrolling stopped and the state climbed back. The frames were
         there throughout. */
      let heroPrimed = heroVideo.readyState >= 2;
      let allPrimed = allVideo.readyState >= 2;
      const primeHero = () => {
        heroPrimed = true;
      };
      const primeAll = () => {
        allPrimed = true;
      };
      heroVideo.addEventListener('loadeddata', primeHero);
      allVideo.addEventListener('loadeddata', primeAll);

      gsap.to(state, {
        hero: CLIPS.hero.duration,
        ease: 'none',
        scrollTrigger: {
          trigger: opening,
          start: 'top top',
          end: 'bottom bottom',
          /* `true` rather than a number: a numeric scrub is a second lag on
             top of Lenis's own smoothing, and that tail read as the footage
             carrying on playing after the scroll had already stopped. */
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      /* `story top / viewport bottom` is the same scroll position as the
         opening section's end, so the second clip picks up exactly where the
         first one stops. */
      gsap.to(state, {
        all: CLIPS.all.duration,
        ease: 'none',
        scrollTrigger: {
          trigger: story,
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      /* Repainted unconditionally. Uploading a decoded 960×540 frame costs
         about what a playing video does anyway, and skipping repaints on the
         basis of `currentTime` is unsound: that property jumps the moment it
         is assigned while the picture only arrives when the decode lands, so
         any "nothing changed" test ends up showing the frame before last. The
         only thing still guarded is the clear — with no decoded frame to put
         down, the previous one is left standing rather than flashing the
         background through. */
      /* Outside a cut these elements are frame sources, not playing video, and
         that has to be asserted rather than assumed: priming deliberately
         starts playback to force the first decode, and a muted element can be
         resumed by the browser on its own. Left running, it drifts away from
         the scroll position it is supposed to be pinned to. Gated on the clip
         having produced a frame so the priming play is never cut short. */
      const park = (video: HTMLVideoElement, primed: boolean) => {
        if (performance.now() < armUntilRef.current) return;
        if (primed && !video.paused) video.pause();
      };

      const paint = () => {
        /* In cinema mode the clips run on their own clock and the page is
           scrolled to follow them, so the scroll-driven playhead stands down. */
        if (!cinemaRef.current) {
          park(heroVideo, heroPrimed);
          park(allVideo, allPrimed);
          seek(heroVideo, state.hero);
          seek(allVideo, state.all);
        }

        const drawHero = state.mix < 0.999 && heroPrimed;
        const drawAll = state.mix > 0.001 && allPrimed;

        if (drawHero || drawAll) {
          const { width, height } = canvas;
          ctx.globalAlpha = 1;
          ctx.fillStyle = '#04070a';
          ctx.fillRect(0, 0, width, height);

          if (drawHero) {
            ctx.globalAlpha = 1 - state.mix;
            ctx.drawImage(heroVideo, 0, 0, width, height);
          }
          if (drawAll) {
            ctx.globalAlpha = state.mix;
            ctx.drawImage(allVideo, 0, 0, width, height);
          }
          ctx.globalAlpha = 1;
        }

        frame = requestAnimationFrame(paint);
      };
      let frame = requestAnimationFrame(paint);

      const handoff = ScrollTrigger.create({
        trigger: opening,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          state.mix = gsap.utils.clamp(0, 1, (self.progress - 0.88) / 0.12);
          /* A short blow-out at the cut, peaking mid-crossfade. */
          gsap.set(flashRef.current, { opacity: Math.sin(state.mix * Math.PI) * 0.18 });
        },
      });

      return () => {
        cancelAnimationFrame(frame);
        handoff.kill();
        heroVideo.removeEventListener('loadeddata', primeHero);
        allVideo.removeEventListener('loadeddata', primeAll);
      };
    },
    { scope: rootRef, dependencies: [heroSrc, allSrc] }
  );

  /**
   * Cinema mode — the inverse of the rest of the page. Instead of scroll
   * driving the playhead, the clips play at their own speed with the sound up
   * and the scroll position is written from `currentTime`, so the whole
   * portfolio travels past at the pace of the cut. Lenis is stopped for the
   * duration so the wheel can't fight it, and every exit — the end of the
   * footage, Escape, the stop button, leaving the page — runs the same
   * teardown.
   */
  useEffect(() => {
    cinemaRef.current = cinema;
    if (!cinema) return;

    const heroVideo = heroRef.current;
    const allVideo = allRef.current;
    const opening = document.getElementById('assemble');
    if (!heroVideo || !allVideo || !opening) return;

    const lenis = getLenis();
    const viewport = window.innerHeight;
    /* Where the opening section hands over, and where the page runs out. */
    const handover = Math.max(1, opening.offsetTop + opening.offsetHeight - viewport);
    const bottom = Math.max(handover + 1, document.documentElement.scrollHeight - viewport);

    /* Lenis is left running and steered rather than stopped. Stopped, it goes
       on re-asserting its own position every frame, which pinned the page
       within a second whether the write went through `window.scrollTo` or
       through Lenis itself. `immediate` skips its easing — the cadence we want
       is the video's frame rate, not a second smoothing on top. */
    const scrollTo = (y: number) => {
      const clamped = Math.min(Math.max(y, 0), bottom);
      if (lenis) lenis.scrollTo(clamped, { immediate: true, force: true });
      else window.scrollTo(0, clamped);
    };

    let act: 'hero' | 'story' = 'hero';
    let heroWasBlocked = false;
    let frame = 0;

    const follow = () => {
      if (act === 'hero') {
        const span = heroVideo.duration || CLIPS.hero.duration;
        scrollTo((heroVideo.currentTime / span) * handover);
      } else {
        const span = allVideo.duration || CLIPS.all.duration;
        scrollTo(handover + (allVideo.currentTime / span) * (bottom - handover));
      }
      frame = requestAnimationFrame(follow);
    };

    const onHeroEnded = () => {
      act = 'story';
      heroVideo.muted = true;
      allVideo.currentTime = 0;
      /* Carries over whatever the opening clip ended up with: silent if the
         sound was never granted, audible if it was. */
      allVideo.muted = heroWasBlocked;
      audibleRef.current = allVideo;
      allVideo.play().catch(() => {});
    };
    const onAllEnded = () => onCinemaEnd();

    /* Any real attempt to scroll hands control back rather than fighting the
       playhead for the page. */
    const onInput = () => onCinemaEnd();

    heroVideo.addEventListener('ended', onHeroEnded);
    allVideo.addEventListener('ended', onAllEnded);
    window.addEventListener('wheel', onInput, { passive: true });
    window.addEventListener('touchstart', onInput, { passive: true });

    scrollTo(0);
    heroVideo.currentTime = 0;
    allVideo.currentTime = 0;
    heroVideo.muted = false;
    audibleRef.current = heroVideo;
    /* If the browser refuses the sound — nobody touched the loading screen, or
       a policy we can't see — the cut still runs, just silent, and the
       transport offers to turn it on. */
    heroVideo.play().catch(() => {
      heroWasBlocked = true;
      heroVideo.muted = true;
      onSoundBlocked();
      heroVideo.play().catch(() => onCinemaEnd());
    });
    frame = requestAnimationFrame(follow);

    return () => {
      cinemaRef.current = false;
      cancelAnimationFrame(frame);
      heroVideo.removeEventListener('ended', onHeroEnded);
      allVideo.removeEventListener('ended', onAllEnded);
      window.removeEventListener('wheel', onInput);
      window.removeEventListener('touchstart', onInput);
      heroVideo.pause();
      allVideo.pause();
      heroVideo.muted = true;
      allVideo.muted = true;
      audibleRef.current = null;
    };
  }, [cinema, onCinemaEnd, onSoundBlocked]);

  /* Primed so the first frame is decoded and ready to be drawn. */
  const prime = (video: HTMLVideoElement) => {
    video
      .play()
      .then(() => {
        video.pause();
        video.currentTime = 0;
      })
      .catch(() => {});
  };

  /* Parked off-screen: they are frame sources, not what the visitor looks at. */
  const sourceStyle = {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    width: 2,
    height: 2,
    opacity: 0.01,
    pointerEvents: 'none' as const,
  };

  return (
    <div ref={rootRef} id="av-stage" className="fixed inset-0 z-0 overflow-hidden bg-[#04070a]">
      {heroSrc && (
        <video
          ref={heroRef}
          src={heroSrc}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden
          style={sourceStyle}
          onLoadedMetadata={(e) => prime(e.currentTarget)}
        />
      )}
      {allSrc && (
        <video
          ref={allRef}
          src={allSrc}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden
          style={sourceStyle}
          onLoadedMetadata={(e) => prime(e.currentTarget)}
        />
      )}

      {/* 16:9 canvas, sized in CSS to cover whatever the viewport is */}
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 'max(100vw, 177.8vh)',
          height: 'max(100vh, 56.25vw)',
          filter: 'brightness(0.86) saturate(0.98) contrast(1.04)',
        }}
      />

      {/* Readability stack, kept deliberately thin — the footage is the point.
          Legibility is carried by the text shadow on the panels instead. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(125%_100%_at_50%_45%,transparent_28%,#04070a5c_66%,#04070ab8_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-linear-to-b from-[#04070ad9] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-[#04070ae0] to-transparent" />
      <div className="av-scan pointer-events-none absolute inset-0 opacity-25" />
      <div className="av-grid pointer-events-none absolute inset-0 opacity-[0.12]" />
      <div ref={flashRef} className="pointer-events-none absolute inset-0 bg-[#eaf5df] opacity-0" />
    </div>
  );
}
