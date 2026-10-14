import React, { useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { TONES } from '../data/tones';
import { PRODUCTS, formatINR } from '../data/products';
import { Ico, ICONS, Arrow } from './Icons';

export function CartDrawer() {
  const { cart, isCartOpen, closeCart, setQty, removeFromCart } = useShop();
  const drawerRef = useRef(null);
  const closeBtnRef = useRef(null);
  const previousActiveElement = useRef(null);

  const subtotal = cart.reduce((acc, item) => acc + item.p * item.q, 0);
  const totalItemsCount = cart.reduce((acc, item) => acc + item.q, 0);

  // Keyboard accessibility: Escape key to close & focus management
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };

    if (isCartOpen) {
      previousActiveElement.current = document.activeElement;
      window.addEventListener('keydown', handleKeyDown);

      // Smooth focus on close button
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

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isCartOpen]);

  return (
    <div
      className={`fixed inset-0 z-[60] transition-[visibility] duration-400 ${
        isCartOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
      }`}
      aria-hidden={!isCartOpen}
    >
      {/* Dark Backdrop with smooth blur fade */}
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-black/65 backdrop-blur-sm transition-opacity duration-350 ease-out ${
          isCartOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Right Slide-in Drawer Container */}
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        tabIndex={-1}
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-[#3D0813]/95 via-[#4F0B17]/92 to-[#34050E]/95 backdrop-blur-2xl border-l border-gold/25 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.6),0_0_35px_rgba(79,11,23,0.4)] transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex justify-between items-center p-5 sm:p-6 border-b border-gold/20">
          <div className="flex items-center gap-3">
            <h3
              id="cart-drawer-title"
              className="font-primary text-2xl sm:text-3xl font-normal text-[#FBF4E4]"
            >
              Your Bag
            </h3>
            {totalItemsCount > 0 && (
              <span className="cap glass-pill text-gold px-2.5 py-0.5 rounded-full text-xs font-primary font-medium border border-gold/30">
                {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <button
            ref={closeBtnRef}
            onClick={closeCart}
            aria-label="Close bag"
            className="w-9 h-9 rounded-full border border-gold/30 text-gold hover:bg-gold/15 focus-visible:ring-2 focus-visible:ring-gold transition grid place-items-center"
          >
            <Ico d={ICONS.x} s={20} />
          </button>
        </div>

        {/* Drawer Body */}
        {cart.length === 0 ? (
          /* Empty Cart State */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 rounded-full border border-gold/30 bg-forest/40 backdrop-blur-md grid place-items-center text-gold/75 shadow-[0_0_25px_rgba(212,175,55,0.15)] mb-5">
              <Ico d={ICONS.bag} s={36} />
            </div>
            <h4 className="font-primary text-2xl font-normal text-[#FBF4E4]">
              Your Bag is Empty
            </h4>
            <p className="font-primary italic text-base text-ivory/70 max-w-xs mt-2 leading-relaxed">
              Discover the season’s most exquisite handloom and Kalamkari silks.
            </p>
            <a
              href="#women-new"
              onClick={closeCart}
              className="btn cap mt-7 rounded-full px-7 py-3 text-xs inline-flex items-center gap-2.5 group"
            >
              Explore Collections
              <span className="transform transition-transform group-hover:translate-x-1 duration-300">
                <Arrow />
              </span>
            </a>
          </div>
        ) : (
          /* Cart Items List */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
            {cart.map((item) => {
              const imageSrc =
                item.image || PRODUCTS.find((p) => p.id === item.id)?.image;

              return (
                <div
                  key={item.id}
                  className="glass-card flex gap-3.5 sm:gap-4 items-center p-3 sm:p-3.5 rounded-2xl border border-gold/15 hover:border-gold/35 transition-all"
                >
                  {/* High-Resolution Saree Thumbnail */}
                  <div className="w-20 h-24 sm:w-22 sm:h-28 shrink-0 rounded-xl overflow-hidden relative border border-gold/20 bg-[#2D060E] shadow-md">
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          TONES[item.a] ||
                          'linear-gradient(160deg, #380710, #4F0B17)',
                      }}
                    />
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={item.n}
                        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center font-primary text-gold/40 text-xl font-normal">
                        M
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Product Details & Actions */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-primary text-base sm:text-lg leading-snug font-normal text-[#FBF4E4] truncate">
                          {item.n}
                        </h4>
                        <span className="cap text-gold font-primary font-medium text-xs sm:text-sm shrink-0">
                          {formatINR(item.p * item.q)}
                        </span>
                      </div>
                      <p className="text-ivory/60 text-xs mt-0.5">
                        Unit: {formatINR(item.p)}
                      </p>
                    </div>

                    {/* Quantity Controls & Remove Action */}
                    <div className="flex items-center justify-between gap-3 mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQty(item.id, Math.max(1, item.q - 1))}
                          disabled={item.q <= 1}
                          aria-label={`Decrease quantity of ${item.n}`}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-gold/40 text-gold hover:bg-gold hover:text-forest active:scale-95 focus-visible:ring-2 focus-visible:ring-gold transition grid place-items-center text-sm disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gold"
                        >
                          −
                        </button>
                        <span className="text-ivory font-primary text-sm w-6 text-center font-medium">
                          {item.q}
                        </span>
                        <button
                          onClick={() => setQty(item.id, item.q + 1)}
                          aria-label={`Increase quantity of ${item.n}`}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-gold/40 text-gold hover:bg-gold hover:text-forest active:scale-95 focus-visible:ring-2 focus-visible:ring-gold transition grid place-items-center text-sm"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.n} from bag`}
                        className="cap text-xs text-ivory/50 hover:text-gold hover:underline transition-colors flex items-center gap-1 py-1 px-1.5 focus-visible:ring-1 focus-visible:ring-gold rounded"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Drawer Footer: Subtotal & Checkout */}
        <div className="p-5 sm:p-6 border-t border-gold/25 bg-[#3B0711]/60">
          <div className="flex justify-between items-baseline cap mb-1.5">
            <span className="text-sm font-medium tracking-wider">Subtotal</span>
            <span className="text-gold font-primary text-lg font-semibold tracking-wide">
              {formatINR(subtotal)}
            </span>
          </div>
          <p className="text-[11px] text-ivory/60 mb-5">
            Taxes included · Complimentary luxury shipping
          </p>

          <button
            onClick={() => {
              if (cart.length > 0) {
                // Keep connected cleanly without invented payment simulation
                window.location.hash = '#checkout';
                closeCart();
              }
            }}
            disabled={cart.length === 0}
            className="btn cap w-full justify-center group disabled:opacity-40 disabled:cursor-not-allowed rounded-full py-3.5 text-xs sm:text-sm font-medium shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_35px_rgba(212,175,55,0.45)] transition-all"
          >
            Checkout{' '}
            <span className="transform transition-transform group-hover:translate-x-1 duration-300">
              <Arrow />
            </span>
          </button>
        </div>
      </aside>
    </div>
  );
}
