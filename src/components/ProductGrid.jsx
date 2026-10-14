import React from 'react';
import { Divider } from './Divider';
import { ProductCard } from './ProductCard';

export function ProductGrid({ list = [], title, id }) {
  const products = Array.isArray(list) ? list : [];

  return (
    <section
      id={id}
      aria-label={title || 'Product Collection'}
      className="section-curtain-wave relative max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-16 sm:pb-20 md:pb-24 overflow-hidden"
    >
      {/* Optional Editorial Section Heading */}
      {title && (
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="cap text-gold tracking-[0.25em] text-xs sm:text-sm font-medium uppercase reveal-item stagger-1">
            {title}
          </h2>
          <div className="reveal-item stagger-divider mt-2.5 sm:mt-3 flex justify-center">
            <Divider />
          </div>
        </div>
      )}

      {/* Responsive Product Grid: 2 cols mobile, 2 cols tablet, 4 cols desktop */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 items-stretch">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-ivory/60 font-primary text-xs sm:text-sm">
          <p>No sarees found in this collection.</p>
        </div>
      )}
    </section>
  );
}
