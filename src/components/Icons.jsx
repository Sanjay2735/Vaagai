import React from 'react';

/**
 * Arrow Icon
 * Scalable luxury navigation arrow with balanced stem, refined proportions,
 * and smooth line joins. Compatible with hover animations and custom sizing.
 */
export const Arrow = ({ className = '', size, ...props }) => (
  <svg
    width={size || 22}
    height={size ? Math.round((size * 10) / 22) : 10}
    viewBox="0 0 22 10"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={`inline-block shrink-0 transition-transform ${className}`.trim()}
    {...props}
  >
    <path d="M1 5h19M15.5 1.5l4.5 3.5-4.5 3.5" />
  </svg>
);

/**
 * Ico Component
 * Wrapper for consistent 24x24 SVG line icons with customizable size (s),
 * accessible defaults, non-shrinking flex behavior, and inherited currentColor.
 */
export const Ico = ({
  d,
  s = 20,
  className = '',
  'aria-hidden': ariaHidden = true,
  strokeWidth = 1.3,
  ...props
}) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden={ariaHidden}
    className={`inline-block shrink-0 ${className}`.trim()}
    {...props}
  >
    {d}
  </svg>
);

/**
 * Core Luxury Icon Geometries (24x24 viewport)
 * Preserves exact icon names, visual weights, and compatibility with outline/fill usages.
 */
export const ICONS = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4.35-4.35" />
    </>
  ),
  heart: (
    <path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z" />
  ),
  bag: (
    <>
      <path d="M5.5 8h13l-1.1 11.5a1.5 1.5 0 0 1-1.5 1.5H8.1a1.5 1.5 0 0 1-1.5-1.5L5.5 8z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </>
  ),
  menu: <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />,
  x: <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />,
  craft: (
    <path d="M12 2.5l2.6 5.3 5.9.8-4.3 4.1 1 5.8L12 15.8l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8L12 2.5z" />
  ),
  gem: (
    <>
      <path d="M6 4h12l4 6-10 11L2 10z" />
      <path d="M2 10h20M9 4l3 17 3-17" />
    </>
  ),
  truck: (
    <>
      <path d="M2 6h12v10H2zM14 10h4l4 3v3h-8" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </>
  ),
  love: (
    <>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3 20c0-4 3-6 6-6s6 2 6 6M15 14c3 0 6 1.5 6 5" />
    </>
  ),
};
