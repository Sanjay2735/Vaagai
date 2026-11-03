import React from 'react';
import atelierImg from '../assests/images/banner/hero-model-8.png';
import loomImg from '../assests/images/banner/hero-model-4.png';

export function OurStory() {
  return (
    <section
      id="brand-story"
      aria-label="VAAGAI Brand Story and Cultural Manifesto"
      className="relative bg-[#D9C5A5] text-[#29201E] py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-t border-[#BAA27E] overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Story Images Layering */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-[#BAA27E] bg-[#E2D3BB]">
              <img
                src={atelierImg}
                alt="VAAGAI Atelier Saree Drape"
                className="w-full h-full object-cover object-center filter saturate-90 hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#29201E]/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 text-ivory">
                <span className="cap-sm text-gold block mb-1">
                  Atelier Archival Drape · Banjara Hills
                </span>
                <p className="font-serif text-lg leading-snug">
                  Draped with ancestral pride, styled for the international stage.
                </p>
              </div>
            </div>

            {/* Inset Small Image */}
            <div className="hidden sm:block absolute -top-8 -right-8 w-48 h-60 rounded-xl overflow-hidden border-4 border-[#D9C5A5] shadow-2xl">
              <img
                src={loomImg}
                alt="Handloom Weaving Details"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>

          {/* Right Column: Narrative Chapter */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full border border-[#720F25]/40 bg-[#E2D3BB] mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#720F25]" />
              <span className="cap-sm text-[#720F25] tracking-couture">
                Our Cultural Identity · The VAAGAI Ethos
              </span>
            </div>

            <h2 className="font-serif text-4xl sm:text-6xl font-normal leading-tight text-[#29201E]">
              Weaving Heritage Into <br />
              <span className="italic font-light text-[#720F25]">
                Modern Couture.
              </span>
            </h2>

            <div className="mt-6 space-y-4 font-serif text-base sm:text-lg text-[#29201E]/85 leading-relaxed">
              <p>
                VAAGAI was founded on a singular conviction: that South Indian handloom textiles are among humanity’s greatest artistic accomplishments, worthy of the grandest international stages.
              </p>
              <p>
                From the historic temple lanes of Kanchipuram to the river courtyards of Srikalahasti, we partner directly with generational master weaver families. By eliminating multi-tier intermediaries, we ensure living wages for artisans while guaranteeing our clients 100% genuine silk, authentic zari, and certified handloom provenance.
              </p>
              <p className="font-serif italic text-lg sm:text-xl text-[#720F25] pt-2">
                “We do not simply produce sarees. We safeguard the living memory of our ancestors’ looms.”
              </p>
            </div>

            {/* 3 Core Principles */}
            <div className="grid sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-[#BAA27E]">
              <div>
                <span className="font-serif text-2xl font-light text-[#720F25] block">350+</span>
                <span className="cap-sm text-[#70594B] block mt-1">Master Weavers Supported</span>
              </div>
              <div>
                <span className="font-serif text-2xl font-light text-[#720F25] block">100%</span>
                <span className="cap-sm text-[#70594B] block mt-1">Silk Mark Certified Purity</span>
              </div>
              <div>
                <span className="font-serif text-2xl font-light text-[#720F25] block">24K</span>
                <span className="cap-sm text-[#70594B] block mt-1">Genuine Gold &amp; Silver Zari</span>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <a
                href="#collection"
                className="btn-burgundy text-xs"
              >
                Experience the Collection
              </a>
              <a
                href="#contact"
                className="font-sans text-xs tracking-luxury uppercase text-[#720F25] hover:text-[#4A0715] font-semibold editorial-link py-1"
              >
                Reserve Atelier Drape Appointment →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

