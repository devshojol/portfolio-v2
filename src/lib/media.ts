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

const subReduced = subscribeTo(REDUCED);
const subPointer = subscribeTo(FINE_POINTER);

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
