'use client';
import React from 'react';
import HoverEffect from './HoverEffect';
import { cn } from '@/utils/cn';
import DragAble from './DragAble';
import { motion } from 'motion/react';

function FolderButton({
  className,
  name,
}: {
  children?: React.ReactNode;
  className?: string;
  name: string;
}) {
  return (
    <DragAble>
      <HoverEffect>
        <div className="relative">
          <motion.div
            className={cn(
              'relative h-25 w-30 rounded-tr-xl rounded-b-xl bg-[#03596E] before:content-[""] after:absolute after:-top-4.5 after:left-0 after:h-5 after:w-15 after:rounded-tl-xl after:rounded-tr-2xl after:bg-[#03596E] after:content-[""]',
              className
            )}
          ></motion.div>

          <div className="bg-accent-soft absolute bottom-0 z-20 h-21 w-30 origin-bottom rotate-6 -skew-6 rounded-t-xl rounded-br-xl"></div>
          {/*
          <div className="bg-accent-soft absolute bottom-0 z-20 h-20 w-34 rounded-br-xl [--p:20px] [clip-path:polygon(var(--p)_0,100%_0,calc(100%-var(--p))_100%,0_100%)]"></div>*/}
        </div>
        <p>{name}</p>
      </HoverEffect>
    </DragAble>
  );
}

export default FolderButton;
