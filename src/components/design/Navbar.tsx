import React from 'react';
import MobileNavMenu from './MobileNavMenu';
import { profile } from '@/lib/data';
import { NavIcon, navIconLinks } from './navIcons';
import EyesCursor from './EyesCursor';

const iconLinkClass =
  'flex h-9 w-9 items-center cursor-none justify-center rounded-lg border border-line-strong bg-surface text-ink-dim transition-colors duration-300 hover:border-accent/50 hover:text-accent-soft';

function Navbar() {
  return (
    <nav className="flex items-center justify-between gap-3 px-10 py-5">
      <div className="flex min-w-0 items-center gap-3 sm:gap-8">
        <EyesCursor eyeSize={20} irisSize={9} gap={10} />
        <p className="hidden truncate font-mono text-lg font-bold whitespace-nowrap sm:block md:text-xl">
          SHOJOL ISLAM
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <div className="hidden items-center gap-1.5 sm:flex">
          {navIconLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              aria-label={link.label}
              className={iconLinkClass}
            >
              <NavIcon label={link.label} />
            </a>
          ))}
        </div>

        <a
          href={profile.resumeUrl}
          download
          className="border-line-strong bg-surface text-ink-dim hover:border-accent/50 hover:text-ink hidden h-9 cursor-none items-center gap-1.5 rounded-lg border px-3 text-[13px] font-medium transition-colors duration-300 sm:inline-flex"
        >
          <svg
            width="13"
            height="13"
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
          Resume
        </a>

        <MobileNavMenu name={profile.name} resumeUrl={profile.resumeUrl} iconLinks={navIconLinks} />
      </div>
    </nav>
  );
}

export default Navbar;
