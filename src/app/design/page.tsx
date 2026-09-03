'use client';

import FolderButton from '@/components/design/FolderButton';
import AnalogClock from '@/components/design/AnalogClock';

import Navbar from '@/components/design/Navbar';
import AuroraGradient from '@/components/design/AuroraGradient';
import DesignCursor from '@/components/design/DesignCursor';
import ProfileCard from '@/components/design/ProfileCard';
import Projects from '@/components/design/Projects';
import Fun from '@/components/design/Fun';
import Office from '@/components/design/Office/Office';
import GsapAnimation from '@/components/design/GsapAnimation';

function Design() {
  return (
    <main className="cursor-hidden relative h-full max-h-screen min-h-screen w-full overflow-hidden">
      <AuroraGradient />
      {/* <MeshGradient /> */}
      {/* <MountainBackdrop /> */}
      <DesignCursor />

      <Navbar />

      <div className="flex justify-end px-10 md:px-20">
        <AnalogClock size={120} showDigital={false} smooth={false} />
      </div>

      <FolderButton className="absolute top-100 left-100 z-10" name="Projects">
        <Projects />
      </FolderButton>
      <FolderButton className="absolute bottom-50 left-100 z-10" name="Fun">
        {<Fun />}
      </FolderButton>
      <FolderButton className="absolute right-100 bottom-50 z-10" name="Office Explore">
        <Office />
      </FolderButton>
      <FolderButton className="absolute top-100 right-100 z-10" name="GSAP Animations">
        <GsapAnimation />
      </FolderButton>
      <ProfileCard />
    </main>
  );
}

export default Design;
