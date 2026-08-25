import React from 'react';
import FolderButton from '@/components/design/FolderButton';
import AnalogClock from '@/components/design/AnalogClock';

import Navbar from '@/components/design/Navbar';
import AuroraGradient from '@/components/design/AuroraGradient';
import DesignCursor from '@/components/design/DesignCursor';
import ProfileCard from '@/components/design/ProfileCard';

function page() {
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

      <FolderButton className="absolute top-100 left-100 z-10" name="Folder 1" />
      <ProfileCard />
    </main>
  );
}

export default page;
