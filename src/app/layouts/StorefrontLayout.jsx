import React from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { CartDrawer } from '../../components/CartDrawer';
import { CheckoutModal } from '../../components/CheckoutModal';
import { QuickViewModal } from '../../components/collection/QuickViewModal';
import { useShop } from '../../context/ShopContext';
import ScrollReveal from '../../components/ScrollReveal';
import PageTransition from '../../components/PageTransition';
import LaunchCurtain from '../../components/LaunchCurtain';
import { PAGE_KEYS } from '../router/AppRouter';

export function StorefrontLayout({ activePageKey, route, children }) {
  const isDedicatedPage =
    activePageKey === PAGE_KEYS.COLLECTION ||
    activePageKey === PAGE_KEYS.NEW_ARRIVALS ||
    activePageKey === PAGE_KEYS.KALAKAARI ||
    activePageKey === PAGE_KEYS.PRODUCT;

  return (
    <div className="min-h-screen bg-[#29201E] text-ivory">
      {/* Cinematic Launch Curtain (only plays once on site entry on home) */}
      {activePageKey === PAGE_KEYS.HOME && <LaunchCurtain />}

      {/* Global Luxury Glassmorphism Navbar with Mega Menu */}
      <Navbar activePageKey={activePageKey} />

      {/* Main Content Area */}
      <main className={`relative ${isDedicatedPage ? 'pt-[64px] sm:pt-[72px]' : ''}`}>
        {/* Stable global scroll reveal observer */}
        <ScrollReveal />

        {/* Curtain Page Transition System */}
        <PageTransition activeKey={activePageKey}>
          {children}
        </PageTransition>
      </main>

      {/* Global Site Footer */}
      <Footer />

      {/* Shopping Cart Drawer */}
      <CartDrawer />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={route === '#checkout' || route === '#/checkout'}
        onClose={() => {
          window.location.hash = activePageKey === PAGE_KEYS.COLLECTION ? '#collection' : '#home';
        }}
      />

      {/* Quick View Modal */}
      <GlobalQuickViewModal />
    </div>
  );
}

function GlobalQuickViewModal() {
  const { quickViewProduct, quickViewVariantIndex, closeQuickView } = useShop();

  return (
    <QuickViewModal
      product={quickViewProduct}
      initialVariantIndex={quickViewVariantIndex}
      isOpen={Boolean(quickViewProduct)}
      onClose={closeQuickView}
    />
  );
}

export default StorefrontLayout;

