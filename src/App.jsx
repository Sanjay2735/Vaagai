import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ShopProvider } from './context/ShopContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { NewCollections } from './components/NewCollections';
import { Explore } from './components/Explore';
import { Trust } from './components/Trust';
import { ProductGrid } from './components/ProductGrid';
import { Artistry } from './components/Artistry';
import { PageHead } from './components/PageHead';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { PRODUCTS } from './data/products';
import ScrollReveal from './components/ScrollReveal';
import PageTransition from './components/PageTransition';
import LaunchCurtain from './components/LaunchCurtain';

/**
 * Route Configuration & Resolution
 * Distinguishes full page views ('home' | 'women' | 'kalakaari')
 * from in-page homepage section anchors (#new, #best, #story, etc.)
 */
const PAGE_KEYS = {
  HOME: 'home',
  WOMEN: 'women',
  KALAKAARI: 'kalakaari',
};

const HOME_ANCHORS = ['#new', '#best', '#story', '#explore', '#trust', '#hero'];

function resolvePageKey(hash = '') {
  const cleanHash = (hash || '').trim();
  if (cleanHash === '#women-new' || cleanHash === '#/women-new') return PAGE_KEYS.WOMEN;
  if (cleanHash === '#kalakaari' || cleanHash === '#/kalakaari') return PAGE_KEYS.KALAKAARI;
  // All homepage anchors (#new, #best, #story, #explore, #trust, #hero, #/, #, or empty) map to 'home'
  return PAGE_KEYS.HOME;
}

/**
 * Ornamental Divider Seam
 */
function SectionSeam() {
  return (
    <div className="section-seam relative py-6 flex items-center justify-center pointer-events-none opacity-60 select-none">
      <div className="h-px w-20 sm:w-28 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
      <span className="mx-3 text-[8px] text-[#D4AF37]/70">✦</span>
      <div className="h-px w-20 sm:w-28 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
    </div>
  );
}

/**
 * Browser-compatible smooth scrolling to a section target with navbar offset compensation.
 * Normalizes both '#id' and '#/id' format variations.
 */
function scrollToAnchor(targetHash, behavior = 'smooth') {
  if (!targetHash || typeof targetHash !== 'string') return false;
  const clean = targetHash.trim().replace(/^#\/?/, '#');
  if (clean === '#' || clean === '') {
    window.scrollTo({ top: 0, left: 0, behavior });
    return true;
  }

  try {
    const el = document.querySelector(clean);
    if (!el) return false;

    // Pre-reveal target element so it displays cleanly without opacity or blur delay
    el.classList.add('scroll-visible');

    // Compensate for fixed header height
    const navbar = document.querySelector('header, nav');
    const navbarHeight = navbar ? navbar.offsetHeight : 80;
    const elementTop = el.getBoundingClientRect().top + window.scrollY;
    const targetScrollY = Math.max(0, elementTop - navbarHeight - 16);

    window.scrollTo({
      top: targetScrollY,
      left: 0,
      behavior,
    });
    return true;
  } catch {
    return false;
  }
}

export default function App() {
  const [route, setRoute] = useState(() => window.location.hash || '#/');
  const activePageKey = resolvePageKey(route);
  const prevPageKeyRef = useRef(activePageKey);
  const isInitialMountRef = useRef(true);

  // Synchronize route state with browser hashchange and history navigation (Back/Forward)
  useEffect(() => {
    const handleNavigation = () => {
      setRoute(window.location.hash || '#/');
    };

    window.addEventListener('hashchange', handleNavigation);
    window.addEventListener('popstate', handleNavigation);

    return () => {
      window.removeEventListener('hashchange', handleNavigation);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  // Handle in-page anchor navigation when already on the Home page
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    const isStayingOnHome = activePageKey === PAGE_KEYS.HOME && prevPageKeyRef.current === PAGE_KEYS.HOME;
    prevPageKeyRef.current = activePageKey;

    if (!isStayingOnHome) return;

    const normalized = route.replace(/^#\/?/, '#');
    if (normalized === '#' || normalized === '') {
      // Return smoothly to top of Home page
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } else if (HOME_ANCHORS.includes(normalized) || (route.startsWith('#') && !route.includes('/'))) {
      // In-page section scroll with fixed header offset
      scrollToAnchor(route, 'smooth');
    }
  }, [route, activePageKey]);

  // Handle direct anchor links on initial page load: scroll cleanly once launch curtain unlocks
  useEffect(() => {
    let timer = null;
    let didScroll = false;

    const performDirectAnchorScroll = () => {
      if (didScroll) return;
      const initialHash = window.location.hash;
      if (activePageKey === PAGE_KEYS.HOME && initialHash && initialHash !== '#/' && initialHash !== '#') {
        didScroll = true;
        scrollToAnchor(initialHash, 'smooth');
      }
    };

    window.addEventListener('vaagai:curtain-unlocked', performDirectAnchorScroll);
    timer = setTimeout(performDirectAnchorScroll, 850);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('vaagai:curtain-unlocked', performDirectAnchorScroll);
    };
  }, [activePageKey]);

  // Memoized product collections to eliminate redundant array allocations
  const kalamkariProducts = useMemo(
    () => PRODUCTS.filter((p) => ['kala', 't1', 't3'].includes(p.a)),
    []
  );

  const bestSellerProducts = useMemo(
    () => PRODUCTS.slice(0, 4),
    []
  );

  // Render current page content based on resolved route
  let pageContent;

  if (activePageKey === PAGE_KEYS.WOMEN) {
    pageContent = <NewCollections isPage={true} />;
  } else if (activePageKey === PAGE_KEYS.KALAKAARI) {
    pageContent = (
      <>
        <PageHead t="Kalakaari" s="Hand-Painted Heritage" />
        <ProductGrid
          list={kalamkariProducts}
          title="Kalamkari Edit"
          id="kala-edit"
        />
      </>
    );
  } else {
    // Default Home Page View
    pageContent = (
      <>
        <Hero />
        <SectionSeam />
        <NewCollections />
        <SectionSeam />
        <Explore />
        <SectionSeam />
        <Artistry />
        <SectionSeam />
        <Trust />
        <SectionSeam />
        <ProductGrid
          id="best"
          list={bestSellerProducts}
          title="Best Sellers"
        />
      </>
    );
  }

  return (
    <ShopProvider>
      <div className="min-h-screen bg-forest text-ivory">
        {/* Cinematic Launch Curtain (only plays once on site entry, dismissible) */}
        <LaunchCurtain />

        {/* Global Luxury Glassmorphism Navbar */}
        <Navbar />

        {/* Main Content Area */}
        <main className="relative">
          {/* Stable global scroll reveal observer (tracks DOM mutations across page transitions) */}
          <ScrollReveal />

          {/* Curtain Page Transition System (only activates on full page route changes) */}
          <PageTransition activeKey={activePageKey}>
            {pageContent}
          </PageTransition>
        </main>

        {/* Global Site Footer & Slide-over Cart Drawer */}
        <Footer />
        <CartDrawer />
      </div>
    </ShopProvider>
  );
}
