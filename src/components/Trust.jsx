import React from 'react';
import { Ico, ICONS } from './Icons';

export const TRUST_ITEMS = [
  { icon: 'craft', label: 'Authentic Craftsmanship' },
  { icon: 'gem', label: 'Premium Quality' },
  { icon: 'truck', label: 'Safe & Reliable Shipping' },
  { icon: 'love', label: 'Loved by Thousands' },
];

export function Trust() {
  return (
    <section
      id="trust"
      aria-label="Vaagai Heritage & Service Guarantees"
      className="section-floating-seals relative py-12 sm:py-16 md:py-20 px-3.5 sm:px-6 lg:px-8 overflow-hidden select-none"
    >
      {/* Subtle royal ambient rose glow aura */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10" aria-hidden="true">
        <div className="w-[450px] sm:w-[600px] lg:w-[780px] h-[240px] sm:h-[300px] rounded-full bg-rose-950/20 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto">
        <ul
          role="list"
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 list-none m-0 p-0"
        >
          {TRUST_ITEMS.map((item) => (
            <li key={item.label} className="seal-badge h-full list-none">
              <div className="glass-card h-full flex flex-col items-center justify-center gap-3 sm:gap-4 text-center p-3.5 sm:p-5 md:p-6 rounded-2xl border border-gold/20 hover:border-gold/45 shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.5),0_0_18px_rgba(212,175,55,0.15)] transition-all duration-300 ease-out hover:-translate-y-1 sm:hover:-translate-y-1.5 motion-reduce:hover:translate-y-0 motion-reduce:transition-none group cursor-default">
                {/* Refined Gold Seal Icon Medallion */}
                <span
                  aria-hidden="true"
                  className="w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-full bg-gold/10 border border-gold/30 shadow-[0_0_12px_rgba(212,175,55,0.12)] flex items-center justify-center group-hover:scale-105 group-hover:border-gold/60 group-hover:bg-gold/15 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.28)] transition-all duration-300 motion-reduce:group-hover:scale-100 text-gold shrink-0"
                >
                  <Ico d={ICONS[item.icon]} s={22} className="sm:hidden" />
                  <Ico d={ICONS[item.icon]} s={24} className="hidden sm:inline-block" />
                </span>

                {/* Trust Badge Label */}
                <span className="cap tracking-[0.16em] sm:tracking-[0.2em] uppercase font-medium text-ivory/90 group-hover:text-gold transition-colors duration-300 text-[10px] sm:text-[11px] md:text-xs leading-relaxed max-w-[175px] break-words">
                  {item.label}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

