import React from 'react';

export const ArrowRight = ({ className = 'w-3.5 h-3.5', ...props }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

export const ArrowLeft = ({ className = 'w-3.5 h-3.5', ...props }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M13 8H3M7 4L3 8l4 4" />
  </svg>
);

export function CollectionPagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  toolbarRef,
}) {
  if (totalPages <= 1) return null;

  const handlePageClick = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);

    // Smoothly scroll back to the top of the toolbar
    if (toolbarRef?.current) {
      const topOffset = toolbarRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: Math.max(0, topOffset), behavior: 'smooth' });
    }
  };

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav
      className="flex items-center justify-center gap-2.5 py-12 select-none"
      aria-label="Collection pagination"
    >
      {/* Prev Button */}
      {currentPage > 1 && (
        <button
          type="button"
          onClick={() => handlePageClick(currentPage - 1)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-ivory/70 hover:text-gold transition-colors"
          aria-label="Previous page"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Page Numbers */}
      {pages.map((p) => {
        const isActive = p === currentPage;
        return (
          <button
            key={p}
            type="button"
            onClick={() => handlePageClick(p)}
            aria-current={isActive ? 'page' : undefined}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs font-semibold transition-all ${
              isActive
                ? 'bg-gold text-forest shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                : 'text-ivory/70 hover:text-gold hover:bg-white/5'
            }`}
          >
            {p}
          </button>
        );
      })}

      {/* Next Button */}
      {currentPage < totalPages && (
        <button
          type="button"
          onClick={() => handlePageClick(currentPage + 1)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-ivory/70 hover:text-gold transition-colors"
          aria-label="Next page"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </nav>
  );
}
