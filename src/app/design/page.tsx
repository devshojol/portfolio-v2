import React from 'react';
import FolderButton from '@/components/design/FolderButton';
import AnalogClock from '@/components/design/AnalogClock';

import Navbar from '@/components/design/Navbar';
import MountainBackdrop from '@/components/design/MountainBackdrop';
import DesignCursor from '@/components/design/DesignCursor';
import ProfileCard from '@/components/design/ProfileCard';

function page() {
  return (
    <main className="relative h-full max-h-screen min-h-screen w-full cursor-none! overflow-hidden">
      <MountainBackdrop />
      <DesignCursor />

      <Navbar />

      <div className="flex justify-end px-10 md:px-20">
        <AnalogClock size={120} showDigital={false} smooth={false} />
      </div>

      <FolderButton className="absolute top-100 left-100 z-10" name="Folder 1" />
      <ProfileCard />
    </main>
  );
}

export default page;
