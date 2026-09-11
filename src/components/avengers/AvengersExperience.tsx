'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CLIPS } from './config';
import { useVideoPreload } from './useVideoPreload';
import { gsap, ScrollTrigger } from './choreography';
import AssembleLoader from './AssembleLoader';
import VideoStage, { type StageHandle } from './VideoStage';
import Hud from './Hud';
import AvHero from './sections/AvHero';
import AvAbout from './sections/AvAbout';
import AvExperience from './sections/AvExperience';
import AvProjects from './sections/AvProjects';
import AvSkills from './sections/AvSkills';
import AvComms from './sections/AvComms';
import AvOutro from './sections/AvOutro';

/**
 * Route shell for /avengers.
 *
 * Order of events: every clip is pulled into memory behind the loading screen,
 * the screen closes to a letterbox band once `loading.mp4` finishes, and from
 * then on the page is one long scroll with the footage running underneath it —
 * `hero.mp4` over the opening section, `all_section.mp4` over everything after.
 *
 * Cinema mode inverts that: the clips play at their own pace with the sound up
 * and the page is scrolled to follow them.
 */
export default function AvengersExperience() {
  const { progress, sources } = useVideoPreload({ hero: CLIPS.hero, all: CLIPS.all });
  const stage = useRef<StageHandle>(null);
  const [started, setStarted] = useState(false);
  const [cinema, setCinema] = useState(false);
  const [soundBlocked, setSoundBlocked] = useState(false);

  /* Nobody scrolls past the loading screen, and a reload must not restore a
     mid-page offset the footage hasn't caught up to. */
  useEffect(() => {
    if (started) return;
    const html = document.documentElement;
    const previous = html.style.overflow;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    html.style.overflow = 'hidden';
    return () => {
      html.style.overflow = previous;
    };
  }, [started]);

  useEffect(
    () => () => {
      if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
    },
    []
  );

  /* Every trigger was measured while the document was locked, i.e. with no
     scrollable distance at all. Re-measure once the lock is off — a frame
     later, so the restored overflow has been laid out. */
  useEffect(() => {
    if (!started) return;
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(raf);
  }, [started]);

  /* Lenis drives scrolling from its own rAF loop, so ScrollTrigger is updated
     on the GSAP ticker instead of waiting for native scroll events. */
  useEffect(() => {
    const tick = () => ScrollTrigger.update();
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, []);

  /* Escape is the way out of a playing cut. */
  useEffect(() => {
    if (!cinema) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCinema(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cinema]);

  const endCinema = useCallback(() => setCinema(false), []);
  const blockSound = useCallback(() => setSoundBlocked(true), []);

  const toggleCinema = useCallback(() => {
    setSoundBlocked(false);
    /* Armed here in the click handler itself rather than in a state updater or
       the effect that starts playback: both of those run after the gesture is
       over, and a browser only grants audible playback to an element it saw
       played during one. */
    if (!cinema) stage.current?.armSound();
    setCinema(!cinema);
  }, [cinema]);

  const enableSound = useCallback(() => {
    stage.current?.enableSound();
    setSoundBlocked(false);
  }, []);

  return (
    <div className="av relative bg-[#04070a]">
      <VideoStage
        ref={stage}
        heroSrc={sources?.hero}
        allSrc={sources?.all}
        cinema={cinema}
        onCinemaEnd={endCinema}
        onSoundBlocked={blockSound}
      />

      <div className="relative z-10">
        <AvHero started={started} />

        <div id="av-story">
          <AvAbout />
          <AvExperience />
          <AvProjects />
          <AvSkills />
          <AvComms />
          <AvOutro />
        </div>
      </div>

      <Hud
        visible={started}
        cinema={cinema}
        soundBlocked={soundBlocked}
        onToggleCinema={toggleCinema}
        onEnableSound={enableSound}
      />

      {!started && (
        <AssembleLoader
          progress={progress}
          ready={Boolean(sources)}
          onComplete={() => setStarted(true)}
        />
      )}
    </div>
  );
}
