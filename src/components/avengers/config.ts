/**
 * Shared constants for the /avengers route.
 *
 * The three clips are pre-encoded all-intra (every frame a keyframe) with the
 * moov atom up front, which is what makes seeking them per scroll-tick cheap
 * enough to scrub. Don't re-encode them with a normal GOP or the scrubbing
 * will turn to mush.
 */

export const CLIPS = {
  loading: { url: '/loading.mp4', bytes: 1_996_966, duration: 3.7 },
  hero: { url: '/hero.mp4', bytes: 6_859_134, duration: 9.233 },
  all: { url: '/all_section.mp4', bytes: 40_686_117, duration: 55.433 },
} as const;

/** Section rail — id drives the anchor, the scroll spy and the HUD readout. */
export const SECTIONS = [
  { id: 'assemble', file: '00', label: 'Assemble' },
  { id: 'operative', file: '01', label: 'Operative' },
  { id: 'field-record', file: '02', label: 'Field record' },
  { id: 'deployments', file: '03', label: 'Deployments' },
  { id: 'arsenal', file: '04', label: 'Arsenal' },
  { id: 'comms', file: '05', label: 'Comms' },
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];
