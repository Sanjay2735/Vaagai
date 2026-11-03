import React from 'react';
import { COLLECTION_PRODUCTS } from '../data/collectionData';
import { ProductCard } from './ProductCard';
import { Arrow } from './Icons';

export function BestSellers() {
  // Retrieve top-rated best sellers
  const bestSellers = COLLECTION_PRODUCTS.filter((p) => p.isBestseller || p.rating >= 4.8).slice(0, 4);

  return (
    <section
      id="best"
      aria-label="VAAGAI Best Sellers"
      className="relative bg-[#29201E] text-ivory py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-t border-gold/20 overflow-hidden"
    >
      {/* Ambient background bloom glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-burgundy/30 blur-[170px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 sm:mb-18">
          <div>
            <span className="cap-sm text-gold tracking-couture block mb-2">
              Client Favorites · Timeless Masterpieces
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-ivory font-normal">
              Most Loved Drapes
            </h2>
            <p className="font-serif italic text-base sm:text-lg text-ivory/80 max-w-xl mt-2 leading-relaxed">
              Consistently chosen by brides, connoisseurs, and ceremonial hosts across India and the globe.
            </p>
          </div>

          <a
            href="#collection"
            className="editorial-link font-sans text-xs tracking-luxury uppercase text-gold hover:text-champagne shrink-0"
          >
            Explore Complete Edit →
          </a>
        </div>

        {/* 4-Column Editorial Showcase Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-left">
          {bestSellers.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              isLight={false}
            />
          ))}
        </div>

        {/* Client Voice Quote Banner */}
        <div className="mt-16 p-8 sm:p-10 rounded-2xl bg-burgundy/40 border border-gold/30 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-1 text-gold mb-2">
              {'★★★★★'.split('').map((star, i) => (
                <span key={i} className="text-sm">★</span>
              ))}
              <span className="font-sans text-xs text-ivory/70 ml-2 font-medium">
                4.9 / 5 from 850+ Verified Brides &amp; Connoisseurs
              </span>
            </div>
            <p className="font-serif italic text-lg sm:text-xl text-ivory/90 max-w-2xl leading-relaxed">
              “The Kanjivaram was the crown of my wedding reception. The authentic zari has an ethereal, regal glow that photographs like pure poetry.”
            </p>
            <span className="cap-sm text-gold/80 block mt-2">
              — Meenakshi S., Chennai · Bespoke Bridal Order
            </span>
          </div>

          <a
            href="#collection"
            className="btn-gold shrink-0 text-xs py-3 px-6"
          >
            Shop the Bridal Edit
          </a>
        </div>
      </div>
    </section>
  );
}

