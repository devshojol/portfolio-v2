'use client';

import { useRef } from 'react';
import { gsap, useGSAP, ScrollTrigger, SplitText } from './gsap';

/**
 * One scroll choreography shared by every section on the route, driven off
 * data attributes so the section components stay markup-only:
 *
 *   data-av-split    headline — split to characters, they rise and un-blur
 *   data-av-rule     hairline — draws out from its left edge
 *   data-av-side     block    — slides in from the left
 *   data-av-up       block    — lifts in from below
 *   data-av-stagger  wrapper  — its direct children arrive one after another
 *   data-av-stage    the sticky panel — clears out before the section ends
 *
 * Every section is a tall wrapper with a `position: sticky` child, so the
 * trigger range `top top → bottom bottom` is exactly the span where the panel
 * is parked in the viewport. The whole thing is scrubbed rather than played on
 * enter: the footage underneath is itself scroll-driven, and anything running
 * on its own clock would visibly drift away from it.
 */
export function useSectionChoreography<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;

      const splits: SplitText[] = [];

      /* The panel is revealed while it rises into frame — from the point its
         wrapper's top crosses 65% of the viewport until the wrapper locks at
         the top — not once it is already parked. Keying it to the sticky range
         instead would leave a screen of nothing between one section leaving
         and the next one filling in. */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top 65%',
          end: 'top top',
          scrub: 0.6,
        },
      });

      /* A staggered tween only stamps its start values onto the targets whose
         turn has come, so everything after the first would sit there fully
         visible until the scrub reached it. `gsap.set` up front makes the
         section's resting state explicit instead of a side effect. */
      const reveal = (
        targets: ArrayLike<Element>,
        from: gsap.TweenVars,
        to: gsap.TweenVars,
        position: number
      ) => {
        const list = Array.from(targets);
        if (!list.length) return;
        gsap.set(list, from);
        tl.fromTo(list, from, to, position);
      };

      root.querySelectorAll<HTMLElement>('[data-av-split]').forEach((el, i) => {
        const split = SplitText.create(el, { type: 'words,chars', mask: 'words' });
        splits.push(split);
        reveal(
          split.chars,
          { yPercent: 115, opacity: 0, filter: 'blur(5px)' },
          {
            yPercent: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.26,
            ease: 'power3.out',
            stagger: { amount: 0.16 },
          },
          0.02 + i * 0.05
        );
      });

      reveal(
        root.querySelectorAll('[data-av-rule]'),
        { scaleX: 0 },
        { scaleX: 1, duration: 0.2, ease: 'power2.out', stagger: 0.04 },
        0.04
      );

      reveal(
        root.querySelectorAll('[data-av-side]'),
        { x: -44, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.26, ease: 'power3.out', stagger: 0.05 },
        0.1
      );

      reveal(
        root.querySelectorAll('[data-av-up]'),
        { y: 42, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.26, ease: 'power3.out', stagger: 0.05 },
        0.14
      );

      root.querySelectorAll<HTMLElement>('[data-av-stagger]').forEach((group, i) => {
        reveal(
          group.children,
          { y: 24, opacity: 0, scale: 0.98 },
          { y: 0, opacity: 1, scale: 1, duration: 0.22, ease: 'power2.out', stagger: 0.035 },
          0.2 + i * 0.04
        );
      });

      /* Pin the timeline's length to 1 so the positions above read as
         fractions of the section's approach. */
      tl.set({}, {}, 1);

      /* Dissolve on the way out, over the stretch where the panel has stopped
         sticking and is scrolling off the top anyway. */
      const stage = root.querySelector<HTMLElement>('[data-av-stage]');
      if (stage) {
        gsap.to(stage, {
          opacity: 0,
          y: -64,
          filter: 'blur(7px)',
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'bottom bottom',
            end: 'bottom 45%',
            scrub: 0.6,
          },
        });
      }

      return () => {
        splits.forEach((s) => s.revert());
      };
    },
    { scope: ref }
  );

  return ref;
}

export { ScrollTrigger, gsap };
