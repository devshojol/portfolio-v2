'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/cn';
import Eye from './Eye';

function EyesCursor({
  className,
  eyeSize = 34,
  irisSize = 14,
  gap = 10,
}: {
  className?: string;
  eyeSize?: number;
  irisSize?: number;
  gap?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const irisRefs = useRef<(HTMLDivElement | null)[]>([null, null]);
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      const maxDistance = eyeSize / 2 - irisSize / 2 - 3;

      const irisX = Math.cos(angle) * maxDistance;
      const irisY = Math.sin(angle) * maxDistance;

      irisRefs.current.forEach((iris) => {
        if (iris) iris.style.transform = `translate(${irisX}px, ${irisY}px)`;
      });
    };

    const handleClick = () => {
      setBlinking(true);
      window.setTimeout(() => setBlinking(false), 160);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, [eyeSize, irisSize]);

  return (
    <div
      className="from-line-strong to-line inline-flex items-center rounded-full bg-gradient-to-b p-[2px]"
      style={{ boxShadow: '0 0 14px -2px var(--color-accent)' }}
    >
      <div
        ref={containerRef}
        className={cn('flex items-center rounded-full px-3.5 py-2.5', className)}
        style={{
          gap,
          background:
            'radial-gradient(circle at 50% 20%, var(--color-elevated), var(--color-surface) 70%)',
        }}
      >
        <Eye
          size={eyeSize}
          irisSize={irisSize}
          blinking={blinking}
          irisRef={(el) => {
            irisRefs.current[0] = el;
          }}
        />
        <Eye
          size={eyeSize}
          irisSize={irisSize}
          blinking={blinking}
          irisRef={(el) => {
            irisRefs.current[1] = el;
          }}
        />
      </div>
    </div>
  );
}

export default EyesCursor;
