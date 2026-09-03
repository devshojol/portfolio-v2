'use client';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const GsapFrom = () => {
  useGSAP(() => {
    gsap.from('#green-box', {
      x: 250,
      rotation: 360,
      borderRadius: '100%',
      duration: 2,
      ease: 'power1.inOut',
      repeat: -1,
      yoyo: true,
    });
  });

  return (
    <main>
      <h1 className="text-ink text-3xl font-bold">GsapFrom</h1>

      <p className="text-ink-dim mt-5">
        The <code>gsap.from()</code> method is used to animate elements from a new state to their
        current state.
      </p>

      <p className="text-ink-dim mt-5">
        The <code>gsap.from()</code> method is similar to the <code>gsap.to()</code> method, but the
        difference is that the <code>gsap.from()</code> method animates elements from a new state to
        their current state, while the <code>gsap.to()</code> method animates elements from their
        current state to a new state.
      </p>

      <p className="text-ink-dim mt-5">
        Read more about the{' '}
        <a
          className="text-accent"
          href="https://greensock.com/docs/v3/GSAP/gsap.from()"
          target="_blank"
          rel="noreferrer noopener nofollow"
        >
          gsap.from()
        </a>{' '}
        method.
      </p>

      <div className="mt-20">
        <div id="green-box" className="h-20 w-20 rounded-lg bg-green-500" />
      </div>
    </main>
  );
};

export default GsapFrom;
