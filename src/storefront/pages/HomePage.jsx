import React from 'react';
import { HeroSection } from '../sections/Hero/HeroSection';
import { RunwaySection } from '../sections/Runway/RunwaySection';
import { HeritageCraftSection } from '../sections/Heritage/HeritageCraftSection';
import { CollectionShowcaseSection } from '../sections/Collections/CollectionShowcaseSection';
import { NewCollectionsSection } from '../sections/NewArrivals/NewCollectionsSection';
import { BestSellersSection } from '../sections/BestSellers/BestSellersSection';
import { OurStorySection } from '../sections/OurStory/OurStorySection';
import { TrustSection } from '../sections/Trust/TrustSection';

/**
 * Editorial Home Page composed of modular luxury sections
 */
export function HomePage() {
  return (
    <>
      {/* 1. Cinematic Luxury Hero */}
      <HeroSection />

      {/* 2. Signature Interactive Digital Runway */}
      <RunwaySection />

      {/* 3. Heritage & Craft Storytelling */}
      <HeritageCraftSection />

      {/* 4. Collection Showcase Portals */}
      <CollectionShowcaseSection />

      {/* 5. New Arrivals Editorial Fashion Grid */}
      <NewCollectionsSection />

      {/* 6. Client Favorites / Best Sellers */}
      <BestSellersSection />

      {/* 7. Cultural Identity & Brand Manifesto */}
      <OurStorySection />

      {/* 8. Heritage Guarantees & Trust Pillars */}
      <TrustSection />
    </>
  );
}

export default HomePage;

