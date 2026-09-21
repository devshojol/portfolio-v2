import type { Metadata } from 'next';
import './v2.css';
import Hero from '@/components/v2/Hero';
import About from '@/components/v2/About';
import Works from '@/components/v2/Works';
import Skills from '@/components/v2/Skills';
import Contact from '@/components/v2/Contact';
import SlantFloor from '@/components/v2/SlantFloor';
import ThemeFab from '@/components/v2/ThemeFab';
import { profile, projects, siteUrl, socials } from '@/lib/data';

const PERSON_ID = `${siteUrl}/#person`;
const WEBSITE_ID = `${siteUrl}/#website`;
const skills = ['React', 'React Native', 'Next.js', 'TypeScript', 'Node.js', 'MongoDB'];

/**
 * One linked @graph rather than several loose objects, so Google resolves the
 * person, the site and the apps as the same set of entities.
 */
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': PERSON_ID,
      name: profile.name,
      givenName: profile.firstName,
      jobTitle: profile.role,
      description: profile.summary,
      url: siteUrl,
      email: `mailto:${profile.email}`,
      telephone: profile.phoneHref,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Dhaka',
        addressCountry: 'BD',
      },
      sameAs: socials.filter((s) => s.href.startsWith('http')).map((s) => s.href),
      knowsAbout: skills,
      worksFor: { '@type': 'Organization', name: 'WebAppick' },
      hasOccupation: {
        '@type': 'Occupation',
        name: profile.role,
        occupationLocation: { '@type': 'City', name: 'Dhaka' },
        skills,
      },
    },
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: siteUrl,
      name: `${profile.name} — ${profile.role}`,
      description: profile.summary,
      inLanguage: 'en',
      publisher: { '@id': PERSON_ID },
    },
    {
      '@type': 'ProfilePage',
      '@id': `${siteUrl}/#webpage`,
      url: siteUrl,
      name: `${profile.name} — ${profile.role}`,
      isPartOf: { '@id': WEBSITE_ID },
      about: { '@id': PERSON_ID },
      mainEntity: { '@id': PERSON_ID },
      inLanguage: 'en',
    },
    ...projects.map((p) => ({
      '@type': 'MobileApplication',
      name: p.name,
      description: p.blurb,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Android, iOS',
      // 'contributor', not 'author': these were team builds.
      contributor: { '@id': PERSON_ID },
      // Only real store pages — one Play Store link is a search query rather
      // than a canonical app URL, so it must not be asserted as the app's own.
      sameAs: p.links.filter((l) => !l.href.includes('/search')).map((l) => l.href),
    })),
  ],
};

export const metadata: Metadata = {
  description: profile.summary,
  alternates: { canonical: '/' },
};

export default function V2Page() {
  // Rendered on the server so the `© year` markers can't hydrate-mismatch.
  const year = new Date().getFullYear();

  return (
    // No `overflow-x` here: it would turn this element into a scroll container
    // and every `position: sticky` inside would pin to a port that never
    // scrolls. The pieces that can bleed sideways clip themselves.
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
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
        <ThemeFab />
      </main>
    </>
  );
}
