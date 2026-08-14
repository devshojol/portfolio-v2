import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import Marquee from "@/components/sections/Marquee";
import About from "@/components/sections/About";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import { profile, projects, siteUrl, socials } from "@/lib/data";

const PERSON_ID = `${siteUrl}/#person`;
const WEBSITE_ID = `${siteUrl}/#website`;
const skills = ["React", "React Native", "Next.js", "TypeScript", "Node.js", "MongoDB"];

/**
 * One linked @graph rather than several loose objects, so Google resolves the
 * person, the site and the apps as the same set of entities.
 */
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: profile.name,
      givenName: profile.firstName,
      jobTitle: profile.role,
      description: profile.summary,
      url: siteUrl,
      email: `mailto:${profile.email}`,
      telephone: profile.phoneHref,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Dhaka",
        addressCountry: "BD",
      },
      sameAs: socials.filter((s) => s.href.startsWith("http")).map((s) => s.href),
      knowsAbout: skills,
      worksFor: { "@type": "Organization", name: "WebAppick" },
      hasOccupation: {
        "@type": "Occupation",
        name: profile.role,
        occupationLocation: { "@type": "City", name: "Dhaka" },
        skills,
      },
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: siteUrl,
      name: `${profile.name} — ${profile.role}`,
      description: profile.summary,
      inLanguage: "en",
      publisher: { "@id": PERSON_ID },
    },
    {
      "@type": "ProfilePage",
      "@id": `${siteUrl}/#webpage`,
      url: siteUrl,
      name: `${profile.name} — ${profile.role}`,
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": PERSON_ID },
      mainEntity: { "@id": PERSON_ID },
      inLanguage: "en",
    },
    ...projects.map((p) => ({
      "@type": "MobileApplication",
      name: p.name,
      description: p.blurb,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Android, iOS",
      // "contributor", not "author": these were team builds.
      contributor: { "@id": PERSON_ID },
      // Only real store pages — one Play Store link is a search query rather
      // than a canonical app URL, so it must not be asserted as the app's own.
      sameAs: p.links
        .filter((l) => !l.href.includes("/search"))
        .map((l) => l.href),
    })),
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
