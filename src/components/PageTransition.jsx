import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const luxuryEase = [0.72, 0, 0.18, 1];

export default function PageTransition({ activeKey, children }) {
  const shouldReduceMotion = useReducedMotion();

  const [displayChildren, setDisplayChildren] = useState(children);
  const [renderedRouteKey, setRenderedRouteKey] = useState(activeKey);
  const [curtainPhase, setCurtainPhase] = useState('idle'); // 'idle' | 'enter' | 'leave'

  const currentKeyRef = useRef(activeKey);
  const latestChildrenRef = useRef(children);
  const isScrollLockedRef = useRef(false);
  const originalOverflowRef = useRef('');

  const enterTimerRef = useRef(null);
  const endTimerRef = useRef(null);
  const rafRef = useRef(null);

  // Keep latest children in ref to avoid stale closures during rapid transitions
  useEffect(() => {
    latestChildrenRef.current = children;
    if (curtainPhase === 'idle') {
      setDisplayChildren(children);
    }
  }, [children, curtainPhase]);

  // Idempotent scroll lock helper
  const lockScroll = useCallback(() => {
    if (!isScrollLockedRef.current) {
      isScrollLockedRef.current = true;
      originalOverflowRef.current = document.body.style.overflow || '';
      document.body.style.overflow = 'hidden';
    }
  }, []);

  // Idempotent scroll unlock helper
  const unlockScroll = useCallback(() => {
    if (isScrollLockedRef.current) {
      isScrollLockedRef.current = false;
      document.body.style.overflow = originalOverflowRef.current;
    }
  }, []);

  // Browser-compatible anchor and default route scroll positioning
  const applyScrollPosition = useCallback(() => {
    const hash = window.location.hash;
    // Check if hash targets an in-page section ID (e.g. #new, #best, #story, #explore, #kala-edit)
    if (hash && hash.length > 1 && !hash.includes('/')) {
      try {
        const targetEl = document.querySelector(hash);
        if (targetEl) {
          // Pre-reveal target element so it lands fully rendered without blur/opacity glitch
          targetEl.classList.add('scroll-visible');
          const navbar = document.querySelector('header, nav');
          const navbarHeight = navbar ? navbar.offsetHeight : 80;
          const elementTop = targetEl.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: Math.max(0, elementTop - navbarHeight - 16),
            left: 0,
            behavior: 'auto',
          });
          return;
        }
      } catch {
        // Fallback if selector is not valid
      }
    }
    // Default: Reset scroll to top
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  // Clean up all pending timers and animation frames
  const clearTimers = useCallback(() => {
    if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
    if (endTimerRef.current) clearTimeout(endTimerRef.current);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Check if the route key actually changed
    if (activeKey !== currentKeyRef.current) {
      currentKeyRef.current = activeKey;
      clearTimers();

      // Reduced-motion path: Instant content swap with accurate scroll position
      if (shouldReduceMotion) {
        setDisplayChildren(latestChildrenRef.current);
        setRenderedRouteKey(activeKey);
        rafRef.current = requestAnimationFrame(applyScrollPosition);
        return;
      }

      // Phase 1: Lock scroll and sweep the royal curtain up from bottom to center (100% -> 0%)
      lockScroll();
      setCurtainPhase('enter');

      // Phase 2: At apex (420ms), the screen is 100% masked. Mount new page and position scroll.
      enterTimerRef.current = setTimeout(() => {
        setDisplayChildren(latestChildrenRef.current);
        setRenderedRouteKey(activeKey);

        // Schedule scroll positioning in next paint frame so DOM nodes are committed
        rafRef.current = requestAnimationFrame(() => {
          applyScrollPosition();
        });

        // Lift curtain upward to reveal new page (0% -> -100%)
        setCurtainPhase('leave');
      }, 420);

      // Phase 3: Transition completes (860ms) - restore scroll and reset curtain off-screen
      endTimerRef.current = setTimeout(() => {
        setCurtainPhase('idle');
        unlockScroll();

        // Secondary verification after scroll is unlocked for pixel-perfect hash alignment
        if (window.location.hash && window.location.hash.length > 1) {
          rafRef.current = requestAnimationFrame(applyScrollPosition);
        }
      }, 860);

      return () => {
        clearTimers();
        unlockScroll();
      };
    }
  }, [activeKey, shouldReduceMotion, lockScroll, unlockScroll, applyScrollPosition, clearTimers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
      unlockScroll();
    };
  }, [clearTimers, unlockScroll]);

  // Reduced-Motion View: Clean and immediate
  if (shouldReduceMotion) {
    return (
      <div className="relative w-full">
        {displayChildren}
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden">
      {/* 
        ROYAL SILK CURTAIN OVERLAY:
        Single continuous GPU-accelerated layer that sweeps vertically across viewport:
        - 'enter': y: 100% -> 0% (masks the departing page smoothly)
        - 'leave': y: 0% -> -100% (glides upward to reveal the new page)
        - 'idle': parked off-screen (y: 100%) with pointer-events-none
      */}
      <motion.div
        aria-hidden="true"
        className={`fixed inset-0 z-[9990] select-none flex flex-col items-center justify-center bg-gradient-to-b from-[#180205] via-[#2F060D] to-[#1A0307] border-t-2 border-[#D4AF37]/90 shadow-[0_-25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(212,175,55,0.4)] ${
          curtainPhase === 'idle' ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'
        }`}
        initial={{ y: '100%' }}
        animate={
          curtainPhase === 'enter'
            ? { y: '0%' }
            : curtainPhase === 'leave'
            ? { y: '-100%' }
            : { y: '100%' }
        }
        transition={
          curtainPhase === 'idle'
            ? { duration: 0 }
            : {
                duration: curtainPhase === 'enter' ? 0.42 : 0.44,
                ease: luxuryEase,
              }
        }
      >
        {/* Shimmering Gold Leading Edge Line */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#F5D982] to-transparent shadow-[0_0_20px_rgba(245,217,130,0.9)]" />

        {/* Silk Velvet Vertical Pleat Texture */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.02) 0px,
              rgba(255, 255, 255, 0.02) 30px,
              rgba(0, 0, 0, 0.25) 30px,
              rgba(0, 0, 0, 0.25) 60px,
              transparent 60px,
              transparent 90px
            )`,
          }}
        />

        {/* Ambient Warm Boutique Spotlighting */}
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-600/20 via-transparent to-black/70 pointer-events-none" />

        {/* Royal Crest Monogram & Brand Presentation */}
        <div className="flex flex-col items-center gap-2 select-none opacity-95 relative z-10">
          <div className="relative">
            {/* Medallion */}
            <span className="w-16 h-16 rounded-full border-2 border-gold/80 flex items-center justify-center font-primary text-3xl text-[#F5D982] shadow-[0_0_30px_rgba(212,175,55,0.5),inset_0_0_15px_rgba(212,175,55,0.3)] bg-[#28050B]/75 backdrop-blur-sm">
              V
            </span>
            {/* Outer orbital ring */}
            <div className="absolute -inset-2 rounded-full border border-gold/35 shadow-[0_0_15px_rgba(212,175,55,0.2)] pointer-events-none" />
          </div>

          <span className="font-primary text-lg tracking-[0.3em] uppercase text-[#F8EFDD] font-light mt-2 drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]">
            Vaagai
          </span>

          <span className="font-primary text-[10px] tracking-[0.45em] uppercase text-gold font-medium">
            Royal Silk Heritage
          </span>

          <div className="w-32 h-px bg-gradient-to-r from-transparent via-gold/80 to-transparent mt-1" />
        </div>
      </motion.div>

      {/* 
        PAGE CONTENT CONTAINER:
        Visually stable behind the curtain, gentle opacity reveal to eliminate jarring layout shifts.
      */}
      <motion.div
        key={renderedRouteKey}
        initial={{ opacity: 0.96 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full relative"
      >
        {displayChildren}
      </motion.div>
    </div>
  );
}
