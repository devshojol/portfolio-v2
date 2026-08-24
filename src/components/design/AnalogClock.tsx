'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/cn';
import { motion } from 'motion/react';
import DragAble from './DragAble';

const TICKS = Array.from({ length: 60 }, (_, i) => i);

const NUMERALS: { n: string; style: React.CSSProperties }[] = [
  { n: '12', style: { top: '9%', left: '50%', transform: 'translateX(-50%)' } },
  { n: '3', style: { top: '50%', right: '9%', transform: 'translateY(-50%)' } },
  { n: '6', style: { bottom: '9%', left: '50%', transform: 'translateX(-50%)' } },
  { n: '9', style: { top: '50%', left: '9%', transform: 'translateY(-50%)' } },
];

const pad = (n: number) => n.toString().padStart(2, '0');

function AnalogClock({
  className,
  size = 220,
  smooth = true,
  showDigital = true,
}: {
  className?: string;
  /** Diameter in px — every part of the dial scales from this. */
  size?: number;
  /** Sweeping second hand (rAF) vs. a discrete one-second step. */
  smooth?: boolean;
  showDigital?: boolean;
}) {
  const hour = useRef<HTMLDivElement>(null);
  const minute = useRef<HTMLDivElement>(null);
  const second = useRef<HTMLDivElement>(null);
  const digital = useRef<HTMLTimeElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Undefined locale/timeZone => whatever the visitor's device is set to.
    const format = new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });

    const tick = () => {
      const now = new Date();
      const s = now.getSeconds() + (smooth ? now.getMilliseconds() / 1000 : 0);
      const m = now.getMinutes() + s / 60;
      const h = (now.getHours() % 12) + m / 60;

      if (hour.current) hour.current.style.transform = `rotate(${h * 30}deg)`;
      if (minute.current) minute.current.style.transform = `rotate(${m * 6}deg)`;
      if (second.current) second.current.style.transform = `rotate(${s * 6}deg)`;
      if (digital.current) {
        digital.current.dateTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        digital.current.textContent = format.format(now);
      }
    };

    tick();
    setReady(true);

    if (!smooth) {
      const id = window.setInterval(tick, 1000);
      return () => window.clearInterval(id);
    }

    let frame = requestAnimationFrame(function loop() {
      tick();
      frame = requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(frame);
  }, [smooth]);

  return (
    <DragAble className={cn('flex flex-col items-center gap-3', className)}>
      {/* bezel */}
      <div
        role="img"
        aria-label="Analog clock showing local time"
        className="from-line-strong to-line relative rounded-full bg-linear-to-b"
        style={{ width: size, height: size, padding: Math.max(3, size * 0.026) }}
      >
        {/* dial */}
        <div
          className="relative h-full w-full overflow-hidden rounded-full"
          style={{
            background:
              'radial-gradient(circle at 50% 16%, var(--color-elevated), var(--color-surface) 48%, var(--color-void) 100%)',
            boxShadow: [
              'inset 0 1px 0 rgba(255,255,255,0.05)',
              `inset 0 0 ${size * 0.18}px rgba(0,0,0,0.7)`,
              `0 ${size * 0.08}px ${size * 0.2}px -${size * 0.08}px rgba(0,0,0,0.85)`,
              `0 0 ${size * 0.3}px -${size * 0.14}px var(--color-accent)`,
            ].join(', '),
          }}
        >
          {/* ticks */}
          {TICKS.map((i) => {
            const isHour = i % 5 === 0;
            const isTwelve = i === 0;
            return (
              <div
                key={i}
                className="absolute bottom-1/2 left-1/2 h-1/2 origin-bottom"
                style={{ transform: `translateX(-50%) rotate(${i * 6}deg)` }}
              >
                <div
                  className={cn(
                    'rounded-full',
                    isTwelve ? 'bg-accent' : isHour ? 'bg-ink-faint' : 'bg-line-strong'
                  )}
                  style={{
                    width: isHour ? Math.max(2, size * (isTwelve ? 0.016 : 0.012)) : 1,
                    height: size * (isHour ? 0.052 : 0.028),
                    marginTop: size * 0.042,
                    boxShadow: isTwelve ? `0 0 ${size * 0.05}px var(--color-accent)` : undefined,
                  }}
                />
              </div>
            );
          })}

          {/* numerals */}
          {NUMERALS.map(({ n, style }) => (
            <span
              key={n}
              className="text-ink-faint absolute font-mono tabular-nums"
              style={{ ...style, fontSize: Math.max(9, size * 0.07) }}
            >
              {n}
            </span>
          ))}

          {/* hands — hidden until the first client tick so they never flash at 12:00 */}
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: ready ? 1 : 0 }}
          >
            <div ref={hour} className="absolute top-1/2 left-1/2 h-0 w-0 will-change-transform">
              <div
                className="bg-ink absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
                style={{
                  width: Math.max(3, size * 0.026),
                  height: size * 0.25,
                  boxShadow: '0 0 8px rgba(0,0,0,0.65)',
                }}
              />
            </div>

            <div ref={minute} className="absolute top-1/2 left-1/2 h-0 w-0 will-change-transform">
              <div
                className="bg-ink absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
                style={{
                  width: Math.max(2, size * 0.018),
                  height: size * 0.37,
                  boxShadow: '0 0 8px rgba(0,0,0,0.65)',
                }}
              />
            </div>

            <div ref={second} className="absolute top-1/2 left-1/2 h-0 w-0 will-change-transform">
              <div
                className="bg-accent absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
                style={{
                  width: Math.max(1, size * 0.009),
                  height: size * 0.4,
                  boxShadow: '0 0 10px var(--color-accent)',
                }}
              />
              {/* counterweight */}
              <div
                className="bg-accent absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
                style={{ width: Math.max(2, size * 0.014), height: size * 0.1 }}
              />
            </div>
          </div>

          {/* centre cap */}
          <div
            className="bg-night ring-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-1"
            style={{ width: size * 0.062, height: size * 0.062 }}
          />
          <div
            className="bg-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ width: size * 0.022, height: size * 0.022 }}
          />
        </div>
      </div>

      {showDigital && (
        <time
          ref={digital}
          className="text-ink-dim font-mono text-xs tracking-[0.18em] tabular-nums"
          suppressHydrationWarning
        />
      )}
    </DragAble>
  );
}

export default AnalogClock;
