import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useShop } from '../../context/ShopContext';
import { COLLECTION_PRODUCTS } from '../../data/collectionData';
import { CollectionToolbar } from './CollectionToolbar';
import { CollectionProductCard } from './CollectionProductCard';
import { MobileFilterDrawer } from './MobileFilterDrawer';
import { CollectionPagination } from './CollectionPagination';
import {
  CATEGORIES,
  COLORS,
  FABRICS,
  OCCASIONS,
  SIZES,
} from '../../data/collectionData';

export function CollectionPage({
  products = COLLECTION_PRODUCTS,
  categories = CATEGORIES,
  colors = COLORS,
  fabrics = FABRICS,
  occasions = OCCASIONS,
  sizes = SIZES,
  pageMode = 'collection',
}) {
  const topAnchorRef = useRef(null);

  const defaultCategory = categories[0] || 'All Categories';

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedFabrics, setSelectedFabrics] = useState([]);
  const [selectedOccasions, setSelectedOccasions] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 6000]);

  // Reset category when page/products change
  useEffect(() => {
    setSelectedCategory(categories[0] || 'All Categories');
    setSelectedColors([]);
    setSelectedFabrics([]);
    setSelectedOccasions([]);
    setSelectedSizes([]);
    setPriceRange([0, 6000]);
    setCurrentPage(1);
  }, [products, categories]);

  // Sorting & Layout Density
  const [sortBy, setSortBy] = useState('featured');
  const { openQuickView } = useShop();
  const [gridDensity, setGridDensity] = useState(4); // 2, 3, or 4 columns
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Toggle Handlers
  const handleColorToggle = (colorName) => {
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
    setCurrentPage(1);
  };

  const handleFabricToggle = (fabricName) => {
    setSelectedFabrics((prev) =>
      prev.includes(fabricName) ? prev.filter((f) => f !== fabricName) : [...prev, fabricName]
    );
    setCurrentPage(1);
  };

  const handleOccasionToggle = (occName) => {
    setSelectedOccasions((prev) =>
      prev.includes(occName) ? prev.filter((o) => o !== occName) : [...prev, occName]
    );
    setCurrentPage(1);
  };

  const handleSizeToggle = (sizeLabel) => {
    setSelectedSizes((prev) =>
      prev.includes(sizeLabel) ? prev.filter((s) => s !== sizeLabel) : [...prev, sizeLabel]
    );
    setCurrentPage(1);
  };

  const handleClearAll = () => {
    setSelectedCategory(defaultCategory);
    setSelectedColors([]);
    setSelectedFabrics([]);
    setSelectedOccasions([]);
    setSelectedSizes([]);
    setPriceRange([0, 6000]);
    setCurrentPage(1);
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Category Filter
      if (
        selectedCategory &&
        selectedCategory !== defaultCategory &&
        selectedCategory !== 'All Categories' &&
        selectedCategory !== 'All Kalamkari'
      ) {
        const matchesCat =
          product.category === selectedCategory ||
          product.parentCategory === selectedCategory;
        if (!matchesCat) return false;
      }

      // 2. Color Filter (matches product variants)
      if (selectedColors.length > 0) {
        const productColors = (product.variants || []).map((v) => v.color);
        const hasMatchingColor = selectedColors.some((c) => productColors.includes(c));
        if (!hasMatchingColor) return false;
      }

      // 3. Fabric Filter
      if (selectedFabrics.length > 0) {
        if (!selectedFabrics.includes(product.fabric)) return false;
      }

      // 4. Occasion Filter
      if (selectedOccasions.length > 0) {
        if (!selectedOccasions.includes(product.occasion)) return false;
      }

      // 5. Size Filter
      if (selectedSizes.length > 0) {
        const productSizes = product.sizes || [];
        const hasMatchingSize = selectedSizes.some((s) => productSizes.includes(s));
        if (!hasMatchingSize) return false;
      }

      // 6. Price Range Filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      if (sortBy === 'rating') return b.rating - a.rating;
      // Default / Featured
      return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
    });
  }, [
    selectedCategory,
    selectedColors,
    selectedFabrics,
    selectedOccasions,
    selectedSizes,
    priceRange,
    sortBy,
  ]);

  // Paginated Slices
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Determine grid column class based on density setting
  const gridClasses = useMemo(() => {
    if (gridDensity === 2) {
      return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-2 gap-x-4 gap-y-7 sm:gap-x-6 sm:gap-y-9';
    }
    if (gridDensity === 3) {
      return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-x-4 gap-y-7 sm:gap-x-5 sm:gap-y-9';
    }
    // Default 4 columns
    return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3.5 gap-y-7 sm:gap-x-5 sm:gap-y-9 lg:gap-x-6 lg:gap-y-10';
  }, [gridDensity]);

  return (
    <div
      ref={topAnchorRef}
      className="min-h-screen bg-transparent text-ivory selection:bg-gold/30"
    >
      {/* ========================================================
          1. COLLECTION TOOLBAR — FIRST ELEMENT ON THE PAGE
          (Strictly NO hero banner, NO promotional banner, NO intro)
         ======================================================== */}
      <CollectionToolbar
        categories={categories}
        colors={colors}
        fabrics={fabrics}
        occasions={occasions}
        sizes={sizes}
        selectedCategory={selectedCategory}
        onCategorySelect={(cat) => {
          setSelectedCategory(cat);
          setCurrentPage(1);
        }}
        selectedColors={selectedColors}
        onColorToggle={handleColorToggle}
        selectedFabrics={selectedFabrics}
        onFabricToggle={handleFabricToggle}
        selectedOccasions={selectedOccasions}
        onOccasionToggle={handleOccasionToggle}
        selectedSizes={selectedSizes}
        onSizeToggle={handleSizeToggle}
        priceRange={priceRange}
        onPriceChange={(range) => {
          setPriceRange(range);
          setCurrentPage(1);
        }}
        sortBy={sortBy}
        onSortChange={setSortBy}
        gridDensity={gridDensity}
        onDensityChange={setGridDensity}
        onClearAll={handleClearAll}
        onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
        totalItemsCount={products.length}
        filteredCount={filteredProducts.length}
      />

      {/* ========================================================
          2. PRODUCT GRID — MAIN CONTENT
          (Starts immediately below the toolbar with clean gap)
         ======================================================== */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-12">
        {paginatedProducts.length > 0 ? (
          <>
            <div className={`grid ${gridClasses}`}>
              {paginatedProducts.map((product) => (
                <CollectionProductCard
                  key={product.id}
                  product={product}
                  onQuickView={openQuickView}
                />
              ))}
            </div>

            {/* Pagination Controls matching reference */}
            <CollectionPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              toolbarRef={topAnchorRef}
            />
          </>
        ) : (
          /* Empty Search / Filter State */
          <div className="py-24 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-[#240409]/80 border border-gold/30 text-gold mx-auto flex items-center justify-center mb-4 text-xl">
              ✕
            </div>
            <h3 className="text-base font-medium text-ivory mb-1">
              No matching garments found
            </h3>
            <p className="text-xs text-ivory/60 mb-5 leading-relaxed">
              We couldn't find any ethnic wear matching your selected filter criteria. Try
              adjusting or resetting your active filters.
            </p>
            <button
              type="button"
              onClick={handleClearAll}
              className="px-5 py-2 rounded-md bg-gold text-forest text-xs font-semibold hover:bg-[#FFF4D4] transition-colors shadow-xs"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* ========================================================
          3. MOBILE FILTER DRAWER
         ======================================================== */}

      <MobileFilterDrawer
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        categories={categories}
        colors={colors}
        fabrics={fabrics}
        occasions={occasions}
        sizes={sizes}
        selectedCategory={
          selectedCategory === defaultCategory ||
          selectedCategory === 'All Categories' ||
          selectedCategory === 'All Kalamkari'
            ? []
            : [selectedCategory]
        }
        onCategorySelect={(cat) => {
          setSelectedCategory(cat);
          setCurrentPage(1);
        }}
        selectedColors={selectedColors}
        onColorToggle={handleColorToggle}
        selectedFabrics={selectedFabrics}
        onFabricToggle={handleFabricToggle}
        selectedOccasions={selectedOccasions}
        onOccasionToggle={handleOccasionToggle}
        selectedSizes={selectedSizes}
        onSizeToggle={handleSizeToggle}
        priceRange={priceRange}
        onPriceChange={(range) => {
          setPriceRange(range);
          setCurrentPage(1);
        }}
        onClearAll={handleClearAll}
        totalCount={filteredProducts.length}
      />
    </div>
  );
}
