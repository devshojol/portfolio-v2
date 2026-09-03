/**
 * The animation code for each demo, shown in the Code panel.
 *
 * Kept as strings rather than read off disk: importing a source file as raw
 * text needs bundler-specific syntax that isn't set up here. The trade-off is
 * that these have to be edited alongside the components they describe.
 */
export const snippets: Record<string, string> = {
  'GSAP To': `useGSAP(() => {
  gsap.to('#blue-box', {
    x: 250,
    rotation: 360,
    borderRadius: '100%',
    duration: 2,
    ease: 'power1.inOut',
    repeat: -1,
    yoyo: true,
  });
});`,

  'GSAP From': `useGSAP(() => {
  gsap.from('#green-box', {
    x: 250,
    rotation: 360,
    borderRadius: '100%',
    duration: 2,
    ease: 'power1.inOut',
    repeat: -1,
    yoyo: true,
  });
});`,

  'GSAP FromTo': `useGSAP(() => {
  gsap.fromTo(
    '#red-box',
    {
      x: 0,
      rotation: 0,
      borderRadius: '0%',
    },
    {
      x: 250,
      rotation: 360,
      borderRadius: '100%',
      duration: 2,
      ease: 'bounce.out',
      repeat: -1,
      yoyo: true,
    }
  );
});`,

  'GSAP Timeline': `// Built inside useGSAP and held in a ref. Creating it in the
// component body would hand back a new, empty timeline on every
// render while the tweens stayed on the first one.
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

// Play/Pause
const timeline = timelineRef.current;
if (timeline.paused()) timeline.play();
else timeline.pause();`,

  'GSAP Stagger': `useGSAP(() => {
  gsap.to('.stagger-box', {
    y: 250,
    rotation: 360,
    borderRadius: '100%',
    ease: 'power3.inOut',
    repeat: -1,
    yoyo: true,
    stagger: {
      amount: 1.5, // total time to spread the animations over
      grid: [2, 1], // columns and rows in the grid
      axis: 'y',    // axis to stagger along
      ease: 'circ.inOut',
      from: 'center', // where the stagger starts
    },
  });
});`,

  'GSAP ScrollTrigger': `import { ScrollTrigger } from 'gsap/all';

gsap.registerPlugin(ScrollTrigger);

const scrollRef = useRef<HTMLDivElement>(null);
// These demos scroll inside the folder window, not the page, so the
// trigger has to be pointed at that element instead of the default
// window — otherwise it watches a viewport that never moves.
const scroller = useContext(ScrollerContext);

useGSAP(
  () => {
    const container = scrollRef.current;
    if (!container) return;

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
          start: 'bottom bottom', // box bottom hits viewport bottom
          end: 'top 20%',         // box top hits 20% from the top
          scrub: true,            // ties progress to scroll position
        },
        ease: 'power1.inOut',
      });
    });
  },
  { scope: scrollRef, dependencies: [scroller] }
);`,

  'GSAP Text': `useGSAP(() => {
  gsap.to('#text', {
    ease: 'power1.inOut',
    opacity: 1,
    y: 0,
  });

  gsap.fromTo(
    '.para',
    {
      opacity: 0,
      y: 20,
    },
    {
      ease: 'power1.inOut',
      opacity: 1,
      y: 0,
      delay: 1,
      stagger: 0.1,
    }
  );
});`,
};
