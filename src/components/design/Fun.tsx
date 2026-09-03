'use client';

import { Canvas } from '@react-three/fiber';
import { useEffect, useState } from 'react';

import LaptopAnimation from './LaptopAnimation';

function Fun() {
  const [showModel, setShowModel] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowModel(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-full w-full flex-col">
      <h2 className="animate-shimmer absolute top-10 left-1/2 -translate-x-1/2 bg-[linear-gradient(100deg,var(--color-ink-faint)_0%,#ffffff_18%,var(--color-accent-soft)_32%,var(--color-accent)_46%,#ffffff_60%,var(--color-indigo)_78%,var(--color-ink-faint)_100%)] bg-[length:200%_100%] bg-clip-text pt-8 text-center text-3xl font-semibold tracking-tight text-transparent sm:pt-12 sm:text-5xl md:text-6xl">
        MacBook Pro
      </h2>

      <div className="min-h-0 flex-1">
        {showModel && (
          <Canvas camera={{ fov: 12, position: [0, -10, 220] }} resize={{ offsetSize: true }}>
            <LaptopAnimation />
          </Canvas>
        )}
      </div>
    </div>
  );
}

export default Fun;
