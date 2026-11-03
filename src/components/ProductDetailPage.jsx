import React, { useState, useEffect, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { formatINR } from '../data/products';
import { getProductImages, normalizeProduct, COLLECTION_PRODUCTS } from '../data/collectionData';
import { HeartIcon, StarIcon, CheckIcon, EyeIcon } from './collection/CollectionIcons';
import { ProductCard } from './ProductCard';

export function ProductDetailPage({ product: rawProduct, onBack }) {
  const { wish, toggleWishlist, addToCart, openCart } = useShop();

  const product = useMemo(() => normalizeProduct(rawProduct), [rawProduct]);

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('Free Size');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('specs');
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setSelectedVariantIndex(0);
    setActiveImageIndex(0);
    setQuantity(1);
    setPincodeStatus(null);
  }, [product?.id]);

  if (!product) return null;

  const variants = product.variants || [];
  const currentVariant = variants[selectedVariantIndex] || variants[0] || {};
  const isWishlisted = wish.includes(product.id);

  // Retrieve curated 4 high-resolution images
  const galleryImages = getProductImages(product, currentVariant);
  const activeImage = galleryImages[activeImageIndex] || product.image;

  // Related products from same category
  const relatedProducts = COLLECTION_PRODUCTS.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.fabric === product.fabric)
  ).slice(0, 4);

  const handleAddToCart = () => {
    addToCart({
      id: `${product.id}-${currentVariant.color || 'default'}-${selectedSize}`,
      name: `${product.name} (${currentVariant.color || 'Standard'}, ${selectedSize})`,
      n: `${product.name} (${currentVariant.color || 'Standard'}, ${selectedSize})`,
      price: product.price,
      p: product.price,
      image: activeImage,
      category: product.category,
      fabric: product.fabric,
      q: quantity,
    });
    setIsAddedSuccess(true);
    setTimeout(() => {
      setIsAddedSuccess(false);
      openCart();
    }, 800);
  };

  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (pincode.trim().length === 6) {
      setPincodeStatus({
        valid: true,
        message: 'Express Delivery Available — Estimated Arrival within 3–4 business days via Blue Dart Luxury Courier.',
      });
    } else {
      setPincodeStatus({
        valid: false,
        message: 'Please enter a valid 6-digit Indian postal code.',
      });
    }
  };

  return (
    <div className="bg-[#FAF7F2] text-[#29201E] min-h-screen pt-28 pb-20 selection:bg-gold selection:text-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumbs"
          className="flex items-center gap-2 text-xs font-sans tracking-wide text-[#70594B] mb-8"
        >
          <a href="#home" className="hover:text-[#4A0715] transition">Home</a>
          <span>/</span>
          <a href="#collection" className="hover:text-[#4A0715] transition">Collections</a>
          <span>/</span>
          <span className="text-[#4A0715] font-medium">{product.name}</span>
        </nav>

        {/* Back Link */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-sans tracking-luxury uppercase text-[#720F25] hover:text-[#4A0715] mb-6 font-semibold"
          >
            ← Return to Collection
          </button>
        )}

        {/* Product Details Layout: Left Gallery, Right Editorial Shopping Panel */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* ================= LEFT: EDITORIAL IMAGE GALLERY ================= */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Main Stage Image with Zoom */}
            <div
              className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-charcoal border border-[#D9C5A5] shadow-xl group cursor-zoom-in"
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <img
                src={activeImage}
                alt={`${product.name} - view ${activeImageIndex + 1}`}
                className={`w-full h-full object-cover object-top transition-transform duration-700 ease-out ${
                  isZoomed ? 'scale-150 cursor-zoom-out' : 'group-hover:scale-105'
                }`}
              />

              {product.badge && (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-sans font-semibold tracking-wider uppercase bg-[#4A0715] text-[#F5EEE5] shadow-md">
                  {product.badge}
                </span>
              )}

              <span className="absolute bottom-4 right-4 bg-charcoal/70 backdrop-blur-md text-ivory text-[11px] font-sans px-3 py-1 rounded-full">
                {isZoomed ? 'Click to reset' : 'Click to zoom'} · 0{activeImageIndex + 1} / 0{galleryImages.length}
              </span>
            </div>

            {/* 4 Gallery Thumbnails */}
            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActiveImageIndex(idx);
                    setIsZoomed(false);
                  }}
                  className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${
                    idx === activeImageIndex
                      ? 'border-[#C9A43B] shadow-md scale-102'
                      : 'border-[#D9C5A5] opacity-70 hover:opacity-100 hover:border-[#C9A43B]/60'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover object-top"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* ================= RIGHT: LUXURY COMMERCE PANEL ================= */}
          <div className="lg:col-span-5 flex flex-col">
            {/* Weave & SKU */}
            <div className="flex items-center justify-between gap-4 pb-2 border-b border-[#D9C5A5]">
              <span className="cap-sm text-[#720F25]">
                {product.fabric} · {product.category}
              </span>
              <span className="font-sans text-xs text-[#70594B]">
                SKU: {product.sku}
              </span>
            </div>

            {/* Product Display Title */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#29201E] mt-3">
              {product.name}
            </h1>

            {/* Rating Stars & Client Love */}
            <div className="flex items-center gap-2 mt-2.5">
              <div className="flex text-[#C9A43B]">
                {'★★★★★'.split('').map((s, i) => (
                  <span key={i} className="text-sm">★</span>
                ))}
              </div>
              <span className="font-sans text-xs text-[#70594B] font-medium">
                {product.rating || '4.9'} ({product.reviewsCount || 38} Connoisseur Reviews)
              </span>
            </div>

            {/* Price & Savings */}
            <div className="flex items-baseline gap-3 mt-5 pb-5 border-b border-[#D9C5A5]">
              <span className="font-serif text-3xl sm:text-4xl font-semibold text-[#720F25]">
                {formatINR(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="font-sans text-base text-[#70594B]/60 line-through">
                    {formatINR(product.originalPrice)}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-sans font-semibold tracking-wider uppercase bg-[#720F25]/10 text-[#720F25] border border-[#720F25]/30">
                    {product.discount || 'Special Offer'}
                  </span>
                </>
              )}
              <span className="text-[11px] font-sans text-[#70594B] block ml-auto">
                Inclusive of all taxes
              </span>
            </div>

            {/* Editorial Description */}
            <p className="font-serif italic text-base sm:text-lg text-[#29201E]/80 mt-5 leading-relaxed">
              {product.description}
            </p>

            {/* Colorway Selection */}
            {variants.length > 0 && (
              <div className="mt-6">
                <span className="cap-sm text-[#70594B] block mb-2.5">
                  Color Drape: <strong className="text-[#29201E]">{currentVariant.color || 'Standard'}</strong>
                </span>
                <div className="flex items-center gap-2.5">
                  {variants.map((v, idx) => (
                    <button
                      key={v.color || idx}
                      type="button"
                      onClick={() => {
                        setSelectedVariantIndex(idx);
                        setActiveImageIndex(0);
                      }}
                      className={`relative w-8 h-8 rounded-full border-2 transition-all p-0.5 ${
                        idx === selectedVariantIndex
                          ? 'border-[#720F25] scale-110 shadow-md ring-2 ring-gold/40'
                          : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: v.hex || '#631322' }}
                      title={v.color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size & Blouse Specs */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="cap-sm text-[#70594B]">Sizing / Drapery Format</span>
                <span className="text-xs font-sans text-[#720F25] underline cursor-pointer">
                  Saree Drape Guide
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Free Size (5.5m + 0.8m Blouse)', 'Unstitched', 'Pre-Stitched Drape'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-xl text-xs font-sans tracking-wide transition-all ${
                      selectedSize === size
                        ? 'bg-[#4A0715] text-[#F5EEE5] font-semibold shadow-sm'
                        : 'bg-[#E9D9BF]/60 text-[#29201E]/80 hover:bg-[#D9C5A5]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Stepper & Actions */}
            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center border border-[#D9C5A5] rounded-full bg-[#FAF7F2] p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-sans hover:bg-[#E9D9BF] transition"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-10 text-center font-sans text-sm font-semibold">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.min(10, prev + 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-sans hover:bg-[#E9D9BF] transition"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex-1 btn-burgundy text-xs py-3.5 ${
                  isAddedSuccess ? 'bg-[#29201E] border-gold text-gold shadow-lg' : ''
                }`}
              >
                {isAddedSuccess ? '✓ Added to Shopping Bag' : 'Add to Shopping Bag'}
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className="w-12 h-12 rounded-full border border-[#D9C5A5] flex items-center justify-center text-[#720F25] hover:border-[#720F25] transition bg-[#FAF7F2] shadow-xs"
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <HeartIcon
                  filled={isWishlisted}
                  className={`w-5 h-5 ${isWishlisted ? 'text-[#720F25] fill-[#720F25]' : 'text-[#70594B]'}`}
                />
              </button>
            </div>

            {/* Pincode & Express Delivery Checker */}
            <form onSubmit={handleCheckPincode} className="mt-8 p-4 rounded-xl border border-[#D9C5A5] bg-[#E9D9BF]/30">
              <span className="cap-sm text-[#70594B] block mb-2">Check Delivery Estimate</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit Pincode"
                  className="flex-1 bg-[#FAF7F2] border border-[#D9C5A5] rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-[#720F25]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#4A0715] text-[#F5EEE5] text-xs font-sans tracking-luxury uppercase font-semibold hover:bg-[#720F25] transition"
                >
                  Verify
                </button>
              </div>
              {pincodeStatus && (
                <p className={`text-xs font-sans mt-2.5 ${pincodeStatus.valid ? 'text-[#14532D]' : 'text-[#B91C1C]'}`}>
                  {pincodeStatus.message}
                </p>
              )}
            </form>

            {/* Tabbed Specifications */}
            <div className="mt-8 border-t border-[#D9C5A5] pt-6">
              <div className="flex items-center gap-6 border-b border-[#D9C5A5] pb-3 mb-4">
                {[
                  { id: 'specs', label: 'Specifications' },
                  { id: 'care', label: 'Artisanal Care' },
                  { id: 'shipping', label: 'Insured Shipping' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className={`font-sans text-xs tracking-luxury uppercase pb-2 transition-all border-b-2 ${
                      activeTab === t.id
                        ? 'border-[#720F25] text-[#720F25] font-semibold'
                        : 'border-transparent text-[#70594B] hover:text-[#29201E]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {activeTab === 'specs' && (
                <div className="space-y-2 text-sm font-serif text-[#29201E]/80">
                  <div className="flex justify-between py-1 border-b border-[#D9C5A5]/40">
                    <span className="font-sans text-xs text-[#70594B]">Fabric Composition:</span>
                    <span>{product.fabric || 'Pure Mulberry Silk'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#D9C5A5]/40">
                    <span className="font-sans text-xs text-[#70594B]">Saree Dimensions:</span>
                    <span>5.5 Meters Standard Length</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#D9C5A5]/40">
                    <span className="font-sans text-xs text-[#70594B]">Blouse Piece:</span>
                    <span>{product.blouseIncluded || '80 cm unstitched pure silk included'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#D9C5A5]/40">
                    <span className="font-sans text-xs text-[#70594B]">Weaving Provenance:</span>
                    <span>Traditional Pit-Looms of Tamil Nadu</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-sans text-xs text-[#70594B]">Zari Metallurgy:</span>
                    <span>Electroplated 24K Gold &amp; Silver Zari</span>
                  </div>
                </div>
              )}

              {activeTab === 'care' && (
                <div className="text-sm font-serif text-[#29201E]/80 space-y-2">
                  <p>• Dry clean only by heritage garment specialists.</p>
                  <p>• Avoid spraying perfume directly onto pure gold zari borders.</p>
                  <p>• Wrap in clean, breathable muslin cloth; do not store in airtight plastic bags.</p>
                  <p>• Periodically refold every 3–4 months along alternate crease lines.</p>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="text-sm font-serif text-[#29201E]/80 space-y-2">
                  <p>• Dispatched within 24–48 hours of artisanal quality inspection.</p>
                  <p>• 100% transit-insured with Blue Dart Luxury &amp; DHL Express.</p>
                  <p>• Sealed with authentic tamper-evident VAAGAI wax medallion.</p>
                  <p>• Complimentary domestic courier shipping on all orders.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= RELATED / PAIRING SAREES ================= */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-16 border-t border-[#D9C5A5]">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="cap-sm text-[#720F25] tracking-couture block mb-1">
                  Artisanal Harmony
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl text-[#29201E]">
                  Complete Your Ceremonial Wardrobe
                </h3>
              </div>
              <a
                href="#collection"
                className="editorial-link font-sans text-xs tracking-luxury uppercase text-[#720F25]"
              >
                View Full Collection →
              </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p, idx) => (
                <ProductCard key={p.id} product={p} index={idx} isLight={true} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

