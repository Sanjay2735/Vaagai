import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const luxuryEase = [0.72, 0, 0.18, 1];

export default function LaunchCurtain() {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isMounted, setIsMounted] = useState(true);
  const [isSkipped, setIsSkipped] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const originalOverflowRef = useRef('');
  const revealTimerRef = useRef(null);
  const safetyTimerRef = useRef(null);
  const hasSkippedRef = useRef(false);
  const isScrollUnlockedRef = useRef(false);

  // Restore body overflow safely and idempotently
  const unlockScroll = useCallback(() => {
    if (!isScrollUnlockedRef.current) {
      isScrollUnlockedRef.current = true;
      document.body.style.overflow = originalOverflowRef.current;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('vaagai:curtain-unlocked'));
      }
    }
  }, []);

  // Handle Skip: opens curtains rapidly or fades out, restores scrolling, and unmounts
  const handleSkip = useCallback(() => {
    if (hasSkippedRef.current) return;
    hasSkippedRef.current = true;
    setIsSkipped(true);

    // Cancel auto reveal & safety timers
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);

    // Unlock scroll immediately so user can interact without any delay
    unlockScroll();
    setIsRevealed(true);

    // Fallback unmount in case animation complete event does not fire (e.g. background tab)
    safetyTimerRef.current = setTimeout(() => {
      setIsMounted(false);
    }, shouldReduceMotion ? 200 : 450);
  }, [shouldReduceMotion, unlockScroll]);

  // Initial animation sequence & scroll lock
  useEffect(() => {
    // Record original body overflow and lock scroll
    originalOverflowRef.current = document.body.style.overflow || '';
    document.body.style.overflow = 'hidden';
    isScrollUnlockedRef.current = false;

    // 1. Reveal timing: Brand monogram presentation, then royal curtains part
    const revealDelay = shouldReduceMotion ? 250 : 750;
    revealTimerRef.current = setTimeout(() => {
      setIsRevealed(true);
      unlockScroll();
    }, revealDelay);

    // 2. Safety cleanup timer: ensures unmount and scroll unlock even in backgrounded tabs
    const safetyDelay = shouldReduceMotion ? 800 : 2500;
    safetyTimerRef.current = setTimeout(() => {
      setIsMounted(false);
      unlockScroll();
    }, safetyDelay);

    return () => {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
      document.body.style.overflow = originalOverflowRef.current;
    };
  }, [shouldReduceMotion, unlockScroll]);

  // Keyboard accessibility: Escape, Space, or Enter skips the intro
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSkip]);

  if (!isMounted) return null;

  // Reduced-Motion Experience: Gentle opacity fade without sliding, scaling, or pulsing
  if (shouldReduceMotion) {
    return (
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Vaagai launch introduction"
        className="fixed inset-0 z-[10000] bg-[#120204] flex items-center justify-center select-none"
        initial={{ opacity: 1 }}
        animate={{ opacity: isRevealed ? 0 : 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onAnimationComplete={() => {
          if (isRevealed) {
            setIsMounted(false);
            unlockScroll();
          }
        }}
      >
        <button
          type="button"
          onClick={handleSkip}
          aria-label="Skip launch introduction"
          className="absolute top-4 sm:top-6 right-4 sm:right-6 z-30 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[#D4AF37] text-xs uppercase tracking-widest font-medium bg-[#240409]/80 backdrop-blur-md border border-[#D4AF37]/40 hover:border-[#D4AF37] hover:text-[#FFF4D4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] min-h-[38px] flex items-center justify-center cursor-pointer"
        >
          Skip Intro ✕
        </button>

        <div className="flex flex-col items-center gap-2.5 sm:gap-3 text-center px-4">
          <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#D4AF37] flex items-center justify-center font-primary text-3xl sm:text-4xl text-[#F5D982] bg-[#240409] shadow-[0_0_25px_rgba(212,175,55,0.4)]">
            V
          </span>
          <h1 className="font-primary text-2xl sm:text-3xl tracking-[0.28em] uppercase text-[#F8EFDD] font-light mt-1">
            Vaagai
          </h1>
          <p className="font-primary text-[10px] sm:text-[11px] tracking-[0.42em] uppercase text-[#D4AF37] font-medium">
            Royal Silk Heritage
          </p>
          <div className="flex items-center gap-3 mt-1 opacity-80" aria-hidden="true">
            <div className="w-10 sm:w-14 h-px bg-gradient-to-r from-transparent to-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs">✦</span>
            <div className="w-10 sm:w-14 h-px bg-gradient-to-l from-transparent to-[#D4AF37]" />
          </div>
        </div>
      </motion.div>
    );
  }

  // Full Cinematic Luxury Curtain Experience
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Vaagai launch introduction"
      className={`fixed inset-0 z-[10000] overflow-hidden select-none ${
        isRevealed ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
      onClick={(e) => {
        // Clicking curtain panels or background skips into the site immediately
        if (e.target === e.currentTarget || e.target.closest('.curtain-panel')) {
          handleSkip();
        }
      }}
    >
      {/* Accessible "Skip Intro" Button */}
      <button
        type="button"
        onClick={handleSkip}
        aria-label="Skip launch introduction"
        className={`absolute top-4 sm:top-6 right-4 sm:right-6 z-30 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[#D4AF37] text-xs uppercase tracking-widest font-medium bg-[#240409]/80 backdrop-blur-md border border-[#D4AF37]/40 hover:border-[#D4AF37] hover:text-[#FFF4D4] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#120204] min-h-[38px] flex items-center justify-center cursor-pointer ${
          isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
        }`}
      >
        Skip Intro ✕
      </button>

      {/* 
        LEFT CURTAIN PANEL:
        w-[calc(50%+1.5px)] guarantees zero subpixel hairline gap in the center seam.
        Slides smoothly to the left (-100%)
      */}
      <motion.div
        className="curtain-panel absolute top-0 left-0 w-[calc(50%+1.5px)] h-full bg-gradient-to-r from-[#120204] via-[#240409] to-[#3A0710] shadow-[15px_0_45px_rgba(0,0,0,0.9),2px_0_20px_rgba(212,175,55,0.45)] cursor-pointer will-change-transform"
        initial={{ x: '0%' }}
        animate={{ x: isRevealed ? '-100%' : '0%' }}
        transition={{
          duration: isSkipped ? 0.35 : 0.9,
          ease: luxuryEase,
        }}
        onAnimationComplete={() => {
          if (isRevealed) {
            setIsMounted(false);
            unlockScroll();
          }
        }}
      >
        {/* Silk velvet fabric vertical pleats */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.02) 0px,
              rgba(255, 255, 255, 0.02) 25px,
              rgba(0, 0, 0, 0.25) 25px,
              rgba(0, 0, 0, 0.25) 50px,
              transparent 50px,
              transparent 75px,
              rgba(212, 175, 55, 0.02) 75px,
              rgba(212, 175, 55, 0.02) 100px
            )`,
          }}
        />

        {/* Ambient velvet sheen & boutique lighting */}
        <div className="absolute inset-0 opacity-35 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-600/25 via-transparent to-black/60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/55 pointer-events-none" />

        {/* Shimmering Gold Leading Edge Seam */}
        <div className="absolute top-0 right-0 bottom-0 w-[3px] bg-gradient-to-b from-[#F5D982] via-[#D4AF37] to-[#F5D982] shadow-[0_0_15px_rgba(212,175,55,0.7),2px_0_10px_rgba(0,0,0,0.8)]" />
        <div className="absolute top-0 right-[3px] bottom-0 w-[1px] bg-[#D4AF37]/40 pointer-events-none" />
      </motion.div>

      {/* 
        RIGHT CURTAIN PANEL:
        w-[calc(50%+1.5px)] guarantees zero subpixel hairline gap in the center seam.
        Slides smoothly to the right (+100%)
      */}
      <motion.div
        className="curtain-panel absolute top-0 right-0 w-[calc(50%+1.5px)] h-full bg-gradient-to-l from-[#120204] via-[#240409] to-[#3A0710] shadow-[-15px_0_45px_rgba(0,0,0,0.9),-2px_0_20px_rgba(212,175,55,0.45)] cursor-pointer will-change-transform"
        initial={{ x: '0%' }}
        animate={{ x: isRevealed ? '100%' : '0%' }}
        transition={{
          duration: isSkipped ? 0.35 : 0.9,
          ease: luxuryEase,
        }}
      >
        {/* Silk velvet fabric vertical pleats */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.02) 0px,
              rgba(255, 255, 255, 0.02) 25px,
              rgba(0, 0, 0, 0.25) 25px,
              rgba(0, 0, 0, 0.25) 50px,
              transparent 50px,
              transparent 75px,
              rgba(212, 175, 55, 0.02) 75px,
              rgba(212, 175, 55, 0.02) 100px
            )`,
          }}
        />

        {/* Ambient velvet sheen & boutique lighting */}
        <div className="absolute inset-0 opacity-35 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-amber-600/25 via-transparent to-black/60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/55 pointer-events-none" />

        {/* Shimmering Gold Leading Edge Seam */}
        <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-gradient-to-b from-[#F5D982] via-[#D4AF37] to-[#F5D982] shadow-[0_0_15px_rgba(212,175,55,0.7),-2px_0_10px_rgba(0,0,0,0.8)]" />
        <div className="absolute top-0 left-[3px] bottom-0 w-[1px] bg-[#D4AF37]/40 pointer-events-none" />
      </motion.div>

      {/* 
        CENTER EMBLEM & ROYAL MONOGRAM:
        Centered with absolute precision, fades out gracefully as curtains part
      */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center z-20 px-4 pointer-events-none select-none"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: isRevealed ? 0 : 1,
          scale: isRevealed ? 0.95 : 1,
          y: isRevealed ? -8 : 0,
        }}
        transition={{
          duration: isSkipped ? 0.25 : 0.45,
          ease: 'easeInOut',
        }}
      >
        <div className="flex flex-col items-center gap-2.5 sm:gap-3 text-center">
          {/* Glowing Monogram Ring */}
          <div className="relative">
            {/* Medallion */}
            <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 rounded-full border-2 border-[#D4AF37] flex items-center justify-center font-primary text-3xl xs:text-4xl sm:text-5xl text-[#F5D982] shadow-[0_0_35px_rgba(212,175,55,0.55),inset_0_0_25px_rgba(212,175,55,0.3)] bg-[#240409]/90 backdrop-blur-md">
              V
            </div>
            {/* Outer subtle orbital ring */}
            <div className="absolute -inset-2 sm:-inset-2.5 rounded-full border border-[#D4AF37]/35 shadow-[0_0_18px_rgba(212,175,55,0.25)] pointer-events-none" />
          </div>

          {/* Brand Name */}
          <h1 className="font-primary text-2xl sm:text-3xl lg:text-4xl tracking-[0.28em] uppercase text-[#F8EFDD] font-light mt-2 drop-shadow-[0_4px_25px_rgba(0,0,0,0.95)]">
            Vaagai
          </h1>

          {/* Subtitle */}
          <p className="font-primary text-[9px] sm:text-[11px] tracking-[0.45em] uppercase text-[#D4AF37] font-medium drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            Royal Silk Heritage
          </p>

          {/* Regal filigree divider */}
          <div className="flex items-center gap-3 mt-1 opacity-85" aria-hidden="true">
            <div className="w-10 sm:w-16 h-px bg-gradient-to-r from-transparent to-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs">✦</span>
            <div className="w-10 sm:w-16 h-px bg-gradient-to-l from-transparent to-[#D4AF37]" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

