import Nav from '@/components/sections/Nav';
import Hero from '@/components/sections/Hero';
import Marquee from '@/components/sections/Marquee';
import About from '@/components/sections/About';
import Experience from '@/components/sections/Experience';
import Projects from '@/components/sections/Projects';
import Skills from '@/components/sections/Skills';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/sections/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import type { Metadata } from 'next';

/**
 * The previous homepage, kept reachable at /v1. Left out of search so the site
 * still has a single canonical portfolio — the same reason /v2 carried this
 * while it was the alternate.
 */
export const metadata: Metadata = {
  alternates: { canonical: '/v1' },
  robots: { index: false, follow: true },
};

export default function Home() {
  return (
    <>
      <ScrollProgress />
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
