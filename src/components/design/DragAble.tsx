'use client';
import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/utils/cn';

function DragAble({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div drag dragMomentum={false} className={cn(className)}>
      {children}
    </motion.div>
  );
}

export default DragAble;
