'use client';

import { cn } from '@/utils/cn';
import { motion } from 'motion/react';

function HoverEffect({
  children,
  className,
  onclick,
}: {
  children: React.ReactNode;
  className?: string;
  onclick?: () => void;
}) {
  return (
    <motion.button
      onClick={onclick}
      whileHover={{ rotate: 2.5 }}
      transition={{ ease: 'easeInOut' }}
      className={cn('origin-top-left', className)}
    >
      {children}
    </motion.button>
  );
}

export default HoverEffect;
