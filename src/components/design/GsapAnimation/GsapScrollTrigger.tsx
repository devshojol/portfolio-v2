'use client';

import gsap from 'gsap';
import { useContext, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/all';
import { ScrollerContext } from './scrollerContext';

gsap.registerPlugin(ScrollTrigger);

const GsapScrollTrigger = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  // These demos scroll inside the folder window, not the page, so every
  // trigger has to be pointed at that element.
  const scroller = useContext(ScrollerContext);

  useGSAP(
    () => {
      const container = scrollRef.current;
      if (!container) return;

      // get all the boxes in the scrollRef
      const boxes = gsap.utils.toArray<HTMLElement>(container.children);

      boxes.forEach((box, index) => {
        gsap.to(box, {
          x: 150 * (index + 4.5),
          rotation: 360,
          borderRadius: '100%',
          scale: 1.5,
          scrollTrigger: {
            trigger: box,
            scroller: scroller?.current ?? undefined,
            start: 'bottom bottom', // when the bottom of the box hits the bottom of the viewport
            end: 'top 20%', // end when the top of the box hits 20% from the top of the viewport
            scrub: true, // scrubbing makes the animation smooth
          },
          ease: 'power1.inOut',
        });
      });
    },
    { scope: scrollRef, dependencies: [scroller] }
  );

  return (
    <main>
      <h1 className="text-ink text-3xl font-bold">GsapScrollTrigger</h1>

      <p className="text-ink-dim mt-5">
        Gsap Scroll Trigger is a plugin that allows you to create animations that are triggered by
        the scroll position of the page.
      </p>

      <p className="text-ink-dim mt-5">
        With ScrollTrigger, you can define various actions to be triggered at specific scroll
        points, such as starting or ending an animation, scrubbing through animations as the user
        scrolls, pinning elements to the screen, and more.{' '}
      </p>

      <p className="text-ink-dim mt-5">
        Read more about the{' '}
        <a
          className="text-accent"
          href="https://gsap.com/docs/v3/Plugins/ScrollTrigger/"
          target="_blank"
          rel="noreferrer noopener nofollow"
        >
          gsap scroll trigger
        </a>{' '}
        method.
      </p>

      <div className="flex h-[70vh] w-full flex-col items-center justify-center">
        <p className="text-ink-dim text-center">Scroll down to see the animation</p>

        <svg
          className="mt-5 animate-bounce"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 19V5" />
          <path d="M5 12l7 7 7-7" />
        </svg>
      </div>

      <div className="mt-20 h-screen w-full" ref={scrollRef}>
        <div id="scroll-pink" className="scroll-box h-20 w-20 rounded-lg bg-pink-500" />
        <div id="scroll-orange" className="scroll-box h-20 w-20 rounded-lg bg-orange-500" />
      </div>
    </main>
  );
};

export default GsapScrollTrigger;
