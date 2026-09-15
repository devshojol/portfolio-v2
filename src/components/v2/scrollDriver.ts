/**
 * One rAF loop for every scroll-driven effect on the page.
 *
 * These effects can't be driven from the `scroll` event: Lenis runs the page
 * from its own frame loop and emits only a handful of native scroll events per
 * gesture, so anything listening for them steps instead of tracking. Each
 * effect having its own rAF loop works but stacks up; this keeps it to one,
 * and stops entirely when the last subscriber leaves.
 */
type Sub = () => void;

const subs = new Set<Sub>();
let frame = 0;

function tick() {
  frame = 0;
  for (const sub of subs) sub();
  if (subs.size) frame = requestAnimationFrame(tick);
}

/** Calls `fn` once immediately, then once per frame until unsubscribed. */
export function onFrame(fn: Sub) {
  fn();
  subs.add(fn);
  if (!frame) frame = requestAnimationFrame(tick);
  return () => {
    subs.delete(fn);
  };
}

/** Clamp to 0..1. */
export const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
