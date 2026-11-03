import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useShop } from '../context/ShopContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { CustomerAuthModal } from './CustomerAuthModal';
import { CustomerAccountModal } from './CustomerAccountModal';
import { OrderTrackingModal } from './OrderTrackingModal';
import { Ico, ICONS } from './Icons';
import { PRODUCTS, formatINR } from '../data/products';
import { COLLECTION_PRODUCTS, CATEGORIES, FABRICS } from '../data/collectionData';

// Signature preview images for Mega Menu spotlight
import crimsonSaree from '../assests/images/catalog/saree-crimson-kanjivaram.jpg';
import ivorySaree from '../assests/images/catalog/saree-ivory-gold.jpg';
import model1 from '../assests/images/banner/hero-model-1.png';
import model3 from '../assests/images/banner/hero-model-3.png';
import logoVaagai from '../assests/images/Logo-Vaagai.jpeg';

export function Navbar({ activePageKey = 'home' }) {
  const { cart, wish, openCart, addToCart, toggleWishlist, openQuickView } = useShop();
  const { customer } = useCustomerAuth();

  const [open, setOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWishOpen, setIsWishOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [activeTrackingOrderNumber, setActiveTrackingOrderNumber] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const megaMenuTimeoutRef = useRef(null);

  const isLight = activePageKey === 'collection';
  const isSolid = isScrolled || isHovered || megaMenuOpen;

  const searchInputRef = useRef(null);
  const mobileCloseBtnRef = useRef(null);
  const wishCloseBtnRef = useRef(null);
  const isBodyLockedRef = useRef(false);
  const originalOverflowRef = useRef('');

  // Passive scroll listener for silky glassmorphism transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Safely lock body scroll when modals or mobile menu open
  useEffect(() => {
    const isAnyModalOpen = open || isSearchOpen || isWishOpen;
    if (isAnyModalOpen) {
      if (!isBodyLockedRef.current) {
        isBodyLockedRef.current = true;
        originalOverflowRef.current = document.body.style.overflow || '';
        document.body.style.overflow = 'hidden';
      }
    } else {
      if (isBodyLockedRef.current) {
        isBodyLockedRef.current = false;
        document.body.style.overflow = originalOverflowRef.current;
      }
    }

    return () => {
      if (isBodyLockedRef.current) {
        isBodyLockedRef.current = false;
        document.body.style.overflow = originalOverflowRef.current;
      }
    };
  }, [open, isSearchOpen, isWishOpen]);

  // Global event bridge for customer modals & order tracking
  useEffect(() => {
    const handleOpenTrack = (e) => {
      if (e?.detail?.orderNumber) {
        setActiveTrackingOrderNumber(e.detail.orderNumber);
      }
      setIsTrackingModalOpen(true);
    };
    const handleOpenAuth = () => setIsAuthModalOpen(true);
    const handleOpenAccount = () => setIsAccountModalOpen(true);

    window.addEventListener('vaagai:open-tracking', handleOpenTrack);
    window.addEventListener('vaagai:open-auth', handleOpenAuth);
    window.addEventListener('vaagai:open-account', handleOpenAccount);

    return () => {
      window.removeEventListener('vaagai:open-tracking', handleOpenTrack);
      window.removeEventListener('vaagai:open-auth', handleOpenAuth);
      window.removeEventListener('vaagai:open-account', handleOpenAccount);
    };
  }, []);

  // Keyboard accessibility: Escape key closes active overlay
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isSearchOpen) setIsSearchOpen(false);
        else if (isWishOpen) setIsWishOpen(false);
        else if (open) setOpen(false);
        else if (megaMenuOpen) setMegaMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, isSearchOpen, isWishOpen, megaMenuOpen]);

  // Autofocus input when search modal opens
  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  const count = cart.reduce((acc, curr) => acc + curr.q, 0);

  // Search results query across PRODUCTS and COLLECTION_PRODUCTS
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const searchResults = trimmedQuery
    ? [...COLLECTION_PRODUCTS, ...PRODUCTS]
        .filter((p, idx, self) => {
          const name = p.name || p.n || '';
          const cat = p.category || '';
          const fab = p.fabric || '';
          const match =
            name.toLowerCase().includes(trimmedQuery) ||
            cat.toLowerCase().includes(trimmedQuery) ||
            fab.toLowerCase().includes(trimmedQuery);
          return match && self.findIndex((x) => x.id === p.id) === idx;
        })
        .slice(0, 8)
    : [];

  // Filter wishlisted products from catalog
  const wishItems = COLLECTION_PRODUCTS.filter((p) => wish.includes(p.id));

  // Mega Menu Hover Delays to prevent flickering
  const handleMegaEnter = () => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setMegaMenuOpen(true);
  };

  const handleMegaLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 180);
  };

  // Elegant navigation link
  const NavLink = ({ href, children, onMouseEnter, onMouseLeave, hasDropdown = false }) => {
    const isLinkActive =
      (href === '#new-arrivals' && activePageKey === 'new-arrivals') ||
      ((href === '#collection' || href === '#/collection') && activePageKey === 'collection') ||
      ((href === '#kalakaari' || href === '#/kalakaari') && activePageKey === 'kalakaari') ||
      ((href === '#home' || href === '#/home') && activePageKey === 'home');

    return (
      <div
        className="relative py-2"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <a
          href={href}
          className={`relative inline-flex items-center gap-1 font-sans text-xs tracking-luxury uppercase font-medium transition-all duration-300 ${
            isLinkActive
              ? 'text-gold font-semibold'
              : 'text-ivory/90 hover:text-gold'
          }`}
        >
          <span>{children}</span>
          {hasDropdown && (
            <svg
              className={`w-3 h-3 transition-transform duration-300 text-gold/80 ${
                megaMenuOpen ? 'rotate-180 text-gold' : ''
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
          {/* Subtle gold line indicator */}
          <span
            className={`absolute -bottom-1 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#C9A43B] to-transparent transition-transform duration-300 ${
              isLinkActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`}
          />
        </a>
      </div>
    );
  };

  // Center Brand Logo
  const logo = (
    <a
      href="#home"
      className="flex items-center gap-2.5 sm:gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-lg px-2 sm:px-3 py-1 select-none"
      aria-label="VAAGAI — Contemporary South Indian Heritage"
    >
      <img
        src={logoVaagai}
        alt="VAAGAI Emblem"
        className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover border border-gold/70 group-hover:border-gold group-hover:scale-105 transition-all duration-400 shadow-[0_0_15px_rgba(201,164,59,0.3)] bg-burgundy shrink-0"
      />
      <div className="flex flex-col items-start leading-none">
        <span className="font-serif tracking-[0.22em] text-xl sm:text-2xl text-ivory group-hover:text-gold font-normal transition-colors duration-300 uppercase">
          VAAGAI
        </span>
        <span className="font-sans text-[7.5px] sm:text-[8.5px] tracking-couture uppercase text-gold/80 group-hover:text-champagne font-medium transition-colors duration-300 mt-1 whitespace-nowrap">
          South Indian Heritage
        </span>
      </div>
    </a>
  );

  return (
    <>
      <header
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed top-0 inset-x-0 z-40 py-2 sm:py-3 transition-all duration-500 ease-out"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 8px)' }}
      >
        {/* Full-header glass overlay */}
        <div
          className={`absolute inset-0 -z-10 transition-all duration-500 pointer-events-none ${
            isSolid
              ? 'bg-[#29201E]/90 backdrop-blur-xl border-b border-gold/20 shadow-[0_10px_35px_rgba(0,0,0,0.5)]'
              : 'bg-gradient-to-b from-[#29201E]/80 via-[#29201E]/50 to-transparent backdrop-blur-md border-b border-transparent'
          }`}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-3 items-center">
          {/* Left Navigation Links (Desktop) */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-6 lg:gap-8 justify-self-start"
          >
            <NavLink href="#home">Home</NavLink>
            <NavLink
              href="#collection"
              hasDropdown={true}
              onMouseEnter={handleMegaEnter}
              onMouseLeave={handleMegaLeave}
            >
              Collection
            </NavLink>
            <NavLink href="#kalakaari">Kalakaari</NavLink>
          </nav>

          {/* Mobile Menu Trigger Button (Left) */}
          <div className="md:hidden justify-self-start flex items-center">
            <button
              type="button"
              className="p-2 -ml-2 text-ivory hover:text-gold active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-full"
              aria-label={open ? 'Close menu' : 'Open navigation menu'}
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <Ico d={ICONS.menu} s={24} />
            </button>
          </div>

          {/* Dead-Center Brand Logo */}
          <div className="justify-self-center">{logo}</div>

          {/* Right Navigation & Utility Action Controls */}
          <div className="justify-self-end flex items-center gap-4 sm:gap-6 lg:gap-8">
            <nav
              aria-label="Secondary Navigation"
              className="hidden lg:flex items-center gap-6 xl:gap-8"
            >
              <NavLink href="#new-arrivals">Runway</NavLink>
              <NavLink
                href="#collection"
                hasDropdown={true}
                onMouseEnter={handleMegaEnter}
                onMouseLeave={handleMegaLeave}
              >
                Sarees
              </NavLink>
              <NavLink href="#story">Our Story</NavLink>
              <button
                type="button"
                onClick={() => setIsTrackingModalOpen(true)}
                className="text-[11px] uppercase tracking-widest font-semibold text-ivory/80 hover:text-gold transition-colors focus:outline-none"
              >
                Track Order
              </button>
            </nav>

            {/* Utility Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Trigger */}
              <button
                type="button"
                aria-label="Search catalog"
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-ivory hover:text-gold active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-full"
              >
                <Ico d={ICONS.search} s={20} />
              </button>

              {/* Wishlist Trigger */}
              <button
                type="button"
                aria-label={wish.length > 0 ? `Wishlist (${wish.length} items)` : 'Wishlist (empty)'}
                onClick={() => setIsWishOpen(true)}
                className="relative p-2 text-ivory hover:text-gold active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-full"
              >
                <Ico d={ICONS.heart} s={20} />
                {wish.length > 0 && (
                  <span className="absolute top-0 right-0 text-[9px] font-bold bg-gold text-charcoal rounded-full min-w-4 h-4 px-1 flex items-center justify-center shadow-md animate-pulse">
                    {wish.length}
                  </span>
                )}
              </button>

              {/* Patron Account Trigger */}
              <button
                type="button"
                aria-label={customer ? `Patron Account (${customer.name})` : 'Patron Account Sign In'}
                onClick={() => {
                  if (customer) {
                    setIsAccountModalOpen(true);
                  } else {
                    setIsAuthModalOpen(true);
                  }
                }}
                className="relative p-2 text-ivory hover:text-gold active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-full flex items-center justify-center"
                title={customer ? `Signed in as ${customer.name}` : 'Patron Sign In / Register'}
              >
                {customer ? (
                  <div className="w-5 h-5 rounded-full bg-[#4A0715] text-[#C9A43B] font-serif font-bold text-[10px] flex items-center justify-center border border-[#C9A43B]/60 shadow-xs">
                    {customer.name?.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <Ico d={ICONS.user} s={20} />
                )}
              </button>

              {/* Cart / Shopping Bag Trigger */}
              <button
                type="button"
                aria-label={count > 0 ? `Shopping Bag (${count} items)` : 'Shopping Bag (empty)'}
                onClick={openCart}
                className="relative p-2 text-ivory hover:text-gold active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-full"
              >
                <Ico d={ICONS.bag} s={20} />
                {count > 0 && (
                  <span className="absolute top-0 right-0 text-[9px] font-bold bg-gold text-charcoal rounded-full min-w-4 h-4 px-1 flex items-center justify-center shadow-md">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================
            SOPHISTICATED EDITORIAL MEGA MENU
           ========================================================= */}
        <div
          onMouseEnter={handleMegaEnter}
          onMouseLeave={handleMegaLeave}
          className={`absolute top-full left-0 w-full transition-all duration-400 ease-out pointer-events-none ${
            megaMenuOpen
              ? 'opacity-100 translate-y-0 pointer-events-auto visible'
              : 'opacity-0 -translate-y-2 invisible'
          }`}
        >
          <div className="bg-[#29201E]/95 backdrop-blur-2xl border-b border-gold/30 shadow-[0_25px_60px_rgba(0,0,0,0.8)] py-8 px-6 lg:px-12">
            <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8 items-start">
              {/* Column 1: Heritage Weaves */}
              <div className="col-span-3 space-y-4">
                <span className="cap-sm text-gold tracking-couture block border-b border-gold/20 pb-2">
                  Heritage Weaves
                </span>
                <ul className="space-y-2.5">
                  {[
                    { label: 'Kanjivaram Silk', href: '#collection?fabric=Kanjivaram+Silk' },
                    { label: 'Banarasi Brocades', href: '#collection?fabric=Banarasi+Silk' },
                    { label: 'Tussar & Wild Silks', href: '#collection?fabric=Tussar+Silk' },
                    { label: 'Handloom Cotton', href: '#collection?fabric=Pure+Cotton' },
                    { label: 'Tissue & Organza', href: '#collection?fabric=Organza' },
                    { label: 'Chanderi Zari Weaves', href: '#collection?fabric=Chanderi' },
                  ].map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        onClick={() => setMegaMenuOpen(false)}
                        className="text-sm font-serif text-ivory/80 hover:text-gold hover:translate-x-1 inline-block transition-all duration-200"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 2: Curated Edits */}
              <div className="col-span-3 space-y-4">
                <span className="cap-sm text-gold tracking-couture block border-b border-gold/20 pb-2">
                  Curated Edits
                </span>
                <ul className="space-y-2.5">
                  {[
                    { label: 'The Heritage Runway Lookbook', href: '#new-arrivals' },
                    { label: 'Kalakaari Natural Dyes', href: '#kalakaari' },
                    { label: 'Bridal Trousseau Edit', href: '#collection?occasion=Wedding' },
                    { label: 'Temple & Festive Classics', href: '#collection?occasion=Festive' },
                    { label: 'Handcrafted Zardozi Blouses', href: '#collection?category=Blouses' },
                    { label: 'All Collections Catalog', href: '#collection' },
                  ].map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        onClick={() => setMegaMenuOpen(false)}
                        className="text-sm font-serif text-ivory/80 hover:text-gold hover:translate-x-1 inline-block transition-all duration-200"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3: The VAAGAI Craft */}
              <div className="col-span-3 space-y-4 border-l border-gold/15 pl-6">
                <span className="cap-sm text-gold tracking-couture block border-b border-gold/20 pb-2">
                  Textile Philosophy
                </span>
                <p className="font-serif italic text-sm text-ivory/70 leading-relaxed">
                  “Each saree is woven on traditional South Indian pit-looms using genuine silk and pure silver zari electroplated in 24K gold.”
                </p>
                <div className="pt-2">
                  <a
                    href="#story"
                    onClick={() => setMegaMenuOpen(false)}
                    className="inline-flex items-center gap-2 text-xs font-sans tracking-luxury uppercase text-gold hover:text-champagne transition-colors"
                  >
                    <span>Read Our Manifesto</span>
                    <span>→</span>
                  </a>
                </div>
              </div>

              {/* Column 4: Editorial Spotlight Visual */}
              <div className="col-span-3">
                <a
                  href="#collection"
                  onClick={() => setMegaMenuOpen(false)}
                  className="group block relative aspect-[4/5] rounded-xl overflow-hidden border border-gold/30 shadow-xl"
                >
                  <img
                    src={crimsonSaree}
                    alt="Royal Crimson Kanjivaram"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark via-charcoal-dark/30 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="cap-sm text-gold block mb-1">Spotlight Drapery</span>
                    <h4 className="font-serif text-lg text-ivory group-hover:text-gold transition-colors">
                      Royal Kanjivaram Edition
                    </h4>
                    <span className="text-[11px] font-sans tracking-wider uppercase text-ivory/70 mt-1 inline-block group-hover:underline">
                      Explore Edition →
                    </span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================
          SEARCH MODAL OVERLAY
         ========================================================= */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          isSearchOpen
            ? 'visible opacity-100 pointer-events-auto'
            : 'invisible opacity-0 pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Search VAAGAI catalog"
      >
        <div
          onClick={() => setIsSearchOpen(false)}
          className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        />

        <div className="relative max-w-2xl mx-auto mt-20 sm:mt-28 px-4 sm:px-6">
          <div className="bg-[#29201E] border border-gold/40 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] p-6 sm:p-8 overflow-hidden">
            {/* Search Input Bar */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center gap-3 border-b border-gold/30 pb-4"
            >
              <Ico d={ICONS.search} s={22} className="text-gold shrink-0" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by weave, Kanjivaram, Kalamkari, silk, bridal..."
                className="w-full bg-transparent text-ivory placeholder-ivory/40 font-serif text-lg focus:outline-none"
                aria-label="Search catalog"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-ivory/60 hover:text-gold transition shrink-0"
                  aria-label="Clear search input"
                >
                  <Ico d={ICONS.x} s={18} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-1.5 text-gold hover:text-champagne rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold shrink-0"
                aria-label="Close search"
              >
                <Ico d={ICONS.x} s={22} />
              </button>
            </form>

            {/* Trending Searches Tags */}
            {!searchQuery && (
              <div className="pt-5">
                <p className="cap-sm text-gold/80 mb-3">Trending Searches</p>
                <div className="flex flex-wrap gap-2">
                  {['Kanjivaram Silk', 'Kalamkari', 'Bridal Crimson', 'Organza', 'Tissue Gold', 'Pure Cotton', 'Temple Border'].map(
                    (tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSearchQuery(tag)}
                        className="px-3.5 py-1.5 rounded-full text-xs font-sans tracking-wide text-ivory/80 bg-burgundy/40 border border-gold/25 hover:border-gold hover:text-gold transition-all duration-200"
                      >
                        {tag}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Live Search Results List */}
            {searchQuery && (
              <div className="mt-5 max-h-80 overflow-y-auto pr-1 flex flex-col gap-3">
                {searchResults.length > 0 ? (
                  searchResults.map((product) => {
                    const name = product.name || product.n;
                    const price = product.price || product.p;
                    const img = product.image;
                    return (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-burgundy/30 border border-gold/20 hover:border-gold/50 transition group"
                      >
                        <div
                          onClick={() => {
                            setIsSearchOpen(false);
                            if (openQuickView) openQuickView(product);
                          }}
                          className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
                        >
                          <div className="w-12 h-14 rounded-lg overflow-hidden bg-charcoal shrink-0 border border-gold/20">
                            {img && (
                              <img
                                src={img}
                                alt={name}
                                className="w-full h-full object-cover object-top"
                              />
                            )}
                          </div>
                          <div className="truncate">
                            <p className="font-serif text-base text-ivory group-hover:text-gold transition truncate">
                              {name}
                            </p>
                            <p className="font-sans text-xs text-gold font-medium mt-0.5">
                              {formatINR(price)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            addToCart(product);
                            setIsSearchOpen(false);
                          }}
                          className="px-4 py-1.5 rounded-full text-xs font-sans tracking-luxury uppercase font-semibold bg-gold text-charcoal hover:bg-champagne transition shrink-0 ml-3"
                        >
                          Add
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-10 text-center text-ivory/70 font-serif text-base">
                    No sarees found matching{' '}
                    <span className="text-gold italic">"{searchQuery}"</span>.
                    <p className="font-sans text-xs text-ivory/50 mt-1 uppercase tracking-wider">
                      Try searching for Kanjivaram, Kalamkari, or Silk.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          WISHLIST SLIDE-OVER DRAWER
         ========================================================= */}
      <div
        className={`fixed inset-0 z-50 transition-[visibility] duration-300 ${
          isWishOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Your Curated Wishlist"
      >
        <div
          onClick={() => setIsWishOpen(false)}
          className={`absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300 ${
            isWishOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <aside
          className={`absolute right-0 top-0 h-full w-full max-w-md bg-[#29201E] border-l border-gold/30 shadow-[-20px_0_50px_rgba(0,0,0,0.8)] p-6 sm:p-8 flex flex-col justify-between transition-transform duration-400 ease-out ${
            isWishOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-5 border-b border-gold/25">
              <div className="flex items-center gap-2.5">
                <Ico d={ICONS.heart} s={22} className="text-gold" />
                <h2 className="font-serif text-2xl text-ivory tracking-wide">
                  Curated Wishlist
                </h2>
                {wish.length > 0 && (
                  <span className="text-xs font-sans tracking-widest text-gold ml-1">
                    ({wish.length})
                  </span>
                )}
              </div>
              <button
                ref={wishCloseBtnRef}
                type="button"
                onClick={() => setIsWishOpen(false)}
                className="p-1.5 text-gold hover:text-champagne rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                aria-label="Close wishlist"
              >
                <Ico d={ICONS.x} s={22} />
              </button>
            </div>

            <div className="mt-6 max-h-[calc(100vh-180px)] overflow-y-auto pr-1 flex flex-col gap-3.5">
              {wish.length === 0 ? (
                <div className="py-16 text-center flex flex-col items-center gap-4">
                  <span className="w-16 h-16 rounded-full border border-gold/30 grid place-items-center text-gold/60">
                    <Ico d={ICONS.heart} s={28} />
                  </span>
                  <h3 className="font-serif text-xl text-ivory">Your Wishlist is Empty</h3>
                  <p className="font-serif italic text-sm text-ivory/70 max-w-xs leading-relaxed">
                    Curate your royal wardrobe by saving handcrafted sarees you adore.
                  </p>
                  <a
                    href="#collection"
                    onClick={() => setIsWishOpen(false)}
                    className="btn-gold mt-2 text-xs"
                  >
                    Explore Collections
                  </a>
                </div>
              ) : (
                wish.map((id) => {
                  const product =
                    COLLECTION_PRODUCTS.find((p) => p.id === id) ||
                    PRODUCTS.find((p) => p.id === id) ||
                    { id, name: `Artisanal Saree #${id}`, price: 2899, image: crimsonSaree };
                  const name = product.name || product.n;
                  const price = product.price || product.p;

                  return (
                    <div
                      key={id}
                      className="flex items-center gap-4 p-3 rounded-xl bg-burgundy/25 border border-gold/20"
                    >
                      <div className="w-16 h-20 rounded-lg overflow-hidden bg-charcoal shrink-0 border border-gold/25">
                        <img
                          src={product.image || crimsonSaree}
                          alt={name}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-base text-ivory truncate">{name}</h4>
                        <p className="font-sans text-xs text-gold font-medium mt-0.5">
                          {formatINR(price)}
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <button
                            type="button"
                            onClick={() => {
                              addToCart(product);
                              toggleWishlist(id);
                            }}
                            className="text-xs font-sans tracking-luxury uppercase font-semibold text-gold hover:text-champagne transition"
                          >
                            Move to Bag →
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleWishlist(id)}
                            className="text-xs font-sans tracking-wide text-ivory/50 hover:text-ivory transition"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* =========================================================
          RESPONSIVE MOBILE NAVIGATION DRAWER
         ========================================================= */}
      <div
        className={`fixed inset-0 z-50 transition-[visibility] duration-300 md:hidden ${
          open ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <aside
          className={`absolute left-0 top-0 h-full w-[85%] max-w-sm bg-[#29201E] border-r border-gold/30 p-6 flex flex-col justify-between transition-transform duration-300 ease-out ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-gold/25">
              <div className="flex items-center gap-3">
                <img
                  src={logoVaagai}
                  alt="VAAGAI Emblem"
                  className="w-9 h-9 rounded-full object-cover border border-gold/70 shadow-sm bg-burgundy shrink-0"
                />
                <div className="flex flex-col leading-none">
                  <span className="font-serif text-xl tracking-[0.2em] text-ivory uppercase">
                    VAAGAI
                  </span>
                  <span className="font-sans text-[7.5px] tracking-couture text-gold mt-1 uppercase">
                    South Indian Heritage
                  </span>
                </div>
              </div>
              <button
                ref={mobileCloseBtnRef}
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 text-gold hover:text-champagne"
                aria-label="Close menu"
              >
                <Ico d={ICONS.x} s={22} />
              </button>
            </div>

            <nav className="mt-8 flex flex-col space-y-4">
              {[
                { label: 'Home', href: '#home' },
                { label: 'Collection', href: '#collection' },
                { label: 'Kalakaari', href: '#kalakaari' },
                { label: 'The Runway Lookbook', href: '#new-arrivals' },
                { label: 'Sarees', href: '#collection' },
                { label: 'Our Story', href: '#story' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="font-serif text-xl text-ivory hover:text-gold transition-colors py-1.5 border-b border-gold/10 flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  <span className="text-gold text-sm font-sans">→</span>
                </a>
              ))}

              {/* Track Drape Button */}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setIsTrackingModalOpen(true);
                }}
                className="font-serif text-xl text-ivory hover:text-gold transition-colors py-1.5 border-b border-gold/10 flex items-center justify-between text-left"
              >
                <span>Track Drape Delivery</span>
                <span className="text-gold text-sm font-sans">→</span>
              </button>

              {/* Patron Profile Button */}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  if (customer) {
                    setIsAccountModalOpen(true);
                  } else {
                    setIsAuthModalOpen(true);
                  }
                }}
                className="font-serif text-xl text-gold hover:text-champagne transition-colors py-1.5 border-b border-gold/10 flex items-center justify-between text-left font-bold"
              >
                <span>{customer ? `Patron: ${customer.name}` : 'Sign In / Register'}</span>
                <span className="text-gold text-sm font-sans">✦</span>
              </button>
            </nav>
          </div>

          <div className="pt-6 border-t border-gold/20">
            <p className="cap-sm text-gold/80 mb-2">Bespoke Concierge</p>
            <p className="font-serif italic text-xs text-ivory/70">
              Personalized styling & bridal assistance:
            </p>
            <p className="font-sans text-xs text-gold mt-1">+91 98765 43210</p>
          </div>
        </aside>
      </div>

      {/* Customer Modals */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAccountModalOpen(true)}
      />
      <CustomerAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onTrackOrder={(ordNum) => {
          setActiveTrackingOrderNumber(ordNum);
          setIsTrackingModalOpen(true);
        }}
      />
      <OrderTrackingModal
        isOpen={isTrackingModalOpen}
        initialOrderNumber={activeTrackingOrderNumber}
        onClose={() => {
          setIsTrackingModalOpen(false);
          setActiveTrackingOrderNumber('');
        }}
      />
    </>
  );
}
