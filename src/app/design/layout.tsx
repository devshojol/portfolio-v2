import type { Metadata } from 'next';
import { profile } from '@/lib/data';

/**
 * `/design` is a client component, so its metadata has to live here. Without
 * it the route would inherit the root layout's `canonical: "/"` and tell
 * Google the lab and the homepage are the same URL — metadata is shallow
 * merged down the segments, so anything a route doesn't set, it inherits.
 */
const description =
  'Interaction experiments by Shojol Islam — an aurora backdrop, draggable folder windows, GSAP timelines and three.js set pieces, built while learning the tools.';

export const metadata: Metadata = {
  title: 'Design Lab',
  description,
  alternates: { canonical: '/design' },
  openGraph: {
    type: 'website',
    url: '/design',
    title: `Design Lab · ${profile.name}`,
    description,
    siteName: profile.name,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Design Lab · ${profile.name}`,
    description,
  },
};

export default function DesignLayout({ children }: { children: React.ReactNode }) {
  return children;
}
