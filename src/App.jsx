import React, { useEffect, useRef } from 'react';
import { AppProviders } from './app/providers/AppProviders';
import { StorefrontLayout } from './app/layouts/StorefrontLayout';
import {
  useAppRoute,
  renderPageContent,
  PAGE_KEYS,
  scrollToAnchor,
} from './app/router/AppRouter';
import { AdminApp } from './admin/AdminApp';

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

export default function App() {
  const { route, activePageKey } = useAppRoute();
  const isAdminRoute = route.startsWith('#admin') || route.startsWith('#/admin');
  const prevPageKeyRef = useRef(activePageKey);
  const isInitialMountRef = useRef(true);

  // Handle in-page anchor navigation on Home
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    const isStayingOnHome = activePageKey === PAGE_KEYS.HOME && prevPageKeyRef.current === PAGE_KEYS.HOME;
    const pageChanged = activePageKey !== prevPageKeyRef.current;
    prevPageKeyRef.current = activePageKey;

    if (pageChanged) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return;
    }

    if (!isStayingOnHome) return;

    const normalized = route.replace(/^#\/?/, '#');
    if (normalized === '#' || normalized === '') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } else if (HOME_ANCHORS.includes(normalized) || (route.startsWith('#') && !route.includes('/'))) {
      scrollToAnchor(route, 'smooth');
    }
  }, [route, activePageKey]);

  // Initial anchor scroll after entrance curtain unlocks
  useEffect(() => {
    let timer = null;
    let didScroll = false;

    const performDirectAnchorScroll = () => {
      if (didScroll) return;
      const initialHash = window.location.hash;
      if (activePageKey === PAGE_KEYS.HOME && initialHash && initialHash !== '#/' && initialHash !== '#') {
        didScroll = true;
        scrollToAnchor(initialHash, 'smooth');
      }
    };

    window.addEventListener('vaagai:curtain-unlocked', performDirectAnchorScroll);
    timer = setTimeout(performDirectAnchorScroll, 850);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('vaagai:curtain-unlocked', performDirectAnchorScroll);
    };
  }, [activePageKey]);

  // Administrative Management Portal Route
  if (isAdminRoute) {
    return <AdminApp />;
  }

  return (
    <AppProviders>
      <StorefrontLayout activePageKey={activePageKey} route={route}>
        {renderPageContent(activePageKey, route)}
      </StorefrontLayout>
    </AppProviders>
  );
}
