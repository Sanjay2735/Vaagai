import React from 'react';

export function Divider({ className = '' }) {
  return (
    <div
      role="separator"
      aria-hidden="true"
      className={`gold-divider inline-flex items-center justify-center my-4 sm:my-5 ${className}`}
    >
      {/* Symmetrical Left Gold Line - Fades from transparent on outer tip to lustrous gold at center */}
      <span className="gold-line gold-line-l h-px bg-gradient-to-r from-transparent via-[#E5C368]/85 to-[#D4AF37]" />

      {/* Center Faceted Diamond with Soft Candlelight Glow */}
      <span className="gold-diamond w-1.5 h-1.5 sm:w-2 sm:h-2 rotate-45 bg-gradient-to-br from-[#FFF4D4] via-[#E8C872] to-[#A37822] border border-[#FFF0C2]/80 shadow-[0_0_8px_rgba(212,175,55,0.45)] flex-shrink-0" />

      {/* Symmetrical Right Gold Line - Fades from lustrous gold at center to transparent on outer tip */}
      <span className="gold-line gold-line-r h-px bg-gradient-to-l from-transparent via-[#E5C368]/85 to-[#D4AF37]" />
    </div>
  );
}
