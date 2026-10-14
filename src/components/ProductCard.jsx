import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { TONES } from '../data/tones';
import { formatINR } from '../data/products';
import { ICONS } from './Icons';

export function ProductCard({ product, index = 0 }) {
  const { wish, toggleWishlist, addToCart } = useShop();
  const [imageError, setImageError] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const isWishlisted = wish.includes(product.id);

  // Destination route for product details (Kalakaari edit or Women collection)
  const productHref =
    product.a === 'kala' || product.b === 'kala' ? '#kalakaari' : '#women-new';

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdded) return;
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 800);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="product-wave-card h-full">
      <div className="glass-card group rounded-2xl p-2 sm:p-2.5 h-full flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-1.5 motion-reduce:hover:translate-y-0 motion-reduce:transition-none hover:border-[#D4AF37]/45 hover:shadow-[0_18px_40px_rgba(0,0,0,0.55),0_0_20px_rgba(212,175,55,0.18)]">
        {/* Saree Image Container (Fixed 3:4 aspect ratio) */}
        <div className="product-image-container relative aspect-[3/4] overflow-hidden rounded-xl bg-[#2D060E] select-none">
          {/* Foundation Gradient Textures (Fabric Tones) */}
          <div
            className="product-image-layer absolute inset-0 transition-transform duration-1000 ease-out group-hover:scale-105 motion-reduce:group-hover:scale-100"
            style={{
              background:
                TONES[product.a] ||
                'linear-gradient(160deg, #380710 0%, #681220 50%, #4F0B17 100%)',
            }}
          />
          <div
            className="product-image-layer absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-700 ease-out"
            style={{
              background:
                TONES[product.b] ||
                'linear-gradient(150deg, #5c1a3a, #b6446b)',
            }}
          />
          <div className="leaf absolute -inset-4 mix-blend-multiply opacity-40 pointer-events-none" />

          {/* Saree Product Image with Fallback and Smooth Hover Zoom */}
          {product.image && !imageError ? (
            <a
              href={productHref}
              tabIndex="-1"
              aria-hidden="true"
              className="absolute inset-0 block cursor-pointer"
            >
              <img
                src={product.image}
                alt={product.n}
                loading="lazy"
                onError={() => setImageError(true)}
                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:group-hover:scale-100 will-change-transform"
              />
            </a>
          ) : (
            /* Fallback Fabric Medallion when image is unavailable or loading fails */
            <a
              href={productHref}
              tabIndex="-1"
              aria-hidden="true"
              className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center cursor-pointer"
            >
              <span className="w-12 h-12 rounded-full border border-gold/40 flex items-center justify-center font-primary text-xl text-gold bg-[#240409]/60 backdrop-blur-sm mb-2">
                M
              </span>
              <span className="font-primary text-sm text-[#FBF4E4] font-light">
                {product.n}
              </span>
            </a>
          )}

          {/* Gradient Vignette at Bottom for Contrast */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

          {/* Wishlist Button with Filled/Outlined Heart */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            aria-label={
              isWishlisted
                ? `Remove ${product.n} from wishlist`
                : `Add ${product.n} to wishlist`
            }
            className={`absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center backdrop-blur-md shadow-md transition-all duration-300 z-20 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
              isWishlisted
                ? 'bg-[#2D060E]/90 text-gold border-gold shadow-[0_0_14px_rgba(212,175,55,0.45)]'
                : 'bg-[#1F0307]/75 text-ivory/80 border-gold/30 hover:text-gold hover:border-gold/70'
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={isWishlisted ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.3"
              aria-hidden="true"
            >
              {ICONS.heart}
            </svg>
          </button>

          {/* Quick Add to Bag Button */}
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isAdded}
            aria-label={`Quick add ${product.n} to cart`}
            className="cap absolute bottom-0 inset-x-0 bg-gold text-forest py-2.5 sm:py-3 font-semibold text-[10px] sm:text-[11px] tracking-wider uppercase translate-y-full group-hover:translate-y-0 group-focus-within:translate-y-0 max-md:translate-y-0 transition-transform duration-400 hover:bg-[#FFF4D4] active:scale-[0.98] shadow-[0_-4px_16px_rgba(212,175,55,0.35)] z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset"
          >
            {isAdded ? 'Added to Bag ✓' : 'Quick Add +'}
          </button>
        </div>

        {/* Product Details (Title & Price) */}
        <div className="px-1.5 pt-2 pb-0.5 flex flex-col justify-between flex-1">
          <h3 className="font-primary text-base sm:text-lg md:text-xl font-normal leading-snug line-clamp-1 text-[#FBF4E4] hover:text-gold transition-colors duration-200">
            <a
              href={productHref}
              className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold rounded"
            >
              {product.n}
            </a>
          </h3>
          <p className="cap text-gold mt-1 font-medium tracking-wider text-xs sm:text-sm">
            {formatINR(product.p)}
          </p>
        </div>
      </div>
    </div>
  );
}
