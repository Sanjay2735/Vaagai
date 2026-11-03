import React, { useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { formatINR } from '../data/products';
import { Ico, ICONS } from './Icons';

export function CartDrawer() {
  const { cart, isCartOpen, closeCart, setQty, removeFromCart } = useShop();
  const drawerRef = useRef(null);
  const closeBtnRef = useRef(null);
  const previousActiveElement = useRef(null);

  const subtotal = cart.reduce((acc, item) => acc + (item.p || item.price || 0) * item.q, 0);
  const totalItemsCount = cart.reduce((acc, item) => acc + item.q, 0);

  // Free shipping threshold
  const freeShippingThreshold = 2000;
  const isFreeShipping = subtotal >= freeShippingThreshold || totalItemsCount === 0;
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  // Escape key & focus management
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };

    if (isCartOpen) {
      previousActiveElement.current = document.activeElement;
      window.addEventListener('keydown', handleKeyDown);
      const timer = setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 50);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        clearTimeout(timer);
      };
    } else if (previousActiveElement.current) {
      previousActiveElement.current.focus?.();
    }
  }, [isCartOpen, closeCart]);

  // Lock body scroll
  useEffect(() => {
    if (isCartOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isCartOpen]);

  const handleCheckout = () => {
    closeCart();
    window.location.hash = '#checkout';
  };

  return (
    <div
      className={`fixed inset-0 z-[60] transition-[visibility] duration-300 ${
        isCartOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
      }`}
      aria-hidden={!isCartOpen}
    >
      {/* Dark Backdrop */}
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Slide-in Drawer Container */}
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-[#29201E] border-l border-gold/30 flex flex-col shadow-[-25px_0_60px_rgba(0,0,0,0.8)] transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex justify-between items-center p-6 border-b border-gold/20">
          <div className="flex items-center gap-3">
            <h3
              id="cart-drawer-title"
              className="font-serif text-2xl sm:text-3xl text-ivory font-normal"
            >
              Shopping Bag
            </h3>
            {totalItemsCount > 0 && (
              <span className="cap-sm text-gold px-2.5 py-0.5 rounded-full border border-gold/30 bg-burgundy/40">
                {totalItemsCount} {totalItemsCount === 1 ? 'drape' : 'drapes'}
              </span>
            )}
          </div>
          <button
            ref={closeBtnRef}
            onClick={closeCart}
            aria-label="Close bag"
            className="w-9 h-9 rounded-full border border-gold/30 text-gold hover:bg-gold hover:text-charcoal transition flex items-center justify-center"
          >
            <Ico d={ICONS.x} s={20} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-burgundy/30 px-6 py-3 border-b border-gold/15">
          <div className="flex items-center justify-between text-xs font-sans mb-1.5">
            <span className="text-ivory/80">
              {isFreeShipping
                ? '✦ Complimentary Insured Courier Shipping Unlocked'
                : `Add ${formatINR(amountNeeded)} more for Free Insured Courier Delivery`}
            </span>
          </div>
          <div className="w-full h-1 bg-charcoal rounded-full overflow-hidden">
            <div
              className="h-full bg-gold transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Drawer Body */}
        {cart.length === 0 ? (
          /* Empty Bag State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full border border-gold/30 bg-burgundy/30 grid place-items-center text-gold mb-6 shadow-md">
              <Ico d={ICONS.bag} s={36} />
            </div>
            <h4 className="font-serif text-2xl text-ivory font-normal">
              Your Bag is Empty
            </h4>
            <p className="font-serif italic text-sm text-ivory/70 max-w-xs mt-2 leading-relaxed">
              Discover the season’s most exquisite handloom Kanjivaram and Kalamkari silks.
            </p>
            <a
              href="#collection"
              onClick={closeCart}
              className="btn-gold text-xs mt-8"
            >
              Explore Collections
            </a>
          </div>
        ) : (
          /* Cart Items List */
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.map((item) => {
              const name = item.name || item.n || 'Artisanal Saree';
              const price = item.price || item.p || 0;
              const img = item.image;

              return (
                <div
                  key={item.id}
                  className="flex gap-4 p-3.5 rounded-xl bg-burgundy/25 border border-gold/20 items-center justify-between"
                >
                  {/* Thumbnail */}
                  <div className="w-18 h-22 rounded-lg overflow-hidden bg-charcoal shrink-0 border border-gold/25">
                    {img && (
                      <img
                        src={img}
                        alt={name}
                        className="w-full h-full object-cover object-top"
                      />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="cap-sm text-gold/80 block text-[9px]">
                      {item.fabric || 'Pure Silk Handloom'}
                    </span>
                    <h5 className="font-serif text-base text-ivory truncate mt-0.5">
                      {name}
                    </h5>
                    <p className="font-sans text-sm text-gold font-medium mt-1">
                      {formatINR(price)}
                    </p>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex items-center border border-gold/30 rounded-full bg-charcoal p-0.5">
                        <button
                          type="button"
                          onClick={() => setQty(item.id, item.q - 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-ivory/80 hover:text-gold"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-7 text-center font-sans text-xs font-semibold text-ivory">
                          {item.q}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(item.id, item.q + 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-ivory/80 hover:text-gold"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-[11px] font-sans text-ivory/50 hover:text-red-400 transition ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Item Subtotal */}
                  <div className="text-right shrink-0">
                    <span className="font-sans text-sm font-semibold text-ivory">
                      {formatINR(price * item.q)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Drawer Footer with Subtotal & Checkout Action */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-gold/20 bg-charcoal-dark/95 space-y-4">
            <div className="space-y-1.5 text-xs font-sans">
              <div className="flex justify-between text-ivory/70">
                <span>Subtotal</span>
                <span className="font-medium text-ivory">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-ivory/70">
                <span>Transit Insurance &amp; Courier</span>
                <span className="text-gold font-medium">COMPLIMENTARY</span>
              </div>
              <div className="flex justify-between text-base font-serif pt-2 border-t border-gold/15 text-ivory">
                <span className="font-medium">Total</span>
                <span className="font-sans text-lg font-semibold text-gold">
                  {formatINR(subtotal)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              className="w-full btn-gold text-xs py-3.5 shadow-xl"
            >
              Proceed to Secure Checkout →
            </button>

            <button
              type="button"
              onClick={closeCart}
              className="w-full text-center text-xs font-sans tracking-luxury uppercase text-ivory/60 hover:text-gold transition py-1"
            >
              Continue Exploring Catalog
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
