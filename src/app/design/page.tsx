import React from 'react';
import HoverEffect from '@/components/design/HoverEffect';
import DragAble from '@/components/design/DragAble';
import FolderButton from '@/components/design/FolderButton';
import AnalogClock from '@/components/design/AnalogClock';
import EyesCursor from '@/components/design/EyesCursor';

function page() {
  return (
    <main>
      <nav className="flex items-center justify-between px-10 py-8">
        <div className="flex items-center justify-center gap-8">
          <EyesCursor eyeSize={20} irisSize={9} gap={10} />
          <p className="font-mono text-xl font-bold">SHOJOL ISLAM</p>
        </div>
      </nav>
      <div className="flex h-screen w-full items-center justify-center gap-10 p-2">
        <DragAble>
          <HoverEffect>
            <div className="b h-40 w-40 rounded-xl border bg-gray-600 p-2"></div>
          </HoverEffect>
        </DragAble>
        <FolderButton name="Folder 1" />
        <AnalogClock size={120} showDigital={false} smooth={false} />
      </div>
    </main>
  );
}

export default page;
