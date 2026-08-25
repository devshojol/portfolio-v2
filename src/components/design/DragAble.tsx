'use client';
import React, { useRef } from 'react';
import { motion } from 'motion/react';

function DragAble({
  children,
  className,
  disabled = false,
}: {
  children: React.ReactNode;
  className?: string;
  /** Turns dragging off and returns the element to where layout put it. */
  disabled?: boolean;
}) {
  // Motion only suppresses the post-drag click on the dragging element's own
  // handler. Ours sit on children (the folder button, the window's title-bar
  // controls), so those still fire after a drag and we have to swallow the
  // click ourselves.
  const dragged = useRef(false);

  return (
    <motion.div
      drag={!disabled}
      dragMomentum={false}
      // Dragging leaves an x/y transform behind. Without this, a window that
      // was dragged into a corner would still be offset by that much when it
      // goes full screen.
      animate={disabled ? { x: 0, y: 0 } : undefined}
      // Cleared on every new press rather than on drag end: the click lands
      // after drag end, and a drag released off-element never gets a click at
      // all — clearing there would either swallow nothing or swallow the next
      // real click.
      onPointerDownCapture={() => {
        dragged.current = false;
      }}
      onDragStart={() => {
        dragged.current = true;
      }}
      onClickCapture={(e) => {
        if (!dragged.current) return;
        e.preventDefault();
        e.stopPropagation();
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default DragAble;
