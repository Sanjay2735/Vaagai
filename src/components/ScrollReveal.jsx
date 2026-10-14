import { useEffect } from 'react';

const SECTION_SELECTORS =
  'main section, footer, .section-seam, .fade-section, .section-bloom, .section-split-wing, .section-floating-seals, .section-curtain-wave, .section-regal-head, .section-reveal, #hero, #new, #explore, #trust, #best, #story, #all-sarees, #kala-edit';

export default function ScrollReveal() {
  useEffect(() => {
    // Check prefers-reduced-motion accessibility setting
    const isReducedMotion = () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    // Helper to reveal an element permanently and detach observer
    const revealElement = (el, obs) => {
      if (!el) return;
      el.classList.add('scroll-visible');

      // Harmonize with Reveal (.rv) items to prevent duplicate or stuck hidden animations
      if (el.classList.contains('rv')) {
        el.classList.add('in');
      }
      el.querySelectorAll?.('.rv:not(.in)').forEach((child) => {
        child.classList.add('in');
      });

      if (obs) {
        obs.unobserve(el);
      }
    };

    // If reduced motion is active or IntersectionObserver is unsupported, reveal all immediately
    if (
      isReducedMotion() ||
      typeof window === 'undefined' ||
      !('IntersectionObserver' in window)
    ) {
      document.querySelectorAll(SECTION_SELECTORS).forEach((el) => {
        revealElement(el, null);
      });
      return;
    }

    let observer = null;
    let mutationObserver = null;
    let debounceTimer = null;
    let safetyTimer = null;

    // Primary IntersectionObserver instance with error boundary
    try {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              revealElement(entry.target, observer);
            }
          });
        },
        {
          threshold: 0.02,
          rootMargin: '0px 0px 60px 0px',
        }
      );
    } catch {
      // If observer setup fails, ensure content is completely visible
      document.querySelectorAll(SECTION_SELECTORS).forEach((el) => {
        revealElement(el, null);
      });
      return;
    }

    // Scan the DOM and observe unrevealed sections
    const scanAndObserve = () => {
      const sections = document.querySelectorAll(SECTION_SELECTORS);
      if (!sections.length) return;

      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;
      const currentHash = window.location.hash;

      sections.forEach((section) => {
        // If already revealed, do not re-process
        if (section.classList.contains('scroll-visible')) return;

        // Top banners remain visible immediately upon mount
        const isTopBanner =
          section.id === 'hero' ||
          section.classList.contains('hero-section') ||
          section.classList.contains('section-regal-head');

        // Check if section matches active in-page hash target
        const isHashTarget = Boolean(
          currentHash &&
            currentHash.length > 1 &&
            !currentHash.includes('/') &&
            section.matches?.(currentHash)
        );

        // Check if already in viewport (e.g. above-the-fold or mid-page reload)
        const rect = section.getBoundingClientRect();
        const isInViewport =
          rect.top < viewportHeight * 0.95 && rect.bottom > 0;

        if (isTopBanner || isHashTarget || isInViewport) {
          revealElement(section, observer);
        } else {
          observer.observe(section);
        }
      });
    };

    // Initial scan
    scanAndObserve();

    // Secondary scan to capture elements rendered shortly after route mount
    const initialTimer = setTimeout(scanAndObserve, 80);

    // Safety fallback timer: guarantees content is revealed even on slow devices or observer stalling
    safetyTimer = setTimeout(() => {
      document.querySelectorAll(SECTION_SELECTORS).forEach((el) => {
        if (!el.classList.contains('scroll-visible')) {
          revealElement(el, observer);
        }
      });
    }, 2200);

    // Debounced scan function for dynamic updates
    const debouncedScan = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(scanAndObserve, 40);
    };

    // Watch for DOM tree mutations (e.g. route transitions mounting new page components)
    if ('MutationObserver' in window) {
      const targetNode = document.querySelector('main') || document.body;
      if (targetNode) {
        mutationObserver = new MutationObserver(debouncedScan);
        mutationObserver.observe(targetNode, {
          childList: true,
          subtree: true,
        });
      }
    }

    // Listen for in-page hash changes and browser history navigation
    window.addEventListener('hashchange', debouncedScan);
    window.addEventListener('popstate', debouncedScan);

    // Cleanup on unmount
    return () => {
      if (initialTimer) clearTimeout(initialTimer);
      if (safetyTimer) clearTimeout(safetyTimer);
      if (debounceTimer) clearTimeout(debounceTimer);
      if (observer) observer.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
      window.removeEventListener('hashchange', debouncedScan);
      window.removeEventListener('popstate', debouncedScan);
    };
  }, []);

  return null;
}
