import React from 'react';
import HoverEffect from '@/components/design/HoverEffect';
import DragAble from '@/components/design/DragAble';
import FolderButton from '@/components/design/FolderButton';
import AnalogClock from '@/components/design/AnalogClock';
import EyesCursor from '@/components/design/EyesCursor';

function page() {
  return (
    <main>
      <div className="flex h-screen w-full items-center justify-center gap-10 p-2">
        <DragAble>
          <HoverEffect>
            <div className="b h-40 w-40 rounded-xl border bg-gray-600 p-2"></div>
          </HoverEffect>
        </DragAble>
        <FolderButton name="Folder 1" />
        <AnalogClock size={120} showDigital={false} smooth={false} />

        <EyesCursor eyeSize={20} irisSize={9} gap={10} />
      </div>
    </main>
  );
}

export default page;
