import React, { useState, useEffect, useRef, useCallback } from 'react';
import bgImage from '../assests/images/banner/e4cacd4d-d4a3-49e9-b91e-1fcdb4f18ada.png';
import model1 from '../assests/images/banner/hero-model-1.png';
import model2 from '../assests/images/banner/hero-model-2.png';
import model3 from '../assests/images/banner/hero-model-3.png';
import model4 from '../assests/images/banner/hero-model-4.png';
import model5 from '../assests/images/banner/hero-model-5.png';
import model6 from '../assests/images/banner/hero-model-6.png';
import { Arrow } from './Icons';
import { useShop } from '../context/ShopContext';
import { formatINR } from '../data/products';

const MODEL_SLIDES = [
  {
    src: model1,
    alt: 'VAAGAI — Heritage Royal Burgundy Kanjivaram Silk Saree',
    sareeName: 'Royal Burgundy Kanjivaram',
    weave: 'Kanchipuram Pit-Loom',
    price: 3499,
    tagline: 'Pure mulberry silk with antique gold korvai borders.',
    lookCode: 'LOOK 01',
  },
  {
    src: model2,
    alt: 'VAAGAI — Lustrous Gold Banarasi Brocade Saree',
    sareeName: 'Lustrous Gold Banarasi',
    weave: 'Varanasi Kadhwa Brocade',
    price: 3899,
    tagline: 'Molten gold metallic tissue with floral zari jaal.',
    lookCode: 'LOOK 02',
  },
  {
    src: model3,
    alt: 'VAAGAI — Artisanal Heritage Kalamkari Silk Saree',
    sareeName: 'Heritage Kalamkari Silk',
    weave: 'Srikalahasti Pen Kalamkari',
    price: 3199,
    tagline: 'Hand-painted with bamboo reed pens and organic mineral dyes.',
    lookCode: 'LOOK 03',
  },
  {
    src: model4,
    alt: 'VAAGAI — Opulent Emerald Green Kanjivaram Silk Saree',
    sareeName: 'Emerald Green Kanjivaram',
    weave: 'Tamil Nadu Heritage Weave',
    price: 3299,
    tagline: 'Traditional temple border with rich gold zari peacock motifs.',
    lookCode: 'LOOK 04',
  },
  {
    src: model5,
    alt: 'VAAGAI — Royal Sapphire Blue Kanjivaram Silk Saree',
    sareeName: 'Sapphire Blue Kanjivaram',
    weave: 'Kanchipuram Silk Guild',
    price: 3699,
    tagline: 'Deep royal blue contrast with crimson brocade pallu.',
    lookCode: 'LOOK 05',
    baselineOffset: 'translate-y-[1.2%]',
  },
  {
    src: model6,
    alt: 'VAAGAI — Bridal Crimson Kanjivaram Silk Saree',
    sareeName: 'Bridal Crimson Kanjivaram',
    weave: 'Master Weaver Signature',
    price: 3999,
    tagline: 'Heirloom bridal drape with heavy gold zari embellishment.',
    lookCode: 'LOOK 06',
  },
];

