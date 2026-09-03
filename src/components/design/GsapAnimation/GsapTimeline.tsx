'use client';

import gsap from 'gsap';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';

const GsapTimeline = () => {
  // Built inside useGSAP and held in a ref. Creating it in the component body
  // would hand back a brand new, empty timeline on every render, while the
  // tweens stayed on the first one — so Play/Pause would end up driving a
  // timeline with nothing on it.
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(() => {
    const timeline = gsap.timeline({ repeat: -1, repeatDelay: 1, yoyo: true });
    timelineRef.current = timeline;

    timeline.to('#yellow-box', {
      x: 250,
      rotation: 360,
      borderRadius: '100%',
      duration: 2,
      ease: 'back.inOut',
    });

    timeline.to('#yellow-box', {
      y: 250,
      scale: 2,
      rotation: 360,
      borderRadius: '100%',
      duration: 2,
      ease: 'back.inOut',
    });

    timeline.to('#yellow-box', {
      x: 500,
      scale: 1,
      rotation: 360,
      borderRadius: '8px',
      duration: 2,
      ease: 'back.inOut',
    });
  });

  return (
    <main>
      <h1 className="text-ink text-3xl font-bold">GsapTimeline</h1>

      <p className="text-ink-dim mt-5">
        The <code>gsap.timeline()</code> method is used to create a timeline instance that can be
        used to manage multiple animations.
      </p>

      <p className="text-ink-dim mt-5">
        The <code>gsap.timeline()</code> method is similar to the <code>gsap.to()</code>,{' '}
        <code>gsap.from()</code>, and <code>gsap.fromTo()</code> methods, but the difference is that
        the <code>gsap.timeline()</code> method is used to create a timeline instance that can be
        used to manage multiple animations, while the <code>gsap.to()</code>,{' '}
        <code>gsap.from()</code>, and <code>gsap.fromTo()</code> methods are used to animate
        elements from their current state to a new state, from a new state to their current state,
        and from a new state to a new state, respectively.
      </p>

      <p className="text-ink-dim mt-5">
        Read more about the{' '}
        <a
          className="text-accent"
          href="https://greensock.com/docs/v3/GSAP/gsap.timeline()"
          target="_blank"
          rel="noreferrer noopener nofollow"
        >
          gsap.timeline()
        </a>{' '}
        method.
      </p>

      <div className="mt-20 space-y-10">
        <button
          type="button"
          className="border-line-strong text-ink hover:border-accent/60 hover:text-accent rounded-full border px-4 py-2 text-sm font-medium transition-colors"
          onClick={() => {
            const timeline = timelineRef.current;
            if (!timeline) return;
            if (timeline.paused()) {
              timeline.play();
            } else {
              timeline.pause();
            }
          }}
        >
          Play/Pause
        </button>

        <div id="yellow-box" className="h-20 w-20 rounded-lg bg-yellow-500" />
      </div>
    </main>
  );
};

export default GsapTimeline;
