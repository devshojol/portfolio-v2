'use client';

import { createContext } from 'react';

/**
 * The element these demos actually scroll inside.
 *
 * ScrollTrigger measures against `window` by default, which is wrong here —
 * the demos live in the folder window, whose body is its own scroll
 * container. Anything using ScrollTrigger has to be handed this as its
 * `scroller`, or the triggers fire against a viewport that never moves.
 */
export const ScrollerContext = createContext<React.RefObject<HTMLElement | null> | null>(null);
