import React from 'react';
import { Img } from './Img';
import { Arrow } from './Icons';
import { Divider } from './Divider';

// High-resolution existing image assets from Vaagai collection
import womenImg from '../assests/images/banner/hero-model-8.png';
import kalaImg from '../assests/images/banner/hero-model-3.png';
import silkImg from '../assests/images/banner/hero-model-2.png';
import cotImg from '../assests/images/banner/hero-model-4.png';

const CATEGORIES = [
  {
    id: 'kala',
    t: 'kala',
    title: 'Kalamkari Sarees',
    subtitle: 'Hand-Painted Natural Dyes',
    src: kalaImg,
    alt: 'Artisanal Hand-Painted Floral Kalamkari Silk Saree - Vaagai',
    href: '#kalakaari',
    imgPosition: 'object-[center_20%]',
  },
  {
    id: 'silk',
    t: 'silk',
    title: 'Silk Sarees',
    subtitle: 'Kanjivaram & Zari Brocades',
    src: silkImg,
    alt: 'Lustrous Pure Handloom Silk and Brocade Saree - Vaagai',
    href: '#women-new',
    imgPosition: 'object-[center_25%]',
  },
  {
    id: 'cot',
    t: 'cot',
    title: 'Cotton Sarees',
    subtitle: 'Breathable Handloom Weaves',
    src: cotImg,
    alt: 'Hand-Woven Pure Cotton Artisanal Saree - Vaagai Handloom',
    href: '#women-new',
    imgPosition: 'object-[center_20%]',
  },
];

