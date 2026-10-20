import React, { useState } from 'react';
import {
  ChevronDown,
  Density2,
  Density3,
  Density4,
  FilterSliders,
  CloseX,
} from './CollectionIcons';
import { FilterDropdown } from './FilterDropdown';
import {
  CATEGORIES,
  COLORS,
  FABRICS,
  OCCASIONS,
  SIZES,
  SORT_OPTIONS,
} from '../../data/collectionData';

export function CollectionToolbar({
  categories = CATEGORIES,
  colors = COLORS,
  fabrics = FABRICS,
  occasions = OCCASIONS,
  sizes = SIZES,
  selectedCategory,
  onCategorySelect,
  selectedColors,
  onColorToggle,
  selectedFabrics,
  onFabricToggle,
  selectedOccasions,
  onOccasionToggle,
  selectedSizes,
  onSizeToggle,
  priceRange,
  onPriceChange,
  sortBy,
  onSortChange,
  gridDensity,
  onDensityChange,
  onClearAll,
  onOpenMobileFilters,
  totalItemsCount,
  filteredCount,
}) {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const closeDropdown = () => setActiveDropdown(null);

  // Active filter counters & states
  const hasCategoryFilter = selectedCategory && selectedCategory !== 'All Categories';
  const hasColorFilter = selectedColors.length > 0;
  const hasFabricFilter = selectedFabrics.length > 0;
  const hasOccasionFilter = selectedOccasions.length > 0;
  const hasSizeFilter = selectedSizes.length > 0;
  const hasPriceFilter = priceRange[0] > 0 || priceRange[1] < 6000;

  const totalActiveFilters =
    (hasCategoryFilter ? 1 : 0) +
    selectedColors.length +
    selectedFabrics.length +
    selectedOccasions.length +
    selectedSizes.length +
    (hasPriceFilter ? 1 : 0);

  const anyFilterActive = totalActiveFilters > 0;

  return (
    <div className="w-full bg-[#380710]/85 backdrop-blur-md border-b border-gold/25 sticky top-[64px] sm:top-[72px] z-30 transition-shadow duration-200 text-ivory shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Toolbar Line */}
        <div className="flex items-center justify-between h-13 py-3 gap-3">
          {/* ================= LEFT SIDE: FILTERS ================= */}
          <div className="flex items-center gap-1.5 md:gap-3 flex-wrap">
            {/* "Filter by" Indicator */}
            <div className="flex items-center gap-1.5 pr-1 select-none">
              <span className="text-xs sm:text-[13px] font-medium text-ivory/85 tracking-tight">
                Filter by
              </span>
              {anyFilterActive && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(212,175,55,0.8)] animate-pulse"
                  title={`${totalActiveFilters} filters active`}
                />
              )}
            </div>

            {/* Desktop Filter Dropdown Triggers */}
            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              {/* 1. Category */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('category')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs sm:text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold ${
                    hasCategoryFilter
                      ? 'text-gold font-semibold bg-gold/15 border border-gold/40 shadow-xs'
                      : 'text-ivory/85 hover:text-gold hover:bg-white/5'
                  }`}
                  aria-expanded={activeDropdown === 'category'}
                >
                  <span>
                    {hasCategoryFilter ? selectedCategory : 'Categories'}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 text-gold/70 ${
                      activeDropdown === 'category' ? 'rotate-180 text-gold' : ''
                    }`}
                  />
                </button>
                <FilterDropdown
                  isOpen={activeDropdown === 'category'}
                  onClose={closeDropdown}
                  title="Categories"
                  type="category"
                  options={categories}
                  selectedValues={hasCategoryFilter ? [selectedCategory] : []}
                  onSelect={(cat) => {
                    onCategorySelect(cat === '__CLEAR__' ? 'All Categories' : cat);
                    closeDropdown();
                  }}
                />
              </div>

              {/* 2. Color */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('color')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs sm:text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold ${
                    hasColorFilter
                      ? 'text-gold font-semibold bg-gold/15 border border-gold/40 shadow-xs'
                      : 'text-ivory/85 hover:text-gold hover:bg-white/5'
                  }`}
                  aria-expanded={activeDropdown === 'color'}
                >
                  <span>
                    Color
                    {selectedColors.length > 0 && ` (${selectedColors.length})`}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 text-gold/70 ${
                      activeDropdown === 'color' ? 'rotate-180 text-gold' : ''
                    }`}
                  />
                </button>
                <FilterDropdown
                  isOpen={activeDropdown === 'color'}
                  onClose={closeDropdown}
                  title="Colors"
                  type="color"
                  options={colors}
                  selectedValues={selectedColors}
                  onSelect={(col) => {
                    if (col === '__CLEAR__') {
                      selectedColors.forEach((c) => onColorToggle(c));
                    } else {
                      onColorToggle(col);
                    }
                  }}
                />
              </div>

              {/* 3. Size */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('size')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs sm:text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold ${
                    hasSizeFilter
                      ? 'text-gold font-semibold bg-gold/15 border border-gold/40 shadow-xs'
                      : 'text-ivory/85 hover:text-gold hover:bg-white/5'
                  }`}
                  aria-expanded={activeDropdown === 'size'}
                >
                  <span>
                    Size
                    {selectedSizes.length > 0 && ` (${selectedSizes.length})`}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 text-gold/70 ${
                      activeDropdown === 'size' ? 'rotate-180 text-gold' : ''
                    }`}
                  />
                </button>
                <FilterDropdown
                  isOpen={activeDropdown === 'size'}
                  onClose={closeDropdown}
                  title="Sizes"
                  type="size"
                  options={sizes}
                  selectedValues={selectedSizes}
                  onSelect={(s) => {
                    if (s === '__CLEAR__') {
                      selectedSizes.forEach((sz) => onSizeToggle(sz));
                    } else {
                      onSizeToggle(s);
                    }
                  }}
                />
              </div>

              {/* 4. Fabric */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('fabric')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs sm:text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold ${
                    hasFabricFilter
                      ? 'text-gold font-semibold bg-gold/15 border border-gold/40 shadow-xs'
                      : 'text-ivory/85 hover:text-gold hover:bg-white/5'
                  }`}
                  aria-expanded={activeDropdown === 'fabric'}
                >
                  <span>
                    Fabric
                    {selectedFabrics.length > 0 && ` (${selectedFabrics.length})`}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 text-gold/70 ${
                      activeDropdown === 'fabric' ? 'rotate-180 text-gold' : ''
                    }`}
                  />
                </button>
                <FilterDropdown
                  isOpen={activeDropdown === 'fabric'}
                  onClose={closeDropdown}
                  title="Fabric"
                  type="fabric"
                  options={fabrics}
                  selectedValues={selectedFabrics}
                  onSelect={(fab) => {
                    if (fab === '__CLEAR__') {
                      selectedFabrics.forEach((f) => onFabricToggle(f));
                    } else {
                      onFabricToggle(fab);
                    }
                  }}
                />
              </div>

              {/* 5. Occasion */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('occasion')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs sm:text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold ${
                    hasOccasionFilter
                      ? 'text-gold font-semibold bg-gold/15 border border-gold/40 shadow-xs'
                      : 'text-ivory/85 hover:text-gold hover:bg-white/5'
                  }`}
                  aria-expanded={activeDropdown === 'occasion'}
                >
                  <span>
                    Occasion
                    {selectedOccasions.length > 0 && ` (${selectedOccasions.length})`}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 text-gold/70 ${
                      activeDropdown === 'occasion' ? 'rotate-180 text-gold' : ''
                    }`}
                  />
                </button>
                <FilterDropdown
                  isOpen={activeDropdown === 'occasion'}
                  onClose={closeDropdown}
                  title="Occasion"
                  type="occasion"
                  options={occasions}
                  selectedValues={selectedOccasions}
                  onSelect={(occ) => {
                    if (occ === '__CLEAR__') {
                      selectedOccasions.forEach((o) => onOccasionToggle(o));
                    } else {
                      onOccasionToggle(occ);
                    }
                  }}
                />
              </div>

              {/* 6. Price */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('price')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs sm:text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold ${
                    hasPriceFilter
                      ? 'text-gold font-semibold bg-gold/15 border border-gold/40 shadow-xs'
                      : 'text-ivory/85 hover:text-gold hover:bg-white/5'
                  }`}
                  aria-expanded={activeDropdown === 'price'}
                >
                  <span>
                    {hasPriceFilter
                      ? `₹${priceRange[0]} - ₹${priceRange[1]}`
                      : 'Price'}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 text-gold/70 ${
                      activeDropdown === 'price' ? 'rotate-180 text-gold' : ''
                    }`}
                  />
                </button>
                <FilterDropdown
                  isOpen={activeDropdown === 'price'}
                  onClose={closeDropdown}
                  title="Price Range"
                  type="price"
                  priceRange={priceRange}
                  onPriceChange={onPriceChange}
                />
              </div>
            </div>

            {/* Mobile Filter Button trigger */}
            <button
              type="button"
              onClick={onOpenMobileFilters}
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gold/30 text-xs text-ivory bg-[#240409]/80 active:bg-gold/20 transition-colors"
              aria-label="Open filter drawer"
            >
              <FilterSliders className="w-3.5 h-3.5 text-gold" />
              <span>Filters</span>
              {anyFilterActive && (
                <span className="w-4 h-4 rounded-full bg-gold text-forest text-[9px] font-bold flex items-center justify-center">
                  {totalActiveFilters}
                </span>
              )}
            </button>
          </div>

          {/* ================= RIGHT SIDE: SORTING & DENSITY ================= */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('sort')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs sm:text-[13px] text-ivory hover:text-gold font-medium transition-colors"
                aria-expanded={activeDropdown === 'sort'}
              >
                <span>
                  {SORT_OPTIONS.find((s) => s.id === sortBy)?.label || 'Default Sorting'}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-gold/70 transition-transform ${
                    activeDropdown === 'sort' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {activeDropdown === 'sort' && (
                <div
                  className="absolute right-0 top-full mt-2 w-48 bg-[#240409]/95 backdrop-blur-xl rounded-xl border border-gold/40 shadow-2xl py-1.5 z-40 text-xs text-ivory"
                  role="menu"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        onSortChange(opt.id);
                        closeDropdown();
                      }}
                      className={`w-full text-left px-3 py-2 transition-colors ${
                        sortBy === opt.id
                          ? 'bg-gold/20 text-gold font-semibold'
                          : 'text-ivory/80 hover:bg-white/5 hover:text-gold'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Density Layout Controls */}
            <div
              className="flex items-center gap-0.5 border-l border-gold/25 pl-2 sm:pl-3"
              role="group"
              aria-label="Grid layout density"
            >
              {/* 2-Columns */}
              <button
                type="button"
                onClick={() => onDensityChange(2)}
                className={`p-1.5 rounded transition-colors ${
                  gridDensity === 2
                    ? 'text-gold bg-gold/20 border border-gold/40 shadow-xs'
                    : 'text-ivory/50 hover:text-gold'
                }`}
                title="2-column grid layout"
                aria-label="2 columns"
              >
                <Density2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* 3-Columns (Hidden on very small screens) */}
              <button
                type="button"
                onClick={() => onDensityChange(3)}
                className={`hidden sm:block p-1.5 rounded transition-colors ${
                  gridDensity === 3
                    ? 'text-gold bg-gold/20 border border-gold/40 shadow-xs'
                    : 'text-ivory/50 hover:text-gold'
                }`}
                title="3-column grid layout"
                aria-label="3 columns"
              >
                <Density3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* 4-Columns (Default - desktop) */}
              <button
                type="button"
                onClick={() => onDensityChange(4)}
                className={`hidden md:block p-1.5 rounded transition-colors ${
                  gridDensity === 4
                    ? 'text-gold bg-gold/20 border border-gold/40 shadow-xs'
                    : 'text-ivory/50 hover:text-gold'
                }`}
                title="4-column grid layout"
                aria-label="4 columns"
              >
                <Density4 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ================= ACTIVE FILTER CHIPS ROW ================= */}
        {anyFilterActive && (
          <div className="flex items-center flex-wrap gap-2 pt-1 pb-3 text-xs border-t border-gold/15">
            <span className="text-gold/60 text-[11px] uppercase tracking-wider mr-1">
              Active:
            </span>

            {/* Category Chip */}
            {hasCategoryFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#240409]/90 border border-gold/30 text-gold text-[11px]">
                <span>{selectedCategory}</span>
                <button
                  type="button"
                  onClick={() => onCategorySelect('All Categories')}
                  className="hover:text-ivory"
                  aria-label={`Remove category ${selectedCategory}`}
                >
                  <CloseX className="w-2.5 h-2.5" />
                </button>
              </span>
            )}

            {/* Color Chips */}
            {selectedColors.map((col) => (
              <span
                key={col}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#240409]/90 border border-gold/30 text-gold text-[11px]"
              >
                <span>Color: {col}</span>
                <button
                  type="button"
                  onClick={() => onColorToggle(col)}
                  className="hover:text-ivory"
                  aria-label={`Remove color ${col}`}
                >
                  <CloseX className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}

            {/* Fabric Chips */}
            {selectedFabrics.map((fab) => (
              <span
                key={fab}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#240409]/90 border border-gold/30 text-gold text-[11px]"
              >
                <span>{fab}</span>
                <button
                  type="button"
                  onClick={() => onFabricToggle(fab)}
                  className="hover:text-ivory"
                  aria-label={`Remove fabric ${fab}`}
                >
                  <CloseX className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}

            {/* Occasion Chips */}
            {selectedOccasions.map((occ) => (
              <span
                key={occ}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#240409]/90 border border-gold/30 text-gold text-[11px]"
              >
                <span>{occ}</span>
                <button
                  type="button"
                  onClick={() => onOccasionToggle(occ)}
                  className="hover:text-ivory"
                  aria-label={`Remove occasion ${occ}`}
                >
                  <CloseX className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}

            {/* Size Chips */}
            {selectedSizes.map((sz) => (
              <span
                key={sz}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#240409]/90 border border-gold/30 text-gold text-[11px]"
              >
                <span>Size: {sz}</span>
                <button
                  type="button"
                  onClick={() => onSizeToggle(sz)}
                  className="hover:text-ivory"
                  aria-label={`Remove size ${sz}`}
                >
                  <CloseX className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}

            {/* Price Chip */}
            {hasPriceFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#240409]/90 border border-gold/30 text-gold text-[11px]">
                <span>
                  Price: ₹{priceRange[0]} - ₹{priceRange[1]}
                </span>
                <button
                  type="button"
                  onClick={() => onPriceChange([0, 6000])}
                  className="hover:text-ivory"
                  aria-label="Remove price filter"
                >
                  <CloseX className="w-2.5 h-2.5" />
                </button>
              </span>
            )}

            {/* Clear All */}
            <button
              type="button"
              onClick={onClearAll}
              className="text-[11px] text-gold/80 hover:text-gold underline font-medium ml-1 transition-colors"
            >
              Clear All
            </button>

            {/* Matching count indicator */}
            <span className="ml-auto text-[11px] text-ivory/60 font-normal">
              Showing {filteredCount} of {totalItemsCount} items
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
