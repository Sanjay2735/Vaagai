import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { Ico, ICONS } from './Icons';
import { PRODUCTS, formatINR } from '../data/products';

export function Navbar() {
  const { cart, wish, openCart, addToCart, toggleWishlist } = useShop();

  const [open, setOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWishOpen, setIsWishOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Header background activates solid glass if scrolled or hovered
  const isSolid = isScrolled || isHovered;

  const searchInputRef = useRef(null);
  const mobileCloseBtnRef = useRef(null);
  const wishCloseBtnRef = useRef(null);
  const isBodyLockedRef = useRef(false);
  const originalOverflowRef = useRef('');

  // Passive scroll listener for silky glassmorphism transition without hover flickering
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Safely and idempotently lock/restore body scroll when modals open/close
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
      // Cleanup on unmount
      if (isBodyLockedRef.current) {
        isBodyLockedRef.current = false;
        document.body.style.overflow = originalOverflowRef.current;
      }
    };
  }, [open, isSearchOpen, isWishOpen]);

  // Keyboard accessibility: Escape key closes active overlay, manage focus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isSearchOpen) {
          setIsSearchOpen(false);
        } else if (isWishOpen) {
          setIsWishOpen(false);
        } else if (open) {
          setOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, isSearchOpen, isWishOpen]);

  // Autofocus input when search modal opens
  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  // Focus close button when wishlist drawer opens
  useEffect(() => {
    if (isWishOpen) {
      const timer = setTimeout(() => {
        wishCloseBtnRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isWishOpen]);

  // Focus close button when mobile drawer opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        mobileCloseBtnRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const count = cart.reduce((acc, curr) => acc + curr.q, 0);

  // Filter products for search modal
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const searchResults = trimmedQuery
    ? PRODUCTS.filter(
        (p) =>
          p.n.toLowerCase().includes(trimmedQuery) ||
          (p.a && p.a.toLowerCase().includes(trimmedQuery)) ||
          (p.b && p.b.toLowerCase().includes(trimmedQuery))
      )
    : [];

  // Filter wishlisted products from catalog
  const wishItems = PRODUCTS.filter((p) => wish.includes(p.id));

  // Elegant navigation link with refined gold hover underline animation
  const NavLink = ({ href, children, onClick }) => {
    const handleClick = (e) => {
      if (onClick) onClick(e);

      // Handle reliable anchor scrolling when navigating on the Home page
      if (href && href.startsWith('#')) {
        const isPageNav =
          href === '#women-new' ||
          href === '#/women-new' ||
          href === '#kalakaari' ||
          href === '#/kalakaari';
        const currentHash = window.location.hash || '#/';
        const isCurrentHome =
          !currentHash ||
          currentHash === '#/' ||
          currentHash.startsWith('#new') ||
          currentHash.startsWith('#best') ||
          currentHash.startsWith('#story') ||
          currentHash.startsWith('#explore') ||
          currentHash.startsWith('#trust');

        if (!isPageNav && isCurrentHome) {
          const targetId = href.replace(/^#\/?/, '#');
          if (targetId === '#' || targetId === '#/') {
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
          } else {
            // Smoothly scroll to the target section with navbar clearance
            setTimeout(() => {
              const el = document.querySelector(targetId);
              if (el) {
                el.classList.add('scroll-visible');
                const navbar = document.querySelector('header, nav');
                const navbarHeight = navbar ? navbar.offsetHeight : 80;
                const elementTop = el.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({
                  top: Math.max(0, elementTop - navbarHeight - 16),
                  left: 0,
                  behavior: 'smooth',
                });
              }
            }, 30);
          }
        }
      }
    };

    return (
      <a
        href={href}
        onClick={handleClick}
        className="relative py-1 text-ivory hover:text-gold transition-colors duration-300 font-primary text-xs tracking-widest uppercase font-medium after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-gradient-to-r after:from-transparent after:via-[#D4AF37] after:to-transparent after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
      >
        {children}
      </a>
    );
  };

  // Center Brand Logo
  const logo = (
    <a
      href="#/"
      onClick={() => {
        const currentHash = window.location.hash || '#/';
        const isCurrentHome =
          !currentHash ||
          currentHash === '#/' ||
          currentHash.startsWith('#new') ||
          currentHash.startsWith('#best') ||
          currentHash.startsWith('#story') ||
          currentHash.startsWith('#explore');
        if (isCurrentHome) {
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }
      }}
      className="flex flex-col items-center justify-center gap-1 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-lg px-2 py-0.5 select-none"
      aria-label="Vaagai - Return to Home"
    >
      <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-gold/80 flex items-center justify-center font-primary text-xl sm:text-2xl text-gold group-hover:bg-gold group-hover:text-forest group-hover:shadow-[0_0_18px_rgba(212,175,55,0.5)] transition-all duration-300 bg-[#240409]/60 backdrop-blur-md">
        V
      </span>
      <span className="font-primary text-[8.5px] sm:text-[9.5px] tracking-[0.3em] uppercase text-gold group-hover:text-[#FFF4D4] font-medium transition-colors duration-300 whitespace-nowrap">
        Vaagai
      </span>
    </a>
  );

  return (
    <>
      <header
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed top-0 inset-x-0 z-40 py-2.5 sm:py-3 transition-all duration-500 ease-out"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 10px)' }}
      >
        {/* Silky smooth full-header glassmorphism overlay with ambient glow */}
        <div
          className={`absolute inset-0 -z-10 transition-opacity duration-500 ease-in-out pointer-events-none ${
            isSolid ? 'opacity-100' : 'opacity-0'
          } bg-[#4F0B17]/70 backdrop-blur-[20px] border-b border-gold/20 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_25px_rgba(79,11,23,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]`}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-3 items-center">
          {/* Left Navigation Links (Desktop) */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-6 lg:gap-8 justify-self-start"
          >
            <NavLink href="#/">Home</NavLink>
            <NavLink href="#women-new">Women</NavLink>
            <NavLink href="#kalakaari">Kalakaari</NavLink>
          </nav>

          {/* Mobile Menu Trigger Button (Left) */}
          <div className="md:hidden justify-self-start flex items-center">
            <button
              type="button"
              className="p-1.5 -ml-1.5 text-ivory hover:text-gold active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-full"
              aria-label={open ? 'Close menu' : 'Open navigation menu'}
              aria-expanded={open}
              aria-controls="mobile-nav-drawer"
              onClick={() => setOpen(true)}
            >
              <Ico d={ICONS.menu} s={24} />
            </button>
          </div>

          {/* Exact Dead-Center Brand Logo */}
          <div className="justify-self-center">{logo}</div>

          {/* Right Navigation & Utility Action Controls */}
          <div className="justify-self-end flex items-center gap-4 sm:gap-6 lg:gap-8">
            {/* Secondary Navigation Links (Desktop lg+) */}
            <nav
              aria-label="Secondary Navigation"
              className="hidden lg:flex items-center gap-6 xl:gap-8"
            >
              <NavLink href="#new">New Arrivals</NavLink>
              <NavLink href="#best">Best Sellers</NavLink>
              <NavLink href="#story">Our Story</NavLink>
            </nav>

            {/* Utility Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3.5">
              {/* Search Trigger Button */}
              <button
                type="button"
                aria-label="Search sarees"
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-ivory hover:text-gold active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-full"
              >
                <Ico d={ICONS.search} s={20} />
              </button>

              {/* Wishlist Trigger Button */}
              <button
                type="button"
                aria-label={
                  wish.length > 0 ? `Wishlist, ${wish.length} items` : 'Wishlist, empty'
                }
                onClick={() => setIsWishOpen(true)}
                className="relative p-2 text-ivory hover:text-gold active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-full"
              >
                <Ico d={ICONS.heart} s={20} />
                {wish.length > 0 && (
                  <span className="absolute top-0 right-0 text-[9px] font-bold bg-gold text-forest rounded-full min-w-4 h-4 px-1 flex items-center justify-center shadow-md">
                    {wish.length}
                  </span>
                )}
              </button>

              {/* Cart Trigger Button */}
              <button
                type="button"
                aria-label={
                  count > 0 ? `Shopping cart, ${count} items` : 'Shopping cart, empty'
                }
                onClick={openCart}
                className="relative p-2 text-ivory hover:text-gold active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-full"
              >
                <Ico d={ICONS.bag} s={20} />
                {count > 0 && (
                  <span className="absolute top-0 right-0 text-[9px] font-bold bg-gold text-forest rounded-full min-w-4 h-4 px-1 flex items-center justify-center shadow-md">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================
          1. SEARCH MODAL OVERLAY
         ========================================================= */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          isSearchOpen
            ? 'visible opacity-100 pointer-events-auto'
            : 'invisible opacity-0 pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Search sarees"
      >
        {/* Dimmed backdrop */}
        <div
          onClick={() => setIsSearchOpen(false)}
          className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        />

        {/* Search Dialog Container */}
        <div className="relative max-w-2xl mx-auto mt-16 sm:mt-24 px-4 sm:px-6">
          <div className="bg-gradient-to-b from-[#240409] to-[#120204] border border-gold/40 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(212,175,55,0.25)] p-5 sm:p-7 overflow-hidden">
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
                placeholder="Search by saree name, Kalamkari, Kanjivaram, silk..."
                className="w-full bg-transparent text-ivory placeholder-ivory/50 font-primary text-sm sm:text-base focus:outline-none"
                aria-label="Search saree catalog"
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
                className="p-1.5 text-gold hover:text-[#FFF4D4] rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold shrink-0"
                aria-label="Close search"
              >
                <Ico d={ICONS.x} s={22} />
              </button>
            </form>

            {/* Popular Searches Tags (when empty) */}
            {!searchQuery && (
              <div className="pt-4">
                <p className="font-primary text-[11px] uppercase tracking-wider text-gold/80 mb-2.5">
                  Popular Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Kanjivaram', 'Kalamkari', 'Tussar', 'Organza', 'Chanderi', 'Cotton'].map(
                    (tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSearchQuery(tag)}
                        className="px-3 py-1 rounded-full text-xs font-primary text-ivory/80 bg-[#3A0710]/60 border border-gold/25 hover:border-gold hover:text-gold transition-all duration-200"
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
              <div className="mt-4 max-h-72 overflow-y-auto pr-1 flex flex-col gap-2.5">
                {searchResults.length > 0 ? (
                  searchResults.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#3A0710]/40 border border-gold/15 hover:border-gold/40 transition group"
                    >
                      <a
                        href="#women-new"
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center gap-3.5 flex-1 min-w-0"
                      >
                        <div className="w-12 h-14 rounded-lg overflow-hidden bg-forest/80 shrink-0 border border-gold/20">
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.n}
                              className="w-full h-full object-cover object-top"
                            />
                          )}
                        </div>
                        <div className="truncate">
                          <p className="font-primary text-sm sm:text-base text-ivory group-hover:text-gold transition truncate">
                            {product.n}
                          </p>
                          <p className="font-primary text-xs text-gold font-medium">
                            {formatINR(product.p)}
                          </p>
                        </div>
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          addToCart(product);
                          setIsSearchOpen(false);
                        }}
                        className="px-3 py-1.5 rounded-full text-xs font-primary uppercase tracking-wider font-semibold bg-gold text-forest hover:bg-[#FFF4D4] transition shrink-0 ml-3"
                      >
                        Add to Bag
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-ivory/70 font-primary text-sm">
                    No sarees found matching{' '}
                    <span className="text-gold">"{searchQuery}"</span>.
                    <p className="text-xs text-ivory/50 mt-1">
                      Try searching for Kalamkari, Silk, or Organza.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          2. WISHLIST SLIDE-OVER DRAWER
         ========================================================= */}
      <div
        className={`fixed inset-0 z-50 transition-[visibility] duration-300 ${
          isWishOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Your Royal Wishlist"
      >
        {/* Dark Backdrop */}
        <div
          onClick={() => setIsWishOpen(false)}
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
            isWishOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Drawer Panel */}
        <aside
          className={`absolute right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-[#240409] via-[#1A0307] to-[#120204] border-l border-gold/30 shadow-[-15px_0_40px_rgba(0,0,0,0.8)] p-6 sm:p-7 flex flex-col justify-between transition-transform duration-400 ease-out ${
            isWishOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-5 border-b border-gold/30">
              <div className="flex items-center gap-2.5">
                <Ico d={ICONS.heart} s={22} className="text-gold" />
                <h2 className="font-primary text-xl sm:text-2xl text-ivory tracking-wide">
                  Royal Wishlist
                </h2>
                {wish.length > 0 && (
                  <span className="text-xs font-primary uppercase tracking-widest text-gold/80 ml-1">
                    ({wish.length})
                  </span>
                )}
              </div>
              <button
                ref={wishCloseBtnRef}
                type="button"
                onClick={() => setIsWishOpen(false)}
                className="p-1.5 text-gold hover:text-[#FFF4D4] rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                aria-label="Close wishlist"
              >
                <Ico d={ICONS.x} s={22} />
              </button>
            </div>

            {/* Items list or empty state */}
            <div className="mt-6 max-h-[calc(100vh-160px)] overflow-y-auto pr-1 flex flex-col gap-3.5">
              {wishItems.length === 0 ? (
                <div className="py-16 text-center flex flex-col items-center gap-4">
                  <span className="w-16 h-16 rounded-full border border-gold/30 grid place-items-center text-gold/60">
                    <Ico d={ICONS.heart} s={28} />
                  </span>
                  <h3 className="font-primary text-lg text-ivory">Your Wishlist is Empty</h3>
                  <p className="font-primary text-xs text-ivory/60 max-w-xs leading-relaxed">
                    Curate your royal wardrobe by saving handcrafted sarees you adore.
                  </p>
                  <a
                    href="#women-new"
                    onClick={() => setIsWishOpen(false)}
                    className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gold text-forest font-primary text-xs uppercase tracking-widest font-semibold hover:bg-[#FFF4D4] transition"
                  >
                    Explore Collections
                  </a>
                </div>
              ) : (
                wishItems.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3.5 p-3 rounded-xl bg-[#3A0710]/40 border border-gold/20"
                  >
                    <div className="w-16 h-20 rounded-lg overflow-hidden bg-forest shrink-0 border border-gold/25">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.n}
                          className="w-full h-full object-cover object-top"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-primary text-base text-ivory truncate">{product.n}</h4>
                      <p className="font-primary text-sm text-gold font-medium mt-0.5">
                        {formatINR(product.p)}
                      </p>
                      <div className="flex items-center gap-3 mt-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            addToCart(product);
                            toggleWishlist(product.id);
                          }}
                          className="text-[11px] font-primary uppercase tracking-wider font-semibold text-gold hover:text-[#FFF4D4] underline underline-offset-2 transition"
                        >
                          Move to Bag
                        </button>
                        <span className="text-gold/40 text-xs">|</span>
                        <button
                          type="button"
                          onClick={() => toggleWishlist(product.id)}
                          className="text-[11px] font-primary uppercase tracking-wider text-ivory/60 hover:text-red-400 transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* =========================================================
          3. MOBILE NAVIGATION DRAWER
         ========================================================= */}
      <div
        id="mobile-nav-drawer"
        className={`fixed inset-0 z-50 md:hidden transition-[visibility] duration-300 ${
          open ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
      >
        {/* Backdrop */}
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Aside Drawer */}
        <aside
          className={`absolute left-0 top-0 h-full w-full max-w-xs sm:max-w-sm bg-gradient-to-b from-[#240409] via-[#1A0307] to-[#120204] border-r border-gold/30 p-6 sm:p-8 flex flex-col justify-between transition-transform duration-400 ease-out overflow-y-auto ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{
            paddingTop: 'max(env(safe-area-inset-top), 24px)',
            paddingBottom: 'max(env(safe-area-inset-bottom), 24px)',
          }}
        >
          <div>
            {/* Drawer Top Header with Brand & Close Button */}
            <div className="flex items-center justify-between pb-6 border-b border-gold/25">
              <a
                href="#/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 group"
              >
                <span className="w-9 h-9 rounded-full border border-gold flex items-center justify-center font-primary text-lg text-gold bg-[#3A0710]/60">
                  V
                </span>
                <span className="font-primary text-[10px] tracking-[0.25em] uppercase text-gold font-medium">
                  Vaagai
                </span>
              </a>
              <button
                ref={mobileCloseBtnRef}
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 text-gold hover:text-[#FFF4D4] rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                aria-label="Close menu"
              >
                <Ico d={ICONS.x} s={22} />
              </button>
            </div>

            {/* Navigation Links Stack */}
            <nav aria-label="Mobile Navigation" className="flex flex-col gap-4 sm:gap-5 mt-6">
              <NavLink href="#/" onClick={() => setOpen(false)}>
                Home
              </NavLink>
              <NavLink href="#women-new" onClick={() => setOpen(false)}>
                Women
              </NavLink>
              <NavLink href="#kalakaari" onClick={() => setOpen(false)}>
                Kalakaari
              </NavLink>
              <NavLink href="#new" onClick={() => setOpen(false)}>
                New Arrivals
              </NavLink>
              <NavLink href="#best" onClick={() => setOpen(false)}>
                Best Sellers
              </NavLink>
              <NavLink href="#story" onClick={() => setOpen(false)}>
                Our Story
              </NavLink>
            </nav>
          </div>

          {/* Mobile Action Controls at bottom of drawer */}
          <div className="pt-6 border-t border-gold/25 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setIsSearchOpen(true);
              }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#3A0710]/50 border border-gold/20 text-ivory hover:text-gold transition font-primary text-xs uppercase tracking-wider font-medium"
            >
              <Ico d={ICONS.search} s={18} className="text-gold" />
              Search Collections
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setIsWishOpen(true);
              }}
              className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#3A0710]/50 border border-gold/20 text-ivory hover:text-gold transition font-primary text-xs uppercase tracking-wider font-medium"
            >
              <span className="flex items-center gap-3">
                <Ico d={ICONS.heart} s={18} className="text-gold" />
                My Wishlist
              </span>
              {wish.length > 0 && (
                <span className="text-[10px] font-bold bg-gold text-forest px-2 py-0.5 rounded-full">
                  {wish.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openCart();
              }}
              className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gold text-forest font-primary text-xs uppercase tracking-wider font-semibold hover:bg-[#FFF4D4] transition"
            >
              <span className="flex items-center gap-3">
                <Ico d={ICONS.bag} s={18} />
                Shopping Bag
              </span>
              {count > 0 && (
                <span className="text-[10px] font-bold bg-forest text-gold px-2 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
