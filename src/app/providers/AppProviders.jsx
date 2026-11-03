import React from 'react';
import { ShopProvider } from '../../context/ShopContext';
import { CustomerAuthProvider } from '../../context/CustomerAuthContext';

/**
 * Universal App Providers Composition
 */
export function AppProviders({ children }) {
  return (
    <CustomerAuthProvider>
      <ShopProvider>
        {children}
      </ShopProvider>
    </CustomerAuthProvider>
  );
}

export default AppProviders;

