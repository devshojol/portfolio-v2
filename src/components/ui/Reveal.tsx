"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";
type Custom = { direction: Direction; delay: number };

const offset = (d: Direction) => ({
  y: d === "up" ? 30 : d === "down" ? -30 : 0,
  x: d === "left" ? 30 : d === "right" ? -30 : 0,
});

const variants: Variants = {
  hidden: ({ direction }: Custom) => ({
    opacity: 0,
    ...offset(direction),
  }),
  show: ({ delay }: Custom) => ({
    opacity: 1,
    y: 0,
    x: 0,
    transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export default function Reveal({
  children,
  delay = 0,
  direction = "up",
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  direction?: Direction;
  className?: string;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      custom={{ direction, delay }}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}
