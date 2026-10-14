import React from 'react';
import { Divider } from './Divider';
import { PRODUCTS } from '../data/products';
import { ProductCard } from './ProductCard';
import { Arrow } from './Icons';

export function NewCollections({ isPage = false }) {
  // Balanced vertical spacing: provides ample clearance under the fixed navbar on the full page
  const paddingClasses = isPage
    ? 'pt-28 pb-16 sm:pt-32 sm:pb-20 md:pt-36 md:pb-24'
    : 'pt-12 pb-16 sm:pt-14 sm:pb-20 md:pt-16 md:pb-24';

  return (
    <section
      id="new"
      aria-labelledby="new-collections-title"
      className={`section-bloom relative px-3.5 sm:px-6 lg:px-8 text-center overflow-hidden ${paddingClasses}`}
    >
      {/* Ambient background bloom glow with soft rose & burgundy warmth */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <div className="w-[500px] md:w-[750px] h-[500px] md:h-[750px] rounded-full bg-rose-950/20 blur-[140px]" />
      </div>

      {/* Subtle organic ambient leaf texture */}
      <div className="leaf absolute -inset-10 opacity-40 pointer-events-none" />

      {/* Heading Area with editorial typography and staggered scroll reveal */}
      <div className="relative max-w-2xl mx-auto mb-8 sm:mb-10 md:mb-12">
        <p className="cap text-gold tracking-[0.25em] text-xs sm:text-sm font-medium uppercase reveal-item stagger-1">
          New Collections
        </p>

        <h2
          id="new-collections-title"
          className="font-primary text-3xl sm:text-5xl md:text-6xl lg:text-7xl mt-2 sm:mt-2.5 md:mt-3 text-[#FBF4E4] font-normal tracking-wide drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] reveal-item stagger-2"
        >
          For Women
        </h2>

        <div className="reveal-item stagger-divider my-2.5 sm:my-3 flex justify-center">
          <Divider />
        </div>

        <p className="font-primary italic text-sm sm:text-base md:text-lg lg:text-xl text-ivory/90 max-w-md sm:max-w-xl mx-auto leading-relaxed reveal-item stagger-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
          Woven in light, draped in grace — the season’s finest, curated for you.
        </p>
      </div>

      {/* Premium Collection Showcase Grid: 2 cols mobile, 2 cols tablet, 4 cols desktop */}
      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 text-left">
          {PRODUCTS.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {/* Explore Full Catalog CTA (displayed when embedded in the homepage) */}
        {!isPage && (
          <div className="mt-10 sm:mt-12 md:mt-14 text-center reveal-item stagger-4">
            <a
              href="#women-new"
              aria-label="Explore the full Vaagai collection for women"
              className="group relative inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#E8C872] to-[#D4AF37] text-forest font-primary text-xs sm:text-sm uppercase tracking-widest font-semibold shadow-[0_4px_20px_rgba(212,175,55,0.35)] hover:shadow-[0_6px_28px_rgba(212,175,55,0.55)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-forest"
            >
              <span>Explore Full Catalog</span>
              <span className="transform transition-transform duration-300 group-hover:translate-x-1.5 shrink-0">
                <Arrow size={18} />
              </span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