function CategoryCard({ item }) {
  const { t, title, subtitle, src, alt, href, imgPosition } = item;

  return (
    <a
      href={href}
      aria-label={`Explore ${title} - ${subtitle}`}
      className="zoom group relative flex-1 min-h-[170px] sm:min-h-[190px] md:min-h-0 w-full rounded-2xl overflow-hidden glass-card border border-gold/25 hover:border-gold/50 transition-all duration-500 hover:shadow-[0_20px_45px_rgba(0,0,0,0.65),0_0_24px_rgba(212,175,55,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#35050E] flex flex-col justify-end"
    >
      <Img
        t={t}
        src={src}
        alt={alt}
        imgPosition={imgPosition || 'object-top'}
        className="absolute inset-0 w-full h-full"
      />
      {/* Multi-layered vignette and gradient overlays for crystal-clear readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1F0408]/95 via-[#1F0408]/45 via-60% to-transparent pointer-events-none transition-opacity duration-500 group-hover:opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#1F0408]/60 via-transparent to-transparent pointer-events-none" />

      {/* Card Content Bar */}
      <div className="relative z-10 p-4 sm:p-5 flex items-end justify-between gap-3">
        <div className="flex flex-col items-start min-w-0">
          <span className="cap glass-pill px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[#FBF4E4] font-medium text-[11px] sm:text-xs tracking-wider border border-gold/30 shadow-[0_0_12px_rgba(212,175,55,0.18)]">
            {title}
          </span>
          {subtitle && (
            <p className="font-primary italic text-xs sm:text-sm text-ivory/85 mt-1 sm:mt-1.5 drop-shadow-sm truncate max-w-[200px] sm:max-w-xs group-hover:text-ivory transition-colors">
              {subtitle}
            </p>
          )}
        </div>
        <span
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gold/40 bg-[#0F291E]/70 backdrop-blur-md grid place-items-center text-gold shadow-[0_0_12px_rgba(212,175,55,0.18)] group-hover:bg-gold group-hover:text-forest group-hover:border-gold group-hover:shadow-[0_0_22px_rgba(212,175,55,0.5)] transition-all duration-300 flex-shrink-0"
          aria-hidden="true"
        >
          <span className="transform transition-transform duration-300 group-hover:translate-x-1">
            <Arrow />
          </span>
        </span>
      </div>
    </a>
  );
}

export function Explore() {
  return (
    <section
      id="explore"
      className="section-split-wing relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-28 overflow-hidden"
    >
      {/* Ambient background bloom glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <div className="w-[500px] md:w-[750px] h-[450px] md:h-[600px] rounded-full bg-rose-900/15 blur-[140px]" />
      </div>

      <div className="leaf absolute -inset-10 opacity-40 pointer-events-none" />

      {/* Refined Section Heading Area */}
      <div className="relative text-center max-w-2xl mx-auto mb-10 md:mb-14">
        <span className="cap glass-pill px-4 py-1.5 rounded-full text-gold font-medium tracking-widest text-xs border border-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.2)] reveal-item stagger-1 inline-block">
          Signature Drapes
        </span>
        <h2 className="font-primary text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-3 text-[#FBF4E4] font-normal drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] reveal-item stagger-2">
          Explore The Collection
        </h2>
        <div className="reveal-item stagger-divider mt-2.5 mb-3">
          <Divider />
        </div>
        <p className="font-primary italic text-base sm:text-lg md:text-xl text-ivory/85 max-w-xl mx-auto leading-relaxed reveal-item stagger-3">
          From royal Kanjivarams to delicate hand-painted Kalamkari, discover drapery steeped in timeless heritage.
        </p>
      </div>

      {/* Editorial Grid: Asymmetrical Left Feature Card (3 cols) + Right Category Stack (2 cols) */}
      <div className="grid md:grid-cols-5 gap-5 md:gap-6 items-stretch">
        {/* Left Wing Feature Card (Slides from Left) */}
        <div className="md:col-span-3 wing-left h-full">
          <a
            href="#women-new"
            aria-label="Explore Women Collection - Elegance in every drape, for you"
            className="zoom group relative block h-full min-h-[440px] sm:min-h-[500px] md:min-h-[580px] lg:min-h-[640px] rounded-2xl overflow-hidden glass-card border border-gold/25 hover:border-gold/50 transition-all duration-500 hover:shadow-[0_25px_55px_rgba(0,0,0,0.7),0_0_30px_rgba(212,175,55,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#35050E]"
          >
            <Img
              t="women"
              src={womenImg}
              alt="Vaagai Royal Women Collection - Maroon Temple Border Silk Saree"
              imgPosition="object-[center_15%]"
              className="absolute inset-0 w-full h-full"
            />
            {/* Multi-layered gradients: Keeps text crisp while showcasing model saree */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#26050C]/95 via-[#26050C]/50 via-50% to-transparent pointer-events-none transition-opacity duration-500 group-hover:opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent pointer-events-none" />

            {/* Content overlay */}
            <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 right-6 sm:right-8 z-10">
              <span className="cap glass-pill px-3.5 py-1.5 rounded-full text-gold font-medium tracking-wider text-xs border border-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.2)] inline-block">
                Signature Heritage
              </span>
              <h3 className="font-primary text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-3 sm:mt-4 max-w-lg leading-tight text-[#FBF4E4] font-normal drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
                Elegance in every drape, for you.
              </h3>
              <p className="font-primary italic text-sm sm:text-base md:text-lg text-ivory/85 mt-2 sm:mt-3 max-w-md leading-relaxed drop-shadow-sm">
                Pure mulberry silks, lustrous zari brocades, and artisanal handlooms woven to celebrate royal grace.
              </p>
              <div className="mt-5 sm:mt-6">
                <span className="btn cap rounded-full inline-flex items-center gap-2.5 text-xs sm:text-sm px-6 py-3 font-medium transition-all group-hover:bg-[#E5C368] group-hover:shadow-[0_0_25px_rgba(212,175,55,0.5)]">
                  Explore Women Collection
                  <span className="transform transition-transform duration-300 group-hover:translate-x-1.5">
                    <Arrow />
                  </span>
                </span>
              </div>
            </div>
          </a>
        </div>

        {/* Right Wing Category Cards (Slide from Right with Stagger) */}
        <div className="md:col-span-2 h-full flex flex-col gap-4 md:gap-5">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="wing-right flex-1 flex flex-col">
              <CategoryCard item={cat} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
