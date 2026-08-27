'use client';

import React, { useEffect, useState } from 'react';
import FolderButton from '@/components/design/FolderButton';
import AnalogClock from '@/components/design/AnalogClock';

import Navbar from '@/components/design/Navbar';
import AuroraGradient from '@/components/design/AuroraGradient';
import DesignCursor from '@/components/design/DesignCursor';
import ProfileCard from '@/components/design/ProfileCard';
import Projects from '@/components/design/Projects';
import Fun from '@/components/design/Fun';

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
      <ProfileCard />
    </main>
  );
}

export default Design;
