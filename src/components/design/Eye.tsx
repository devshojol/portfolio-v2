import React from 'react';

function Eye({
  size,
  irisSize,
  blinking,
  irisRef,
}: {
  size: number;
  irisSize: number;
  blinking: boolean;
  irisRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-full bg-white"
      style={{
        width: size,
        height: size,
        boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.3)',
      }}
    >
      {/* Center point */}
      <div
        className="absolute top-1/2 left-1/2"
        style={{
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Moving iris */}
        <div
          ref={irisRef}
          className="bg-night relative rounded-full"
          style={{
            width: irisSize,
            height: irisSize,
            transition: 'transform 0.08s ease-out',
          }}
        >
          {/* Eye highlight */}
          <div
            className="bg-accent absolute rounded-full"
            style={{
              width: irisSize * 0.34,
              height: irisSize * 0.34,
              top: '18%',
              right: '18%',
              boxShadow: '0 0 3px var(--color-accent)',
            }}
          />
        </div>
      </div>

      {/* Top eyelid */}
      <div
        className="absolute inset-x-0 top-0 z-10 h-1/2 transition-transform duration-150 ease-in"
        style={{
          background: 'var(--color-elevated)',
          boxShadow: blinking ? 'inset 0 -3px 3px -2px rgba(0,0,0,0.5)' : undefined,
          transform: blinking ? 'translateY(0)' : 'translateY(-100%)',
        }}
      />

      {/* Bottom eyelid */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 h-1/2 transition-transform duration-150 ease-in"
        style={{
          background: 'var(--color-elevated)',
          boxShadow: blinking ? 'inset 0 3px 3px -2px rgba(0,0,0,0.5)' : undefined,
          transform: blinking ? 'translateY(0)' : 'translateY(100%)',
        }}
      />
    </div>
  );
}

export default Eye;
