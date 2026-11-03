import { useState, useEffect } from 'react';

/**
 * Tracks window scroll position and threshold
 * @param {number} threshold
 * @returns {{ scrollY: number, isScrolled: boolean }}
 */
export function useScrollPosition(threshold = 20) {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrollY(y);
      setIsScrolled(y > threshold);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return { scrollY, isScrolled };
}

