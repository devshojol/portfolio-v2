"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * A card that tilts in 3D toward the pointer and tracks a spotlight
 * highlight under the cursor.
 */
export default function TiltCard({
  children,
  className = "",
  intensity = 9,
  glow = "#22d3ee",
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
  glow?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Tilt tracking: recentred on leave so the card springs back to rest.
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  // Spotlight tracking: deliberately kept separate and *not* recentred on
  // leave, so the highlight fades out where the pointer actually left instead
  // of snapping to the middle of the card while it is still visible.
  const gx = useMotionValue(0.5);
  const gy = useMotionValue(0.5);

  const sx = useSpring(mx, { stiffness: 180, damping: 22 });
  const sy = useSpring(my, { stiffness: 180, damping: 22 });

  const rotateX = useTransform(sy, [0, 1], [intensity, -intensity]);
  const rotateY = useTransform(sx, [0, 1], [-intensity, intensity]);
  const glowX = useTransform(gx, (v) => `${(v * 100).toFixed(2)}%`);
  const glowY = useTransform(gy, (v) => `${(v * 100).toFixed(2)}%`);
  const spotlight = useMotionTemplate`radial-gradient(360px circle at ${glowX} ${glowY}, ${glow}26, transparent 68%)`;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    mx.set(px);
    my.set(py);
    gx.set(px);
    gy.set(py);
  };

  // Only the tilt returns to centre — the spotlight keeps its last position and
  // simply fades out in place.
  const onLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ rotateX, rotateY, transformPerspective: 1100 }}
      className={`group relative transform-gpu ${className}`}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: spotlight }}
      />
      {children}
    </motion.div>
  );
}
