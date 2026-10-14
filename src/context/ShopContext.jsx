import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

export const ShopContext = createContext();

const CART_STORAGE_KEY = 'vaagai_cart_v1';
const WISH_STORAGE_KEY = 'vaagai_wishlist_v1';

/**
 * Validate and sanitize a single cart item.
 * Preserves the exact structure with 'q' as quantity.
 */
function sanitizeCartItem(item) {
  if (!item || typeof item !== 'object') return null;

  // Validate ID
  const id = item.id;
  if (id === undefined || id === null || id === '') return null;

  // Validate Quantity: must be a positive finite integer >= 1
  const rawQ = Number(item.q);
  if (Number.isNaN(rawQ) || !Number.isFinite(rawQ) || rawQ < 1) return null;
  const q = Math.min(99, Math.floor(rawQ));

  // Validate Price
  const rawP = Number(item.p);
  const p = !Number.isNaN(rawP) && Number.isFinite(rawP) && rawP >= 0 ? rawP : 0;

  // Validate Name
  const n = typeof item.n === 'string' && item.n.trim() ? item.n.trim() : `Saree #${id}`;

  return {
    ...item,
    id,
    q,
    p,
    n,
  };
}

/**
 * Validate and deduplicate a full cart list.
 */
function validateCartList(rawList) {
  if (!Array.isArray(rawList)) return [];

  const seenIds = new Set();
  const validList = [];

  for (const rawItem of rawList) {
    const item = sanitizeCartItem(rawItem);
    if (item && !seenIds.has(item.id)) {
      seenIds.add(item.id);
      validList.push(item);
    }
  }

  return validList;
}

/**
 * Validate and deduplicate wishlist IDs.
 */
function validateWishlist(rawList) {
  if (!Array.isArray(rawList)) return [];

  const seen = new Set();
  const validList = [];

  for (const id of rawList) {
    if (
      (typeof id === 'string' || typeof id === 'number') &&
      id !== '' &&
      !seen.has(id)
    ) {
      seen.add(id);
      validList.push(id);
    }
  }

  return validList;
}

/**
 * Safely read initial state from localStorage.
 */
function getInitialCart() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const saved = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!saved) return [];
    return validateCartList(JSON.parse(saved));
  } catch {
    return [];
  }
}

function getInitialWishlist() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const saved = window.localStorage.getItem(WISH_STORAGE_KEY);
    if (!saved) return [];
    return validateWishlist(JSON.parse(saved));
  } catch {
    return [];
  }
}

export function ShopProvider({ children }) {
  // Synchronous initial state hydration from localStorage avoids empty state overwrite
  const [cart, setCart] = useState(getInitialCart);
  const [wish, setWish] = useState(getInitialWishlist);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Synchronize cart changes to localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      }
    } catch {
      // Gracefully ignore quota errors or disabled cookies
    }
  }, [cart]);

  // Synchronize wishlist changes to localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(WISH_STORAGE_KEY, JSON.stringify(wish));
      }
    } catch {
      // Gracefully ignore quota errors or disabled cookies
    }
  }, [wish]);

  // Multi-tab synchronization
  useEffect(() => {
    const handleStorageEvent = (e) => {
      try {
        if (e.key === CART_STORAGE_KEY) {
          const updated = e.newValue ? validateCartList(JSON.parse(e.newValue)) : [];
          setCart(updated);
        } else if (e.key === WISH_STORAGE_KEY) {
          const updated = e.newValue ? validateWishlist(JSON.parse(e.newValue)) : [];
          setWish(updated);
        }
      } catch {
        // Ignore JSON parse errors in external storage events
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addToCart = useCallback((product) => {
    if (!product || typeof product !== 'object') return;
    const id = product.id;
    if (id === undefined || id === null || id === '') return;

    setCart((prev) => {
      const existsIndex = prev.findIndex((item) => item.id === id);
      if (existsIndex > -1) {
        return prev.map((item, idx) =>
          idx === existsIndex
            ? { ...item, q: Math.min(99, Math.floor(item.q) + 1) }
            : item
        );
      }

      const validatedNewItem = sanitizeCartItem({ ...product, q: 1 });
      if (!validatedNewItem) return prev;
      return [...prev, validatedNewItem];
    });

    setIsCartOpen(true);
  }, []);

  const setQty = useCallback((id, q) => {
    if (id === undefined || id === null || id === '') return;

    const numQ = Number(q);
    if (Number.isNaN(numQ) || !Number.isFinite(numQ)) return;

    const parsedQ = Math.floor(numQ);

    setCart((prev) => {
      if (parsedQ < 1) {
        return prev.filter((item) => item.id !== id);
      }
      return prev.map((item) =>
        item.id === id ? { ...item, q: Math.min(99, parsedQ) } : item
      );
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    if (id === undefined || id === null || id === '') return;
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toggleWishlist = useCallback((id) => {
    if (id === undefined || id === null || id === '') return;
    setWish((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const value = useMemo(
    () => ({
      cart,
      wish,
      isCartOpen,
      openCart,
      closeCart,
      addToCart,
      setQty,
      removeFromCart,
      toggleWishlist,
    }),
    [
      cart,
      wish,
      isCartOpen,
      openCart,
      closeCart,
      addToCart,
      setQty,
      removeFromCart,
      toggleWishlist,
    ]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
