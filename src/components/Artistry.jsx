import React from 'react';
import { Divider } from './Divider';
import { Img } from './Img';
import { Arrow } from './Icons';
import mainArtistryImg from '../assests/images/banner/hero-model-7.png';
import print1Img from '../assests/images/banner/hero-model-3.png';
import print2Img from '../assests/images/banner/hero-model-2.png';
import print3Img from '../assests/images/banner/hero-model-1.png';

export function Artistry() {
  const supportingPrints = [
    {
      id: 'kala',
      toneKey: 't1',
      src: print1Img,
      label: 'Kalamkari Silk',
      subtitle: 'Natural Dye Motifs',
    },
    {
      id: 'zari',
      toneKey: 't2',
      src: print2Img,
      label: 'Zari Brocade',
      subtitle: 'Golden Weft Heritage',
    },
    {
      id: 'silk',
      toneKey: 't3',
      src: print3Img,
      label: 'Temple Border',
      subtitle: 'Hand-Spun Pure Silk',
    },
  ];

  return (
    <section
      id="story"
      className="section-reveal relative overflow-hidden my-12 md:my-20 mx-3 sm:mx-6 md:mx-8 rounded-3xl border border-gold/25 shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_35px_rgba(79,11,23,0.5)] bg-gradient-to-b from-[#400814]/90 via-[#4F0B17]/85 to-[#35050E]/95 backdrop-blur-xl py-14 sm:py-16 md:py-20 px-4 sm:px-8 md:px-12"
    >
      {/* Ambient background bloom glows */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gold/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute -bottom-24 right-10 w-[450px] h-[350px] bg-rose-950/30 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto">
        {/* Refined Heading and Description Area */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <span className="cap glass-pill px-4 py-1.5 rounded-full text-gold font-medium shadow-[0_0_15px_rgba(212,175,55,0.2)] reveal-item stagger-1 inline-block">
            Artisanal Heritage
          </span>
          <h2 className="font-primary text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-3 text-[#FBF4E4] font-normal drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] reveal-item stagger-2">
            Rooted in Indian Artistry
          </h2>
          <div className="reveal-item stagger-divider mt-2.5 mb-3">
            <Divider />
          </div>
          <p className="font-primary italic text-base sm:text-lg md:text-xl text-ivory/85 leading-relaxed reveal-item stagger-3">
            Every thread narrates centuries of heritage — hand-woven silk, natural dyes, and artisanal motifs created by master craftspeople.
          </p>
        </div>

        {/* Editorial Showcase: 1 Large Main Image on Left, 3 Supporting Images on Right */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Main Large Image (Left) */}
          <div className="lg:col-span-6 reveal-item stagger-2">
            <div className="zoom group relative h-full min-h-[360px] sm:min-h-[440px] md:min-h-[500px] aspect-[4/5] lg:aspect-auto overflow-hidden rounded-2xl glass-card border border-gold/25 shadow-2xl transition-all duration-500 hover:border-gold/50 hover:shadow-[0_25px_50px_rgba(0,0,0,0.7),0_0_30px_rgba(212,175,55,0.25)]">
              <Img
                t="win"
                src={mainArtistryImg}
                className="absolute inset-0 w-full h-full"
                label="Floral Kalamkari saree · seated by window"
                alt="Floral Kalamkari hand-painted silk saree - Vaagai Artistry"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Three Supporting Images with Craft Story (Right) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4 md:space-y-6">
            {/* Story Craft Quote Card */}
            <div className="reveal-item stagger-3">
              <div className="glass-card rounded-2xl p-4 sm:p-5 border border-gold/20 shadow-lg">
                <span className="cap text-gold tracking-widest text-xs font-medium block">
                  The Kalamkari & Handloom Craft
                </span>
                <p className="font-primary italic text-base sm:text-lg text-ivory/90 mt-1.5 leading-snug">
                  “Each motif is painted by hand using bamboo reed pens and organic mineral pigments, cured under sacred river waters.”
                </p>
              </div>
            </div>

            {/* 3 Supporting Images Grid */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 md:gap-4 flex-1">
              {supportingPrints.map((item, idx) => (
                <div
                  key={item.id}
                  className="reveal-item"
                  style={{ transitionDelay: `${idx * 140 + 200}ms` }}
                >
                  <div className="zoom group relative aspect-[3/4] sm:aspect-[3/4] md:aspect-[3/5] h-full overflow-hidden rounded-2xl glass-card border border-gold/20 shadow-lg transition-all duration-500 hover:border-gold/50 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(0,0,0,0.6),0_0_20px_rgba(212,175,55,0.2)]">
                    <Img
                      t={item.toneKey}
                      src={item.src}
                      className="absolute inset-0 w-full h-full"
                      label={item.label}
                      alt={item.subtitle}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Closing Quote & Explore Kalakaari CTA */}
        <div className="text-center mt-12 md:mt-16 reveal-item stagger-4">
          <p className="font-primary italic text-2xl sm:text-3xl md:text-4xl lg:text-5xl drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] text-[#FBF4E4] max-w-3xl mx-auto leading-tight">
            “A canvas of tradition, for today’s world.”
          </p>
          <div className="reveal-item stagger-5 mt-6 md:mt-8">
            <a
              href="#kalakaari"
              className="btn cap rounded-full px-8 py-3.5 sm:px-10 sm:py-4 shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:shadow-[0_0_35px_rgba(212,175,55,0.5)] group inline-flex items-center gap-3 text-xs sm:text-sm font-medium transition-all"
            >
              Explore Kalakaari{' '}
              <span className="transform transition-transform group-hover:translate-x-1.5 duration-300">
                <Arrow />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
