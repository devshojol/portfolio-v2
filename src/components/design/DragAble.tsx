'use client';
import React from 'react';
import { motion } from 'motion/react';

function DragAble({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div drag dragMomentum={false} className={className}>
      {children}
    </motion.div>
  );
}

export default DragAble;
