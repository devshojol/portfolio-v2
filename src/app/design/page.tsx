import React from 'react';
import HoverEffect from '@/components/design/HoverEffect';
import DragAble from '@/components/design/DragAble';
import FolderButton from '@/components/design/FolderButton';

function page() {
  return (
    <div className="p-2 h-screen w-full flex items-center justify-center gap-10">
      <DragAble>
        <HoverEffect>
          <div className="rounded-xl bg-gray-600 border p-2 b w-40 h-40"></div>
        </HoverEffect>
      </DragAble>
      <FolderButton name="Folder 1" />
    </div>
  );
}

export default page;
