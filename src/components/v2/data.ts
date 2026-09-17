/**
 * Content for the /v2 layout. Everything personal is re-exported from
 * `@/lib/data` so the two pages can never drift; only the copy that exists
 * purely to serve this layout (statement lines, card categories, doodles)
 * lives here.
 */
import { profile, projects, skillGroups } from '@/lib/data';

export type NavLink = { label: string; href: string; external?: boolean };

export const navLinks: NavLink[] = [
  { label: 'Home', href: '#v2-home' },
  { label: 'Works', href: '#v2-works' },
  { label: 'Resume', href: profile.resumeUrl, external: true },
  { label: 'Contact', href: '#v2-contact' },
];

/** Uppercased for the hero wordmark and the closing lockup. */
export const wordmark = profile.firstName.toUpperCase();

/**
 * The same wordmark broken in half. On a phone the single line only fills a
 * shallow band and leaves the hero looking empty; stacked, it fills the lower
 * half the way the reference's does.
 */
export const wordmarkLines = [
  wordmark.slice(0, Math.ceil(wordmark.length / 2)),
  wordmark.slice(Math.ceil(wordmark.length / 2)),
] as const;

export const statement =
  'Building interfaces with care and curiosity. React on the web, React Native on mobile, and whatever it takes in between to make a screen feel obvious';

export const bio =
  "I'm Shojol, a frontend developer in Dhaka focusing on React, React Native and the Express/MongoDB layer underneath. Two of my apps are live on the Play Store and App Store. I care about interfaces that feel obvious, tested before they ship so release day stays boring.";

export const keywords = ['Cross-platform', 'Test-first', 'TypeScript', 'Curious'] as const;

export type Work = {
  id: string;
  name: string;
  category: string;
  year: string;
  image: string;
  href: string;
};

/**
 * Four cards, to match the reference stack. The two store apps come straight
 * from `projects`; the last two are this repo's own surfaces.
 *
 * Images in /public/v2/work are generated placeholders — drop real
 * screenshots in at the same paths and nothing here needs to change.
 */
export const works: Work[] = [
  {
    id: projects[0].id,
    name: projects[0].name,
    category: 'React Native | Expo',
    year: projects[0].year,
    image: '/v2/work/gonit.jpg',
    href: projects[0].links[1].href,
  },
  {
    id: projects[1].id,
    name: projects[1].name,
    category: 'React Native | WordPress API',
    year: projects[1].year,
    image: '/v2/work/chintu.jpg',
    href: projects[1].links[1].href,
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    category: 'Next.js | WebGL',
    year: '2025',
    image: '/v2/work/portfolio.jpg',
    href: '/',
  },
  {
    id: 'designlab',
    name: 'Design Lab',
    category: 'GSAP | Three.js',
    year: '2025',
    image: '/v2/work/designlab.jpg',
    href: '/design',
  },
];

export type SkillCluster = { id: string; label: string; items: readonly string[] };

/**
 * Three branches rather than the four groups in `skillGroups`, because the
 * diagram hangs three limbs off the hub. Testing and tooling ride together on
 * the trunk; nothing is invented or dropped.
 */
export const skillClusters: SkillCluster[] = [
  { id: 'frontend', label: 'Frontend', items: skillGroups[0].items },
  { id: 'backend', label: 'Backend', items: skillGroups[1].items },
  {
    id: 'craft',
    label: 'Testing & Tools',
    items: [...skillGroups[2].items, ...skillGroups[3].items],
  },
];
