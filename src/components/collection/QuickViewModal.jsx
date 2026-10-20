import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { CloseX, HeartIcon, StarIcon, CheckIcon } from './CollectionIcons';
import { useShop } from '../../context/ShopContext';
import { getProductImages, normalizeProduct } from '../../data/collectionData';

export function QuickViewModal({ product: rawProduct, initialVariantIndex = 0, isOpen, onClose }) {
  const { wish, toggleWishlist, addToCart } = useShop();

  const product = useMemo(() => normalizeProduct(rawProduct), [rawProduct]);

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(initialVariantIndex);
  const [selectedSize, setSelectedSize] = useState('Free Size');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const modalRef = useRef(null);
  const touchStartXRef = useRef(null);

  useEffect(() => {
    setSelectedVariantIndex(initialVariantIndex);
    setActiveImageIndex(0);
    setQuantity(1);
    setIsPaused(false);
    if (product?.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product, initialVariantIndex]);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const variants = product?.variants || [];
  const currentVariant = variants[selectedVariantIndex] || variants[0] || {};
  const isWishlisted = product ? wish.includes(product.id) : false;

  // Retrieve curated 4 distinct images for this product & colorway
  const galleryImages = getProductImages(product, currentVariant);

  // Auto-slideshow: slowly transitions between all 4 images when open (every 3.8s)
  useEffect(() => {
    if (!isOpen || isPaused || galleryImages.length <= 1) return;

    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
    }, 3800);

    return () => clearInterval(interval);
  }, [isOpen, isPaused, galleryImages.length, selectedVariantIndex]);

  if (!isOpen || !product) return null;

  const handleNext = () => {
    setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrev = () => {
    setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  // Mobile touch swipe gesture handlers
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
    touchStartXRef.current = null;
  };

  const handleAddToCart = () => {
    addToCart({
      id: `${product.id}-${currentVariant.color || 'default'}-${selectedSize}`,
      n: `${product.name} (${currentVariant.color || 'Standard'}, ${selectedSize})`,
      p: product.price,
      image: galleryImages[activeImageIndex] || product.image,
      category: product.category,
      fabric: product.fabric,
      q: quantity,
    });
    setIsAddedSuccess(true);
    setTimeout(() => {
      setIsAddedSuccess(false);
      onClose();
    }, 700);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view: ${product.name}`}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Modal Dialog */}
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl bg-gradient-to-b from-[#2A050B] to-[#180204] border border-gold/30 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden z-10 my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close Button - 44px touch area for mobile */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 rounded-full bg-gold/15 hover:bg-gold/30 text-gold border border-gold/30 flex items-center justify-center transition-colors z-30 focus:outline-none"
          aria-label="Close modal"
        >
          <CloseX className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[88dvh] sm:max-h-[85vh] overflow-y-auto overscroll-contain">
          {/* ================= LEFT: 4-IMAGE SLOW AUTO-SLIDESHOW ================= */}
          <div
            className="bg-[#1C0307]/80 p-4 sm:p-6 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-gold/20"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Main Stage Image with Slow Dissolve Crossfade & Touch Pan */}
            <div
              className="relative aspect-[4/5] w-full max-w-[290px] xs:max-w-[320px] sm:max-w-[340px] rounded-xl overflow-hidden bg-[#240409] border border-gold/25 shadow-2xl touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* All 4 images mounted with slow 1-second crossfade transition */}
              {galleryImages.map((img, idx) => (
                <img
                  key={`${currentVariant.color || 'var'}-${idx}`}
                  src={img}
                  alt={`${product.name} view ${idx + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-1000 ease-in-out will-change-[opacity,transform] ${
                    idx === activeImageIndex
                      ? 'opacity-100 scale-100 z-10'
                      : 'opacity-0 scale-[1.03] z-0 pointer-events-none'
                  }`}
                />
              ))}

              {/* Top Progress Dashes (Shows active image 1 of 4 with gold progress) */}
              <div className="absolute top-2.5 inset-x-3 flex items-center gap-1.5 z-20">
                {galleryImages.map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className="flex-1 h-1 bg-black/50 rounded-full overflow-hidden cursor-pointer backdrop-blur-xs border border-white/10"
                    title={`View photo ${idx + 1}`}
                  >
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        idx === activeImageIndex
                          ? 'w-full bg-gold shadow-[0_0_8px_rgba(212,175,55,0.9)]'
                          : idx < activeImageIndex
                          ? 'w-full bg-gold/50'
                          : 'w-0'
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* Prev Arrow */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-gold border border-gold/30 flex items-center justify-center transition-all opacity-85 hover:opacity-100 z-20 text-lg leading-none"
                aria-label="Previous photo"
              >
                ‹
              </button>

              {/* Next Arrow */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-gold border border-gold/30 flex items-center justify-center transition-all opacity-85 hover:opacity-100 z-20 text-lg leading-none"
                aria-label="Next photo"
              >
                ›
              </button>

              {/* Product Badge */}
              {product.badge && (
                <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-gold text-forest shadow-xs z-20">
                  {product.badge}
                </span>
              )}

              {/* Slide Counter Indicator */}
              <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-black/60 text-gold border border-gold/30 backdrop-blur-xs z-20">
                {activeImageIndex + 1} / {galleryImages.length}
              </span>
            </div>

            {/* Thumbnail Strip (all 4 images interactive) */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-2 mt-3.5 max-w-full overflow-x-auto pb-1 px-1">
                {galleryImages.map((img, idx) => {
                  const isActive = idx === activeImageIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-12 h-14 sm:w-14 sm:h-16 rounded-lg border overflow-hidden transition-all bg-[#240409] shrink-0 ${
                        isActive
                          ? 'border-gold ring-2 ring-gold/70 scale-105 shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                          : 'border-gold/20 opacity-60 hover:opacity-100'
                      }`}
                      aria-label={`Switch to image ${idx + 1}`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover object-top"
                      />
                      {isActive && (
                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gold" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ================= RIGHT: PRODUCT DETAILS & BUY ACTIONS ================= */}
          <div className="p-5 sm:p-7 md:p-8 flex flex-col justify-between space-y-5 text-ivory">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs text-gold/80 mb-1.5">
                <span className="uppercase tracking-widest font-medium text-gold">
                  {product.category}
                </span>
                <div className="flex items-center gap-1">
                  <StarIcon className="w-3.5 h-3.5 text-gold" />
                  <span className="font-semibold text-ivory">{product.rating}</span>
                  <span className="text-ivory/50">({product.reviewsCount} reviews)</span>
                </div>
              </div>

              {/* Product Name */}
              <h2 className="text-lg sm:text-2xl font-serif tracking-tight text-ivory font-medium">
                {product.name}
              </h2>

              {/* SKU */}
              <p className="text-[11px] text-ivory/50 mt-0.5 uppercase tracking-wider">
                SKU: {product.sku}
              </p>

              {/* Price & Discount */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl font-bold text-gold tracking-tight">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-ivory/50 line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {product.discount && (
                  <span className="text-xs font-semibold text-gold bg-gold/15 border border-gold/30 px-2 py-0.5 rounded">
                    {product.discount}
                  </span>
                )}
              </div>

              <div className="h-px bg-gold/20 my-4" />

              {/* Color Selection */}
              {variants.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-medium text-ivory/80">
                      Color:{' '}
                      <span className="text-gold font-semibold">
                        {currentVariant.color}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {variants.map((v, idx) => {
                      const isSelected = idx === selectedVariantIndex;
                      return (
                        <button
                          key={v.color}
                          type="button"
                          onClick={() => {
                            setSelectedVariantIndex(idx);
                            setActiveImageIndex(0);
                          }}
                          className={`w-7 h-7 sm:w-6 sm:h-6 rounded-full transition-transform flex items-center justify-center touch-manipulation ${
                            v.hex === '#FDFBF7' ? 'border border-gold/30' : ''
                          } ${
                            isSelected
                              ? 'ring-2 ring-gold ring-offset-2 ring-offset-[#2A050B] scale-110'
                              : 'hover:scale-105 opacity-80 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: v.hex }}
                          title={v.color}
                          aria-label={`Choose ${v.color}`}
                        >
                          {isSelected && (
                            <CheckIcon
                              className={`w-3 h-3 ${
                                v.hex === '#FDFBF7' ? 'text-stone-900' : 'text-white'
                              }`}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-medium text-ivory/80">Size:</span>
                    <span className="text-[11px] text-ivory/50">
                      {product.sizes.includes('Free Size')
                        ? 'Includes Unstitched Blouse Piece'
                        : 'True to size chart'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`text-xs px-3.5 py-2 sm:py-1.5 rounded border transition-colors touch-manipulation ${
                          selectedSize === sz
                            ? 'border-gold bg-gold text-forest font-semibold shadow-xs'
                            : 'border-gold/30 text-ivory/80 bg-gold/5 hover:border-gold hover:text-ivory'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selection */}
              <div className="flex items-center gap-4 mb-4">
                <span className="text-xs font-medium text-ivory/80">Quantity:</span>
                <div className="inline-flex items-center border border-gold/30 rounded bg-gold/5">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-gold hover:text-ivory hover:bg-gold/20 transition-colors touch-manipulation text-base"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-semibold text-ivory">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-gold hover:text-ivory hover:bg-gold/20 transition-colors touch-manipulation text-base"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <span className="text-[11px] text-emerald-400 font-medium">● In Stock</span>
              </div>

              {/* Product Specifications & Authenticity */}
              <div className="bg-gold/5 rounded-lg p-3.5 text-xs space-y-1.5 border border-gold/20">
                <div className="flex items-start gap-2">
                  <span className="text-gold font-medium shrink-0">Fabric:</span>
                  <span className="text-ivory">{product.fabric}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gold font-medium shrink-0">Occasion:</span>
                  <span className="text-ivory">{product.occasion}</span>
                </div>
                {product.blouseIncluded && (
                  <div className="flex items-start gap-2">
                    <span className="text-gold font-medium shrink-0">Blouse:</span>
                    <span className="text-ivory">{product.blouseIncluded}</span>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <span className="text-gold font-medium shrink-0">Care:</span>
                  <span className="text-ivory">{product.careInstructions}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Add to Bag & Wishlist */}
            <div className="flex items-center gap-3 pt-3 border-t border-gold/20">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAddedSuccess}
                className="flex-1 py-3.5 px-4 rounded-lg bg-gradient-to-r from-[#D4AF37] via-[#E8C872] to-[#D4AF37] text-forest font-bold hover:brightness-110 active:scale-[0.99] transition-all text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-gold/20 flex items-center justify-center gap-2 touch-manipulation"
              >
                {isAddedSuccess ? (
                  <>
                    <CheckIcon className="w-4 h-4 text-forest" />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <span>Add to Bag • ₹{(product.price * quantity).toLocaleString('en-IN')}</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`w-12 h-12 rounded-lg border flex items-center justify-center transition-colors touch-manipulation ${
                  isWishlisted
                    ? 'border-red-400/60 bg-red-950/40 text-red-400'
                    : 'border-gold/30 text-gold hover:border-gold hover:bg-gold/15 bg-gold/5'
                }`}
                aria-label={isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
              >
                <HeartIcon filled={isWishlisted} className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
