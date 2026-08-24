'use client';

import { useEffect, useRef, useState } from 'react';
import { NavIcon, type NavIconLink } from './navIcons';

function MobileNavMenu({
  name,
  resumeUrl,
  iconLinks,
}: {
  name: string;
  resumeUrl: string;
  iconLinks: NavIconLink[];
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const rowClass =
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-ink-dim transition-colors duration-200 hover:bg-line/40 hover:text-ink';

  return (
    <div ref={rootRef} className="relative sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="border-line-strong bg-surface relative flex h-9 w-9 items-center justify-center rounded-lg border"
      >
        <span
          className={`bg-ink absolute h-px w-4 transition-transform duration-300 ${
            open ? 'translate-y-0 rotate-45' : '-translate-y-1'
          }`}
        />
        <span
          className={`bg-ink absolute h-px w-4 transition-transform duration-300 ${
            open ? 'translate-y-0 -rotate-45' : 'translate-y-1'
          }`}
        />
      </button>

      {open && (
        <div className="glass absolute top-[calc(100%+10px)] right-0 z-50 w-64 rounded-xl p-2 shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
          <p className="text-ink truncate px-3 py-2 font-mono text-sm font-bold">{name}</p>
          <div className="bg-line my-1 h-px" />

          {iconLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              onClick={() => setOpen(false)}
              className={rowClass}
            >
              <NavIcon label={link.label} size={16} />
              {link.label}
            </a>
          ))}

          <div className="bg-line my-1 h-px" />

          <a href={resumeUrl} download onClick={() => setOpen(false)} className={rowClass}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Get CV
          </a>
        </div>
      )}
    </div>
  );
}

export default MobileNavMenu;
