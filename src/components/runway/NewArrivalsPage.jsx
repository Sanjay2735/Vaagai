import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useShop } from '../../context/ShopContext';
import { formatINR } from '../../data/products';
import { RUNWAY_LOOKS, RUNWAY_EDITORIAL } from '../../data/runwayData';
import { HeartIcon, EyeIcon } from '../collection/CollectionIcons';

export function NewArrivalsPage() {
  const { wish, toggleWishlist, addToCart, openQuickView } = useShop();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [hoveredModelIndex, setHoveredModelIndex] = useState(null);
  const [isAddedSuccessId, setIsAddedSuccessId] = useState(null);

  const containerRef = useRef(null);
  const touchStartXRef = useRef(null);
  const touchStartYRef = useRef(null);
  const isWheelingRef = useRef(false);
  const wheelTimeoutRef = useRef(null);

  const currentLook = RUNWAY_LOOKS[activeIndex];
  const totalLooks = RUNWAY_LOOKS.length;

  // 1. Lock screen viewport, body scroll & touch gestures so swiping never causes page to scroll down
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    const originalOverscroll = document.body.style.overscrollBehavior;
    const htmlOverflow = document.documentElement.style.overflow;
    const htmlOverscroll = document.documentElement.style.overscrollBehavior;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'none';

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      document.body.style.overscrollBehavior = originalOverscroll;
      document.documentElement.style.overflow = htmlOverflow;
      document.documentElement.style.overscrollBehavior = htmlOverscroll;
    };
  }, []);

  // 2. Prevent default on native touchmove & wheel to rigidly lock page position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleNativeTouchMove = (e) => {
      // Allow internal scrolling only inside aside recommendation panel or mobile drawer
      if (e.target.closest('aside') || e.target.closest('[data-scrollable="true"]')) {
        return;
      }
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    const handleNativeWheel = (e) => {
      if (e.target.closest('aside') || e.target.closest('[data-scrollable="true"]')) {
        return;
      }
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    container.addEventListener('touchmove', handleNativeTouchMove, { passive: false });
    container.addEventListener('wheel', handleNativeWheel, { passive: false });

    return () => {
      container.removeEventListener('touchmove', handleNativeTouchMove);
      container.removeEventListener('wheel', handleNativeWheel);
    };
  }, []);

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

  // 4.5s Auto-Runway Presentation Loop (matches reference 0s -> 1.5s -> 3s -> 4.5s pacing)
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = 50; // update progress every 50ms
    const totalDuration = 4500; // 4.5s per look
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

  // Keyboard navigation: Left/Right or Up/Down arrows & Spacebar to pause
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goToNextLook();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToPrevLook();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextLook, goToPrevLook]);

  // Mouse wheel / trackpad scroll gesture (debounced smooth runway navigation)
  const handleWheel = (e) => {
    if (isWheelingRef.current) return;

    if (Math.abs(e.deltaY) > 24 || Math.abs(e.deltaX) > 24) {
      isWheelingRef.current = true;
      if (e.deltaY > 0 || e.deltaX > 0) {
        goToNextLook();
      } else {
        goToPrevLook();
      }

      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
      wheelTimeoutRef.current = setTimeout(() => {
        isWheelingRef.current = false;
      }, 650);
    }
  };

  // Mobile Touch Swipe Handling (handles both horizontal and vertical swipes to cycle looks without moving the page)
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
    const diffY = touchStartYRef.current - e.changedTouches[0].clientY;

    if (Math.abs(diffX) > 35) {
      if (diffX > 0) {
        goToNextLook();
      } else {
        goToPrevLook();
      }
    } else if (Math.abs(diffY) > 35) {
      if (diffY > 0) {
        goToNextLook();
      } else {
        goToPrevLook();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Quick Add to Bag handler with visual feedback
  const handleQuickAdd = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setIsAddedSuccessId(product.id);
    setTimeout(() => setIsAddedSuccessId(null), 1000);
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-[calc(100dvh-64px)] sm:h-[calc(100dvh-72px)] overflow-hidden select-none bg-forest text-ivory touch-none overscroll-none"
    >
      {/* =========================================================
          1. RUNWAY STAGE LIGHTING & HORIZON (MATCHING HOME PAGE PALETTE)
         ========================================================= */}
      {/* Signature deep royal burgundy / maroon gradient matching home page */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#380710] via-[#4F0B17] to-[#250307] pointer-events-none" />

      {/* Radiant golden runway horizon line at ~18% from bottom */}
      <div className="absolute inset-x-0 bottom-[18%] sm:bottom-[16%] h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent pointer-events-none" />

      {/* Runway floor ambient reflection glaze */}
      <div className="absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-t from-[#1A0205]/80 via-[#2A040A]/35 to-transparent pointer-events-none" />

      {/* Soft warm rose & gold central spotlight glow behind models */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-rose-900/25 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-gold/10 blur-[100px] pointer-events-none" />

      {/* =========================================================
          2. TOP-LEFT EDITORIAL HEADER (MATCHING HOME PALETTE)
         ========================================================= */}
      <div className="absolute top-6 sm:top-8 lg:top-10 left-6 sm:left-8 lg:left-12 z-30 max-w-sm pointer-events-none">
        <p className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] text-gold uppercase font-primary drop-shadow-sm">
          {RUNWAY_EDITORIAL.season}
        </p>
        <h1 className="sr-only">Vaagai New Arrivals — The Heritage Runway 2026</h1>
        <p className="text-[11px] sm:text-xs text-ivory/80 font-light leading-relaxed mt-1.5 sm:mt-2 font-primary drop-shadow-sm">
          {RUNWAY_EDITORIAL.description}
        </p>
      </div>

      {/* =========================================================
          3. CENTER STAGE — RUNWAY MODEL DEPTH LINEUP
         ========================================================= */}
      <div className="absolute inset-0 right-0 lg:right-[300px] xl:right-[320px] flex items-end justify-center overflow-hidden">
        {RUNWAY_LOOKS.map((look, index) => {
          // Calculate relative circular offset from activeIndex
          let offset = index - activeIndex;
          if (offset < 0) offset += totalLooks;

          const isActive = offset === 0;
          const isFollower1 = offset === 1;
          const isFollower2 = offset === 2;
          const isFollower3 = offset === 3;
          const isFollower4 = offset === 4;
          const isExiting = offset === 5;

          // Depth Configuration Parameters:
          // offset 0: Active Foreground (Scale 1.0, 100% opacity, crisp)
          // offset 1: Depth 1 (-160px X, Scale 0.74, 82% opacity)
          // offset 2: Depth 2 (-310px X, Scale 0.58, 55% opacity, 1px blur)
          // offset 3: Depth 3 (-440px X, Scale 0.44, 35% opacity, 2px blur)
          // offset 4: Depth 4 (-550px X, Scale 0.32, 18% opacity, 3.5px blur)
          // offset 5: Exiting to right (+160px X, Scale 1.08, 0% opacity)

          let leftPercent = 58; // Baseline active position on desktop
          let scale = 1.0;
          let opacity = 1.0;
          let blur = 0;
          let zIndex = 30;
          let pointerEvents = 'auto';

          if (isActive) {
            leftPercent = 58;
            scale = 1.0;
            opacity = 1.0;
            blur = 0;
            zIndex = 30;
          } else if (isFollower1) {
            leftPercent = 43;
            scale = 0.74;
            opacity = 0.82;
            blur = 0;
            zIndex = 22;
          } else if (isFollower2) {
            leftPercent = 31;
            scale = 0.58;
            opacity = 0.55;
            blur = 1.2;
            zIndex = 16;
          } else if (isFollower3) {
            leftPercent = 21;
            scale = 0.44;
            opacity = 0.35;
            blur = 2.4;
            zIndex = 10;
          } else if (isFollower4) {
            leftPercent = 13;
            scale = 0.32;
            opacity = 0.18;
            blur = 3.6;
            zIndex = 5;
          } else if (isExiting) {
            leftPercent = 75;
            scale = 1.06;
            opacity = 0;
            blur = 4;
            zIndex = 25;
            pointerEvents = 'none';
          }

          const isHovered = hoveredModelIndex === index;

          return (
            <div
              key={look.id}
              onClick={() => {
                if (!isActive) {
                  selectLook(index);
                }
              }}
              onMouseEnter={() => setHoveredModelIndex(index)}
              onMouseLeave={() => setHoveredModelIndex(null)}
              style={{
                left: `${leftPercent}%`,
                transform: `translateX(-50%) scale(${
                  isHovered && !isActive ? scale * 1.06 : scale
                })`,
                opacity: isHovered && !isActive ? Math.min(1, opacity + 0.25) : opacity,
                filter: blur > 0 ? `blur(${blur}px)` : 'none',
                zIndex: isHovered && !isActive ? 28 : zIndex,
                transition:
                  'left 900ms cubic-bezier(0.22, 1, 0.36, 1), transform 900ms cubic-bezier(0.22, 1, 0.36, 1), opacity 800ms ease, filter 800ms ease',
              }}
              className={`absolute bottom-[4%] sm:bottom-[3%] lg:bottom-[2%] h-[82%] sm:h-[86%] max-h-[740px] flex flex-col items-center justify-end origin-bottom ${
                !isActive ? 'cursor-pointer' : ''
              } pointer-events-${pointerEvents}`}
            >
              {/* Contact Ground Shadow underneath feet */}
              <div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-44 sm:w-56 h-6 rounded-[100%] bg-black/60 blur-[12px] pointer-events-none transition-opacity duration-700"
                style={{ opacity: opacity > 0.3 ? 0.75 : 0.3 }}
              />

              {/* Full-Length Fashion Model Image */}
              <img
                src={look.modelImage}
                alt={look.modelAlt}
                draggable="false"
                className="relative h-full w-auto object-contain object-bottom drop-shadow-[0_16px_36px_rgba(0,0,0,0.6)] select-none will-change-[transform,opacity]"
              />

              {/* Interactive Tooltip cue on background models on hover */}
              {!isActive && isHovered && (
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#200306]/95 text-gold border border-gold/40 text-[10px] font-semibold tracking-wider uppercase whitespace-nowrap shadow-xl backdrop-blur-md pointer-events-none z-40 animate-fade-in">
                  View Look {look.lookNumber}
                </div>
              )}
            </div>
          );
        })}

        {/* =======================================================
            4. INTERACTIVE RUNWAY PILL INDICATOR (MATCHING PALETTE)
           ======================================================= */}
        <div
          className="absolute left-[44%] sm:left-[47%] bottom-[38%] sm:bottom-[40%] -translate-x-1/2 z-35 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2B040A]/85 hover:bg-[#3B070F] border border-gold/40 shadow-[0_8px_25px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-300"
          aria-label="Runway navigation controls"
        >
          {/* Previous Look Chevron */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToPrevLook();
            }}
            aria-label="Previous look"
            className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-gold/15 active:scale-90 text-gold transition-colors"
          >
            <span className="text-sm font-semibold leading-none -translate-x-0.5">‹</span>
          </button>

          {/* Oval Look Indicator Icon */}
          <div className="w-5 h-2.5 rounded-full border border-gold/70 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
          </div>

          {/* Next Look Chevron */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToNextLook();
            }}
            aria-label="Next look"
            className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-gold/15 active:scale-90 text-gold transition-colors"
          >
            <span className="text-sm font-semibold leading-none translate-x-0.5">›</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          5. BOTTOM-LEFT LOOK IDENTIFIER & TIMELINE (MATCHING PALETTE)
         ========================================================= */}
      <div className="absolute bottom-5 sm:bottom-7 left-5 sm:left-8 lg:left-12 z-30 flex flex-col items-start select-none">
        {/* LOOK | NUMBER Architecture */}
        <div className="flex items-baseline gap-2.5 sm:gap-3">
          <span className="text-xs sm:text-sm font-medium tracking-[0.25em] text-ivory/80 uppercase font-primary">
            LOOK
          </span>
          <span className="text-xs text-gold/50 font-light">|</span>
          <span
            key={currentLook.lookNumber}
            className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal text-gold tracking-tight drop-shadow-[0_2px_12px_rgba(212,175,55,0.3)] transition-all duration-500"
          >
            {currentLook.lookNumber}
          </span>
        </div>

        {/* Collection & Saree Details */}
        <p className="text-[10px] sm:text-[11px] font-medium tracking-[0.2em] text-ivory/70 uppercase font-primary mt-0.5 sm:mt-1">
          {currentLook.collectionName} · {currentLook.categorySubtitle}
        </p>

        {/* Look Timeline Stepper & Auto-Play Runway Toggle */}
        <div className="mt-3 sm:mt-4 flex items-center gap-2.5">
          {/* 6 Stepper Dots */}
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Runway looks">
            {RUNWAY_LOOKS.map((lk, idx) => {
              const isCurr = idx === activeIndex;
              return (
                <button
                  key={lk.id}
                  type="button"
                  onClick={() => selectLook(idx)}
                  role="tab"
                  aria-selected={isCurr}
                  aria-label={`Go to Look ${lk.lookNumber}`}
                  className={`h-1.5 rounded-full transition-all duration-400 focus:outline-none ${
                    isCurr
                      ? 'w-6 sm:w-8 bg-gold shadow-[0_0_12px_rgba(212,175,55,0.6)]'
                      : 'w-1.5 sm:w-2 bg-white/20 hover:bg-white/45'
                  }`}
                />
              );
            })}
          </div>

          {/* Auto Runway Play / Pause Toggle with Progress Bar */}
          <button
            type="button"
            onClick={() => setIsPlaying((prev) => !prev)}
            aria-label={isPlaying ? 'Pause auto runway' : 'Play auto runway'}
            className="ml-2 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#2B040A]/85 hover:bg-[#3B070F] text-ivory border border-gold/30 shadow-md flex items-center gap-1.5 transition-all"
          >
            <span className="text-gold">{isPlaying ? '❚❚' : '▶'}</span>
            <span className="hidden sm:inline">{isPlaying ? 'Runway View' : 'Paused'}</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          6. RIGHT SHOPPABLE RECOMMENDATION PANEL (MATCHING HOME PALETTE)
         ========================================================= */}
      {/* Desktop Panel */}
      <aside
        aria-label="Shoppable Look Recommendations"
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
        className="hidden lg:flex absolute top-0 right-0 bottom-0 w-[290px] xl:w-[320px] bg-[#250308]/95 backdrop-blur-xl border-l border-gold/20 flex-col justify-between p-4 sm:p-5 z-30 shadow-[-15px_0_40px_rgba(0,0,0,0.5)] text-ivory"
      >
        {/* Panel Header */}
        <div className="pb-3 border-b border-gold/15 flex items-center justify-between">
          <div>
            <h2 className="text-[11px] font-semibold tracking-[0.2em] text-ivory uppercase font-primary">
              Wear The Look
            </h2>
            <p className="text-[10px] text-ivory/60 font-medium tracking-wider uppercase mt-0.5">
              Look {currentLook.lookNumber} · {currentLook.products.length} Curated Pieces
            </p>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30">
            Vaagai Couture
          </span>
        </div>

        {/* 3 Product Cards Stack */}
        <div
          data-scrollable="true"
          className="flex-1 py-3 flex flex-col justify-around gap-2.5 overflow-y-auto"
        >
          {currentLook.products.map((product) => {
            const isWishlisted = wish.includes(product.id);
            const isAdded = isAddedSuccessId === product.id;

            return (
              <div
                key={product.id}
                onClick={() => openQuickView(product)}
                className="group relative flex items-center gap-3 p-2 sm:p-2.5 rounded-xl border border-gold/15 hover:border-gold/50 bg-[#38060E]/70 hover:bg-[#4D0814]/90 transition-all duration-300 hover:shadow-[0_8px_25px_rgba(0,0,0,0.4),0_0_15px_rgba(212,175,55,0.15)] cursor-pointer"
              >
                {/* Product Flatlay Image Container */}
                <div className="relative w-16 h-20 sm:w-18 sm:h-22 rounded-lg overflow-hidden bg-[#1E0205] border border-gold/15 shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Subtle hover quick view badge */}
                  <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                    <EyeIcon className="w-4 h-4 text-gold" />
                  </span>
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0 pr-6">
                  {/* Category Tag */}
                  <span className="text-[9.5px] uppercase tracking-wider text-gold/80 font-medium block truncate">
                    {product.category}
                  </span>

                  {/* Title */}
                  <h3 className="text-xs sm:text-[13px] font-medium text-ivory group-hover:text-gold transition-colors leading-snug line-clamp-1 mt-0.5">
                    {product.name}
                  </h3>

                  {/* Pricing Info */}
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xs sm:text-[13px] font-semibold text-gold">
                      {formatINR(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-[10px] text-ivory/40 line-through">
                        {formatINR(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Quick Add Button */}
                  <button
                    type="button"
                    onClick={(e) => handleQuickAdd(product, e)}
                    disabled={isAdded}
                    className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-gold hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <span>{isAdded ? 'Added to Bag ✓' : 'Add to Bag +'}</span>
                  </button>
                </div>

                {/* Wishlist Button (Top-Right) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleWishlist(product.id);
                  }}
                  aria-label={
                    isWishlisted
                      ? `Remove ${product.name} from wishlist`
                      : `Add ${product.name} to wishlist`
                  }
                  className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isWishlisted
                      ? 'text-gold scale-110 drop-shadow-[0_0_8px_rgba(212,175,55,0.7)]'
                      : 'text-ivory/30 hover:text-gold'
                  }`}
                >
                  <HeartIcon filled={isWishlisted} className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Panel Footer: Quick Checkout / Look Summary */}
        <div className="pt-3 border-t border-gold/15 flex items-center justify-between text-xs">
          <span className="text-[11px] text-ivory/60">Complete Ensemble:</span>
          <span className="text-xs font-semibold text-gold">
            {formatINR(
              currentLook.products.reduce((acc, p) => acc + (p.price || 0), 0)
            )}
          </span>
        </div>
      </aside>

      {/* =========================================================
          7. MOBILE BOTTOM SHEET TRIGGER & DRAWER (MATCHING PALETTE)
         ========================================================= */}
      {/* Mobile Floating Trigger Pill */}
      <div className="lg:hidden absolute bottom-5 right-5 z-35">
        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          className="px-4 py-2 rounded-full bg-[#240307] text-ivory text-xs font-semibold tracking-wider uppercase shadow-[0_6px_25px_rgba(0,0,0,0.6)] flex items-center gap-2 border border-gold/40 active:scale-95 transition-all"
        >
          <span>Wear The Look</span>
          <span className="w-4 h-4 rounded-full bg-gold text-[#240307] text-[10px] font-bold flex items-center justify-center">
            {currentLook.products.length}
          </span>
        </button>
      </div>

      {/* Mobile Slide-Up Drawer */}
      {isMobileDrawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsMobileDrawerOpen(false)}
        >
          <div
            data-scrollable="true"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-h-[80vh] rounded-t-3xl bg-[#250308] border-t border-gold/30 p-5 flex flex-col gap-4 overflow-y-auto animate-slide-up shadow-2xl text-ivory"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gold/15">
              <div>
                <p className="text-[11px] font-semibold tracking-wider uppercase text-ivory">
                  Wear The Look {currentLook.lookNumber}
                </p>
                <p className="text-[10px] text-ivory/60">
                  {currentLook.collectionName} · {currentLook.categorySubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 text-ivory flex items-center justify-center font-bold text-sm hover:bg-gold/20"
              >
                ✕
              </button>
            </div>

            {/* Mobile Products List */}
            <div className="flex flex-col gap-3">
              {currentLook.products.map((product) => {
                const isWishlisted = wish.includes(product.id);
                const isAdded = isAddedSuccessId === product.id;

                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      openQuickView(product);
                    }}
                    className="flex items-center gap-3.5 p-2.5 rounded-xl border border-gold/15 bg-[#38060E]"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-20 object-cover object-top rounded-lg bg-[#1E0205] shrink-0 border border-gold/15"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] uppercase tracking-wider text-gold/80 font-medium">
                        {product.category}
                      </span>
                      <h4 className="text-xs font-semibold text-ivory truncate mt-0.5">
                        {product.name}
                      </h4>
                      <p className="text-xs font-semibold text-gold mt-1">
                        {formatINR(product.price)}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(product, e)}
                        className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#240307] bg-gold px-3 py-1 rounded-md active:scale-95 transition-transform"
                      >
                        {isAdded ? 'Added ✓' : 'Add to Bag'}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      className="p-2 text-ivory/40 hover:text-gold"
                    >
                      <HeartIcon filled={isWishlisted} className="w-4 h-4 text-gold" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
