import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
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
import { CheckoutModal } from './components/CheckoutModal';
import { PRODUCTS } from './data/products';
import ScrollReveal from './components/ScrollReveal';
import PageTransition from './components/PageTransition';
import LaunchCurtain from './components/LaunchCurtain';

import { CollectionPage } from './components/collection/CollectionPage';
import { QuickViewModal } from './components/collection/QuickViewModal';
import { NewArrivalsPage } from './components/runway/NewArrivalsPage';
import {
  KALAKAARI_PRODUCTS,
  KALAKAARI_CATEGORIES,
  KALAKAARI_FABRICS,
  KALAKAARI_OCCASIONS,
} from './data/collectionData';

/**
 * Route Configuration & Resolution
 * Distinguishes Home ('home', default landing), Collection ('collection'), Kalakaari ('kalakaari'), and New Arrivals ('new-arrivals')
 */
const PAGE_KEYS = {
  COLLECTION: 'collection',
  HOME: 'home',
  KALAKAARI: 'kalakaari',
  NEW_ARRIVALS: 'new-arrivals',
};

const HOME_ANCHORS = ['#new', '#best', '#story', '#explore', '#trust', '#hero'];

function resolvePageKey(hash = '') {
  const cleanHash = (hash || '').trim();
  if (
    cleanHash === '#new-arrivals' ||
    cleanHash === '#/new-arrivals' ||
    cleanHash === '#runway' ||
    cleanHash === '#/runway'
  ) {
    return PAGE_KEYS.NEW_ARRIVALS;
  }
  if (
    cleanHash === '#collection' ||
    cleanHash === '#/collection' ||
    cleanHash === '#women-new' ||
    cleanHash === '#/women-new' ||
    cleanHash === '#sarees' ||
    cleanHash === '#/sarees' ||
    cleanHash === '#all-collection'
  ) {
    return PAGE_KEYS.COLLECTION;
  }
  if (cleanHash === '#kalakaari' || cleanHash === '#/kalakaari') {
    return PAGE_KEYS.KALAKAARI;
  }
  // Default landing page is Home ('', '#', '#/', '#home', '#/home', '#story', '#explore', '#best', '#new', '#hero')
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
    const pageChanged = activePageKey !== prevPageKeyRef.current;
    prevPageKeyRef.current = activePageKey;

    if (pageChanged) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return;
    }

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

  const isDedicatedPage =
    activePageKey === PAGE_KEYS.COLLECTION ||
    activePageKey === PAGE_KEYS.NEW_ARRIVALS ||
    activePageKey === PAGE_KEYS.KALAKAARI;

  // Render current page content based on resolved route
  let pageContent;

  if (activePageKey === PAGE_KEYS.NEW_ARRIVALS) {
    pageContent = <NewArrivalsPage />;
  } else if (activePageKey === PAGE_KEYS.COLLECTION) {
    pageContent = <CollectionPage />;
  } else if (activePageKey === PAGE_KEYS.KALAKAARI) {
    pageContent = (
      <CollectionPage
        pageMode="kalakaari"
        products={KALAKAARI_PRODUCTS}
        categories={KALAKAARI_CATEGORIES}
        fabrics={KALAKAARI_FABRICS}
        occasions={KALAKAARI_OCCASIONS}
      />
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
        {/* Cinematic Launch Curtain (only plays once on site entry on home) */}
        {activePageKey === PAGE_KEYS.HOME && <LaunchCurtain />}

        {/* Global Luxury Glassmorphism Navbar */}
        <Navbar activePageKey={activePageKey} />

        {/* Main Content Area */}
        <main
          className={`relative ${isDedicatedPage ? 'pt-[64px] sm:pt-[72px]' : ''} ${
            activePageKey === PAGE_KEYS.NEW_ARRIVALS ? 'h-[100dvh] overflow-hidden' : ''
          }`}
        >
          {/* Stable global scroll reveal observer (tracks DOM mutations across page transitions) */}
          <ScrollReveal />

          {/* Curtain Page Transition System (only activates on full page route changes) */}
          <PageTransition activeKey={activePageKey}>
            {pageContent}
          </PageTransition>
        </main>

        {/* Global Site Footer (omitted on New Arrivals runway to keep viewport locked) */}
        {activePageKey !== PAGE_KEYS.NEW_ARRIVALS && <Footer />}
        <CartDrawer />
        <CheckoutModal
          isOpen={route === '#checkout' || route === '#/checkout'}
          onClose={() => {
            window.location.hash = isCollectionPage ? '#collection' : '#home';
          }}
        />
        <GlobalQuickViewModal />
      </div>
    </ShopProvider>
  );
}

function GlobalQuickViewModal() {
  const { quickViewProduct, quickViewVariantIndex, closeQuickView } = useShop();

  return (
    <QuickViewModal
      product={quickViewProduct}
      initialVariantIndex={quickViewVariantIndex}
      isOpen={Boolean(quickViewProduct)}
      onClose={closeQuickView}
    />
  );
}
