import React, { useRef, useEffect, useState } from 'react';

export function Reveal({
  children,
  dir = '',
  delay = 0,
  className = '',
  ...props
}) {
  const elementRef = useRef(null);

  // Check prefers-reduced-motion and IntersectionObserver support
  const checkInitialVisibility = () => {
    if (typeof window === 'undefined') return true;
    if (!('IntersectionObserver' in window)) return true;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    return mediaQuery.matches;
  };

  const [isVisible, setIsVisible] = useState(checkInitialVisibility);

  useEffect(() => {
    if (isVisible) return;

    const el = elementRef.current;
    if (!el) return;

    // Check prefers-reduced-motion dynamically
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    // Prevent duplicate animation: if element or parent container is already revealed
    const isParentVisible = Boolean(
      el.closest?.('.scroll-visible, .hero-section, #hero, .section-regal-head') ||
      el.classList.contains('scroll-visible')
    );
    if (isParentVisible) {
      setIsVisible(true);
      return;
    }

    // If already in viewport on mount (e.g. above-the-fold or mid-page reload)
    const rect = el.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < viewportHeight && rect.bottom > 0) {
      setIsVisible(true);
      return;
    }

    let observer = null;
    let fallbackTimer = null;

    try {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        {
          threshold: 0.15,
          rootMargin: '0px 0px -20px 0px',
        }
      );
      observer.observe(el);
    } catch {
      // Fallback if IntersectionObserver instantiation fails
      setIsVisible(true);
    }

    // Safety fallback: Never leave content permanently hidden if observer fails to trigger
    fallbackTimer = setTimeout(() => {
      setIsVisible(true);
    }, 1800);

    const handleReducedMotionChange = (e) => {
      if (e.matches) {
        setIsVisible(true);
      }
    };

    mediaQuery.addEventListener?.('change', handleReducedMotionChange);

    return () => {
      if (fallbackTimer) clearTimeout(fallbackTimer);
      if (observer) observer.disconnect();
      mediaQuery.removeEventListener?.('change', handleReducedMotionChange);
    };
  }, [isVisible]);

  // Directional classes matching animations.css:
  // - 'l': rv-l (from left)
  // - 'r': rv-r (from right)
  // - '': standard rv (from bottom)
  const dirClass = dir === 'l' ? 'rv-l' : dir === 'r' ? 'rv-r' : '';

  // Safe transition delay clamped between 0ms and 2000ms
  const safeDelay = Math.max(0, Math.min(delay, 2000));

  // Reduced motion override ensures content is never invisible
  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  const animationStyle = isReducedMotion
    ? { transition: 'none', transform: 'none', opacity: 1 }
    : { transitionDelay: `${safeDelay}ms` };

  return (
    <div
      ref={elementRef}
      className={`rv ${dirClass} ${isVisible ? 'in' : ''} ${className}`.trim()}
      style={{
        ...animationStyle,
        ...props.style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
