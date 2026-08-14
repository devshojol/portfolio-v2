/**
 * Small deterministic PRNG (Lehmer / Park–Miller).
 * Defined at module scope so scenes generate identical geometry on every
 * render — no `Math.random()` during render, no SSR/CSR drift.
 */
export function createRng(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;

  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}
