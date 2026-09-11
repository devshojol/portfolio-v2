'use client';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ScrollTrigger from 'gsap/ScrollTrigger';
import SplitText from 'gsap/SplitText';

/* Registration is idempotent, so doing it at module scope is safe even though
   several components import from here. */
if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);
}

export { gsap, useGSAP, ScrollTrigger, SplitText };
