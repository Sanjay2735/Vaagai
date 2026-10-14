import React from 'react';
import { Parallax } from './Parallax';
import { Img } from './Img';
import { Arrow } from './Icons';
import { Divider } from './Divider';
import bannerImg from '../assests/images/banner/banner-2.png';

export function KalaBanner() {
  return (
    <section
      id="kalakaari-banner"
      className="section-reveal relative min-h-[460px] sm:min-h-[500px] md:min-h-[540px] overflow-hidden my-14 sm:my-18 md:my-20 mx-3 sm:mx-6 md:mx-8 lg:mx-12 rounded-3xl border border-gold/30 shadow-[0_20px_60px_rgba(0,0,0,0.65),0_0_35px_rgba(79,11,23,0.55)] flex items-center justify-center"
      aria-label="Kalakaari Heritage Collection Banner"
    >
      {/* 1. Parallax Saree Artwork Background Layer */}
      <Parallax speed={0.06} className="absolute inset-0 w-full h-full pointer-events-none select-none">
        <div className="relative w-full h-[120%] -top-[10%]">
          <Img
            t="banner"
            src={bannerImg}
            alt="Vaagai Kalakaari Hand-Painted Saree Artwork"
            imgPosition="object-[center_25%]"
            className="w-full h-full"
          />
        </div>
      </Parallax>

      {/* 2. Multi-layered Luxury Burgundy Gradient & Spotlight Vignette */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#25040B]/85 via-[#4F0B17]/65 to-[#1E0308]/90 backdrop-blur-[1px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,11,23,0.35)_0%,rgba(24,3,7,0.75)_100%)] pointer-events-none"
        aria-hidden="true"
      />

      {/* 3. Ambient Gold Glow Halo Behind Heading */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[480px] md:w-[600px] h-[220px] sm:h-[300px] bg-gold/10 rounded-full blur-[110px] pointer-events-none"
        aria-hidden="true"
      />

      {/* 4. Editorial Content Container */}
      <div className="relative z-10 text-center py-20 sm:py-24 md:py-28 px-5 sm:px-8 max-w-3xl mx-auto flex flex-col items-center">
        {/* Eyebrow Pill Badge */}
        <span className="cap glass-pill px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-gold font-medium tracking-[0.25em] text-xs shadow-[0_0_15px_rgba(212,175,55,0.2)] border border-gold/30 reveal-item stagger-1 inline-block select-none">
          Kalakaari Collection
        </span>

        {/* Editorial Heading */}
        <h2 className="font-primary italic text-4xl sm:text-5xl md:text-6xl lg:text-7xl mt-5 sm:mt-6 text-[#FBF4E4] font-normal tracking-wide leading-[1.12] drop-shadow-[0_4px_30px_rgba(0,0,0,0.85)] reveal-item stagger-2">
          Hand-Painted Heritage
        </h2>

        {/* Subtle Decorative Gold Divider */}
        <div className="reveal-item stagger-divider my-3.5 sm:my-4">
          <Divider />
        </div>

        {/* Supporting Editorial Description */}
        <p className="font-primary italic text-base sm:text-lg md:text-xl text-ivory/90 max-w-xl mx-auto leading-relaxed reveal-item stagger-3 drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
          Where traditional artistry meets timeless elegance.
        </p>

        {/* Luminous Royal Pill CTA Button */}
        <div className="reveal-item stagger-4 mt-8 sm:mt-9">
          <a
            href="#kalakaari"
            className="group inline-flex items-center justify-center gap-3 rounded-full px-8 sm:px-10 py-3.5 sm:py-4 bg-gradient-to-r from-[#D4AF37] via-[#F5D982] to-[#D4AF37] text-[#380710] font-primary font-bold text-xs sm:text-sm tracking-[0.2em] uppercase shadow-[0_4px_25px_rgba(212,175,55,0.35),0_0_15px_rgba(0,0,0,0.5)] hover:from-[#F5D982] hover:via-[#FFE9A8] hover:to-[#D4AF37] hover:shadow-[0_0_35px_rgba(212,175,55,0.65),0_4px_30px_rgba(0,0,0,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5D982] focus-visible:ring-offset-2 focus-visible:ring-offset-[#380710] whitespace-nowrap"
          >
            <span>Shop Kalakaari</span>
            <span
              className="transform transition-transform duration-300 group-hover:translate-x-1.5 text-[#380710]"
              aria-hidden="true"
            >
              <Arrow />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
