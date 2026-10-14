import React, { useState, useEffect, useRef, useCallback } from 'react';
import bgImage from '../assests/images/banner/e4cacd4d-d4a3-49e9-b91e-1fcdb4f18ada.png';
import model1 from '../assests/images/banner/hero-model-1.png';
import model2 from '../assests/images/banner/hero-model-2.png';
import model3 from '../assests/images/banner/hero-model-3.png';
import model4 from '../assests/images/banner/hero-model-4.png';
import model5 from '../assests/images/banner/hero-model-5.png';
import model6 from '../assests/images/banner/hero-model-6.png';
import { Arrow } from './Icons';

const MODEL_SLIDES = [
  {
    src: model1,
    alt: 'Vaagai - Heritage Royal Burgundy Kanjivaram Silk Saree',
    sareeName: 'Royal Burgundy Kanjivaram',
  },
  {
    src: model2,
    alt: 'Vaagai - Lustrous Gold Banarasi Silk Saree',
    sareeName: 'Lustrous Gold Banarasi',
  },
  {
    src: model3,
    alt: 'Vaagai - Artisanal Heritage Kalamkari Silk Saree',
    sareeName: 'Heritage Kalamkari Silk',
  },
  {
    src: model4,
    alt: 'Vaagai - Opulent Emerald Green Kanjivaram Silk Saree',
    sareeName: 'Emerald Green Kanjivaram',
  },
  {
    src: model5,
    alt: 'Vaagai - Royal Sapphire Blue Kanjivaram Silk Saree',
    sareeName: 'Sapphire Blue Kanjivaram',
    // Source PNG has 73px bottom padding vs 39px in models 1-4 & 6.
    // translate-y-[1.2%] brings model 5 down by exactly 34px to share the identical floor baseline.
    baselineOffset: 'translate-y-[1.2%]',
  },
  {
    src: model6,
    alt: 'Vaagai - Bridal Crimson Kanjivaram Silk Saree',
    sareeName: 'Bridal Crimson Kanjivaram',
  },
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const s = parseInt(params.get('slide'), 10);
        if (!isNaN(s) && s >= 0 && s < MODEL_SLIDES.length) return s;
      } catch (e) { }
    }
    return 0;
  });

  const [outgoingSlide, setOutgoingSlide] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const lastActionTimeRef = useRef(0);
  const transitionTimerRef = useRef(null);

  // 1. Accessibility: Listen for prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  // 2. Intelligent Progressive Preloading:
  // Preload immediate next slide first to guarantee smooth initial rotation,
  // then preload remaining slides when the browser is idle to avoid initial bandwidth contention.
  useEffect(() => {
    // Immediately preload the next slide
    const nextIdx = (currentSlide + 1) % MODEL_SLIDES.length;
    const nextImg = new Image();
    nextImg.src = MODEL_SLIDES[nextIdx].src;

    // Preload remaining slides when idle
    const preloadRemaining = () => {
      MODEL_SLIDES.forEach((slide, idx) => {
        if (idx !== currentSlide && idx !== nextIdx) {
          const img = new Image();
          img.src = slide.src;
        }
      });
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(preloadRemaining, { timeout: 2500 });
      return () => window.cancelIdleCallback(idleId);
    } else {
      const timer = setTimeout(preloadRemaining, 1200);
      return () => clearTimeout(timer);
    }
  }, [currentSlide]);

  // 3. Tab Visibility: Pause rotation when tab is hidden, resume when visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // 4. Slide Transition Controller:
  // Sets incoming active slide and outgoing slide during 900ms crossfade,
  // throttling rapid clicks to prevent transition interruption.
  const goToSlide = useCallback((nextIdx) => {
    if (nextIdx === currentSlide) return;

    const now = Date.now();
    // 800ms throttle ensures transitions settle gracefully without overlapping silhouettes
    if (now - lastActionTimeRef.current < 800) return;
    lastActionTimeRef.current = now;

    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
    }

    setOutgoingSlide(currentSlide);
    setCurrentSlide(nextIdx);

    transitionTimerRef.current = setTimeout(() => {
      setOutgoingSlide(null);
      transitionTimerRef.current = null;
    }, 900);
  }, [currentSlide]);

  // 5. Advance to next slide (Click / Auto-rotation)
  const handleNextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % MODEL_SLIDES.length);
  }, [currentSlide, goToSlide]);

  // 6. Manual selection via indicators
  const handleSelectSlide = useCallback((idx) => {
    goToSlide(idx);
  }, [goToSlide]);

  // Cleanup transition timer on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  // 7. Automatic Rotation: 4.5 seconds per slide
  // Pauses on hover (desktop only) and when tab is hidden. Resets timer on manual change.
  useEffect(() => {
    if (isHovered || !isTabVisible) return;

    const timer = setTimeout(() => {
      handleNextSlide();
    }, 4500);

    return () => clearTimeout(timer);
  }, [currentSlide, isHovered, isTabVisible, handleNextSlide]);

  return (
    <section
      id="hero"
      className="hero-section scroll-visible relative min-h-[640px] sm:min-h-[680px] md:min-h-[720px] lg:h-[90vh] max-h-[920px] overflow-hidden flex items-center bg-[#280408]"
      onMouseEnter={() => {
        // Only pause on true hover-capable devices (desktop mouse, not touch tap)
        if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
          setIsHovered(true);
        }
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Royal Palace Interior Background Image */}
      <img
        src={bgImage}
        alt="Royal Heritage Palace Setting"
        className="hero-bg-image absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
        loading="eager"
        fetchPriority="high"
      />

      {/* Atmospheric lighting & contrast scrims: guarantees high legibility of text */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1A0205]/85 via-[#1A0205]/40 sm:via-[#1A0205]/25 to-[#1A0205]/45 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#280408]/20 to-[#120103]/75 pointer-events-none" />

      {/* Ambient warm glow halo behind the model */}
      <div
        className="absolute right-[10%] sm:right-[16%] md:right-[20%] lg:right-[22%] xl:right-[24%] bottom-12 w-[380px] sm:w-[500px] lg:w-[640px] h-[380px] sm:h-[500px] lg:h-[640px] bg-rose-700/20 rounded-full blur-[130px] pointer-events-none -translate-x-1/2"
        aria-hidden="true"
      />

      {/* Right Models Cutout Slideshow:
          Sized proportionally across desktop, tablet, and mobile.
          Positioned on the right to prevent overlapping left-hand text. */}
      <div
        className="absolute right-0 sm:right-[2%] md:right-[3%] lg:right-[5%] xl:right-[7%] bottom-0 w-full sm:w-[54%] md:w-[50%] lg:w-[46%] xl:w-[44%] h-[54vh] sm:h-[64vh] md:h-[82%] lg:h-[88%] xl:h-[90%] max-h-[500px] sm:max-h-[580px] md:max-h-[680px] lg:max-h-[760px] xl:max-h-[820px] flex items-end justify-center z-10 select-none"
      >
        <div className="relative w-full h-full flex items-end justify-center">
          {/* Interactive Clickable Model Area: Accessible button trigger */}
          <button
            type="button"
            onClick={handleNextSlide}
            aria-label={`Current drape: ${MODEL_SLIDES[currentSlide].sareeName}. Click to view next saree`}
            title="Click to view next saree drape"
            className="absolute inset-0 w-full h-full flex items-end justify-center cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#280408] rounded-3xl bg-transparent border-0 p-0"
          >
            {MODEL_SLIDES.map((slide, idx) => {
              const isActive = idx === currentSlide;
              const isOutgoing = idx === outgoingSlide;

              let slideStateClass = 'slide-hidden';
              if (isActive) {
                slideStateClass = 'slide-active';
              } else if (isOutgoing) {
                slideStateClass = 'slide-outgoing';
              }

              return (
                <div
                  key={slide.sareeName}
                  aria-hidden={!isActive}
                  className={`hero-model-slide ${slideStateClass}`}
                  style={
                    prefersReducedMotion
                      ? { transition: 'opacity 350ms ease', transform: 'none' }
                      : undefined
                  }
                >
                  <img
                    src={slide.src}
                    alt={slide.alt}
                    className={`h-full w-auto max-w-none object-contain object-bottom drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)] filter brightness-[1.02] contrast-[1.03] transition-filter duration-700 group-hover:brightness-[1.05] ${slide.baselineOffset || ''}`}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    fetchPriority={idx === 0 ? 'high' : 'auto'}
                    draggable={false}
                    onError={(e) => {
                      // Fallback in case an image asset fails to load
                      console.warn(`Model image failed to load: ${slide.sareeName}`);
                    }}
                  />
                </div>
              );
            })}
          </button>

          {/* Sibling Indicator Bar: Centered at the bottom, separate from model click */}
          <div
            role="tablist"
            aria-label="Saree collection carousel navigation"
            className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-2 pointer-events-auto py-1 px-2.5 rounded-full bg-black/30 backdrop-blur-md border border-gold/25 shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
          >
            {MODEL_SLIDES.map((slide, idx) => {
              const isSelected = idx === currentSlide;
              return (
                <button
                  key={slide.sareeName}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-label={`View ${slide.sareeName} (Slide ${idx + 1} of ${MODEL_SLIDES.length})`}
                  onClick={() => handleSelectSlide(idx)}
                  className="relative group p-1.5 focus-visible:outline-none"
                >
                  {/* Visual pill dot */}
                  <span
                    className={`block transition-all duration-500 rounded-full ${
                      isSelected
                        ? 'w-7 sm:w-8 h-1.5 bg-gradient-to-r from-[#D4AF37] to-[#F5D982] shadow-[0_0_12px_rgba(212,175,55,0.7)]'
                        : 'w-1.5 h-1.5 bg-[#F8EFDD]/40 group-hover:bg-[#D4AF37]/80 group-hover:scale-125'
                    }`}
                  />
                  {/* Accessible Focus Ring */}
                  <span className="absolute inset-0 rounded-full focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#280408] pointer-events-none" />
                </button>
              );
            })}
          </div>

          {/* Screen Reader Live Announcement */}
          <span className="sr-only" aria-live="polite" aria-atomic="true">
            {MODEL_SLIDES[currentSlide].sareeName}
          </span>
        </div>
      </div>

      {/* Bottom Gradient Blend into page */}
      <div className="absolute inset-x-0 bottom-0 h-24 md:h-28 bg-gradient-to-t from-forest via-forest/50 to-transparent z-20 pointer-events-none" />

      {/* Left Content Section:
          Anchored on the left without horizontal translation so it never overlaps the model. */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 w-full z-30 pt-10 pb-16 md:py-20 pointer-events-none">
        <div className="max-w-[290px] sm:max-w-md md:max-w-[460px] lg:max-w-xl xl:max-w-2xl pointer-events-auto">
          {/* Subtle tag pill */}
          <span className="cap glass-pill px-4 py-1.5 rounded-full text-gold font-medium mb-5 inline-block shadow-[0_0_15px_rgba(212,175,55,0.2)] text-[10px] tracking-widest fu">
            Tradition Meets Tomorrow
          </span>

          {/* CULTURE Luxury Headline */}
          <div className="relative inline-block mb-3 fu" style={{ animationDelay: '0.2s' }}>
            <h1 className="font-primary text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[0.1em] text-[#FBF4E4] font-light leading-none drop-shadow-[0_4px_30px_rgba(0,0,0,0.85)]">
              CULTURE
            </h1>

            {/* Elegant Ornamental Swash Under R */}
            <svg
              className="w-full max-w-[320px] sm:max-w-[380px] md:max-w-[440px] h-9 -mt-2 text-gold opacity-90 drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]"
              viewBox="0 0 420 34"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M310 4 C270 24, 180 32, 60 22 C40 20, 20 16, 5 10"
                stroke="url(#swashGold)"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M260 22 C190 32, 120 28, 80 20"
                stroke="url(#swashGold)"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.6"
              />
              <circle cx="180" cy="28" r="2.5" fill="#E8C872" />
              <defs>
                <linearGradient id="swashGold" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#AA7A1E" stopOpacity="0.2" />
                  <stop offset="40%" stopColor="#E8C872" stopOpacity="1" />
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.9" />
                </linearGradient>
              </defs>
            </svg>

            {/* Filigree Diamond Divider */}
            <div className="flex items-center gap-3 mt-1.5 text-gold/75" aria-hidden="true">
              <i className="h-px w-14 bg-gradient-to-r from-transparent to-gold/70" />
              <span className="text-[10px] text-gold">✦</span>
              <i className="h-px w-14 bg-gradient-to-l from-transparent to-gold/70" />
            </div>
          </div>

          {/* Subtitle */}
          <p
            className="font-primary italic text-base sm:text-xl md:text-2xl text-ivory/90 mb-7 sm:mb-8 max-w-[280px] sm:max-w-md md:max-w-lg leading-relaxed fu"
            style={{ animationDelay: '0.4s' }}
          >
            A story in every drape — royal silk and exquisite craftsmanship woven for you.
          </p>

          {/* Luminous Pill Buttons */}
          <div className="fu flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4" style={{ animationDelay: '0.6s' }}>
            <a
              href="#explore"
              className="group inline-flex items-center justify-center gap-3 px-7 py-3.5 sm:px-9 sm:py-4 rounded-full bg-gradient-to-r from-[#8A641C] via-[#F5D982] to-[#B8860B] text-[#2B0808] font-primary font-bold text-xs tracking-[0.16em] uppercase border border-[#F5D982]/80 shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:from-[#F5D982] hover:via-[#FFE9A8] hover:to-[#D4AF37] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#280408]"
            >
              Explore Collection
              <span className="transform transition-transform group-hover:translate-x-1">
                <Arrow />
              </span>
            </a>

            <a
              href="#best"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:px-7 rounded-full glass-pill text-ivory/90 hover:text-gold hover:border-gold font-primary text-xs tracking-wider uppercase transition-all duration-300 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#280408]"
            >
              View Best Sellers
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
