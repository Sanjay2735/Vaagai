import { useEffect, useRef } from 'react';

/**
 * Locks document body scroll when active condition is true
 * @param {boolean} isLocked
 */
export function useBodyScrollLock(isLocked) {
  const originalStyle = useRef('');

  useEffect(() => {
    if (isLocked) {
      originalStyle.current = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalStyle.current;
    }

    return () => {
      document.body.style.overflow = originalStyle.current;
    };
  }, [isLocked]);
}