export function Hero() {
  const { openQuickView, addToCart } = useShop();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);

  // Preload next image for instant visual fidelity
  useEffect(() => {
    const nextIdx = (currentSlide + 1) % MODEL_SLIDES.length;
    const img = new Image();
    img.src = MODEL_SLIDES[nextIdx].src;
  }, [currentSlide]);

  // Tab visibility check
  useEffect(() => {
    const handleVisibility = () => setIsTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Controlled 6.5s auto-slide progression
  useEffect(() => {
    if (isPaused || !isTabVisible) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % MODEL_SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [isPaused, isTabVisible]);

  const activeLook = MODEL_SLIDES[currentSlide];

  const handleQuickAdd = () => {
    addToCart({
      id: `hero-${currentSlide + 1}`,
      name: activeLook.sareeName,
      n: activeLook.sareeName,
      price: activeLook.price,
      p: activeLook.price,
      image: activeLook.src,
      category: 'Silk Sarees',
      fabric: activeLook.weave,
      q: 1,
    });
  };

  return (
    <section
      id="hero"
      aria-label="VAAGAI Haute Couture Hero"
      className="relative min-h-[92vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-[#29201E] text-ivory pt-24 pb-12 sm:pt-28 sm:pb-16"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Architectural Canvas */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Atmospheric temple backdrop */}
        <img
          src={bgImage}
          alt=""
          className="w-full h-full object-cover object-center opacity-25 scale-105 filter blur-[2px] transition-transform duration-1000"
        />
        {/* Deep Burgundy & Charcoal luxury radial vignette */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#29201E]/80 to-[#1C1514]" />
        {/* Soft gold ambient lighting accent */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-burgundy/40 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Haute Editorial Typography & Brand Narrative */}
          <div className="lg:col-span-7 flex flex-col items-start text-left z-20">
            {/* Editorial Season & Heritage Micro-Badge */}
            <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full border border-gold/30 bg-burgundy/50 backdrop-blur-md mb-6 shadow-[0_4px_20px_rgba(201,164,59,0.15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
              <span className="cap-sm text-gold tracking-couture">
                Heritage Couture · MMXXVI
              </span>
            </div>

            {/* Grand Display Headline */}
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-[5rem] font-normal leading-[1.05] tracking-tight text-ivory">
              Culture, Woven <br />
              <span className="italic font-light text-gold font-serif">
                Into Every Drape.
              </span>
            </h1>

            {/* Poetic Narrative Subtitle */}
            <p className="font-serif italic text-base sm:text-xl text-ivory/80 max-w-xl mt-5 sm:mt-6 leading-relaxed">
              An expression of South Indian heritage, timeless craftsmanship, and contemporary elegance. Handcrafted on traditional pit-looms with pure mulberry silk and electroplated gold zari.
            </p>

            {/* CTA Button Array */}
            <div className="flex flex-wrap items-center gap-4 mt-8 sm:mt-10">
              <a
                href="#collection"
                className="btn-gold group"
                aria-label="Explore VAAGAI Silk Collection"
              >
                <span>Explore Collection</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </a>

              <a
                href="#runway-experience"
                className="btn-outline-gold group"
                aria-label="View the Interactive Digital Runway"
              >
                <span>The Runway Lookbook</span>
                <span className="text-gold/70 group-hover:text-gold transition-colors">
                  ✦
                </span>
              </a>

              <a
                href="#story"
                className="editorial-link font-sans text-xs tracking-luxury uppercase text-ivory/80 hover:text-gold py-2 ml-1"
              >
                Discover Our Story
              </a>
            </div>

            {/* Featured Look Miniature Info Bar */}
            <div className="mt-10 sm:mt-12 pt-6 border-t border-gold/20 w-full max-w-lg flex items-center justify-between gap-4 bg-[#29201E]/40 backdrop-blur-md px-4 py-3 rounded-xl border">
              <div>
                <span className="cap-sm text-gold/80 block">
                  {activeLook.lookCode} · {activeLook.weave}
                </span>
                <h3 className="font-serif text-base sm:text-lg text-ivory font-medium">
                  {activeLook.sareeName}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-sans text-sm font-semibold text-gold">
                  {formatINR(activeLook.price)}
                </span>
                <button
                  type="button"
                  onClick={handleQuickAdd}
                  className="px-3.5 py-1.5 rounded-full text-[11px] font-sans tracking-luxury uppercase font-semibold bg-gold text-charcoal hover:bg-champagne transition shadow-md"
                >
                  Quick Add
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Layered Model Photography Display */}
          <div className="lg:col-span-5 relative flex justify-center items-end min-h-[460px] sm:min-h-[580px] lg:min-h-[660px]">
            {/* Subtle rotating circular halo aura */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[460px] h-[340px] sm:h-[460px] rounded-full border border-gold/20 opacity-70 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[380px] h-[280px] sm:h-[380px] rounded-full border border-gold/10 border-dashed pointer-events-none" />

            {/* Dynamic Full-Length Model Image with Silky Crossfade */}
            <div className="relative w-full h-full flex items-end justify-center select-none">
              {MODEL_SLIDES.map((slide, idx) => {
                const isActive = idx === currentSlide;
                return (
                  <img
                    key={slide.sareeName}
                    src={slide.src}
                    alt={slide.alt}
                    className={`absolute bottom-0 max-h-[440px] sm:max-h-[560px] lg:max-h-[640px] w-auto object-contain transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)] ${
                      isActive
                        ? 'opacity-100 scale-100 translate-y-0 z-10'
                        : 'opacity-0 scale-95 translate-y-4 pointer-events-none z-0'
                    } ${slide.baselineOffset || ''}`}
                  />
                );
              })}
            </div>

            {/* Runway Look Navigation Floating Controls */}
            <div className="absolute bottom-2 right-0 sm:right-4 z-20 flex items-center gap-2 bg-[#29201E]/80 backdrop-blur-md px-3 py-2 rounded-full border border-gold/30 shadow-xl">
              <button
                type="button"
                onClick={() =>
                  setCurrentSlide(
                    (prev) => (prev - 1 + MODEL_SLIDES.length) % MODEL_SLIDES.length
                  )
                }
                className="w-7 h-7 rounded-full border border-gold/40 flex items-center justify-center text-gold hover:bg-gold hover:text-charcoal transition text-xs"
                aria-label="Previous look"
              >
                ‹
              </button>
              <span className="font-sans text-[11px] tracking-wider text-ivory/80 px-1 font-medium">
                0{currentSlide + 1} / 0{MODEL_SLIDES.length}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCurrentSlide((prev) => (prev + 1) % MODEL_SLIDES.length)
                }
                className="w-7 h-7 rounded-full border border-gold/40 flex items-center justify-center text-gold hover:bg-gold hover:text-charcoal transition text-xs"
                aria-label="Next look"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Bottom Baseline Tape */}
      <div className="absolute bottom-0 inset-x-0 h-10 border-t border-gold/15 bg-gradient-to-r from-burgundy-deep/60 via-[#29201E]/90 to-burgundy-deep/60 backdrop-blur-md hidden sm:flex items-center justify-around px-4 text-[10px] font-sans tracking-luxury uppercase text-ivory/60 select-none">
        <span>✦ Silk Mark Certified 100% Pure Silk</span>
        <span>✦ Master Weaver Handloom Heritage</span>
        <span>✦ Electroplated 24K Gold &amp; Silver Zari</span>
        <span>✦ Direct Pan-India &amp; Global Insured Dispatch</span>
      </div>
    </section>
  );
}
