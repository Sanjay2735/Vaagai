import React from 'react';
import { Divider } from './Divider';

export function PageHead({ t, s }) {
  return (
    <section
      aria-label={t || 'Page Header'}
      className="section-regal-head relative pt-24 sm:pt-28 md:pt-32 pb-4 sm:pb-6 text-center px-4 sm:px-6 lg:px-8 overflow-hidden select-none"
    >
      {/* Subtle ambient rose and burgundy glow aura */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <div className="w-[360px] sm:w-[500px] md:w-[650px] h-[220px] sm:h-[280px] md:h-[350px] rounded-full bg-rose-950/15 blur-[120px]" />
      </div>

      <div className="relative max-w-3xl lg:max-w-4xl mx-auto">
        {/* Optional Subtitle / Eyebrow Tag */}
        {s && (
          <p className="cap text-gold tracking-[0.25em] sm:tracking-[0.3em] text-xs sm:text-sm font-medium uppercase reveal-item stagger-1 mb-2 sm:mb-2.5">
            {s}
          </p>
        )}

        {/* Main Page Title */}
        <h1 className="font-primary text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-[#FBF4E4] tracking-wide leading-[1.12] drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] reveal-item stagger-2 break-words">
          {t}
        </h1>

        {/* Symmetrical Ornamental Divider */}
        <div className="reveal-item stagger-divider mt-2.5 sm:mt-3 flex justify-center">
          <Divider />
        </div>
      </div>
    </section>
  );
}
