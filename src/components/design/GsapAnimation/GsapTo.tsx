'use client';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const GsapTo = () => {
  useGSAP(() => {
    gsap.to('#blue-box', {
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
      <h1 className="text-ink text-3xl font-bold">GsapTo</h1>

      <p className="text-ink-dim mt-5">
        The <code>gsap.to()</code> method is used to animate elements from their current state to a
        new state.
      </p>

      <p className="text-ink-dim mt-5">
        It is the most common GSAP method: you give it the values you want the element to end on,
        and GSAP works out the starting values by reading whatever the element already has.
      </p>

      <p className="text-ink-dim mt-5">
        Read more about the{' '}
        <a
          className="text-accent"
          href="https://greensock.com/docs/v3/GSAP/gsap.to()"
          target="_blank"
          rel="noreferrer noopener nofollow"
        >
          gsap.to()
        </a>{' '}
        method.
      </p>

      <div className="mt-20">
        <div id="blue-box" className="bg-sky h-20 w-20 rounded-lg" />
      </div>
    </main>
  );
};

export default GsapTo;
