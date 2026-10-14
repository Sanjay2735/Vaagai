import React, { useRef, useEffect } from 'react';

export function Parallax({ children, speed = 0.04, className = '', style, ...props }) {
  const containerRef = useRef(null);
  const baseTransformRef = useRef('');

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Preserve any existing inline transform from props.style
    baseTransformRef.current = style?.transform || '';

    // Check prefers-reduced-motion media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      el.style.transform = baseTransformRef.current || '';
      return;
    }

    let rafId = null;
    let isVisible = true;
    let isTicking = false;

    // Subtly calm parallax on touch devices to ensure natural, jitter-free scrolling
    const isTouch =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const effectiveSpeed = isTouch ? Math.min(speed * 0.4, 0.015) : Math.min(speed, 0.04);

    const updateParallax = () => {
      isTicking = false;
      if (!el || !isVisible) return;

      const rect = el.getBoundingClientRect();
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;

      // Only compute when element is within viewport
      if (rect.bottom >= -50 && rect.top <= viewportHeight + 50) {
        const elementCenter = rect.top + rect.height / 2;
        const viewportCenter = viewportHeight / 2;
        const distanceFromCenter = elementCenter - viewportCenter;
        
        // Clamp movement to a subtle, restrained range (max ±15px) to keep scrolling stable
        const maxOffset = 15;
        const rawOffset = distanceFromCenter * effectiveSpeed;
        const offset = Math.max(-maxOffset, Math.min(maxOffset, rawOffset));

        // Compose hardware-accelerated 3D transform without excessive scale or distortion
        const base = baseTransformRef.current ? `${baseTransformRef.current} ` : '';
        el.style.transform = `${base}translate3d(0, ${offset.toFixed(1)}px, 0) scale(1.02)`;
      }
    };

    const requestUpdate = () => {
      if (!isTicking && isVisible) {
        isTicking = true;
        rafId = requestAnimationFrame(updateParallax);
      }
    };

    // IntersectionObserver to pause calculations when element is off-screen
    let observer = null;
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          isVisible = entry.isIntersecting;
          if (isVisible) {
            requestUpdate();
          }
        },
        { rootMargin: '120px 0px 120px 0px' }
      );
      observer.observe(el);
    }

    // Initial positioning
    requestUpdate();

    // Event listeners
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });

    const handleReducedMotionChange = (e) => {
      if (e.matches) {
        el.style.transform = baseTransformRef.current || '';
      } else {
        requestUpdate();
      }
    };

    mediaQuery.addEventListener?.('change', handleReducedMotionChange);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      mediaQuery.removeEventListener?.('change', handleReducedMotionChange);
      if (observer) observer.disconnect();
      if (el) el.style.transform = baseTransformRef.current || '';
    };
  }, [speed, style?.transform]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ willChange: 'transform', ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
