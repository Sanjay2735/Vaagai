import React, { useState, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { TONES } from '../data/tones';
import { formatINR } from '../data/products';
import { ICONS } from './Icons';
import { HeartIcon, EyeIcon } from './collection/CollectionIcons';
import { getProductImages } from '../data/collectionData';

export function ProductCard({ product, index = 0, isLight = false }) {
  const { wish, toggleWishlist, addToCart, openQuickView } = useShop();
  const [imageError, setImageError] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mobileImageIndex, setMobileImageIndex] = useState(0);

  const touchStartXRef = useRef(null);

  const isWishlisted = wish.includes(product.id);
  const productName = product.name || product.n || 'Artisanal Handloom Saree';
  const productPrice = product.price || product.p || 2499;
  const originalPrice = product.originalPrice || Math.round(productPrice * 1.35);

  // Retrieve curated 4-image set for this product
  const productImages = getProductImages(product);
  const primaryImage = productImages[0] || product.image;
  const secondaryImage = productImages[1] || primaryImage;
  const isShowingSecondary = (isHovered || mobileImageIndex === 1) && Boolean(secondaryImage);

  // Mobile Touch Swipe between primary and secondary image
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 35) {
      setMobileImageIndex((prev) => (prev === 0 ? 1 : 0));
    }
    touchStartXRef.current = null;
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdded) return;
    addToCart({
      id: product.id,
      name: productName,
      n: productName,
      price: productPrice,
      p: productPrice,
      image: primaryImage,
      category: product.category || 'Silk Sarees',
      fabric: product.fabric || 'Pure Handloom Silk',
      q: 1,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 900);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleOpenQuickView = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (openQuickView) {
      openQuickView(product, 0);
    }
  };

  return (
    <div
      className={`group relative flex flex-col justify-between h-full rounded-2xl p-2.5 sm:p-3 transition-all duration-400 ease-out hover:-translate-y-1.5 ${
        isLight
          ? 'bg-[#FAF7F2] border border-[#D9C5A5] text-[#29201E] shadow-sm hover:shadow-xl hover:border-[#C9A43B]'
          : 'bg-[#29201E]/60 border border-gold/20 text-ivory shadow-md hover:shadow-2xl hover:border-gold/50'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMobileImageIndex(0);
      }}
    >
      {/* Saree Image Container (Fixed 3:4 aspect ratio) */}
      <div
        className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-charcoal select-none cursor-pointer"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleOpenQuickView}
      >
        {/* Primary Studio / Catalog Flatlay */}
        <img
          src={primaryImage}
          alt={productName}
          className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-700 ease-in-out ${
            isShowingSecondary
              ? 'opacity-0 scale-105 pointer-events-none'
              : 'opacity-100 scale-100'
          }`}
        />

        {/* Secondary Editorial Draped Shot (revealed on hover/swipe) */}
        {secondaryImage && (
          <img
            src={secondaryImage}
            alt={`${productName} draped`}
            className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-700 ease-in-out ${
              isShowingSecondary
                ? 'opacity-100 scale-[1.02]'
                : 'opacity-0 scale-95 pointer-events-none'
            }`}
          />
        )}

        {/* Product Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.badge ? (
            <span className="px-2 py-0.5 rounded text-[9px] font-sans font-semibold tracking-wider uppercase bg-[#29201E]/90 text-gold border border-gold/30 backdrop-blur-xs">
              {product.badge}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[9px] font-sans font-semibold tracking-wider uppercase bg-burgundy/90 text-gold border border-gold/30 backdrop-blur-xs">
              Handwoven
            </span>
          )}
        </div>

        {/* Wishlist Heart Button (Top-Right) */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-charcoal/60 backdrop-blur-md text-ivory/80 hover:text-gold transition z-10 shadow-sm"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <HeartIcon
            filled={isWishlisted}
            className={`w-4 h-4 ${isWishlisted ? 'text-gold fill-gold' : 'text-ivory'}`}
          />
        </button>

        {/* Quick View Floating Magnifier Trigger */}
        <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 px-4">
          <button
            type="button"
            onClick={handleOpenQuickView}
            className="w-full py-2 rounded-full bg-charcoal/90 text-gold backdrop-blur-md border border-gold/40 text-xs font-sans tracking-luxury uppercase font-semibold hover:bg-gold hover:text-charcoal transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <EyeIcon className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Information Footer */}
      <div className="pt-3.5 flex flex-col justify-between flex-1">
        <div>
          <span
            className={`cap-sm block text-[9.5px] ${
              isLight ? 'text-[#70594B]' : 'text-gold/80'
            }`}
          >
            {product.fabric || 'Pure Silk Handloom'}
          </span>

          <h3
            onClick={handleOpenQuickView}
            className={`font-serif text-base sm:text-lg font-medium truncate mt-0.5 cursor-pointer transition-colors ${
              isLight
                ? 'text-[#29201E] group-hover:text-[#720F25]'
                : 'text-ivory group-hover:text-gold'
            }`}
          >
            {productName}
          </h3>
        </div>

        {/* Pricing and Quick Add Bar */}
        <div
          className={`flex items-center justify-between gap-2 mt-3 pt-2.5 border-t ${
            isLight ? 'border-[#D9C5A5]' : 'border-gold/15'
          }`}
        >
          <div className="flex items-baseline gap-2">
            <span
              className={`font-sans text-sm sm:text-base font-semibold ${
                isLight ? 'text-[#720F25]' : 'text-gold'
              }`}
            >
              {formatINR(productPrice)}
            </span>
            {originalPrice > productPrice && (
              <span
                className={`font-sans text-xs line-through ${
                  isLight ? 'text-[#70594B]/60' : 'text-ivory/40'
                }`}
              >
                {formatINR(originalPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            className={`px-3.5 py-1.5 rounded-full text-xs font-sans tracking-luxury uppercase font-semibold transition-all duration-300 ${
              isAdded
                ? 'bg-gold text-charcoal scale-105 shadow-md'
                : isLight
                ? 'bg-[#4A0715] text-[#F5EEE5] hover:bg-[#720F25]'
                : 'bg-gold text-charcoal hover:bg-champagne'
            }`}
          >
            {isAdded ? '✓ Added' : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
