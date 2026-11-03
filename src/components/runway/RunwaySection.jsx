import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useShop } from '../../context/ShopContext';
import { formatINR } from '../../data/products';
import { RUNWAY_LOOKS, RUNWAY_EDITORIAL } from '../../data/runwayData';
import { HeartIcon, EyeIcon } from '../collection/CollectionIcons';

export function RunwaySection({ isStandalonePage = false }) {
  const { wish, toggleWishlist, addToCart, openQuickView } = useShop();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [addedItemIds, setAddedItemIds] = useState(new Set());
  const [touchStartX, setTouchStartX] = useState(null);

  const currentLook = RUNWAY_LOOKS[activeIndex] || RUNWAY_LOOKS[0];
  const totalLooks = RUNWAY_LOOKS.length;

  // Next / Previous Look Navigation
  const goToNextLook = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalLooks);
    setProgress(0);
  }, [totalLooks]);

  const goToPrevLook = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + totalLooks) % totalLooks);
    setProgress(0);
  }, [totalLooks]);

  const selectLook = useCallback((idx) => {
    setActiveIndex(idx);
    setProgress(0);
  }, []);

  // 5s Auto-Runway Presentation Loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = 50;
    const totalDuration = 5000;
    const step = (intervalTime / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goToNextLook();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, goToNextLook]);

  // Touch Swipe for mobile look transition
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 40) {
      goToNextLook();
    } else if (diff < -40) {
      goToPrevLook();
    }
    setTouchStartX(null);
  };

  // Add individual product with visual confirmation
  const handleAddProduct = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      n: product.name,
      price: product.price,
      p: product.price,
      image: product.image,
      category: product.category,
      fabric: product.fabric,
      q: 1,
    });
    setAddedItemIds((prev) => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedItemIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 1200);
  };

  // Add all 3 items of this look together
  const handleAddEntireEnsemble = () => {
    currentLook.products.forEach((p) => {
      addToCart({
        id: p.id,
        name: p.name,
        n: p.name,
        price: p.price,
        p: p.price,
        image: p.image,
        category: p.category,
        fabric: p.fabric,
        q: 1,
      });
      setAddedItemIds((prev) => new Set(prev).add(p.id));
    });
    setTimeout(() => setAddedItemIds(new Set()), 1200);
  };

  return (
    <section
      id="runway-experience"
      aria-label="VAAGAI Interactive Digital Runway"
      className={`relative overflow-hidden bg-[#1E1615] text-ivory ${
        isStandalonePage
          ? 'min-h-[100dvh] pt-24 pb-12'
          : 'py-20 sm:py-28 border-y border-gold/20'
      }`}
    >
      {/* Runway Atmospheric Lighting & Ambience */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Overhead Spotlights */}
        <div className="absolute -top-32 left-1/3 w-[600px] h-[600px] bg-gold/10 rounded-full blur-[170px]" />
        <div className="absolute bottom-0 right-10 w-[500px] h-[500px] bg-burgundy/40 rounded-full blur-[160px]" />
        {/* Subtle grid runway perspective lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(201,164,59,0.03)_1px,transparent_1px)] bg-[size:100%_40px] opacity-40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Runway Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16 border-b border-gold/20 pb-8">
          <div>
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full border border-gold/30 bg-burgundy/60 backdrop-blur-md mb-3">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span className="cap-sm text-gold tracking-couture">
                Signature Feature · Live Lookbook
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-ivory font-normal">
              The Heritage Runway
            </h2>
            <p className="font-serif italic text-base sm:text-lg text-ivory/80 max-w-2xl mt-2 leading-relaxed">
              {RUNWAY_EDITORIAL.description}
            </p>
          </div>

          {/* Runway Play/Pause and Direct Look Navigation Controls */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/40 text-xs font-sans tracking-luxury uppercase text-gold hover:bg-gold hover:text-charcoal transition shadow-sm"
              aria-label={isPlaying ? 'Pause runway rotation' : 'Play runway rotation'}
            >
              <span>{isPlaying ? '❚❚ Pause' : '▶ Play'}</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={goToPrevLook}
                className="w-9 h-9 rounded-full border border-gold/40 flex items-center justify-center text-gold hover:bg-gold hover:text-charcoal transition text-sm"
                aria-label="Previous look"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={goToNextLook}
                className="w-9 h-9 rounded-full border border-gold/40 flex items-center justify-center text-gold hover:bg-gold hover:text-charcoal transition text-sm"
                aria-label="Next look"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================
            RUNWAY MAIN STAGE: Left Model Stage, Right Ensemble Rack
           ========================================================= */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Column: Interactive Runway Model Presentation */}
          <div
            className="lg:col-span-7 relative flex flex-col justify-between rounded-2xl bg-gradient-to-b from-[#29201E]/90 via-[#231A19]/90 to-[#191211] border border-gold/30 shadow-2xl overflow-hidden p-6 sm:p-8 min-h-[550px] sm:min-h-[640px]"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Top Stage Bar: Look Indicators & Progress Line */}
            <div className="z-20">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-2xl sm:text-3xl font-light text-gold">
                    {currentLook.lookCode}
                  </span>
                  <span className="text-ivory/40">/</span>
                  <span className="cap-sm text-ivory/70 tracking-widest">
                    {currentLook.categorySubtitle}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {RUNWAY_LOOKS.map((look, idx) => (
                    <button
                      key={look.id}
                      type="button"
                      onClick={() => selectLook(idx)}
                      className={`h-2 transition-all duration-300 rounded-full ${
                        idx === activeIndex
                          ? 'w-7 bg-gold'
                          : 'w-2 bg-ivory/20 hover:bg-ivory/50'
                      }`}
                      aria-label={`Switch to Look ${look.lookNumber}`}
                    />
                  ))}
                </div>
              </div>

              {/* Progress Line */}
              <div className="w-full h-0.5 bg-ivory/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold transition-all duration-75 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Model Photography Stage with Silky Crossfade */}
            <div className="relative flex-1 flex items-end justify-center my-6 select-none overflow-hidden min-h-[380px] sm:min-h-[460px]">
              {/* Backlight circular glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[440px] h-[320px] sm:h-[440px] rounded-full bg-gold/10 blur-[90px] pointer-events-none" />

              {RUNWAY_LOOKS.map((look, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <div
                    key={look.id}
                    className={`absolute inset-0 flex items-end justify-center transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isActive
                        ? 'opacity-100 scale-100 translate-y-0 z-10'
                        : 'opacity-0 scale-95 translate-y-6 pointer-events-none z-0'
                    }`}
                  >
                    <img
                      src={look.modelImage}
                      alt={look.modelAlt || look.title}
                      className="max-h-[380px] sm:max-h-[480px] w-auto object-contain filter drop-shadow-[0_25px_40px_rgba(0,0,0,0.9)]"
                    />
                  </div>
                );
              })}
            </div>

            {/* Bottom Look Caption Card */}
            <div className="relative z-20 pt-4 border-t border-gold/20 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="cap-sm text-gold block mb-1">
                  {currentLook.fabric} · {currentLook.sareeColor}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-ivory">
                  {currentLook.title}
                </h3>
                <p className="font-serif italic text-xs sm:text-sm text-ivory/70 max-w-md mt-1 leading-relaxed">
                  {currentLook.description}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAddEntireEnsemble}
                  className="btn-gold text-xs py-2.5 px-5"
                >
                  Add Full Look
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Curated Runway Ensemble Rack (3 Items: Saree + Blouse + Jewelry/Footwear) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-gold/20">
                <h4 className="cap-sm text-gold tracking-couture">
                  Curated Runway Ensemble ({currentLook.products.length} Pieces)
                </h4>
                <span className="font-sans text-xs text-ivory/60">
                  Synchronized with Look {currentLook.lookNumber}
                </span>
              </div>

              {/* Product Cards Stack */}
              <div className="space-y-3.5">
                {currentLook.products.map((item) => {
                  const isWishlisted = wish.includes(item.id);
                  const isAdded = addedItemIds.has(item.id);

                  return (
                    <div
                      key={item.id}
                      className="group relative flex items-center gap-4 p-3.5 rounded-xl bg-[#29201E]/70 hover:bg-[#29201E] border border-gold/20 hover:border-gold/50 shadow-md transition-all duration-300"
                    >
                      {/* Product Thumbnail with quick view trigger */}
                      <div
                        onClick={() => openQuickView && openQuickView(item)}
                        className="relative w-20 h-24 rounded-lg overflow-hidden bg-charcoal shrink-0 border border-gold/25 cursor-pointer"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                        {item.badge && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-sans font-semibold tracking-wider uppercase bg-burgundy/90 text-gold border border-gold/30">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="cap-sm text-gold/80 block text-[9px]">
                              {item.category} · {item.fabric}
                            </span>
                            <h5
                              onClick={() => openQuickView && openQuickView(item)}
                              className="font-serif text-base sm:text-lg text-ivory group-hover:text-gold transition-colors truncate cursor-pointer"
                            >
                              {item.name}
                            </h5>
                          </div>

                          {/* Wishlist toggle */}
                          <button
                            type="button"
                            onClick={() => toggleWishlist(item.id)}
                            className="p-1.5 text-ivory/60 hover:text-gold transition shrink-0"
                            aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                          >
                            <HeartIcon
                              filled={isWishlisted}
                              className={`w-4 h-4 ${isWishlisted ? 'text-gold' : 'text-ivory/60'}`}
                            />
                          </button>
                        </div>

                        {/* Pricing & Quick Add Actions */}
                        <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-gold/10">
                          <div className="flex items-baseline gap-2">
                            <span className="font-sans text-sm font-semibold text-gold">
                              {formatINR(item.price)}
                            </span>
                            {item.originalPrice && (
                              <span className="font-sans text-xs text-ivory/40 line-through">
                                {formatINR(item.originalPrice)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openQuickView && openQuickView(item)}
                              className="p-1.5 rounded-full border border-gold/30 text-gold hover:bg-gold/10 transition"
                              aria-label="Quick View details"
                            >
                              <EyeIcon className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleAddProduct(item)}
                              className={`px-3.5 py-1.5 rounded-full text-xs font-sans tracking-luxury uppercase font-semibold transition-all ${
                                isAdded
                                  ? 'bg-gold text-charcoal shadow-[0_0_15px_rgba(201,164,59,0.5)] scale-105'
                                  : 'bg-burgundy text-ivory hover:bg-burgundy-royal border border-gold/30'
                              }`}
                            >
                              {isAdded ? '✓ Added' : '+ Add'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Atelier Styling Consultation Note */}
            <div className="mt-6 p-4 rounded-xl border border-gold/20 bg-burgundy/30 backdrop-blur-md flex items-center justify-between gap-4">
              <div>
                <p className="font-serif italic text-xs sm:text-sm text-ivory/90">
                  “Draped for international couture galas and grand bridal soirees.”
                </p>
                <span className="cap-sm text-gold/80 block mt-1">
                  Complimentary Bridal Styling Included
                </span>
              </div>
              <a
                href="#collection"
                className="editorial-link font-sans text-xs tracking-luxury uppercase text-gold hover:text-champagne shrink-0"
              >
                View Full Catalog →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

