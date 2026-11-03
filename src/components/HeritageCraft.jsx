import React, { useState } from 'react';
import mainArtistryImg from '../assests/images/banner/hero-model-7.png';
import print1Img from '../assests/images/banner/hero-model-3.png';
import print2Img from '../assests/images/banner/hero-model-2.png';
import print3Img from '../assests/images/banner/hero-model-1.png';

const CRAFT_STORIES = [
  {
    id: 'kanjivaram',
    step: '01',
    title: 'The Kanjivaram Korvai Technique',
    subtitle: 'Triple-Shuttle Interlocking',
    image: print3Img,
    description:
      'In traditional Kanchipuram weaving, the body and border are woven separately using distinct shuttles and interlocked by two master weavers working synchronously on a single pit-loom. The joint, termed “Korvai”, creates an unbreakable bond of pure mulberry silk.',
    fact: 'Requires over 180 hours of meticulous handloom craftsmanship per drape.',
  },
  {
    id: 'kalamkari',
    step: '02',
    title: 'Sacred Srikalahasti Kalamkari',
    subtitle: 'Bamboo Reed & Botanical Minerals',
    image: print1Img,
    description:
      'Derived from “Kalam” (pen) and “Kari” (craftmanship), every motif is individually sketched using a sharpened bamboo reed pen soaked in fermented jaggery and iron water, dyed with madder root reds, and cured under flowing sacred river waters.',
    fact: '100% organic botanical dyes derived from turmeric, pomegranate rinds, and myrobalan.',
  },
  {
    id: 'zari',
    step: '03',
    title: 'Pure Silver & 24K Gold Zari',
    subtitle: 'Heirloom Metallic Wefts',
    image: print2Img,
    description:
      'True heritage zari uses flattened pure silver wire wrapped around fine silk threads, electroplated in genuine 24-karat gold. Unlike synthetic metallic threads, pure zari retains its antique luster for generations without tarnishing.',
    fact: 'Tested and certified with the Silk Mark and Handloom Mark credentials.',
  },
];

export function HeritageCraft() {
  const [activeTab, setActiveTab] = useState(0);
  const activeStory = CRAFT_STORIES[activeTab];

  return (
    <section
      id="story"
      aria-label="South Indian Heritage and Craft Storytelling"
      className="relative bg-[#F5EEE5] text-[#29201E] py-24 sm:py-32 overflow-hidden selection:bg-gold selection:text-charcoal"
    >
      {/* Subtle textured noise or woven grid watermark */}
      <div className="absolute inset-0 bg-[radial-gradient(#D9C5A5_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full border border-[#C9A43B]/60 bg-[#E9D9BF]/60 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#720F25]" />
            <span className="cap-sm text-[#720F25] tracking-couture">
              Textile Preservation · The Living Tradition
            </span>
          </div>

          <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal leading-tight text-[#29201E]">
            Rooted in South Indian <br />
            <span className="italic font-light text-[#720F25]">
              Handloom Artistry.
            </span>
          </h2>

          <p className="font-serif italic text-lg sm:text-xl text-[#70594B] mt-5 leading-relaxed">
            Every drape is an archival manuscript — hand-spun pure silk, mineral pigments, and centuries of matrilineal weaving wisdom passed through master artisan guilds.
          </p>
        </div>

        {/* Asymmetrical Editorial Composition */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Signature Atelier Visual with Gold Inset */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-[#D9C5A5] bg-[#E9D9BF]">
              <img
                src={mainArtistryImg}
                alt="VAAGAI Artisan Master Drape"
                className="w-full h-full object-cover object-center filter saturate-95 hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#29201E]/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 text-ivory">
                <span className="cap-sm text-gold block mb-1">
                  Atelier Archive · Tamil Nadu
                </span>
                <p className="font-serif text-lg leading-snug">
                  Hand-painted Kalamkari seated by sacred courtyard waters.
                </p>
              </div>
            </div>

            {/* Overlapping Floating Quote Badge */}
            <div className="hidden sm:block absolute -bottom-8 -right-6 bg-[#29201E] text-ivory p-6 rounded-2xl border border-gold/40 shadow-2xl max-w-xs">
              <span className="text-3xl font-serif text-gold leading-none block mb-1">“</span>
              <p className="font-serif italic text-xs leading-relaxed text-ivory/80">
                A saree is not merely an outfit; it is sixty meters of woven poetry that remembers the hands that shaped it.
              </p>
              <span className="cap-sm text-gold/80 block mt-3 text-[9px]">
                VAAGAI Weaver Manifesto
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Craft Chapters */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            {/* Craft Chapter Selector Tabs */}
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-8 border-b border-[#D9C5A5] pb-4">
              {CRAFT_STORIES.map((story, idx) => (
                <button
                  key={story.id}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={`px-4 py-2 rounded-full font-sans text-xs tracking-luxury uppercase transition-all duration-300 ${
                    activeTab === idx
                      ? 'bg-[#4A0715] text-[#F5EEE5] font-semibold shadow-md'
                      : 'bg-[#E9D9BF]/70 text-[#29201E]/80 hover:bg-[#D9C5A5]'
                  }`}
                >
                  {story.step}. {story.subtitle}
                </button>
              ))}
            </div>

            {/* Active Craft Story Card */}
            <div className="bg-[#FAF7F2] p-8 sm:p-10 rounded-2xl border border-[#D9C5A5] shadow-lg">
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="font-serif text-3xl font-light text-[#C9A43B]">
                  {activeStory.step}
                </span>
                <span className="cap-sm text-[#70594B]">
                  Certified Heritage Technique
                </span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl text-[#29201E] font-medium mb-3">
                {activeStory.title}
              </h3>

              <p className="font-serif text-base sm:text-lg text-[#29201E]/80 leading-relaxed">
                {activeStory.description}
              </p>

              {/* Artisan Stat Highlight */}
              <div className="mt-6 pt-6 border-t border-[#D9C5A5] flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#E9D9BF] flex items-center justify-center text-[#720F25] font-serif text-lg">
                  ✦
                </span>
                <p className="font-sans text-xs tracking-wide text-[#70594B] font-medium">
                  {activeStory.fact}
                </p>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <a
                  href="#kalakaari"
                  className="btn-burgundy text-xs"
                >
                  Explore Kalakaari Collection →
                </a>
                <a
                  href="#collection"
                  className="font-sans text-xs tracking-luxury uppercase text-[#720F25] hover:text-[#4A0715] font-semibold editorial-link py-1"
                >
                  View Handloom Sarees
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

