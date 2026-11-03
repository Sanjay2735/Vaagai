import React, { useState, useEffect, useRef } from 'react';
import { HomePage } from '../../storefront/pages/HomePage';
import { CollectionPage } from '../../storefront/pages/CollectionPage';
import { ProductDetailPage } from '../../storefront/pages/ProductDetailPage';
import { NewArrivalsPage } from '../../storefront/pages/NewArrivalsPage';
import { AdminApp } from '../../admin/AdminApp';

import {
  COLLECTION_PRODUCTS,
  KALAKAARI_PRODUCTS,
  KALAKAARI_CATEGORIES,
  KALAKAARI_FABRICS,
  KALAKAARI_OCCASIONS,
  findProductAnywhere,
} from '../../data/collectionData';

export const PAGE_KEYS = {
  HOME: 'home',
  COLLECTION: 'collection',
  KALAKAARI: 'kalakaari',
  NEW_ARRIVALS: 'new-arrivals',
  PRODUCT: 'product',
};

const HOME_ANCHORS = [
  '#new',
  '#best',
  '#story',
  '#brand-story',
  '#explore',
  '#collections-showcase',
  '#runway-experience',
  '#trust',
  '#hero',
];

export function resolvePageKey(hash = '') {
  const cleanHash = (hash || '').trim();

  if (cleanHash.startsWith('#product/') || cleanHash.startsWith('#/product/')) {
    return PAGE_KEYS.PRODUCT;
  }

  if (
    cleanHash === '#new-arrivals' ||
    cleanHash === '#/new-arrivals' ||
    cleanHash === '#runway' ||
    cleanHash === '#/runway'
  ) {
    return PAGE_KEYS.NEW_ARRIVALS;
  }

  if (
    cleanHash === '#collection' ||
    cleanHash === '#/collection' ||
    cleanHash === '#women-new' ||
    cleanHash === '#/women-new' ||
    cleanHash === '#sarees' ||
    cleanHash === '#/sarees' ||
    cleanHash === '#all-collection'
  ) {
    return PAGE_KEYS.COLLECTION;
  }

  if (cleanHash === '#kalakaari' || cleanHash === '#/kalakaari') {
    return PAGE_KEYS.KALAKAARI;
  }

  return PAGE_KEYS.HOME;
}

export function scrollToAnchor(targetHash, behavior = 'smooth') {
  if (!targetHash || typeof targetHash !== 'string') return false;
  const clean = targetHash.trim().replace(/^#\/?/, '#');
  const targetId = clean.replace('#', '');
  const targetElement = document.getElementById(targetId);

  if (!targetElement) return false;

  const navbar = document.querySelector('header');
  const navbarHeight = navbar ? navbar.offsetHeight : 72;
  const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
  const offsetPosition = Math.max(0, elementPosition - navbarHeight);

  window.scrollTo({
    top: offsetPosition,
    behavior,
  });

  return true;
}

export function useAppRoute() {
  const [route, setRoute] = useState(() => window.location.hash || '#/');
  const activePageKey = resolvePageKey(route);

  useEffect(() => {
    const handleNav = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', handleNav);
    window.addEventListener('popstate', handleNav);
    return () => {
      window.removeEventListener('hashchange', handleNav);
      window.removeEventListener('popstate', handleNav);
    };
  }, []);

  return { route, activePageKey };
}

export function renderPageContent(activePageKey, route) {
  if (activePageKey === PAGE_KEYS.PRODUCT) {
    const rawProductId = route.replace(/^#\/?product\//, '').split('?')[0];
    const foundProduct = findProductAnywhere(rawProductId) || COLLECTION_PRODUCTS[0];
    return (
      <ProductDetailPage
        product={foundProduct}
        onBack={() => {
          window.location.hash = '#collection';
        }}
      />
    );
  }

  if (activePageKey === PAGE_KEYS.NEW_ARRIVALS) {
    return <NewArrivalsPage />;
  }

  if (activePageKey === PAGE_KEYS.COLLECTION) {
    return <CollectionPage />;
  }

  if (activePageKey === PAGE_KEYS.KALAKAARI) {
    return (
      <CollectionPage
        pageMode="kalakaari"
        products={KALAKAARI_PRODUCTS}
        categories={KALAKAARI_CATEGORIES}
        fabrics={KALAKAARI_FABRICS}
        occasions={KALAKAARI_OCCASIONS}
      />
    );
  }

  return <HomePage />;
}

