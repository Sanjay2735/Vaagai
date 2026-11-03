import React, { useState } from 'react';
import { RunwaySection } from './RunwaySection';
import { RUNWAY_LOOKS } from '../../data/runwayData';
import { useShop } from '../../context/ShopContext';
import { formatINR } from '../../data/products';
import { HeartIcon, EyeIcon } from '../collection/CollectionIcons';

export function NewArrivalsPage() {
  const { wish, toggleWishlist, addToCart, openQuickView } = useShop();
  const [selectedFilter, setSelectedFilter] = useState('All');

  const allProducts = RUNWAY_LOOKS.flatMap((look) =>
    look.products.map((p) => ({
      ...p,
      lookTitle: look.title,
      lookCode: look.lookCode,
    }))
  );

  const categories = ['All', 'Silk Sarees', 'Festive Sarees', 'Blouses', 'Accessories'];
  const filteredProducts =
    selectedFilter === 'All'
      ? allProducts
      : allProducts.filter((p) => p.category.includes(selectedFilter));

  return (
    <div className="bg-[#1E1615] text-ivory min-h-screen">
      {/* 1. Interactive Digital Runway Spotlight Presentation */}
      <RunwaySection isStandalonePage={true} />

      {/* 2. Editorial Lookbook Product Grid */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-gold/20">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="cap-sm text-gold tracking-couture block mb-2">
            The Complete Runway Catalog
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-ivory font-normal">
            Pieces from the Runway
          </h2>
          <p className="font-serif italic text-base text-ivory/70 mt-3">
            Hand-woven pure silks, handcrafted zardozi blouses, and regal temple jewelry direct from the couture presentation.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedFilter(cat)}
                className={`px-4 py-2 rounded-full text-xs font-sans tracking-luxury uppercase transition-all duration-300 ${
                  selectedFilter === cat
                    ? 'bg-gold text-charcoal font-semibold shadow-md'
                    : 'bg-burgundy/40 text-ivory/80 border border-gold/20 hover:border-gold hover:text-gold'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((item) => {
            const isWishlisted = wish.includes(item.id);

            return (
              <div
                key={item.id}
                className="group flex flex-col justify-between rounded-xl bg-[#29201E]/60 border border-gold/20 hover:border-gold/50 p-3 sm:p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  onClick={() => openQuickView && openQuickView(item)}
                  className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-charcoal cursor-pointer"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                  {item.badge && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-sans font-semibold tracking-wider uppercase bg-burgundy/90 text-gold border border-gold/30">
                      {item.badge}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(item.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-charcoal/60 backdrop-blur-md text-ivory/80 hover:text-gold transition"
                    aria-label="Wishlist"
                  >
                    <HeartIcon
                      filled={isWishlisted}
                      className={`w-4 h-4 ${isWishlisted ? 'text-gold' : 'text-ivory/80'}`}
                    />
                  </button>
                </div>

                <div className="pt-3 flex flex-col flex-1 justify-between">
                  <div>
                    <span className="cap-sm text-gold/75 block text-[9px]">
                      {item.lookCode} · {item.fabric}
                    </span>
                    <h4
                      onClick={() => openQuickView && openQuickView(item)}
                      className="font-serif text-base text-ivory group-hover:text-gold transition-colors mt-0.5 truncate cursor-pointer"
                    >
                      {item.name}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-gold/10">
                    <span className="font-sans text-sm font-semibold text-gold">
                      {formatINR(item.price)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        addToCart({
                          id: item.id,
                          name: item.name,
                          n: item.name,
                          price: item.price,
                          p: item.price,
                          image: item.image,
                          category: item.category,
                          fabric: item.fabric,
                          q: 1,
                        })
                      }
                      className="px-3 py-1 rounded-full text-xs font-sans tracking-luxury uppercase font-semibold bg-gold text-charcoal hover:bg-champagne transition"
                    >
                      + Bag
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
