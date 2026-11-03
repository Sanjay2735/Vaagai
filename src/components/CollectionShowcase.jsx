import React from 'react';
import { Arrow } from './Icons';

// High-resolution image assets
import kanjivaramImg from '../assests/images/catalog/saree-crimson-kanjivaram.jpg';
import kalamkariImg from '../assests/images/banner/hero-model-3.png';
import organzaImg from '../assests/images/catalog/saree-blush-pink-organza.jpg';
import cottonImg from '../assests/images/catalog/saree-handloom-cotton.jpg';
import blouseImg from '../assests/images/catalog/blouse-maroon-zardozi.jpg';

const COLLECTIONS = [
  {
    id: 'kanjivaram',
    title: 'The Kanjivaram Edit',
    subtitle: 'Pure Mulberry Silk & 24K Gold Zari',
    count: '42 Masterpieces',
    href: '#collection?fabric=Kanjivaram+Silk',
    image: kanjivaramImg,
    badge: 'Bridal Heritage',
    isHero: true,
  },
  {
    id: 'kalamkari',
    title: 'Kalakaari Artistry',
    subtitle: 'Hand-Painted Natural Dyes',
    count: '28 Handlooms',
    href: '#kalakaari',
    image: kalamkariImg,
    badge: 'Artisanal Guild',
  },
  {
    id: 'organza',
    title: 'Contemporary Organza',
    subtitle: 'Gossamer Sheer & Molten Gold Sheen',
    count: '19 Silhouettes',
    href: '#collection?fabric=Organza',
    image: organzaImg,
    badge: 'Modern Drapery',
  },
  {
    id: 'cotton',
    title: 'Handloom Cotton',
    subtitle: 'Breathable Dravidian Summer Weaves',
    count: '34 Drapes',
    href: '#collection?fabric=Pure+Cotton',
    image: cottonImg,
    badge: 'Everyday Luxury',
  },
  {
    id: 'blouses',
    title: 'Couture Blouses',
    subtitle: 'Hand-Embroidered Zardozi & Raw Silk',
    count: '24 Designs',
    href: '#collection?category=Blouses',
    image: blouseImg,
    badge: 'Handcrafted',
  },
];

export function CollectionShowcase() {
  const heroCard = COLLECTIONS[0];
  const gridCards = COLLECTIONS.slice(1);

  return (
    <section
      id="collections-showcase"
      aria-label="VAAGAI Curated Collections"
      className="relative bg-[#4A0715] text-ivory py-24 sm:py-32 overflow-hidden border-t border-gold/20"
    >
      {/* Ambient background bloom glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-burgundy-royal/40 blur-[180px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-gold/10 blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 sm:mb-20">
          <div>
            <span className="cap-sm text-gold tracking-couture block mb-2">
              Curated Portals · The Design Houses
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-ivory font-normal">
              Collection Showcase
            </h2>
            <p className="font-serif italic text-base sm:text-lg text-ivory/80 max-w-xl mt-2 leading-relaxed">
              Explore drapes organized by weaving discipline, fabric weight, and ceremonial occasion.
            </p>
          </div>

          <a
            href="#collection"
            className="editorial-link font-sans text-xs tracking-luxury uppercase text-gold hover:text-champagne shrink-0"
          >
            Explore Complete Archives →
          </a>
        </div>

        {/* Asymmetric Editorial Layout: 1 Large Left Feature, 4 Grid Cards Right */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Main Large Card (Left 5 Cols) */}
          <div className="lg:col-span-5 flex">
            <a
              href={heroCard.href}
              className="group relative w-full rounded-2xl overflow-hidden border border-gold/30 hover:border-gold/60 shadow-2xl bg-charcoal min-h-[440px] sm:min-h-[540px] flex flex-col justify-between p-6 sm:p-8 transition-all duration-500"
            >
              <img
                src={heroCard.image}
                alt={heroCard.title}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent pointer-events-none" />

              {/* Top Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[10px] font-sans font-semibold tracking-wider uppercase bg-burgundy/90 text-gold border border-gold/30">
                  {heroCard.badge}
                </span>
                <span className="cap-sm text-ivory/80 bg-charcoal/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-gold/20">
                  {heroCard.count}
                </span>
              </div>

              {/* Bottom Information */}
              <div className="relative z-10">
                <span className="cap-sm text-gold block mb-1">
                  Signature Dravidian Weave
                </span>
                <h3 className="font-serif text-2xl sm:text-4xl text-ivory group-hover:text-gold transition-colors">
                  {heroCard.title}
                </h3>
                <p className="font-serif italic text-sm text-ivory/80 mt-1 max-w-sm">
                  {heroCard.subtitle}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs font-sans tracking-luxury uppercase text-gold font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Enter Collection</span>
                  <span>→</span>
                </div>
              </div>
            </a>
          </div>

          {/* 4 Supporting Cards Grid (Right 7 Cols) */}
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
            {gridCards.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="group relative rounded-2xl overflow-hidden border border-gold/25 hover:border-gold/50 shadow-xl bg-charcoal min-h-[250px] sm:min-h-[260px] flex flex-col justify-between p-5 transition-all duration-500 hover:-translate-y-1"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#29201E]/95 via-[#29201E]/50 to-transparent pointer-events-none" />

                {/* Top Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[9px] font-sans font-semibold tracking-wider uppercase bg-burgundy/90 text-gold border border-gold/25">
                    {item.badge}
                  </span>
                  <span className="text-[10px] font-sans text-ivory/70 bg-charcoal/70 px-2 py-0.5 rounded-full">
                    {item.count}
                  </span>
                </div>

                {/* Bottom Info */}
                <div className="relative z-10">
                  <h4 className="font-serif text-xl sm:text-2xl text-ivory group-hover:text-gold transition-colors">
                    {item.title}
                  </h4>
                  <p className="font-serif italic text-xs text-ivory/75 mt-0.5 truncate">
                    {item.subtitle}
                  </p>
                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-sans tracking-luxury uppercase text-gold font-medium">
                    <span>View Weaves</span>
                    <span>→</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

