'use client';
import React, { useId, useState } from 'react';
import HoverEffect from './HoverEffect';
import DragAble from './DragAble';
import FolderWindow from './FolderWindow';
import { motion } from 'motion/react';

function FolderButton({
  className,
  name,
  onclick = () => {},
  children,
}: {
  /** Rendered as the whole body of this folder's window. */
  children?: React.ReactNode;
  className?: string;
  name: string;
  onclick?: () => void;
}) {
  const [open, setOpen] = useState(false);
  // Ties this folder to its window so Motion morphs one into the other.
  const layoutId = `folder-window-${useId()}`;

  return (
    <>
      <DragAble className={className}>
        <HoverEffect
          onclick={() => {
            setOpen(true);
            onclick();
          }}
        >
          {/* The folder unmounts while the window is up — that hand-off is what
              makes the shared layout animation read as one object growing.
              A same-size spacer keeps the label from jumping in its place. */}
          {open ? (
            <div className="h-21 w-25" aria-hidden />
          ) : (
            <motion.div layoutId={layoutId} className="group relative z-20">
              <motion.div className='relative h-21 w-25 rounded-tr-xl rounded-b-xl bg-[#03596E] before:content-[""] after:absolute after:-top-3.5 after:left-0 after:z-0 after:h-4 after:w-15 after:rounded-tl-xl after:rounded-tr-2xl after:bg-[#03596E] after:content-[""]'>
                <div className="absolute -top-1 left-2 z-10 h-21 w-20 origin-bottom-left rounded-xl bg-white shadow-[-5px_-5px_5px_rgba(255,255,255,0.1)] transition-all group-hover:-top-4 group-hover:-rotate-7"></div>
                <div className="absolute top-0 left-3 z-20 h-16 w-20 rotate-10 rounded-xl bg-white shadow-[-5px_-5px_10px_rgba(0,0,0,0.15)] transition-all group-hover:-top-3 group-hover:-rotate-2"></div>
                <div className="absolute top-1 left-4 z-30 h-15 w-20 rotate-20 rounded-xl bg-white shadow-[-5px_-5px_10px_rgba(0,0,0,0.15)] transition-all group-hover:top-0 group-hover:left-5 group-hover:rotate-5"></div>
              </motion.div>

              <div className="bg-accent-soft absolute bottom-0 left-0 z-50 h-18 w-25 origin-bottom rotate-6 -skew-6 rounded-xl rounded-br-xl"></div>
            </motion.div>
          )}
          <p className="mt-1 font-serif">{name}</p>
        </HoverEffect>
      </DragAble>

      {/* Sibling of the button on purpose: portalled children still bubble
          events up the React tree, so nesting this inside HoverEffect would
          make every click in the window re-trigger the folder. */}
      <FolderWindow open={open} onClose={() => setOpen(false)} name={name} layoutId={layoutId}>
        {children}
      </FolderWindow>
    </>
  );
}

export default FolderButton;
