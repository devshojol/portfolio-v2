'use client';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const GsapStagger = () => {
  useGSAP(() => {
    // Only two arguments: the original passed a trailing `0.5`, which is the
    // GSAP 2 `duration` slot. GSAP 3 moved duration into the vars object, so
    // that argument was being silently dropped — removing it changes nothing
    // at runtime and lets this typecheck.
    gsap.to('.stagger-box', {
      y: 250,
      rotation: 360,
      borderRadius: '100%',
      ease: 'power3.inOut',
      repeat: -1,
      yoyo: true,
      stagger: {
        amount: 1.5, // the amount of time to stagger the animations between each element
        grid: [2, 1], // the number of columns and rows in the grid
        axis: 'y', // the axis along which to stagger the animations
        ease: 'circ.inOut',
        from: 'center', // the starting position of the staggered animations
      },
    });
  });

  return (
    <main>
      <h1 className="text-ink text-3xl font-bold">GsapStagger</h1>

      <p className="text-ink-dim mt-5">
        GSAP stagger is a feature that allows you to apply animations with a staggered delay to a
        group of elements.
      </p>

      <p className="text-ink-dim mt-5">
        By using the stagger feature in GSAP, you can specify the amount of time to stagger the
        animations between each element, as well as customize the easing and duration of each
        individual animation. This enables you to create dynamic and visually appealing effects,
        such as staggered fades, rotations, movements, and more.
      </p>

      <p className="text-ink-dim mt-5">
        Read more about the{' '}
        <a
          className="text-accent"
          href="https://gsap.com/resources/getting-started/Staggers"
          target="_blank"
          rel="noreferrer noopener nofollow"
        >
          Gsap Stagger
        </a>{' '}
        feature.
      </p>

      <div className="mt-20">
        <div className="flex gap-5">
          <div className="stagger-box h-20 w-20 rounded-lg bg-indigo-200" />
          <div className="stagger-box h-20 w-20 rounded-lg bg-indigo-300" />
          <div className="stagger-box h-20 w-20 rounded-lg bg-indigo-400" />
          <div className="stagger-box h-20 w-20 rounded-lg bg-indigo-500" />
          <div className="stagger-box h-20 w-20 rounded-lg bg-indigo-600" />
          <div className="stagger-box h-20 w-20 rounded-lg bg-indigo-700" />
          <div className="stagger-box h-20 w-20 rounded-lg bg-indigo-800" />
        </div>
      </div>
    </main>
  );
};

export default GsapStagger;
