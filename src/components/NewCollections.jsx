import React, { useState } from 'react';
import { Divider } from './Divider';
import { PRODUCTS } from '../data/products';
import { COLLECTION_PRODUCTS } from '../data/collectionData';
import { ProductCard } from './ProductCard';
import { Arrow } from './Icons';

export function NewCollections({ isPage = false }) {
  const [activeFilter, setActiveFilter] = useState('All');

  // Merge products for rich discovery
  const allNewProducts = COLLECTION_PRODUCTS.filter((p) => p.isNew || p.id).slice(0, 8);

  const filters = ['All', 'Kanjivaram', 'Kalamkari', 'Organza', 'Cotton'];

  const filteredList =
    activeFilter === 'All'
      ? allNewProducts
      : allNewProducts.filter((p) => {
          const text = `${p.name} ${p.fabric} ${p.category}`.toLowerCase();
          return text.includes(activeFilter.toLowerCase());
        });

  return (
    <section
      id="new"
      aria-labelledby="new-arrivals-title"
      className="relative bg-[#FAF7F2] text-[#29201E] py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-t border-[#D9C5A5] overflow-hidden"
    >
      {/* Subtle background ornamentation */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-[#E9D9BF]/40 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Editorial Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-18">
          <span className="cap-sm text-[#720F25] tracking-couture block mb-2">
            Spring Summer MMXXVI · Just Unboxed
          </span>
          <h2
            id="new-arrivals-title"
            className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal text-[#29201E] tracking-tight"
          >
            New Arrivals
          </h2>

          <div className="my-3 flex justify-center">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#C9A43B] to-transparent" />
          </div>

          <p className="font-serif italic text-base sm:text-xl text-[#70594B] max-w-lg mx-auto leading-relaxed">
            Woven in morning light, draped in heirloom grace — the season’s most anticipated pit-loom releases.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-xs font-sans tracking-luxury uppercase transition-all duration-300 ${
                  activeFilter === filter
                    ? 'bg-[#4A0715] text-[#F5EEE5] font-semibold shadow-md'
                    : 'bg-[#E9D9BF]/60 text-[#29201E]/80 hover:bg-[#D9C5A5]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Fashion Editorial Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-left">
          {filteredList.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              isLight={true}
            />
          ))}
        </div>

        {/* Bottom CTA to Full Catalog */}
        {!isPage && (
          <div className="mt-14 sm:mt-18 text-center">
            <a
              href="#collection"
              className="btn-burgundy group"
              aria-label="Explore Full VAAGAI Catalog"
            >
              <span>Explore Full Saree Catalog</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1.5">
                <Arrow size={18} />
              </span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
