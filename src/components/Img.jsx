import React, { useState } from 'react';
import { TONES } from '../data/tones';

/**
 * Reusable Luxury Image Component
 *
 * Supports rich textured tone foundations, high-definition image overlays,
 * lazy/eager loading control, graceful error handling, responsive object-fit/position,
 * and elegant luxury frosted badges.
 */
export function Img({
  t,
  label,
  className = '',
  children,
  src,
  alt,
  imgClassName = '',
  imgPosition = 'object-top',
  fit = 'cover',
  priority = false,
  loading,
  fetchPriority,
  aspectRatio,
  width,
  height,
  onLoad,
  onError,
  ...props
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Retrieve curated luxury gradient foundation or fallback to royal burgundy tone
  const background =
    TONES[t] ||
    t ||
    'linear-gradient(160deg, #380710 0%, #681220 50%, #4F0B17 100%)';

  // Support object-cover (default for product & editorial) or object-contain (for model cutouts)
  const isContain = imgClassName.includes('object-contain') || fit === 'contain';
  const isFill = imgClassName.includes('object-fill') || fit === 'fill';
  const objectFitClass = isContain ? 'object-contain' : isFill ? 'object-fill' : 'object-cover';

  // Loading priority: eager for priority / above-the-fold, lazy for standard below-the-fold
  const resolvedLoading = loading || (priority ? 'eager' : 'lazy');
  const resolvedFetchPriority = fetchPriority || (priority ? 'high' : 'auto');

  // Accessibility alt text: respects empty string for decorative images, falls back cleanly to label
  const resolvedAlt = alt !== undefined ? alt : label ? `${label} - Vaagai` : '';

  const handleImageError = (e) => {
    setHasError(true);
    if (onError) onError(e);
  };

  const handleImageLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`.trim()}
      style={aspectRatio ? { aspectRatio, ...props.style } : props.style}
      {...props}
    >
      {/* Textured tone gradient foundation (Layer 0) */}
      <div
        className="zi absolute inset-0 pointer-events-none select-none"
        style={{ background, zIndex: 0 }}
        aria-hidden="true"
      />

      {/* Ambient leaf texture overlay (Layer 1) */}
      <div
        className="leaf absolute -inset-4 mix-blend-multiply opacity-60 pointer-events-none select-none"
        style={{ zIndex: 1 }}
        aria-hidden="true"
      />

      {/* High-resolution image overlay (Layer 2) */}
      {src && !hasError && (
        <img
          src={src}
          alt={resolvedAlt}
          loading={resolvedLoading}
          fetchPriority={resolvedFetchPriority}
          width={width}
          height={height}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`zi absolute inset-0 w-full h-full ${objectFitClass} ${imgPosition} ${imgClassName} transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-95'
          }`.trim()}
          style={{ zIndex: 2 }}
        />
      )}

      {/* Luxury frosted label badge (Layer 3) */}
      {label && (
        <span
          className="cap absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 text-ivory/95 z-20 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] bg-[#4F0B17]/85 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full border border-gold/30 font-medium tracking-wider select-none text-[10px] sm:text-xs"
        >
          {label}
        </span>
      )}

      {/* Optional overlay children (Layer 4) */}
      {children}
    </div>
  );
}
