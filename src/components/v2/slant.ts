/**
 * Shared geometry for the two diagonal edges of the dark block.
 *
 * Measured off the reference, which skews its dark panel on the Y axis and
 * ramps the angle with scroll rather than cutting a fixed wedge: the factor
 * climbs linearly from 0 to about 0.12 (≈7°) and then holds.
 */

/** End state: the edge rises this fraction of the viewport width. */
export const MAX_TAN = 0.12;

/** Ramp length for the top wedge, as a multiple of the viewport height. */
export const RAMP = 1.05;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
