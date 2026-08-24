'use client';
import React from 'react';
import HoverEffect from './HoverEffect';
import DragAble from './DragAble';
import { motion } from 'motion/react';

function FolderButton({
  className,
  name,
  onclick = () => {},
}: {
  children?: React.ReactNode;
  className?: string;
  name: string;
  onclick?: () => void;
}) {
  return (
    <DragAble className={className}>
      <HoverEffect onclick={onclick}>
        <div className="group relative z-20">
          <motion.div className='relative h-21 w-25 rounded-tr-xl rounded-b-xl bg-[#03596E] before:content-[""] after:absolute after:-top-3.5 after:left-0 after:z-0 after:h-4 after:w-15 after:rounded-tl-xl after:rounded-tr-2xl after:bg-[#03596E] after:content-[""]'>
            <div className="absolute -top-1 left-2 z-10 h-21 w-20 origin-bottom-left rounded-xl bg-white shadow-[-5px_-5px_5px_rgba(255,255,255,0.1)] transition-all group-hover:-top-4 group-hover:-rotate-7"></div>
            <div className="absolute top-0 left-3 z-20 h-16 w-20 rotate-10 rounded-xl bg-white shadow-[-5px_-5px_10px_rgba(0,0,0,0.15)] transition-all group-hover:-top-3 group-hover:-rotate-2"></div>
            <div className="absolute top-1 left-4 z-30 h-15 w-20 rotate-20 rounded-xl bg-white shadow-[-5px_-5px_10px_rgba(0,0,0,0.15)] transition-all group-hover:top-0 group-hover:left-5 group-hover:rotate-5"></div>
          </motion.div>

          <div className="bg-accent-soft absolute bottom-0 left-0 z-50 h-18 w-25 origin-bottom rotate-6 -skew-6 rounded-xl rounded-br-xl"></div>
        </div>
        <p className="mt-1 font-serif">{name}</p>
      </HoverEffect>
    </DragAble>
  );
}

export default FolderButton;
