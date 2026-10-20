import React from 'react';

export const ChevronDown = ({ className = 'w-3 h-3', ...props }) => (
  <svg
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M2.5 4.5L6 8L9.5 4.5" />
  </svg>
);

export const CloseX = ({ className = 'w-3.5 h-3.5', ...props }) => (
  <svg
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
  </svg>
);

export const CheckIcon = ({ className = 'w-3 h-3', ...props }) => (
  <svg
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M2.5 6.5L4.8 8.8L9.5 3.5" />
  </svg>
);

export const Density2 = ({ className = 'w-4 h-4', ...props }) => (
  <svg
    viewBox="0 0 18 18"
    fill="currentColor"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <rect x="2" y="2" width="6" height="14" rx="0.75" />
    <rect x="10" y="2" width="6" height="14" rx="0.75" />
  </svg>
);

export const Density3 = ({ className = 'w-4 h-4', ...props }) => (
  <svg
    viewBox="0 0 18 18"
    fill="currentColor"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <rect x="2" y="2" width="3.5" height="14" rx="0.5" />
    <rect x="7.25" y="2" width="3.5" height="14" rx="0.5" />
    <rect x="12.5" y="2" width="3.5" height="14" rx="0.5" />
  </svg>
);

export const Density4 = ({ className = 'w-4 h-4', ...props }) => (
  <svg
    viewBox="0 0 18 18"
    fill="currentColor"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <rect x="1.5" y="2" width="2.5" height="14" rx="0.5" />
    <rect x="5.5" y="2" width="2.5" height="14" rx="0.5" />
    <rect x="9.5" y="2" width="2.5" height="14" rx="0.5" />
    <rect x="13.5" y="2" width="2.5" height="14" rx="0.5" />
  </svg>
);

export const FilterSliders = ({ className = 'w-4 h-4', ...props }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M3 5h14M3 10h14M3 15h14" />
    <circle cx="7" cy="5" r="2" fill="currentColor" />
    <circle cx="13" cy="10" r="2" fill="currentColor" />
    <circle cx="9" cy="15" r="2" fill="currentColor" />
  </svg>
);

export const HeartIcon = ({ filled = false, className = 'w-4 h-4', ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

export const EyeIcon = ({ className = 'w-4 h-4', ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const StarIcon = ({ filled = true, className = 'w-3.5 h-3.5', ...props }) => (
  <svg
    viewBox="0 0 20 20"
    fill={filled ? '#D4AF37' : 'none'}
    stroke="#D4AF37"
    strokeWidth="1.2"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9 1 5.5-5-2.63-5 2.63 1-5.5-4-3.9 5.53-.8L10 1.5z" />
  </svg>
);
