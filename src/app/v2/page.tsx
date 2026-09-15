import type { Metadata } from 'next';
import './v2.css';
import Hero from '@/components/v2/Hero';
import About from '@/components/v2/About';
import Works from '@/components/v2/Works';
import Skills from '@/components/v2/Skills';
import Contact from '@/components/v2/Contact';
import SlantFloor from '@/components/v2/SlantFloor';
import { profile } from '@/lib/data';

export const metadata: Metadata = {
  title: 'v2',
  description: profile.summary,
  alternates: { canonical: '/v2' },
  // One canonical portfolio in search results; v2 is an alternate cut.
  robots: { index: false, follow: true },
};

export default function V2Page() {
  // Rendered on the server so the `© year` markers can't hydrate-mismatch.
  const year = new Date().getFullYear();

  return (
    // No `overflow-x` here: it would turn this element into a scroll container
    // and every `position: sticky` inside would pin to a port that never
    // scrolls. The pieces that can bleed sideways clip themselves.
    <main className="v2 relative w-full">
      {/* Everything above the footer travels as one z-10 layer, so it covers
          the pinned contact panel until it slides up off it. Grouping the hero
          in here also bounds the hero's own sticky range to this block. */}
      {/* The diagonal cut belongs on the outer block, not on About+Works: the
          pinned hero is held inside this box too, and a clip one level down
          would let the hero's last few pixels show through under the wedge at
          the very end of the page. */}
      <SlantFloor className="relative z-10">
        <Hero />
        <div className="relative z-10">
          <About year={year} />
          <Works year={year} />
          <Skills year={year} />
        </div>
      </SlantFloor>
      <Contact />
    </main>
  );
}
