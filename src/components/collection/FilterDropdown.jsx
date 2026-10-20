import React, { useEffect, useRef } from 'react';
import { CheckIcon, CloseX } from './CollectionIcons';

export function FilterDropdown({
  isOpen,
  onClose,
  title,
  type,
  options = [],
  selectedValues = [],
  onSelect,
  priceRange = [0, 6000],
  onPriceChange,
  align = 'left',
}) {
  const dropdownRef = useRef(null);

  // Close on Click Outside & Escape Key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      role="dialog"
      aria-label={`${title} filter options`}
      className={`absolute top-full mt-2 z-40 bg-[#240409]/95 backdrop-blur-xl rounded-xl border border-gold/40 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.15)] text-ivory animate-in fade-in slide-in-from-top-2 duration-150 py-3 ${
        align === 'right' ? 'right-0' : 'left-0'
      } ${
        type === 'price'
          ? 'w-72 sm:w-80 px-4'
          : type === 'color'
          ? 'w-56 px-2'
          : type === 'size'
          ? 'w-64 px-2'
          : 'w-60 px-2'
      }`}
    >
      {/* Dropdown Header */}
      <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-gold/20">
        <span className="text-[11px] font-semibold tracking-wider text-gold uppercase">
          {title}
        </span>
        {selectedValues.length > 0 && type !== 'price' && (
          <button
            type="button"
            onClick={() => onSelect('__CLEAR__')}
            className="text-[10px] text-gold/70 hover:text-gold underline transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Content based on type */}
      {type === 'color' && (
        <div className="max-h-64 overflow-y-auto space-y-0.5 custom-scrollbar px-1 py-0.5">
          {options.map((col) => {
            const isSelected = selectedValues.includes(col.name);
            return (
              <button
                key={col.name}
                type="button"
                onClick={() => onSelect(col.name)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors group ${
                  isSelected
                    ? 'bg-gold/20 text-gold font-medium'
                    : 'text-ivory/85 hover:bg-white/5 hover:text-gold'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-4 h-4 rounded-full transition-transform group-hover:scale-110 flex items-center justify-center ${
                      col.border ? 'border border-gold/40' : ''
                    } ${isSelected ? 'ring-2 ring-gold ring-offset-1 ring-offset-[#240409]' : ''}`}
                    style={{ backgroundColor: col.hex }}
                  />
                  <span>{col.name}</span>
                </div>
                {isSelected && <CheckIcon className="w-3 h-3 text-gold" />}
              </button>
            );
          })}
        </div>
      )}

      {type === 'category' && (
        <div className="max-h-72 overflow-y-auto space-y-0.5 custom-scrollbar px-1 py-0.5">
          {options.map((cat) => {
            const isSelected =
              cat === 'All Categories'
                ? selectedValues.length === 0
                : selectedValues.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelect(cat)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                  isSelected
                    ? 'bg-gold/20 text-gold font-medium'
                    : 'text-ivory/85 hover:bg-white/5 hover:text-gold'
                }`}
              >
                <span>{cat}</span>
                {isSelected && <CheckIcon className="w-3 h-3 text-gold" />}
              </button>
            );
          })}
        </div>
      )}

      {type === 'fabric' && (
        <div className="max-h-64 overflow-y-auto space-y-0.5 custom-scrollbar px-1 py-0.5">
          {options.map((fab) => {
            const isSelected = selectedValues.includes(fab);
            return (
              <button
                key={fab}
                type="button"
                onClick={() => onSelect(fab)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                  isSelected
                    ? 'bg-gold/20 text-gold font-medium'
                    : 'text-ivory/85 hover:bg-white/5 hover:text-gold'
                }`}
              >
                <span>{fab}</span>
                {isSelected && <CheckIcon className="w-3 h-3 text-gold" />}
              </button>
            );
          })}
        </div>
      )}

      {type === 'occasion' && (
        <div className="max-h-64 overflow-y-auto space-y-0.5 custom-scrollbar px-1 py-0.5">
          {options.map((occ) => {
            const isSelected = selectedValues.includes(occ);
            return (
              <button
                key={occ}
                type="button"
                onClick={() => onSelect(occ)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                  isSelected
                    ? 'bg-gold/20 text-gold font-medium'
                    : 'text-ivory/85 hover:bg-white/5 hover:text-gold'
                }`}
              >
                <span>{occ}</span>
                {isSelected && <CheckIcon className="w-3 h-3 text-gold" />}
              </button>
            );
          })}
        </div>
      )}

      {type === 'size' && (
        <div className="max-h-64 overflow-y-auto space-y-1 custom-scrollbar px-1 py-0.5">
          {options.map((s) => {
            const isSelected = selectedValues.includes(s.label);
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => onSelect(s.label)}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                  isSelected
                    ? 'bg-gold/20 text-gold font-medium'
                    : 'text-ivory/85 hover:bg-white/5 hover:text-gold'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{s.label}</span>
                  {isSelected && <CheckIcon className="w-3 h-3 text-gold" />}
                </div>
                {s.description && (
                  <p className="text-[10px] text-ivory/50 mt-0.5 font-normal leading-tight">
                    {s.description}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}

      {type === 'price' && (
        <div className="space-y-3 pt-1">
          {/* Quick preset buttons */}
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: 'Under ₹2,000', range: [0, 2000] },
              { label: '₹2,000 - ₹3,500', range: [2000, 3500] },
              { label: '₹3,500 - ₹4,500', range: [3500, 4500] },
              { label: 'Above ₹4,500', range: [4500, 6000] },
            ].map((preset) => {
              const isActive =
                priceRange[0] === preset.range[0] && priceRange[1] === preset.range[1];
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onPriceChange(preset.range)}
                  className={`text-[11px] py-1.5 px-2 rounded border transition-colors ${
                    isActive
                      ? 'border-gold bg-gold text-forest font-semibold shadow-xs'
                      : 'border-gold/30 text-ivory/80 hover:border-gold/70 bg-[#1F0307]/70'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Min & Max Inputs */}
          <div className="flex items-center gap-2 pt-1">
            <div className="flex-1">
              <label className="block text-[10px] text-ivory/60 uppercase tracking-wider mb-1">
                Min (₹)
              </label>
              <input
                type="number"
                min="0"
                max="6000"
                step="100"
                value={priceRange[0]}
                onChange={(e) =>
                  onPriceChange([Math.max(0, Number(e.target.value)), priceRange[1]])
                }
                className="w-full px-2 py-1 text-xs bg-[#140205] border border-gold/30 rounded text-ivory focus:outline-none focus:border-gold"
              />
            </div>
            <span className="text-gold/60 mt-4 text-xs">—</span>
            <div className="flex-1">
              <label className="block text-[10px] text-ivory/60 uppercase tracking-wider mb-1">
                Max (₹)
              </label>
              <input
                type="number"
                min="0"
                max="6000"
                step="100"
                value={priceRange[1]}
                onChange={(e) =>
                  onPriceChange([priceRange[0], Math.min(6000, Number(e.target.value))])
                }
                className="w-full px-2 py-1 text-xs bg-[#140205] border border-gold/30 rounded text-ivory focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          {/* Slider */}
          <div className="pt-2 px-1">
            <input
              type="range"
              min="1000"
              max="6000"
              step="200"
              value={priceRange[1]}
              onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
              className="w-full accent-gold h-1 bg-[#4F0B17] rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-ivory/60 mt-1">
              <span>₹0</span>
              <span>₹3,000</span>
              <span>₹6,000+</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-gold/20">
            <button
              type="button"
              onClick={() => onPriceChange([0, 6000])}
              className="text-[11px] text-gold/70 hover:text-gold underline"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-[11px] px-3.5 py-1 bg-gold text-forest font-semibold rounded hover:bg-[#FFF4D4] transition-colors shadow-xs"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
