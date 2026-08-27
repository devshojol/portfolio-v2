'use client';

import { useState } from 'react';
import DragAble from './DragAble';
import { NavIcon, navIconLinks } from './navIcons';
import { profile } from '@/lib/data';
import { RxCross2 } from 'react-icons/rx';
import HoverEffect from './HoverEffect';

const telegram = navIconLinks.find((l) => l.label === 'Telegram');

function ProfileCard() {
  const [showCard, setShowCard] = useState<boolean>(true);

  return (
    <DragAble className={`absolute top-25 left-20 w-75 ${!showCard && 'hidden'} `}>
      <HoverEffect>
        <div className="from-void via-surface to-line-strong relative overflow-hidden rounded-3xl bg-linear-to-br p-6 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.75)] ring-1 ring-white/10">
          <a
            type="button"
            onClick={() => setShowCard(false)}
            aria-label="Dismiss card"
            className="absolute top-2 right-2 z-10 rounded-full border border-white! p-0.5"
          >
            <RxCross2 />
          </a>

          <div className="bg-accent/15 pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full blur-3xl" />

          <h3 className="relative text-left font-sans text-xl leading-snug font-bold text-white">
            Hi, I&apos;m {profile.firstName}, a {profile.role} for Reliable Web and App
          </h3>

          <p className="relative mt-3 text-left text-[13px] leading-relaxed text-white/80">
            If you are looking for a modern, reliable web and mobile experiences using
            <strong className="text-white"> React, React Native,</strong> with Node.js and MongoDB
            on the backend, you are in the right place!
          </p>

          {telegram && (
            <a
              href={telegram.href}
              target="_blank"
              rel="noopener noreferrer"
              className="relative mt-5 inline-flex items-center gap-2 rounded-xl bg-white/15 px-3.5 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white/25"
            >
              <NavIcon label="Telegram" size={15} />
              Chat Me
            </a>
          )}
        </div>
      </HoverEffect>
    </DragAble>
  );
}

export default ProfileCard;
