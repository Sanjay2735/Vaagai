import React, { useEffect } from 'react';
import { CloseX, CheckIcon } from './CollectionIcons';

export function MobileFilterDrawer({
  isOpen,
  onClose,
  categories,
  colors,
  fabrics,
  occasions,
  sizes,
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
  onClearAll,
  totalCount,
}) {
  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Filter products"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#2A050B] to-[#160204] text-ivory border-l border-gold/30 h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gold/20">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-wider uppercase text-gold">
              Filters
            </h2>
            <span className="text-xs text-ivory/60">({totalCount} items)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gold/70 hover:text-gold rounded-full hover:bg-gold/10 transition-colors"
            aria-label="Close filters"
          >
            <CloseX className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Filter Sections */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-ivory">
          {/* Categories */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gold mb-2.5">
              Category
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => {
                const isSelected =
                  cat === 'All Categories'
                    ? selectedCategory.length === 0
                    : selectedCategory.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => onCategorySelect(cat)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      isSelected
                        ? 'bg-gold text-forest border-gold font-semibold'
                        : 'border-gold/30 text-ivory/80 bg-gold/5 hover:border-gold/60'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colors */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gold mb-2.5">
              Color
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {colors.map((col) => {
                const isSelected = selectedColors.includes(col.name);
                return (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => onColorToggle(col.name)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
                      isSelected
                        ? 'border-gold bg-gold/20 text-gold font-semibold'
                        : 'border-gold/20 text-ivory/80 bg-gold/5 hover:border-gold/40'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                        col.border ? 'border border-gold/30' : ''
                      }`}
                      style={{ backgroundColor: col.hex }}
                    />
                    <span className="truncate">{col.name}</span>
                    {isSelected && <CheckIcon className="w-3 h-3 ml-auto text-gold" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fabric */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gold mb-2.5">
              Fabric
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {fabrics.map((fab) => {
                const isSelected = selectedFabrics.includes(fab);
                return (
                  <button
                    key={fab}
                    type="button"
                    onClick={() => onFabricToggle(fab)}
                    className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                      isSelected
                        ? 'bg-gold text-forest border-gold font-semibold'
                        : 'border-gold/30 text-ivory/80 bg-gold/5 hover:border-gold/60'
                    }`}
                  >
                    {fab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Occasion */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gold mb-2.5">
              Occasion
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {occasions.map((occ) => {
                const isSelected = selectedOccasions.includes(occ);
                return (
                  <button
                    key={occ}
                    type="button"
                    onClick={() => onOccasionToggle(occ)}
                    className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                      isSelected
                        ? 'bg-gold text-forest border-gold font-semibold'
                        : 'border-gold/30 text-ivory/80 bg-gold/5 hover:border-gold/60'
                    }`}
                  >
                    {occ}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gold mb-2.5">
              Size
            </h3>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => {
                const isSelected = selectedSizes.includes(s.label);
                return (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => onSizeToggle(s.label)}
                    className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                      isSelected
                        ? 'bg-gold text-forest border-gold font-semibold'
                        : 'border-gold/30 text-ivory/80 bg-gold/5 hover:border-gold/60'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gold mb-2.5">
              Price Range
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gold font-medium">
                ₹{priceRange[0].toLocaleString('en-IN')}
              </span>
              <input
                type="range"
                min="1000"
                max="6000"
                step="200"
                value={priceRange[1]}
                onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
                className="flex-1 accent-[#D4AF37] h-1 bg-gold/20 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-gold font-medium">
                ₹{priceRange[1].toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="p-4 border-t border-gold/20 bg-[#1A0307] flex items-center gap-3">
          <button
            type="button"
            onClick={onClearAll}
            className="flex-1 py-2.5 text-xs font-medium text-ivory/80 border border-gold/30 rounded hover:bg-gold/10 hover:text-gold transition-colors"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-forest bg-gradient-to-r from-[#D4AF37] via-[#E8C872] to-[#D4AF37] rounded hover:brightness-110 transition-all shadow-md"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
