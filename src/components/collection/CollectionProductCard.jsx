import React, { useState, useRef } from 'react';
import { HeartIcon, EyeIcon } from './CollectionIcons';
import { useShop } from '../../context/ShopContext';
import { getProductImages } from '../../data/collectionData';

export function CollectionProductCard({ product, onQuickView }) {
  const { wish, toggleWishlist } = useShop();

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const [mobileImageIndex, setMobileImageIndex] = useState(0); // 0 or 1 for mobile swipe/tap

  const touchStartXRef = useRef(null);

  const isWishlisted = wish.includes(product.id);
  const variants = product.variants && product.variants.length > 0 ? product.variants : [];
  const currentVariant = variants[selectedVariantIndex] || variants[0] || {};

  // Retrieve curated 4-image set for this variant/product
  const productImages = getProductImages(product, currentVariant);
  const primaryImage = productImages[0] || currentVariant.image || product.image;
  const secondaryImage = productImages[1] || currentVariant.secondaryImage || primaryImage;

  // Touch Swipe for Mobile Preview
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 35) {
      // Toggle between primary and secondary image on swipe
      setMobileImageIndex((prev) => (prev === 0 ? 1 : 0));
    }
    touchStartXRef.current = null;
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHeartAnimating(true);
    toggleWishlist(product.id);
    setTimeout(() => setIsHeartAnimating(false), 500);
  };

  const isShowingSecondary = isHovered || mobileImageIndex === 1;

  return (
    <div
      className="group relative flex flex-col h-full text-ivory select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMobileImageIndex(0);
      }}
    >
      {/* ================= 1. PORTRAIT IMAGE CONTAINER ================= */}
      <div
        className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-[#2A050B]/70 border border-gold/20 group-hover:border-gold/50 shadow-md group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all duration-500 cursor-pointer touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => onQuickView(product, selectedVariantIndex)}
      >
        {/* Layer 1: Primary Catalog Flatlay Image */}
        <img
          src={primaryImage}
          alt={`${product.name} - ${currentVariant.color || ''}`}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-700 ease-in-out will-change-[opacity,transform] ${
            isShowingSecondary
              ? 'opacity-0 scale-105 pointer-events-none'
              : 'opacity-100 scale-100'
          }`}
        />

        {/* Layer 2: Next Editorial Draped Image (revealed smoothly on hover or mobile swipe) */}
        {secondaryImage && (
          <img
            src={secondaryImage}
            alt={`${product.name} - ${currentVariant.color || ''} alternate view`}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-700 ease-in-out will-change-[opacity,transform] ${
              isShowingSecondary
                ? 'opacity-100 scale-[1.02]'
                : 'opacity-0 scale-95 pointer-events-none'
            }`}
          />
        )}

        {/* Understated Product Badge */}
        {product.badge && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-[#240409]/90 text-gold border border-gold/30 shadow-xs backdrop-blur-xs pointer-events-none z-10">
            {product.badge}
          </span>
        )}

        {/* Wishlist Heart Button (Top-Right) */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={
            isWishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-xs z-20 border ${
            isWishlisted
              ? 'bg-[#240409] text-gold border-gold shadow-[0_0_12px_rgba(212,175,55,0.45)]'
              : 'bg-[#1F0307]/80 text-ivory/80 border-gold/30 hover:text-gold hover:border-gold shadow-xs'
          } ${isHeartAnimating ? 'scale-125' : 'scale-100'}`}
        >
          <HeartIcon
            filled={isWishlisted}
            className={`w-4 h-4 transition-transform ${
              isWishlisted ? 'text-gold' : 'text-ivory/80'
            }`}
          />
        </button>

        {/* Mobile 2-Image Indicator Dots (Lets mobile users tap or swipe to switch views) */}
        <div
          className="md:hidden absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-xs pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            setMobileImageIndex((prev) => (prev === 0 ? 1 : 0));
          }}
          title="Tap to preview next image"
        >
          <span
            className={`h-1.5 rounded-full transition-all duration-300 ${
              mobileImageIndex === 0 ? 'w-3 bg-gold' : 'w-1.5 bg-ivory/40'
            }`}
          />
          <span
            className={`h-1.5 rounded-full transition-all duration-300 ${
              mobileImageIndex === 1 ? 'w-3 bg-gold' : 'w-1.5 bg-ivory/40'
            }`}
          />
        </div>

        {/* Quick View Floating Pill Button (Revealed on desktop hover near bottom) */}
        <div className="hidden md:flex absolute inset-x-0 bottom-3 px-3 items-center justify-center pointer-events-none z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product, selectedVariantIndex);
            }}
            className="pointer-events-auto opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gold text-forest text-[11px] font-semibold tracking-wide shadow-[0_4px_16px_rgba(212,175,55,0.35)] hover:bg-[#FFF4D4] active:scale-95"
            aria-label={`Quick view ${product.name}`}
          >
            <EyeIcon className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* ================= 2. PRODUCT DETAILS DIRECTLY BELOW ================= */}
      <div className="pt-2.5 pb-1 flex flex-col flex-1">
        {/* Product Title */}
        <h3
          onClick={() => onQuickView(product, selectedVariantIndex)}
          className="text-xs sm:text-[13px] font-medium text-ivory hover:text-gold transition-colors line-clamp-1 cursor-pointer leading-tight tracking-tight"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Pricing Info */}
        <div className="mt-1 flex items-baseline gap-2">
          {/* Selling Price */}
          <span className="text-xs sm:text-[13px] font-semibold text-gold">
            ₹{product.price.toLocaleString('en-IN')}
          </span>

          {/* Original MRP */}
          {product.originalPrice && (
            <span className="text-[11px] text-ivory/50 line-through">
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}

          {/* Discount Tag */}
          {product.discount && (
            <span className="text-[10px] text-red-200 font-medium bg-red-950/70 border border-red-800/40 px-1.5 py-0.5 rounded">
              {product.discount}
            </span>
          )}
        </div>

        {/* Small Circular Color Variant Swatches (Directly below price, like reference image!) */}
        {variants.length > 0 && (
          <div
            className="mt-2 flex items-center gap-1.5"
            role="radiogroup"
            aria-label={`Color variants for ${product.name}`}
          >
            {variants.map((v, idx) => {
              const isSelected = idx === selectedVariantIndex;
              return (
                <button
                  key={v.color}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVariantIndex(idx);
                    setMobileImageIndex(0);
                  }}
                  title={v.color}
                  aria-label={`Select ${v.color} color`}
                  aria-checked={isSelected}
                  role="radio"
                  className={`w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 rounded-full transition-all focus:outline-none p-0 ${
                    v.hex === '#FDFBF7' ? 'border border-gold/40' : ''
                  } ${
                    isSelected
                      ? 'ring-1.5 ring-gold ring-offset-1 ring-offset-[#380710] scale-110'
                      : 'hover:scale-110 opacity-75 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: v.hex }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
