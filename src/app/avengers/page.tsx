import type { Metadata } from 'next';
import './avengers.css';
import AvengersExperience from '@/components/avengers/AvengersExperience';

/* Standalone experiment — deliberately kept out of the index and the sitemap. */
export const metadata: Metadata = {
  title: 'Avengers Protocol',
  description:
    'A scroll-driven cut of the Shojol Islam portfolio, played against muted footage from The Avengers.',
  robots: { index: false, follow: false },
};

export default function AvengersPage() {
  return <AvengersExperience />;
}
