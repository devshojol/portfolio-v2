"use client";

import { useSyncExternalStore } from "react";

function subscribeTo(query: string) {
  return (onChange: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  };
}

const REDUCED = "(prefers-reduced-motion: reduce)";
const FINE_POINTER = "(pointer: fine)";
/**
 * Where the WebGL hero is affordable. Phones and tablets pay for it in
 * main-thread time they don't have — a mid-range Android spends tens of
 * seconds on the starfield, postprocessing and shader compilation.
 */
const CAN_RENDER_SCENE = "(min-width: 1024px) and (pointer: fine)";

const subReduced = subscribeTo(REDUCED);
const subPointer = subscribeTo(FINE_POINTER);
const subScene = subscribeTo(CAN_RENDER_SCENE);

/** True when the visitor has asked for reduced motion. */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subReduced,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );
}

/** True on devices with a precise pointer (mouse / trackpad). */
export function useHasFinePointer() {
  return useSyncExternalStore(
    subPointer,
    () => window.matchMedia(FINE_POINTER).matches,
    () => false,
  );
}

/**
 * True only on large, pointer-driven screens. Returns false during SSR and on
 * the first client render, so the three.js chunk is never even requested on
 * phones — the dynamic import only fires once this flips true.
 */
export function useCanRenderScene() {
  return useSyncExternalStore(
    subScene,
    () => window.matchMedia(CAN_RENDER_SCENE).matches,
    () => false,
  );
}
